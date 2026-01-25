import { NextRequest, NextResponse } from 'next/server';
import { alertManager } from '@/lib/alert-manager';

/**
 * 获取活跃告警列表
 */
export async function GET() {
  try {
    const alerts = alertManager.getActiveAlerts();

    return NextResponse.json({
      success: true,
      data: alerts,
    });

  } catch (error) {
    console.error('获取告警列表失败:', error);
    return NextResponse.json(
      { error: '获取告警列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 确认告警
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, userId } = body;

    if (!alertId || !userId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    await alertManager.acknowledgeAlert(alertId, userId);

    return NextResponse.json({
      success: true,
      message: '告警已确认',
    });

  } catch (error) {
    console.error('确认告警失败:', error);
    return NextResponse.json(
      { error: '确认告警失败' },
      { status: 500 }
    );
  }
}
