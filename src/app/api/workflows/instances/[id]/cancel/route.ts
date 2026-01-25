import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

// 取消工作流Schema
const cancelSchema = z.object({
  reason: z.string().min(1, '取消原因不能为空'),
});

/**
 * POST /api/workflows/instances/[id]/cancel - 取消工作流
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
    const validated = cancelSchema.parse(body);

    // 获取工作流实例
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 检查当前状态
    if (instance.status === 'completed' || instance.status === 'cancelled') {
      return NextResponse.json(
        { error: '已完成或已取消的工作流无法取消' },
        { status: 400 }
      );
    }

    // 更新状态
    const updatedInstance = await workflowManager.updateInstanceStatus(
      id,
      'cancelled',
      undefined,
      new Date()
    );

    if (!updatedInstance) {
      return NextResponse.json(
        { error: '取消工作流失败' },
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
      action: 'cancelled',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      description: `取消工作流：${validated.reason}`,
      metadata: {
        reason: validated.reason,
        previousStatus: instance.status,
      },
    });

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: instance.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'cancel',
      resourceType: 'workflow_instance',
      resourceId: instance.id,
      resourceName: instance.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流已取消',
      data: updatedInstance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('取消工作流错误:', error);
    return NextResponse.json(
      { error: '取消工作流失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
