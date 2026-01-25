import { NextResponse } from 'next/server';

// 会员套餐定义（四级体系）- 价格仅为竞品的3%-20%
const membershipPlans = {
  free: {
    tier: 'free',
    name: '免费版',
    description: '适合初创团队和体验用户，5人永久免费',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxEmployees: 5,
    maxJobs: 3,
    maxAdminAccounts: 1, // 1个主账号
    features: [
      '基础招聘（3个职位）',
      '5人以内员工档案',
      '基础报表',
      '考勤管理',
      '组织架构',
      '基础AI功能（3个场景）',
    ],
    limitations: [
      '5名员工',
      '3个招聘职位',
      '1个管理员账号',
      '基础报表功能',
      '基础AI功能',
    ],
    aiQuota: 0,
    storageQuota: 1024, // 1GB
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    tag: '免费试用',
  },
  basic: {
    tier: 'basic',
    name: '基础版',
    description: '适合10-50人中小企业，价格仅为2号人事部的12%',
    monthlyPrice: 50,
    yearlyPrice: 599,
    maxEmployees: 50,
    maxJobs: 10,
    maxAdminAccounts: 4, // 1主 + 每12人1子（约3-4个子账号）
    features: [
      '免费版所有功能',
      '最多50名员工',
      '最多10个招聘职位',
      '1主账号+3个子账号',
      '绩效管理',
      '薪酬管理',
      '培训管理',
      '基础人效分析',
      '离职管理',
      '中级AI功能（5个场景）',
    ],
    limitations: [
      '50名员工',
      '10个招聘职位',
      '4个管理员账号',
      '中级AI功能',
    ],
    aiQuota: 100,
    storageQuota: 5120, // 5GB
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    tag: '性价比之选',
  },
  professional: {
    tier: 'professional',
    name: '专业版',
    description: '适合50-100人中型企业，价格仅为薪人薪事的7.5%',
    monthlyPrice: 125,
    yearlyPrice: 1499,
    maxEmployees: 100,
    maxJobs: 50,
    maxAdminAccounts: 9, // 1主 + 每11人1子（约8-9个子账号）
    features: [
      '基础版所有功能',
      '最多100名员工',
      '最多50个招聘职位',
      '1主账号+8个子账号',
      'HRBP支持模块',
      '岗位价值评估器',
      '人才盘点九宫格',
      '离职分析报告',
      '详细数据分析',
      '智能面试',
      'AI预测分析（绩效、离职、人效）',
      '积分管理系统',
      '高级AI功能（7个场景）',
    ],
    limitations: [
      '100名员工',
      '50个招聘职位',
      '9个管理员账号',
      '高级AI功能',
    ],
    aiQuota: 1000,
    storageQuota: 20480, // 20GB
    prioritySupport: true,
    customBranding: false,
    apiAccess: false,
    tag: '推荐',
  },
  enterprise: {
    tier: 'enterprise',
    name: '企业版',
    description: '适合100-500人成长企业，价格仅为北森的6%',
    monthlyPrice: 250,
    yearlyPrice: 2999,
    maxEmployees: 500,
    maxJobs: 200,
    maxAdminAccounts: 51, // 1主 + 每10人1子（约50个子账号）
    features: [
      '专业版所有功能',
      '最多500名员工',
      '最多200个招聘职位',
      '1主账号+50个子账号',
      '定制字段/流程',
      '专属成功经理',
      '深度数据分析服务',
      '年度复盘服务',
      'API集成',
      '私有化部署',
      '专属技术支持',
      '数据安全审计',
      '完整AI功能（8个场景）',
    ],
    limitations: [
      '500名员工',
      '200个招聘职位',
      '51个管理员账号',
    ],
    aiQuota: 999999,
    storageQuota: 102400, // 100GB
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    tag: '尊享定制',
  },
};

// 获取所有套餐（公开接口，供用户查看）
export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(membershipPlans),
  });
}
