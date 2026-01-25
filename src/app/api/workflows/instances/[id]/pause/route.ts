import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { workflowManager } from '@/storage/database/workflowManager';

// 暂停/恢复工作流Schema
const pauseResumeSchema = z.object({
  action: z.enum(['pause', 'resume']),
  reason: z.string().optional(),
});

/**
 * POST /api/workflows/instances/[id]/pause - 暂停或恢复工作流
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = pauseResumeSchema.parse(body);

    // 获取工作流实例
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 检查当前状态
    if (validated.action === 'pause' && instance.status !== 'active') {
      return NextResponse.json(
        { error: '只有活动状态的工作流可以暂停' },
        { status: 400 }
      );
    }

    if (validated.action === 'resume' && instance.status !== 'paused') {
      return NextResponse.json(
        { error: '只有暂停状态的工作流可以恢复' },
        { status: 400 }
      );
    }

    // 更新状态
    const newStatus = validated.action === 'pause' ? 'paused' : 'active';
    const updatedInstance = await workflowManager.updateInstanceStatus(id, newStatus);

    if (!updatedInstance) {
      return NextResponse.json(
        { error: '更新工作流状态失败' },
        { status: 500 }
      );
    }

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: validated.action === 'pause' ? 'paused' : 'resumed',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      description: `${validated.action === 'pause' ? '暂停' : '恢复'}工作流${validated.reason ? `：${validated.reason}` : ''}`,
      metadata: {
        previousStatus: instance.status,
        reason: validated.reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: `工作流已${validated.action === 'pause' ? '暂停' : '恢复'}`,
      data: updatedInstance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('暂停/恢复工作流错误:', error);
    return NextResponse.json(
      { error: '暂停/恢复工作流失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
