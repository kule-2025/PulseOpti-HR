'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');

  // 套餐名称映射
  const tierNames: Record<string, string> = {
    free: '免费版',
    basic: '基础版',
    professional: '专业版',
    enterprise: '企业版',
  };

  // 订单状态映射
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: '待支付', color: 'bg-amber-500', icon: Clock },
    paid: { label: '已支付', color: 'bg-green-500', icon: CheckCircle2 },
    cancelled: { label: '已取消', color: 'bg-gray-500', icon: XCircle },
    failed: { label: '支付失败', color: 'bg-red-500', icon: XCircle },
    refunded: { label: '已退款', color: 'bg-blue-500', icon: ArrowLeft },
  };

  // 加载订单列表
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '加载订单失败');
      }

      setOrders(data.data || []);
    } catch (err: any) {
      setError(err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">加载订单列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 顶部导航 */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回仪表盘
          </Link>
          <Button
            variant="outline"
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            刷新
          </Button>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            我的订单
          </h1>
          <p className="text-gray-600 text-lg">
            查看和管理您的订单历史
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert className="mb-8 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 空状态 */}
        {!error && orders.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                暂无订单
              </h3>
              <p className="text-gray-600 mb-6">
                您还没有任何订单，去购买一个套餐吧
              </p>
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                前往购买
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 订单列表 */}
        {!error && orders.length > 0 && (
          <div className="grid gap-6">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card
                  key={order.id}
                  className="border-2 border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {tierNames[order.tier]} - {order.period === 'yearly' ? '年付' : '月付'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            订单号: {order.orderNo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={cn("px-4 py-2", status.color)}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          订单金额
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatAmount(order.amount)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <FileText className="w-4 h-4" />
                          套餐类型
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {tierNames[order.tier]}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          支付周期
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {order.period === 'yearly' ? '1 年' : '1 个月'}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => window.location.href = `/pay/${order.id}`}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          立即支付
                        </Button>
                      )}
                      {order.status === 'paid' && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = '/dashboard'}
                        >
                          查看会员
                        </Button>
                      )}
                      {(order.status === 'cancelled' || order.status === 'failed') && (
                        <Button
                          onClick={() => window.location.href = '/pricing'}
                          className="flex-1"
                        >
                          重新购买
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
