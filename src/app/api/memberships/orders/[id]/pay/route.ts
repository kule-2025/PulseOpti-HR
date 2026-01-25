import { NextRequest, NextResponse } from 'next/server';
import { orderManager, subscriptionManager, subscriptionPlanManager } from '@/storage/database';
import { requireAuth } from '@/lib/auth/middleware';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 支付订单Schema
const payOrderSchema = z.object({
  paymentMethod: z.enum(['wechat', 'alipay', 'bank']),
  transactionId: z.string(),
});

// 支付订单
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = payOrderSchema.parse(body);

    // 获取订单
    const order = await orderManager.getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 检查订单所属企业
    if (order.companyId !== user.companyId) {
      return NextResponse.json(
        { error: '无权限操作该订单' },
        { status: 403 }
      );
    }

    // 检查订单状态
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: '订单状态不正确' },
        { status: 400 }
      );
    }

    // 检查订单是否过期
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: '订单已过期' },
        { status: 400 }
      );
    }

    // 标记订单为已支付
    const paidOrder = await orderManager.markOrderPaid(
      id,
      validated.paymentMethod,
      validated.transactionId
    );

    if (!paidOrder) {
      return NextResponse.json(
        { error: '支付失败' },
        { status: 500 }
      );
    }

    // 获取套餐信息
    const plan = await subscriptionPlanManager.getPlanByTier(order.tier);
    if (!plan) {
      return NextResponse.json(
        { error: '套餐不存在' },
        { status: 404 }
      );
    }

    // 创建新的订阅记录
    const subscriptionData = {
      companyId: order.companyId,
      tier: order.tier,
      amount: order.amount,
      currency: order.currency,
      period: order.period,
      maxEmployees: plan.maxEmployees,
      startDate: new Date(),
      endDate: new Date(Date.now() + (order.period === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      status: 'active',
      paymentMethod: validated.paymentMethod,
      transactionId: validated.transactionId,
    };

    await subscriptionManager.createSubscription(subscriptionData);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'payment',
      resourceType: 'order',
      resourceId: order.id,
      resourceName: order.orderNo,
      changes: {
        amount: order.amount,
        paymentMethod: validated.paymentMethod,
        tier: order.tier,
      },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '支付成功',
      data: {
        order: paidOrder,
        subscription: subscriptionData,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('支付订单失败:', error);
    return NextResponse.json(
      { error: '支付订单失败' },
      { status: 500 }
    );
  }
}
