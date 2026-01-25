import { NextRequest, NextResponse } from 'next/server';
import {
  createAttendanceRecord,
  getAttendanceRecords,
} from '@/storage/database/attendanceManager';
import { requireAuth } from '@/lib/auth/middleware';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 打卡Schema
const clockInSchema = z.object({
  companyId: z.string(),
  employeeId: z.string(),
  recordDate: z.coerce.date(),
  clockType: z.enum(['in', 'out']), // 上班打卡或下班打卡
  location: z.string().optional(),
  deviceInfo: z.string().optional(),
});

/**
 * GET /api/attendance/clock-in
 * 获取打卡记录
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const targetCompanyId = companyId || user.companyId;

    const records = await getAttendanceRecords({
      companyId: targetCompanyId,
      employeeId: employeeId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status || undefined,
      offset: (page - 1) * limit,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total: records.length,
      },
    });
  } catch (error) {
    console.error('获取打卡记录错误:', error);
    return NextResponse.json(
      { error: '获取打卡记录失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/clock-in
 * 员工打卡
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = clockInSchema.parse({
      ...body,
      companyId: user.companyId,
      employeeId: user.userId,
    });

    // 检查是否已经打卡
    const existingRecords = await getAttendanceRecords({
      companyId: user.companyId,
      employeeId: user.userId,
      dateFrom: validated.recordDate.toISOString().split('T')[0],
      dateTo: validated.recordDate.toISOString().split('T')[0],
      limit: 1,
    });

    let attendanceRecord;

    if (existingRecords.length > 0) {
      // 已有记录，更新下班打卡时间
      const record = existingRecords[0];

      if (validated.clockType === 'out' && !record.clockOutTime) {
        // 下班打卡
        const clockOutTime = new Date();
        const clockInTime = record.clockInTime ? new Date(record.clockInTime instanceof Date ? record.clockInTime.getTime() : record.clockInTime) : clockOutTime;
        const workHours = Math.floor(
          (clockOutTime.getTime() - clockInTime.getTime()) /
            1000 / 60
        );

        attendanceRecord = await createAttendanceRecord({
          companyId: user.companyId,
          employeeId: user.userId,
          recordDate: validated.recordDate,
          clockInTime: record.clockInTime,
          clockOutTime: clockOutTime,
          workHours,
          status: 'normal',
          location: validated.location,
          deviceInfo: validated.deviceInfo,
        });
      } else {
        return NextResponse.json(
          { error: '已经打过卡' },
          { status: 400 }
        );
      }
    } else {
      // 新记录，创建上班打卡
      if (validated.clockType === 'in') {
        attendanceRecord = await createAttendanceRecord({
          companyId: user.companyId,
          employeeId: user.userId,
          recordDate: validated.recordDate,
          clockInTime: new Date(),
          workHours: 0,
          status: 'normal',
          location: validated.location,
          deviceInfo: validated.deviceInfo,
        });
      } else {
        return NextResponse.json(
          { error: '请先进行上班打卡' },
          { status: 400 }
        );
      }
    }

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'attendance_record',
      resourceId: attendanceRecord.id,
      resourceName: `${user.name} 打卡`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: validated.clockType === 'in' ? '上班打卡成功' : '下班打卡成功',
      data: attendanceRecord,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('打卡错误:', error);
    return NextResponse.json(
      { error: '打卡失败' },
      { status: 500 }
    );
  }
}
