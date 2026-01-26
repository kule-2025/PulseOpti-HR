import { NextRequest, NextResponse } from 'next/server';

// 模拟候选人数据
const mockCandidates = Array.from({ length: 50 }, (_, i) => ({
  id: `cand-${i + 1}`,
  name: `候选人${i + 1}`,
  position: i % 3 === 0 ? '高级前端工程师' : i % 3 === 1 ? '产品经理' : '数据分析师',
  status: i % 4 === 0 ? '待筛选' : i % 4 === 1 ? '面试中' : i % 4 === 2 ? '已通过' : '已拒绝',
  experience: `${(i % 8) + 1}年`,
  phone: '138****8888',
  email: `candidate${i + 1}@example.com`,
  appliedDate: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
  avatar: null,
  education: i % 2 === 0 ? '本科' : '硕士',
  university: ['清华大学', '北京大学', '复旦大学', '上海交大'][i % 4],
  resume: null,
  interviews: [],
}));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 筛选数据
    let filteredCandidates = mockCandidates;

    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(c => c.status === status);
    }

    if (position) {
      filteredCandidates = filteredCandidates.filter(c => c.position === position);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.position.toLowerCase().includes(searchLower) ||
          c.university.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedCandidates,
      total: filteredCandidates.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCandidates.length / limit),
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, error: '获取候选人列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position, phone, email, resume } = body;

    // 验证必填字段
    if (!name || !position || !phone || !email) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 创建新候选人
    const newCandidate = {
      id: `cand-${mockCandidates.length + 1}`,
      name,
      position,
      status: '待筛选',
      experience: '0年',
      phone,
      email,
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: null,
      education: '',
      university: '',
      resume: resume || null,
      interviews: [],
    };

    mockCandidates.push(newCandidate);

    return NextResponse.json({
      success: true,
      data: newCandidate,
      message: '候选人添加成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { success: false, error: '添加候选人失败' },
      { status: 500 }
    );
  }
}
