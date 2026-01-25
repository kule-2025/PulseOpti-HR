'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/loading';
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  BrainCircuit,
  Sparkles,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';
import { cachedGet } from '@/lib/api-helper';

interface EfficiencyMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  period: string;
}

interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

export default function AnalyticsContent() {
  const [period, setPeriod] = useLocalStorage('analytics-period', '30d');
  const [activeTab, setActiveTab] = useLocalStorage('analytics-tab', 'overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  // 加载效率指标
  const {
    data: efficiencyMetrics = [],
    loading: metricsLoading,
    error: metricsError,
    execute: fetchMetrics,
  } = useAsync<EfficiencyMetric[]>();

  // 加载部门数据
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const loadEfficiencyMetrics = useCallback(async (): Promise<EfficiencyMetric[]> => {
    try {
      const data = await cachedGet<EfficiencyMetric[]>(
        `/api/analytics/metrics?period=${period}`,
        `efficiency-metrics-${period}`,
        5 * 60 * 1000
      );

      return data || [];
    } catch (err) {
      console.error('加载效率指标失败:', err);
      monitor.trackError('loadEfficiencyMetrics', err as Error);
      throw err;
    }
  }, [period]);

  const loadDepartmentData = useCallback(async () => {
    try {
      setDeptLoading(true);
      const data = await cachedGet<any[]>(
        `/api/analytics/departments?period=${period}`,
        `department-analytics-${period}`,
        5 * 60 * 1000
      );

      setDepartmentData(data || []);
    } catch (err) {
      console.error('加载部门数据失败:', err);
      monitor.trackError('loadDepartmentData', err as Error);
    } finally {
      setDeptLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics(loadEfficiencyMetrics);
    loadDepartmentData();
  }, [period, fetchMetrics, loadEfficiencyMetrics, loadDepartmentData]);

  const handleAIAnalysis = useCallback(async () => {
    setAnalyzing(true);
    try {
      const response = await get<AIAnalysis>(
        '/api/analytics/ai-analysis'
      );

      if (response && response.success && response.data) {
        setAiAnalysis(response.data);
      } else {
        setAiAnalysis(null);
      }
    } catch (err) {
      console.error('AI分析失败:', err);
      setAiAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const getMetricStatusColor = useCallback((status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      excellent: { bg: 'bg-green-100', text: 'text-green-700' },
      good: { bg: 'bg-blue-100', text: 'text-blue-700' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      critical: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  }, []);

  const summaryMetrics = useMemo(() => {
    const metrics = efficiencyMetrics || [];
    const total = metrics.length;
    const excellent = metrics.filter((m: EfficiencyMetric) => m.status === 'excellent').length;
    const good = metrics.filter((m: EfficiencyMetric) => m.status === 'good').length;
    const warning = metrics.filter((m: EfficiencyMetric) => m.status === 'warning').length;
    const critical = metrics.filter((m: EfficiencyMetric) => m.status === 'critical').length;

    return { total, excellent, good, warning, critical };
  }, [efficiencyMetrics]);

  if (metricsError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <Sparkles className="h-5 w-5" />
              <span>加载失败: {metricsError.message}</span>
            </div>
            <Button onClick={() => fetchMetrics(loadEfficiencyMetrics)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">数据分析</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            深度分析HR数据，获取业务洞察
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAIAnalysis}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <BrainCircuit className={`h-4 w-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
            AI智能分析
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
              <SelectItem value="1y">近1年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="efficiency">人效分析</TabsTrigger>
          <TabsTrigger value="departments">部门对比</TabsTrigger>
          <TabsTrigger value="ai">AI洞察</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {metricsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总指标数</p>
                        <p className="text-2xl font-bold">{summaryMetrics.total}</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">优秀</p>
                        <p className="text-2xl font-bold text-green-600">{summaryMetrics.excellent}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">警告</p>
                        <p className="text-2xl font-bold text-yellow-600">{summaryMetrics.warning}</p>
                      </div>
                      <Target className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">危急</p>
                        <p className="text-2xl font-bold text-red-600">{summaryMetrics.critical}</p>
                      </div>
                      <Sparkles className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {aiAnalysis && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  AI分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">总结</h4>
                  <p className="text-gray-700 dark:text-gray-300">{aiAnalysis.summary}</p>
                </div>
                {aiAnalysis.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">关键洞察</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {aiAnalysis.insights.map((insight, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>人效指标</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : !efficiencyMetrics || efficiencyMetrics.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无数据</div>
              ) : (
                <div className="space-y-4">
                  {efficiencyMetrics.map((metric) => {
                    const statusColors = getMetricStatusColor(metric.status);
                    const progressValue = (metric.currentValue / metric.targetValue) * 100;

                    return (
                      <Card key={metric.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{metric.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">当前值: {metric.currentValue}</span>
                                <span className="text-sm text-gray-400">|</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">目标值: {metric.targetValue}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {metric.trend === 'up' && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                  {metric.trendPercentage}%
                                </Badge>
                              )}
                              {metric.trend === 'down' && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                  {Math.abs(metric.trendPercentage)}%
                                </Badge>
                              )}
                              <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                                {metric.status}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={Math.min(progressValue, 100)} className="h-2" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>部门数据对比</CardTitle>
            </CardHeader>
            <CardContent>
              {deptLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : departmentData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>部门</TableHead>
                      <TableHead>人数</TableHead>
                      <TableHead>人均收入</TableHead>
                      <TableHead>人均利润</TableHead>
                      <TableHead>人效指数</TableHead>
                      <TableHead>趋势</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.employeeCount}</TableCell>
                        <TableCell>¥{(dept.revenuePerPerson || 0).toFixed(2)}万</TableCell>
                        <TableCell>¥{(dept.profitPerPerson || 0).toFixed(2)}万</TableCell>
                        <TableCell>
                          <Progress value={dept.efficiencyIndex || 0} className="w-24 h-2" />
                        </TableCell>
                        <TableCell>
                          {dept.trend === 'up' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {aiAnalysis ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    AI智能洞察
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">总结</h4>
                      <p className="text-gray-700 dark:text-gray-300">{aiAnalysis.summary}</p>
                    </div>
                    {aiAnalysis.insights.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">关键洞察</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {aiAnalysis.insights.map((insight, i) => (
                            <li key={i} className="text-gray-700 dark:text-gray-300">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {aiAnalysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      改进建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {aiAnalysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {aiAnalysis.riskFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      风险因素
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {aiAnalysis.riskFactors.map((risk, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">{risk}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {aiAnalysis.opportunities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-600" />
                  机遇
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {aiAnalysis.opportunities.map((opp, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{opp}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">点击上方"AI智能分析"按钮开始分析</p>
                  <Button onClick={handleAIAnalysis} disabled={analyzing}>
                    {analyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-4 w-4 mr-2" />
                        开始分析
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
