import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManager } from '@/storage/database';
import { z } from 'zod';

// 支付回调Schema
const paymentCallbackSchema = z.object({
  orderId: z.string(),
  transactionId: z.string(),
  status: z.enum(['success', 'failed', 'pending']),
  amount: z.number(),
  paymentMethod: z.string().optional(),
});

// 支付回调（Webhook）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = paymentCallbackSchema.parse(body);

    // 验证订单（实际项目中需要验证签名等）
    const orderIdParts = validated.orderId.split('-');
    const subscriptionId = orderIdParts[1] || validated.orderId;

    // 更新订阅状态
    if (validated.status === 'success') {
      const subscription = await subscriptionManager.updateSubscription(subscriptionId, {
        status: 'active',
        transactionId: validated.transactionId,
        paymentMethod: validated.paymentMethod,
      });

      // 更新企业表的订阅信息（如果有企业表）
      // await companyManager.updateSubscriptionStatus(subscription.companyId, 'professional', subscription.endDate);

      return NextResponse.json({
        success: true,
        message: '支付成功，订阅已激活',
        data: subscription,
      });
    } else if (validated.status === 'failed') {
      const subscription = await subscriptionManager.updateSubscription(subscriptionId, {
        status: 'cancelled',
      });

      return NextResponse.json({
        success: false,
        message: '支付失败',
        data: subscription,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: '支付处理中',
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('支付回调错误:', error);
    return NextResponse.json(
      { error: '支付回调处理失败' },
      { status: 500 }
    );
  }
}

// 查询支付状态
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '订单ID不能为空' },
        { status: 400 }
      );
    }

    // 模拟查询支付状态（实际项目中应该调用支付平台API）
    // const paymentStatus = await queryPaymentStatus(orderId);

    // 这里模拟返回成功状态
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status: 'success',
        paidAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('查询支付状态错误:', error);
    return NextResponse.json(
      { error: '查询支付状态失败' },
      { status: 500 }
    );
  }
}
