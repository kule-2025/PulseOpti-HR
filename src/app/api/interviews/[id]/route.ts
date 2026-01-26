import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/interviews/[id] - 获取面试详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const db = await getDb();

    const [interview] = await db
      .select({
        id: interviews.id,
        candidateId: interviews.candidateId,
        candidateName: candidates.name,
        candidateEmail: candidates.email,
        candidatePhone: candidates.phone,
        jobId: interviews.jobId,
        jobTitle: jobs.title,
        interviewerId: interviews.interviewerId,
        interviewerName: employees.name,
        interviewerEmail: employees.email,
        type: interviews.type,
        status: interviews.status,
        scheduledAt: interviews.scheduledAt,
        score: interviews.score,
        feedback: interviews.feedback,
        createdAt: interviews.createdAt,
        updatedAt: interviews.updatedAt,
      })
      .from(interviews)
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobs, eq(interviews.jobId, jobs.id))
      .leftJoin(employees, eq(interviews.interviewerId, employees.id))
      .where(
        and(
          eq(interviews.id, id),
          eq(interviews.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { success: false, error: '面试不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error('获取面试详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取面试详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/interviews/[id] - 更新面试
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      candidateId,
      jobId,
      interviewerId,
      type,
      status,
      scheduledAt,
      score,
      feedback,
    } = body;

    const db = await getDb();

    // 验证面试是否存在
    const [existingInterview] = await db
      .select()
      .from(interviews)
      .where(
        and(
          eq(interviews.id, id),
          eq(interviews.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingInterview) {
      return NextResponse.json(
        { success: false, error: '面试不存在' },
        { status: 404 }
      );
    }

    // 如果提供了candidateId，验证候选人是否存在
    if (candidateId) {
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(
          and(
            eq(candidates.id, candidateId),
            eq(candidates.companyId, user.companyId)
          )
        )
        .limit(1);

      if (!candidate) {
        return NextResponse.json(
          { success: false, error: '候选人不存在' },
          { status: 404 }
        );
      }
    }

    // 如果提供了jobId，验证职位是否存在
    if (jobId) {
      const [job] = await db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.id, jobId),
            eq(jobs.companyId, user.companyId)
          )
        )
        .limit(1);

      if (!job) {
        return NextResponse.json(
          { success: false, error: '职位不存在' },
          { status: 404 }
        );
      }
    }

    // 如果提供了interviewerId，验证面试官是否存在
    if (interviewerId) {
      const [interviewer] = await db
        .select()
        .from(employees)
        .where(
          and(
            eq(employees.id, interviewerId),
            eq(employees.companyId, user.companyId)
          )
        )
        .limit(1);

      if (!interviewer) {
        return NextResponse.json(
          { success: false, error: '面试官不存在' },
          { status: 404 }
        );
      }
    }

    // 更新面试
    const [updatedInterview] = await db
      .update(interviews)
      .set({
        ...(candidateId !== undefined && { candidateId }),
        ...(jobId !== undefined && { jobId }),
        ...(interviewerId !== undefined && { interviewerId }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(score !== undefined && { score }),
        ...(feedback !== undefined && { feedback }),
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedInterview,
      message: '面试更新成功',
    });
  } catch (error) {
    console.error('更新面试失败:', error);
    return NextResponse.json(
      { success: false, error: '更新面试失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interviews/[id] - 删除面试
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id } = await params;

  try {
    const db = await getDb();

    // 验证面试是否存在
    const [existingInterview] = await db
      .select()
      .from(interviews)
      .where(
        and(
          eq(interviews.id, id),
          eq(interviews.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingInterview) {
      return NextResponse.json(
        { success: false, error: '面试不存在' },
        { status: 404 }
      );
    }

    // 删除面试
    await db
      .delete(interviews)
      .where(eq(interviews.id, id));

    return NextResponse.json({
      success: true,
      message: '面试删除成功',
    });
  } catch (error) {
    console.error('删除面试失败:', error);
    return NextResponse.json(
      { success: false, error: '删除面试失败' },
      { status: 500 }
    );
  }
}
