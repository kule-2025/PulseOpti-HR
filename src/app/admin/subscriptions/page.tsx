'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingBag,
  Plus,
  Search,
  Eye,
  Download,
  RefreshCw,
  Package,
  TrendingUp,
  CreditCard,
  Crown,
  Zap,
  BarChart3,
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isPopular: boolean;
  isPro: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  plan: SubscriptionPlan;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

// 订阅计划
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '基础版',
    description: '适合初创企业和小团队',
    price: 0,
    duration: 0,
    features: [
      '最多20个用户',
      '基础人事管理',
      '考勤打卡',
      '简单的绩效评估',
      '基础报表',
    ],
    isPopular: false,
    isPro: false,
  },
  {
    id: 'pro',
    name: '专业版',
    description: '适合成长型企业',
    price: 1999,
    duration: 30,
    features: [
      '最多100个用户',
      '全部基础功能',
      '高级权限管理',
      '自定义报表',
      '数据导出',
      'API接口',
      '工作流',
      '优先客服支持',
    ],
    isPopular: true,
    isPro: true,
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '适合大型企业',
    price: 9999,
    duration: 30,
    features: [
      '无限用户',
      '全部专业版功能',
      '专属客户经理',
      '定制化开发',
      '私有化部署',
      '24/7技术支持',
      '数据大屏',
      '高级分析',
    ],
    isPopular: false,
    isPro: true,
  },
];

// 模拟订单数据
const ORDERS_DATA: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-20250116-0001',
    companyName: '脉冲科技',
    contactPerson: '张总',
    contactEmail: 'zhang@pulsetech.com',
    phone: '138-0000-0001',
    plan: SUBSCRIPTION_PLANS[2],
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    amount: 9999,
    paymentMethod: '银行转账',
    paymentStatus: 'paid',
    createdAt: '2024-12-20',
  },
  {
    id: '2',
    orderNumber: 'ORD-20250115-0002',
    companyName: '创新科技',
    contactPerson: '李经理',
    contactEmail: 'li@innovation.com',
    phone: '138-0000-0002',
    plan: SUBSCRIPTION_PLANS[1],
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-02-14',
    amount: 1999,
    paymentMethod: '微信支付',
    paymentStatus: 'paid',
    createdAt: '2025-01-15',
  },
  {
    id: '3',
    orderNumber: 'ORD-20250114-0003',
    companyName: '未来软件',
    contactPerson: '王总',
    contactEmail: 'wang@future.com',
    phone: '138-0000-0003',
    plan: SUBSCRIPTION_PLANS[1],
    status: 'pending',
    startDate: '-',
    endDate: '-',
    amount: 1999,
    paymentMethod: '支付宝',
    paymentStatus: 'pending',
    createdAt: '2025-01-14',
  },
  {
    id: '4',
    orderNumber: 'ORD-20250110-0004',
    companyName: '云端科技',
    contactPerson: '赵经理',
    contactEmail: 'zhao@cloud.com',
    phone: '138-0000-0004',
    plan: SUBSCRIPTION_PLANS[0],
    status: 'active',
    startDate: '2025-01-10',
    endDate: '∞',
    amount: 0,
    paymentMethod: '-',
    paymentStatus: 'paid',
    createdAt: '2025-01-10',
  },
];

const ORDER_STATUS_CONFIG = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' },
  active: { label: '生效中', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  expired: { label: '已过期', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' },
  paid: { label: '已支付', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  failed: { label: '支付失败', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'plans'>('orders');

  // 过滤订单
  const filteredOrders = useMemo(() => {
    let orders = ORDERS_DATA;

    // 按订单状态过滤
    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    // 按支付状态过滤
    if (paymentFilter !== 'all') {
      orders = orders.filter(o => o.paymentStatus === paymentFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.companyName.toLowerCase().includes(query) ||
        o.contactPerson.toLowerCase().includes(query) ||
        o.contactEmail.toLowerCase().includes(query)
      );
    }

    return orders;
  }, [searchQuery, statusFilter, paymentFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const activeOrders = ORDERS_DATA.filter(o => o.status === 'active');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.amount, 0);
    const pendingRevenue = ORDERS_DATA.filter(o => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalOrders: ORDERS_DATA.length,
      activeSubscriptions: activeOrders.length,
      totalRevenue,
      pendingRevenue,
      monthlyRevenue: totalRevenue * 12,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            订单与订阅
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理客户订单和订阅服务
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <ShoppingBag className="h-4 w-4 mr-2" />
          新增订单
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>订单总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalOrders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              生效订阅
            </CardDescription>
            <CardTitle className="text-3xl">{stats.activeSubscriptions}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              月度收入
            </CardDescription>
            <CardTitle className="text-3xl">
              ¥{stats.totalRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              年度预估
            </CardDescription>
            <CardTitle className="text-3xl">
              ¥{stats.monthlyRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 订阅计划 */}
      <Card>
        <CardHeader>
          <CardTitle>订阅计划</CardTitle>
          <CardDescription>选择适合您企业的订阅方案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPro = plan.isPro;

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${
                    plan.isPopular
                      ? 'border-2 border-purple-600 shadow-lg scale-105'
                      : ''
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1">
                      最受欢迎
                    </div>
                  )}
                  {isPro && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="mb-4">
                      {plan.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price > 0 ? `¥${plan.price}` : '免费'}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          / 月
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-gray-900 dark:text-white">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : ''
                      }`}
                    >
                      {plan.price > 0 ? '立即订阅' : '免费使用'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>订单列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索订单..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部状态</option>
                {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部支付状态</option>
                {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>企业信息</TableHead>
                <TableHead>订阅计划</TableHead>
                <TableHead>订单状态</TableHead>
                <TableHead>支付状态</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>订阅期限</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        暂无订单
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        当前筛选条件下没有订单
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const orderStatusConfig = ORDER_STATUS_CONFIG[order.status];
                  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {order.createdAt}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.companyName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.contactPerson}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.contactEmail}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {order.plan.name}
                          </span>
                          {order.plan.isPro && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              PRO
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={orderStatusConfig.color}>
                          {orderStatusConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={paymentStatusConfig.color}>
                          {paymentStatusConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {order.amount > 0 ? `¥${order.amount.toLocaleString()}` : '免费'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.startDate} ~ {order.endDate}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.paymentStatus === 'pending' && (
                            <Button size="sm">
                              <CreditCard className="h-4 w-4 mr-1" />
                              催付
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
