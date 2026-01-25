"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Info,
  Scale,
  Users,
  Building2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/theme';

// 薪酬数据类型
export interface SalaryData {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  level: string;
  currentSalary: number; // 年薪
  marketSalary: number; // 市场中位值
  industryAverage: number; // 行业平均
  salaryGap: number; // 与市场的差距
  gapPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  performanceScore: number;
  tenure: number; // 年限
  skills: string[];
}

// 市场对标数据
export interface MarketBenchmark {
  position: string;
  level: string;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  sampleSize: number;
  lastUpdated: Date;
}

// 薪酬调整建议
export interface SalaryAdjustment {
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  recommendedSalary: number;
  adjustmentAmount: number;
  adjustmentPercentage: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  expectedImpact: {
    retention: number;
    motivation: number;
  };
  budgetImpact: number;
}

// 薪酬分布分析
export interface SalaryDistribution {
  department: string;
  employeeCount: number;
  totalSalary: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  variance: number;
}

// 薪酬风险预警
export interface SalaryRiskAlert {
  type: 'retention' | 'budget' | 'equity' | 'competition';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedEmployees: number;
  estimatedCost: number;
  description: string;
  recommendation: string;
}

interface SalaryIntelligenceProps {
  salaryData: SalaryData[];
  marketBenchmark: MarketBenchmark[];
  onExport?: () => void;
  onRefresh?: () => void;
}

// 模拟数据
const MOCK_SALARY_DATA: SalaryData[] = [
  {
    employeeId: 'e1',
    employeeName: '张三',
    department: '技术部',
    position: '前端工程师',
    level: 'P5',
    currentSalary: 250000,
    marketSalary: 280000,
    industryAverage: 260000,
    salaryGap: -30000,
    gapPercentage: -10.7,
    riskLevel: 'medium',
    performanceScore: 85,
    tenure: 3,
    skills: ['JavaScript', 'React', 'TypeScript'],
  },
  {
    employeeId: 'e2',
    employeeName: '李四',
    department: '技术部',
    position: '后端工程师',
    level: 'P6',
    currentSalary: 350000,
    marketSalary: 380000,
    industryAverage: 360000,
    salaryGap: -30000,
    gapPercentage: -7.9,
    riskLevel: 'low',
    performanceScore: 88,
    tenure: 4,
    skills: ['Java', 'Spring', 'MySQL'],
  },
  {
    employeeId: 'e3',
    employeeName: '王五',
    department: '产品部',
    position: '产品经理',
    level: 'P5',
    currentSalary: 200000,
    marketSalary: 240000,
    industryAverage: 220000,
    salaryGap: -40000,
    gapPercentage: -16.7,
    riskLevel: 'high',
    performanceScore: 92,
    tenure: 2,
    skills: ['产品设计', '数据分析', '沟通'],
  },
  {
    employeeId: 'e4',
    employeeName: '赵六',
    department: '销售部',
    position: '销售经理',
    level: 'P6',
    currentSalary: 300000,
    marketSalary: 320000,
    industryAverage: 310000,
    salaryGap: -20000,
    gapPercentage: -6.3,
    riskLevel: 'low',
    performanceScore: 78,
    tenure: 5,
    skills: ['销售', '谈判', '团队管理'],
  },
];

const MOCK_MARKET_BENCHMARK: MarketBenchmark[] = [
  {
    position: '前端工程师',
    level: 'P5',
    p25: 220000,
    median: 280000,
    p75: 350000,
    p90: 400000,
    sampleSize: 1250,
    lastUpdated: new Date('2024-01-15'),
  },
  {
    position: '后端工程师',
    level: 'P6',
    median: 380000,
    p25: 300000,
    p75: 450000,
    p90: 520000,
    sampleSize: 980,
    lastUpdated: new Date('2024-01-15'),
  },
];

