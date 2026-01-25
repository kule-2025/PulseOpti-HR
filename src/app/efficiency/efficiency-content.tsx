'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  RefreshCw,
  Sparkles,
  Eye,
  BrainCircuit,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface MetricData {
  code: string;
  name: string;
  value: number;
  unit: string;
  changeRate?: string;
  benchmark?: number;
}

interface DashboardData {
  keyMetrics: MetricData[];
  trendData: Array<{ period: string; metrics: Record<string, number> }>;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  activeAlerts?: Array<{
    id: string;
    metricCode: string;
    severity: string;
    message: string;
    createdAt: string;
  }>;
}

interface AttributionAnalysis {
  id: string;
  metricCode: string;
  currentValue: number;
  previousValue: number;
  changeRate: string;
  analysis: {
    keyFactors: Array<{
      factor: string;
      impact: string;
      description: string;
      confidence: number;
    }>;
    recommendations: Array<{
      priority: string;
      action: string;
      expectedImpact: string;
    }>;
    insights: string[];
  };
  createdAt: string;
}

interface PredictionAnalysis {
  id: string;
  metricCode: string;
  predictionPeriod: string;
  predictionType: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  analysis: any;
  createdAt: string;
}

interface Recommendation {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  recommendation: string;
  actionSteps: any[];
  expectedImpact: any;
  status: string;
  createdAt: string;
}

