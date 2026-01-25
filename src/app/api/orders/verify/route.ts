import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, subscriptions, users, companies, paymentProofs } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// 验证支付并激活会员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    // 验证必填字段
    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      );
    }

    // 获取数据库实例
    const db = await getDb();

    // 查询订单
    const orderList = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderList[0];

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 检查订单是否已经支付
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: '订单已支付',
      });
    }

    // 检查订单是否已过期（超过30分钟未支付）
    if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
      return NextResponse.json(
        { error: '订单已过期，请重新下单' },
        { status: 400 }
      );
    }

    // 查询支付凭证
    const proofList = await db.select()
      .from(paymentProofs)
      .where(eq(paymentProofs.orderId, orderId))
      .orderBy(desc(paymentProofs.uploadedAt))
      .limit(1);

    // 检查是否已上传凭证
    if (proofList.length === 0) {
      return NextResponse.json(
        { error: '请先上传支付凭证' },
        { status: 400 }
      );
    }

    const proof = proofList[0];

    // 检查凭证审核状态
    if (proof.status === 'pending') {
      return NextResponse.json(
        { error: '您的支付凭证正在审核中，请耐心等待，通常在24小时内完成审核。如有疑问请联系客服：PulseOptiHR@163.com' },
        { status: 400 }
      );
    }

    if (proof.status === 'rejected') {
      return NextResponse.json(
        { error: '您的支付凭证审核未通过，请重新上传凭证。拒绝原因：' + (proof.reviewComment || '请联系客服') },
        { status: 400 }
      );
    }

    if (proof.status !== 'approved') {
      return NextResponse.json(
        { error: '支付凭证状态异常，请联系客服' },
        { status: 400 }
      );
    }

    // 计算会员到期时间
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (order.period === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // 更新订单状态为已支付
    await db.update(orders)
      .set({
        status: 'paid',
        paymentTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // 查询现有订阅
    const existingSubscriptionList = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.companyId, order.companyId))
      .limit(1);

    // 套餐配置
    const PLAN_CONFIG = {
      free: { employees: 5, subAccounts: 0 },
      basic: { employees: 50, subAccounts: 3 },           // 基础版：50人，3个子账号
      professional: { employees: 100, subAccounts: 9 },    // 专业版：100人，9个子账号
      enterprise: { employees: 500, subAccounts: 50 },     // 企业版：500人，50个子账号
    };

    const planConfig = PLAN_CONFIG[order.tier as keyof typeof PLAN_CONFIG];

    if (existingSubscriptionList.length > 0) {
      const existingSubscription = existingSubscriptionList[0];
      // 更新现有订阅
      const newEndDate = new Date(existingSubscription.endDate) > new Date()
        ? new Date(existingSubscription.endDate) // 如果还有时间，从原到期时间开始累加
        : new Date(); // 如果已过期，从现在开始

      if (order.period === 'yearly') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      } else {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      }

      await db.update(subscriptions)
        .set({
          tier: order.tier,
          amount: order.amount,
          maxEmployees: planConfig.employees,
          maxSubAccounts: planConfig.subAccounts,
          period: order.period,
          status: 'active',
          startDate: new Date(),
          endDate: newEndDate,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.companyId, order.companyId));
    } else {
      // 创建新订阅
      await db.insert(subscriptions).values({
        companyId: order.companyId,
        tier: order.tier,
        amount: order.amount,
        currency: order.currency,
        period: order.period,
        maxEmployees: planConfig.employees,
        maxSubAccounts: planConfig.subAccounts,
        startDate,
        endDate,
        status: 'active',
        paymentMethod: order.paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 更新公司套餐信息
    await db.update(companies)
      .set({
        subscriptionTier: order.tier,
        maxEmployees: planConfig.employees,
        subscriptionExpiresAt: endDate,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, order.companyId));

    return NextResponse.json({
      success: true,
      message: '支付成功，会员已激活',
      tier: order.tier,
      endDate: endDate.toISOString(),
    });

  } catch (error) {
    console.error('验证支付失败:', error);
    return NextResponse.json(
      { error: '验证支付失败' },
      { status: 500 }
    );
  }
}
