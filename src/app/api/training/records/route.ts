import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { trainingRecords, trainingCourses, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createRecordSchema = z.object({
  courseId: z.string().min(1, '课程ID不能为空'),
  employeeId: z.string().min(1, '员工ID不能为空'),
  enrollmentDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['enrolled', 'in_progress', 'completed', 'dropped', 'cancelled']).default('enrolled'),
  score: z.number().min(0).max(100).optional(),
  maxScore: z.number().min(0).optional(),
  grade: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  instructorId: z.string().optional(),
  attendance: z.array(z.object({
    date: z.string(),
    status: z.enum(['present', 'absent', 'late']),
  })).optional(),
  learningHours: z.number().min(0).default(0),
  cost: z.number().min(0).optional(),
});

const updateRecordSchema = createRecordSchema.partial().extend({
  id: z.string(),
  progress: z.number().min(0).max(100).optional(),
  completionDate: z.string().optional(),
  certificateUrl: z.string().optional(),
});

// ========== GET：获取培训记录列表 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;

    const companyId = searchParams.get('companyId') || user.companyId;
    const courseId = searchParams.get('courseId');
    const employeeId = searchParams.get('employeeId');
    const employeeName = searchParams.get('employeeName');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(trainingRecords.companyId, companyId)];

    if (courseId) {
      conditions.push(eq(trainingRecords.courseId, courseId));
    }

    if (employeeId) {
      conditions.push(eq(trainingRecords.employeeId, employeeId));
    }

    if (employeeName) {
      conditions.push(ilike(trainingRecords.employeeName, `%${employeeName}%`));
    }

    if (status) {
      conditions.push(eq(trainingRecords.status, status));
    }

    const offset = (page - 1) * limit;

    const records = await db
      .select({
        id: trainingRecords.id,
        companyId: trainingRecords.companyId,
        courseId: trainingRecords.courseId,
        employeeId: trainingRecords.employeeId,
        employeeName: trainingRecords.employeeName,
        courseTitle: trainingRecords.courseTitle,
        enrollmentDate: trainingRecords.enrollmentDate,
        startDate: trainingRecords.startDate,
        endDate: trainingRecords.endDate,
        progress: trainingRecords.progress,
        completionDate: trainingRecords.completionDate,
        status: trainingRecords.status,
        score: trainingRecords.score,
        maxScore: trainingRecords.maxScore,
        grade: trainingRecords.grade,
        certificateUrl: trainingRecords.certificateUrl,
        feedback: trainingRecords.feedback,
        rating: trainingRecords.rating,
        instructorId: trainingRecords.instructorId,
        attendance: trainingRecords.attendance,
        learningHours: trainingRecords.learningHours,
        cost: trainingRecords.cost,
        metadata: trainingRecords.metadata,
        createdAt: trainingRecords.createdAt,
        updatedAt: trainingRecords.updatedAt,
      })
      .from(trainingRecords)
      .where(and(...conditions))
      .orderBy(desc(trainingRecords.enrollmentDate))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRecords)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total: Number(count),
      },
    });
  } catch (error) {
    console.error('获取培训记录错误:', error);
    return NextResponse.json(
      { error: '获取培训记录失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建培训记录（报名） ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createRecordSchema.parse(body);

    // 检查课程是否存在
    const [course] = await db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.id, validated.courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }

    // 检查是否已报名
    const [existing] = await db
      .select()
      .from(trainingRecords)
      .where(
        and(
          eq(trainingRecords.courseId, validated.courseId),
          eq(trainingRecords.employeeId, validated.employeeId),
          sql`(${trainingRecords.status} != 'dropped' AND ${trainingRecords.status} != 'cancelled')`
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: '已报名此课程' },
        { status: 400 }
      );
    }

    // 检查名额
    if (course.maxParticipants && course.maxParticipants > 0) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(trainingRecords)
        .where(
          and(
            eq(trainingRecords.courseId, validated.courseId),
            sql`(${trainingRecords.status} != 'dropped' AND ${trainingRecords.status} != 'cancelled')`
          )
        );

      if (count >= course.maxParticipants) {
        return NextResponse.json(
          { error: '课程已满员' },
          { status: 400 }
        );
      }
    }

    // 获取员工信息
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, validated.employeeId))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: '员工不存在' },
        { status: 404 }
      );
    }

    const [result] = await db.insert(trainingRecords).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      employeeName: employee.name,
      courseTitle: course.title,
      progress: 0,
      enrollmentDate: validated.enrollmentDate ? new Date(validated.enrollmentDate) : new Date(),
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'training_record',
      resourceId: result.id,
      resourceName: `${employee.name} - ${course.title}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '报名成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建培训记录错误:', error);
    return NextResponse.json(
      { error: '创建培训记录失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新培训记录 ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.TRAINING_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateRecordSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '培训记录不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    if (existing.companyId !== user.companyId && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: '无权操作此记录' },
        { status: 403 }
      );
    }

    // 处理完成逻辑
    let finalUpdateData = { ...updateData };
    if (updateData.status === 'completed' && existing.status !== 'completed') {
      finalUpdateData = {
        ...finalUpdateData,
        completionDate: new Date().toISOString(),
        progress: 100,
      };
    }

    // 转换日期字段
    const dbUpdateData: any = {
      ...finalUpdateData,
      updatedAt: new Date(),
    };

    if (updateData.startDate) {
      dbUpdateData.startDate = new Date(updateData.startDate);
    }

    if (updateData.endDate) {
      dbUpdateData.endDate = new Date(updateData.endDate);
    }

    if (finalUpdateData.completionDate && typeof finalUpdateData.completionDate === 'string') {
      dbUpdateData.completionDate = new Date(finalUpdateData.completionDate);
    }

    const [result] = await db
      .update(trainingRecords)
      .set(dbUpdateData)
      .where(eq(trainingRecords.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'training_record',
      resourceId: result.id,
      resourceName: `${result.employeeName} - ${result.courseTitle}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '培训记录更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新培训记录错误:', error);
    return NextResponse.json(
      { error: '更新培训记录失败' },
      { status: 500 }
    );
  }
}

// ========== DELETE：删除培训记录 ==========

export async function DELETE(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.TRAINING_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少记录ID' },
        { status: 400 }
      );
    }

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '培训记录不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    if (existing.companyId !== user.companyId && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: '无权操作此记录' },
        { status: 403 }
      );
    }

    await db.delete(trainingRecords).where(eq(trainingRecords.id, id));

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'training_record',
      resourceId: id,
      resourceName: `${existing.employeeName} - ${existing.courseTitle}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '培训记录删除成功',
    });
  } catch (error) {
    console.error('删除培训记录错误:', error);
    return NextResponse.json(
      { error: '删除培训记录失败' },
      { status: 500 }
    );
  }
}
