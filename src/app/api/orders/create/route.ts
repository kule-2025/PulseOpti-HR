import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, subscriptions, users, companies } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateOrderId } from '@/lib/utils/order';

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, billingPeriod, paymentMethod } = body;

    // 验证必填字段
    if (!userId || !planId || !billingPeriod || !paymentMethod) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证支付方式
    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: '无效的支付方式' },
        { status: 400 }
      );
    }

    // 获取数据库实例
    const db = await getDb();

    // 获取用户信息
    const userList = await db.select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      email: users.email,
      phone: users.phone,
      name: users.name,
    }).from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userList[0];

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 套餐配置（单位：分）
    const PLAN_CONFIG = {
      free: { yearly: 0, monthly: 0, employees: 5, subAccounts: 0 },
      basic: { yearly: 59900, monthly: 5900, employees: 50, subAccounts: 3 },        // 基础版：年费¥599，月费¥59
      professional: { yearly: 149900, monthly: 12900, employees: 100, subAccounts: 9 }, // 专业版：年费¥1499，月费¥129
      enterprise: { yearly: 299900, monthly: 25900, employees: 500, subAccounts: 50 },   // 企业版：年费¥2999，月费¥259
    };

    const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
    if (!planConfig) {
      return NextResponse.json(
        { error: '无效的套餐' },
        { status: 400 }
      );
    }

    // 计算价格（单位：分）
    const amount = billingPeriod === 'yearly' ? planConfig.yearly : planConfig.monthly;
    const period = billingPeriod === 'year' ? 'yearly' : 'monthly';

    // 检查是否有未支付的订单
    const existingOrderList = await db.select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.tier, planId),
        eq(orders.status, 'pending')
      ))
      .limit(1);

    if (existingOrderList.length > 0) {
      const existingOrder = existingOrderList[0];
      // 返回已有订单
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        orderNo: existingOrder.orderNo,
        amount: existingOrder.amount,
        createdAt: existingOrder.createdAt,
      });
    }

    // 生成订单号
    const orderNo = generateOrderId();

    // 创建订单
    const orderList = await db.insert(orders).values({
      companyId: user.companyId || 'PLATFORM',
      userId,
      orderNo,
      tier: planId,
      period,
      amount,
      originalAmount: amount,
      discountAmount: 0,
      currency: 'CNY',
      paymentMethod,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期（延长过期时间）
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      orderId: orderList[0].id,
      orderNo: orderList[0].orderNo,
      amount: orderList[0].amount,
      createdAt: orderList[0].createdAt,
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    );
  }
}
