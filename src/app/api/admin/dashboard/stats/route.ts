import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getDb, users, companies, subscriptions, workflowInstances } from '@/lib/db';

/**
 * 获取超管端仪表盘统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未提供认证令牌' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: '无权访问，需要超级管理员权限' },
        { status: 403 }
      );
    }

    const db = await getDb();

    // 并行查询各项统计数据
    const [totalUsers, totalCompanies, totalSubscriptions, activeWorkflows] = await Promise.all([
      db.select({ count: users.id }).from(users),
      db.select({ count: companies.id }).from(companies),
      db.select({ count: subscriptions.id }).from(subscriptions),
      db.select({ count: workflowInstances.id }).from(workflowInstances),
    ]);

    // 计算本月收入（模拟数据，实际应从订单表计算）
    const revenueThisMonth = 15800; // ¥15,800
    const recentUsers = 12; // 本周新增用户

    const stats = {
      totalUsers: totalUsers.length,
      totalCompanies: totalCompanies.length,
      totalSubscriptions: totalSubscriptions.length,
      activeWorkflows: activeWorkflows.length,
      revenueThisMonth,
      recentUsers,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
