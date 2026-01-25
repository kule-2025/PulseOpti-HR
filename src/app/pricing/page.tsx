'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Crown,
  Gem,
  Building2,
  Zap,
  X,
  ArrowRight,
  ShieldCheck,
  HeadphonesIcon,
  BarChart3,
  Users,
  Clock,
  Check,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  Rocket,
  Target,
  Lightbulb,
  Award,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 四级会员体系配置
const PLANS = [
  {
    id: 'free',
    name: '免费版',
    tag: '体验版',
    description: '体验核心功能，感受HR数字化魅力',
    yearlyPrice: 0,
    monthlyPrice: 0,
    employees: 30,
    subAccounts: 0,
    features: [
      { icon: Users, text: '员工管理', value: '最多 30 人', highlight: false },
      { icon: BarChart3, text: '组织架构', value: '基础功能', highlight: false },
      { icon: Check, text: '招聘管理', value: '基础发布', highlight: false },
      { icon: Check, text: '绩效管理', value: '基础评估', highlight: false },
      { icon: Zap, text: 'AI助手', value: '每月 3 次', highlight: true },
      { icon: ShieldCheck, text: '数据安全', value: '基础保护', highlight: false },
      { icon: Clock, text: '客服支持', value: '社区支持', highlight: false },
    ],
    aiFeatures: ['岗位画像', '简历筛选'],
    limitations: [
      '无工作流引擎',
      '无人效监测',
      '无离职分析',
      '限制数据导出',
    ],
    cta: '立即开始',
    color: 'from-gray-400 to-gray-500',
    gradient: 'bg-gradient-to-br from-gray-50 to-slate-100',
    borderColor: 'border-gray-200',
    popular: false,
    period: '永久免费',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 'basic',
    name: '基础版',
    tag: '入门首选',
    description: '适合 10-50 人初创团队，快速启动HR数字化',
    yearlyPrice: 599,
    monthlyPrice: 59,
    employees: 50,
    subAccounts: 3,
    features: [
      { icon: Users, text: '员工管理', value: '最多 50 人', highlight: true },
      { icon: BarChart3, text: '组织架构', value: '完整功能', highlight: true },
      { icon: Check, text: '招聘管理', value: '完整流程', highlight: true },
      { icon: Check, text: '绩效管理', value: '完整评估', highlight: true },
      { icon: Zap, text: 'AI助手', value: '每月 50 次', highlight: true },
      { icon: ShieldCheck, text: '数据安全', value: '企业级保护', highlight: true },
      { icon: HeadphonesIcon, text: '客服支持', value: '在线客服', highlight: true },
      { icon: Rocket, text: '工作流引擎', value: '标准模板', highlight: true },
    ],
    aiFeatures: ['岗位画像', '简历筛选', '人才九宫格', '离职分析', '智能面试'],
    limitations: [],
    cta: '立即订阅',
    color: 'from-blue-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    borderColor: 'border-blue-200',
    popular: true,
    period: '/年',
    icon: <Crown className="w-8 h-8" />,
  },
  {
    id: 'professional',
    name: '专业版',
    tag: '增长利器',
    description: '适合 50-100 人成长型企业，驱动业务倍增',
    yearlyPrice: 1499,
    monthlyPrice: 129,
    employees: 100,
    subAccounts: 9,
    features: [
      { icon: Users, text: '员工管理', value: '最多 100 人', highlight: true },
      { icon: BarChart3, text: '组织架构', value: '完整 + 高级分析', highlight: true },
      { icon: Check, text: '招聘管理', value: '完整 + AI筛选', highlight: true },
      { icon: Check, text: '绩效管理', value: '完整 + 自定义模板', highlight: true },
      { icon: Zap, text: 'AI助手', value: '每月 200 次', highlight: true },
      { icon: ShieldCheck, text: '数据安全', value: '企业级 + 加密', highlight: true },
      { icon: HeadphonesIcon, text: '客服支持', value: '专属客服', highlight: true },
      { icon: Rocket, text: '工作流引擎', value: '自定义流程', highlight: true },
      { icon: TrendingUp, text: '人效监测', value: '完整系统', highlight: true },
      { icon: Target, text: '人才盘点', value: '九宫格 + IDP', highlight: true },
    ],
    aiFeatures: ['全部基础版AI', '绩效预测', '人效归因', '决策建议', 'IDP'],
    limitations: [],
    cta: '立即订阅',
    color: 'from-purple-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
    borderColor: 'border-purple-200',
    popular: false,
    period: '/年',
    icon: <Gem className="w-8 h-8" />,
  },
  {
    id: 'enterprise',
    name: '企业版',
    tag: '旗舰之选',
    description: '适合 100-500 人大型企业，全面数字化管理',
    yearlyPrice: 2999,
    monthlyPrice: 259,
    employees: 500,
    subAccounts: 50,
    features: [
      { icon: Users, text: '员工管理', value: '最多 500 人', highlight: true },
      { icon: BarChart3, text: '组织架构', value: '完整 + 高级分析', highlight: true },
      { icon: Check, text: '招聘管理', value: '完整 + AI筛选', highlight: true },
      { icon: Check, text: '绩效管理', value: '完整 + 自定义模板', highlight: true },
      { icon: Zap, text: 'AI助手', value: '无限次', highlight: true },
      { icon: ShieldCheck, text: '数据安全', value: '企业级 + 专属加密', highlight: true },
      { icon: HeadphonesIcon, text: '客服支持', value: '7x24 专属客服', highlight: true },
      { icon: Rocket, text: '工作流引擎', value: '完全自定义', highlight: true },
      { icon: TrendingUp, text: '人效监测', value: '完整 + 预测系统', highlight: true },
      { icon: Lightbulb, text: 'AI面试官', value: '智能面试 + 评分', highlight: true },
      { icon: Award, text: '专属服务', value: '实施培训 + 定制', highlight: true },
    ],
    aiFeatures: ['全部专业版AI', '高级预测', 'AI面试官', 'AI培训推荐', 'API接入'],
    limitations: [],
    cta: '立即订阅',
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-50 via-white to-red-50',
    borderColor: 'border-orange-200',
    popular: false,
    period: '/年',
    icon: <Building2 className="w-8 h-8" />,
  },
];

