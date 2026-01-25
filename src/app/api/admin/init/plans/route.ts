import { NextRequest, NextResponse } from 'next/server';
import { subscriptionPlanManager } from '@/storage/database';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * 初始化默认订阅套餐
 * 价格设置为竞品的50%
 */
const DEFAULT_PLANS = [
  {
    tier: 'free',
    name: '免费版',
    description: '体验基础功能，适合10人以下小团队',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxEmployees: 10,
    features: [
      '员工基础信息管理',
      '部门管理（最多3个）',
      '基础报表查看',
      '10次AI调用/月',
      '1GB存储空间',
      '社区支持',
    ],
    aiQuota: 10,
    storageQuota: 1024,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    isActive: true,
    sortOrder: 0,
  },
  {
    tier: 'basic',
    name: '基础版',
    description: '适合10-50人成长型企业',
    monthlyPrice: 19900, // 199元/月，比竞品便宜50%
    yearlyPrice: 199000, // 1990元/年
    maxEmployees: 50,
    features: [
      '免费版所有功能',
      '无限制部门管理',
      '招聘流程管理',
      '基础绩效管理',
      '100次AI调用/月',
      '10GB存储空间',
      '邮件支持',
    ],
    aiQuota: 100,
    storageQuota: 10240,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    tier: 'professional',
    name: '专业版',
    description: '适合50-200人规模企业，HR三支柱架构',
    monthlyPrice: 59900, // 599元/月，比竞品便宜50%
    yearlyPrice: 599000, // 5990元/年
    maxEmployees: 200,
    features: [
      '基础版所有功能',
      '完整招聘系统（AI简历筛选）',
      '360度绩效评估',
      '人才盘点九宫格',
      '离职预测分析',
      '1000次AI调用/月',
      '100GB存储空间',
      '优先技术支持',
      '自定义报表',
      '工作流引擎',
    ],
    aiQuota: 1000,
    storageQuota: 102400,
    prioritySupport: true,
    customBranding: false,
    apiAccess: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    tier: 'enterprise',
    name: '企业版',
    description: '适合200人以上大型企业，深度定制',
    monthlyPrice: 199900, // 1999元/月，比竞品便宜50%
    yearlyPrice: 1999000, // 19990元/年
    maxEmployees: 9999,
    features: [
      '专业版所有功能',
      '无限AI调用',
      '1TB存储空间',
      '专属客户经理',
      '企业品牌定制',
      '私有化部署选项',
      'API接口开放',
      'SSO单点登录',
      '数据大屏定制',
      '7x24小时支持',
    ],
    aiQuota: 999999,
    storageQuota: 1048576,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    isActive: true,
    sortOrder: 3,
  },
];

export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const results = [];

    for (const planData of DEFAULT_PLANS) {
      // 检查是否已存在
      const existingPlan = await subscriptionPlanManager.getPlanByTier(planData.tier);

      if (existingPlan) {
        // 更新现有套餐
        const updatedPlan = await subscriptionPlanManager.updatePlan(
          existingPlan.id,
          planData
        );
        results.push({
          action: 'updated',
          tier: planData.tier,
          data: updatedPlan,
        });
      } else {
        // 创建新套餐
        const newPlan = await subscriptionPlanManager.createPlan(planData);
        results.push({
          action: 'created',
          tier: planData.tier,
          data: newPlan,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '套餐初始化完成',
      data: {
        plans: results,
        total: results.length,
      },
    });
  } catch (error) {
    console.error('初始化套餐失败:', error);
    return NextResponse.json(
      { error: '初始化套餐失败' },
      { status: 500 }
    );
  }
}

// 获取套餐列表
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const plans = await subscriptionPlanManager.getActivePlans();

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
