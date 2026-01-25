'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Briefcase, Building2, Star, ArrowRight } from 'lucide-react';

interface Plan {
  tier: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxEmployees: number;
  maxJobs: number;
  maxAdminAccounts: number;
  features: string[];
  limitations: string[];
  aiQuota: number;
  storageQuota: number;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  tag?: string;
}

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/memberships/pricing');
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('获取套餐信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (tier: string) => {
    router.push(`/membership/checkout?tier=${tier}&period=${billingPeriod}`);
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Briefcase className="h-8 w-8" />;
      case 'basic':
        return <Zap className="h-8 w-8" />;
      case 'professional':
        return <Star className="h-8 w-8" />;
      case 'enterprise':
        return <Crown className="h-8 w-8" />;
      default:
        return <Building2 className="h-8 w-8" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'professional':
        return 'from-purple-500 to-purple-600';
      case 'enterprise':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getMonthlyPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.ceil(getPrice(plan) / 12);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              选择适合您的套餐
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              助力中小企业业务倍增，提升组织人效
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                按月付费
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                按年付费
                {billingPeriod === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    省20%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const monthlyPrice = getMonthlyPrice(plan);

            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  plan.tag === '推荐'
                    ? 'ring-4 ring-purple-500 scale-105 shadow-xl'
                    : ''
                }`}
              >
                {plan.tag && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {plan.tag}
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPlanColor(plan.tier)} flex items-center justify-center text-white mb-4`}>
                    {getPlanIcon(plan.tier)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    {price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">免费</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-4xl font-bold text-gray-900">
                          ¥{price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {billingPeriod === 'yearly' ? '/年' : '/月'}
                        </div>
                        {billingPeriod === 'yearly' && (
                          <div className="text-sm text-blue-600 font-medium">
                            ¥{monthlyPrice.toLocaleString()}/月
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Key Specs */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">员工数量</span>
                      <span className="font-semibold">{plan.maxEmployees === 99999 ? '不限' : plan.maxEmployees + '人'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">管理账号</span>
                      <span className="font-semibold">{plan.maxAdminAccounts === 999 ? '不限' : plan.maxAdminAccounts + '个'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI配额</span>
                      <span className="font-semibold">{plan.aiQuota === 0 ? '无' : plan.aiQuota + '次/月'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">存储空间</span>
                      <span className="font-semibold">{plan.storageQuota / 1024}GB</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-900">
                      核心功能
                    </div>
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.tier)}
                    className={`w-full bg-gradient-to-r ${getPlanColor(plan.tier)} hover:opacity-90`}
                    disabled={plan.tier === 'free'}
                  >
                    {plan.tier === 'free' ? '当前套餐' : '立即购买'}
                    {plan.tier !== 'free' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">套餐对比</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 font-semibold">功能</th>
                      {plans.map((plan) => (
                        <th key={plan.tier} className="text-center p-4 font-semibold">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 text-gray-600">员工数量</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.maxEmployees === 99999 ? '不限' : plan.maxEmployees}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-gray-600">管理账号</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.maxAdminAccounts}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-gray-600">招聘职位</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.maxJobs === 99999 ? '不限' : plan.maxJobs}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-gray-600">AI调用次数</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.aiQuota === 0 ? '无' : plan.aiQuota}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-gray-600">优先支持</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.prioritySupport ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">API访问</td>
                      {plans.map((plan) => (
                        <td key={plan.tier} className="text-center p-4">
                          {plan.apiAccess ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
