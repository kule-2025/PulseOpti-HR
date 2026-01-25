import { NextRequest, NextResponse } from 'next/server';
import { getDb, users, performanceRecords } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc, sql } from 'drizzle-orm';
import { generateRetentionRecommendations } from '@/lib/services/turnoverRetentionService';

// POST /api/ai/turnover-prediction - AI离职风险预测
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId } = body;

    const db = await getDb();

    // 获取员工信息
    const employee = await db
      .select()
      .from(users)
      .where(eq(users.id, employeeId))
      .limit(1);

    if (!employee || employee.length === 0) {
      return NextResponse.json({ error: '员工不存在' }, { status: 404 });
    }

    const empData = employee[0];

    // 获取员工最近的绩效数据
    const recentPerformance = await db
      .select()
      .from(performanceRecords)
      .where(eq(performanceRecords.employeeId, employeeId))
      .orderBy(desc(performanceRecords.createdAt))
      .limit(6);

    // AI分析离职风险
    const riskFactors = [];

    // 绩效下降分析
    if (recentPerformance.length >= 2) {
      const recent = recentPerformance[0];
      const previous = recentPerformance[1];
      if (recent && previous && recent.finalScore && previous.finalScore &&
          recent.finalScore < previous.finalScore - 10) {
        riskFactors.push({
          factor: '绩效下降',
          description: `最近绩效评分从${previous.finalScore}分下降到${recent.finalScore}分`,
          weight: 30,
        });
      }
    }

    // 入职时长分析
    const hireDate = new Date(empData.createdAt);
    const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (30 * 24 * 60 * 60 * 1000));

    if (tenureMonths > 12 && tenureMonths < 24) {
      riskFactors.push({
        factor: '入职一年左右',
        description: '入职1-2年是员工离职的高风险期',
        weight: 20,
      });
    }

    // 风险分数计算（模拟）
    let riskScore = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);

    // 添加随机波动
    riskScore = Math.min(100, Math.max(0, riskScore + Math.floor(Math.random() * 15)));

    // 风险等级
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore < 30) {
      riskLevel = 'low';
    } else if (riskScore < 60) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // 构建风险分析数据（用于生成挽留建议）
    const riskAnalysis = {
      dimensions: {
        performance: { score: 100 - riskScore, factors: riskFactors },
        compensation: { score: 70 + Math.floor(Math.random() * 30) },
        development: { score: 60 + Math.floor(Math.random() * 40) },
        environment: { score: 65 + Math.floor(Math.random() * 35) },
        workload: { score: 70 + Math.floor(Math.random() * 30) },
      },
      factors: riskFactors,
    };

    // 生成个性化挽留建议
    const retentionPlan = generateRetentionRecommendations(
      empData,
      riskAnalysis,
      { turnoverRate: 0.15, averageTenure: 2.5 }
    );

    const prediction = {
      employeeId,
      employeeName: empData.name,
      riskScore,
      riskLevel,
      riskFactors,
      retentionPlan: retentionPlan,
      predictionDate: new Date().toISOString(),
      modelVersion: '2.0.0',
    };

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error('Error predicting turnover:', error);
    return NextResponse.json(
      { error: '离职风险预测失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
