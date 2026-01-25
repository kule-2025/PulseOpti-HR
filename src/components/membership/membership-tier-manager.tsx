"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Crown,
  Star,
  Gem,
  Zap,
  Users,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Key,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/theme';
import { Progress } from '@/components/ui/progress';

// 会员等级定义
export type MembershipTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxEmployees: number;
  maxAdminAccounts: number;
  features: {
    basic: string[];
    advanced: string[];
    premium: string[];
  };
  aiQuota: number;
  storageQuota: number;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  subAccountQuota: number;
}

export interface SubAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLoginAt?: Date;
  permissions: string[];
  department?: string;
}

export interface CompanySubscription {
  companyId: string;
  companyName: string;
  currentTier: MembershipTier;
  employeeCount: number;
  adminAccountCount: number;
  subscriptionExpiry: Date;
  isTrial: boolean;
  trialDaysRemaining?: number;
  usedStorage: number;
  availableSubAccounts: number;
  usedSubAccounts: number;
}

interface MembershipTierManagerProps {
  currentSubscription?: CompanySubscription;
  plans?: MembershipPlan[];
  subAccounts?: SubAccount[];
  onUpgrade?: (tier: MembershipTier, period: 'monthly' | 'yearly') => void;
  onCreateSubAccount?: (account: Partial<SubAccount>) => void;
  onEditSubAccount?: (id: string, account: Partial<SubAccount>) => void;
  onDeleteSubAccount?: (id: string) => void;
  onRenew?: () => void;
}

// 默认会员方案
const DEFAULT_PLANS: MembershipPlan[] = [
  {
    tier: 'free',
    name: '免费版',
    description: '适合初创团队，体验基础功能',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxEmployees: 10,
    maxAdminAccounts: 1,
    features: {
      basic: [
        '最多10名员工',
        '基础人事档案管理',
        '考勤打卡',
        '简单的薪酬计算',
      ],
      advanced: [],
      premium: [],
    },
    aiQuota: 10,
    storageQuota: 1024,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    subAccountQuota: 1,
  },
  {
    tier: 'basic',
    name: '基础版',
    description: '适合中小企业，满足日常HR需求',
    monthlyPrice: 19900,
    yearlyPrice: 199000,
    maxEmployees: 50,
    maxAdminAccounts: 3,
    features: {
      basic: [
        '最多50名员工',
        '完整人事档案管理',
        '智能排班与考勤',
        '薪酬自动计算',
        '招聘流程管理',
      ],
      advanced: [
        '绩效管理',
        '培训记录',
        '基础报表',
        '邮件提醒',
      ],
      premium: [],
    },
    aiQuota: 100,
    storageQuota: 5120,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    subAccountQuota: 3,
  },
  {
    tier: 'professional',
    name: '专业版',
    description: '适合成长型企业，深度人效分析',
    monthlyPrice: 59900,
    yearlyPrice: 599000,
    maxEmployees: 200,
    maxAdminAccounts: 10,
    features: {
      basic: [
        '最多200名员工',
        '所有基础版功能',
      ],
      advanced: [
        'AI智能分析',
        '人才盘点九宫格',
        '预测性人效分析',
        '离职风险预警',
        '智能面试官',
        'AI培训推荐',
        '工作流引擎',
        '高级报表中心',
      ],
      premium: [
        '优先客服支持',
        '品牌自定义',
      ],
    },
    aiQuota: 1000,
    storageQuota: 20480,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    subAccountQuota: 10,
  },
  {
    tier: 'enterprise',
    name: '企业版',
    description: '适合大型企业，专属定制服务',
    monthlyPrice: 199900,
    yearlyPrice: 1999000,
    maxEmployees: 9999,
    maxAdminAccounts: 999,
    features: {
      basic: [
        '无员工数量限制',
        '所有专业版功能',
      ],
      advanced: [
        '专属客户经理',
        '私有化部署',
        '定制化开发',
        'SSO单点登录',
        '高级安全审计',
        '专属服务器',
        '无限AI调用',
      ],
      premium: [
        '24/7专属支持',
        '培训服务',
        '季度复盘会议',
      ],
    },
    aiQuota: 999999,
    storageQuota: 102400,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    subAccountQuota: 999,
  },
];

