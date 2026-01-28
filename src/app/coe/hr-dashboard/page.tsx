'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, createProPageHeader } from '@/components/layout/page-header';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Zap,
  FileText,
  Download,
  Calendar,
  Crown,
  Eye,
  PieChart,
  LineChart,
  Activity,
  Building2,
  Briefcase,
  Shield,
} from 'lucide-react';

// 模拟数据
const hrDashboardData = {
  // 人力成本分析
  laborCost: {
    totalCost: 12500000,
    costPerEmployee: 25773,
    costRatio: 18.5,
    monthlyTrend: [
      { month: '1月', cost: 950000, ratio: 17.8 },
      { month: '2月', cost: 980000, ratio: 18.0 },
      { month: '3月', cost: 1020000, ratio: 18.2 },
      { month: '4月', cost: 1050000, ratio: 18.3 },
      { month: '5月', cost: 1080000, ratio: 18.5 },
      { month: '6月', cost: 1120000, ratio: 18.6 },
    ],
    departmentCosts: [
      { department: '研发部', cost: 4500000, ratio: 36.0, employees: 120 },
      { department: '销售部', cost: 3200000, ratio: 25.6, employees: 85 },
      { department: '市场部', cost: 1800000, ratio: 14.4, employees: 50 },
      { department: '运营部', cost: 1500000, ratio: 12.0, employees: 45 },
      { department: '职能部', cost: 1500000, ratio: 12.0, percentage: 40 },
    ],
  },

  // 人效分析
  efficiency: {
    revenuePerEmployee: 825000,
    profitPerEmployee: 165000,
    productivityIndex: 92.5,
    monthlyEfficiency: [
      { month: '1月', revenue: 80000, profit: 16000, index: 89.2 },
      { month: '2月', revenue: 81000, profit: 16200, index: 90.1 },
      { month: '3月', revenue: 82000, profit: 16400, index: 90.8 },
      { month: '4月', revenue: 83000, profit: 16600, index: 91.5 },
      { month: '5月', revenue: 84000, profit: 16800, index: 92.2 },
      { month: '6月', revenue: 82500, profit: 16500, index: 92.5 },
    ],
    departmentEfficiency: [
      { department: '研发部', revenuePerEmployee: 900000, profitPerEmployee: 180000, index: 95.0 },
      { department: '销售部', revenuePerEmployee: 1200000, profitPerEmployee: 240000, index: 98.0 },
      { department: '市场部', revenuePerEmployee: 750000, profitPerEmployee: 150000, index: 88.0 },
      { department: '运营部', revenuePerEmployee: 850000, profitPerEmployee: 170000, index: 91.0 },
      { department: '职能部', revenuePerEmployee: 300000, profitPerEmployee: 60000, index: 85.0 },
    ],
  },

  // 流失率预警
  turnover: {
    totalTurnoverRate: 8.5,
    keyTalentTurnover: 12.0,
    highRiskCount: 15,
    mediumRiskCount: 32,
    lowRiskCount: 438,
    monthlyTurnover: [
      { month: '1月', rate: 7.2 },
      { month: '2月', rate: 7.8 },
      { month: '3月', rate: 8.5 },
      { month: '4月', rate: 9.2 },
      { month: '5月', rate: 8.8 },
      { month: '6月', rate: 8.5 },
    ],
    highRiskEmployees: [
      { name: '张三', department: '研发部', position: '高级工程师', riskScore: 92, reason: '薪酬偏低' },
      { name: '李四', department: '销售部', position: '销售经理', riskScore: 88, reason: '晋升受阻' },
      { name: '王五', department: '研发部', position: '架构师', riskScore: 85, reason: '工作压力大' },
      { name: '赵六', department: '市场部', position: '市场主管', riskScore: 82, reason: '缺乏发展空间' },
      { name: '钱七', department: '销售部', position: '销售精英', riskScore: 80, reason: '竞争offer' },
    ],
  },

  // 组织健康度
  orgHealth: {
    overallScore: 85.2,
    engagement: 87.0,
    satisfaction: 83.5,
    retention: 84.5,
    performance: 86.0,
    dimensionScores: [
      { name: '员工敬业度', score: 87.0, trend: 'up', change: 2.5 },
      { name: '员工满意度', score: 83.5, trend: 'up', change: 1.8 },
      { name: '人才保留率', score: 84.5, trend: 'down', change: -1.2 },
      { name: '绩效达成率', score: 86.0, trend: 'up', change: 3.2 },
      { name: '培训覆盖率', score: 82.0, trend: 'up', change: 5.5 },
      { name: '内部晋升率', score: 78.5, trend: 'down', change: -2.0 },
    ],
  },
};

