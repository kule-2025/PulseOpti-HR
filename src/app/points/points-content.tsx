'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Gift,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface EmployeePoint {
  id: string;
  companyId: string;
  employeeId: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  rank: number | null;
  level: string | null;
}

interface LeaderboardItem {
  id: string;
  companyId: string;
  period: string;
  periodValue: string;
  employeeId: string;
  employeeName: string;
  departmentId: string | null;
  departmentName: string | null;
  position: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  earnedPoints: number;
  rank: number;
  trend: string;
  rankChange: number;
}

interface PointTransaction {
  id: string;
  companyId: string;
  employeeId: string;
  transactionType: string;
  points: number;
  balanceAfter: number;
  source: string;
  sourceId: string | null;
  description: string | null;
  remarks: string | null;
  createdAt: string;
}

interface ExchangeItem {
  id: string;
  companyId: string | null;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  pointsRequired: number;
  stock: number;
  unlimitedStock: boolean;
  value: number | null;
  tags: string[];
}

interface MonthlyStats {
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
}

export default function PointsPageContent() {
  const [companyId] = useState('example-company-id');
  const [loading, setLoading] = useState(true);
  const [employeePoints, setEmployeePoints] = useState<EmployeePoint | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalEarned: 0,
    totalRedeemed: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/points/dashboard?companyId=${companyId}`);
      const data = await response.json();

      if (data.success) {
        setEmployeePoints(data.data.employeePoints);
        setLeaderboard(data.data.leaderboard);
        setRecentTransactions(data.data.recentTransactions);
        setExchangeItems(data.data.availableExchangeItems);
        setMonthlyStats(data.data.monthlyStats);
      }
    } catch (error) {
      console.error('获取积分仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat('zh-CN').format(points);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeem':
        return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'adjust':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      earn: { label: '获得', color: 'bg-green-100 text-green-700' },
      redeem: { label: '消费', color: 'bg-orange-100 text-orange-700' },
      adjust: { label: '调整', color: 'bg-blue-100 text-blue-700' },
    };
    const badge = badges[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-orange-500" />
            积分管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            积分系统 · 规则配置 · 兑换商城
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            手动调整
          </Button>
        </div>
      </div>

      {/* 积分总览 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 当前积分 */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              可用积分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gradient-primary bg-clip-text text-transparent">
                {formatPoints(employeePoints?.availablePoints || 0)}
              </span>
              <span className="text-sm text-gray-500">分</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">总积分</span>
                <p className="font-semibold">{formatPoints(employeePoints?.totalPoints || 0)}</p>
              </div>
              <div>
                <span className="text-gray-500">已使用</span>
                <p className="font-semibold text-orange-600">
                  {formatPoints(employeePoints?.usedPoints || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本月统计 */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              本月统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">获得积分</div>
                <div className="text-2xl font-bold text-green-600">
                  +{formatPoints(monthlyStats.totalEarned)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">消费积分</div>
                <div className="text-2xl font-bold text-orange-600">
                  -{formatPoints(monthlyStats.totalRedeemed)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-500 mb-1">交易次数</div>
              <div className="text-lg font-semibold">{monthlyStats.transactionCount} 次</div>
            </div>
          </CardContent>
        </Card>

        {/* 排名与等级 */}
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              我的排名
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  #{employeePoints?.rank || '-'}
                </div>
                <div className="text-sm text-gray-500">
                  当前等级: {employeePoints?.level || '未定级'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">积分排行榜</TabsTrigger>
          <TabsTrigger value="transactions">积分明细</TabsTrigger>
          <TabsTrigger value="exchange">兑换商城</TabsTrigger>
          <TabsTrigger value="rules">积分规则</TabsTrigger>
        </TabsList>

        {/* 积分排行榜 */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>积分排行榜</CardTitle>
                  <CardDescription>查看公司积分排名，激发团队活力</CardDescription>
                </div>
                <Link href="/points/reports">
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    查看更多
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.slice(0, 10).map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg transition-all',
                      index === 0 && 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200',
                      index === 1 && 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200',
                      index === 2 && 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200',
                      index > 2 && 'bg-white hover:bg-gray-50'
                    )}
                  >
                    {/* 排名 */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full font-bold',
                        index === 0 && 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-xl',
                        index === 1 && 'bg-gradient-to-br from-gray-400 to-gray-500 text-white text-lg',
                        index === 2 && 'bg-gradient-to-br from-orange-500 to-amber-600 text-white text-lg',
                        index > 2 && 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : item.rank}
                    </div>

                    {/* 头像和姓名 */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn(
                        'text-white font-semibold',
                        index === 0 && 'bg-gradient-to-br from-yellow-500 to-orange-500',
                        index === 1 && 'bg-gradient-to-br from-gray-400 to-gray-500',
                        index === 2 && 'bg-gradient-to-br from-orange-500 to-amber-600',
                        index > 2 && 'bg-blue-600'
                      )}>
                        {item.employeeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.departmentName || '未知部门'} · {item.position || '未知职位'}
                      </div>
                    </div>

                    {/* 积分 */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gradient-primary bg-clip-text text-transparent">
                        {formatPoints(item.totalPoints)}
                      </div>
                      <div className="text-xs text-gray-500">
                        本期 +{formatPoints(item.earnedPoints)}
                      </div>
                    </div>

                    {/* 趋势 */}
                    {item.trend !== 'stable' && (
                      <div className={cn(
                        'flex items-center gap-1 text-sm',
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {item.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(item.rankChange)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 积分明细 */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>积分明细</CardTitle>
                  <CardDescription>查看所有积分变动记录</CardDescription>
                </div>
                <Link href="/points/records">
                  <Button variant="outline">
                    查看全部
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无积分记录</p>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white hover:bg-gray-50 transition-all"
                    >
                      {/* 类型图标 */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                        {getTransactionIcon(transaction.transactionType)}
                      </div>

                      {/* 描述 */}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {transaction.description || transaction.source}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                          {transaction.remarks && ` · ${transaction.remarks}`}
                        </div>
                      </div>

                      {/* 类型标签 */}
                      {getTransactionBadge(transaction.transactionType)}

                      {/* 积分变动 */}
                      <div
                        className={cn(
                          'text-xl font-bold',
                          transaction.transactionType === 'earn'
                            ? 'text-green-600'
                            : transaction.transactionType === 'redeem'
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        )}
                      >
                        {transaction.transactionType === 'earn' ? '+' : transaction.transactionType === 'redeem' ? '-' : ''}
                        {formatPoints(transaction.points)}
                      </div>

                      {/* 变动后余额 */}
                      <div className="text-sm text-gray-500">
                        余额: {formatPoints(transaction.balanceAfter)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 兑换商城 */}
        <TabsContent value="exchange" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">兑换商城</h2>
              <p className="text-gray-600 dark:text-gray-400">
                使用积分兑换丰富奖品
              </p>
            </div>
            <Link href="/points/exchange">
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                进入商城
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {exchangeItems.slice(0, 8).map((item) => (
              <Card key={item.id} className="card-hover group">
                <CardHeader className="pb-3">
                  {item.imageUrl ? (
                    <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-3">
                      <Gift className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                  <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description || '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">所需积分</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatPoints(item.pointsRequired)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">库存</div>
                    <div className={cn(
                      'text-sm font-medium',
                      item.unlimitedStock || item.stock > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {item.unlimitedStock ? '无限' : item.stock}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant={item.unlimitedStock || item.stock > 0 ? 'default' : 'secondary'}
                    disabled={!item.unlimitedStock && item.stock <= 0}
                  >
                    {item.unlimitedStock || item.stock > 0 ? '立即兑换' : '已售罄'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 积分规则 */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>积分规则</CardTitle>
                  <CardDescription>管理积分获取和消费规则</CardDescription>
                </div>
                <Link href="/points/rules">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    配置规则
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* 获得积分 */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    获得积分
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div>
                        <div className="font-medium text-green-900">完成绩效目标</div>
                        <div className="text-sm text-green-700">每完成一个目标获得10-50积分</div>
                      </div>
                      <Badge className="bg-green-600 text-white">+10~50</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div>
                        <div className="font-medium text-green-900">参加培训课程</div>
                        <div className="text-sm text-green-700">每完成一门课程获得20积分</div>
                      </div>
                      <Badge className="bg-green-600 text-white">+20</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div>
                        <div className="font-medium text-green-900">全勤奖励</div>
                        <div className="text-sm text-green-700">每月全勤可获得100积分</div>
                      </div>
                      <Badge className="bg-green-600 text-white">+100</Badge>
                    </div>
                  </div>
                </div>

                {/* 扣除积分 */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    扣除积分
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                      <div>
                        <div className="font-medium text-orange-900">迟到早退</div>
                        <div className="text-sm text-orange-700">每次扣除5积分</div>
                      </div>
                      <Badge className="bg-orange-600 text-white">-5</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                      <div>
                        <div className="font-medium text-orange-900">缺勤</div>
                        <div className="text-sm text-orange-700">每次扣除20积分</div>
                      </div>
                      <Badge className="bg-orange-600 text-white">-20</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                      <div>
                        <div className="font-medium text-orange-900">兑换商品</div>
                        <div className="text-sm text-orange-700">根据商品价格扣除相应积分</div>
                      </div>
                      <Badge className="bg-orange-600 text-white">消费</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
