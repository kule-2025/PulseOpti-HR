import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { trainingCourses, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createCourseSchema = z.object({
  title: z.string().min(1, '课程标题不能为空'),
  description: z.string().optional(),
  type: z.enum(['online', 'offline', 'workshop', 'mentorship', 'webinar', 'e_learning', 'self_paced', 'blended']),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  duration: z.number().min(0, '培训时长不能为负数'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  provider: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default('CNY'),
  maxParticipants: z.number().optional(),
  location: z.string().optional(),
  instructorId: z.string().optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
});

const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string(),
});

// ========== GET：获取课程列表 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;

    const companyId = searchParams.get('companyId') || user.companyId;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const keyword = searchParams.get('keyword');
    const isActive = searchParams.get('isActive');
    const isPublic = searchParams.get('isPublic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [
      sql`(${trainingCourses.companyId} = ${companyId} OR ${trainingCourses.isPublic} = true)`,
    ];

    if (type) {
      conditions.push(eq(trainingCourses.type, type));
    }

    if (category) {
      conditions.push(eq(trainingCourses.category, category));
    }

    if (difficulty) {
      conditions.push(eq(trainingCourses.difficulty, difficulty));
    }

    if (keyword) {
      conditions.push(
        sql`(
          ${trainingCourses.title} ILIKE ${'%' + keyword + '%'} OR
          ${trainingCourses.description} ILIKE ${'%' + keyword + '%'}
        )`
      );
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(trainingCourses.isActive, isActive === 'true'));
    }

    if (isPublic !== null && isPublic !== undefined) {
      conditions.push(eq(trainingCourses.isPublic, isPublic === 'true'));
    }

    const offset = (page - 1) * limit;

    const courses = await db
      .select()
      .from(trainingCourses)
      .where(and(...conditions))
      .orderBy(desc(trainingCourses.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingCourses)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total: Number(count),
      },
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    return NextResponse.json(
      { error: '获取课程列表失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建课程 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.TRAINING_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createCourseSchema.parse(body);

    const [result] = await db.insert(trainingCourses).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      createdBy: user.userId,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'training_course',
      resourceId: result.id,
      resourceName: result.title,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '课程创建成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建课程错误:', error);
    return NextResponse.json(
      { error: '创建课程失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新课程 ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.TRAINING_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateCourseSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查课程是否存在
    const [existing] = await db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    if (existing.companyId !== user.companyId && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: '无权操作此课程' },
        { status: 403 }
      );
    }

    const [result] = await db
      .update(trainingCourses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(trainingCourses.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'training_course',
      resourceId: result.id,
      resourceName: result.title,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '课程更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新课程错误:', error);
    return NextResponse.json(
      { error: '更新课程失败' },
      { status: 500 }
    );
  }
}

// ========== DELETE：删除课程 ==========

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
        { error: '缺少课程ID' },
        { status: 400 }
      );
    }

    // 检查课程是否存在
    const [existing] = await db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    if (existing.companyId !== user.companyId && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: '无权操作此课程' },
        { status: 403 }
      );
    }

    await db.delete(trainingCourses).where(eq(trainingCourses.id, id));

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'training_course',
      resourceId: id,
      resourceName: existing.title,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '课程删除成功',
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    return NextResponse.json(
      { error: '删除课程失败' },
      { status: 500 }
    );
  }
}