export default function HRDashboardPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');

  // 人力规划建议
  const planningSuggestions = useMemo(() => [
    {
      category: '人力成本优化',
      suggestions: [
        '建议优化研发部人员结构，将初级工程师占比从40%降低到30%',
        '销售部可考虑提高绩效奖金比例，激励业绩增长',
        '市场部建议增加2名资深人员，提升整体团队能力',
      ],
      priority: 'high',
    },
    {
      category: '人才保留',
      suggestions: [
        '重点关注15名高离职风险员工，建议进行一对一沟通',
        '提高研发部薪酬竞争力，建议调薪幅度5-8%',
        '为销售部设计清晰的晋升路径，降低晋升受阻带来的流失',
      ],
      priority: 'high',
    },
    {
      category: '效率提升',
      suggestions: [
        '销售部人效表现优秀，可考虑增加5-8个HC支持业务扩张',
        '运营部培训覆盖率较低，建议Q3重点开展培训计划',
        '整体人效呈上升趋势，继续保持现有激励政策',
      ],
      priority: 'medium',
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader {...createProPageHeader({
        icon: BarChart3,
        title: '人力资源仪表盘',
        description: '实时监控人力成本、人效比、流失率，一键生成人力规划建议',
        extraActions: (
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="quarter">本季</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="导出报告">
              <Download className="h-4 w-4" />
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Zap className="h-4 w-4 mr-2" />
              一键生成人力规划
            </Button>
          </div>
        )
      })} />

      {/* 预警信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Alert className="border-l-4 border-l-red-500">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-sm">高离职风险</AlertTitle>
          <AlertDescription className="text-sm">
            {hrDashboardData.turnover.highRiskCount}名员工需要关注
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-orange-500">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-sm">人力成本上升</AlertTitle>
          <AlertDescription className="text-sm">
            环比增长2.5%
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-green-500">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-sm">人效持续提升</AlertTitle>
          <AlertDescription className="text-sm">
            人均营收增长3.2%
          </AlertDescription>
        </Alert>

        <Alert className="border-l-4 border-l-blue-500">
          <Activity className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-sm">组织健康度良好</AlertTitle>
          <AlertDescription className="text-sm">
            综合评分85.2分
          </AlertDescription>
        </Alert>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均人力成本</CardDescription>
            <CardTitle className="text-3xl">
              ¥{hrDashboardData.laborCost.costPerEmployee.toLocaleString()}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <ArrowUp className="h-3 w-3" />
              <span>2.5% 较上月</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均营收</CardDescription>
            <CardTitle className="text-3xl">
              ¥{hrDashboardData.efficiency.revenuePerEmployee.toLocaleString()}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>3.2% 较上月</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总流失率</CardDescription>
            <CardTitle className="text-3xl">{hrDashboardData.turnover.totalTurnoverRate}%</CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowDown className="h-3 w-3" />
              <span>0.7% 较上月</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>组织健康度</CardDescription>
            <CardTitle className="text-3xl">{hrDashboardData.orgHealth.overallScore}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>1.2 较上月</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs defaultValue="labor-cost" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="labor-cost">人力成本分析</TabsTrigger>
          <TabsTrigger value="efficiency">人效分析</TabsTrigger>
          <TabsTrigger value="turnover">流失率预警</TabsTrigger>
          <TabsTrigger value="planning">人力规划建议</TabsTrigger>
        </TabsList>

        {/* 人力成本分析 */}
        <TabsContent value="labor-cost" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>人力成本占比</CardTitle>
                <CardDescription>人力成本占总收入比例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">当前占比</span>
                      <span className="text-lg font-bold">{hrDashboardData.laborCost.costRatio}%</span>
                    </div>
                    <Progress value={hrDashboardData.laborCost.costRatio} className="h-3" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      行业平均水平：15-20%，当前处于合理区间
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>部门成本分布</CardTitle>
                <CardDescription>各部门人力成本占比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hrDashboardData.laborCost.departmentCosts.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{dept.department}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ¥{(dept.cost / 10000).toFixed(0)}万
                          </span>
                          <span className="text-sm font-bold">{dept.ratio}%</span>
                        </div>
                      </div>
                      <Progress value={dept.ratio} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>人力成本趋势</CardTitle>
              <CardDescription>近6个月人力成本变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hrDashboardData.laborCost.monthlyTrend.map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-medium">{data.month}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">成本</span>
                        <span className="text-sm font-bold">¥{(data.cost / 10000).toFixed(0)}万</span>
                      </div>
                      <Progress value={(data.cost / 1120000) * 100} className="h-2" />
                    </div>
                    <span className="w-16 text-sm font-bold text-right">{data.ratio}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 人效分析 */}
        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>人均营收与利润</CardTitle>
                <CardDescription>员工产出效率分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">人均营收</span>
                      <span className="text-lg font-bold">¥{hrDashboardData.efficiency.revenuePerEmployee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUp className="h-3 w-3" />
                      <span>同比增长8.5%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">人均利润</span>
                      <span className="text-lg font-bold">¥{hrDashboardData.efficiency.profitPerEmployee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUp className="h-3 w-3" />
                      <span>同比增长9.2%</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      人效指数{hrDashboardData.efficiency.productivityIndex}，超过行业平均水平的92.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>部门人效对比</CardTitle>
                <CardDescription>各部门人均营收对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hrDashboardData.efficiency.departmentEfficiency.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{dept.department}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">¥{(dept.revenuePerEmployee / 10000).toFixed(0)}万</span>
                          <Badge variant={dept.index >= 90 ? 'default' : 'secondary'}>
                            {dept.index}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(dept.revenuePerEmployee / 1200000) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>人效趋势</CardTitle>
              <CardDescription>近6个月人效变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hrDashboardData.efficiency.monthlyEfficiency.map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-medium">{data.month}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">人均营收</span>
                        <span className="text-sm font-bold">¥{data.revenue.toLocaleString()}</span>
                      </div>
                      <Progress value={(data.revenue / 84000) * 100} className="h-2" />
                    </div>
                    <span className="w-16 text-sm font-bold text-right">{data.index}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 流失率预警 */}
        <TabsContent value="turnover" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>流失率分布</CardTitle>
                <CardDescription>不同风险等级员工数量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">高风险</Badge>
                        <span className="text-sm">离职风险>80%</span>
                      </div>
                      <span className="text-lg font-bold">{hrDashboardData.turnover.highRiskCount}</span>
                    </div>
                    <Progress value={(hrDashboardData.turnover.highRiskCount / 485) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">中风险</Badge>
                        <span className="text-sm">离职风险60-80%</span>
                      </div>
                      <span className="text-lg font-bold">{hrDashboardData.turnover.mediumRiskCount}</span>
                    </div>
                    <Progress value={(hrDashboardData.turnover.mediumRiskCount / 485) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          低风险
                        </Badge>
                        <span className="text-sm">离职风险<60%</span>
                      </div>
                      <span className="text-lg font-bold">{hrDashboardData.turnover.lowRiskCount}</span>
                    </div>
                    <Progress value={(hrDashboardData.turnover.lowRiskCount / 485) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>关键人才流失率</CardTitle>
                <CardDescription>高绩效员工流失情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2">
                      {hrDashboardData.turnover.keyTalentTurnover}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      本月关键人才流失率
                    </p>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>高于行业平均水平2.5个百分点</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      建议重点关注销售部和研发部的高绩效员工 retention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>高离职风险员工</CardTitle>
              <CardDescription>需要重点关注的员工</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hrDashboardData.turnover.highRiskEmployees.map((employee) => (
                  <div key={employee.name} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{employee.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {employee.riskScore}分
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.department} · {employee.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        {employee.reason}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-3 w-3 mr-1" />
                        详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 人力规划建议 */}
        <TabsContent value="planning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {planningSuggestions.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <Badge
                      variant={category.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {category.priority === 'high' ? '高优先级' : '中优先级'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                        <span className="text-blue-600 dark:text-blue-400">{index + 1}.</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>组织健康度综合评分</CardTitle>
              <CardDescription>多维度组织健康评估</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hrDashboardData.orgHealth.dimensionScores.map((dimension) => (
                  <div key={dimension.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{dimension.name}</span>
                      <div className="flex items-center gap-3">
                        {dimension.trend === 'up' ? (
                          <ArrowUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className="text-sm font-bold">{dimension.score}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            dimension.change > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {dimension.change > 0 ? '+' : ''}
                          {dimension.change}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={dimension.score} className="h-2" />
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
