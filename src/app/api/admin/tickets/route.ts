import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getDb } from '@/lib/db';
import { tickets, users, companies } from '@/storage/database/shared/schema';
import { eq, desc, and, or, like } from 'drizzle-orm';

// GET /api/admin/tickets - 获取所有工单
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
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const db = await getDb();

    // 查询工单
    const allTickets = await db
      .select({
        id: tickets.id,
        companyId: tickets.companyId,
        userId: tickets.userId,
        userName: tickets.userName,
        userEmail: tickets.userEmail,
        title: tickets.title,
        description: tickets.description,
        category: tickets.category,
        priority: tickets.priority,
        status: tickets.status,
        assignedTo: tickets.assignedTo,
        assignedAt: tickets.assignedAt,
        resolvedAt: tickets.resolvedAt,
        closedAt: tickets.closedAt,
        resolution: tickets.resolution,
        attachments: tickets.attachments,
        rating: tickets.rating,
        ratingComment: tickets.ratingComment,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        companyName: companies.name,
      })
      .from(tickets)
      .leftJoin(companies, eq(tickets.companyId, companies.id))
      .orderBy(desc(tickets.createdAt))
      .limit(100);

    // 应用筛选条件（在内存中过滤）
    let filteredTickets = allTickets;
    if (status && status !== 'all') {
      filteredTickets = filteredTickets.filter((t: any) => t.status === status);
    }
    if (priority && priority !== 'all') {
      filteredTickets = filteredTickets.filter((t: any) => t.priority === priority);
    }
    if (category && category !== 'all') {
      filteredTickets = filteredTickets.filter((t: any) => t.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = filteredTickets.filter((t: any) =>
        t.title?.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.userName?.toLowerCase().includes(searchLower) ||
        t.userEmail?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      tickets: filteredTickets,
      total: filteredTickets.length,
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json(
      { error: '获取工单列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/tickets - 批量操作工单
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
    const { action, ticketIds, data } = body;

    if (!action || !ticketIds || !Array.isArray(ticketIds)) {
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
        if (data.status === 'resolved') {
          updateData.resolvedAt = new Date();
        } else if (data.status === 'closed') {
          updateData.closedAt = new Date();
        }

        // 循环更新（Drizzle ORM不支持批量更新）
        for (const id of ticketIds) {
          await db
            .update(tickets)
            .set(updateData)
            .where(eq(tickets.id, id));
        }

        return NextResponse.json({
          success: true,
          message: `成功更新 ${ticketIds.length} 个工单的状态`,
        });

      case 'batchDelete':
        // 批量删除
        for (const id of ticketIds) {
          await db.delete(tickets).where(eq(tickets.id, id));
        }

        return NextResponse.json({
          success: true,
          message: `成功删除 ${ticketIds.length} 个工单`,
        });

      default:
        return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('批量操作工单失败:', error);
    return NextResponse.json(
      { error: '批量操作工单失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