// 会员等级图标映射
const TIER_ICONS = {
  free: Star,
  basic: Users,
  professional: Gem,
  enterprise: Crown,
};

// 会员等级颜色映射
const TIER_COLORS = {
  free: 'bg-gray-500',
  basic: 'bg-blue-500',
  professional: 'bg-purple-500',
  enterprise: 'bg-amber-500',
};

export default function MembershipTierManager({
  currentSubscription,
  plans = DEFAULT_PLANS,
  subAccounts = [],
  onUpgrade,
  onCreateSubAccount,
  onEditSubAccount,
  onDeleteSubAccount,
  onRenew,
}: MembershipTierManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier | null>(null);
  const [showCreateSubAccount, setShowCreateSubAccount] = useState(false);
  const [newSubAccount, setNewSubAccount] = useState({
    name: '',
    email: '',
    role: 'employee' as const,
    department: '',
  });

  const currentPlan = plans.find(p => p.tier === currentSubscription?.currentTier);

  // 计算子账号使用情况
  const subAccountUsage = useMemo(() => {
    const maxSubAccounts = currentPlan?.subAccountQuota || 0;
    const usedSubAccounts = currentSubscription?.usedSubAccounts || 0;
    const availableSubAccounts = maxSubAccounts - usedSubAccounts;

    return {
      max: maxSubAccounts,
      used: usedSubAccounts,
      available: availableSubAccounts,
      percentage: maxSubAccounts > 0 ? (usedSubAccounts / maxSubAccounts) * 100 : 0,
    };
  }, [currentPlan, currentSubscription]);

  // 根据员工数和套餐动态计算子账号配额
  const calculateSubAccountQuota = useMemo(() => {
    if (!currentPlan) return 0;

    const employeeCount = currentSubscription?.employeeCount || 0;
    const baseQuota = currentPlan.subAccountQuota;

    // 企业版: 无限制
    if (currentPlan.tier === 'enterprise') {
      return 999;
    }

    // 专业版: 每20名员工可增加1个子账号
    if (currentPlan.tier === 'professional') {
      return baseQuota + Math.floor(employeeCount / 20);
    }

    // 基础版: 每50名员工可增加1个子账号
    if (currentPlan.tier === 'basic') {
      return baseQuota + Math.floor(employeeCount / 50);
    }

    // 免费版: 固定1个
    return baseQuota;
  }, [currentPlan, currentSubscription]);

  // 处理创建子账号
  const handleCreateSubAccount = () => {
    if (subAccountUsage.available <= 0) {
      alert('子账号配额已用完，请升级套餐');
      return;
    }

    if (newSubAccount.name && newSubAccount.email) {
      onCreateSubAccount?.(newSubAccount);
      setNewSubAccount({ name: '', email: '', role: 'employee', department: '' });
      setShowCreateSubAccount(false);
    }
  };

  // 处理升级套餐
  const handleUpgrade = (tier: MembershipTier) => {
    setSelectedPlan(tier);
    onUpgrade?.(tier, billingPeriod);
  };

  return (
    <div className="space-y-6">
      {/* 当前套餐概览 */}
      {currentSubscription && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentPlan && (
                  <div className={cn("p-4 rounded-xl", TIER_COLORS[currentPlan.tier], "bg-white/20")}>
                    {React.createElement(TIER_ICONS[currentPlan.tier], { className: "h-8 w-8" })}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl text-white">{currentPlan?.name}</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    {currentPlan?.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-white/70">员工数</p>
                  <p className="text-2xl font-bold">{currentSubscription.employeeCount}</p>
                  <p className="text-xs text-white/60">/ {currentPlan?.maxEmployees || '无限'}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">子账号</p>
                  <p className="text-2xl font-bold">{subAccountUsage.used}</p>
                  <p className="text-xs text-white/60">/ {calculateSubAccountQuota}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">AI调用</p>
                  <p className="text-2xl font-bold">{currentPlan?.aiQuota}</p>
                  <p className="text-xs text-white/60">次/月</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">到期时间</p>
                  <p className="text-2xl font-bold">
                    {currentSubscription.isTrial && currentSubscription.trialDaysRemaining
                      ? `${currentSubscription.trialDaysRemaining}天`
                      : new Date(currentSubscription.subscriptionExpiry).toLocaleDateString('zh-CN')}
                  </p>
                  {currentSubscription.isTrial && (
                    <p className="text-xs text-white/60">试用中</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {currentSubscription.isTrial && (
                  <Button
                    variant="secondary"
                    onClick={onRenew}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    立即升级
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={onRenew}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  续费
                </Button>
              </div>
            </div>

            {/* 套餐进度条 */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">员工数</span>
                  <span>{currentSubscription.employeeCount} / {currentPlan?.maxEmployees || '无限'}</span>
                </div>
                <Progress
                  value={currentPlan?.maxEmployees ? (currentSubscription.employeeCount / currentPlan.maxEmployees) * 100 : 50}
                  className="h-2 bg-white/20"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">存储空间</span>
                  <span>{((currentSubscription.usedStorage / (currentPlan?.storageQuota || 1)) * 100).toFixed(0)}% / 100%</span>
                </div>
                <Progress
                  value={(currentSubscription.usedStorage / (currentPlan?.storageQuota || 1)) * 100}
                  className="h-2 bg-white/20"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">子账号</span>
                  <span>{subAccountUsage.used} / {calculateSubAccountQuota}</span>
                </div>
                <Progress
                  value={subAccountUsage.percentage}
                  className="h-2 bg-white/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">套餐概览</TabsTrigger>
          <TabsTrigger value="subaccounts">子账号管理</TabsTrigger>
          <TabsTrigger value="upgrade">升级套餐</TabsTrigger>
          <TabsTrigger value="billing">账单管理</TabsTrigger>
        </TabsList>

        {/* 套餐概览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const Icon = TIER_ICONS[plan.tier];
              const isCurrentPlan = currentSubscription?.currentTier === plan.tier;

              return (
                <Card
                  key={plan.tier}
                  className={cn(
                    "relative transition-all hover:shadow-lg",
                    isCurrentPlan && "ring-2 ring-purple-500"
                  )}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 -right-2 bg-purple-500">当前套餐</Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2 rounded-lg", TIER_COLORS[plan.tier], "text-white")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {plan.tier === 'enterprise' && <Crown className="h-5 w-5 text-amber-500" />}
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ¥{billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice / 100}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground">/{billingPeriod === 'yearly' ? '年' : '月'}</span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">员工数</span>
                        <span className="font-medium">{plan.maxEmployees === 9999 ? '无限' : plan.maxEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">子账号</span>
                        <span className="font-medium">{plan.subAccountQuota}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI调用</span>
                        <span className="font-medium">{plan.aiQuota}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">存储空间</span>
                        <span className="font-medium">{plan.storageQuota / 1024}GB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 子账号管理 */}
        <TabsContent value="subaccounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">子账号管理</h3>
              <p className="text-sm text-muted-foreground mt-1">
                已使用 {subAccountUsage.used} / {calculateSubAccountQuota} 个子账号
              </p>
            </div>
            <Button
              onClick={() => setShowCreateSubAccount(true)}
              disabled={subAccountUsage.available <= 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              添加子账号
            </Button>
          </div>

          {subAccountUsage.available <= 0 && (
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100">子账号配额已用完</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                      当前套餐最多支持 {calculateSubAccountQuota} 个子账号，请升级套餐以获取更多配额
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {subAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {account.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{account.role}</Badge>
                          {account.department && <Badge variant="secondary">{account.department}</Badge>}
                          <Badge
                            variant={account.status === 'active' ? 'default' : 'secondary'}
                          >
                            {account.status === 'active' ? '活跃' : account.status === 'inactive' ? '未激活' : '已禁用'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => onEditSubAccount?.(account.id, account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {onEditSubAccount && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditSubAccount(account.id, {
                            status: account.status === 'active' ? 'inactive' : 'active',
                          })}
                        >
                          {account.status === 'active' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteSubAccount?.(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {subAccounts.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无子账号</p>
                  <Button className="mt-4" onClick={() => setShowCreateSubAccount(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    添加第一个子账号
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 升级套餐 */}
        <TabsContent value="upgrade" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">升级套餐</h3>
              <p className="text-sm text-muted-foreground mt-1">选择适合企业的套餐版本</p>
            </div>
            <div className="flex items-center gap-2">
              <Label>按月</Label>
              <input
                type="checkbox"
                checked={billingPeriod === 'yearly'}
                onChange={(e) => setBillingPeriod(e.target.checked ? 'yearly' : 'monthly')}
                className="toggle"
              />
              <Label>按年</Label>
              <Badge variant="outline">年付省{billingPeriod === 'yearly' ? '17%' : '0%'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {plans.filter(p => p.tier !== 'free').map((plan) => {
              const Icon = TIER_ICONS[plan.tier];
              const isCurrentPlan = currentSubscription?.currentTier === plan.tier;
              const yearlySavings = plan.monthlyPrice > 0 ? (plan.monthlyPrice * 12 - plan.yearlyPrice) / 100 : 0;

              return (
                <Card
                  key={plan.tier}
                  className={cn(
                    "relative transition-all hover:shadow-xl",
                    isCurrentPlan && "ring-2 ring-purple-500 scale-105",
                    plan.tier === 'professional' && !isCurrentPlan && "border-purple-500",
                    plan.tier === 'enterprise' && !isCurrentPlan && "border-amber-500"
                  )}
                >
                  {plan.tier === 'professional' && !isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                      推荐套餐
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                      当前套餐
                    </Badge>
                  )}

                  <CardHeader className="text-center">
                    <div className={cn("p-3 rounded-xl mx-auto", TIER_COLORS[plan.tier], "text-white")}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className="text-4xl font-bold">
                        ¥{billingPeriod === 'yearly' ? (plan.yearlyPrice / 100).toLocaleString() : (plan.monthlyPrice / 100).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/{billingPeriod === 'yearly' ? '年' : '月'}</span>
                      {billingPeriod === 'yearly' && yearlySavings > 0 && (
                        <div className="mt-1">
                          <Badge variant="secondary">年付省¥{yearlySavings.toLocaleString()}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plan.features.basic.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.features.advanced.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.features.premium.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : 'default'}
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? '当前套餐' : '立即升级'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 账单管理 */}
        <TabsContent value="billing" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold">账单管理</h3>
            <p className="text-sm text-muted-foreground mt-1">查看和管理订阅账单</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>账单历史</CardTitle>
              <CardDescription>查看历史订阅和支付记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">暂无账单记录</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 创建子账号对话框 */}
      <Dialog open={showCreateSubAccount} onOpenChange={setShowCreateSubAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加子账号</DialogTitle>
            <DialogDescription>
              创建一个新的子账号，当前剩余配额: {subAccountUsage.available}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={newSubAccount.name}
                onChange={(e) => setNewSubAccount({ ...newSubAccount, name: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={newSubAccount.email}
                onChange={(e) => setNewSubAccount({ ...newSubAccount, email: e.target.value })}
                placeholder="请输入邮箱地址"
              />
            </div>
            <div>
              <Label htmlFor="role">角色</Label>
              <Select
                value={newSubAccount.role}
                onValueChange={(value: any) => setNewSubAccount({ ...newSubAccount, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">员工</SelectItem>
                  <SelectItem value="manager">经理</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">部门</Label>
              <Input
                id="department"
                value={newSubAccount.department}
                onChange={(e) => setNewSubAccount({ ...newSubAccount, department: e.target.value })}
                placeholder="请输入部门"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateSubAccount(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSubAccount}>
              <UserPlus className="h-4 w-4 mr-2" />
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
