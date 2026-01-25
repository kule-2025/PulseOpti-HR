import { NextRequest, NextResponse } from 'next/server';
import {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
} from '@/storage/database/attendanceManager';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建排班Schema
const createScheduleSchema = z.object({
  companyId: z.string(),
  employeeId: z.string(),
  scheduleDate: z.coerce.date(),
  shiftType: z.string().min(1, '班次类型不能为空'),
  shiftName: z.string().min(1, '班次名称不能为空'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  breakTime: z.number().default(0),
  isWorkingDay: z.boolean().default(true),
  notes: z.string().optional(),
});

/**
 * GET /api/attendance/scheduling
 * 获取排班列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const targetCompanyId = companyId || user.companyId;

    const schedules = await getSchedules({
      companyId: targetCompanyId,
      employeeId: employeeId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      offset: (page - 1) * limit,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: {
        page,
        limit,
        total: schedules.length,
      },
    });
  } catch (error) {
    console.error('获取排班错误:', error);
    return NextResponse.json(
      { error: '获取排班失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/scheduling
 * 创建排班
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.SCHEDULE_MANAGE,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createScheduleSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    const schedule = await createSchedule(validated);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'schedule',
      resourceId: schedule.id,
      resourceName: `排班 ${validated.shiftName}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '创建排班成功',
      data: schedule,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建排班错误:', error);
    return NextResponse.json(
      { error: '创建排班失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/attendance/scheduling
 * 更新排班
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.SCHEDULE_MANAGE,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: '排班ID不能为空' },
        { status: 400 }
      );
    }

    const schedule = await updateSchedule(id, updateData);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'schedule',
      resourceId: id,
      resourceName: '排班',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '更新排班成功',
      data: schedule,
    });
  } catch (error) {
    console.error('更新排班错误:', error);
    return NextResponse.json(
      { error: '更新排班失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/attendance/scheduling
 * 删除排班
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.SCHEDULE_MANAGE,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '排班ID不能为空' },
        { status: 400 }
      );
    }

    await deleteSchedule(id);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'schedule',
      resourceId: id,
      resourceName: '排班',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '删除排班成功',
    });
  } catch (error) {
    console.error('删除排班错误:', error);
    return NextResponse.json(
      { error: '删除排班失败' },
      { status: 500 }
    );
  }
}
