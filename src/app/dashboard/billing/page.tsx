'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useForm } from '@/hooks/use-form';
import { useDebounce } from '@/hooks/use-debounce';
import { CreditCard, DollarSign, CheckCircle, Clock, AlertCircle, Plus, Search, Download } from 'lucide-react';
import { cn } from '@/lib/theme';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
  users: number;
  storage: string;
  support: string;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  employees: number;
}

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  method: string;
  date: string;
  invoiceUrl: string | null;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: '基础版',
    price: 999,
    period: '月',
    features: ['员工管理', '考勤打卡', '基础报表', '3GB存储', '邮件支持'],
    popular: false,
    users: 50,
    storage: '3GB',
    support: '邮件支持',
  },
  {
    id: 'professional',
    name: '专业版',
    price: 1999,
    period: '月',
    features: ['员工管理', '考勤打卡', '绩效评估', '招聘管理', '培训管理', '20GB存储', '电话支持'],
    popular: true,
    users: 200,
    storage: '20GB',
    support: '电话支持',
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: 4999,
    period: '月',
    features: ['所有专业版功能', '无限员工数', '无限存储', '专属客服', '定制开发', '数据备份'],
    popular: false,
    users: -1,
    storage: '无限',
    support: '专属客服',
  },
];

const generateMockSubscriptions = (): Subscription[] => [
  {
    id: 'sub-1',
    planId: 'professional',
    planName: '专业版',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    autoRenew: true,
    amount: 5997,
    employees: 156,
  },
];

const generateMockPayments = (): Payment[] =>
  Array.from({ length: 20 }, (_, i) => ({
    id: `payment-${i + 1}`,
    orderId: `ORD${String(i + 1).padStart(6, '0')}`,
    amount: 1999,
    status: i % 5 === 0 ? 'pending' : i % 10 === 0 ? 'failed' : 'paid',
    method: ['支付宝', '微信支付', '银行转账', '信用卡'][i % 4],
    date: `2024-0${String((i % 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    invoiceUrl: i % 5 !== 0 ? `https://example.com/invoice/${i + 1}` : null,
  }));

const statusMap = {
  active: { label: '使用中', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  expired: { label: '已过期', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle },
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  paid: { label: '已支付', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  failed: { label: '支付失败', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle },
};

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const [subscriptions] = useState<Subscription[]>(generateMockSubscriptions());
  const [payments] = useState<Payment[]>(generateMockPayments());

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((p) => p.orderId.toLowerCase().includes(query) || p.method.toLowerCase().includes(query));
    }
    if (statusFilter !== 'all') filtered = filtered.filter((p) => p.status === statusFilter);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, debouncedSearch, statusFilter]);

  const PaymentItem = useCallback((payment: Payment) => {
    const statusInfo = statusMap[payment.status];
    const StatusIcon = statusInfo.icon;
    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white">{payment.orderId}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.method} · {payment.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">¥{payment.amount.toLocaleString()}</p>
          </div>
          <Badge className={statusInfo.color} variant="secondary">
            <StatusIcon size={12} className="mr-1" />
            {statusInfo.label}
          </Badge>
          {payment.status === 'paid' && payment.invoiceUrl && (
            <Button variant="ghost" size="icon">
              <Download size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">订阅管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">套餐选择、账单管理</p>
        </div>
      </div>

      {subscriptions.length > 0 && subscriptions[0].status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle>当前订阅</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{subscriptions[0].planName}</h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" variant="secondary">
                    <CheckCircle size={12} className="mr-1" />
                    使用中
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  有效期至 {subscriptions[0].endDate} · {subscriptions[0].employees} 名员工
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">管理订阅</Button>
                <Button>升级套餐</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索订单号或支付方式..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
              <option value="all">全部状态</option>
              <option value="paid">已支付</option>
              <option value="pending">待支付</option>
              <option value="failed">支付失败</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="plans">套餐选择</TabsTrigger>
              <TabsTrigger value="payments">账单记录</TabsTrigger>
            </TabsList>

            <TabsContent value="plans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={cn(plan.popular ? 'border-2 border-blue-500 relative' : '')}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        推荐
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-center">{plan.name}</CardTitle>
                      <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">¥{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                        {plan.users === -1 ? '无限员工' : `${plan.users} 名员工`} · {plan.storage} 存储 · {plan.support}
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        {plan.popular ? '立即订阅' : '选择套餐'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-2">
                {filteredPayments.map(PaymentItem)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
