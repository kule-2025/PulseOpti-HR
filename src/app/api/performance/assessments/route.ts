import { NextRequest, NextResponse } from 'next/server';

// 模拟评估数据
const mockAssessments = Array.from({ length: 30 }, (_, i) => ({
  id: `assessment-${i + 1}`,
  employeeId: `emp-${i + 1}`,
  employeeName: `员工${i + 1}`,
  department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
  period: '2024-Q1',
  overallScore: 70 + Math.floor(Math.random() * 30),
  status: i % 3 === 0 ? '待评估' : i % 3 === 1 ? '评估中' : '已完成',
  selfScore: 75 + Math.floor(Math.random() * 20),
  managerScore: i % 3 === 2 ? 70 + Math.floor(Math.random() * 30) : 0,
  submitDate: `2024-03-${String(i % 30 + 1).padStart(2, '0')}`,
  reviewDate: i % 3 === 2 ? `2024-04-${String(i % 28 + 1).padStart(2, '0')}` : null,
  dimensions: {
    工作业绩: { score: 70 + Math.floor(Math.random() * 30), weight: 40 },
    工作态度: { score: 70 + Math.floor(Math.random() * 30), weight: 20 },
    工作能力: { score: 70 + Math.floor(Math.random() * 30), weight: 25 },
    团队协作: { score: 70 + Math.floor(Math.random() * 30), weight: 15 },
  },
}));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 筛选数据
    let filteredAssessments = mockAssessments;

    if (status && status !== 'all') {
      filteredAssessments = filteredAssessments.filter(a => a.status === status);
    }

    if (period && period !== 'all') {
      filteredAssessments = filteredAssessments.filter(a => a.period === period);
    }

    if (department) {
      filteredAssessments = filteredAssessments.filter(a => a.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssessments = filteredAssessments.filter(
        a =>
          a.employeeName.toLowerCase().includes(searchLower) ||
          a.department.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedAssessments,
      total: filteredAssessments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAssessments.length / limit),
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, error: '获取评估列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, period, dimensions } = body;

    // 验证必填字段
    if (!employeeId || !period) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 计算总分
    const totalScore = Object.entries(dimensions || {}).reduce(
      (sum, [, dim]: [string, any]) => sum + (dim.score * dim.weight) / 100,
      0
    );

    // 创建新评估
    const newAssessment = {
      id: `assessment-${mockAssessments.length + 1}`,
      employeeId,
      employeeName: body.employeeName || '',
      department: body.department || '',
      period,
      overallScore: Math.round(totalScore),
      status: '已完成',
      selfScore: body.selfScore || 0,
      managerScore: Math.round(totalScore),
      submitDate: new Date().toISOString().split('T')[0],
      reviewDate: new Date().toISOString().split('T')[0],
      dimensions: dimensions || {},
    };

    mockAssessments.push(newAssessment);

    return NextResponse.json({
      success: true,
      data: newAssessment,
      message: '评估提交成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: '提交评估失败' },
      { status: 500 }
    );
  }
}
