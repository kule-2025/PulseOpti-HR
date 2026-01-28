'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader, createProPageHeader } from '@/components/layout/page-header';
import { QuickActions, createProQuickActions } from '@/components/layout/quick-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Award,
  Briefcase,
  Zap,
  Crown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Maximize2,
  Calendar,
  Activity,
  Layers,
  Star,
  CheckCircle,
} from 'lucide-react';

interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

interface ChartData {
  labels: string[];
  values: number[];
}

// 模拟仪表盘数据
const DASHBOARD_DATA = {
  // 关键指标
  metrics: {
    totalEmployees: {
      label: '员工总数',
      value: 485,
      change: 12,
      trend: 'up' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
    },
    turnoverRate: {
      label: '员工流失率',
      value: '3.2%',
      change: -0.5,
      trend: 'down' as const,
      icon: TrendingUp,
      color: 'from-green-500 to-teal-600',
    },
    avgSalary: {
      label: '平均薪资',
      value: '¥15,800',
      change: 5.2,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-600',
    },
    trainingHours: {
      label: '培训时长',
      value: '2,450h',
      change: 18.5,
      trend: 'up' as const,
      icon: Clock,
      color: 'from-orange-500 to-red-600',
    },
  },

  // 招聘数据
  recruitment: {
    positions: 25,
    resumes: 342,
    interviews: 87,
    hired: 12,
    timeToHire: 28,
    costPerHire: 8500,
  },

  // 绩效数据
  performance: {
    avgScore: 87.5,
    topPerformers: 15,
    improvementNeeded: 8,
    goalCompletion: 76,
  },

  // 考勤数据
  attendance: {
    avgAttendance: 96.8,
    onTimeRate: 92.5,
    lateCount: 45,
    absentCount: 12,
  },

  // 部门数据
  departments: [
    { name: '技术部', count: 120, growth: 15 },
    { name: '销售部', count: 85, growth: 8 },
    { name: '市场部', count: 65, growth: 12 },
    { name: '人力资源部', count: 35, growth: 5 },
    { name: '财务部', count: 30, growth: 3 },
    { name: '行政部', count: 25, growth: 0 },
    { name: '产品部', count: 75, growth: 10 },
    { name: '运营部', count: 50, growth: 7 },
  ],

  // 薪酬分布
  salaryDistribution: [
    { range: '10K以下', count: 150, percentage: 31 },
    { range: '10K-15K', count: 120, percentage: 25 },
    { range: '15K-20K', count: 100, percentage: 21 },
    { range: '20K-30K', count: 75, percentage: 15 },
    { range: '30K以上', count: 40, percentage: 8 },
  ],

  // 培训完成情况
  trainingCompletion: [
    { course: '新员工入职培训', completion: 95, participants: 48 },
    { course: '领导力发展', completion: 82, participants: 25 },
    { course: '技术能力提升', completion: 88, participants: 65 },
    { course: '销售技巧培训', completion: 78, participants: 42 },
    { course: '沟通与协作', completion: 90, participants: 38 },
  ],

  // 人效数据
  efficiency: {
    revenuePerEmployee: '¥125,000',
    profitPerEmployee: '¥35,000',
    turnoverRate: '3.2%',
    satisfaction: 4.2,
  },

  // 历史数据（用于同比环比）
  historicalData: {
    lastMonth: {
      totalEmployees: 473,
      turnoverRate: 3.7,
      avgSalary: 15000,
      trainingHours: 2100,
      revenuePerEmployee: 118000,
      profitPerEmployee: 32000,
    },
    lastYear: {
      totalEmployees: 420,
      turnoverRate: 4.1,
      avgSalary: 13500,
      trainingHours: 1800,
      revenuePerEmployee: 105000,
      profitPerEmployee: 28000,
    },
  },

  // 趋势数据（用于折线图）
  trendData: {
    recruitment: [12, 18, 15, 22, 25, 20, 28, 30, 25, 35, 28, 32],
    turnover: [4.5, 3.8, 4.2, 3.5, 3.2, 3.8, 4.0, 3.5, 3.2, 3.0, 3.5, 3.2],
    performance: [82, 85, 84, 86, 88, 85, 87, 89, 88, 90, 87, 87.5],
    training: [180, 200, 185, 210, 195, 220, 215, 230, 210, 240, 225, 245],
  },

  // 优秀员工榜单
  topEmployees: [
    { id: 1, name: '张三', department: '技术部', score: 98, avatar: 'ZS' },
    { id: 2, name: '李四', department: '销售部', score: 96, avatar: 'LS' },
    { id: 3, name: '王五', department: '产品部', score: 95, avatar: 'WW' },
    { id: 4, name: '赵六', department: '市场部', score: 94, avatar: 'ZL' },
    { id: 5, name: '钱七', department: '技术部', score: 93, avatar: 'QQ' },
  ],

  // 预警信息
  alerts: [
    { type: 'warning', message: '销售部离职率达到5.2%，超出警戒线', priority: 'high' },
    { type: 'info', message: '技术部培训完成率低于80%，需关注', priority: 'medium' },
    { type: 'success', message: '本月招聘目标超额完成120%', priority: 'low' },
  ],
};

