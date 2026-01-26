import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { candidates, jobs } from '@/storage/database/shared/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/candidates - 获取候选人列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
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
    const conditions = [eq(candidates.companyId, targetCompanyId)];

    if (jobId) {
      conditions.push(eq(candidates.jobId, jobId));
    }

    if (status && status !== 'all') {
      conditions.push(eq(candidates.status, status));
    }

    if (search) {
      conditions.push(
        sql`(${candidates.name} ILIKE ${`%${search}%`} OR ${candidates.email} ILIKE ${`%${search}%`} OR ${candidates.phone} ILIKE ${`%${search}%`})`
      );
    }

    // 获取候选人列表
    const candidateList = await db
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
      .where(and(...conditions))
      .orderBy(desc(candidates.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(candidates)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: candidateList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取候选人列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取候选人列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates - 创建候选人
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      jobId,
      status = 'new',
      source = 'manual',
      education,
      workExperience,
      skills,
      resumeUrl,
    } = body;

    // 验证必填字段
    if (!name || !email || !jobId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const db = await getDb();

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

    // 创建候选人
    const [newCandidate] = await db
      .insert(candidates)
      .values({
        name,
        email,
        phone: phone || '',
        jobId,
        companyId: user.companyId,
        status,
        source,
        education: education || '',
        workExperience: workExperience || '',
        skills: Array.isArray(skills) ? skills.join(',') : (skills || ''),
        resumeUrl: resumeUrl || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newCandidate,
      message: '候选人创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建候选人失败:', error);
    return NextResponse.json(
      { success: false, error: '创建候选人失败' },
      { status: 500 }
    );
  }
}
