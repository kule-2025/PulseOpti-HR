import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService, TaskStatus } from '@/lib/services/connectionService';

/**
 * PUT /api/connections/tasks/[taskId]/status
 * 更新任务状态
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { taskId } = await params;
    const body = await request.json();
    const { status, feedback } = body;

    // 验证必填字段
    if (!status) {
      return NextResponse.json(
        { success: false, error: '缺少任务状态' },
        { status: 400 }
      );
    }

    // 验证状态值
    if (!Object.values(TaskStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的任务状态' },
        { status: 400 }
      );
    }

    // 更新任务状态
    await connectionService.updateTaskStatus(
      taskId,
      user.userId,
      status,
      feedback
    );

    return NextResponse.json({
      success: true,
      message: '任务状态已更新',
    });
  } catch (error: any) {
    console.error('更新任务状态失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新任务状态失败' },
      { status: 500 }
    );
  }
}
