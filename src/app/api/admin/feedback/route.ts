import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getDb } from '@/lib/db';
import { feedback, users, companies } from '@/storage/database/shared/schema';
import { eq, desc, like } from 'drizzle-orm';

// GET /api/admin/feedback - 获取所有用户反馈
export async function GET(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const db = await getDb();

    // 查询反馈
    const allFeedback = await db
      .select({
        id: feedback.id,
        companyId: feedback.companyId,
        userId: feedback.userId,
        userName: feedback.userName,
        userEmail: feedback.userEmail,
        type: feedback.type,
        category: feedback.category,
        title: feedback.title,
        content: feedback.content,
        rating: feedback.rating,
        status: feedback.status,
        assignedTo: feedback.assignedTo,
        reviewedAt: feedback.reviewedAt,
        reviewedBy: feedback.reviewedBy,
        response: feedback.response,
        respondedAt: feedback.respondedAt,
        tags: feedback.tags,
        isAnonymous: feedback.isAnonymous,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        companyName: companies.name,
      })
      .from(feedback)
      .leftJoin(companies, eq(feedback.companyId, companies.id))
      .orderBy(desc(feedback.createdAt))
      .limit(100);

    // 应用筛选条件（在内存中过滤）
    let filteredFeedback = allFeedback;
    if (status && status !== 'all') {
      filteredFeedback = filteredFeedback.filter((f: any) => f.status === status);
    }
    if (type && type !== 'all') {
      filteredFeedback = filteredFeedback.filter((f: any) => f.type === type);
    }
    if (category && category !== 'all') {
      filteredFeedback = filteredFeedback.filter((f: any) => f.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFeedback = filteredFeedback.filter((f: any) =>
        f.title?.toLowerCase().includes(searchLower) ||
        f.content?.toLowerCase().includes(searchLower) ||
        f.userName?.toLowerCase().includes(searchLower) ||
        f.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      feedbacks: filteredFeedback,
      total: filteredFeedback.length,
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    return NextResponse.json(
      { error: '获取反馈列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/feedback - 批量操作反馈
export async function POST(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { action, feedbackIds, data } = body;

    if (!action || !feedbackIds || !Array.isArray(feedbackIds)) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const db = await getDb();

    // 批量操作
    switch (action) {
      case 'batchUpdateStatus':
        // 批量更新状态
        if (!data?.status) {
          return NextResponse.json({ error: '缺少status参数' }, { status: 400 });
        }

        const updateData: any = { status: data.status, updatedAt: new Date() };
        if (data.status === 'reviewed') {
          updateData.reviewedAt = new Date();
          updateData.reviewedBy = decoded.userId;
        } else if (data.status === 'resolved') {
          updateData.respondedAt = new Date();
        }

        // 循环更新（Drizzle ORM不支持批量更新）
        for (const id of feedbackIds) {
          await db
            .update(feedback)
            .set(updateData)
            .where(eq(feedback.id, id));
        }

        return NextResponse.json({
          success: true,
          message: `成功更新 ${feedbackIds.length} 个反馈的状态`,
        });

      case 'batchDelete':
        // 批量删除
        for (const id of feedbackIds) {
          await db.delete(feedback).where(eq(feedback.id, id));
        }

        return NextResponse.json({
          success: true,
          message: `成功删除 ${feedbackIds.length} 个反馈`,
        });

      default:
        return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('批量操作反馈失败:', error);
    return NextResponse.json(
      { error: '批量操作反馈失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
