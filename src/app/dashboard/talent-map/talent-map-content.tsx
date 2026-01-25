'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/loading';
import {
  Users,
  Star,
  Target,
  TrendingUp,
  Shield,
  RefreshCw,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  performance: number;
  potential: number;
  riskLevel: 'high' | 'medium' | 'low';
  tenure: number;
}

interface TalentGrid {
  quadrant: 'star' | 'highPotential' | 'steady' | 'lowPerformance';
  label: string;
  color: string;
  employees: Employee[];
}

export default function TalentMapContent() {
  const [activeTab, setActiveTab] = useLocalStorage('talent-map-tab', 'grid');

  const {
    data: talentGrid = [],
    loading,
    error,
    execute: fetchTalentMap,
  } = useAsync<TalentGrid[]>();

  const [successionPlans, setSuccessionPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const loadTalentMap = useCallback(async (): Promise<TalentGrid[]> => {
    try {
      const cacheKey = 'talent-grid';
      return await fetchWithCache<TalentGrid[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: TalentGrid[] }>(
          '/api/talent/grid'
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error('加载人才地图失败:', err);
      monitor.trackError('loadTalentMap', err as Error);
      throw err;
    }
  }, []);

  const loadSuccessionPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const cacheKey = 'succession-plans';
      const data = await fetchWithCache<any[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: any[] }>(
          '/api/talent/succession-plans'
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);

      setSuccessionPlans(data);
    } catch (err) {
      console.error('加载继任计划失败:', err);
      monitor.trackError('loadSuccessionPlans', err as Error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalentMap(loadTalentMap);
    loadSuccessionPlans();
  }, [fetchTalentMap, loadTalentMap, loadSuccessionPlans]);

  const getQuadrantColor = useCallback((quadrant: string) => {
    const colors: Record<string, string> = {
      star: 'bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700',
      highPotential: 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700',
      steady: 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700',
      lowPerformance: 'bg-orange-100 border-orange-300 dark:bg-orange-900 dark:border-orange-700',
    };
    return colors[quadrant] || 'bg-gray-100';
  }, []);

  const getRiskBadge = useCallback((level: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      high: { text: '高风险', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      medium: { text: '中风险', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      low: { text: '低风险', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    };
    const badge = badges[level] || { text: level, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchTalentMap(loadTalentMap)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">人才地图</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            可视化分析人才分布，制定继任计划
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchTalentMap(loadTalentMap)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="grid">人才矩阵</TabsTrigger>
          <TabsTrigger value="succession">继任计划</TabsTrigger>
          <TabsTrigger value="highPotential">高潜人才</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {talentGrid.map((quadrant) => (
                <Card key={quadrant.quadrant} className={`border-2 ${getQuadrantColor(quadrant.quadrant)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      {quadrant.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quadrant.employees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无员工</div>
                    ) : (
                      <div className="space-y-3">
                        {quadrant.employees.map((employee) => (
                          <div key={employee.id} className="flex items-start justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {employee.department} · {employee.position}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span>绩效: {employee.performance}</span>
                                <span>潜质: {employee.potential}</span>
                              </div>
                              {getRiskBadge(employee.riskLevel)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="succession" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                继任计划
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : successionPlans.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无继任计划</div>
              ) : (
                <div className="space-y-4">
                  {successionPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{plan.position}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              现任者: {plan.currentHolder}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            已制定
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">继任者</div>
                          <div className="flex flex-wrap gap-2">
                            {plan.successors?.map((successor: any, i: number) => (
                              <Badge key={i} variant="outline">
                                {successor.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highPotential" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                高潜人才名单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {talentGrid
                    .flatMap(q => q.employees)
                    .filter((item: any) => e => e.potential >= 8)
                    .map((employee) => (
                      <Card key={employee.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {employee.department} · {employee.position}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-gray-600">绩效: </span>
                                <span className="font-medium">{employee.performance}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">潜质: </span>
                                <span className="font-medium">{employee.potential}</span>
                              </div>
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                高潜
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
