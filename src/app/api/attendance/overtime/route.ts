import { NextRequest, NextResponse } from 'next/server';
import {
  createOvertimeRequest,
  getOvertimeRequests,
  approveOvertimeRequest,
} from '@/storage/database/attendanceManager';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { attendanceWorkflowManager } from '@/storage/database/attendanceWorkflowManager';
import { z } from 'zod';

// 创建加班申请Schema
const createOvertimeRequestSchema = z.object({
  companyId: z.string(),
  employeeId: z.string(),
  departmentId: z.string().optional(),
  overtimeDate: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number().positive(), // 分钟
  reason: z.string().min(1, '加班原因不能为空'),
  overtimeType: z.enum(['workday', 'weekend', 'holiday']).default('workday'),
  payRate: z.number().default(150), // 百分比
});

/**
 * GET /api/attendance/overtime
 * 获取加班申请列表（包含工作流信息）
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const targetCompanyId = companyId || user.companyId;

    const overtimeRequests = await getOvertimeRequests({
      companyId: targetCompanyId,
      employeeId: employeeId || undefined,
      departmentId: departmentId || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      offset: (page - 1) * limit,
      limit,
    });

    // 获取每个加班申请的工作流实例
    const overtimeRequestsWithWorkflow = await Promise.all(
      overtimeRequests.map(async (request) => {
        const workflow = await attendanceWorkflowManager.getOvertimeWorkflow(request.id);
        return {
          ...request,
          workflowInstanceId: workflow?.id,
          workflowStatus: workflow?.status,
          currentStep: workflow?.steps ? (workflow.steps as any[])[(workflow as any).currentStepIndex] : undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: overtimeRequestsWithWorkflow,
      pagination: {
        page,
        limit,
        total: overtimeRequestsWithWorkflow.length,
      },
    });
  } catch (error) {
    console.error('获取加班申请错误:', error);
    return NextResponse.json(
      { error: '获取加班申请失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/overtime
 * 创建加班申请（并自动启动工作流）
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createOvertimeRequestSchema.parse({
      ...body,
      companyId: user.companyId,
      employeeId: user.userId,
    });

    const overtimeRequest = await createOvertimeRequest(validated);

    // 自动启动加班工作流
    const workflow = await attendanceWorkflowManager.createOvertimeWorkflow({
      companyId: user.companyId,
      overtimeRequestId: overtimeRequest.id,
      employeeId: user.userId,
      overtimeDate: validated.overtimeDate.toISOString(),
      startTime: validated.startTime.toISOString(),
      endTime: validated.endTime.toISOString(),
      hours: validated.duration / 60, // 分钟转小时
      reason: validated.reason,
      initiatorId: user.userId,
      initiatorName: user.name,
    });

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'overtime_request',
      resourceId: overtimeRequest.id,
      resourceName: `${user.name} 加班${validated.duration}分钟`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '加班申请提交成功',
      data: { ...overtimeRequest, workflowInstanceId: workflow.id },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建加班申请错误:', error);
    return NextResponse.json(
      { error: '创建加班申请失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/attendance/overtime
 * 审批加班申请
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.OVERTIME_APPROVE,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { id, approved, comment } = body;

    if (!id) {
      return NextResponse.json(
        { error: '加班申请ID不能为空' },
        { status: 400 }
      );
    }

    const overtimeRequest = await approveOvertimeRequest(
      id,
      user.userId,
      user.name,
      approved,
      comment
    );

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'approve',
      resourceType: 'overtime_request',
      resourceId: id,
      resourceName: `加班申请 ${approved ? '通过' : '拒绝'}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: `加班申请已${approved ? '通过' : '拒绝'}`,
      data: overtimeRequest,
    });
  } catch (error) {
    console.error('审批加班申请错误:', error);
    return NextResponse.json(
      { error: '审批加班申请失败' },
      { status: 500 }
    );
  }
}
