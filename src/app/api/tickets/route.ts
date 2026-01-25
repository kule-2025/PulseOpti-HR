import { NextRequest, NextResponse } from 'next/server';

// 获取工单列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID' },
        { status: 400 }
      );
    }

    // TODO: 从数据库获取工单列表
    // 这里返回模拟数据
    const tickets = [
      {
        id: '1',
        subject: '无法登录系统',
        description: '输入账号密码后点击登录无响应',
        type: 'bug',
        priority: 'high',
        status: 'open',
        userId: userId || 'user-1',
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [
          {
            id: 'reply-1',
            content: '您好，请尝试清除浏览器缓存后重新登录',
            authorId: 'admin-1',
            authorName: '客服',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
      {
        id: '2',
        subject: '功能建议：增加批量导入功能',
        description: '希望能支持Excel批量导入员工信息',
        type: 'feature',
        priority: 'medium',
        status: 'in_progress',
        userId: userId || 'user-1',
        companyId,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        replies: [],
      },
    ];

    // 筛选
    let filteredTickets = tickets;
    if (status) {
      filteredTickets = filteredTickets.filter((t) => t.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredTickets,
      total: filteredTickets.length,
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取工单列表失败' },
      { status: 500 }
    );
  }
}

// 创建新工单
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = body ? JSON.parse(body) : {};

    const { subject, description, type, priority, companyId, userId } = data;

    if (!subject || !description || !companyId || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // TODO: 保存工单到数据库
    const newTicket = {
      id: `ticket-${Date.now()}`,
      subject,
      description,
      type: type || 'other',
      priority: priority || 'medium',
      status: 'open',
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };

    // TODO: 发送通知给超管端
    // 例如：调用超管端API创建待处理任务

    return NextResponse.json({
      success: true,
      data: newTicket,
      message: '工单提交成功',
    });
  } catch (error) {
    console.error('创建工单失败:', error);
    return NextResponse.json(
      { success: false, error: '创建工单失败' },
      { status: 500 }
    );
  }
}
