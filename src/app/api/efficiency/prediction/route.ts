import { NextRequest, NextResponse } from 'next/server';
import { EfficiencyManager, PredictionAnalysisManager } from '@/storage/database';
import { efficiencyMetrics } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';

/**
 * 创建预测分析
 * POST /api/efficiency/prediction
 */
export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      metricCode,
      predictionPeriod,
      predictionType,
      requestedBy
    } = await request.json();

    if (!companyId || !metricCode || !predictionPeriod || !predictionType) {
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

    // 获取历史数据
    const historicalData = await EfficiencyManager.getTrendData(companyId, [metricCode], 24);

    // 获取指标信息
    const db = await getDb();
    const [metric] = await db
      .select()
      .from(efficiencyMetrics)
      .where(eq(efficiencyMetrics.code, metricCode));

    // 调用AI进行预测分析
    const context = {
      metricName: currentMetric.name,
      metricDescription: metric?.description,
      currentValue: currentMetric.value,
      benchmark: currentMetric.benchmark,
      historicalData: historicalData.slice(0, 12), // 最近12个月数据
    };

    const predictionResult = await PredictionAnalysisManager.predictWithAI(
      companyId,
      metricCode,
      predictionType,
      predictionPeriod,
      historicalData,
      context
    );

    // 保存预测记录
    const record = await PredictionAnalysisManager.createPrediction(
      companyId,
      metricCode,
      predictionPeriod,
      predictionType,
      currentMetric.value,
      predictionResult,
      requestedBy
    );

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        metricCode: record.metricCode,
        predictionPeriod: record.predictionPeriod,
        predictionType: record.predictionType,
        currentValue: record.currentValue,
        predictedValue: record.predictedValue,
        confidence: record.confidence,
        analysis: predictionResult,
        createdAt: record.createdAt,
      },
    });

  } catch (error) {
    console.error('创建预测分析错误:', error);
    return NextResponse.json(
      { error: '创建预测分析失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取预测分析历史记录
 * GET /api/efficiency/prediction?companyId=xxx&metricCode=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const metricCode = searchParams.get('metricCode');

    if (!companyId) {
      return NextResponse.json(
        { error: '企业ID不能为空' },
        { status: 400 }
      );
    }

    const history = await PredictionAnalysisManager.getHistory(
      companyId,
      metricCode || undefined,
      20
    );

    return NextResponse.json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error('获取预测分析历史错误:', error);
    return NextResponse.json(
      { error: '获取预测分析历史失败' },
      { status: 500 }
    );
  }
}
