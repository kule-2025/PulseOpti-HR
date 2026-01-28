'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import {
  Gift,
  Star,
  TrendingUp,
  Award,
  ShoppingBag,
  Gift as GiftIcon,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Clock,
  Trophy,
  Sparkles,
  Flame,
  Zap,
  Medal,
  Diamond,
  Crown,
} from 'lucide-react';

// 积分概览数据
const pointsStats = {
  totalPoints: 1250000,
  totalEarned: 850000,
  totalRedeemed: 320000,
  averagePoints: 2577,
  activeUsers: 485,
  redemptionRate: 37.6,
  monthlyGrowth: 12.5,
};

// 积分明细数据
const pointsRecords = [
  {
    id: 1,
    employee: '张三',
    department: '研发部',
    type: '获得',
    category: '项目完成',
    points: 500,
    description: '完成XX项目开发，按时交付',
    date: '2024-03-15',
    balance: 2577,
  },
  {
    id: 2,
    employee: '李四',
    department: '市场部',
    type: '获得',
    category: '客户好评',
    points: 300,
    description: '收到客户5星好评',
    date: '2024-03-14',
    balance: 1834,
  },
  {
    id: 3,
    employee: '王五',
    department: '产品部',
    type: '兑换',
    category: '商城兑换',
    points: -200,
    description: '兑换京东卡50元',
    date: '2024-03-13',
    balance: 3421,
  },
  {
    id: 4,
    employee: '赵六',
    department: '销售部',
    type: '获得',
    category: '销售冠军',
    points: 1000,
    description: '月度销售冠军',
    date: '2024-03-12',
    balance: 5678,
  },
];

// 兑换商城商品
const mallProducts = [
  {
    id: 1,
    name: '京东卡50元',
    description: '京东购物卡，面值50元',
    points: 500,
    image: '🎁',
    stock: 50,
    category: '电商卡',
    hot: true,
  },
  {
    id: 2,
    name: '星巴克咖啡券',
    description: '星巴克中杯咖啡券',
    points: 300,
    image: '☕',
    stock: 30,
    category: '餐饮',
    hot: true,
  },
  {
    id: 3,
    name: '电影票2张',
    description: '全国通用电影票2张',
    points: 600,
    image: '🎬',
    stock: 20,
    category: '娱乐',
    hot: false,
  },
  {
    id: 4,
    name: '健身卡月卡',
    description: '指定健身房月卡',
    points: 2000,
    image: '💪',
    stock: 15,
    category: '健康',
    hot: false,
  },
  {
    id: 5,
    name: 'Kindle电子书',
    description: '价值50元的Kindle电子书',
    points: 800,
    image: '📚',
    stock: 100,
    category: '学习',
    hot: false,
  },
  {
    id: 6,
    name: '年假1天',
    description: '额外年假1天',
    points: 3000,
    image: '🏖️',
    stock: 10,
    category: '福利',
    hot: false,
  },
];

// 积分规则
const pointsRules = [
  {
    id: 1,
    name: '项目完成',
    points: 500,
    description: '按时完成项目交付',
    category: '工作表现',
    dailyLimit: 1000,
  },
  {
    id: 2,
    name: '客户好评',
    points: 300,
    description: '收到客户5星好评',
    category: '客户服务',
    dailyLimit: 600,
  },
  {
    id: 3,
    name: '销售冠军',
    points: 1000,
    description: '月度销售冠军',
    category: '销售业绩',
    dailyLimit: null,
  },
  {
    id: 4,
    name: '培训完成',
    points: 200,
    description: '完成指定培训课程',
    category: '学习成长',
    dailyLimit: 400,
  },
  {
    id: 5,
    name: '团队贡献',
    points: 300,
    description: '帮助同事解决问题',
    category: '团队合作',
    dailyLimit: 600,
  },
];

