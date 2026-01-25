import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { handoverChecklists, employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createChecklistSchema = z.object({
  resignationId: z.string().min(1, '离职申请ID不能为空'),
  employeeId: z.string().min(1, '员工ID不能为空'),
  receiverId: z.string().optional(),
  category: z.enum(['equipment', 'documents', 'accounts', 'projects', 'knowledge']),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
    handoverDate: z.string().optional(),
    receiver: z.string().optional(),
  })).min(1, '至少需要一个交接项目'),
  remarks: z.string().optional(),
});

const updateChecklistSchema = createChecklistSchema.partial().extend({
  id: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  completedAt: z.string().optional(),
});

// ========== GET：获取交接清单列表 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;

    const companyId = searchParams.get('companyId') || user.companyId;
    const resignationId = searchParams.get('resignationId');
    const employeeId = searchParams.get('employeeId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(handoverChecklists.companyId, companyId)];

    if (resignationId) {
      conditions.push(eq(handoverChecklists.resignationId, resignationId));
    }

    if (employeeId) {
      conditions.push(eq(handoverChecklists.employeeId, employeeId));
    }

    if (category) {
      conditions.push(eq(handoverChecklists.category, category));
    }

    if (status) {
      conditions.push(eq(handoverChecklists.status, status));
    }

    const offset = (page - 1) * limit;

    const checklists = await db
      .select({
        id: handoverChecklists.id,
        companyId: handoverChecklists.companyId,
        resignationId: handoverChecklists.resignationId,
        employeeId: handoverChecklists.employeeId,
        receiverId: handoverChecklists.receiverId,
        category: handoverChecklists.category,
        items: handoverChecklists.items,
        status: handoverChecklists.status,
        completedAt: handoverChecklists.completedAt,
        remarks: handoverChecklists.remarks,
        createdAt: handoverChecklists.createdAt,
        updatedAt: handoverChecklists.updatedAt,
        employeeName: employees.name,
      })
      .from(handoverChecklists)
      .leftJoin(employees, eq(handoverChecklists.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(handoverChecklists.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: checklists,
      pagination: {
        page,
        limit,
        total: checklists.length,
      },
    });
  } catch (error) {
    console.error('获取交接清单错误:', error);
    return NextResponse.json(
      { error: '获取交接清单失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建交接清单 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.RESIGNATION_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createChecklistSchema.parse(body);

    const [result] = await db.insert(handoverChecklists).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'handover_checklist',
      resourceId: result.id,
      resourceName: `交接清单 - ${result.category}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '交接清单创建成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建交接清单错误:', error);
    return NextResponse.json(
      { error: '创建交接清单失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新交接清单 ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.RESIGNATION_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateChecklistSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(handoverChecklists)
      .where(eq(handoverChecklists.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '交接清单不存在' },
        { status: 404 }
      );
    }

    // 处理完成逻辑
    let finalUpdateData = { ...updateData };
    if (updateData.status === 'completed' && existing.status !== 'completed') {
      finalUpdateData.completedAt = new Date().toISOString();
    }

    // 转换日期字段
    const dbUpdateData: any = {
      ...finalUpdateData,
      updatedAt: new Date(),
    };

    if (finalUpdateData.completedAt && typeof finalUpdateData.completedAt === 'string') {
      dbUpdateData.completedAt = new Date(finalUpdateData.completedAt);
    }

    const [result] = await db
      .update(handoverChecklists)
      .set(dbUpdateData)
      .where(eq(handoverChecklists.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'handover_checklist',
      resourceId: result.id,
      resourceName: `交接清单 ${id}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '交接清单更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新交接清单错误:', error);
    return NextResponse.json(
      { error: '更新交接清单失败' },
      { status: 500 }
    );
  }
}
