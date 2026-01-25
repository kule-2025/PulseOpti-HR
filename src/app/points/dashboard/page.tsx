'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Gift,
  Target,
  Star,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalPoints: number;
  earnedThisMonth: number;
  redeemedThisMonth: number;
  availablePoints: number;
  rank: number;
  level: string;
  nextLevelPoints: number;
  levelProgress: number;
  activeRules: number;
  totalEmployees: number;
  topEmployees: Array<{
    name: string;
    department: string;
    points: number;
    avatar: string;
  }>;
  recentActivities: Array<{
    type: 'earn' | 'redeem';
    employeeName: string;
    points: number;
    description: string;
    time: string;
  }>;
  trendData: Array<{
    month: string;
    earned: number;
    redeemed: number;
  }>;
}

export default function PointsDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getCurrentUser();
      if (!user || !user.companyId) {
        throw new Error('用户信息或企业ID不存在');
      }

      const response = await fetch(`/api/points/dashboard?companyId=${user.companyId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        // 转换API返回的数据格式到前端需要的格式
        const transformedStats: DashboardStats = {
          totalPoints: data.summary?.totalPoints || 0,
          earnedThisMonth: data.monthlyStats?.totalEarned || 0,
          redeemedThisMonth: data.monthlyStats?.totalRedeemed || 0,
          availablePoints: data.summary?.availablePoints || 0,
          rank: data.leaderboard?.findIndex((item: any) => item.employeeId === user.userId) + 1 || 0,
          level: '普通会员', // 可以根据积分等级系统计算
          nextLevelPoints: (data.summary?.totalPoints || 0) * 1.2,
          levelProgress: 75, // 根据等级系统计算
          activeRules: 12, // 从规则API获取
          totalEmployees: data.summary?.totalEmployees || 0,
          topEmployees: (data.leaderboard || []).slice(0, 5).map((item: any) => ({
            name: item.employeeName || '未知',
            department: item.departmentName || '未知',
            points: item.totalPoints || 0,
            avatar: (item.employeeName || '未知').substring(0, 2),
          })),
          recentActivities: (data.recentTransactions || []).slice(0, 5).map((item: any) => ({
            type: item.transactionType === 'earn' ? 'earn' : 'redeem',
            employeeName: item.employeeName || '未知',
            points: item.points || 0,
            description: item.description || item.reason || '未知',
            time: item.createdAt ? getTimeAgo(new Date(item.createdAt)) : '刚刚',
          })),
          trendData: [], // 需要从统计API获取历史数据
        };

        setStats(transformedStats);
      } else {
        throw new Error(result.error || '获取积分数据失败');
      }
    } catch (err) {
      console.error('获取积分仪表盘数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
      // 设置默认空数据
      setStats({
        totalPoints: 0,
        earnedThisMonth: 0,
        redeemedThisMonth: 0,
        availablePoints: 0,
        rank: 0,
        level: '普通会员',
        nextLevelPoints: 1000,
        levelProgress: 0,
        activeRules: 0,
        totalEmployees: 0,
        topEmployees: [],
        recentActivities: [],
        trendData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // 辅助函数：获取相对时间
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`;
    return `${Math.floor(diffInSeconds / 604800)}周前`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">积分仪表盘</h1>
              <p className="text-sm text-gray-600 mt-1">积分发放、消费趋势与员工参与度分析</p>
            </div>
            <Button variant="outline" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新数据
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总积分池</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPoints.toLocaleString() || 0}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                累计发放
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">本月发放</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">+{stats?.earnedThisMonth.toLocaleString() || 0}</div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                本月累计
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">本月兑换</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">-{stats?.redeemedThisMonth.toLocaleString() || 0}</div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Gift className="h-4 w-4 mr-1" />
                本月消费
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">活跃员工</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.totalEmployees || 0}</div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                参与积分系统
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 会员等级 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  会员等级
                </CardTitle>
                <CardDescription>当前等级与升级进度</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold">
                        {stats.level.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.level}</div>
                        <div className="text-sm text-gray-600">排名第 {stats.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">距离下一等级</div>
                      <div className="text-lg font-bold text-blue-600">
                        {(stats.nextLevelPoints - stats.totalPoints).toLocaleString()} 分
                      </div>
                    </div>
                  </div>
                )}
                <Progress value={stats?.levelProgress || 0} className="mb-2" />
                <div className="text-sm text-gray-600 text-center">
                  {stats ? `${stats.totalPoints.toLocaleString()} / ${stats.nextLevelPoints.toLocaleString()}` : '加载中...'}
                </div>
              </CardContent>
            </Card>

            {/* 积分趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  积分趋势
                </CardTitle>
                <CardDescription>近6个月积分发放与兑换趋势</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    {stats.trendData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1">{item.month}</div>
                          <div className="flex gap-2 text-xs text-gray-600">
                            <span className="text-blue-600">发放: {item.earned.toLocaleString()}</span>
                            <span className="text-orange-600">兑换: {item.redeemed.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          +{(item.earned - item.redeemed).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!stats && <div className="text-center text-gray-500 py-8">加载中...</div>}
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {activity.type === 'earn' ? <TrendingUp className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-medium">{activity.employeeName}</div>
                            <div className="text-sm text-gray-600">{activity.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${activity.type === 'earn' ? 'text-green-600' : 'text-orange-600'}`}>
                            {activity.type === 'earn' ? '+' : '-'}{activity.points}
                          </div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!stats && <div className="text-center text-gray-500 py-8">加载中...</div>}
              </CardContent>
            </Card>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 积分排行 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  积分排行榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    {stats.topEmployees.map((employee, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-gray-600">{employee.department}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{employee.points.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!stats && <div className="text-center text-gray-500 py-8">加载中...</div>}
              </CardContent>
            </Card>

            {/* 快速统计 */}
            <Card>
              <CardHeader>
                <CardTitle>快速统计</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">活跃规则</span>
                      </div>
                      <Badge>{stats.activeRules}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm">本月目标</span>
                      </div>
                      <div className="text-sm font-medium">
                        {stats.earnedThisMonth} / {stats.earnedThisMonth * 1.2}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">好评率</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">92.5%</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  查看排行榜
                </Button>
                <Button className="w-full" variant="outline">
                  <Gift className="h-4 w-4 mr-2" />
                  兑换商城
                </Button>
                <Button className="w-full" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  设置规则
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
