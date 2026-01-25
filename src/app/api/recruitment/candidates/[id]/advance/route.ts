import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { recruitmentWorkflowManager } from '@/storage/database/recruitmentWorkflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

// 推进招聘步骤Schema
const advanceStepSchema = z.object({
  stepId: z.string(),
  result: z.string(),
  comments: z.string().optional(),
  formData: z.record(z.string(), z.any()).optional(),
  advanceToNext: z.boolean().default(true),
});

/**
 * POST /api/recruitment/candidates/[id]/advance
 * 推进招聘工作流到下一步
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
    const validated = advanceStepSchema.parse(body);

    // 获取工作流实例
    const workflow = await recruitmentWorkflowManager.getRecruitmentWorkflow(id);
    if (!workflow) {
      return NextResponse.json(
        { error: '招聘工作流不存在，请先启动工作流' },
        { status: 404 }
      );
    }

    // 推进步骤
    const updatedWorkflow = await recruitmentWorkflowManager.advanceRecruitmentStep(
      workflow.id,
      {
        ...validated,
        actorId: user.userId,
        actorName: user.name,
        actorRole: user.role,
      }
    );

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: workflow.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'advance_workflow_step',
      resourceType: 'recruitment_workflow',
      resourceId: workflow.id,
      resourceName: workflow.name,
      status: 'success',
      changes: {
        stepId: validated.stepId,
        result: validated.result,
      },
    });

    return NextResponse.json({
      success: true,
      message: validated.advanceToNext ? '招聘步骤推进成功' : '招聘步骤完成',
      data: updatedWorkflow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('推进招聘步骤错误:', error);
    return NextResponse.json(
      { error: '推进招聘步骤失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
