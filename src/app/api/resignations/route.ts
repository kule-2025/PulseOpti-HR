import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resignations, employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { resignationWorkflowManager } from '@/storage/database/resignationWorkflowManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createResignationSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  resignationType: z.enum(['voluntary', 'involuntary', 'retirement']),
  reason: z.string().optional(),
  reasonCategory: z.enum(['salary', 'career', 'family', 'health', 'company', 'other']).optional(),
  expectedLastDate: z.string(),
  remarks: z.string().optional(),
});

const updateResignationSchema = createResignationSchema.partial().extend({
  id: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled']).optional(),
  actualLastDate: z.string().optional(),
  approvedBy: z.string().optional(),
});

const startWorkflowSchema = z.object({
  resignationId: z.string(),
  customSteps: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['task', 'approval', 'condition']),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).optional(),
});

// ========== GET：获取离职申请列表 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;

    const companyId = searchParams.get('companyId') || user.companyId;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(resignations.companyId, companyId)];

    if (employeeId) {
      conditions.push(eq(resignations.employeeId, employeeId));
    }

    if (status) {
      conditions.push(eq(resignations.status, status));
    }

    const offset = (page - 1) * limit;

    const resignationData = await db
      .select({
        id: resignations.id,
        companyId: resignations.companyId,
        employeeId: resignations.employeeId,
        applicantId: resignations.applicantId,
        resignationType: resignations.resignationType,
        reason: resignations.reason,
        reasonCategory: resignations.reasonCategory,
        expectedLastDate: resignations.expectedLastDate,
        actualLastDate: resignations.actualLastDate,
        status: resignations.status,
        approvedBy: resignations.approvedBy,
        approvedAt: resignations.approvedAt,
        remarks: resignations.remarks,
        metadata: resignations.metadata,
        createdAt: resignations.createdAt,
        updatedAt: resignations.updatedAt,
        employeeName: employees.name,
        employeeDepartmentId: employees.departmentId,
      })
      .from(resignations)
      .leftJoin(employees, eq(resignations.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(resignations.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取每个离职申请的工作流实例
    const resignationDataWithWorkflow = await Promise.all(
      resignationData.map(async (resignation) => {
        const workflow = await resignationWorkflowManager.getResignationWorkflow(resignation.id);
        return {
          ...resignation,
          workflowInstanceId: workflow?.id,
          workflowStatus: workflow?.status,
          currentStep: workflow?.steps ? (workflow.steps as any[])[(workflow as any).currentStepIndex] : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: resignationDataWithWorkflow,
      pagination: {
        page,
        limit,
        total: resignationDataWithWorkflow.length,
      },
    });
  } catch (error) {
    console.error('获取离职申请错误:', error);
    return NextResponse.json(
      { error: '获取离职申请失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建离职申请 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createResignationSchema.parse(body);

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

    const [result] = await db.insert(resignations).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      applicantId: user.userId,
      expectedLastDate: new Date(validated.expectedLastDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'resignation',
      resourceId: result.id,
      resourceName: `${employee.name} - 离职申请`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '离职申请提交成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建离职申请错误:', error);
    return NextResponse.json(
      { error: '创建离职申请失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新离职申请（支持工作流） ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const action = body.action;

    // 启动离职工作流
    if (action === 'start_workflow') {
      const validated = startWorkflowSchema.parse(body);

      const workflow = await resignationWorkflowManager.createResignationWorkflow({
        companyId: user.companyId,
        resignationId: validated.resignationId,
        initiatorId: user.userId,
        initiatorName: user.name,
        customSteps: validated.customSteps,
      });

      // 记录审计日志
      await auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.userId,
        userName: user.name,
        action: 'start_workflow',
        resourceType: 'resignation_workflow',
        resourceId: workflow.id,
        resourceName: workflow.name,
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '离职工作流启动成功',
        data: workflow,
      });
    }

    // 常规更新逻辑
    const validated = updateResignationSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(resignations)
      .where(eq(resignations.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '离职申请不存在' },
        { status: 404 }
      );
    }

    // 权限检查：员工只能更新自己的申请，管理者可以审批
    const isOwnApplication = existing.applicantId === user.userId;
    const isManager = user.role === 'admin' || user.role === 'manager';

    if (!isOwnApplication && !isManager) {
      return NextResponse.json(
        { error: '无权操作此申请' },
        { status: 403 }
      );
    }

    // 处理审批逻辑
    let finalUpdateData = { ...updateData };
    const approvedAt = (updateData.status === 'approved' && isManager && existing.status === 'pending')
      ? new Date().toISOString()
      : undefined;
    const approvedBy = (updateData.status === 'approved' && isManager && existing.status === 'pending')
      ? user.userId
      : undefined;

    const [result] = await db
      .update(resignations)
      .set({
        ...finalUpdateData,
        ...(approvedAt && { approvedAt }),
        ...(approvedBy && { approvedBy }),
        expectedLastDate: updateData.expectedLastDate ? new Date(updateData.expectedLastDate) : existing.expectedLastDate,
        actualLastDate: updateData.actualLastDate ? new Date(updateData.actualLastDate) : existing.actualLastDate,
        updatedAt: new Date(),
      })
      .where(eq(resignations.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'resignation',
      resourceId: result.id,
      resourceName: `离职申请 ${id}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '离职申请更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新离职申请错误:', error);
    return NextResponse.json(
      { error: '更新离职申请失败' },
      { status: 500 }
    );
  }
}
