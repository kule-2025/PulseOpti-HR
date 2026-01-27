'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Target,
  Award,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

type MetricCategory = 'turnover' | 'retention' | 'engagement' | 'productivity' | 'satisfaction';
type MetricTrend = 'up' | 'down' | 'stable';

interface OrganizationMetric {
  id: string;
  category: MetricCategory;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: MetricTrend;
  trendValue: number;
  period: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

export default function OrganizationMetricsPage() {
  const [metrics, setMetrics] = useState<OrganizationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('current');

  useEffect(() => {
    // 模拟获取组织指标数据
    setTimeout(() => {
      setMetrics([
        {
          id: '1',
          category: 'turnover',
          name: '员工流失率',
          value: 12.5,
          target: 10,
          unit: '%',
          trend: 'up',
          trendValue: 2.3,
          period: '2024-Q1',
          status: 'warning',
          description: '员工流失率超过目标值，需要关注关键人才保留',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '2',
          category: 'retention',
          name: '核心人才留存率',
          value: 85,
          target: 90,
          unit: '%',
          trend: 'down',
          trendValue: 5,
          period: '2024-Q1',
          status: 'warning',
          description: '核心人才留存率下降，建议加强激励机制',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '3',
          category: 'engagement',
          name: '员工敬业度',
          value: 78,
          target: 80,
          unit: '分',
          trend: 'up',
          trendValue: 3,
          period: '2024-Q1',
          status: 'good',
          description: '员工敬业度稳步提升，继续保持',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '4',
          category: 'productivity',
          name: '人均产出',
          value: 85,
          target: 80,
          unit: '万元',
          trend: 'up',
          trendValue: 8,
          period: '2024-Q1',
          status: 'good',
          description: '人均产出超过目标，效率提升明显',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '5',
          category: 'satisfaction',
          name: '员工满意度',
          value: 76,
          target: 75,
          unit: '分',
          trend: 'up',
          trendValue: 2,
          period: '2024-Q1',
          status: 'good',
          description: '员工满意度达标，需持续关注',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '6',
          category: 'turnover',
          name: '新员工流失率',
          value: 25,
          target: 15,
          unit: '%',
          trend: 'up',
          trendValue: 8,
          period: '2024-Q1',
          status: 'critical',
          description: '新员工流失率过高，需要优化入职流程和培训体系',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '7',
          category: 'retention',
          name: '高潜人才留存率',
          value: 82,
          target: 85,
          unit: '%',
          trend: 'down',
          trendValue: 3,
          period: '2024-Q1',
          status: 'warning',
          description: '高潜人才流失风险，建议加快晋升通道建设',
          lastUpdated: '2024-01-31T10:00:00',
        },
        {
          id: '8',
          category: 'engagement',
          name: '团队协作指数',
          value: 72,
          target: 75,
          unit: '分',
          trend: 'stable',
          trendValue: 0,
          period: '2024-Q1',
          status: 'warning',
          description: '团队协作有待加强，建议组织团队建设活动',
          lastUpdated: '2024-01-31T10:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('指标已刷新');
    }, 1000);
  };

  const filteredMetrics = metrics.filter((metric) => {
    const matchesCategory = categoryFilter === 'all' || metric.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || metric.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const categoryConfig: Record<MetricCategory, { label: string; color: string; icon: any }> = {
    turnover: { label: '流失率', color: 'bg-red-500', icon: TrendingUp },
    retention: { label: '留存率', color: 'bg-green-500', icon: Users },
    engagement: { label: '敬业度', color: 'bg-blue-500', icon: Award },
    productivity: { label: '生产力', color: 'bg-purple-500', icon: BarChart3 },
    satisfaction: { label: '满意度', color: 'bg-yellow-500', icon: Target },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    good: { label: '良好', color: 'bg-green-500' },
    warning: { label: '警告', color: 'bg-yellow-500' },
    critical: { label: '严重', color: 'bg-red-500' },
  };

  const categories = Array.from(new Set(metrics.map((m) => m.category)));

  const statistics = {
    total: metrics.length,
    good: metrics.filter((m) => m.status === 'good').length,
    warning: metrics.filter((m) => m.status === 'warning').length,
    critical: metrics.filter((m) => m.status === 'critical').length,
    avgTargetCompletion: metrics.length > 0
      ? (metrics.filter((m) => m.value >= m.target).length / metrics.length) * 100
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              组织指标
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              监控组织关键绩效指标
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总指标数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">良好</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.good}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">警告</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.warning}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">严重</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">目标达成率</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.avgTargetCompletion.toFixed(0)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(categoryConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">当前周期</SelectItem>
                  <SelectItem value="last">上一周期</SelectItem>
                  <SelectItem value="yoy">同比</SelectItem>
                  <SelectItem value="qoq">环比</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 指标列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredMetrics.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无指标数据</p>
            </div>
          ) : (
            filteredMetrics.map((metric) => {
              const CategoryIcon = categoryConfig[metric.category].icon;
              const trendUp = metric.trend === 'up';
              const TrendIcon = trendUp ? TrendingUp : TrendingDown;

              return (
                <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${categoryConfig[metric.category].color} text-white border-0 flex items-center gap-1`}>
                            <CategoryIcon className="h-3 w-3" />
                            {categoryConfig[metric.category].label}
                          </Badge>
                          <Badge className={statusConfig[metric.status].color + ' text-white border-0'}>
                            {statusConfig[metric.status].label}
                          </Badge>
                          <span className="text-sm">{metric.period}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 数值显示 */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-4xl font-bold text-blue-600">
                            {metric.value}
                            <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">
                              {metric.unit}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            目标：{metric.target} {metric.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.trend !== 'stable' && (
                            <div className={`flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                              <TrendIcon className="h-4 w-4" />
                              <span className="font-medium">
                                {trendUp ? '+' : '-'}{Math.abs(metric.trendValue)}{metric.unit}
                              </span>
                            </div>
                          )}
                          {metric.trend === 'stable' && (
                            <span className="text-gray-500">持平</span>
                          )}
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">完成度</span>
                          <span className="font-medium">
                            {metric.value >= metric.target ? '已达标' : '未达标'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              metric.value >= metric.target ? 'bg-green-500' :
                              metric.value >= metric.target * 0.8 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* 描述 */}
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {metric.description}
                      </p>

                      {/* 时间 */}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        更新时间：{new Date(metric.lastUpdated).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* 分类统计 */}
        <Card>
          <CardHeader>
            <CardTitle>分类指标统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const CategoryIcon = config.icon;
                const categoryMetrics = metrics.filter((m) => m.category === key);
                const goodCount = categoryMetrics.filter((m) => m.status === 'good').length;
                const totalCount = categoryMetrics.length;

                return (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full ${config.color.replace('bg-', 'bg-opacity-10')} flex items-center justify-center`}>
                        <CategoryIcon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                      </div>
                      <span className="font-medium">{config.label}</span>
                </div>
                    <div className="text-2xl font-bold">
                      {totalCount > 0 ? `${goodCount}/${totalCount}` : '-'}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      达标数 / 总数
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
