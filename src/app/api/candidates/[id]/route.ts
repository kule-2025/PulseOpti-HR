import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { candidates, jobs, interviews } from '@/storage/database/shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/candidates/[id] - 获取候选人详情
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

    const [candidate] = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        email: candidates.email,
        phone: candidates.phone,
        jobId: candidates.jobId,
        jobTitle: jobs.title,
        status: candidates.status,
        source: candidates.source,
        education: candidates.education,
        workExperience: candidates.workExperience,
        skills: candidates.skills,
        resumeUrl: candidates.resumeUrl,
        createdAt: candidates.createdAt,
        updatedAt: candidates.updatedAt,
      })
      .from(candidates)
      .leftJoin(jobs, eq(candidates.jobId, jobs.id))
      .where(
        and(
          eq(candidates.id, id),
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

    // 获取面试记录
    const interviewRecords = await db
      .select()
      .from(interviews)
      .where(
        and(
          eq(interviews.candidateId, id),
          eq(interviews.companyId, user.companyId)
        )
      )
      .orderBy(desc(interviews.scheduledAt));

    return NextResponse.json({
      success: true,
      data: {
        ...candidate,
        skills: candidate.skills && typeof candidate.skills === 'string' ? candidate.skills.split(',') : [],
        interviews: interviewRecords,
      },
    });
  } catch (error) {
    console.error('获取候选人详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取候选人详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/candidates/[id] - 更新候选人
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
      name,
      email,
      phone,
      jobId,
      status,
      source,
      education,
      workExperience,
      skills,
      resumeUrl,
    } = body;

    const db = await getDb();

    // 验证候选人是否存在
    const [existingCandidate] = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.id, id),
          eq(candidates.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingCandidate) {
      return NextResponse.json(
        { success: false, error: '候选人不存在' },
        { status: 404 }
      );
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

    // 更新候选人
    const [updatedCandidate] = await db
      .update(candidates)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(jobId !== undefined && { jobId }),
        ...(status !== undefined && { status }),
        ...(source !== undefined && { source }),
        ...(education !== undefined && { education }),
        ...(workExperience !== undefined && { workExperience }),
        ...(skills !== undefined && {
          skills: Array.isArray(skills) ? skills.join(',') : skills
        }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedCandidate,
      message: '候选人更新成功',
    });
  } catch (error) {
    console.error('更新候选人失败:', error);
    return NextResponse.json(
      { success: false, error: '更新候选人失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidates/[id] - 删除候选人
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

    // 验证候选人是否存在
    const [existingCandidate] = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.id, id),
          eq(candidates.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingCandidate) {
      return NextResponse.json(
        { success: false, error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 删除候选人
    await db
      .delete(candidates)
      .where(eq(candidates.id, id));

    return NextResponse.json({
      success: true,
      message: '候选人删除成功',
    });
  } catch (error) {
    console.error('删除候选人失败:', error);
    return NextResponse.json(
      { success: false, error: '删除候选人失败' },
      { status: 500 }
    );
  }
}
