import { NextRequest, NextResponse } from 'next/server';

// 模拟请假数据
const mockLeaveRequests = Array.from({ length: 20 }, (_, i) => {
  const types = ['年假', '病假', '事假', '调休'];
  const statuses = ['待审批', '已通过', '已拒绝'];
  const status = statuses[i % statuses.length];

  return {
    id: `leave-${i + 1}`,
    employeeId: `emp-${i + 1}`,
    employeeName: `员工${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
    type: types[i % types.length],
    startDate: `2024-03-${String((i % 20) + 1).padStart(2, '0')}`,
    endDate: `2024-03-${String(((i % 20) + 1)).padStart(2, '0')}`,
    days: 1,
    reason: '个人原因',
    status,
    applyDate: `2024-03-${String(i % 25 + 1).padStart(2, '0')}`,
    approver: status !== '待审批' ? '张经理' : null,
    approveDate: status !== '待审批' ? `2024-03-${String(i % 25 + 2).padStart(2, '0')}` : null,
    avatar: null,
  };
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 筛选数据
    let filteredRequests = mockLeaveRequests;

    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(r => r.status === status);
    }

    if (type) {
      filteredRequests = filteredRequests.filter(r => r.type === type);
    }

    if (department) {
      filteredRequests = filteredRequests.filter(r => r.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRequests = filteredRequests.filter(
        r =>
          r.employeeName.toLowerCase().includes(searchLower) ||
          r.department.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedRequests,
      total: filteredRequests.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRequests.length / limit),
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, error: '获取请假列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    // 验证必填字段
    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 计算天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 创建新请假申请
    const newLeaveRequest = {
      id: `leave-${mockLeaveRequests.length + 1}`,
      employeeId,
      employeeName: body.employeeName || '',
      department: body.department || '',
      type,
      startDate,
      endDate,
      days,
      reason: reason || '个人原因',
      status: '待审批',
      applyDate: new Date().toISOString().split('T')[0],
      approver: null,
      approveDate: null,
      avatar: null,
    };

    mockLeaveRequests.push(newLeaveRequest);

    return NextResponse.json({
      success: true,
      data: newLeaveRequest,
      message: '请假申请提交成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, error: '提交请假申请失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approver, approverComment } = body;

    // 查找请假申请
    const leaveRequest = mockLeaveRequests.find(r => r.id === id);

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: '请假申请不存在' },
        { status: 404 }
      );
    }

    // 更新状态
    leaveRequest.status = status;
    leaveRequest.approver = approver || '';
    leaveRequest.approveDate = new Date().toISOString().split('T')[0];

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: status === '已通过' ? '请假申请已通过' : '请假申请已拒绝',
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, error: '更新请假申请失败' },
      { status: 500 }
    );
  }
}
