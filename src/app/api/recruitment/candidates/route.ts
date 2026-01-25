import { NextRequest, NextResponse } from 'next/server';
import { candidateManager } from '@/storage/database/candidateManager';
import { recruitmentWorkflowManager } from '@/storage/database/recruitmentWorkflowManager';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建候选人Schema
const createCandidateSchema = z.object({
  companyId: z.string(),
  jobId: z.string(),
  name: z.string().min(1, '候选人姓名不能为空'),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  education: z.string().optional(),
  status: z.enum(['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected']).default('new'),
  source: z.string().optional(),
  notes: z.string().optional(),
});

// 启动招聘工作流Schema
const startWorkflowSchema = z.object({
  candidateId: z.string(),
  customSteps: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['task', 'approval', 'condition']),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).optional(),
});

/**
 * GET /api/recruitment/candidates
 * 获取候选人列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const targetCompanyId = companyId || user.companyId;

    const candidates = await candidateManager.getCandidates({
      skip: (page - 1) * limit,
      limit,
      filters: {
        companyId: targetCompanyId,
        jobId: jobId || undefined,
        status: status as any || undefined,
      },
    });

    // 获取每个候选人的工作流实例
    const candidatesWithWorkflow = await Promise.all(
      candidates.map(async (candidate) => {
        const workflow = await recruitmentWorkflowManager.getRecruitmentWorkflow(candidate.id);
        return {
          ...candidate,
          workflowInstanceId: workflow?.id,
          workflowStatus: workflow?.status,
          currentStep: workflow?.steps ? (workflow.steps as any[])[(workflow as any).currentStepIndex] : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: candidatesWithWorkflow,
      pagination: {
        page,
        limit,
        total: candidates.length,
      },
    });
  } catch (error) {
    console.error('获取候选人列表错误:', error);
    return NextResponse.json(
      { error: '获取候选人列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recruitment/candidates
 * 创建候选人
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.CANDIDATE_CREATE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createCandidateSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    const candidate = await candidateManager.createCandidate(validated);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'candidate',
      resourceId: candidate.id,
      resourceName: candidate.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '创建候选人成功',
      data: candidate,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建候选人错误:', error);
    return NextResponse.json(
      { error: '创建候选人失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/candidates
 * 批量操作候选人（启动工作流等）
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.RECRUITMENT_EDIT, PERMISSIONS.RECRUITMENT_APPROVE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const action = body.action;

    // 启动招聘工作流
    if (action === 'start_workflow') {
      const validated = startWorkflowSchema.parse(body);

      const workflow = await recruitmentWorkflowManager.createRecruitmentWorkflow({
        companyId: user.companyId,
        jobId: body.jobId,
        candidateId: validated.candidateId,
        initiatorId: user.userId,
        initiatorName: user.name,
        customSteps: validated.customSteps,
      });

      // 记录审计日志
      await auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.userId,
        userName: user.name,
        action: 'start_workflow',
        resourceType: 'recruitment_workflow',
        resourceId: workflow.id,
        resourceName: workflow.name,
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '招聘工作流启动成功',
        data: workflow,
      });
    }

    return NextResponse.json(
      { error: '不支持的操作' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('批量操作候选人错误:', error);
    return NextResponse.json(
      { error: '批量操作候选人失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
