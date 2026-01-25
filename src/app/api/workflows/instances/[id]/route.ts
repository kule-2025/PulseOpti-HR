import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

// 工作流状态
enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

// 步骤状态
enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ERROR = 'error',
}

// 更新工作流步骤请求Schema
const updateStepSchema = z.object({
  stepId: z.string(),
  status: z.nativeEnum(StepStatus),
  result: z.string().optional(),
  comments: z.string().optional(),
  assigneeId: z.string().optional(),
  assigneeRole: z.string().optional(),
  assigneeName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
    uploadedBy: z.string(),
  })).optional(),
});

// 审批请求Schema
const approvalSchema = z.object({
  stepId: z.string(),
  action: z.enum(['approve', 'reject', 'return']),
  comments: z.string().optional(),
  approverId: z.string(),
  approverName: z.string(),
});

// 暂停/恢复工作流Schema
const pauseResumeSchema = z.object({
  action: z.enum(['pause', 'resume']),
  reason: z.string().optional(),
});

// 取消工作流Schema
const cancelSchema = z.object({
  reason: z.string(),
});

// 提交步骤Schema
const submitStepSchema = z.object({
  stepId: z.string(),
  result: z.string().optional(),
  comments: z.string().optional(),
  formData: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
    uploadedBy: z.string(),
  })).optional(),
});

/**
 * GET /api/workflows/instances/[id] - 获取工作流实例详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    const instance = await workflowManager.getInstanceById(id);

    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 获取工作流历史
    const history = await workflowManager.getHistory(id);

    return NextResponse.json({
      success: true,
      data: {
        ...instance,
        history,
      },
    });
  } catch (error) {
    console.error('获取工作流实例错误:', error);
    return NextResponse.json(
      { error: '获取工作流实例失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/instances/[id] - 更新工作流实例
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, priority, dueDate, formData, variables } = body;

    const instance = await workflowManager.updateInstance(id, {
      name,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      formData,
      variables,
    });

    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: 'updated',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      description: '更新工作流实例信息',
      changes: body,
    });

    return NextResponse.json({
      success: true,
      message: '工作流实例更新成功',
      data: instance,
    });
  } catch (error) {
    console.error('更新工作流实例错误:', error);
    return NextResponse.json(
      { error: '更新工作流实例失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/instances/[id] - 删除工作流实例
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.WORKFLOW_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { id } = await params;

    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    const deleted = await workflowManager.deleteInstance(id);

    if (!deleted) {
      return NextResponse.json(
        { error: '删除工作流实例失败' },
        { status: 500 }
      );
    }

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: instance.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'workflow_instance',
      resourceId: instance.id,
      resourceName: instance.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流实例删除成功',
    });
  } catch (error) {
    console.error('删除工作流实例错误:', error);
    return NextResponse.json(
      { error: '删除工作流实例失败' },
      { status: 500 }
    );
  }
}
