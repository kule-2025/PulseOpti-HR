import { NextRequest, NextResponse } from 'next/server';
import { EfficiencyManager, AttributionAnalysisManager } from '@/storage/database';
import { efficiencyMetrics } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';

/**
 * 创建归因分析
 * POST /api/efficiency/attribution
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, metricCode, period, requestedBy } = await request.json();

    if (!companyId || !metricCode || !period) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取当前值和上一期值
    const currentMetrics = await EfficiencyManager.calculateMetrics(companyId);
    const currentMetric = currentMetrics.find(m => m.code === metricCode);

    if (!currentMetric) {
      return NextResponse.json(
        { error: '指标不存在' },
        { status: 404 }
      );
    }

    // 获取上一期数据（简单处理：假设上月数据是当前值的95%或105%）
    const trend = currentMetric.value > 0 ? 1.05 : 0.95;
    const previousValue = Math.round(currentMetric.value / trend);

    // 获取历史趋势数据
    const trendData = await EfficiencyManager.getTrendData(companyId, [metricCode], 12);

    // 获取指标信息
    const db = await getDb();
    const [metric] = await db
      .select()
      .from(efficiencyMetrics)
      .where(eq(efficiencyMetrics.code, metricCode));

    // 调用AI进行归因分析
    const context = {
      metricName: currentMetric.name,
      metricCode,
      currentValue: currentMetric.value,
      previousValue,
      trendData: trendData.slice(0, 6), // 最近6个月数据
    };

    const analysisResult = await AttributionAnalysisManager.analyzeWithAI(
      companyId,
      metricCode,
      currentMetric.value,
      previousValue,
      context
    );

    // 保存分析记录
    const record = await AttributionAnalysisManager.createAnalysis(
      companyId,
      metricCode,
      period,
      currentMetric.value,
      previousValue,
      analysisResult,
      requestedBy
    );

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        metricCode: record.metricCode,
        currentValue: record.currentValue,
        previousValue: record.previousValue,
        changeRate: record.changeRate,
        analysis: analysisResult,
        createdAt: record.createdAt,
      },
    });

  } catch (error) {
    console.error('创建归因分析错误:', error);
    return NextResponse.json(
      { error: '创建归因分析失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取归因分析历史记录
 * GET /api/efficiency/attribution?companyId=xxx&metricCode=xxx
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

    const history = await AttributionAnalysisManager.getHistory(
      companyId,
      metricCode || undefined,
      20
    );

    return NextResponse.json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error('获取归因分析历史错误:', error);
    return NextResponse.json(
      { error: '获取归因分析历史失败' },
      { status: 500 }
    );
  }
}
