import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService, TaskType, TaskPriority } from '@/lib/services/connectionService';

/**
 * POST /api/connections/tasks/assign
 * 指派任务
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const {
      toUserId,
      taskType,
      title,
      description,
      priority = TaskPriority.MEDIUM,
      dueDate,
      relatedResourceId,
      relatedResourceType,
      requirements,
      attachments,
    } = body;

    // 验证必填字段
    if (!toUserId || !taskType || !title) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 指派任务
    const result = await connectionService.assignTask({
      fromUserId: user.id,
      toUserId,
      taskType,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      relatedResourceId,
      relatedResourceType,
      requirements,
      attachments,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('指派任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '指派任务失败' },
      { status: 500 }
    );
  }
}
