import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, subscriptions, companies } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * POST /api/memberships/trial/start
 * 开启 7 天免费试用
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();

    // 查询当前用户的订阅信息
    const [currentSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    // 如果已经有过试用，不允许再次试用
    if (currentSubscription?.hasTrialUsed) {
      return NextResponse.json(
        {
          error: '已经使用过免费试用',
          code: 'TRIAL_ALREADY_USED',
        },
        { status: 400 }
      );
    }

    // 如果当前是付费订阅，不允许试用
    if (currentSubscription?.tier && currentSubscription.tier !== 'free') {
      return NextResponse.json(
        {
          error: '当前已是付费用户，无需试用',
          code: 'ALREADY_PAID_USER',
        },
        { status: 400 }
      );
    }

    // 查询企业信息
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, user.companyId));

    if (!company) {
      return NextResponse.json(
        { error: '企业信息不存在' },
        { status: 404 }
      );
    }

    // 计算试用结束时间（7天后）
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // 更新或创建订阅记录
    if (currentSubscription) {
      // 更新现有订阅
      await db
        .update(subscriptions)
        .set({
          tier: 'professional', // 试用期间给予专业版权限
          trialEndsAt,
          hasTrialUsed: true,
          isTrial: true,
          trialDaysRemaining: 7,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, currentSubscription.id));
    } else {
      // 创建新订阅记录
      const now = new Date();
      await db.insert(subscriptions).values({
        companyId: user.companyId,
        userId: user.id,
        tier: 'professional',
        amount: 0, // 试用期间金额为0
        currency: 'CNY',
        period: 'monthly',
        maxEmployees: 200, // 专业版员工上限
        maxSubAccounts: 5,
        startDate: now,
        endDate: trialEndsAt,
        trialEndsAt,
        hasTrialUsed: true,
        isTrial: true,
        trialDaysRemaining: 7,
        status: 'active',
        autoRenew: false,
        metadata: {
          trialStartedAt: now,
          trialDaysTotal: 7,
        },
      });
    }

    // 更新企业信息（提升试用期间的员工上限）
    await db
      .update(companies)
      .set({
        maxEmployees: 200, // 试用期间提升到专业版的员工上限
        subscriptionTier: 'professional',
        subscriptionExpiresAt: trialEndsAt,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));

    return NextResponse.json({
      success: true,
      message: '免费试用已开启，有效期 7 天',
      trialEndsAt,
      trialDaysRemaining: 7,
      tier: 'professional',
      maxEmployees: 200,
    });
  } catch (error) {
    console.error('开启试用失败:', error);
    return NextResponse.json(
      { error: '开启试用失败' },
      { status: 500 }
    );
  }
}
