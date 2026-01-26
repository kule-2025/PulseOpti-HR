import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/interviews - 获取面试列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const candidateId = searchParams.get('candidateId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const targetCompanyId = companyId || user.companyId;

    if (!targetCompanyId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const conditions = [eq(interviews.companyId, targetCompanyId)];

    if (candidateId) {
      conditions.push(eq(interviews.candidateId, candidateId));
    }

    if (jobId) {
      conditions.push(eq(interviews.jobId, jobId));
    }

    if (status && status !== 'all') {
      conditions.push(eq(interviews.status, status));
    }

    // 获取面试列表
    const interviewList = await db
      .select({
        id: interviews.id,
        candidateId: interviews.candidateId,
        candidateName: candidates.name,
        jobId: interviews.jobId,
        jobTitle: jobs.title,
        interviewerId: interviews.interviewerId,
        interviewerName: employees.name,
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
      .where(and(...conditions))
      .orderBy(desc(interviews.scheduledAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(interviews)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: interviewList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取面试列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取面试列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interviews - 创建面试
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const {
      candidateId,
      jobId,
      interviewerId,
      type = 'onsite',
      scheduledAt,
    } = body;

    // 验证必填字段
    if (!candidateId || !jobId || !interviewerId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 验证候选人是否存在
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

    // 验证职位是否存在
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

    // 验证面试官是否存在
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

    // 创建面试
    const [newInterview] = await db
      .insert(interviews)
      .values({
        candidateId,
        jobId,
        interviewerId,
        companyId: user.companyId,
        type,
        status: 'scheduled',
        scheduledAt: new Date(scheduledAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: '面试创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建面试失败:', error);
    return NextResponse.json(
      { success: false, error: '创建面试失败' },
      { status: 500 }
    );
  }
}
