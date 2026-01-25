import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { recruitmentWorkflowManager } from '@/storage/database/recruitmentWorkflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

// 拒绝候选人Schema
const rejectCandidateSchema = z.object({
  reason: z.string().min(1, '拒绝原因不能为空'),
});

/**
 * POST /api/recruitment/candidates/[id]/reject
 * 拒绝候选人（取消招聘流程）
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
    const validated = rejectCandidateSchema.parse(body);

    // 获取工作流实例
    const workflow = await recruitmentWorkflowManager.getRecruitmentWorkflow(id);
    if (!workflow) {
      return NextResponse.json(
        { error: '招聘工作流不存在' },
        { status: 404 }
      );
    }

    // 拒绝候选人
    const updatedWorkflow = await recruitmentWorkflowManager.rejectCandidate(
      workflow.id,
      {
        reason: validated.reason,
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
      action: 'reject_candidate',
      resourceType: 'recruitment_workflow',
      resourceId: workflow.id,
      resourceName: workflow.name,
      status: 'success',
      changes: {
        reason: validated.reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: '已拒绝候选人',
      data: updatedWorkflow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('拒绝候选人错误:', error);
    return NextResponse.json(
      { error: '拒绝候选人失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
