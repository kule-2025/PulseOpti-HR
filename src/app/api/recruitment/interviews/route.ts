import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建面试安排Schema
const createInterviewSchema = z.object({
  companyId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  round: z.number().positive().default(1),
  interviewerId: z.string(),
  scheduledAt: z.coerce.date(),
  location: z.string().optional(),
  type: z.enum(['online', 'offline', 'phone']).default('offline'),
  duration: z.number().default(60),
  notes: z.string().optional(),
});

/**
 * GET /api/recruitment/interviews
 * 获取面试安排列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || user.companyId;
    const candidateId = searchParams.get('candidateId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(interviews.companyId, companyId)];

    if (candidateId) {
      conditions.push(eq(interviews.candidateId, candidateId));
    }

    if (jobId) {
      conditions.push(eq(interviews.jobId, jobId));
    }

    if (status) {
      conditions.push(eq(interviews.status, status));
    }

    const offset = (page - 1) * limit;

    const interviewsData = await db
      .select({
        id: interviews.id,
        companyId: interviews.companyId,
        candidateId: interviews.candidateId,
        jobId: interviews.jobId,
        round: interviews.round,
        interviewerId: interviews.interviewerId,
        scheduledAt: interviews.scheduledAt,
        location: interviews.location,
        type: interviews.type,
        status: interviews.status,
        score: interviews.score,
        feedback: interviews.feedback,
        nextRoundScheduled: interviews.nextRoundScheduled,
        metadata: interviews.metadata,
        createdAt: interviews.createdAt,
        updatedAt: interviews.updatedAt,
        candidateName: candidates.name,
        candidatePhone: candidates.phone,
        jobTitle: jobs.title,
        interviewerName: employees.name,
      })
      .from(interviews)
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobs, eq(interviews.jobId, jobs.id))
      .leftJoin(employees, eq(interviews.interviewerId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(interviews.scheduledAt))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviews)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: interviewsData,
      pagination: {
        page,
        limit,
        total: Number(count),
      },
    });
  } catch (error) {
    console.error('获取面试安排错误:', error);
    return NextResponse.json(
      { error: '获取面试安排失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recruitment/interviews
 * 创建面试安排
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.INTERVIEW_SCHEDULE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createInterviewSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    const [result] = await db.insert(interviews).values({
      ...validated,
      id: crypto.randomUUID(),
      status: 'scheduled',
      createdAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'interview',
      resourceId: result.id,
      resourceName: `面试第${validated.round}轮`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '创建面试安排成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建面试安排错误:', error);
    return NextResponse.json(
      { error: '创建面试安排失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/interviews
 * 更新面试安排
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.INTERVIEW_SCHEDULE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: '面试ID不能为空' },
        { status: 400 }
      );
    }

    const [result] = await db
      .update(interviews)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'interview',
      resourceId: id,
      resourceName: '面试安排',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '更新面试安排成功',
      data: result,
    });
  } catch (error) {
    console.error('更新面试安排错误:', error);
    return NextResponse.json(
      { error: '更新面试安排失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/interviews/[id]/complete
 * 完成面试
 */
export async function completeInterview(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.INTERVIEW_SCHEDULE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { score, feedback, status } = body;

    const [result] = await db
      .update(interviews)
      .set({
        score,
        feedback,
        status: status || 'completed',
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, params.id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'complete',
      resourceType: 'interview',
      resourceId: params.id,
      resourceName: '面试完成',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '完成面试成功',
      data: result,
    });
  } catch (error) {
    console.error('完成面试错误:', error);
    return NextResponse.json(
      { error: '完成面试失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recruitment/interviews
 * 取消面试
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.INTERVIEW_SCHEDULE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '面试ID不能为空' },
        { status: 400 }
      );
    }

    const [result] = await db
      .update(interviews)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'interview',
      resourceId: id,
      resourceName: '取消面试',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '取消面试成功',
      data: result,
    });
  } catch (error) {
    console.error('取消面试错误:', error);
    return NextResponse.json(
      { error: '取消面试失败' },
      { status: 500 }
    );
  }
}
