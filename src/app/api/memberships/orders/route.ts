import { NextRequest, NextResponse } from 'next/server';
import { orderManager, subscriptionPlanManager } from '@/storage/database';
import { requireAuth } from '@/lib/auth/middleware';
import { subscriptionManager } from '@/storage/database';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建订单Schema
const createOrderSchema = z.object({
  tier: z.enum(['free', 'basic', 'professional', 'enterprise']),
  period: z.enum(['monthly', 'yearly']),
  couponCode: z.string().optional(),
});

// 获取订单列表
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filters: any = {
      companyId: user.companyId,
    };

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }

    const orders = await orderManager.getOrders({
      skip,
      limit,
      filters,
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: orders.length,
        },
      },
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { error: '获取订单列表失败' },
      { status: 500 }
    );
  }
}

// 创建订单
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    // 获取套餐价格
    const priceInfo = await subscriptionPlanManager.calculatePrice(validated.tier, validated.period);
    if (!priceInfo) {
      return NextResponse.json(
        { error: '套餐不存在' },
        { status: 404 }
      );
    }

    // 创建订单
    const orderData = {
      companyId: user.companyId,
      userId: user.userId,
      orderNo: orderManager.generateOrderNo(),
      tier: validated.tier,
      period: validated.period,
      amount: priceInfo.amount,
      originalAmount: priceInfo.originalAmount,
      discountAmount: 0,
      couponCode: validated.couponCode,
      currency: 'CNY',
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
    };

    const order = await orderManager.createOrder(orderData);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'order',
      resourceId: order.id,
      resourceName: order.orderNo,
      changes: { tier: validated.tier, period: validated.period },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '订单创建成功',
      data: {
        order,
        paymentInfo: {
          amount: order.amount,
          expiresAt: order.expiresAt,
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    );
  }
}
