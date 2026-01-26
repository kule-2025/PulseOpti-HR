import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jobs, departments } from '@/storage/database/shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/jobs/[id] - 获取职位详情
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

    const [job] = await db
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
        createdBy: jobs.createdBy,
      })
      .from(jobs)
      .leftJoin(departments, eq(jobs.departmentId, departments.id))
      .where(
        and(
          eq(jobs.id, id),
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

    // 获取申请数量
    const [applicationCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(sql`candidates`)
      .where(sql`job_id = ${id}`);

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        applicationsCount: applicationCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('获取职位详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取职位详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/jobs/[id] - 更新职位
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
      title,
      departmentId,
      location,
      salaryMin,
      salaryMax,
      description,
      requirements,
      status,
    } = body;

    const db = await getDb();

    // 验证职位是否存在
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, id),
          eq(jobs.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: '职位不存在' },
        { status: 404 }
      );
    }

    // 如果提供了部门ID，验证部门是否存在
    if (departmentId) {
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
    }

    // 更新职位
    const [updatedJob] = await db
      .update(jobs)
      .set({
        ...(title !== undefined && { title }),
        ...(departmentId !== undefined && { departmentId }),
        ...(location !== undefined && { location }),
        ...(salaryMin !== undefined && { salaryMin }),
        ...(salaryMax !== undefined && { salaryMax }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: '职位更新成功',
    });
  } catch (error) {
    console.error('更新职位失败:', error);
    return NextResponse.json(
      { success: false, error: '更新职位失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id] - 删除职位
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

    // 验证职位是否存在
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, id),
          eq(jobs.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: '职位不存在' },
        { status: 404 }
      );
    }

    // 删除职位
    await db
      .delete(jobs)
      .where(eq(jobs.id, id));

    return NextResponse.json({
      success: true,
      message: '职位删除成功',
    });
  } catch (error) {
    console.error('删除职位失败:', error);
    return NextResponse.json(
      { success: false, error: '删除职位失败' },
      { status: 500 }
    );
  }
}
