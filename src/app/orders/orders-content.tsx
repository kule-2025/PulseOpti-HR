'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingBag,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function OrdersContent() {
  // 模拟订单数据
  const orders = [
    {
      id: 'ORD20240220001',
      plan: '专业版',
      description: '专业版 - 年度订阅',
      amount: 499,
      status: '已完成',
      paymentMethod: '微信支付',
      orderDate: '2024-02-20',
      expireDate: '2025-02-20',
      invoiceStatus: '已开具',
    },
    {
      id: 'ORD20240215002',
      plan: '基础版',
      description: '基础版 - 年度订阅',
      amount: 199,
      status: '已完成',
      paymentMethod: '支付宝',
      orderDate: '2024-02-15',
      expireDate: '2025-02-15',
      invoiceStatus: '已开具',
    },
    {
      id: 'ORD20240218003',
      plan: '企业版',
      description: '企业版 - 年度订阅',
      amount: 999,
      status: '处理中',
      paymentMethod: '银行转账',
      orderDate: '2024-02-18',
      expireDate: '-',
      invoiceStatus: '未开具',
    },
  ];

  // 模拟当前套餐
  const currentPlan = {
    name: '专业版',
    status: '生效中',
    startDate: '2024-02-20',
    expireDate: '2025-02-20',
    remainingDays: 365,
    features: [
      '员工人数：最多 200 人',
      'AI助手：每月 200 次',
      '客服支持：专属客服',
      'API接口：标准API',
      '工作流：自定义流程',
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '处理中':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '已取消':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case '待支付':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已完成':
        return <CheckCircle2 className="h-4 w-4" />;
      case '处理中':
        return <Clock className="h-4 w-4" />;
      case '已取消':
        return <XCircle className="h-4 w-4" />;
      case '待支付':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          订单管理
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          查看和管理您的订阅订单
        </p>
      </div>

      {/* 当前套餐卡片 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-blue-900 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">当前套餐</CardTitle>
              <CardDescription>您的会员订阅状态</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              {currentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 套餐信息 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentPlan.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>开始日期：{currentPlan.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>到期日期：{currentPlan.expireDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span>剩余天数：{currentPlan.remainingDays} 天</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">包含功能</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col justify-center gap-3">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                续费套餐
              </Button>
              <Button variant="outline">
                升级套餐
              </Button>
              <Button variant="outline">
                下载发票
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>订单记录</CardTitle>
          <CardDescription>您的所有订单历史</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">全部订单</TabsTrigger>
              <TabsTrigger value="completed">已完成</TabsTrigger>
              <TabsTrigger value="pending">处理中</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>套餐名称</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>订单日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发票</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.plan}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ¥{order.amount}
                        </span>
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{order.orderDate}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.expireDate !== '-' && `到期: ${order.expireDate}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="mr-1">{getStatusIcon(order.status)}</span>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={order.invoiceStatus === '已开具' ? 'default' : 'outline'}
                          className={
                            order.invoiceStatus === '已开具'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : ''
                          }
                        >
                          {order.invoiceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.invoiceStatus === '已开具' && (
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>套餐名称</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>订单日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发票</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter((item: any) => (order) => order.status === '已完成')
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.plan}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ¥{order.amount}
                          </span>
                        </TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">{order.orderDate}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.expireDate !== '-' && `到期: ${order.expireDate}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="mr-1">{getStatusIcon(order.status)}</span>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order.invoiceStatus === '已开具' ? 'default' : 'outline'}
                            className={
                              order.invoiceStatus === '已开具'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : ''
                            }
                          >
                            {order.invoiceStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.invoiceStatus === '已开具' && (
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>套餐名称</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>订单日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发票</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter((item: any) => (order) => order.status === '处理中')
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.plan}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ¥{order.amount}
                          </span>
                        </TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">{order.orderDate}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.expireDate !== '-' && `到期: ${order.expireDate}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="mr-1">{getStatusIcon(order.status)}</span>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order.invoiceStatus === '已开具' ? 'default' : 'outline'}
                            className={
                              order.invoiceStatus === '已开具'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : ''
                            }
                          >
                            {order.invoiceStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <ShoppingBag className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">温馨提示</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• 订单支付成功后，会员权益将在 1 分钟内自动激活</li>
                <li>• 如需开具发票，请在订单完成后在订单详情中申请</li>
                <li>• 如有任何问题，请联系客服：support@hrnavigator.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
