'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// 员工薪酬数据
interface EmployeeSalary {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  currentSalary: number;
  marketSalary: number;
  salaryGap: number;
  salaryGapPercent: number;
  performance: number;
  yearsOfService: number;
  lastRaiseDate: string;
  riskLevel: 'high' | 'medium' | 'low';
}

// 市场薪酬数据
interface MarketBenchmark {
  position: string;
  level: string;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  industryAvg: number;
}

// 薪酬调整建议
interface SalaryAdjustment {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  suggestedRaise: number;
  suggestedSalary: number;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  budgetImpact: number;
}

// 薪酬风险预警
interface SalaryRiskAlert {
  type: 'below-market' | 'internal-inequity' | 'performance-pay-gap' | 'turnover-risk';
  level: 'critical' | 'high' | 'medium';
  message: string;
  affectedCount: number;
  recommendedAction: string;
}

const SalaryAnalytics: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // 模拟员工薪酬数据
  const [employeeSalaries] = useState<EmployeeSalary[]>([
    {
      id: 'e1',
      name: '张三',
      department: '技术部',
      position: '前端开发工程师',
      level: 'P5',
      currentSalary: 18000,
      marketSalary: 22000,
      salaryGap: -4000,
      salaryGapPercent: -18.18,
      performance: 85,
      yearsOfService: 2,
      lastRaiseDate: '2023-06-15',
      riskLevel: 'high'
    },
    {
      id: 'e2',
      name: '李四',
      department: '技术部',
      position: '后端开发工程师',
      level: 'P5',
      currentSalary: 19000,
      marketSalary: 21000,
      salaryGap: -2000,
      salaryGapPercent: -9.52,
      performance: 90,
      yearsOfService: 3,
      lastRaiseDate: '2023-08-20',
      riskLevel: 'medium'
    },
    {
      id: 'e3',
      name: '王五',
      department: '技术部',
      position: '技术专家',
      level: 'P7',
      currentSalary: 35000,
      marketSalary: 38000,
      salaryGap: -3000,
      salaryGapPercent: -7.89,
      performance: 95,
      yearsOfService: 5,
      lastRaiseDate: '2023-10-01',
      riskLevel: 'medium'
    },
    {
      id: 'e4',
      name: '赵六',
      department: '产品部',
      position: '产品经理',
      level: 'P6',
      currentSalary: 25000,
      marketSalary: 24000,
      salaryGap: 1000,
      salaryGapPercent: 4.17,
      performance: 88,
      yearsOfService: 2.5,
      lastRaiseDate: '2023-07-10',
      riskLevel: 'low'
    },
    {
      id: 'e5',
      name: '孙七',
      department: '设计部',
      position: 'UI设计师',
      level: 'P5',
      currentSalary: 15000,
      marketSalary: 18000,
      salaryGap: -3000,
      salaryGapPercent: -16.67,
      performance: 82,
      yearsOfService: 1.5,
      lastRaiseDate: '2023-09-05',
      riskLevel: 'high'
    },
    {
      id: 'e6',
      name: '周八',
      department: '技术部',
      position: '前端开发工程师',
      level: 'P5',
      currentSalary: 20000,
      marketSalary: 22000,
      salaryGap: -2000,
      salaryGapPercent: -9.09,
      performance: 78,
      yearsOfService: 1,
      lastRaiseDate: '2024-01-15',
      riskLevel: 'low'
    }
  ]);

  // 市场薪酬基准数据
  const marketBenchmarks: MarketBenchmark[] = [
    { position: '前端开发工程师', level: 'P5', p25: 18000, p50: 22000, p75: 26000, p90: 32000, industryAvg: 22000 },
    { position: '后端开发工程师', level: 'P5', p25: 19000, p50: 23000, p75: 28000, p90: 35000, industryAvg: 23000 },
    { position: '技术专家', level: 'P7', p25: 32000, p50: 38000, p75: 45000, p90: 55000, industryAvg: 38000 },
    { position: '产品经理', level: 'P6', p25: 22000, p50: 26000, p75: 32000, p90: 40000, industryAvg: 26000 },
    { position: 'UI设计师', level: 'P5', p25: 16000, p50: 19000, p75: 23000, p90: 28000, industryAvg: 19000 }
  ];

  // 薪酬调整建议
  const [salaryAdjustments] = useState<SalaryAdjustment[]>([
    {
      employeeId: 'e1',
      employeeName: '张三',
      currentPosition: '前端开发工程师',
      suggestedRaise: 3500,
      suggestedSalary: 21500,
      reason: '市场薪酬低于基准18%，绩效优秀（85分），建议调薪至接近市场中位数',
      priority: 'critical',
      budgetImpact: 42000
    },
    {
      employeeId: 'e5',
      employeeName: '孙七',
      currentPosition: 'UI设计师',
      suggestedRaise: 2500,
      suggestedSalary: 17500,
      reason: '市场薪酬低于基准16%，绩效良好，建议调薪至接近P75分位',
      priority: 'high',
      budgetImpact: 30000
    },
    {
      employeeId: 'e3',
      employeeName: '王五',
      currentPosition: '技术专家',
      suggestedRaise: 2800,
      suggestedSalary: 37800,
      reason: '核心人才，市场薪酬略低于基准，绩效优秀（95分），建议调薪至市场中位数',
      priority: 'high',
      budgetImpact: 33600
    },
    {
      employeeId: 'e2',
      employeeName: '李四',
      currentPosition: '后端开发工程师',
      suggestedRaise: 1500,
      suggestedSalary: 20500,
      reason: '市场薪酬低于基准10%，绩效优秀，建议适度调薪',
      priority: 'medium',
      budgetImpact: 18000
    }
  ]);

  // 薪酬风险预警
  const [salaryRisks] = useState<SalaryRiskAlert[]>([
    {
      type: 'below-market',
      level: 'high',
      message: '33%的员工薪酬低于市场基准10%以上，存在高离职风险',
      affectedCount: 2,
      recommendedAction: '优先调整高风险员工薪酬，建立定期市场对标机制'
    },
    {
      type: 'performance-pay-gap',
      level: 'medium',
      message: '发现3名高绩效员工薪酬与绩效不匹配',
      affectedCount: 3,
      recommendedAction: '建立绩效与薪酬联动机制，对高绩效员工给予更多激励'
    },
    {
      type: 'turnover-risk',
      level: 'critical',
      message: '张三、孙七等关键人才存在离职风险，需立即干预',
      affectedCount: 2,
      recommendedAction: '紧急沟通，提供调薪和发展机会，制定人才保留计划'
    }
  ]);

  // 过滤数据
  const filteredSalaries = useMemo(() => {
    return employeeSalaries.filter(emp => {
      const deptMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const levelMatch = selectedLevel === 'all' || emp.level === selectedLevel;
      return deptMatch && levelMatch;
    });
  }, [employeeSalaries, selectedDepartment, selectedLevel]);

  // 部门薪酬分析数据
  const departmentSalaryData = useMemo(() => {
    const deptMap = new Map();
    filteredSalaries.forEach(emp => {
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, { current: 0, market: 0, count: 0 });
      }
      const dept = deptMap.get(emp.department);
      dept.current += emp.currentSalary;
      dept.market += emp.marketSalary;
      dept.count++;
    });
    
    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      平均薪酬: Math.round(data.current / data.count),
      市场基准: Math.round(data.market / data.count),
      薪酬差距: Math.round((data.current / data.count) - (data.market / data.count))
    }));
  }, [filteredSalaries]);

  // 薪酬分布数据
  const salaryDistributionData = [
    { name: '低于P25', count: filteredSalaries.filter(e => e.currentSalary < 18000).length, value: 12 },
    { name: 'P25-P50', count: filteredSalaries.filter(e => e.currentSalary >= 18000 && e.currentSalary < 22000).length, value: 25 },
    { name: 'P50-P75', count: filteredSalaries.filter(e => e.currentSalary >= 22000 && e.currentSalary < 26000).length, value: 38 },
    { name: '高于P75', count: filteredSalaries.filter(e => e.currentSalary >= 26000).length, value: 25 }
  ];

  // 统计数据
  const stats = useMemo(() => {
    const totalCurrentSalary = filteredSalaries.reduce((sum, emp) => sum + emp.currentSalary, 0);
    const totalMarketSalary = filteredSalaries.reduce((sum, emp) => sum + emp.marketSalary, 0);
    const avgSalary = Math.round(totalCurrentSalary / filteredSalaries.length);
    const avgMarketSalary = Math.round(totalMarketSalary / filteredSalaries.length);
    const belowMarketCount = filteredSalaries.filter(emp => emp.salaryGapPercent < -10).length;
    const highRiskCount = filteredSalaries.filter(emp => emp.riskLevel === 'high').length;
    
    return {
      totalCurrentSalary,
      totalMarketSalary,
      avgSalary,
      avgMarketSalary,
      belowMarketCount,
      highRiskCount,
      salaryGapPercent: Math.round(((avgMarketSalary - avgSalary) / avgMarketSalary) * 100)
    };
  }, [filteredSalaries]);

  // 运行AI分析
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowRecommendations(true);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                薪酬智能分析
              </h1>
              <p className="text-sm text-gray-600 mt-1">基于市场对标和AI分析的薪酬优化系统</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={runAIAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新分析
                  </>
                )}
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                导出报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>平均月薪</CardDescription>
              <CardTitle className="text-2xl">¥{stats.avgSalary.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500">低于市场 {stats.salaryGapPercent}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>市场平均</CardDescription>
              <CardTitle className="text-2xl">¥{stats.avgMarketSalary.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">行业基准参考</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>低于市场10%+</CardDescription>
              <CardTitle className="text-2xl">{stats.belowMarketCount}人</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-orange-500">需关注调整</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>高风险员工</CardDescription>
              <CardTitle className="text-2xl">{stats.highRiskCount}人</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500">离职风险</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 风险预警 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {salaryRisks.map((risk, index) => (
            <Alert key={index} variant={risk.level === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{risk.level === 'critical' ? '严重风险' : risk.level === 'high' ? '高风险' : '中风险'}</span>
                <Badge className={getRiskLevelColor(risk.level)}>{risk.affectedCount}人受影响</Badge>
              </AlertTitle>
              <AlertDescription>
                <p className="mb-2">{risk.message}</p>
                <p className="text-sm font-medium">建议：{risk.recommendedAction}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* 主内容区 */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">概览分析</TabsTrigger>
            <TabsTrigger value="department">部门分析</TabsTrigger>
            <TabsTrigger value="adjustment">调整建议</TabsTrigger>
            <TabsTrigger value="details">详细数据</TabsTrigger>
          </TabsList>

          {/* 概览分析 */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>薪酬分布</CardTitle>
                  <CardDescription>员工薪酬在市场分位中的分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salaryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.count}人`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {salaryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>薪酬与市场对比</CardTitle>
                  <CardDescription>当前薪酬 vs 市场基准</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredSalaries.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentSalary" name="当前薪酬" fill="#3B82F6" />
                      <Bar dataKey="marketSalary" name="市场基准" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 部门分析 */}
          <TabsContent value="department">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>部门薪酬分析</CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有部门</SelectItem>
                        <SelectItem value="技术部">技术部</SelectItem>
                        <SelectItem value="产品部">产品部</SelectItem>
                        <SelectItem value="设计部">设计部</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有级别</SelectItem>
                        <SelectItem value="P5">P5</SelectItem>
                        <SelectItem value="P6">P6</SelectItem>
                        <SelectItem value="P7">P7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>各部门薪酬与市场基准对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={departmentSalaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="平均薪酬" name="平均薪酬" fill="#3B82F6" />
                    <Bar dataKey="市场基准" name="市场基准" fill="#10B981" />
                    <Bar dataKey="薪酬差距" name="薪酬差距" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 调整建议 */}
          <TabsContent value="adjustment">
            <Card>
              <CardHeader>
                <CardTitle>AI薪酬调整建议</CardTitle>
                <CardDescription>基于市场对标、绩效分析和人才保留需求的智能建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryAdjustments.map((adjustment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{adjustment.employeeName}</h3>
                            <Badge className={getRiskLevelColor(adjustment.priority)}>
                              {adjustment.priority === 'critical' ? '紧急' : 
                               adjustment.priority === 'high' ? '重要' : '一般'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{adjustment.currentPosition}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            +¥{adjustment.suggestedRaise.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            调整至 ¥{adjustment.suggestedSalary.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{adjustment.reason}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          年度预算影响: ¥{adjustment.budgetImpact.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            查看详情
                          </Button>
                          <Button size="sm">
                            批准调整
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">调整总预算</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ¥{salaryAdjustments.reduce((sum, adj) => sum + adj.budgetImpact, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">
                    影响员工数: {salaryAdjustments.length}人 | 建议调整周期: 本年度薪酬调整
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 详细数据 */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>员工薪酬详情</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      导出数据
                    </Button>
                  </div>
                </div>
                <CardDescription>各员工薪酬与市场基准的详细对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">姓名</th>
                        <th className="text-left py-3 px-4">部门</th>
                        <th className="text-left py-3 px-4">职位</th>
                        <th className="text-left py-3 px-4">级别</th>
                        <th className="text-right py-3 px-4">当前薪酬</th>
                        <th className="text-right py-3 px-4">市场基准</th>
                        <th className="text-right py-3 px-4">薪酬差距</th>
                        <th className="text-center py-3 px-4">绩效</th>
                        <th className="text-center py-3 px-4">风险等级</th>
                        <th className="text-center py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalaries.map((emp) => (
                        <tr key={emp.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{emp.name}</td>
                          <td className="py-3 px-4">{emp.department}</td>
                          <td className="py-3 px-4">{emp.position}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{emp.level}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">¥{emp.currentSalary.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">¥{emp.marketSalary.toLocaleString()}</td>
                          <td className={`py-3 px-4 text-right ${emp.salaryGapPercent < -10 ? 'text-red-600' : emp.salaryGapPercent > 0 ? 'text-green-600' : ''}`}>
                            {emp.salaryGapPercent > 0 ? '+' : ''}{emp.salaryGapPercent.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={emp.performance} className="w-16" />
                              <span className="text-sm">{emp.performance}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={getRiskLevelColor(emp.riskLevel)}>
                              {emp.riskLevel === 'high' ? '高风险' : emp.riskLevel === 'medium' ? '中风险' : '低风险'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button variant="ghost" size="sm">
                              查看详情
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaryAnalytics;
