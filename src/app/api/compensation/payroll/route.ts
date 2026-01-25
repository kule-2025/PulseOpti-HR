import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { payrollRecords, salaryStructures, socialInsuranceRecords, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { salaryWorkflowManager } from '@/storage/database/salaryWorkflowManager';
import { z } from 'zod';

// ========== 薪资计算 ==========

const calculatePayrollSchema = z.object({
  companyId: z.string(),
  employeeId: z.string(),
  period: z.string(),
  salaryStructureId: z.string().optional(),
  baseSalary: z.number().optional(),
  workDays: z.number().default(0),
  actualWorkDays: z.number().default(0),
  paidLeaveDays: z.number().default(0),
  unpaidLeaveDays: z.number().default(0),
  overtimeHours: z.number().default(0),
  bonus: z.number().default(0),
  allowance: z.number().default(0),
  deduction: z.number().default(0),
});

const startWorkflowSchema = z.object({
  payrollId: z.string(),
  customSteps: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['task', 'approval', 'condition']),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).optional(),
});

/**
 * POST /api/compensation/payroll/calculate
 * 计算薪资
 */
export async function calculatePayroll(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.PAYROLL_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = calculatePayrollSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    // 简单薪资计算逻辑（实际应该更复杂）
    const dailyRate = Math.floor((validated.baseSalary || 1000000) / 21.75); // 日薪
    const hourlyRate = Math.floor(dailyRate / 8); // 时薪

    const actualPayDays = validated.actualWorkDays + validated.paidLeaveDays - validated.unpaidLeaveDays;
    const basePay = Math.floor(dailyRate * actualPayDays);
    const overtimePay = Math.floor(hourlyRate * 1.5 * validated.overtimeHours); // 加班费1.5倍

    const grossPay = basePay + validated.bonus + validated.allowance + overtimePay;
    const socialInsurance = Math.floor(grossPay * 0.105); // 社保10.5%
    const tax = Math.floor(Math.max(0, grossPay - socialInsurance - 500000) * 0.03); // 个税（简化计算）
    const netPay = grossPay - socialInsurance - tax - validated.deduction;

    const [result] = await db.insert(payrollRecords).values({
      ...validated,
      id: crypto.randomUUID(),
      baseSalary: validated.baseSalary || 1000000,
      overtimePay,
      socialInsurance,
      tax,
      grossPay,
      netPay,
      status: 'calculated',
      calculatedAt: new Date(),
      createdAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'payroll',
      resourceId: result.id,
      resourceName: `薪资 ${validated.period}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '薪资计算成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('薪资计算错误:', error);
    return NextResponse.json(
      { error: '薪资计算失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compensation/payroll
 * 获取薪资记录列表（包含工作流信息）
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || user.companyId;
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(payrollRecords.companyId, companyId)];

    if (employeeId) {
      conditions.push(eq(payrollRecords.employeeId, employeeId));
    }

    if (period) {
      conditions.push(eq(payrollRecords.period, period));
    }

    if (status) {
      conditions.push(eq(payrollRecords.status, status));
    }

    const offset = (page - 1) * limit;

    const payrollData = await db
      .select({
        id: payrollRecords.id,
        companyId: payrollRecords.companyId,
        employeeId: payrollRecords.employeeId,
        period: payrollRecords.period,
        baseSalary: payrollRecords.baseSalary,
        overtimePay: payrollRecords.overtimePay,
        bonus: payrollRecords.bonus,
        allowance: payrollRecords.allowance,
        deduction: payrollRecords.deduction,
        socialInsurance: payrollRecords.socialInsurance,
        tax: payrollRecords.tax,
        grossPay: payrollRecords.grossPay,
        netPay: payrollRecords.netPay,
        status: payrollRecords.status,
        calculatedAt: payrollRecords.calculatedAt,
        paidAt: payrollRecords.paidAt,
        createdAt: payrollRecords.createdAt,
        updatedAt: payrollRecords.updatedAt,
        employeeName: employees.name,
        employeeDepartmentId: employees.departmentId,
      })
      .from(payrollRecords)
      .leftJoin(employees, eq(payrollRecords.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(payrollRecords.period))
      .limit(limit)
      .offset(offset);

    // 获取每个薪资记录的工作流实例
    const payrollDataWithWorkflow = await Promise.all(
      payrollData.map(async (payroll) => {
        const workflow = await salaryWorkflowManager.getPayrollWorkflow(payroll.id);
        return {
          ...payroll,
          workflowInstanceId: workflow?.id,
          workflowStatus: workflow?.status,
          currentStep: workflow?.steps ? (workflow.steps as any[])[(workflow as any).currentStepIndex] : undefined,
        };
      })
    );

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(payrollRecords)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: payrollDataWithWorkflow,
      pagination: {
        page,
        limit,
        total: Number(count),
      },
    });
  } catch (error) {
    console.error('获取薪资记录错误:', error);
    return NextResponse.json(
      { error: '获取薪资记录失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/compensation/payroll/[id]/pay
 * 发放薪资
 */
export async function payPayroll(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.PAYROLL_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { paymentMethod, paymentAccount } = body;

    const [result] = await db
      .update(payrollRecords)
      .set({
        status: 'paid',
        paymentMethod,
        paymentAccount,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payrollRecords.id, params.id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'pay',
      resourceType: 'payroll',
      resourceId: params.id,
      resourceName: '发放薪资',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '薪资发放成功',
      data: result,
    });
  } catch (error) {
    console.error('发放薪资错误:', error);
    return NextResponse.json(
      { error: '发放薪资失败' },
      { status: 500 }
    );
  }
}
