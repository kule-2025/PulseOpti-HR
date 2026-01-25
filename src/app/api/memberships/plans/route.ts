import { NextRequest, NextResponse } from 'next/server';
import { subscriptionPlanManager } from '@/storage/database';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建/更新套餐Schema
const planSchema = z.object({
  id: z.string().optional(),
  tier: z.enum(['free', 'basic', 'professional', 'enterprise']),
  name: z.string().min(2),
  description: z.string().optional(),
  monthlyPrice: z.number().int().min(0),
  yearlyPrice: z.number().int().min(0),
  maxEmployees: z.number().int().min(1),
  features: z.array(z.any()),
  aiQuota: z.number().int().min(0),
  storageQuota: z.number().int().min(0),
  prioritySupport: z.boolean().default(false),
  customBranding: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// 获取所有套餐
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminUser = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }

    const plans = await subscriptionPlanManager.getPlans({ filters });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json(
      { error: '获取套餐列表失败' },
      { status: 500 }
    );
  }
}

// 创建套餐
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminUser = authResult as any;

  try {
    const body = await request.json();
    const validated = planSchema.parse(body);

    // 检查tier是否已存在
    const existingPlan = await subscriptionPlanManager.getPlanByTier(validated.tier);
    if (existingPlan) {
      return NextResponse.json(
        { error: '该套餐等级已存在' },
        { status: 400 }
      );
    }

    const plan = await subscriptionPlanManager.createPlan(validated);

    // 记录审计日志
    if (adminUser.companyId) {
      await auditLogManager.logAction({
        companyId: adminUser.companyId,
        userId: adminUser.userId,
        userName: adminUser.name,
        action: 'create',
        resourceType: 'subscription_plan',
        resourceId: plan.id,
        resourceName: plan.name,
        changes: validated,
        status: 'success',
      });
    }

    return NextResponse.json({
      success: true,
      message: '套餐创建成功',
      data: plan,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建套餐失败:', error);
    return NextResponse.json(
      { error: '创建套餐失败' },
      { status: 500 }
    );
  }
}