// 时间范围选项
type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

export default function DataDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const { metrics, recruitment, performance, attendance, departments, salaryDistribution, trainingCompletion, efficiency, historicalData, trendData, topEmployees, alerts } = DASHBOARD_DATA;
  const { trainingHours, totalEmployees } = metrics;

  // 自动刷新功能
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(new Date());
    }, 30000); // 30秒刷新一次

    return () => clearInterval(interval);
  }, []);

  // 手动刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdateTime(new Date());
    setIsRefreshing(false);
  };

  // 计算招聘漏斗转化率
  const recruitmentFunnel = useMemo(() => {
    const resumes = recruitment.resumes;
    const interviews = recruitment.interviews;
    const hired = recruitment.hired;

    return [
      { label: '简历投递', value: resumes, rate: 100 },
      { label: '面试安排', value: interviews, rate: ((interviews / resumes) * 100).toFixed(1) },
      { label: '录用', value: hired, rate: ((hired / interviews) * 100).toFixed(1) },
    ];
  }, [recruitment]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="企业数据大屏"
        description="实时监控企业人力资源关键指标，30秒自动刷新"
        breadcrumbs={[
          { name: '高级功能', href: '/premium' },
          { name: '数据大屏', href: '/admin/data-dashboard' },
        ]}
        proBadge={true}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mr-4">
              <Activity className="h-4 w-4" />
              <span>更新时间：{lastUpdateTime.toLocaleTimeString('zh-CN')}</span>
            </div>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="quarter">本季</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="刷新数据"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" title="导出数据">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="全屏显示">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* 预警信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, index) => (
          <Card key={index} className={`border-l-4 ${
            alert.type === 'warning' ? 'border-l-orange-500' :
            alert.type === 'info' ? 'border-l-blue-500' :
            'border-l-green-500'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {alert.type === 'warning' && <Activity className="h-5 w-5 text-orange-500 mt-0.5" />}
                {alert.type === 'info' && <Layers className="h-5 w-5 text-blue-500 mt-0.5" />}
                {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {alert.priority === 'high' ? '高优先级' : alert.priority === 'medium' ? '中优先级' : '低优先级'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(metrics).map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{metric.label}</CardDescription>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    较上月
                  </span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* 人效指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均营收</CardDescription>
            <CardTitle className="text-3xl">{efficiency.revenuePerEmployee}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>同比 +5.9%</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均利润</CardDescription>
            <CardTitle className="text-3xl">{efficiency.profitPerEmployee}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>同比 +9.4%</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>员工满意度</CardDescription>
            <CardTitle className="text-3xl">{efficiency.satisfaction}/5</CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Star className="h-3 w-3 fill-current" />
              <span>+0.2 较上期</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均培训时长</CardDescription>
            <CardTitle className="text-3xl">
              {`${Math.round((parseInt(trainingHours.value.replace(new RegExp(',', 'g'), '')) / parseInt(String(totalEmployees.value))) * 10) / 10}h`}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>同比 +18.5%</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 趋势分析图表 */}
      <Card>
        <CardHeader>
          <CardTitle>趋势分析</CardTitle>
          <CardDescription>关键指标年度变化趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recruitment" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recruitment">招聘趋势</TabsTrigger>
              <TabsTrigger value="turnover">离职趋势</TabsTrigger>
              <TabsTrigger value="performance">绩效趋势</TabsTrigger>
              <TabsTrigger value="training">培训趋势</TabsTrigger>
            </TabsList>
            <TabsContent value="recruitment" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  同比 +25.5%
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  环比 +8.2%
                </Badge>
              </div>
              <div className="grid grid-cols-12 gap-1 h-32 items-end">
                {trendData.recruitment.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${(value / Math.max(...trendData.recruitment)) * 100}%` }}
                      title={`${value} 人`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}月</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="turnover" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  同比 -22.0%
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  环比 -8.6%
                </Badge>
              </div>
              <div className="grid grid-cols-12 gap-1 h-32 items-end">
                {trendData.turnover.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${(value / Math.max(...trendData.turnover)) * 100}%` }}
                      title={`${value}%`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}月</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="performance" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  同比 +6.7%
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  环比 +0.6%
                </Badge>
              </div>
              <div className="grid grid-cols-12 gap-1 h-32 items-end">
                {trendData.performance.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-teal-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${(value / 100) * 100}%` }}
                      title={`${value}分`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}月</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="training" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  同比 +36.1%
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  环比 +8.9%
                </Badge>
              </div>
              <div className="grid grid-cols-12 gap-1 h-32 items-end">
                {trendData.training.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${(value / Math.max(...trendData.training)) * 100}%` }}
                      title={`${value}小时`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}月</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 招聘漏斗、绩效概览和优秀员工 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 招聘漏斗 */}
        <Card>
          <CardHeader>
            <CardTitle>招聘漏斗</CardTitle>
            <CardDescription>招聘流程转化情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recruitmentFunnel.map((stage, index) => (
                <div key={stage.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stage.label}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stage.value}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stage.rate}%
                      </span>
                    </div>
                  </div>
                  <Progress value={Number(stage.rate)} className="h-2" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">平均招聘周期</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {recruitment.timeToHire} 天
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">人均招聘成本</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ¥{recruitment.costPerHire.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 绩效概览 */}
        <Card>
          <CardHeader>
            <CardTitle>绩效概览</CardTitle>
            <CardDescription>团队绩效整体情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {performance.avgScore}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">平均绩效分</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {performance.topPerformers}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">优秀员工</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {performance.goalCompletion}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">目标完成率</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">整体目标进度</span>
                <span className="font-medium">{performance.goalCompletion}%</span>
              </div>
              <Progress value={performance.goalCompletion} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* 优秀员工榜单 */}
        <Card>
          <CardHeader>
            <CardTitle>优秀员工榜</CardTitle>
            <CardDescription>本月绩效TOP5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEmployees.map((employee, index) => (
                <div key={employee.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                      {employee.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{employee.department}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{employee.score}分</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        TOP {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 部门分布和考勤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 部门分布 */}
        <Card>
          <CardHeader>
            <CardTitle>部门分布</CardTitle>
            <CardDescription>各部门员工数量及增长</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {dept.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {dept.count}
                      </span>
                      <Badge variant="outline" className={`text-xs ${
                        dept.growth > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{dept.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(dept.count / 485) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 考勤统计 */}
        <Card>
          <CardHeader>
            <CardTitle>考勤统计</CardTitle>
            <CardDescription>本月考勤情况概览</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {attendance.avgAttendance}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">平均出勤率</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {attendance.onTimeRate}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">准时率</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900 dark:text-white">迟到</span>
                </div>
                <span className="font-bold text-red-600">{attendance.lateCount} 人次</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-900 dark:text-white">缺勤</span>
                </div>
                <span className="font-bold text-orange-600">{attendance.absentCount} 人次</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 薪酬分布和培训 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 薪酬分布 */}
        <Card>
          <CardHeader>
            <CardTitle>薪酬分布</CardTitle>
            <CardDescription>员工薪酬区间分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salaryDistribution.map((item) => (
                <div key={item.range}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.range}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count} 人
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 培训完成情况 */}
        <Card>
          <CardHeader>
            <CardTitle>培训完成情况</CardTitle>
            <CardDescription>近期培训项目完成率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingCompletion.map((item) => (
                <div key={item.course}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.course}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.participants} 人
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.completion}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* 快捷操作 */}
    <QuickActions
      showBackToHome
      showActions
      isProPage
    />
  );
}