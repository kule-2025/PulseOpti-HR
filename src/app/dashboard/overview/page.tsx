'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Activity,
  Zap,
  ArrowRight,
  Bell,
  ChevronRight,
  Calendar,
  Target,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Building2,
  UserCheck,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface DashboardStats {
  employees: {
    total: number;
    active: number;
    probation: number;
    newHires: number;
  };
  recruitment: {
    activeJobs: number;
    totalCandidates: number;
    hired: number;
  };
  performance: {
    cycleId: string;
    cycleName: string;
    completedRecords: number;
    totalRecords: number;
    completionRate: string;
    avgScore: string;
  } | null;
  efficiency: {
    avgRevenuePerEmployee: number;
    growth: string;
    turnoverRate: string;
  };
  subscription: {
    tier: string;
    maxEmployees: number;
    aiQuota: number;
  };
  analytics: {
    departmentStats: Array<{
      departmentName: string;
      count: number;
    }>;
    recruitmentTrend: Array<{
      month: string;
      count: number;
    }>;
    performanceDistribution: {
      excellent: number;
      good: number;
      average: number;
      needsImprovement: number;
    } | null;
    aiUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      employees: number;
      hiring: number;
    }>;
    talentDistribution: Array<{
      department: string;
      count: number;
      avgScore: number;
    }>;
  };
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

interface RecentAlert {
  type: string;
  title: string;
  time: string;
  icon: any;
}

