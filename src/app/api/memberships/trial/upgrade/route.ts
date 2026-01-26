import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptions, companies, subscriptionPlans } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * POST /api/memberships/trial/upgrade
 * 试用转付费引导
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();

    // 查询当前订阅信息
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    if (!subscription || !subscription.isTrial) {
      return NextResponse.json(
        { error: '当前不是试用用户' },
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

    // 查询所有可用的套餐
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));

    // 计算试用期间的使用情况
    const now = new Date();
    const trialEndsAt = new Date(subscription.trialEndsAt!);
    const isExpired = now > trialEndsAt;

    return NextResponse.json({
      success: true,
      trialStatus: {
        isExpired,
        endsAt: trialEndsAt,
        daysRemaining: Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        currentTier: subscription.tier,
      },
      upgradeRecommendation: {
        recommendedTier: 'professional',
        reason: '根据您的企业规模和使用情况，推荐选择专业版',
        recommendedPlans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          tier: plan.tier,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          maxEmployees: plan.maxEmployees,
          features: plan.features,
          isRecommended: plan.tier === 'professional',
        })),
      },
      specialOffer: {
        available: !isExpired, // 试用期间享受优惠
        discount: 0.7, // 7折优惠
        discountDescription: '试用期间购买享受 7 折优惠',
        originalPrice: 599,
        discountedPrice: 419.3,
      },
      nextSteps: [
        {
          step: 1,
          action: '选择套餐',
          description: '根据企业需求选择合适的套餐',
          completed: false,
        },
        {
          step: 2,
          action: '确认订单',
          description: '确认订单信息和优惠',
          completed: false,
        },
        {
          step: 3,
          action: '完成支付',
          description: '选择支付方式完成支付',
          completed: false,
        },
        {
          step: 4,
          action: '开通服务',
          description: '支付成功后自动开通服务',
          completed: false,
        },
      ],
    });
  } catch (error) {
    console.error('获取升级引导失败:', error);
    return NextResponse.json(
      { error: '获取升级引导失败' },
      { status: 500 }
    );
  }
}
