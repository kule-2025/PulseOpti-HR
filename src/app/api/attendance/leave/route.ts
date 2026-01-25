import { NextRequest, NextResponse } from 'next/server';
import {
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
} from '@/storage/database/attendanceManager';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { attendanceWorkflowManager } from '@/storage/database/attendanceWorkflowManager';
import { z } from 'zod';

// 创建请假申请Schema
const createLeaveRequestSchema = z.object({
  companyId: z.string(),
  employeeId: z.string(),
  departmentId: z.string().optional(),
  leaveType: z.enum(['annual', 'sick', 'personal', 'marriage', 'bereavement', 'maternity', 'paternity']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  days: z.number().positive(),
  reason: z.string().min(1, '请假原因不能为空'),
  attachments: z.array(z.any()).optional(),
});

const startWorkflowSchema = z.object({
  leaveRequestId: z.string(),
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
 * GET /api/attendance/leave
 * 获取请假申请列表（包含工作流信息）
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

    const leaveRequests = await getLeaveRequests({
      companyId: targetCompanyId,
      employeeId: employeeId || undefined,
      departmentId: departmentId || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      offset: (page - 1) * limit,
      limit,
    });

    // 获取每个请假申请的工作流实例
    const leaveRequestsWithWorkflow = await Promise.all(
      leaveRequests.map(async (request) => {
        const workflow = await attendanceWorkflowManager.getLeaveWorkflow(request.id);
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
      data: leaveRequestsWithWorkflow,
      pagination: {
        page,
        limit,
        total: leaveRequestsWithWorkflow.length,
      },
    });
  } catch (error) {
    console.error('获取请假申请错误:', error);
    return NextResponse.json(
      { error: '获取请假申请失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/leave
 * 创建请假申请（并自动启动工作流）
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createLeaveRequestSchema.parse({
      ...body,
      companyId: user.companyId,
      employeeId: user.userId,
    });

    const leaveRequest = await createLeaveRequest(validated);

    // 自动启动请假工作流
    const workflow = await attendanceWorkflowManager.createLeaveWorkflow({
      companyId: user.companyId,
      leaveRequestId: leaveRequest.id,
      employeeId: user.userId,
      leaveType: validated.leaveType,
      startDate: validated.startDate.toISOString(),
      endDate: validated.endDate.toISOString(),
      days: validated.days,
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
      resourceType: 'leave_request',
      resourceId: leaveRequest.id,
      resourceName: `${user.name} 请假${validated.days}天`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '请假申请提交成功',
      data: { ...leaveRequest, workflowInstanceId: workflow.id },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建请假申请错误:', error);
    return NextResponse.json(
      { error: '创建请假申请失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/attendance/leave
 * 审批请假申请
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.LEAVE_APPROVE,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { id, approved, comment } = body;

    if (!id) {
      return NextResponse.json(
        { error: '请假申请ID不能为空' },
        { status: 400 }
      );
    }

    const leaveRequest = await approveLeaveRequest(
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
      resourceType: 'leave_request',
      resourceId: id,
      resourceName: `请假申请 ${approved ? '通过' : '拒绝'}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: `请假申请已${approved ? '通过' : '拒绝'}`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error('审批请假申请错误:', error);
    return NextResponse.json(
      { error: '审批请假申请失败' },
      { status: 500 }
    );
  }
}
