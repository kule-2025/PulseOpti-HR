import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employmentContracts, employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// ========== 验证 Schema ==========

const createContractSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  contractNumber: z.string().optional(),
  contractType: z.enum(['fulltime', 'parttime', 'contract', 'intern']),
  startDate: z.string(),
  endDate: z.string().optional(),
  probationStartDate: z.string().optional(),
  probationEndDate: z.string().optional(),
  workLocation: z.string().optional(),
  workHours: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().min(0).optional(),
  salaryStructure: z.string().optional(),
  benefits: z.string().optional(),
  contractUrl: z.string().optional(),
  remarks: z.string().optional(),
});

const updateContractSchema = createContractSchema.partial().extend({
  id: z.string(),
  status: z.enum(['draft', 'active', 'terminated', 'renewed', 'expired']).optional(),
  isProbationPassed: z.boolean().optional(),
  probationPassedDate: z.string().optional(),
  terminationDate: z.string().optional(),
  terminationReason: z.string().optional(),
  signedAt: z.string().optional(),
  signedByEmployee: z.string().optional(),
  signedByCompany: z.string().optional(),
});

// ========== GET：获取劳动合同列表 ==========

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
    const contractType = searchParams.get('contractType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(employmentContracts.companyId, companyId)];

    if (employeeId) {
      conditions.push(eq(employmentContracts.employeeId, employeeId));
    }

    if (status) {
      conditions.push(eq(employmentContracts.status, status));
    }

    if (contractType) {
      conditions.push(eq(employmentContracts.contractType, contractType));
    }

    const offset = (page - 1) * limit;

    const contracts = await db
      .select({
        id: employmentContracts.id,
        companyId: employmentContracts.companyId,
        employeeId: employmentContracts.employeeId,
        contractNumber: employmentContracts.contractNumber,
        contractType: employmentContracts.contractType,
        startDate: employmentContracts.startDate,
        endDate: employmentContracts.endDate,
        probationStartDate: employmentContracts.probationStartDate,
        probationEndDate: employmentContracts.probationEndDate,
        workLocation: employmentContracts.workLocation,
        workHours: employmentContracts.workHours,
        position: employmentContracts.position,
        department: employmentContracts.department,
        salary: employmentContracts.salary,
        salaryStructure: employmentContracts.salaryStructure,
        benefits: employmentContracts.benefits,
        status: employmentContracts.status,
        isProbationPassed: employmentContracts.isProbationPassed,
        probationPassedDate: employmentContracts.probationPassedDate,
        terminationDate: employmentContracts.terminationDate,
        terminationReason: employmentContracts.terminationReason,
        contractUrl: employmentContracts.contractUrl,
        signedAt: employmentContracts.signedAt,
        signedByEmployee: employmentContracts.signedByEmployee,
        signedByCompany: employmentContracts.signedByCompany,
        remarks: employmentContracts.remarks,
        createdAt: employmentContracts.createdAt,
        updatedAt: employmentContracts.updatedAt,
        employeeName: employees.name,
      })
      .from(employmentContracts)
      .leftJoin(employees, eq(employmentContracts.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(employmentContracts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: contracts,
      pagination: {
        page,
        limit,
        total: contracts.length,
      },
    });
  } catch (error) {
    console.error('获取劳动合同错误:', error);
    return NextResponse.json(
      { error: '获取劳动合同失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建劳动合同 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.CONTRACT_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createContractSchema.parse(body);

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

    // 生成合同编号
    const contractNumber = validated.contractNumber || `CT${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;

    const [result] = await db.insert(employmentContracts).values({
      ...validated,
      id: crypto.randomUUID(),
      companyId: user.companyId,
      contractNumber,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      probationStartDate: validated.probationStartDate ? new Date(validated.probationStartDate) : null,
      probationEndDate: validated.probationEndDate ? new Date(validated.probationEndDate) : null,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'employment_contract',
      resourceId: result.id,
      resourceName: `劳动合同 - ${contractNumber}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '劳动合同创建成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建劳动合同错误:', error);
    return NextResponse.json(
      { error: '创建劳动合同失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新劳动合同 ==========

export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.CONTRACT_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateContractSchema.parse(body);
    const { id, ...updateData } = validated;

    // 检查记录是否存在
    const [existing] = await db
      .select()
      .from(employmentContracts)
      .where(eq(employmentContracts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: '劳动合同不存在' },
        { status: 404 }
      );
    }

    // 处理试用期通过逻辑
    let finalUpdateData = { ...updateData };
    if (updateData.isProbationPassed && !existing.isProbationPassed) {
      finalUpdateData.probationPassedDate = new Date().toISOString();
    }

    const updateValues: any = {
      ...finalUpdateData,
      startDate: updateData.startDate ? new Date(updateData.startDate as string) : existing.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate as string) : existing.endDate,
      probationStartDate: updateData.probationStartDate ? new Date(updateData.probationStartDate as string) : existing.probationStartDate,
      probationEndDate: updateData.probationEndDate ? new Date(updateData.probationEndDate as string) : existing.probationEndDate,
      terminationDate: updateData.terminationDate ? new Date(updateData.terminationDate as string) : existing.terminationDate,
      signedAt: updateData.signedAt ? new Date(updateData.signedAt as string) : existing.signedAt,
      updatedAt: new Date(),
    };

    const [result] = await db
      .update(employmentContracts)
      .set(updateValues)
      .where(eq(employmentContracts.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'employment_contract',
      resourceId: result.id,
      resourceName: `劳动合同 ${result.contractNumber}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '劳动合同更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新劳动合同错误:', error);
    return NextResponse.json(
      { error: '更新劳动合同失败' },
      { status: 500 }
    );
  }
}