// 默认数据常量
const DEFAULT_STATS: DashboardStats = {
  employees: { total: 0, active: 0, probation: 0, newHires: 0 },
  recruitment: { activeJobs: 0, totalCandidates: 0, hired: 0 },
  performance: null,
  efficiency: { avgRevenuePerEmployee: 0, growth: '0%', turnoverRate: '0%' },
  subscription: { tier: 'free', maxEmployees: 0, aiQuota: 0 },
  analytics: {
    departmentStats: [],
    recruitmentTrend: [],
    performanceDistribution: null,
    aiUsage: { used: 0, total: 0, percentage: 0 },
    monthlyTrend: [],
    talentDistribution: [],
  },
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: '发布新职位',
    description: '快速创建招聘需求',
    icon: Briefcase,
    href: '/dashboard/recruitment/job-posting',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  {
    title: '发起绩效评估',
    description: '设定目标与KPI',
    icon: Target,
    href: '/dashboard/performance/goal-setting',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  {
    title: '员工入职',
    description: '快速办理入职手续',
    icon: Users,
    href: '/dashboard/workflows/onboarding',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  {
    title: 'AI岗位画像',
    description: '智能生成岗位描述',
    icon: Sparkles,
    href: '/dashboard/ai-assistant/job-profile',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
];

const RECENT_ALERTS: RecentAlert[] = [
  {
    type: 'warning',
    title: '3名员工即将转正',
    time: '今天',
    icon: Clock,
  },
  {
    type: 'info',
    title: 'Q4绩效评估即将开始',
    time: '明天',
    icon: Calendar,
  },
  {
    type: 'success',
    title: '2个职位已成功招聘',
    time: '昨天',
    icon: CheckCircle,
  },
];

// 统计卡片组件（使用React.memo优化性能）
const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  extra,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color: string;
  extra?: React.ReactNode;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center justify-between">
          <span>{title}</span>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          {extra}
          <div className="text-gray-600">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
});

// 骨架屏组件
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 获取当前用户信息
  const getCurrentUser = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }, []);

  // 获取告警颜色
  const getAlertColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  }, []);

  // 判断是否是新用户
  const isNewUser = useMemo(() => {
    const user = getCurrentUser();
    if (!user) return false;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(user.createdAt) > sevenDaysAgo;
  }, [getCurrentUser]);

  // 优化的数据获取函数
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getCurrentUser();
      const companyId = user?.companyId || '';

      const response = await fetch(`/api/dashboard/stats?companyId=${companyId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success && data.data) {
        // 确保所有数组字段都有默认值
        const safeStats: DashboardStats = {
          ...data.data,
          analytics: {
            ...data.data.analytics,
            departmentStats: data.data.analytics?.departmentStats || [],
            monthlyTrend: data.data.analytics?.monthlyTrend || [],
            talentDistribution: data.data.analytics?.talentDistribution || [],
            aiUsage: data.data.analytics?.aiUsage || { used: 0, total: 0, percentage: 0 },
            performanceDistribution: data.data.analytics?.performanceDistribution || null,
          },
        };
        setStats(safeStats);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err) {
      console.error('获取仪表盘数据失败:', err);
      setError('加载数据失败，请检查网络连接后重试');
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // 优化的快捷操作卡片
  const quickActions = useMemo(() => QUICK_ACTIONS, []);

  // 优化的告警列表
  const recentAlerts = useMemo(() => RECENT_ALERTS, []);

  // 加载状态
  if (loading && !stats) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <StatsSkeleton />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // 错误状态
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button size="sm" variant="outline" onClick={fetchDashboardStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 p-6">
      {/* 新用户欢迎横幅 */}
      {isNewUser && (
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 transition-all hover:shadow-md">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-blue-900">欢迎加入 PulseOpti HR！</span>
              <span className="text-blue-700 ml-2">我们为您准备了5分钟快速上手指南</span>
            </div>
            <Link href="/docs">
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
                开始探索
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* 欢迎横幅 */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="relative z-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">早安，李明 👋</h1>
            <p className="mb-6 text-lg text-blue-50">
              今天有 <span className="font-semibold">{stats.employees.newHires}</span> 位新同事入职，
              <span className="font-semibold"> {stats.recruitment.activeJobs}</span> 个职位正在招聘中
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20 transition-all hover:scale-105"
              >
                查看今日任务
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 transition-all hover:scale-105"
              >
                查看团队概况
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速统计 - 飞书风格卡片 */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="员工总数"
            value={stats.employees.total}
            description={`在职 ${stats.employees.active}`}
            icon={Users}
            color="text-blue-600"
            extra={
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+{stats.employees.newHires} 本月</span>
              </div>
            }
          />
          <StatCard
            title="招聘中职位"
            value={stats.recruitment.activeJobs}
            description={`候选人 ${stats.recruitment.totalCandidates}`}
            icon={Briefcase}
            color="text-purple-600"
            extra={
              <div className="flex items-center gap-1 text-green-600">
                <UserCheck className="h-3 w-3" />
                <span>{stats.recruitment.hired} 已入职</span>
              </div>
            }
          />
          <StatCard
            title="绩效完成率"
            value={stats.performance ? stats.performance.completionRate : '0%'}
            description={stats.performance ? `平均分 ${stats.performance.avgScore}` : ''}
            icon={Target}
            color="text-green-600"
            extra={
              stats.performance && (
                <div className="w-24">
                  <Progress value={parseInt(stats.performance.completionRate)} className="h-2" />
                </div>
              )
            }
          />
          <StatCard
            title="人均营收"
            value={`¥${(stats.efficiency.avgRevenuePerEmployee / 10000).toFixed(1)}万`}
            description={`离职率 ${stats.efficiency.turnoverRate}`}
            icon={DollarSign}
            color="text-orange-600"
            extra={
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>{stats.efficiency.growth}</span>
              </div>
            }
          />
        </div>
      )}

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="alerts">提醒事项</TabsTrigger>
          <TabsTrigger value="actions">快捷操作</TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 部门人员分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  部门人员分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.analytics?.departmentStats?.map((dept) => (
                    <div key={dept.departmentName}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{dept.departmentName}</span>
                        <span className="text-sm text-gray-600">{dept.count}人</span>
                      </div>
                      <Progress
                        value={stats.employees.total > 0 ? (dept.count / stats.employees.total) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI使用情况 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI 使用情况
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stats.analytics.aiUsage.used}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    / {stats.analytics.aiUsage.total} 次
                  </div>
                  <Progress value={stats.analytics.aiUsage.percentage} className="h-3" />
                  <div className="text-sm text-gray-600 mt-2">
                    本月已使用 {stats.analytics.aiUsage.percentage}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 数据分析标签页 */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 月度趋势分析 */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  月度趋势分析
                </CardTitle>
                <CardDescription>营收、员工、招聘趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2 px-4">
                  {stats.analytics?.monthlyTrend?.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full space-y-1">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                          style={{
                            height: `${Math.min((item.revenue / 500000) * 100, 100)}%`,
                            minHeight: '4px',
                          }}
                          title={`营收: ¥${(item.revenue / 10000).toFixed(0)}万`}
                        />
                        <div
                          className="w-full bg-green-500 rounded transition-all hover:bg-green-600 cursor-pointer"
                          style={{
                            height: `${Math.min((item.employees / 100) * 100, 100)}%`,
                            minHeight: '4px',
                          }}
                          title={`员工: ${item.employees}人`}
                        />
                        <div
                          className="w-full bg-purple-500 rounded-b transition-all hover:bg-purple-600 cursor-pointer"
                          style={{
                            height: `${Math.min((item.hiring / 20) * 100, 100)}%`,
                            minHeight: '4px',
                          }}
                          title={`招聘: ${item.hiring}人`}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-2">{item.month}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>营收</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>员工</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span>招聘</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 绩效分布 */}
            {stats.performance && stats.analytics.performanceDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    绩效分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: '优秀', value: stats.analytics.performanceDistribution.excellent, color: 'text-green-600' },
                      { label: '良好', value: stats.analytics.performanceDistribution.good, color: 'text-blue-600' },
                      { label: '一般', value: stats.analytics.performanceDistribution.average, color: 'text-gray-600' },
                      { label: '需改进', value: stats.analytics.performanceDistribution.needsImprovement, color: 'text-red-600' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className={`text-sm ${item.color}`}>{item.value}人</span>
                        </div>
                        <Progress
                          value={(item.value / stats.employees.total) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 人才分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  人才分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.analytics?.talentDistribution?.map((item) => (
                    <div key={item.department}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.department}</span>
                        <span className="text-sm text-gray-600">
                          {item.count}人 · {item.avgScore}分
                        </span>
                      </div>
                      <Progress value={Math.min((item.avgScore / 100) * 100, 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 提醒事项标签页 */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                提醒事项
              </CardTitle>
              <CardDescription>需要您关注的事项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${getAlertColor(alert.type)}`}
                  >
                    <alert.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm opacity-75 mt-1">{alert.time}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 快捷操作标签页 */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      立即开始
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
