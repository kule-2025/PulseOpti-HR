import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { userBehaviorAnomalies, securityEvents } from "@/storage/database/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";

// 验证JWT
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }
  try {
    const payload = await verifyJWT(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET /api/security/scores/analyze - 分析安全评分
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const userId = searchParams.get("userId");
    const entityType = searchParams.get("entityType") || "company";

    if (!companyId && payload.userType !== "super_admin") {
      return NextResponse.json({ error: "缺少企业ID" }, { status: 400 });
    }

    const targetCompanyId = companyId || payload.companyId;
    const db = await getDb();

    // 获取最近的安全事件
    const recentEvents = await db
      .select()
      .from(securityEvents)
      .where(and(eq(securityEvents.companyId, targetCompanyId)))
      .orderBy(desc(securityEvents.createdAt))
      .limit(50);

    // 获取最近的异常行为
    const recentAnomalies = await db
      .select()
      .from(userBehaviorAnomalies)
      .where(
        and(
          eq(userBehaviorAnomalies.companyId, targetCompanyId),
          userId ? eq(userBehaviorAnomalies.userId, userId) : undefined
        )
      )
      .orderBy(desc(userBehaviorAnomalies.detectedAt))
      .limit(50);

    // 计算安全评分
    const scoreDetails = {
      eventScore: calculateEventScore(recentEvents),
      anomalyScore: calculateAnomalyScore(recentAnomalies),
      trendScore: 0, // 趋势评分（需要历史数据）
    };

    const totalScore = Math.round(
      (scoreDetails.eventScore * 0.5 + scoreDetails.anomalyScore * 0.3 + scoreDetails.trendScore * 0.2)
    );

    const riskFactors = identifyRiskFactors(recentEvents, recentAnomalies);
    const recommendations = generateRecommendations(riskFactors, totalScore);

    return NextResponse.json({
      success: true,
      data: {
        companyId: targetCompanyId,
        userId,
        entityType,
        totalScore,
        scoreDetails,
        riskFactors,
        recommendations,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("分析安全评分失败:", error);
    return NextResponse.json({ error: "分析安全评分失败" }, { status: 500 });
  }
}

// 辅助函数：计算事件评分
function calculateEventScore(events: any[]): number {
  if (events.length === 0) return 100;

  const severityWeights: Record<string, number> = {
    critical: -20,
    high: -10,
    medium: -5,
    low: -2,
  };

  let score = 100;
  events.forEach((event) => {
    const weight = severityWeights[event.severity] || 0;
    score += weight;
  });

  return Math.max(0, Math.min(100, score));
}

// 辅助函数：计算异常评分
function calculateAnomalyScore(anomalies: any[]): number {
  if (anomalies.length === 0) return 100;

  const severityWeights: Record<string, number> = {
    high: -15,
    medium: -8,
    low: -3,
  };

  let score = 100;
  anomalies.forEach((anomaly) => {
    const weight = severityWeights[anomaly.severity] || 0;
    score += weight;
  });

  return Math.max(0, Math.min(100, score));
}

// 辅助函数：识别风险因素
function identifyRiskFactors(events: any[], anomalies: any[]): any[] {
  const factors: any[] = [];

  // 检查登录失败
  const loginFailures = events.filter(e => e.eventType === "login_failed");
  if (loginFailures.length > 5) {
    factors.push({
      type: "频繁登录失败",
      severity: loginFailures.length > 10 ? "high" : "medium",
      count: loginFailures.length,
    });
  }

  // 检查高危事件
  const criticalEvents = events.filter(e => e.severity === "critical");
  if (criticalEvents.length > 0) {
    factors.push({
      type: "存在高危安全事件",
      severity: "critical",
      count: criticalEvents.length,
    });
  }

  // 检查未审核的异常行为
  const unreviewedAnomalies = anomalies.filter(a => !a.isReviewed);
  if (unreviewedAnomalies.length > 0) {
    factors.push({
      type: "存在未审核的异常行为",
      severity: "medium",
      count: unreviewedAnomalies.length,
    });
  }

  return factors;
}

// 辅助函数：生成建议
function generateRecommendations(riskFactors: any[], totalScore: number): string[] {
  const recommendations: string[] = [];

  if (totalScore < 60) {
    recommendations.push("建议立即进行全面的安全审计");
  }

  riskFactors.forEach((factor) => {
    switch (factor.type) {
      case "频繁登录失败":
        recommendations.push("建议启用多因素认证，加强账号安全策略");
        break;
      case "存在高危安全事件":
        recommendations.push("建议立即处理高危安全事件，调查潜在威胁");
        break;
      case "存在未审核的异常行为":
        recommendations.push(`建议审核${factor.count}个未处理的异常行为`);
        break;
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("系统安全状态良好，继续保持定期安全检查");
  }

  return recommendations;
}
