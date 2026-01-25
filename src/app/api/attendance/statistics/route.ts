import { NextRequest, NextResponse } from 'next/server';
import {
  getAttendanceStatistics,
  getLeaveStatistics,
  getOvertimeStatistics,
  getScheduleStatistics,
} from '@/storage/database/attendanceManager';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/attendance/statistics
 * 获取考勤统计数据
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || user.companyId;
    const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().split('T')[0];
    const dateTo = searchParams.get('dateTo') || new Date().toISOString().split('T')[0];
    const type = searchParams.get('type') || 'all'; // attendance, leave, overtime, schedule, all

    const data: any = {};

    if (type === 'attendance' || type === 'all') {
      data.attendance = await getAttendanceStatistics(companyId, dateFrom, dateTo);
    }

    if (type === 'leave' || type === 'all') {
      data.leave = await getLeaveStatistics(companyId, dateFrom, dateTo);
    }

    if (type === 'overtime' || type === 'all') {
      data.overtime = await getOvertimeStatistics(companyId, dateFrom, dateTo);
    }

    if (type === 'schedule' || type === 'all') {
      data.schedule = await getScheduleStatistics(companyId, dateFrom, dateTo);
    }

    return NextResponse.json({
      success: true,
      data,
      period: {
        dateFrom,
        dateTo,
      },
    });
  } catch (error) {
    console.error('获取考勤统计错误:', error);
    return NextResponse.json(
      { error: '获取考勤统计失败' },
      { status: 500 }
    );
  }
}
