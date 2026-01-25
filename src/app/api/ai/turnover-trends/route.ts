/**
 * AI离职趋势分析API
 * 路径: /api/ai/turnover-trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { employees, resignations, departments, positions } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte, count, or } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI离职趋势分析系统
 * 分析历史离职数据，预测未来趋势
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const turnoverTrendsSchema = z.object({
  period: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
  months: z.number().min(3).max(36).default(12), // 分析最近N个月
  includePredictions: z.boolean().default(true), // 是否包含预测
});

/**
 * 计算月度离职率
 */
function calculateMonthlyTurnoverRate(
  totalEmployees: number,
  resignedEmployees: number
): number {
  if (totalEmployees === 0) return 0;
  return Math.round((resignedEmployees / totalEmployees) * 1000) / 10; // 保留一位小数
}

/**
 * AI趋势分析
 */
async function aiTrendAnalysis(
  historicalData: any[],
  companyInfo: any
) {
  try {
    const trendSummary = historicalData.map(d => 
      `${d.period}: ${d.turnoverRate}%离职率（${d.resignedCount}人离职）`
    ).join('\n');

    const userPrompt = `请分析以下离职率趋势：

【历史数据】
${trendSummary}

【公司信息】
当前员工总数：${companyInfo.totalEmployees}
平均入职时长：${companyInfo.avgTenure}个月
主要部门：${companyInfo.mainDepartments.join(', ')}

请提供：
1. 趋势分析（上升/下降/稳定）
2. 峰值和低谷分析
3. 可能的原因分析
4. 未来6个月的预测
5. 预防建议

返回JSON格式。`;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一名资深HR数据分析专家，擅长离职趋势分析和预测。请提供专业、深入的分析。',
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      temperature: 0.7,
    });

    // 尝试解析JSON
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
    } catch {
      return {
        trend: '无法判断',
        insights: ['数据不足，无法进行AI分析'],
        predictions: [],
        suggestions: ['积累更多历史数据后再分析'],
      };
    }
  } catch (error) {
    console.error('AI趋势分析失败:', error);
    return null;
  }
}

/**
 * 简单趋势预测（线性回归）
 */
function simpleTrendPrediction(data: number[]): number[] {
  if (data.length < 3) return [];

  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  // 计算回归系数
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 预测未来6个月
  const predictions = [];
  for (let i = n; i < n + 6; i++) {
    const predicted = slope * i + intercept;
    predictions.push(Math.max(0, Math.round(predicted * 10) / 10));
  }

  return predictions;
}

