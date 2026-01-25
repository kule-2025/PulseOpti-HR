import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService, TaskStatus } from '@/lib/services/connectionService';

/**
 * GET /api/connections/tasks
 * 获取任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | null;

    const tasks = await connectionService.getTasks(user.userId, status || undefined);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取任务列表失败' },
      { status: 500 }
    );
  }
}
