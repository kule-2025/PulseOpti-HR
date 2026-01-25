import { NextRequest, NextResponse } from 'next/server';
import { getDb, subscriptions, companies } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/subscriptions - 获取订阅列表
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

    const db = await getDb();

    // 获取所有订阅
    const allSubscriptions = await db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));

    // 获取企业信息
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
      })
      .from(companies);

    // 创建企业ID到名称的映射
    const companyMap = new Map(
      companiesList.map(c => [c.id, c.name])
    );

    // 添加企业名称到订阅数据
    const subscriptionsWithCompany = allSubscriptions.map(sub => ({
      ...sub,
      companyName: companyMap.get(sub.companyId) || '未知企业',
    }));

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsWithCompany,
      total: subscriptionsWithCompany.length,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: '获取订阅列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
