import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { workflowManager } from '@/storage/database';
import { auditLogManager } from '@/storage/database/auditLogManager';

// ========== 验证 Schema ==========

const updateWorkflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  })).optional(),
  currentStepIndex: z.number().min(0).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
  formData: z.record(z.string(), z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  endDate: z.string().optional(),
});

const advanceStepSchema = z.object({
  comment: z.string().optional(),
  nextStepAction: z.enum(['advance', 'skip', 'reject']).optional(),
});

const assignStepSchema = z.object({
  assigneeId: z.string(),
  assigneeName: z.string(),
  comment: z.string().optional(),
});

// ========== GET：获取工作流详情 ==========

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const instance = await workflowManager.getInstanceById(id);

    if (!instance) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    // 检查权限：只能访问自己企业的工作流
    if (instance.companyId !== user.companyId) {
      return NextResponse.json(
        { error: '无权访问该工作流' },
        { status: 403 }
      );
    }

    // 获取工作流历史记录
    const history = await workflowManager.getHistory(id);

    return NextResponse.json({
      success: true,
      data: {
        instance,
        history,
      },
    });
  } catch (error) {
    console.error('获取工作流详情错误:', error);
    return NextResponse.json(
      { error: '获取工作流详情失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新工作流 ==========

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.WORKFLOW_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateWorkflowSchema.parse(body);

    // 构建更新数据
    const updateData: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // 转换日期
    if (validated.dueDate) {
      updateData.dueDate = new Date(validated.dueDate);
    }
    if (validated.endDate) {
      updateData.endDate = new Date(validated.endDate);
    }

    const updatedInstance = await workflowManager.updateInstance(id, updateData);

    if (!updatedInstance) {
      return NextResponse.json(
        { error: '更新工作流失败' },
        { status: 500 }
      );
    }

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: user.companyId,
      instanceId: id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: 'updated',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      description: '更新工作流',
      changes: body,
    } as any);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'workflow_instance',
      resourceId: id,
      resourceName: instance.name,
      changes: body,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流更新成功',
      data: updatedInstance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新工作流错误:', error);
    return NextResponse.json(
      { error: '更新工作流失败' },
      { status: 500 }
    );
  }
}

// ========== POST：推进工作流步骤 ==========

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    if (instance.status !== 'active') {
      return NextResponse.json(
        { error: '只能推进进行中的工作流' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = body.action; // 'advance', 'skip', 'reject'

    if (!action || !['advance', 'skip', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作' },
        { status: 400 }
      );
    }

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    if (!currentStep) {
      return NextResponse.json(
        { error: '当前步骤不存在' },
        { status: 400 }
      );
    }

    // 检查权限：只有当前步骤的assignee或管理员可以操作
    const canOperate = 
      currentStep.assigneeId === user.userId || 
      ['admin', 'manager', 'hr_admin'].includes(user.role);

    if (!canOperate) {
      return NextResponse.json(
        { error: '无权操作此步骤' },
        { status: 403 }
      );
    }

    let updatedInstance;
    let actionDescription;

    switch (action) {
      case 'advance':
        currentStep.status = 'completed';
        currentStep.endTime = new Date();
        actionDescription = `完成步骤: ${currentStep.name}`;

        // 推进到下一步
        if (instance.currentStepIndex < steps.length - 1) {
          instance.currentStepIndex++;
          steps[instance.currentStepIndex].status = 'in_progress';
          steps[instance.currentStepIndex].startTime = new Date();
          actionDescription += ` → 进入步骤: ${steps[instance.currentStepIndex].name}`;
        } else {
          // 所有步骤完成
          instance.status = 'completed';
          instance.endDate = new Date();
          actionDescription += ' → 工作流完成';
        }
        break;

      case 'skip':
        currentStep.status = 'skipped';
        currentStep.endTime = new Date();
        actionDescription = `跳过步骤: ${currentStep.name}`;

        // 进入下一步
        if (instance.currentStepIndex < steps.length - 1) {
          instance.currentStepIndex++;
          steps[instance.currentStepIndex].status = 'in_progress';
          steps[instance.currentStepIndex].startTime = new Date();
          actionDescription += ` → 进入步骤: ${steps[instance.currentStepIndex].name}`;
        } else {
          instance.status = 'completed';
          instance.endDate = new Date();
          actionDescription += ' → 工作流完成';
        }
        break;

      case 'reject':
        instance.status = 'cancelled';
        instance.endDate = new Date();
        actionDescription = `拒绝并终止工作流`;
        break;

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        );
    }

    updatedInstance = await workflowManager.updateInstance(id, {
      steps,
      currentStepIndex: instance.currentStepIndex,
      status: instance.status,
      endDate: instance.endDate,
    } as any);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: user.companyId,
      instanceId: id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: action === 'reject' ? 'rejected' : action === 'skip' ? 'skipped' : 'step_completed',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `${actionDescription}${body.comment ? ` (${body.comment})` : ''}`,
      changes: {
        stepIndex: instance.currentStepIndex,
        action,
      },
    } as any);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'workflow_instance',
      resourceId: id,
      resourceName: instance.name,
      changes: {
        action,
        stepIndex: instance.currentStepIndex,
      },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流推进成功',
      data: updatedInstance,
    });
  } catch (error) {
    console.error('推进工作流错误:', error);
    return NextResponse.json(
      { error: '推进工作流失败' },
      { status: 500 }
    );
  }
}

// ========== DELETE：删除工作流 ==========

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.WORKFLOW_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    // 只能删除草稿或已取消的工作流
    if (instance.status === 'active' || instance.status === 'paused') {
      return NextResponse.json(
        { error: '只能删除草稿或已取消的工作流' },
        { status: 400 }
      );
    }

    await workflowManager.deleteInstance(id);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'workflow_instance',
      resourceId: id,
      resourceName: instance.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流删除成功',
    });
  } catch (error) {
    console.error('删除工作流错误:', error);
    return NextResponse.json(
      { error: '删除工作流失败' },
      { status: 500 }
    );
  }
}
