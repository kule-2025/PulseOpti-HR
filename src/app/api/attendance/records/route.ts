import { NextRequest, NextResponse } from 'next/server';

// 模拟考勤记录数据
const mockRecords = Array.from({ length: 80 }, (_, i) => {
  const statuses = ['正常', '迟到', '早退', '旷工', '请假'];
  const status = statuses[i % statuses.length];
  const timeIn = status === '迟到' ? '09:15' : status === '旷工' ? '--:--' : '08:55';
  const timeOut = status === '早退' ? '17:30' : status === '旷工' ? '--:--' : '18:05';

  return {
    id: `record-${i + 1}`,
    employeeId: `emp-${i + 1}`,
    employeeName: `员工${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
    date: `2024-03-${String((i % 30) + 1).padStart(2, '0')}`,
    timeIn,
    timeOut,
    status,
    workHours: status === '旷工' ? 0 : 8.5 - (status === '迟到' || status === '早退' ? 0.5 : 0),
    avatar: null,
  };
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 筛选数据
    let filteredRecords = mockRecords;

    if (status && status !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.status === status);
    }

    if (department) {
      filteredRecords = filteredRecords.filter(r => r.department === department);
    }

    if (date) {
      filteredRecords = filteredRecords.filter(r => r.date.startsWith(date));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecords = filteredRecords.filter(
        r =>
          r.employeeName.toLowerCase().includes(searchLower) ||
          r.department.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedRecords,
      total: filteredRecords.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRecords.length / limit),
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { success: false, error: '获取考勤记录失败' },
      { status: 500 }
    );
  }
}
