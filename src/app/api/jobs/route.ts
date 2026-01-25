import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jobs, users } from '@/storage/database/shared/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 发布职位
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userStr = request.headers.get('x-user-id');
    if (!userStr) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必填字段
    const requiredFields = ['title', 'departmentId', 'location', 'salaryMin', 'salaryMax', 'description', 'requirements'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const jobId = randomUUID();

    await db.insert(jobs).values({
      companyId: user.companyId,
      title: body.title,
      departmentId: body.departmentId,
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      description: body.description,
      requirements: body.requirements,
      benefits: body.benefits || '',
      hireCount: body.headCount || 1,
      status: body.status === 'active' ? 'open' : 'draft',
      publishedAt: body.status === 'active' ? new Date() : null,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '职位发布成功',
      data: { id: jobId },
    });

  } catch (error) {
    console.error('发布职位失败:', error);
    return NextResponse.json(
      { error: '发布职位失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取职位列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(jobs.companyId, companyId)];

    if (search) {
      conditions.push(
        like(jobs.title, `%${search}%`)
      );
    }

    if (departmentId) {
      conditions.push(eq(jobs.departmentId, departmentId));
    }

    if (status) {
      conditions.push(eq(jobs.status, status));
    }

    // 查询职位列表
    const jobList = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .then((results) => results.length);

    // 为每个职位添加申请数量统计
    const jobListWithStats = await Promise.all(
      jobList.map(async (job) => {
        // jobApplications表暂未定义，applicationCount设为0
        const applicationCount = 0;

        return {
          ...job,
          applicationCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: jobListWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取职位列表失败:', error);
    return NextResponse.json(
      { error: '获取职位列表失败' },
      { status: 500 }
    );
  }
}