/**
 * GET /api/ai/turnover-trends
 * 获取离职趋势分析
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const validated = turnoverTrendsSchema.parse({
      period: searchParams.get('period') || 'monthly',
      months: parseInt(searchParams.get('months') || '12'),
      includePredictions: searchParams.get('includePredictions') !== 'false',
    });

    const db = await getDb();

    // 获取当前员工数
    const [employeeCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(and(
        eq(employees.companyId, user.companyId),
        eq(employees.employmentStatus, 'active')
      ));

    const totalEmployees = employeeCount.count;

    // 获取历史离职记录
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - validated.months);

    const resignationsData = await db
      .select({
        id: resignations.id,
        employeeId: resignations.employeeId,
        resignationType: resignations.resignationType,
        reasonCategory: resignations.reasonCategory,
        expectedLastDate: resignations.expectedLastDate,
        actualLastDate: resignations.actualLastDate,
        approvedAt: resignations.approvedAt,
        createdAt: resignations.createdAt,
      })
      .from(resignations)
      .where(and(
        eq(resignations.companyId, user.companyId),
        gte(resignations.approvedAt, startDate)
      ))
      .orderBy(desc(resignations.approvedAt));

    // 按月份/季度/年度分组
    const periodData = new Map<string, { resignedCount: number; period: string; date: Date }>();
    
    resignationsData.forEach((resignation) => {
      const date = new Date(resignation.approvedAt || resignation.createdAt);
      let periodKey: string;
      let periodDisplay: string;

      if (validated.period === 'monthly') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        periodDisplay = periodKey;
      } else if (validated.period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodKey = `${date.getFullYear()}-Q${quarter}`;
        periodDisplay = periodKey;
      } else {
        periodKey = `${date.getFullYear()}`;
        periodDisplay = `${date.getFullYear()}年`;
      }

      if (!periodData.has(periodKey)) {
        periodData.set(periodKey, {
          resignedCount: 0,
          period: periodDisplay,
          date,
        });
      }

      periodData.get(periodKey)!.resignedCount++;
    });

    // 按时间排序
    const sortedPeriods = Array.from(periodData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 计算离职率
    const historicalData = sortedPeriods.map(period => ({
      ...period,
      turnoverRate: calculateMonthlyTurnoverRate(totalEmployees, period.resignedCount),
    }));

    // 获取公司基本信息
    const [avgTenureResult] = await db
      .select({
        avgTenure: sql`AVG(EXTRACT(EPOCH FROM (NOW() - ${employees.hireDate})) / (30 * 24 * 60 * 60))`.mapWith(Number),
      })
      .from(employees)
      .where(and(
        eq(employees.companyId, user.companyId),
        eq(employees.employmentStatus, 'active')
      ));

    const mainDepartments = await db
      .select({
        name: departments.name,
        count: count(),
      })
      .from(departments)
      .innerJoin(employees, eq(employees.departmentId, departments.id))
      .where(and(
        eq(departments.companyId, user.companyId),
        eq(employees.employmentStatus, 'active')
      ))
      .groupBy(departments.name)
      .orderBy(desc(count()))
      .limit(5);

    const companyInfo = {
      totalEmployees,
      avgTenure: Math.round(avgTenureResult?.avgTenure || 0),
      mainDepartments: mainDepartments.map(d => d.name),
    };

    // AI趋势分析
    const aiAnalysis = await aiTrendAnalysis(historicalData, companyInfo);

    // 简单趋势预测
    const predictions = validated.includePredictions 
      ? simpleTrendPrediction(historicalData.map(d => d.turnoverRate))
      : [];

    // 计算趋势方向
    let trendDirection: 'up' | 'down' | 'stable';
    if (historicalData.length >= 2) {
      const recent = historicalData[historicalData.length - 1].turnoverRate;
      const previous = historicalData[historicalData.length - 2].turnoverRate;
      
      if (recent > previous * 1.1) {
        trendDirection = 'up';
      } else if (recent < previous * 0.9) {
        trendDirection = 'down';
      } else {
        trendDirection = 'stable';
      }
    } else {
      trendDirection = 'stable';
    }

    return NextResponse.json({
      success: true,
      data: {
        period: validated.period,
        monthsAnalyzed: validated.months,
        historicalData,
        summary: {
          totalResigned: resignationsData.length,
          avgTurnoverRate: historicalData.length > 0
            ? Math.round(
                historicalData.reduce((sum, d) => sum + d.turnoverRate, 0) / historicalData.length * 10
              ) / 10
            : 0,
          maxTurnoverRate: Math.max(...historicalData.map(d => d.turnoverRate)),
          minTurnoverRate: Math.min(...historicalData.map(d => d.turnoverRate)),
          trendDirection,
          recentTurnoverRate: historicalData.length > 0 
            ? historicalData[historicalData.length - 1].turnoverRate 
            : 0,
        },
        predictions: validated.includePredictions ? {
          next6Months: predictions,
          avgPredictedRate: predictions.length > 0
            ? Math.round(predictions.reduce((sum, p) => sum + p, 0) / predictions.length * 10) / 10
            : 0,
        } : null,
        aiAnalysis,
        companyInfo,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('获取离职趋势分析失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '获取离职趋势分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
