import { NextRequest, NextResponse } from 'next/server';
import { EfficiencyManager, DecisionRecommendationManager } from '@/storage/database';
import { efficiencyMetrics } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';

/**
 * 生成决策建议
 * POST /api/efficiency/recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      metricCode,
      priority,
      requestedBy
    } = await request.json();

    if (!companyId || !metricCode) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取当前指标值
    const currentMetrics = await EfficiencyManager.calculateMetrics(companyId);
    const currentMetric = currentMetrics.find(m => m.code === metricCode);

    if (!currentMetric) {
      return NextResponse.json(
        { error: '指标不存在' },
        { status: 404 }
      );
    }

    // 获取指标信息
    const db = await getDb();
    const [metric] = await db
      .select()
      .from(efficiencyMetrics)
      .where(eq(efficiencyMetrics.code, metricCode));

    // 获取历史趋势数据
    const trendData = await EfficiencyManager.getTrendData(companyId, [metricCode], 12);
    const data0 = trendData[0] as any;
    const data1 = trendData[1] as any;
    const trend = trendData.length > 1 && data0 && data1 && data0[metricCode] > data1[metricCode] ? 'up' :
                   trendData.length > 1 && data0 && data1 && data0[metricCode] < data1[metricCode] ? 'down' : 'stable';

    // 获取活跃预警
    const activeAlerts = await EfficiencyManager.getActiveAlerts(companyId);
    const relatedAlerts = activeAlerts.filter(a => a.metricCode === metricCode);

    // 获取最近的归因分析
    const attributionHistory = await (await import('@/storage/database/attributionAnalysisManager')).AttributionAnalysisManager.getHistory(companyId, metricCode, 1);
    const latestAttribution = attributionHistory[0];

    // 获取最近的预测分析
    const predictionHistory = await (await import('@/storage/database/predictionAnalysisManager')).PredictionAnalysisManager.getHistory(companyId, metricCode, 1);
    const latestPrediction = predictionHistory[0];

    // 构建上下文
    const context = {
      metricName: currentMetric.name,
      metricDescription: metric?.description || '',
      currentValue: currentMetric.value,
      benchmark: currentMetric.benchmark,
      trend: trend as 'up' | 'down' | 'stable',
      alerts: relatedAlerts.length > 0 ? relatedAlerts : undefined,
      attributionAnalysis: latestAttribution?.analysis,
      predictionAnalysis: latestPrediction?.analysis,
    };

    // 调用AI生成决策建议
    const recommendationResult = await DecisionRecommendationManager.generateWithAI(
      metricCode,
      currentMetric.value,
      context
    );

    // 确定优先级
    const finalPriority = priority || (relatedAlerts.length > 0 ? 'high' : 'medium');

    // 创建建议记录
    const record = await DecisionRecommendationManager.createRecommendation(
      {
        companyId,
        type: metric?.category || 'general',
        priority: finalPriority,
        title: `${currentMetric.name}优化建议`,
        description: `针对${currentMetric.name}指标的优化建议，当前值为${currentMetric.value}${currentMetric.unit}`,
        relatedMetricCode: metricCode,
        requestedBy,
      },
      recommendationResult
    );

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        type: record.type,
        priority: record.priority,
        title: record.title,
        description: record.description,
        recommendation: recommendationResult,
        status: record.status,
        createdAt: record.createdAt,
      },
    });

  } catch (error) {
    console.error('生成决策建议错误:', error);
    return NextResponse.json(
      { error: '生成决策建议失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取决策建议列表
 * GET /api/efficiency/recommendations?companyId=xxx&type=xxx&status=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (!companyId) {
      return NextResponse.json(
        { error: '企业ID不能为空' },
        { status: 400 }
      );
    }

    const recommendations = await DecisionRecommendationManager.getList(companyId, {
      type: type || undefined,
      status: status || undefined,
      priority: priority || undefined,
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
    });

  } catch (error) {
    console.error('获取决策建议列表错误:', error);
    return NextResponse.json(
      { error: '获取决策建议列表失败' },
      { status: 500 }
    );
  }
}