const FAQs = [
  {
    question: '免费版可以升级吗？如何操作？',
    answer: '可以随时升级。登录后进入【会员中心】，选择需要升级的套餐，完成支付后立即生效。升级后，员工人数、AI功能、工作流等权益自动扩展。',
  },
  {
    question: '年费套餐相比月费有什么优势？',
    answer: '年费套餐可节省约 17% 费用。例如基础版月费 ¥59/月 × 12 = ¥708，而年费仅需 ¥599，立省 ¥109。年费套餐更适合长期使用的企业。',
  },
  {
    question: '月付和年付有什么区别？如何切换？',
    answer: '月付和年付仅计费周期不同，功能权益完全一致。月付灵活性高，适合短期使用；年付性价比更高，适合长期规划。您可以在订阅页面随时切换计费周期，系统会自动计算差价。',
  },
  {
    question: '员工人数超标了怎么办？',
    answer: '您可以升级到更高套餐，或单独购买员工数扩容包。基础版每增加 10 人年费 ¥100，专业版每增加 20 人年费 ¥200，企业版无人数限制。',
  },
  {
    question: 'AI 助手次数用完了怎么办？',
    answer: '您可以升级套餐获得更多 AI 次数，或单独购买 AI 次数包（¥99/100 次）。AI 次数按月结算，月底清零，建议合理规划使用。',
  },
  {
    question: '支持哪些支付方式？',
    answer: '支持微信支付、支付宝、企业对公转账。企业对公转账可开具增值税专用发票，发票类型：信息技术服务费。',
  },
  {
    question: '可以退款吗？',
    answer: '新用户购买 7 天内可无理由全额退款。超过 7 天或已使用满一个月的套餐不支持退款。退款请联系客服，确认后 3-5 个工作日原路退回。',
  },
  {
    question: '数据安全有保障吗？',
    answer: '我们采用企业级加密技术（AES-256），定期数据备份（每日备份 + 异地容灾），通过 ISO27001 信息安全管理体系认证。数据存储在中国境内，符合数据安全法要求。',
  },
];

