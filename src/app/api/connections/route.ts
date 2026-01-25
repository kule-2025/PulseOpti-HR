import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService } from '@/lib/services/connectionService';

/**
 * GET /api/connections
 * 获取连接关系列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const connections = await connectionService.getConnections(user.userId);

    return NextResponse.json({
      success: true,
      data: connections,
    });
  } catch (error: any) {
    console.error('获取连接关系失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取连接关系失败' },
      { status: 500 }
    );
  }
}
