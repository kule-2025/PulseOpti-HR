import { NextRequest, NextResponse } from 'next/server';
import { EfficiencyManager } from '@/storage/database/efficiencyManager';

/**
 * 获取人效监测仪表盘数据
 * GET /api/efficiency/dashboard?companyId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '企业ID不能为空' },
        { status: 400 }
      );
    }

    // 获取仪表盘数据
    const dashboardData = await EfficiencyManager.getDashboardData(companyId);

    // 获取活跃预警
    const activeAlerts = await EfficiencyManager.getActiveAlerts(companyId);

    return NextResponse.json({
      success: true,
      data: {
        ...dashboardData,
        activeAlerts,
      },
    });

  } catch (error) {
    console.error('获取人效监测仪表盘数据错误:', error);
    return NextResponse.json(
      { error: '获取人效监测仪表盘数据失败' },
      { status: 500 }
    );
  }
}

/**
 * 触发指标计算和预警检查
 * POST /api/efficiency/dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, forceRecalculate } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: '企业ID不能为空' },
        { status: 400 }
      );
    }

    // 计算指标
    const metrics = await EfficiencyManager.calculateMetrics(companyId);

    // 保存快照
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const metricsData = metrics.reduce((acc, m) => {
      acc[m.code] = m.value;
      return acc;
    }, {} as Record<string, number>);
    await EfficiencyManager.saveSnapshot(companyId, 'monthly', period, metricsData);

    // 检查预警
    const alerts = await EfficiencyManager.checkAlerts(companyId);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        newAlerts: alerts.length,
        alerts,
      },
    });

  } catch (error) {
    console.error('计算人效指标错误:', error);
    return NextResponse.json(
      { error: '计算人效指标失败' },
      { status: 500 }
    );
  }
}
