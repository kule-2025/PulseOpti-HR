import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService } from '@/lib/services/connectionService';

/**
 * GET /api/connections/connectable
 * 获取可连接的账号列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const accounts = await connectionService.getConnectableAccounts(user.userId);

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    console.error('获取可连接账号列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取可连接账号列表失败' },
      { status: 500 }
    );
  }
}
