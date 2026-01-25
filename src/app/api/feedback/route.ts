import { NextRequest, NextResponse } from 'next/server';

// 提交用户反馈
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = body ? JSON.parse(body) : {};

    const { type, category, content, rating, userId, companyId, contactEmail } = data;

    if (!content || !userId || !companyId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // TODO: 保存反馈到数据库
    const feedback = {
      id: `feedback-${Date.now()}`,
      type: type || 'suggestion', // suggestion, bug, complaint, other
      category: category || 'general',
      content,
      rating: rating || null,
      userId,
      companyId,
      contactEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // TODO: 同步到超管端审计日志
    // 例如：调用 /api/admin/audit-logs 记录用户反馈

    return NextResponse.json({
      success: true,
      data: feedback,
      message: '感谢您的反馈！我们会尽快处理。',
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json(
      { success: false, error: '提交反馈失败' },
      { status: 500 }
    );
  }
}

// 获取反馈列表（管理员）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID' },
        { status: 400 }
      );
    }

    // TODO: 从数据库获取反馈列表
    const feedbacks = [
      {
        id: 'feedback-1',
        type: 'suggestion',
        category: 'feature',
        content: '建议增加移动端APP',
        rating: 5,
        userId: 'user-1',
        userName: '张三',
        companyId,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // 筛选
    let filteredFeedbacks = feedbacks;
    if (type) {
      filteredFeedbacks = filteredFeedbacks.filter((f) => f.type === type);
    }

    return NextResponse.json({
      success: true,
      data: filteredFeedbacks,
      total: filteredFeedbacks.length,
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取反馈列表失败' },
      { status: 500 }
    );
  }
}
