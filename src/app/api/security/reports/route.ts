import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { securityReports, securityEvents, userBehaviorAnomalies, securityScores } from "@/storage/database/shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
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

// 生成报告Schema
const generateReportSchema = z.object({
  reportType: z.enum(["daily", "weekly", "monthly", "quarterly", "custom"]),
  periodStart: z.string().min(1, "开始日期不能为空"),
  periodEnd: z.string().min(1, "结束日期不能为空"),
  metadata: z.record(z.any()).optional(),
});

// GET /api/security/reports - 获取安全报告列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const reportType = searchParams.get("reportType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    if (!companyId && payload.userType !== "super_admin") {
      return NextResponse.json({ error: "缺少企业ID" }, { status: 400 });
    }

    const targetCompanyId = companyId || payload.companyId;
    if (targetCompanyId && payload.companyId !== targetCompanyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权访问该企业的数据" }, { status: 403 });
    }

    const db = await getDb();
    const conditions = [eq(securityReports.companyId, targetCompanyId)];

    if (reportType) {
      conditions.push(eq(securityReports.reportType, reportType));
    }

    if (startDate) {
      conditions.push(gte(securityReports.periodStart, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(securityReports.periodEnd, new Date(endDate)));
    }

    const [reports, [{ count }]] = await Promise.all([
      db
        .select()
        .from(securityReports)
        .where(and(...conditions))
        .orderBy(desc(securityReports.generatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(securityReports)
        .where(and(...conditions)),
    ]);

    return NextResponse.json({
      data: reports,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    console.error("获取安全报告列表失败:", error);
    return NextResponse.json({ error: "获取安全报告列表失败" }, { status: 500 });
  }
}

// POST /api/security/reports - 生成安全报告
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = generateReportSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";
    const periodStart = new Date(validated.periodStart);
    const periodEnd = new Date(validated.periodEnd);

    // 获取期间内的安全事件
    const periodEvents = await db
      .select()
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.companyId, companyId),
          gte(securityEvents.createdAt, periodStart),
          lte(securityEvents.createdAt, periodEnd)
        )
      )
      .orderBy(desc(securityEvents.createdAt));

    // 获取期间内的异常行为
    const periodAnomalies = await db
      .select()
      .from(userBehaviorAnomalies)
      .where(
        and(
          eq(userBehaviorAnomalies.companyId, companyId),
          gte(userBehaviorAnomalies.detectedAt, periodStart),
          lte(userBehaviorAnomalies.detectedAt, periodEnd)
        )
      )
      .orderBy(desc(userBehaviorAnomalies.detectedAt));

    // 获取当前安全评分
    const currentScore = await db
      .select()
      .from(securityScores)
      .where(and(eq(securityScores.companyId, companyId), eq(securityScores.entityType, "company")))
      .limit(1);

    // 获取上一次评分（用于计算趋势）
    const previousScore = await db
      .select()
      .from(securityScores)
      .where(
        and(
          eq(securityScores.companyId, companyId),
          eq(securityScores.entityType, "company"),
          sql`${securityScores.lastUpdated} < ${periodStart}`
        )
      )
      .orderBy(desc(securityScores.lastUpdated))
      .limit(1);

    // 生成报告内容
    const summary = {
      totalEvents: periodEvents.length,
      totalAnomalies: periodAnomalies.length,
      criticalEvents: periodEvents.filter(e => e.severity === "critical").length,
      highRiskAnomalies: periodAnomalies.filter(a => a.severity === "high").length,
      unresolvedEvents: periodEvents.filter(e => !e.isResolved).length,
      unresolvedAnomalies: periodAnomalies.filter(a => !a.isReviewed).length,
    };

    const securityEventsStats = {
      bySeverity: {
        critical: periodEvents.filter(e => e.severity === "critical").length,
        high: periodEvents.filter(e => e.severity === "high").length,
        medium: periodEvents.filter(e => e.severity === "medium").length,
        low: periodEvents.filter(e => e.severity === "low").length,
      },
      byType: {} as Record<string, number>,
      top10: periodEvents.slice(0, 10),
    };

    // 按类型统计事件
    periodEvents.forEach((event) => {
      const type = event.eventType;
      if (!securityEventsStats.byType[type]) {
        securityEventsStats.byType[type] = 0;
      }
      securityEventsStats.byType[type]++;
    });

    const riskAnalysis = {
      scoreDetails: {
        eventScore: calculateEventScore(periodEvents),
        anomalyScore: calculateAnomalyScore(periodAnomalies),
        trendScore: 0,
      },
      riskFactors: identifyRiskFactors(periodEvents, periodAnomalies),
    };

    const recommendations = generateRecommendations(riskAnalysis.riskFactors, currentScore[0]?.totalScore || 100);

    const overallScore = currentScore[0]?.totalScore || 100;
    const scoreTrend = previousScore.length > 0
      ? overallScore - previousScore[0].totalScore
      : 0;

    // 创建安全报告
    const [report] = await db
      .insert(securityReports)
      .values({
        companyId,
        reportType: validated.reportType,
        periodStart,
        periodEnd,
        summary,
        securityEvents: securityEventsStats,
        riskAnalysis,
        recommendations,
        overallScore,
        scoreTrend,
        metadata: validated.metadata || {},
        generatedBy: payload.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "安全报告生成成功",
      data: report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("生成安全报告失败:", error);
    return NextResponse.json({ error: "生成安全报告失败" }, { status: 500 });
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
