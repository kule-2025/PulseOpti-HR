import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { exitInterviews, employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createInterviewSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  resignationId: z.string().optional(),
  interviewerId: z.string().min(1, '访谈人ID不能为空'),
  interviewDate: z.string(),
  interviewMethod: z.enum(['face_to_face', 'phone', 'online']),
  overallSatisfaction: z.number().min(1).max(5).optional(),
  workingEnvironment: z.number().min(1).max(5).optional(),
  salary: z.number().min(1).max(5).optional(),
  management: z.number().min(1).max(5).optional(),
  careerDevelopment: z.number().min(1).max(5).optional(),
  workLifeBalance: z.number().min(1).max(5).optional(),
  reasonForLeaving: z.string().optional(),
  suggestions: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  highlights: z.string().optional(),
  improvements: z.string().optional(),
  feedback: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

const updateInterviewSchema = createInterviewSchema.partial().extend({
  id: z.string(),
});

// ========== GET：获取离职访谈列表 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;

    const companyId = searchParams.get('companyId') || user.companyId;
    const employeeId = searchParams.get('employeeId');
    const resignationId = searchParams.get('resignationId');
    const interviewerId = searchParams.get('interviewerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(exitInterviews.companyId, companyId)];

    if (employeeId) {
      conditions.push(eq(exitInterviews.employeeId, employeeId));
    }

    if (resignationId) {
      conditions.push(eq(exitInterviews.resignationId, resignationId));
    }

    if (interviewerId) {
      conditions.push(eq(exitInterviews.interviewerId, interviewerId));
    }

    const offset = (page - 1) * limit;

    const interviews = await db
      .select({
        id: exitInterviews.id,
        companyId: exitInterviews.companyId,
        employeeId: exitInterviews.employeeId,
        resignationId: exitInterviews.resignationId,
        interviewerId: exitInterviews.interviewerId,
        interviewDate: exitInterviews.interviewDate,
        interviewMethod: exitInterviews.interviewMethod,
        overallSatisfaction: exitInterviews.overallSatisfaction,
        workingEnvironment: exitInterviews.workingEnvironment,
        salary: exitInterviews.salary,
        management: exitInterviews.management,
        careerDevelopment: exitInterviews.careerDevelopment,
        workLifeBalance: exitInterviews.workLifeBalance,
        reasonForLeaving: exitInterviews.reasonForLeaving,
        suggestions: exitInterviews.suggestions,
        wouldRecommend: exitInterviews.wouldRecommend,
        highlights: exitInterviews.highlights,
        improvements: exitInterviews.improvements,
        feedback: exitInterviews.feedback,
        isAnonymous: exitInterviews.isAnonymous,
        createdAt: exitInterviews.createdAt,
        updatedAt: exitInterviews.updatedAt,
        employeeName: employees.name,
      })
      .from(exitInterviews)
      .leftJoin(employees, eq(exitInterviews.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(exitInterviews.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: interviews,
      pagination: {
        page,
        limit,
        total: interviews.length,
      },
    });
  } catch (error) {
    console.error('获取离职访谈错误:', error);
    return NextResponse.json(
      { error: '获取离职访谈失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建离职访谈 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.RESIGNATION_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createInterviewSchema.parse(body);

    // 检查员工是否存在
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

    const [result] = await db.insert(exitInterviews).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      interviewDate: new Date(validated.interviewDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'exit_interview',
      resourceId: result.id,
      resourceName: `离职访谈 - ${employee.name}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '离职访谈创建成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建离职访谈错误:', error);
    return NextResponse.json(
      { error: '创建离职访谈失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新离职访谈 ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateInterviewSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(exitInterviews)
      .where(eq(exitInterviews.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '离职访谈不存在' },
        { status: 404 }
      );
    }

    const [result] = await db
      .update(exitInterviews)
      .set({
        ...updateData,
        interviewDate: updateData.interviewDate ? new Date(updateData.interviewDate) : existing.interviewDate,
        updatedAt: new Date(),
      })
      .where(eq(exitInterviews.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'exit_interview',
      resourceId: result.id,
      resourceName: `离职访谈 ${id}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '离职访谈更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新离职访谈错误:', error);
    return NextResponse.json(
      { error: '更新离职访谈失败' },
      { status: 500 }
    );
  }
}
