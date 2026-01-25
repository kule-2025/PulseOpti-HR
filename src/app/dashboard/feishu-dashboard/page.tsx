'use client';

import { useState, useMemo, useEffect } from 'react';
import { FeishuDashboardCard } from '@/components/dashboard/feishu-dashboard-card';
import { DataDrillDown } from '@/components/dashboard/data-drill-down';
import { InteractiveChart } from '@/components/dashboard/interactive-chart';
import { RealTimeDataRefresh } from '@/components/dashboard/real-time-data-refresh';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Award,
  GraduationCap,
  Building2,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  LucideIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 数据类型定义
interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  activeJobs: number;
  avgPerformance: number;
  revenuePerEmployee: number;
  trainingCompletion: number;
  retentionRate: number;
  turnoverRate: number;
}

interface MonthlyDataPoint {
  name: string;
  revenue: number;
  employees: number;
  hiring: number;
  performance: number;
}

interface StatCard {
  title: string;
  value: string | number;
  previousValue: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
  badge?: { text: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' };
}

export default function FeishuDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drillPath, setDrillPath] = useState<Array<{ dimension: string; value: string; dimensionId: string; valueId: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 模拟数据 - 实际应该从API获取
  const overviewStats = useMemo(() => ({
    totalEmployees: 156,
    newHires: 23,
    activeJobs: 12,
    avgPerformance: 85.4,
    revenuePerEmployee: 1250000,
    trainingCompletion: 78,
    retentionRate: 92,
    turnoverRate: 8,
  }), []);

  const monthlyData = useMemo(() => [
    { name: '1月', revenue: 120000, employees: 140, hiring: 15, performance: 82 },
    { name: '2月', revenue: 125000, employees: 143, hiring: 12, performance: 84 },
    { name: '3月', revenue: 130000, employees: 146, hiring: 18, performance: 83 },
    { name: '4月', revenue: 135000, employees: 148, hiring: 10, performance: 85 },
    { name: '5月', revenue: 140000, employees: 150, hiring: 14, performance: 86 },
    { name: '6月', revenue: 145000, employees: 152, hiring: 16, performance: 87 },
    { name: '7月', revenue: 150000, employees: 154, hiring: 13, performance: 88 },
    { name: '8月', revenue: 155000, employees: 156, hiring: 15, performance: 85 },
  ], []);

  // 计算趋势变化
  const getTrendInfo = (current: number, previous: number, inverse = false): { trend: 'up' | 'down' | 'neutral'; trendValue: string } => {
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100).toFixed(1);

    if (Math.abs(diff) < previous * 0.01) {
      return { trend: 'neutral', trendValue: '持平' };
    }

    if (inverse) {
      // 指标越小越好（如离职率）
      return diff < 0
        ? { trend: 'up', trendValue: `-${percent}%` }
        : { trend: 'down', trendValue: `+${percent}%` };
    } else {
      // 指标越大越好
      return diff > 0
        ? { trend: 'up', trendValue: `+${percent}%` }
        : { trend: 'down', trendValue: `-${percent}%` };
    }
  };

  // 统计卡片配置
  const statCards = useMemo((): StatCard[] => {
    const { totalEmployees, newHires, avgPerformance, revenuePerEmployee, turnoverRate, trainingCompletion, retentionRate, activeJobs } = overviewStats;

    return [
      {
        title: '员工总数',
        value: totalEmployees,
        previousValue: 148,
        ...getTrendInfo(totalEmployees, 148),
        icon: <Users className="h-6 w-6 text-blue-600" />,
        badge: { text: '实时', variant: 'default' },
      },
      {
        title: '本月招聘',
        value: newHires,
        previousValue: 18,
        ...getTrendInfo(newHires, 18),
        icon: <Briefcase className="h-6 w-6 text-purple-600" />,
      },
      {
        title: '人均营收',
        value: `¥${(revenuePerEmployee / 10000).toFixed(1)}万`,
        previousValue: 118,
        ...getTrendInfo(revenuePerEmployee / 10000, 118),
        icon: <DollarSign className="h-6 w-6 text-green-600" />,
      },
      {
        title: '离职率',
        value: `${turnoverRate}%`,
        previousValue: 10,
        ...getTrendInfo(turnoverRate, 10, true),
        icon: <Activity className="h-6 w-6 text-orange-600" />,
      },
      {
        title: '平均绩效',
        value: `${avgPerformance}分`,
        previousValue: 82,
        ...getTrendInfo(avgPerformance, 82),
        icon: <Award className="h-6 w-6 text-indigo-600" />,
      },
      {
        title: '培训完成率',
        value: `${trainingCompletion}%`,
        previousValue: 72,
        ...getTrendInfo(trainingCompletion, 72),
        icon: <GraduationCap className="h-6 w-6 text-cyan-600" />,
      },
      {
        title: '留存率',
        value: `${retentionRate}%`,
        previousValue: 90,
        ...getTrendInfo(retentionRate, 90),
        icon: <Target className="h-6 w-6 text-rose-600" />,
      },
      {
        title: '活跃职位',
        value: activeJobs,
        previousValue: 15,
        ...getTrendInfo(activeJobs, 15, true),
        icon: <Zap className="h-6 w-6 text-amber-600" />,
      },
    ];
  }, [overviewStats]);

  // 数据钻取配置
  const drillDimensions = useMemo(() => [
    {
      id: 'department',
      name: '部门',
      values: [
        { id: '技术部', name: '技术部', value: 45, count: 45 },
        { id: '销售部', name: '销售部', value: 38, count: 38 },
        { id: '市场部', name: '市场部', value: 25, count: 25 },
        { id: '运营部', name: '运营部', value: 22, count: 22 },
        { id: '人事部', name: '人事部', value: 15, count: 15 },
        { id: '财务部', name: '财务部', value: 11, count: 11 },
      ],
    },
    {
      id: 'performance',
      name: '绩效等级',
      values: [
        { id: '优秀', name: '优秀', value: 35, count: 54 },
        { id: '良好', name: '良好', value: 40, count: 62 },
        { id: '合格', name: '合格', value: 20, count: 31 },
        { id: '待改进', name: '待改进', value: 5, count: 8 },
      ],
    },
    {
      id: 'tenure',
      name: '司龄分布',
      values: [
        { id: '1年以下', name: '1年以下', value: 28, count: 44 },
        { id: '1-3年', name: '1-3年', value: 35, count: 55 },
        { id: '3-5年', name: '3-5年', value: 22, count: 34 },
        { id: '5年以上', name: '5年以上', value: 15, count: 23 },
      ],
    },
    {
      id: 'level',
      name: '职级',
      values: [
        { id: 'P1-P3', name: 'P1-P3（初级）', value: 25, count: 25 },
        { id: 'P4-P5', name: 'P4-P5（中级）', value: 55, count: 55 },
        { id: 'P6-P7', name: 'P6-P7（高级）', value: 45, count: 45 },
        { id: 'P8+', name: 'P8+（专家）', value: 31, count: 31 },
      ],
    },
    {
      id: 'month',
      name: '月份',
      values: monthlyData.map(d => ({
        id: d.name,
        name: d.name,
        value: d.revenue,
        count: Math.floor(d.employees),
      })),
    },
  ], [monthlyData]);

  // 部门数据
  const departmentData = useMemo(() => [
    { name: '技术部', value: 45, avgPerformance: 88 },
    { name: '销售部', value: 38, avgPerformance: 92 },
    { name: '市场部', value: 25, avgPerformance: 85 },
    { name: '运营部', value: 22, avgPerformance: 84 },
    { name: '人事部', value: 15, avgPerformance: 86 },
    { name: '财务部', value: 11, avgPerformance: 90 },
  ], []);

  // 绩效分布数据
  const performanceDistribution = useMemo(() => [
    { name: '优秀', value: 35, count: 54 },
    { name: '良好', value: 40, count: 62 },
    { name: '合格', value: 20, count: 31 },
    { name: '待改进', value: 5, count: 8 },
  ], []);

  // 处理数据钻取
  const handleDrillDown = (dimensionId: string, valueId: string) => {
    const dimension = drillDimensions.find(d => d.id === dimensionId);
    const value = dimension?.values.find(v => v.id === valueId);

    if (dimension && value) {
      setDrillPath(prev => [
        ...prev,
        {
          dimension: dimension.name,
          value: value.name,
          dimensionId,
          valueId,
        },
      ]);
    }
  };

  const handleDrillUp = () => {
    setDrillPath(prev => prev.slice(0, -1));
  };

  // 刷新数据
  const handleRefresh = async () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // 实时数据配置
  const realTimeConfig = useMemo(() => ({
    endpoint: '/api/dashboard/stats',
    refreshInterval: 30000, // 30秒
    enabled: true,
  }), []);

  // 渲染概览标签页
  const renderOverviewTab = () => (
    <div className="space-y-6" key={refreshKey}>
      {/* 实时数据刷新组件 */}
      <RealTimeDataRefresh
        config={realTimeConfig}
        showControls={true}
        showStatus={true}
        renderContent={(data, loading, error) => {
          if (loading && !data) {
            return (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                <p className="text-slate-600">数据加载中...</p>
              </div>
            );
          }

          if (error && !data) {
            return (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">数据加载失败</p>
                <Button size="sm" onClick={handleRefresh}>重试</Button>
              </div>
            );
          }

          return null;
        }}
      />

      {/* 核心指标卡片 - 第一行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((card, index) => (
          <FeishuDashboardCard
            key={index}
            title={card.title}
            value={card.value}
            previousValue={card.previousValue}
            trend={card.trend}
            trendValue={card.trendValue}
            icon={card.icon}
            badge={card.badge}
            loading={isLoading}
            onRefresh={handleRefresh}
          />
        ))}
      </div>

      {/* 核心指标卡片 - 第二行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(4, 8).map((card, index) => (
          <FeishuDashboardCard
            key={index + 4}
            title={card.title}
            value={card.value}
            previousValue={card.previousValue}
            trend={card.trend}
            trendValue={card.trendValue}
            icon={card.icon}
            loading={isLoading}
            onRefresh={handleRefresh}
          />
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          type="line"
          data={monthlyData}
          series={[
            { dataKey: 'revenue', name: '营收 (万元)' },
            { dataKey: 'performance', name: '平均绩效' },
          ]}
          title="营收与绩效趋势"
          height={300}
          showLegend
          showGrid
          showTooltip
          enableZoom
          stacked={false}
          onExport={() => console.log('export chart')}
        />

        <InteractiveChart
          type="bar"
          data={monthlyData}
          series={[
            { dataKey: 'hiring', name: '招聘人数' },
          ]}
          title="月度招聘趋势"
          height={300}
          showLegend
          showGrid
          showTooltip
          enableZoom
        />
      </div>

      {/* 部门分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          type="pie"
          data={departmentData}
          series={[{ dataKey: 'value', name: '人数' }]}
          title="部门人员分布"
          height={300}
          showLegend
        />
        
        <InteractiveChart
          type="bar"
          data={departmentData}
          series={[
            { dataKey: 'value', name: '人数' },
            { dataKey: 'avgPerformance', name: '平均绩效' },
          ]}
          title="部门绩效对比"
          height={300}
          showLegend
        />
      </div>
    </div>
  );

  const renderDrillDownTab = () => (
    <DataDrillDown
      title="人效数据钻取分析"
      dimensions={drillDimensions}
      data={departmentData}
      onDrillDown={handleDrillDown}
      onDrillUp={handleDrillUp}
      currentPath={drillPath}
      renderContent={(data, filters) => (
        <InteractiveChart
          type="bar"
          data={data}
          series={[{ dataKey: 'value', name: '人数' }]}
          height={300}
          showLegend
        />
      )}
    />
  );

  const renderRealTimeTab = () => (
    <RealTimeDataRefresh
      config={{
        endpoint: '/api/dashboard/stats?companyId=example-company-id',
        refreshInterval: 30000, // 30秒
        enabled: true,
      }}
      showControls
      showStatus
      renderContent={(data, loading, error) => {
        if (error) {
          return <div className="text-red-500">数据加载失败</div>;
        }
        
        if (loading && !data) {
          return <div className="text-slate-500">首次数据加载中...</div>;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeishuDashboardCard
              title="实时员工数"
              value={data?.employees?.total || 0}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              loading={loading}
            />
            <FeishuDashboardCard
              title="实时活跃数"
              value={data?.employees?.active || 0}
              icon={<Activity className="h-6 w-6 text-green-600" />}
              loading={loading}
            />
            <FeishuDashboardCard
              title="试用期人数"
              value={data?.employees?.probation || 0}
              icon={<Target className="h-6 w-6 text-orange-600" />}
              loading={loading}
            />
            <FeishuDashboardCard
              title="新增人数"
              value={data?.employees?.newHires || 0}
              icon={<Zap className="h-6 w-6 text-purple-600" />}
              loading={loading}
            />
          </div>
        );
      }}
    />
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          type="area"
          data={monthlyData}
          series={[
            { dataKey: 'revenue', name: '营收 (万元)', color: '#2563EB' },
            { dataKey: 'hiring', name: '招聘人数', color: '#7C3AED' },
          ]}
          title="营收与招聘趋势对比"
          height={350}
          showLegend
          enableZoom
        />
        
        <InteractiveChart
          type="line"
          data={monthlyData}
          series={[
            { dataKey: 'performance', name: '平均绩效', color: '#F59E0B' },
          ]}
          title="绩效趋势分析"
          height={350}
          showLegend
          enableZoom
        />
      </div>

      <InteractiveChart
        type="bar"
        data={performanceDistribution}
        series={[
          { dataKey: 'value', name: '占比 (%)' },
          { dataKey: 'count', name: '人数' },
        ]}
        title="绩效分布统计"
        height={300}
        showLegend
        stacked
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <div className="container mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            数据仪表盘
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            实时监控企业人力资源各项关键指标，支持多维度数据钻取与可视化分析
          </p>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '总览' },
            { id: 'drilldown', label: '数据钻取' },
            { id: 'realtime', label: '实时监控' },
            { id: 'analytics', label: '趋势分析' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'drilldown' && renderDrillDownTab()}
        {activeTab === 'realtime' && renderRealTimeTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
}