const ADVANTAGES = [
  {
    icon: <Zap className="w-7 h-7" />,
    title: '价格优势',
    description: '价格仅为竞品的 3%-20%，无需高昂投入即可享受专业 HR SaaS 服务',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: 'AI 深度集成',
    description: '8 大 AI 功能，岗位画像、人才盘点、离职分析、智能面试，让 HR 工作更智能',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
  },
  {
    icon: <Rocket className="w-7 h-7" />,
    title: '工作流引擎',
    description: '15 种标准流程，可视化编辑、自定义节点，适配企业个性化需求',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
  },
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: '人效监测',
    description: 'AI驱动的深度归因分析，预测模型 + 干预建议，提升组织效能',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: '数据安全',
    description: '企业级加密 + 多重备份，ISO27001 认证，数据存储在中国境内',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'from-cyan-50 to-sky-50',
    borderColor: 'border-cyan-200',
  },
  {
    icon: <HeadphonesIcon className="w-7 h-7" />,
    title: '专属服务',
    description: '7x24 专属客服 + 实施培训 + 定制开发，全程保障您的使用体验',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);

  const getPrice = (plan: typeof PLANS[0]) => {
    return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getMonthlyPrice = (plan: typeof PLANS[0]) => {
    if (plan.yearlyPrice === 0) return 0;
    return Math.ceil(plan.yearlyPrice / 12);
  };

  const handleSelectPlan = async (plan: typeof PLANS[0]) => {
    if (plan.id === 'free') {
      window.location.href = '/register';
    } else {
      setSelectedPlan(plan);

      // 获取用户信息（如果已登录）
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();

          // 创建订单
          const createOrderResponse = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.user.id,
              planId: plan.id,
              billingPeriod: billingPeriod === 'yearly' ? 'yearly' : 'monthly',
              paymentMethod: 'wechat',
            }),
          });

          if (createOrderResponse.ok) {
            const orderData = await createOrderResponse.json();

            // 跳转到支付页面
            window.location.href = `/pay/${orderData.orderId}`;
          } else {
            const errorData = await createOrderResponse.json();
            alert(errorData.error || '创建订单失败');
          }
        } else {
          // 未登录，跳转到登录页
          window.location.href = '/login?redirect=/pricing';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败，请重试');
      }
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 - 添加返回首页按钮 */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900">
                  返回首页
                </Button>
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-lg font-bold text-gray-900">会员订阅</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold">
                  免费试用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - 参考飞书简洁现代风格 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 text-sm px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              价格仅为竞品的 3%-20%，超值之选
            </Badge>

            <h1 className="mb-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              选择适合您的
              <span className="block mt-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                会员套餐
              </span>
            </h1>

            <p className="mb-12 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              透明定价，无隐藏费用。降本增效，让每一分钱都花在刀刃上。
              <br />
              随时升级，随时取消，风险零负担。
            </p>

            {/* Billing Toggle - 优化交互设计 */}
            <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 border border-white/20 shadow-2xl">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-blue-700 shadow-xl scale-105'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                按月付费
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-blue-700 shadow-xl scale-105'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                按年付费
                {billingPeriod === 'yearly' && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-2.5 py-1 shadow-lg border-0">
                    省 17%
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards - 参考钉钉清晰层次和薪人薪事专业感 */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, index) => {
            const price = getPrice(plan);
            const monthlyPrice = getMonthlyPrice(plan);

            return (
              <Card
                key={index}
                className={cn(
                  'relative overflow-hidden rounded-3xl transition-all duration-500',
                  'hover:shadow-2xl hover:-translate-y-2',
                  plan.gradient,
                  plan.borderColor,
                  'border-2',
                  plan.popular && 'ring-4 ring-blue-500/30 scale-105 shadow-2xl z-10'
                )}
              >
                {/* 推荐标签 */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-lg">
                    <Star className="inline-block w-3 h-3 mr-1" />
                    {plan.tag}
                  </div>
                )}

                <CardContent className="p-6">
                  {/* 标题 */}
                  <div className="mb-6">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br shadow-xl flex items-center justify-center text-white mb-4',
                      plan.color
                    )}>
                      {plan.icon}
                    </div>
                    <Badge className={cn(
                      'mb-2 font-semibold text-xs px-3 py-1',
                      plan.popular ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {plan.tag}
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* 价格 - 优化视觉层次 */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {price === 0 ? '免费' : `¥${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xl text-gray-600 font-medium">
                          {billingPeriod === 'yearly' ? '/年' : '/月'}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* 核心指标 */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/90 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                      <Users className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                      <p className="text-xs text-gray-600 mb-1">员工人数</p>
                      <p className="font-bold text-gray-900 text-lg">{plan.employees}人</p>
                    </div>
                    <div className="bg-white/90 rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                      <Crown className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                      <p className="text-xs text-gray-600 mb-1">子账号</p>
                      <p className="font-bold text-gray-900 text-lg">{plan.subAccounts}个</p>
                    </div>
                  </div>

                  {/* 功能列表 */}
                  <div className="mb-6">
                    <div className="space-y-3">
                      {plan.features.slice(0, 6).map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={cn(
                              'mt-0.5 shrink-0',
                              feature.highlight ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 font-semibold">{feature.text}</p>
                              <p className={cn(
                                'text-xs mt-0.5',
                                feature.highlight ? 'text-purple-700 font-medium' : 'text-gray-500'
                              )}>
                                {feature.value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI 功能 */}
                  {plan.aiFeatures.length > 0 && (
                    <div className="mb-6 bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI 功能
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.aiFeatures.map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2.5 py-1"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 限制说明 */}
                  {plan.limitations.length > 0 && (
                    <div className="mb-6 bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-gray-500" />
                        不包含
                      </p>
                      <ul className="space-y-1.5">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="mt-1">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA 按钮 */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      'w-full h-14 text-base font-bold rounded-2xl transition-all duration-300',
                      'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl'
                        : price === 0
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200'
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 优势对比 - 六宫格设计 */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              为什么选择 PulseOpti HR 脉策聚效？
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              与市场上主流 HR SaaS 产品相比，我们提供更具竞争力的价格和更强大的 AI 功能
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((advantage, index) => (
              <Card
                key={index}
                className={cn(
                  'border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
                  advantage.borderColor,
                  'bg-gradient-to-br',
                  advantage.bgColor
                )}
              >
                <CardContent className="p-8">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white mb-5',
                    advantage.color
                  )}>
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section - 优化交互体验 */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            常见问题
          </h2>
          <p className="text-gray-600 text-lg">
            您关心的问题，这里都有答案
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {FAQs.map((faq, index) => (
            <Card
              key={index}
              className={cn(
                'border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden',
                expandedFaq === index && 'border-blue-300 shadow-md'
              )}
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className={cn(
                    'font-semibold text-gray-900 pr-4 text-base',
                    expandedFaq === index && 'text-blue-700'
                  )}>
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 收款二维码区域 */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-700">
                <QrCode className="mr-2 h-3.5 w-3.5" />
                支付方式
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                扫码支付，便捷快速
              </h2>
              <p className="text-lg text-gray-600">
                支持微信支付、支付宝和企业对公转账
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* 微信支付 */}
              <Card className="border-2 border-green-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl">微信支付</CardTitle>
                  <CardDescription className="text-center">扫码快速支付</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-green-200 rounded-xl p-4">
                    <img
                      src="/assets/wechat-payment.png"
                      alt="微信支付二维码"
                      className="w-full aspect-square object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY3Ij7mnLrpgZrlsYJdPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    请使用微信扫一扫
                  </p>
                </CardContent>
              </Card>

              {/* 支付宝 */}
              <Card className="border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl">支付宝</CardTitle>
                  <CardDescription className="text-center">扫码快速支付</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
                    <img
                      src="/assets/alipay-payment.jpg"
                      alt="支付宝支付二维码"
                      className="w-full aspect-square object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY3Ij7mnLrpgZrlsYJdPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    请使用支付宝扫一扫
                  </p>
                </CardContent>
              </Card>

              {/* 对公转账 */}
              <Card className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl">对公转账</CardTitle>
                  <CardDescription className="text-center">企业专享</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">公司名称</p>
                    <p className="text-sm font-semibold text-gray-900">广州市XX科技有限公司</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">开户银行</p>
                    <p className="text-sm font-semibold text-gray-900">招商银行广州天河支行</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">银行账号</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">6225 8888 8888 8888</p>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    可开具增值税专用发票
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Alert className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
                <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  支付成功后，会员将自动激活。如有疑问，请联系客服：
                  <a href="mailto:PulseOptiHR@163.com" className="font-semibold underline ml-1">
                    PulseOptiHR@163.com
                  </a>
                  ，服务时间：周一至周五 9:00-12:00, 14:00-18:00
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - 优化视觉层次 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 text-white overflow-hidden shadow-2xl">
            <CardContent className="p-12 md:p-16 relative">
              {/* 背景装饰 */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />

              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  准备好开启 HR 数字化之旅了吗？
                </h2>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                  立即注册，免费体验核心功能。无信用卡，无风险，随时取消。
                  <br />
                  加入 10000+ 企业，让 HR 工作更智能高效。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="h-14 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => window.location.href = '/register'}
                  >
                    免费开始
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold rounded-2xl text-gray-900 transition-all duration-300"
                    onClick={() => window.location.href = '/contact'}
                  >
                    联系我们
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
