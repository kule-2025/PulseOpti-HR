'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, DollarSign, Clock, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function EfficiencyDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    revenuePerEmployee: 0,
    profitPerEmployee: 0,
    costPerEmployee: 0,
    employeeCount: 0,
    revenueGrowth: 0,
    productivityGrowth: 0,
    costGrowth: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        totalRevenue: 12500000,
        revenuePerEmployee: 416667,
        profitPerEmployee: 83333,
        costPerEmployee: 333334,
        employeeCount: 30,
        revenueGrowth: 12.5,
        productivityGrowth: 8.3,
        costGrowth: 4.2,
      });
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const MetricCard = ({ title, value, change, icon: Icon, prefix = '¥', suffix = '' }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm mt-2 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">人效仪表盘</h1>
          <p className="text-muted-foreground mt-1">企业人力资源效率概览</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年度</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">导出报告</Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="总收入"
          value={metrics.totalRevenue}
          change={metrics.revenueGrowth}
          icon={DollarSign}
        />
        <MetricCard
          title="人均营收"
          value={metrics.revenuePerEmployee}
          change={metrics.productivityGrowth}
          icon={Target}
        />
        <MetricCard
          title="人均利润"
          value={metrics.profitPerEmployee}
          change={metrics.productivityGrowth}
          icon={TrendingUp}
        />
        <MetricCard
          title="人均成本"
          value={metrics.costPerEmployee}
          change={metrics.costGrowth}
          icon={Clock}
        />
      </div>

      {/* 人效分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>人效趋势</CardTitle>
            <CardDescription>人均营收近12个月趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">图表开发中...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>成本结构</CardTitle>
            <CardDescription>人力成本占比分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">图表开发中...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 部门对比 */}
      <Card>
        <CardHeader>
          <CardTitle>部门人效对比</CardTitle>
          <CardDescription>各部门人均营收和利润对比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { department: '销售部', revenue: 800000, profit: 160000, employees: 8 },
              { department: '技术部', revenue: 600000, profit: 90000, employees: 12 },
              { department: '市场部', revenue: 450000, profit: 67500, employees: 5 },
              { department: '运营部', revenue: 300000, profit: 45000, employees: 4 },
              { department: '人力资源部', revenue: 100000, profit: 20500, employees: 1 },
            ].map((dept) => (
              <div key={dept.department} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{dept.department}</h3>
                    <p className="text-sm text-muted-foreground">{dept.employees} 人</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">人均营收</p>
                      <p className="font-semibold">{formatCurrency(dept.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">人均利润</p>
                      <p className="font-semibold">{formatCurrency(dept.profit)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>人效指数</span>
                    <span>{((dept.profit / dept.revenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(dept.profit / dept.revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关键指标 */}
      <Card>
        <CardHeader>
          <CardTitle>关键人效指标</CardTitle>
          <CardDescription>人力资源管理效率核心指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">员工流失率</p>
              <p className="text-3xl font-bold">8.5%</p>
              <p className="text-xs text-green-600 mt-1">↓ 1.2% 同比下降</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">人均培训时长</p>
              <p className="text-3xl font-bold">24h</p>
              <p className="text-xs text-green-600 mt-1">↑ 3h 同比增长</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">招聘周期</p>
              <p className="text-3xl font-bold">18天</p>
              <p className="text-xs text-green-600 mt-1">↓ 3天 同比下降</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">员工满意度</p>
              <p className="text-3xl font-bold">4.2</p>
              <p className="text-xs text-green-600 mt-1">↑ 0.3 同比增长</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">加班时长</p>
              <p className="text-3xl font-bold">5.2h</p>
              <p className="text-xs text-green-600 mt-1">↓ 1.5h 同比下降</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">出勤率</p>
              <p className="text-3xl font-bold">96.8%</p>
              <p className="text-xs text-muted-600 mt-1">→ 0.1% 基本持平</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
