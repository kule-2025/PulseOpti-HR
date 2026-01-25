import { NextRequest, NextResponse } from 'next/server';
import { getDb, subscriptions, auditLogs } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

// GET /api/admin/subscriptions/[id] - 获取订阅详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id: subscriptionId } = await params;
    const db = await getDb();

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return NextResponse.json({ error: '订阅不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subscription: subscription[0],
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: '获取订阅详情失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/subscriptions/[id] - 更新订阅信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id: subscriptionId } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

    const db = await getDb();

    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!existingSubscription || existingSubscription.length === 0) {
      return NextResponse.json({ error: '订阅不存在' }, { status: 404 });
    }

    if (action === 'approve') {
      // 审核通过
      await db
        .update(subscriptions)
        .set({
          status: 'active',
          startDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));

      // 记录审计日志
      await db.insert(auditLogs).values({
        companyId: existingSubscription[0].companyId,
        userId: decoded.userId,
        action: 'APPROVE_SUBSCRIPTION',
        resourceType: 'subscription',
        resourceId: subscriptionId,
        resourceName: `Subscription ${subscriptionId}`,
        changes: JSON.stringify({
          subscriptionId,
          companyId: existingSubscription[0].companyId,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '订阅已审核通过',
      });
    }

    if (action === 'reject') {
      // 审核拒绝
      await db
        .update(subscriptions)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));

      await db.insert(auditLogs).values({
        companyId: existingSubscription[0].companyId,
        userId: decoded.userId,
        action: 'REJECT_SUBSCRIPTION',
        resourceType: 'subscription',
        resourceId: subscriptionId,
        resourceName: `Subscription ${subscriptionId}`,
        changes: JSON.stringify({
          subscriptionId,
          companyId: existingSubscription[0].companyId,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '订阅已拒绝',
      });
    }

    if (action === 'refund') {
      // 退款
      await db
        .update(subscriptions)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));

      await db.insert(auditLogs).values({
        companyId: existingSubscription[0].companyId,
        userId: decoded.userId,
        action: 'REFUND_SUBSCRIPTION',
        resourceType: 'subscription',
        resourceId: subscriptionId,
        resourceName: `Subscription ${subscriptionId}`,
        changes: JSON.stringify({
          subscriptionId,
          companyId: existingSubscription[0].companyId,
          amount: existingSubscription[0].amount,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '退款已处理',
      });
    }

    // 通用更新
    await db
      .update(subscriptions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));

    return NextResponse.json({
      success: true,
      message: '订阅信息已更新',
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: '更新订阅信息失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
