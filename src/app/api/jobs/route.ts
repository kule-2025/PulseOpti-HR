import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jobs, departments } from '@/storage/database/shared/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/jobs - 获取职位列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 如果没有提供companyId，使用当前用户的companyId
    const targetCompanyId = companyId || user.companyId;

    if (!targetCompanyId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const conditions = [eq(jobs.companyId, targetCompanyId)];

    if (status && status !== 'all') {
      conditions.push(eq(jobs.status, status));
    }

    if (departmentId) {
      conditions.push(eq(jobs.departmentId, departmentId));
    }

    if (search) {
      conditions.push(
        sql`(${jobs.title} ILIKE ${`%${search}%`} OR ${jobs.description} ILIKE ${`%${search}%`})`
      );
    }

    // 获取职位列表和部门名称
    const jobList = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        departmentId: jobs.departmentId,
        departmentName: departments.name,
        location: jobs.location,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        description: jobs.description,
        requirements: jobs.requirements,
        status: jobs.status,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
      })
      .from(jobs)
      .leftJoin(departments, eq(jobs.departmentId, departments.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    // 获取每个职位的申请数量
    const jobIds = jobList.map(job => job.id);
    const applicationsCounts = jobIds.length > 0 ? await db
      .select({
        jobId: jobs.id,
        count: sql<number>`count(*)::int`,
      })
      .from(jobs)
      .where(sql`${jobs.id} = ANY(${jobIds})`)
      .groupBy(jobs.id) : [];

    const countsMap = new Map(applicationsCounts.map(c => [c.jobId, c.count]));

    const jobsWithCounts = jobList.map(job => ({
      ...job,
      applicationsCount: countsMap.get(job.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: jobsWithCounts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取职位列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取职位列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs - 创建职位
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const {
      title,
      departmentId,
      location,
      salaryMin,
      salaryMax,
      description,
      requirements,
      status = 'open',
    } = body;

    // 验证必填字段
    if (!title || !departmentId || !description) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 验证部门是否存在
    const [department] = await db
      .select()
      .from(departments)
      .where(
        and(
          eq(departments.id, departmentId),
          eq(departments.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!department) {
      return NextResponse.json(
        { success: false, error: '部门不存在' },
        { status: 404 }
      );
    }

    // 创建职位
    const [newJob] = await db
      .insert(jobs)
      .values({
        title,
        departmentId,
        companyId: user.companyId,
        location: location || '',
        salaryMin: salaryMin || 0,
        salaryMax: salaryMax || 0,
        description,
        requirements: requirements || '',
        status,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newJob,
      message: '职位创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建职位失败:', error);
    return NextResponse.json(
      { success: false, error: '创建职位失败' },
      { status: 500 }
    );
  }
}
