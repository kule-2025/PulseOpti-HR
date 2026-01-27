import { NextRequest, NextResponse } from 'next/server';

// 模拟职位数据
const mockPositions = [
  {
    id: '1',
    title: '高级前端工程师',
    department: '技术部',
    location: '北京',
    salary: '25-40K',
    status: '招聘中',
    createdAt: '2024-01-15',
    applicants: 45,
    requirements: ['5年以上前端开发经验', '精通React/Vue', '熟悉Node.js'],
    responsibilities: ['负责公司核心产品开发', '优化前端性能', '技术方案设计'],
  },
  {
    id: '2',
    title: '产品经理',
    department: '产品部',
    location: '上海',
    salary: '20-35K',
    status: '招聘中',
    createdAt: '2024-01-10',
    applicants: 32,
    requirements: ['3年以上产品经验', '有B端产品经验', '优秀的沟通能力'],
    responsibilities: ['需求调研与分析', '产品规划与设计', '跨团队协作'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    // 筛选数据
    let filteredPositions = mockPositions;

    if (status && status !== 'all') {
      filteredPositions = filteredPositions.filter((p: any) => p.status === status);
    }

    if (department) {
      filteredPositions = filteredPositions.filter((p: any) => p.department === department);
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: filteredPositions,
      total: filteredPositions.length,
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: '获取职位列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, department, location, salary, requirements, responsibilities } = body;

    // 验证必填字段
    if (!title || !department || !location || !salary) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 创建新职位
    const newPosition = {
      id: String(mockPositions.length + 1),
      title,
      department,
      location,
      salary,
      status: '招聘中',
      createdAt: new Date().toISOString().split('T')[0],
      applicants: 0,
      requirements: requirements?.split('\n').filter((r: string) => r.trim()) || [],
      responsibilities: responsibilities?.split('\n').filter((r: string) => r.trim()) || [],
    };

    mockPositions.push(newPosition);

    return NextResponse.json({
      success: true,
      data: newPosition,
      message: '职位发布成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { success: false, error: '发布职位失败' },
      { status: 500 }
    );
  }
}