// 排行榜数据
const leaderboardData = [
  { id: 1, name: '赵六', department: '销售部', points: 5678, rank: 1, avatar: '赵' },
  { id: 2, name: '王五', department: '产品部', points: 3421, rank: 2, avatar: '王' },
  { id: 3, name: '张三', department: '研发部', points: 2577, rank: 3, avatar: '张' },
  { id: 4, name: '李四', department: '市场部', points: 1834, rank: 4, avatar: '李' },
  { id: 5, name: '钱七', department: '运营部', points: 1567, rank: 5, avatar: '钱' },
];

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={Gift}
        title="积分管理"
        description="积分系统、规则配置、兑换商城"
        proBadge={true}
        breadcrumbs={[
          { name: 'SSC中心', href: '/ssc' },
          { name: '积分管理', href: '/dashboard/points' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              发放积分
            </Button>
          </div>
        }
      />

      {/* 积分概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              总积分
            </CardDescription>
            <CardTitle className="text-3xl">{pointsStats.totalPoints.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>本月增长 +12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              已发放
            </CardDescription>
            <CardTitle className="text-3xl">{pointsStats.totalEarned.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              累计发放积分
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              已兑换
            </CardDescription>
            <CardTitle className="text-3xl">{pointsStats.totalRedeemed.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              员工已兑换
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              平均积分
            </CardDescription>
            <CardTitle className="text-3xl">{pointsStats.averagePoints.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              每位员工平均
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">积分总览</TabsTrigger>
          <TabsTrigger value="records">积分明细</TabsTrigger>
          <TabsTrigger value="exchange">兑换商城</TabsTrigger>
          <TabsTrigger value="rules">积分规则</TabsTrigger>
        </TabsList>

        {/* 积分总览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 积分排行榜 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  积分排行榜
                </CardTitle>
                <CardDescription>
                  本月积分排名前10名
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        user.rank === 1
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-300 dark:border-yellow-700'
                          : user.rank === 2
                          ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-300 dark:border-gray-700'
                          : user.rank === 3
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-300 dark:border-orange-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        user.rank === 1
                          ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                          : user.rank === 2
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                          : user.rank === 3
                          ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {user.rank <= 3 ? (
                          <Medal className="h-5 w-5" />
                        ) : (
                          user.avatar
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {user.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          积分
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 积分统计 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">积分活跃度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">活跃用户</span>
                        <span className="font-medium">{pointsStats.activeUsers}人</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                          style={{ width: '85%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">兑换率</span>
                        <span className="font-medium">{pointsStats.redemptionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                          style={{ width: `${pointsStats.redemptionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    批量发放积分
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Sparkles className="h-4 w-4 mr-2" />
                    配置积分规则
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    添加兑换商品
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    导出积分报表
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 积分明细 */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>积分明细</CardTitle>
                  <CardDescription>
                    查看所有积分获得和兑换记录
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索员工..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                        record.type === '获得'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-red-500 to-orange-600'
                      }`}>
                        {record.type === '获得' ? (
                          <Plus className="h-6 w-6" />
                        ) : (
                          <ShoppingBag className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {record.employee}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {record.department} · {record.category}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {record.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          record.type === '获得'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {record.points > 0 ? '+' : ''}{record.points}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          余额: {record.balance}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {record.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 兑换商城 */}
        <TabsContent value="exchange" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                    兑换商城
                  </CardTitle>
                  <CardDescription>
                    员工使用积分兑换奖励
                  </CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  添加商品
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mallProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center text-4xl mb-3">
                          {product.image}
                        </div>
                        {product.hot && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            热门
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-purple-600">
                            {product.points} 积分
                          </span>
                          <Badge variant="outline">
                            库存: {product.stock}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Gift className="h-4 w-4" />
                          {product.category}
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          立即兑换
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 积分规则 */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    积分规则
                  </CardTitle>
                  <CardDescription>
                    配置积分获得和消耗规则
                  </CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  添加规则
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {rule.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {rule.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rule.category}
                          </Badge>
                          {rule.dailyLimit && (
                            <Badge variant="outline" className="text-xs">
                              每日上限: {rule.dailyLimit}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          +{rule.points}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          积分
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
