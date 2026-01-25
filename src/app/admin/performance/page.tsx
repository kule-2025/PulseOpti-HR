'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Zap,
  Clock,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
} from 'lucide-react';

import monitor from '@/lib/performance/monitor';

interface PerformanceData {
  apiMetrics: {
    totalRequests: number;
    avgResponseTime: number;
    successRate: number;
    errorCount: number;
  };
  cacheMetrics: {
    totalCacheKeys: number;
    avgHitRate: number;
  };
  renderMetrics: {
    avgRenderTime: number;
    componentUpdates: number;
  };
  recentErrors: Array<{
    timestamp: number;
    type: string;
    message: string;
  }>;
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const fetchPerformanceData = () => {
    const metrics = monitor.getAllMetrics();
    const recentErrors = monitor.getRecentErrors(10);

    setData({
      apiMetrics: {
        totalRequests: metrics.apiRequests.total,
        avgResponseTime: metrics.apiRequests.avgDuration,
        successRate: metrics.apiRequests.successRate,
        errorCount: metrics.apiRequests.errors,
      },
      cacheMetrics: {
        totalCacheKeys: metrics.cache.totalCacheKeys,
        avgHitRate: metrics.cache.avgHitRate,
      },
      renderMetrics: {
        avgRenderTime: metrics.renders.avgDuration,
        componentUpdates: metrics.renders.totalUpdates,
      },
      recentErrors: recentErrors.map(error => ({
        timestamp: error.timestamp,
        type: error.type,
        message: error.message,
      })),
    });
  };

  useEffect(() => {
    fetchPerformanceData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchPerformanceData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const clearData = () => {
    monitor.clearMetrics();
    fetchPerformanceData();
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-500" />
            性能监控仪表盘
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            实时监控应用性能指标
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            {autoRefresh ? '自动刷新中' : '已暂停'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            手动刷新
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearData}
          >
            <Database className="h-4 w-4 mr-2" />
            清除数据
          </Button>
        </div>
      </div>

      {data ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="api">API 请求</TabsTrigger>
            <TabsTrigger value="cache">缓存</TabsTrigger>
            <TabsTrigger value="render">渲染</TabsTrigger>
            <TabsTrigger value="errors">错误</TabsTrigger>
          </TabsList>

          {/* 总览 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API 请求数</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.apiMetrics.totalRequests}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    成功率: {data.apiMetrics.successRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.apiMetrics.avgResponseTime.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.apiMetrics.avgResponseTime < 500 ? (
                      <Badge className="bg-green-100 text-green-700">优秀</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">可优化</Badge>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">缓存命中率</CardTitle>
                  <Database className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.cacheMetrics.avgHitRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.cacheMetrics.totalCacheKeys} 个缓存项
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">渲染时间</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.renderMetrics.avgRenderTime.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.renderMetrics.componentUpdates} 次更新
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 最近错误 */}
            <Card>
              <CardHeader>
                <CardTitle>最近错误</CardTitle>
                <CardDescription>
                  最近的错误日志
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentErrors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>没有错误记录</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.recentErrors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-100 text-red-700">{error.type}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {error.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API 请求 */}
          <TabsContent value="api" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总请求数</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.apiMetrics.totalRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.apiMetrics.avgResponseTime.toFixed(0)}ms
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">错误数</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{data.apiMetrics.errorCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>成功率</CardTitle>
                <CardDescription>
                  API 请求成功率
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {data.apiMetrics.successRate.toFixed(2)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {data.apiMetrics.successRate >= 95 ? (
                    <Badge className="bg-green-100 text-green-700">优秀</Badge>
                  ) : data.apiMetrics.successRate >= 90 ? (
                    <Badge className="bg-yellow-100 text-yellow-700">良好</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">需要关注</Badge>
                  )}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 缓存 */}
          <TabsContent value="cache" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">缓存项总数</CardTitle>
                  <Database className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.cacheMetrics.totalCacheKeys}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均命中率</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.cacheMetrics.avgHitRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.cacheMetrics.avgHitRate >= 0.7 ? (
                      <Badge className="bg-green-100 text-green-700">优秀</Badge>
                    ) : data.cacheMetrics.avgHitRate >= 0.5 ? (
                      <Badge className="bg-yellow-100 text-yellow-700">良好</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">需要优化</Badge>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 渲染 */}
          <TabsContent value="render" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均渲染时间</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.renderMetrics.avgRenderTime.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.renderMetrics.avgRenderTime < 16 ? (
                      <Badge className="bg-green-100 text-green-700">优秀 (60fps)</Badge>
                    ) : data.renderMetrics.avgRenderTime < 33 ? (
                      <Badge className="bg-yellow-100 text-yellow-700">良好 (30fps)</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">需要优化</Badge>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">组件更新次数</CardTitle>
                  <RefreshCw className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.renderMetrics.componentUpdates}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 错误 */}
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>错误日志</CardTitle>
                <CardDescription>
                  最近的错误记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentErrors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>没有错误记录</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.recentErrors.map((error, index) => (
                      <div
                        key={index}
                        className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-100 text-red-700">{error.type}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {error.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">加载性能数据...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
