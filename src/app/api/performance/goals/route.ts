import { NextRequest, NextResponse } from 'next/server';

// 模拟目标数据
const mockGoals = [
  {
    id: '1',
    title: '完成Q1产品目标',
    type: 'department',
    priority: 'high',
    status: 'in-progress',
    progress: 75,
    dueDate: '2024-03-31',
    owner: '张三',
    department: '产品部',
    description: '完成新产品的核心功能开发和上线',
    createdAt: '2024-01-01',
    keyResults: [
      { id: 'kr1', title: '完成核心功能开发', progress: 100, status: 'completed' },
      { id: 'kr2', title: '通过内部测试', progress: 80, status: 'in-progress' },
      { id: 'kr3', title: '上线生产环境', progress: 40, status: 'in-progress' },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const department = searchParams.get('department');

    // 筛选数据
    let filteredGoals = mockGoals;

    if (status && status !== 'all') {
      filteredGoals = filteredGoals.filter(g => g.status === status);
    }

    if (type) {
      filteredGoals = filteredGoals.filter(g => g.type === type);
    }

    if (department) {
      filteredGoals = filteredGoals.filter(g => g.department === department);
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: filteredGoals,
      total: filteredGoals.length,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: '获取目标列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, priority, owner, department, dueDate, description, keyResults } = body;

    // 验证必填字段
    if (!title || !type || !priority || !owner || !department || !dueDate) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 创建新目标
    const newGoal = {
      id: String(mockGoals.length + 1),
      title,
      type,
      priority,
      status: 'not-started',
      progress: 0,
      dueDate,
      owner,
      department,
      description: description || '',
      createdAt: new Date().toISOString().split('T')[0],
      keyResults: (keyResults || '').split('\n')
        .filter((kr: string) => kr.trim())
        .map((kr: string, i: number) => ({
          id: `kr${mockGoals.length + 1}-${i + 1}`,
          title: kr.trim(),
          progress: 0,
          status: 'not-started',
        })),
    };

    mockGoals.push(newGoal);

    return NextResponse.json({
      success: true,
      data: newGoal,
      message: '目标创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: '创建目标失败' },
      { status: 500 }
    );
  }
}
