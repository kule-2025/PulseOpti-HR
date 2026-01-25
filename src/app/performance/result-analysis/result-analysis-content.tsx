'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  Users,
  Star,
  Target,
  Award,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface ChartData {
  labels: string[];
  data: number[];
}

interface PerformanceOverview {
  totalEmployees: number;
  avgScore: number;
  passRate: number;
  excellentRate: number;
  cycle: string;
}

interface DepartmentScore {
  department: string;
  employeeCount: number;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export default function ResultAnalysisContent() {
  const [selectedCycle, setSelectedCycle] = useLocalStorage('analysis-cycle', '2024 Q1');
  const [selectedDepartment, setSelectedDepartment] = useLocalStorage('analysis-dept', 'all');
  const [refreshing, setRefreshing] = useState(false);

  // 加载概览数据
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const cacheKey = `overview-${selectedCycle}-${selectedDepartment}`;
      const data = await fetchWithCache<PerformanceOverview>(cacheKey, async () => {
        const params = new URLSearchParams({
          cycle: selectedCycle,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        });

        const response = await get<{ success: boolean; data?: PerformanceOverview }>(
          `/api/performance/analysis/overview?${params.toString()}`
        );

        return response.data || {
          totalEmployees: 0,
          avgScore: 0,
          passRate: 0,
          excellentRate: 0,
          cycle: selectedCycle,
        };
      }, 5 * 60 * 1000);

      setOverview(data);
    } catch (err) {
      console.error('加载概览数据失败:', err);
      monitor.trackError('loadOverview', err as Error);
    } finally {
      setOverviewLoading(false);
    }
  }, [selectedCycle, selectedDepartment]);

  // 加载部门分数
  const [departmentScores, setDepartmentScores] = useState<DepartmentScore[]>([]);
  const [deptScoresLoading, setDeptScoresLoading] = useState(true);

  const loadDepartmentScores = useCallback(async () => {
    setDeptScoresLoading(true);
    try {
      const cacheKey = `dept-scores-${selectedCycle}`;
      const data = await fetchWithCache<DepartmentScore[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: DepartmentScore[] }>(
          `/api/performance/analysis/departments?cycle=${selectedCycle}`
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);

      setDepartmentScores(data);
    } catch (err) {
      console.error('加载部门分数失败:', err);
      monitor.trackError('loadDepartmentScores', err as Error);
    } finally {
      setDeptScoresLoading(false);
    }
  }, [selectedCycle]);

  // 加载分数分布
  const [scoreDistribution, setScoreDistribution] = useState<ChartData | null>(null);
  const [distLoading, setDistLoading] = useState(true);

  const loadScoreDistribution = useCallback(async () => {
    setDistLoading(true);
    try {
      const cacheKey = `score-dist-${selectedCycle}`;
      const data = await fetchWithCache<ChartData>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: ChartData }>(
          `/api/performance/analysis/distribution?cycle=${selectedCycle}`
        );

        return response.data || { labels: [], data: [] };
      }, 5 * 60 * 1000);

      setScoreDistribution(data);
    } catch (err) {
      console.error('加载分数分布失败:', err);
      monitor.trackError('loadScoreDistribution', err as Error);
    } finally {
      setDistLoading(false);
    }
  }, [selectedCycle]);

  // 初始加载
  useEffect(() => {
    loadOverview();
    loadDepartmentScores();
    loadScoreDistribution();
  }, [loadOverview, loadDepartmentScores, loadScoreDistribution]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOverview(),
        loadDepartmentScores(),
        loadScoreDistribution(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadOverview, loadDepartmentScores, loadScoreDistribution]);

  const trendIcon = useMemo(() => ({
    up: <ArrowUp className="h-4 w-4 text-green-600" />,
    down: <ArrowDown className="h-4 w-4 text-red-600" />,
    stable: null,
  }), []);

  if (overviewLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">结果分析</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            分析绩效考核结果，洞察员工绩效表现
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 筛选条件 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">考核周期</label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024 Q1">2024 Q1</SelectItem>
                  <SelectItem value="2023 Q4">2023 Q4</SelectItem>
                  <SelectItem value="2023 Q3">2023 Q3</SelectItem>
                  <SelectItem value="2023 Q2">2023 Q2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">部门</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  <SelectItem value="tech">技术部</SelectItem>
                  <SelectItem value="sales">销售部</SelectItem>
                  <SelectItem value="hr">人事部</SelectItem>
                  <SelectItem value="finance">财务部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 核心指标 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">参与人数</p>
                <p className="text-2xl font-bold">{overview?.totalEmployees || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均分</p>
                <p className="text-2xl font-bold">{overview?.avgScore.toFixed(1) || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">合格率</p>
                <p className="text-2xl font-bold text-green-600">{overview?.passRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">优秀率</p>
                <p className="text-2xl font-bold text-purple-600">{overview?.excellentRate.toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 部门分数排名 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            部门绩效排名
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deptScoresLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {departmentScores.map((dept, index) => (
                <div key={dept.department} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{dept.department}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{dept.employeeCount}人</span>
                        {dept.trend !== 'stable' && trendIcon[dept.trend]}
                        {dept.trend !== 'stable' && (
                          <span className={`text-sm ${dept.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {dept.trendValue > 0 ? '+' : ''}{dept.trendValue}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={dept.avgScore} className="h-2" />
                    <div className="text-right text-sm font-medium text-gray-600 mt-1">
                      {dept.avgScore.toFixed(1)}分
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分数分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            分数分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          {distLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-4">
              {scoreDistribution?.labels.map((label, index) => {
                const value = scoreDistribution.data[index] || 0;
                const percentage = scoreDistribution.data.reduce((a, b) => a + b, 0) > 0
                  ? (value / scoreDistribution.data.reduce((a, b) => a + b, 0) * 100).toFixed(1)
                  : '0';

                return (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{value}人</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-3" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
