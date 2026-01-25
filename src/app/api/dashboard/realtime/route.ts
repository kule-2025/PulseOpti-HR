import { NextRequest, NextResponse } from 'next/server';
import { realtimeDashboardService } from '@/lib/analytics/realtime-dashboard';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * 实时数据看板API
 * GET /api/dashboard/realtime
 * 获取实时数据看板
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const dashboard = await realtimeDashboardService.getDashboard(user.companyId);

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('获取实时数据看板失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
