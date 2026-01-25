'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ArrowLeft,
  Home,
  User,
  Crown,
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // 套餐名称映射
  const tierNames: Record<string, string> = {
    free: '免费版',
    basic: '基础版',
    professional: '专业版',
    enterprise: '企业版',
  };

  // 加载订单和订阅信息
  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 获取用户信息
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        throw new Error('获取用户信息失败');
      }
      const userData = await userResponse.json();

      // 获取订阅信息
      const subResponse = await fetch(`/api/subscriptions?companyId=${userData.data.user.companyId}`);
      if (!subResponse.ok) {
        throw new Error('获取订阅信息失败');
      }
      const subData = await subResponse.json();
      setSubscription(subData.data?.[0] || null);

      // 获取订单信息（如果需要显示）
      // const orderResponse = await fetch(`/api/orders/list?orderId=${orderId}`);
      // const orderData = await orderResponse.json();
      // setOrder(orderData.data?.find((o: any) => o.id === orderId));

    } catch (err: any) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-green-600 mb-4" />
          <p className="text-xl text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* 成功图标 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            支付成功！
          </h1>
          <p className="text-lg text-gray-600">
            恭喜您，会员已激活
          </p>
        </div>

        {/* 订阅信息卡片 */}
        <Card className="border-2 border-green-200 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-yellow-500" />
              会员信息
            </CardTitle>
            <CardDescription>您的会员已成功激活</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {subscription ? (
              <div className="space-y-6">
                {/* 套餐类型 */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">套餐类型</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {tierNames[subscription.tier]}
                      </div>
                    </div>
                  </div>
                  <Badge className="text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                    已激活
                  </Badge>
                </div>

                {/* 有效期 */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      开始日期
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      到期日期
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(subscription.endDate).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>

                {/* 权益 */}
                <div>
                  <div className="text-sm text-gray-600 mb-3">会员权益</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        最多 {subscription.maxEmployees} 人
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        AI 智能助手
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        工作流引擎
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        人效监测
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600">
                正在加载会员信息...
              </div>
            )}
          </CardContent>
        </Card>

        {/* 温馨提示 */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">温馨提示</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>您的会员已成功激活，可以立即使用所有功能</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>订单详情已发送至您的邮箱，请查收</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>如有疑问，请联系客服：PulseOptiHR@163.com</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="flex-1 h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="w-5 h-5 mr-2" />
            进入仪表盘
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/orders')}
            className="flex-1 h-14 text-base font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            查看订单
          </Button>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
