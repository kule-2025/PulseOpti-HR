import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptions, companies } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// 获取订阅列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(subscriptions.companyId, companyId)];
    if (status) {
      conditions.push(eq(subscriptions.status, status));
    }
    if (tier) {
      conditions.push(eq(subscriptions.tier, tier));
    }

    // 获取订阅列表
    const subs = await db.select()
      .from(subscriptions)
      .where(and(...conditions))
      .orderBy(desc(subscriptions.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: subs,
      total: subs.length,
    });
  } catch (error) {
    console.error('获取订阅列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取订阅列表失败' },
      { status: 500 }
    );
  }
}

// 创建订阅
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = body ? JSON.parse(body) : {};

    const {
      companyId,
      tier,
      amount,
      period,
      maxEmployees,
      maxSubAccounts,
      startDate,
      endDate,
      paymentMethod,
      transactionId,
    } = data;

    // 验证必填字段
    if (!companyId || !tier || !amount || !period || !maxEmployees) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 计算日期
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // 默认一年

    // 创建订阅
    const newSub = await db.insert(subscriptions).values({
      companyId,
      tier,
      amount,
      currency: 'CNY',
      period,
      maxEmployees,
      maxSubAccounts: maxSubAccounts || 0,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentMethod,
      transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 更新企业订阅信息
    await db.update(companies)
      .set({
        subscriptionTier: tier,
        maxEmployees,
        subscriptionExpiresAt: end,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));

    // TODO: 同步到超管端订阅管理
    // 例如：调用超管端API更新订阅状态

    return NextResponse.json({
      success: true,
      data: newSub[0],
      message: '订阅创建成功',
    });
  } catch (error) {
    console.error('创建订阅失败:', error);
    return NextResponse.json(
      { success: false, error: '创建订阅失败' },
      { status: 500 }
    );
  }
}