export default function EfficiencyPageContent() {
  const [selectedMetric, setSelectedMetric] = useLocalStorage<string | null>('efficiency-metric', null);
  const [refreshing, setRefreshing] = useState(false);
  const [attributionAnalysis, setAttributionAnalysis] = useState<AttributionAnalysis | null>(null);
  const [predictionAnalysis, setPredictionAnalysis] = useState<PredictionAnalysis | null>(null);

  // 获取仪表盘数据
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    execute: fetchDashboardData,
  } = useAsync<DashboardData>();

  // 获取决策建议
  const {
    data: recommendations = [],
    loading: recommendationsLoading,
    error: recommendationsError,
    execute: fetchRecommendations,
  } = useAsync<Recommendation[]>();

  useEffect(() => {
    loadDashboardData();
    loadRecommendations();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      return await fetchWithCache<DashboardData>('efficiency-dashboard', async () => {
        const response = await get<{ success: boolean; data?: DashboardData }>(
          '/api/efficiency/dashboard'
        );

        if (response.success && response.data) {
          if (!selectedMetric && response.data.keyMetrics.length > 0) {
            setSelectedMetric(response.data.keyMetrics[0].code);
          }
          return response.data;
        }
        return null;
      }, 2 * 60 * 1000); // 2分钟缓存
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      monitor.trackError('loadDashboardData', error as Error);
      toast.error('获取数据失败');
      throw error;
    }
  }, [selectedMetric, setSelectedMetric]);

  const loadRecommendations = useCallback(async () => {
    try {
      return await fetchWithCache<Recommendation[]>('efficiency-recommendations', async () => {
        const response = await get<{ success: boolean; data?: Recommendation[] }>(
          '/api/efficiency/recommendations'
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000); // 5分钟缓存
    } catch (error) {
      console.error('获取决策建议失败:', error);
      monitor.trackError('loadRecommendations', error as Error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await post<{ success: boolean }>(
        '/api/efficiency/dashboard',
        { forceRecalculate: true }
      );
      await fetchDashboardData();
      toast.success('数据已刷新');
    } catch (error) {
      console.error('刷新失败:', error);
      monitor.trackError('refreshDashboardData', error as Error);
      toast.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  const fetchAttribution = useCallback(async (metricCode: string) => {
    try {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const response = await post<{ success: boolean; data?: AttributionAnalysis }>(
        '/api/efficiency/attribution',
        {
          metricCode,
          period,
          requestedBy: 'user',
        }
      );

      if (response.success && response.data) {
        setAttributionAnalysis(response.data);
        toast.success('归因分析完成');
      }
    } catch (error) {
      console.error('归因分析失败:', error);
      monitor.trackError('fetchAttribution', error as Error);
      toast.error('归因分析失败');
    }
  }, []);

  const fetchPrediction = useCallback(async (metricCode: string) => {
    try {
      const response = await post<{ success: boolean; data?: PredictionAnalysis }>(
        '/api/efficiency/prediction',
        {
          metricCode,
          predictionPeriod: 'next-month',
          predictionType: 'trend',
          requestedBy: 'user',
        }
      );

      if (response.success && response.data) {
        setPredictionAnalysis(response.data);
        toast.success('预测分析完成');
      }
    } catch (error) {
      console.error('预测分析失败:', error);
      monitor.trackError('fetchPrediction', error as Error);
      toast.error('预测分析失败');
    }
  }, []);

  const formatMetricValue = useCallback((value: number, unit: string) => {
    if (unit === '万元') {
      return `¥${value.toFixed(1)}万`;
    }
    if (unit === '%') {
      return `${value}%`;
    }
    if (unit === '天') {
      return `${value}天`;
    }
    return value.toString();
  }, []);

  const getPriorityBadge = useCallback((priority: string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      high: { label: '高优先级', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400' },
      medium: { label: '中优先级', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400' },
      low: { label: '低优先级', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400' },
    };
    const config = priorityMap[priority] || { label: priority, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.color}>{config.label}</Badge>;
  }, []);

  const hasError = dashboardError || recommendationsError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">加载数据失败</p>
          <Button onClick={() => {
            loadDashboardData();
            loadRecommendations();
          }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            人效监测
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时监测 · 深度归因 · 智能预测 · 决策建议
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshData}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 预警信息 */}
      {dashboardData?.activeAlerts && dashboardData.activeAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-400">
            需要关注
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-300">
            {dashboardData.activeAlerts.map((alert, index) => (
              <div key={alert.id} className="mt-1">
                {index + 1}. {alert.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* 关键指标卡片 */}
      {dashboardLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData?.keyMetrics.map((metric) => (
            <Card
              key={metric.code}
              className="card-hover cursor-pointer"
              onClick={() => setSelectedMetric(metric.code)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.name}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatMetricValue(metric.value, metric.unit)}
                </div>
                {metric.changeRate && (
                  <div className="flex items-center gap-1 text-sm">
                    {parseFloat(metric.changeRate) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        parseFloat(metric.changeRate) >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {parseFloat(metric.changeRate) >= 0 ? '+' : ''}
                      {metric.changeRate}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 功能模块 */}
      <Tabs defaultValue="attribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attribution">
            <BrainCircuit className="mr-2 h-4 w-4" />
            深度归因
          </TabsTrigger>
          <TabsTrigger value="prediction">
            <Activity className="mr-2 h-4 w-4" />
            智能预测
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="mr-2 h-4 w-4" />
            决策建议
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI深度归因分析
                  </CardTitle>
                  <CardDescription>
                    基于豆包大模型，深入分析指标变化原因
                  </CardDescription>
                </div>
                {selectedMetric && (
                  <Button
                    onClick={() => fetchAttribution(selectedMetric)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    开始分析
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {attributionAnalysis ? (
                <div className="space-y-6">
                  {/* 分析概览 */}
                  <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-4">
                      分析概览
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          当前值
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {attributionAnalysis.currentValue}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          变化率
                        </div>
                        <div className="text-2xl font-bold">
                          {attributionAnalysis.changeRate}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          分析时间
                        </div>
                        <div className="text-sm font-medium">
                          {new Date(attributionAnalysis.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 关键影响因素 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      关键影响因素
                    </h3>
                    <div className="space-y-3">
                      {attributionAnalysis.analysis.keyFactors.map((factor, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {factor.factor}
                            </h4>
                            <Badge
                              className={
                                factor.impact === 'positive'
                                  ? 'bg-green-100 text-green-700'
                                  : factor.impact === 'negative'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {factor.impact === 'positive'
                                ? '正面影响'
                                : factor.impact === 'negative'
                                ? '负面影响'
                                : '中性影响'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {factor.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">置信度:</span>
                            <Progress value={factor.confidence} className="flex-1 h-2" />
                            <span className="text-xs font-medium">
                              {factor.confidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 建议措施 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      建议措施
                    </h3>
                    <div className="space-y-3">
                      {attributionAnalysis.analysis.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {rec.action}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              预期效果: {rec.expectedImpact}
                            </p>
                          </div>
                          {getPriorityBadge(rec.priority)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">选择一个指标并点击"开始分析"</p>
                  <p className="text-sm">
                    AI将深入分析该指标变化的根本原因，并提供可行建议
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    智能趋势预测
                  </CardTitle>
                  <CardDescription>
                    预测未来趋势，识别潜在风险和机会
                  </CardDescription>
                </div>
                {selectedMetric && (
                  <Button
                    onClick={() => fetchPrediction(selectedMetric)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    生成预测
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {predictionAnalysis ? (
                <div className="space-y-6">
                  {/* 预测概览 */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-950">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-400 mb-4">
                        当前值
                      </h3>
                      <div className="text-4xl font-bold text-purple-600">
                        {predictionAnalysis.currentValue}
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-4">
                        预测值
                      </h3>
                      <div className="text-4xl font-bold text-blue-600">
                        {predictionAnalysis.predictedValue}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Activity className="h-4 w-4" />
                        {parseFloat(predictionAnalysis.predictedValue.toString()) >
                        parseFloat(predictionAnalysis.currentValue.toString()) ? (
                          <span className="text-green-600">预计上升</span>
                        ) : (
                          <span className="text-red-600">预计下降</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 置信度 */}
                  <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        预测置信度
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {predictionAnalysis.confidence}%
                      </span>
                    </div>
                    <Progress value={predictionAnalysis.confidence} className="h-3" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      置信度基于历史数据和当前趋势计算得出
                    </p>
                  </div>

                  {/* 详细分析 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      预测分析
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">
                        根据当前趋势和历史数据分析，预计该指标在未来一个月将呈现{' '}
                        {parseFloat(predictionAnalysis.predictedValue.toString()) >
                        parseFloat(predictionAnalysis.currentValue.toString())
                          ? '上升趋势'
                          : '下降趋势'}
                        。建议密切关注相关影响因素，及时采取干预措施。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">选择一个指标并点击"生成预测"</p>
                  <p className="text-sm">
                    AI将基于历史数据和当前趋势，预测未来一个月的指标变化
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                决策建议
              </CardTitle>
              <CardDescription>
                基于AI分析，为您提供可执行的决策建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-lg border p-6 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {rec.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {rec.description}
                          </p>
                        </div>
                        {getPriorityBadge(rec.priority)}
                      </div>

                      <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                          核心建议
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {rec.recommendation}
                        </p>
                      </div>

                      {rec.actionSteps && rec.actionSteps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            执行步骤
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {rec.actionSteps.map((step: any, index: number) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          预期效果: {rec.expectedImpact}
                        </div>
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          标记为已完成
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">暂无决策建议</p>
                  <p className="text-sm">
                    系统将基于人效监测和分析结果，为您生成个性化的决策建议
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
