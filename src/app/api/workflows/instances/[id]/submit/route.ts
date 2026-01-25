import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

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
  advanceToNext: z.boolean().default(true), // 是否自动推进到下一步
});

/**
 * POST /api/workflows/instances/[id]/submit - 提交当前步骤
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
    const validated = submitStepSchema.parse(body);

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
        { error: '工作流未处于活动状态，无法提交' },
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

    // 更新当前步骤
    currentStep.status = 'completed';
    currentStep.endTime = new Date();
    if (validated.result) currentStep.result = validated.result;
    if (validated.comments) currentStep.comments = validated.comments;
    if (validated.attachments) currentStep.attachments = validated.attachments;

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: 'step_completed',
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `完成步骤：${currentStep.name}`,
      metadata: {
        result: validated.result,
        comments: validated.comments,
      },
    });

    // 推进到下一步
    let updatedInstance: any = instance;
    if (validated.advanceToNext) {
      updatedInstance = await workflowManager.advanceStep(id);

      if (!updatedInstance) {
        return NextResponse.json(
          { error: '推进工作流失败' },
          { status: 500 }
        );
      }

      // 如果推进到下一步，记录历史
      if (updatedInstance.status !== 'completed') {
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
      } else {
        // 工作流完成
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
      }
    } else {
      // 不自动推进，只更新实例
      const updated = await workflowManager.updateInstance(id, {
        steps,
      });
      if (updated) {
        updatedInstance = updated;
      }
    }

    return NextResponse.json({
      success: true,
      message: validated.advanceToNext ? '步骤提交并推进成功' : '步骤提交成功',
      data: updatedInstance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('提交工作流步骤错误:', error);
    return NextResponse.json(
      { error: '提交工作流步骤失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
