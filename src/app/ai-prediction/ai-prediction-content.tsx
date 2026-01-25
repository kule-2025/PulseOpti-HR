'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Brain,
  Target,
  CheckCircle2,
  RefreshCw,
  Activity,
  ArrowRight,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';
import { cachedGet } from '@/lib/api-helper';

interface PredictionData {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  currentScore: number;
  predictedScore: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  riskLevel?: 'high' | 'medium' | 'low';
}

interface EfficiencyPrediction {
  metricCode: string;
  metricName: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export default function AIPredictionContent() {
  const [activeTab, setActiveTab] = useLocalStorage('ai-prediction-tab', 'performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: performancePredictions = [],
    loading: performanceLoading,
    error: performanceError,
    execute: fetchPerformance,
  } = useAsync<PredictionData[]>();

  const {
    data: efficiencyPredictions = [],
    loading: efficiencyLoading,
    error: efficiencyError,
    execute: fetchEfficiency,
  } = useAsync<EfficiencyPrediction[]>();

  const [analyzing, setAnalyzing] = useState(false);

  const loadPerformancePredictions = useCallback(async (): Promise<PredictionData[]> => {
    try {
      const data = await cachedGet<PredictionData[]>(
        '/api/ai-prediction/performance',
        'performance-predictions',
        10 * 60 * 1000
      );

      return data || [];
    } catch (err) {
      console.error('加载绩效预测失败:', err);
      monitor.trackError('loadPerformancePredictions', err as Error);
      throw err;
    }
  }, []);

  const loadEfficiencyPredictions = useCallback(async (): Promise<EfficiencyPrediction[]> => {
    try {
      const data = await cachedGet<EfficiencyPrediction[]>(
        '/api/ai-prediction/efficiency',
        'efficiency-predictions',
        10 * 60 * 1000
      );

      return data || [];
    } catch (err) {
      console.error('加载效率预测失败:', err);
      monitor.trackError('loadEfficiencyPredictions', err as Error);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPerformance(loadPerformancePredictions);
    fetchEfficiency(loadEfficiencyPredictions);
  }, [fetchPerformance, fetchEfficiency, loadPerformancePredictions, loadEfficiencyPredictions]);

  const filteredPredictions = useMemo(() => {
    return (performancePredictions || []).filter((pred: PredictionData) => {
      const matchesSearch = !debouncedQuery ||
        pred.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        pred.department.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [performancePredictions, debouncedQuery]);

  const handleRunAnalysis = useCallback(async () => {
    setAnalyzing(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      fetchPerformance(loadPerformancePredictions);
      fetchEfficiency(loadEfficiencyPredictions);
    } catch (err) {
      console.error('分析失败:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [fetchPerformance, fetchEfficiency, loadPerformancePredictions, loadEfficiencyPredictions]);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  }, []);

  const getRiskBadge = useCallback((level?: string) => {
    if (!level) return null;
    const badges: Record<string, { text: string; color: string }> = {
      high: { text: '高风险', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      medium: { text: '中风险', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      low: { text: '低风险', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    };
    const badge = badges[level];
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const error = performanceError || efficiencyError;

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => {
              fetchPerformance(loadPerformancePredictions);
              fetchEfficiency(loadEfficiencyPredictions);
            }} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI预测</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            基于AI模型的智能预测分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                运行分析
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="performance">绩效预测</TabsTrigger>
          <TabsTrigger value="efficiency">效率预测</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  员工绩效预测
                </CardTitle>
                <div className="relative">
                  <Input
                    placeholder="搜索员工"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredPredictions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无预测数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>当前绩效</TableHead>
                      <TableHead>预测绩效</TableHead>
                      <TableHead>趋势</TableHead>
                      <TableHead>置信度</TableHead>
                      <TableHead>风险</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPredictions.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">{prediction.employeeName}</TableCell>
                        <TableCell>{prediction.department}</TableCell>
                        <TableCell>{prediction.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{prediction.currentScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{prediction.predictedScore}</span>
                            {getTrendIcon(prediction.trend)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(prediction.trend)}
                            <span className="text-sm text-gray-600">
                              {prediction.trend === 'up' ? '上升' :
                               prediction.trend === 'down' ? '下降' : '稳定'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress value={prediction.confidence} className="w-24 h-2" />
                          <span className="text-xs text-gray-500 ml-2">{prediction.confidence}%</span>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(prediction.riskLevel)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {efficiencyLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))
            ) : !efficiencyPredictions || efficiencyPredictions.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-500">暂无预测数据</div>
            ) : (
              efficiencyPredictions.map((prediction) => (
                <Card key={prediction.metricCode}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {prediction.metricName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">当前值</span>
                        <span className="text-2xl font-bold">{prediction.currentValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">预测值</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{prediction.predictedValue}</span>
                          {getTrendIcon(prediction.trend)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">置信度</span>
                          <span className="text-sm font-medium">{prediction.confidence}%</span>
                        </div>
                        <Progress value={prediction.confidence} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
