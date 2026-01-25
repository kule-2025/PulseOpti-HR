import { NextRequest, NextResponse } from 'next/server';
import { getAbnormalAttendanceRecords } from '@/storage/database/attendanceManager';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/attendance/abnormal
 * 获取考勤异常记录
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const records = await getAbnormalAttendanceRecords(companyId, dateFrom, dateTo);

    // 分页处理
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + limit);

    // 格式化异常记录
    const formattedRecords = paginatedRecords.map(record => {
      const abnormalType = record.status === 'late' ? '迟到' :
                         record.status === 'early_leave' ? '早退' :
                         record.status === 'absent' ? '未打卡' :
                         record.status === 'overtime' ? '加班' : '其他';

      const clockInTime = record.clockInTime instanceof Date ? record.clockInTime : new Date(record.clockInTime as any);
      const clockOutTime = record.clockOutTime instanceof Date ? record.clockOutTime : new Date(record.clockOutTime as any);
      const recordDate = record.recordDate instanceof Date ? record.recordDate : new Date(record.recordDate as any);

      const lateMinutes = record.status === 'late' && record.clockInTime ?
                          Math.floor((clockInTime.getTime() - recordDate.setHours(9, 0, 0)) / 60000) : 0;

      const earlyLeaveMinutes = record.status === 'early_leave' && record.clockOutTime ?
                               Math.floor((recordDate.setHours(18, 0, 0) - clockOutTime.getTime()) / 60000) : 0;

      const metadata = record.metadata && typeof record.metadata === 'object' ? record.metadata : {};

      return {
        id: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName || '未知',
        type: abnormalType,
        date: recordDate.toISOString().split('T')[0],
        minutes: lateMinutes || earlyLeaveMinutes || 0,
        reason: (metadata as any).reason || '-',
        status: '待处理',
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedRecords,
      pagination: {
        page,
        limit,
        total: records.length,
      },
    });
  } catch (error) {
    console.error('获取异常记录错误:', error);
    return NextResponse.json(
      { error: '获取异常记录失败' },
      { status: 500 }
    );
  }
}