export default function SalaryIntelligence({
  salaryData = MOCK_SALARY_DATA,
  marketBenchmark = MOCK_MARKET_BENCHMARK,
  onExport,
  onRefresh,
}: SalaryIntelligenceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // 薪酬分布分析
  const salaryDistribution = useMemo(() => {
    const distribution: SalaryDistribution[] = [];
    const departments = Array.from(new Set(salaryData.map(d => d.department)));

    departments.forEach(dept => {
      const deptSalaries = salaryData.filter(d => d.department === dept);
      const salaries = deptSalaries.map(d => d.currentSalary);

      distribution.push({
        department: dept,
        employeeCount: deptSalaries.length,
        totalSalary: salaries.reduce((sum, s) => sum + s, 0),
        averageSalary: salaries.reduce((sum, s) => sum + s, 0) / salaries.length,
        medianSalary: calculateMedian(salaries),
        minSalary: Math.min(...salaries),
        maxSalary: Math.max(...salaries),
        variance: calculateVariance(salaries),
      });
    });

    return distribution.sort((a, b) => b.averageSalary - a.averageSalary);
  }, [salaryData]);

  // 薪酬调整建议
  const salaryAdjustments = useMemo(() => {
    return salaryData
      .filter(d => d.gapPercentage < -5)
      .map(d => ({
        employeeId: d.employeeId,
        employeeName: d.employeeName,
        currentSalary: d.currentSalary,
        recommendedSalary: Math.round(d.marketSalary * 1.05),
        adjustmentAmount: Math.round(d.marketSalary * 1.05 - d.currentSalary),
        adjustmentPercentage: Math.round(((d.marketSalary * 1.05 - d.currentSalary) / d.currentSalary) * 100),
        priority: d.riskLevel === 'high' ? 'critical' : d.riskLevel === 'medium' ? 'high' : 'medium',
        reason: `当前薪酬低于市场${Math.abs(d.gapPercentage).toFixed(1)}%，绩效表现优秀`,
        expectedImpact: {
          retention: Math.min(95, 70 + Math.abs(d.gapPercentage)),
          motivation: Math.min(95, 60 + Math.abs(d.gapPercentage)),
        },
        budgetImpact: Math.round(d.marketSalary * 1.05 - d.currentSalary),
      }))
      .sort((a, b) => b.adjustmentPercentage - a.adjustmentPercentage);
  }, [salaryData]);

  // 薪酬风险预警
  const salaryRiskAlerts: SalaryRiskAlert[] = [
    {
      type: 'retention',
      severity: 'high',
      affectedEmployees: salaryData.filter(d => d.gapPercentage < -10 && d.performanceScore > 80).length,
      estimatedCost: salaryData
        .filter(d => d.gapPercentage < -10 && d.performanceScore > 80)
        .reduce((sum, d) => sum + (d.marketSalary - d.currentSalary), 0),
      description: '部分高绩效员工薪酬显著低于市场水平',
      recommendation: '优先调整高绩效员工薪酬，降低离职风险',
    },
    {
      type: 'competition',
      severity: 'medium',
      affectedEmployees: salaryData.filter(d => d.gapPercentage < -5).length,
      estimatedCost: 0,
      description: '市场上薪酬水平持续上涨',
      recommendation: '定期进行薪酬市场调研，保持竞争力',
    },
  ];

  // 图表数据准备
  const marketComparisonData = useMemo(() => {
    return salaryData.map(d => {
      const benchmark = marketBenchmark.find(
        b => b.position === d.position && b.level === d.level
      );

      return {
        name: d.employeeName,
        current: d.currentSalary / 10000,
        market: (benchmark?.median || d.marketSalary) / 10000,
        industry: d.industryAverage / 10000,
        performance: d.performanceScore,
      };
    });
  }, [salaryData, marketBenchmark]);

  const departmentSalaryData = useMemo(() => {
    return salaryDistribution.map(d => ({
      name: d.department,
      average: d.averageSalary / 10000,
      employeeCount: d.employeeCount,
    }));
  }, [salaryDistribution]);

  const gapDistributionData = useMemo(() => {
    return [
      { name: '低于-20%', count: salaryData.filter(d => d.gapPercentage < -20).length },
      { name: '-20%~-10%', count: salaryData.filter(d => d.gapPercentage >= -20 && d.gapPercentage < -10).length },
      { name: '-10%~0%', count: salaryData.filter(d => d.gapPercentage >= -10 && d.gapPercentage < 0).length },
      { name: '0%~10%', count: salaryData.filter(d => d.gapPercentage >= 0 && d.gapPercentage < 10).length },
      { name: '高于10%', count: salaryData.filter(d => d.gapPercentage >= 10).length },
    ];
  }, [salaryData]);

  // 辅助函数
  function calculateMedian(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function calculateVariance(arr: number[]): number {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }

  // 总体统计
  const totalStats = useMemo(() => {
    const totalSalary = salaryData.reduce((sum, d) => sum + d.currentSalary, 0);
    const avgSalary = totalSalary / salaryData.length;
    const belowMarket = salaryData.filter(d => d.gapPercentage < 0).length;
    const aboveMarket = salaryData.filter(d => d.gapPercentage > 0).length;

    return {
      totalSalary,
      avgSalary,
      employeeCount: salaryData.length,
      belowMarket,
      aboveMarket,
      riskCount: salaryData.filter(d => d.riskLevel === 'high').length,
    };
  }, [salaryData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  薪酬智能分析
                </CardTitle>
                <CardDescription className="mt-1">
                  基于市场数据驱动的薪酬管理智能决策系统
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {onRefresh && (
                  <Button variant="outline" size="icon" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="icon" onClick={onExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 总体统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>年度薪酬总额</CardDescription>
              <CardTitle className="text-2xl">¥{(totalStats.totalSalary / 10000).toFixed(0)}万</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>平均年薪</CardDescription>
              <CardTitle className="text-2xl">¥{(totalStats.avgSalary / 10000).toFixed(1)}万</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>低于市场</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{totalStats.belowMarket}人</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>高离职风险</CardDescription>
              <CardTitle className="text-2xl text-red-600">{totalStats.riskCount}人</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="benchmark">市场对标</TabsTrigger>
            <TabsTrigger value="adjustment">调整建议</TabsTrigger>
            <TabsTrigger value="distribution">薪酬分布</TabsTrigger>
            <TabsTrigger value="risk">风险预警</TabsTrigger>
          </TabsList>

          {/* 概览 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 市场对比图表 */}
              <Card>
                <CardHeader>
                  <CardTitle>薪酬市场对比</CardTitle>
                  <CardDescription>当前薪酬 vs 市场中位值 vs 行业平均</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" name="当前薪酬(万元)" fill="#3b82f6" />
                        <Bar dataKey="market" name="市场中位值(万元)" fill="#8b5cf6" />
                        <Bar dataKey="industry" name="行业平均(万元)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 薪酬差距分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>薪酬差距分布</CardTitle>
                  <CardDescription>员工薪酬与市场水平的差距分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={gapDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {gapDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={[
                                '#ef4444',
                                '#f97316',
                                '#eab308',
                                '#22c55e',
                                '#3b82f6',
                              ][index % 5]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 市场对标 */}
          <TabsContent value="benchmark" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>详细市场对标</CardTitle>
                <CardDescription>每位员工的薪酬与市场基准对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryData.map((employee, idx) => {
                    const benchmark = marketBenchmark.find(
                      b => b.position === employee.position && b.level === employee.level
                    );

                    if (!benchmark) return null;

                    const isAboveMarket = employee.currentSalary >= benchmark.median;
                    const isHighRisk = employee.riskLevel === 'high';

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-4 rounded-lg border",
                          isHighRisk && "border-red-500 bg-red-50 dark:bg-red-950/20",
                          !isAboveMarket && !isHighRisk && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
                          isAboveMarket && "border-green-500 bg-green-50 dark:bg-green-950/20"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{employee.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {employee.position} - {employee.level}
                            </p>
                          </div>
                          <Badge
                            variant={isHighRisk ? 'destructive' : isAboveMarket ? 'default' : 'secondary'}
                          >
                            {isHighRisk ? '高风险' : isAboveMarket ? '有竞争力' : '需关注'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">当前薪酬</p>
                            <p className="font-bold text-lg">¥{(employee.currentSalary / 10000).toFixed(1)}万</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">市场中位值</p>
                            <p className="font-bold text-lg">¥{(benchmark.median / 10000).toFixed(1)}万</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">差距</p>
                            <p
                              className={cn(
                                "font-bold text-lg",
                                employee.gapPercentage < 0 ? "text-red-600" : "text-green-600"
                              )}
                            >
                              {employee.gapPercentage > 0 ? '+' : ''}{employee.gapPercentage.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">绩效</p>
                            <p className="font-bold text-lg">{employee.performanceScore}分</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">当前薪酬位置</span>
                            <span>{((employee.currentSalary / (benchmark.p90 - benchmark.p25)) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress
                            value={((employee.currentSalary - benchmark.p25) / (benchmark.p90 - benchmark.p25)) * 100}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>P25: ¥{(benchmark.p25 / 10000).toFixed(1)}万</span>
                            <span>P90: ¥{(benchmark.p90 / 10000).toFixed(1)}万</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 调整建议 */}
          <TabsContent value="adjustment" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 调整建议列表 */}
              <div className="lg:col-span-2 space-y-4">
                {salaryAdjustments.map((adjustment, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      "border-2",
                      adjustment.priority === 'critical' && "border-red-500",
                      adjustment.priority === 'high' && "border-orange-500"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{adjustment.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">
                            当前: ¥{(adjustment.currentSalary / 10000).toFixed(1)}万
                          </p>
                        </div>
                        <Badge
                          variant={adjustment.priority === 'critical' ? 'destructive' : adjustment.priority === 'high' ? 'default' : 'secondary'}
                        >
                          {adjustment.priority === 'critical' ? '紧急' : adjustment.priority === 'high' ? '重要' : '一般'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">建议调整至</p>
                          <p className="font-bold text-lg text-green-600">
                            ¥{(adjustment.recommendedSalary / 10000).toFixed(1)}万
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">调整幅度</p>
                          <p className="font-bold text-lg text-blue-600">
                            +{adjustment.adjustmentPercentage}%
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{adjustment.reason}</p>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-green-600" />
                          <span>留存率+{adjustment.expectedImpact.retention}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span>动力+{adjustment.expectedImpact.motivation}%</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4" variant="outline">
                        执行调整
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 调整统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>调整统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">需调整人数</p>
                    <p className="text-3xl font-bold">{salaryAdjustments.length}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">预计增加成本</p>
                    <p className="text-3xl font-bold text-red-600">
                      ¥{(salaryAdjustments.reduce((sum, a) => sum + a.adjustmentAmount, 0) / 10000).toFixed(0)}万
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">优先级分布</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>紧急</span>
                        <span>{salaryAdjustments.filter(a => a.priority === 'critical').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>重要</span>
                        <span>{salaryAdjustments.filter(a => a.priority === 'high').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>一般</span>
                        <span>{salaryAdjustments.filter(a => a.priority === 'medium').length}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Scale className="h-4 w-4 mr-2" />
                    批量执行
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 薪酬分布 */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>部门薪酬分布</CardTitle>
                <CardDescription>各部门薪酬水平对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentSalaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" name="平均薪酬(万元)" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {salaryDistribution.map((dist, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base">{dist.department}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">人数</span>
                        <span className="font-medium">{dist.employeeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">平均年薪</span>
                        <span className="font-medium">¥{(dist.averageSalary / 10000).toFixed(1)}万</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">中位数</span>
                        <span className="font-medium">¥{(dist.medianSalary / 10000).toFixed(1)}万</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">范围</span>
                        <span className="font-medium">
                          ¥{(dist.minSalary / 10000).toFixed(1)}万 - ¥{(dist.maxSalary / 10000).toFixed(1)}万
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs mb-1">
                          <span>薪酬离散度</span>
                          <span>{(Math.sqrt(dist.variance) / dist.averageSalary * 100).toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, (Math.sqrt(dist.variance) / dist.averageSalary * 100))}
                          className="h-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 风险预警 */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid gap-4">
              {salaryRiskAlerts.map((alert, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "border-l-4",
                    alert.severity === 'critical' && "border-l-red-500",
                    alert.severity === 'high' && "border-l-orange-500",
                    alert.severity === 'medium' && "border-l-yellow-500",
                    alert.severity === 'low' && "border-l-green-500"
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {alert.type === 'retention' && <Users className="h-4 w-4" />}
                            {alert.type === 'budget' && <DollarSign className="h-4 w-4" />}
                            {alert.type === 'equity' && <Scale className="h-4 w-4" />}
                            {alert.type === 'competition' && <TrendingUp className="h-4 w-4" />}
                            {alert.type === 'retention' && '离职风险'}
                            {alert.type === 'budget' && '预算风险'}
                            {alert.type === 'equity' && '薪酬公平性'}
                            {alert.type === 'competition' && '市场竞争'}
                          </h4>
                          <Badge
                            variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'default' : 'secondary'}
                          >
                            {alert.severity === 'critical' ? '紧急' : alert.severity === 'high' ? '重要' : '一般'}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-4">{alert.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">影响人数</p>
                            <p className="font-semibold text-lg">{alert.affectedEmployees}人</p>
                          </div>
                          {alert.estimatedCost > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground">预计成本</p>
                              <p className="font-semibold text-lg text-red-600">
                                ¥{(alert.estimatedCost / 10000).toFixed(0)}万
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                              <span className="font-medium">建议:</span> {alert.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
