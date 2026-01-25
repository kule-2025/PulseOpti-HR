import { NextRequest, NextResponse } from 'next/server';
import { getDb, users, companies, subscriptions, orders } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc, count, sql, sum } from 'drizzle-orm';

// GET /api/admin/reports/stats - 获取报表统计数据
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const db = await getDb();

    // 获取基础统计数据
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalCompanies = await db.select({ count: count() }).from(companies);
    const totalSubscriptions = await db.select({ count: count() }).from(subscriptions);
    const activeWorkflows = await db.select({ count: count() }).from(sql`workflow_instances`);

    // 获取本月收入
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = await db
      .select({ total: sum(orders.amount) })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startOfMonth}`);

    // 获取本月新增用户
    const recentUsers = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${startOfMonth}`);

    // 获取用户增长数据（按月）
    const userGrowthData = await db
      .select({
        date: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM')`,
        users: count(),
      })
      .from(users)
      .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`)
      .limit(6);

    // 获取企业增长数据（按月）
    const companyGrowthData = await db
      .select({
        date: sql<string>`TO_CHAR(${companies.createdAt}, 'YYYY-MM')`,
        companies: count(),
      })
      .from(companies)
      .groupBy(sql`TO_CHAR(${companies.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${companies.createdAt}, 'YYYY-MM')`)
      .limit(6);

    // 获取收入数据（按月）
    const revenueData = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.amount),
      })
      .from(orders)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .limit(6);

    // 合并用户和企业增长数据
    const userGrowth = userGrowthData.map((item, index) => ({
      date: item.date,
      users: item.users,
      companies: companyGrowthData[index]?.companies || 0,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalCompanies: totalCompanies[0]?.count || 0,
        totalSubscriptions: totalSubscriptions[0]?.count || 0,
        activeWorkflows: activeWorkflows[0]?.count || 0,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        recentUsers: recentUsers[0]?.count || 0,
      },
      userGrowth,
      revenue: revenueData.map(r => ({
        month: r.month,
        revenue: r.revenue || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return NextResponse.json(
      { error: '获取报表数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
