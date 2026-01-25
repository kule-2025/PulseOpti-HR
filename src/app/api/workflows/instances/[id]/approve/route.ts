import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

// 审批请求Schema
const approvalSchema = z.object({
  stepId: z.string(),
  action: z.enum(['approve', 'reject', 'return']),
  comments: z.string().optional(),
});

/**
 * POST /api/workflows/instances/[id]/approve - 审批工作流
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
    const validated = approvalSchema.parse(body);

    // 获取工作流实例
    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 检查工作流状态
    if (instance.status !== 'active') {
      return NextResponse.json(
        { error: '工作流未处于活动状态，无法审批' },
        { status: 400 }
      );
    }

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    // 验证stepId
    if (currentStep.id !== validated.stepId) {
      return NextResponse.json(
        { error: '提交的步骤ID与当前步骤不匹配' },
        { status: 400 }
      );
    }

    // 记录审批历史
    const actionText = validated.action === 'approve' ? '通过' : validated.action === 'reject' ? '拒绝' : '退回';
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: validated.action === 'approve' ? 'approved' : validated.action === 'reject' ? 'rejected' : 'returned',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `审批${actionText}：${currentStep.name}${validated.comments ? `（${validated.comments}）` : ''}`,
      metadata: {
        comments: validated.comments,
      },
    });

    // 处理审批结果
    if (validated.action === 'reject') {
      // 拒绝，取消工作流
      const updatedInstance = await workflowManager.updateInstanceStatus(id, 'cancelled', undefined, new Date());

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
        description: `工作流因审批拒绝而取消`,
        metadata: {
          rejectReason: validated.comments,
        },
      });

      return NextResponse.json({
        success: true,
        message: '审批已拒绝，工作流已取消',
        data: updatedInstance,
      });
    } else if (validated.action === 'return') {
      // 退回到上一步
      if (instance.currentStepIndex <= 1) {
        return NextResponse.json(
          { error: '当前已是第一步，无法退回' },
          { status: 400 }
        );
      }

      // 完成当前步骤
      currentStep.status = 'completed';
      currentStep.endTime = new Date();
      if (validated.comments) currentStep.comments = validated.comments;

      // 回退到上一步
      const prevStepIndex = instance.currentStepIndex - 1;
      steps[prevStepIndex].status = 'in_progress';
      steps[prevStepIndex].startTime = new Date();

      const updatedInstance = await workflowManager.updateInstance(id, {
        steps,
        currentStepIndex: prevStepIndex,
      });

      await workflowManager.addHistory({
        companyId: instance.companyId,
        instanceId: instance.id,
        instanceName: instance.name,
        templateId: instance.templateId,
        type: instance.type,
        action: 'step_started',
        actorId: user.userId,
        actorName: user.name,
        actorRole: user.role,
        stepId: steps[prevStepIndex].id,
        stepName: steps[prevStepIndex].name,
        description: `退回到步骤：${steps[prevStepIndex].name}`,
      });

      return NextResponse.json({
        success: true,
        message: '已退回到上一步',
        data: updatedInstance,
      });
    } else {
      // 通过，推进到下一步
      currentStep.status = 'completed';
      currentStep.endTime = new Date();
      if (validated.comments) currentStep.comments = validated.comments;

      const updatedInstance = await workflowManager.advanceStep(id);

      if (!updatedInstance) {
        return NextResponse.json(
          { error: '推进工作流失败' },
          { status: 500 }
        );
      }

      // 如果所有步骤完成
      if (updatedInstance.status === 'completed') {
        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId: instance.id,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: instance.type,
          action: 'completed',
          actorId: user.userId,
          actorName: user.name,
          actorRole: user.role,
          description: '工作流实例已完成',
          metadata: {
            startDate: instance.startDate,
            endDate: updatedInstance.endDate,
            duration: updatedInstance.endDate && instance.startDate
              ? updatedInstance.endDate.getTime() - instance.startDate.getTime()
              : null,
          },
        });

        // 记录审计日志
        await auditLogManager.logAction({
          companyId: instance.companyId,
          userId: user.userId,
          userName: user.name,
          action: 'complete',
          resourceType: 'workflow_instance',
          resourceId: instance.id,
          resourceName: instance.name,
          status: 'success',
        });
      } else {
        // 记录开始下一步
        const newSteps = updatedInstance.steps as any[];
        const newStep = newSteps[updatedInstance.currentStepIndex];

        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId: instance.id,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: instance.type,
          action: 'step_started',
          actorId: user.userId,
          actorName: user.name,
          actorRole: user.role,
          stepId: newStep.id,
          stepName: newStep.name,
          description: `开始步骤：${newStep.name}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: '审批通过，工作流已推进',
        data: updatedInstance,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('审批工作流错误:', error);
    return NextResponse.json(
      { error: '审批工作流失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
