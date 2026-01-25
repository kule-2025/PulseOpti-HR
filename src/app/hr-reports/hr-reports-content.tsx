'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Building2,
  Target,
  Users,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  resignations: number;
  turnoverRate: number;
  avgAge: number;
  avgTenure: number;
  deptDistribution: Array<{ name: string; count: number }>;
  levelDistribution: Array<{ level: string; count: number }>;
  genderDistribution: { male: number; female: number; other: number };
  educationDistribution: Array<{ level: string; count: number }>;
  monthlyStats: Array<{ month: string; hires: number; resignations: number }>;
}

export default function HRReportsPageContent() {
  const [selectedPeriod, setSelectedPeriod] = useLocalStorage('hr-report-period', 'year');
  const [selectedYear, setSelectedYear] = useLocalStorage('hr-report-year', '2024');

  const {
    data: stats,
    loading,
    error,
    execute: fetchStats,
  } = useAsync<HRStats>();

  const loadStats = useCallback(async (): Promise<HRStats> => {
    try {
      const cacheKey = `hr-stats-${selectedPeriod}-${selectedYear}`;
      return await fetchWithCache<HRStats>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: HRStats }>(
          `/api/hr-reports/stats?period=${selectedPeriod}&year=${selectedYear}`
        );

        return response.data || {
          totalEmployees: 0,
          activeEmployees: 0,
          newHires: 0,
          resignations: 0,
          turnoverRate: 0,
          avgAge: 0,
          avgTenure: 0,
          deptDistribution: [],
          levelDistribution: [],
          genderDistribution: { male: 0, female: 0, other: 0 },
          educationDistribution: [],
          monthlyStats: [],
        };
      }, 10 * 60 * 1000);
    } catch (err) {
      console.error('加载HR统计数据失败:', err);
      monitor.trackError('loadHRStats', err as Error);
      throw err;
    }
  }, [selectedPeriod, selectedYear]);

  useEffect(() => {
    fetchStats(loadStats);
  }, [selectedPeriod, selectedYear, fetchStats, loadStats]);

  const handleExport = useCallback(async () => {
    try {
      const response = await get('/api/hr-reports/export', {
        headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HR报告_${selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
    }
  }, [selectedYear]);

  const getTurnoverRateColor = useCallback((rate: number) => {
    if (rate < 5) return 'text-green-600';
    if (rate < 10) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <Target className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchStats(loadStats)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR报表</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            查看和管理HR数据统计报表
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchStats(loadStats)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">员工总数</p>
                    <p className="text-2xl font-bold">{stats?.totalEmployees || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">新入职</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.newHires || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">离职人数</p>
                    <p className="text-2xl font-bold text-red-600">{stats?.resignations || 0}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">离职率</p>
                    <p className={`text-2xl font-bold ${getTurnoverRateColor(stats?.turnoverRate || 0)}`}>
                      {stats?.turnoverRate.toFixed(2) || 0}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 部门分布 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              部门分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.deptDistribution.map((dept) => {
                  const percentage = stats.totalEmployees > 0
                    ? (dept.count / stats.totalEmployees * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{dept.count}人</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                      <Progress value={parseFloat(percentage)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              职级分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.levelDistribution.map((level) => {
                  const percentage = stats.totalEmployees > 0
                    ? (level.count / stats.totalEmployees * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={level.level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{level.level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{level.count}人</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                      <Progress value={parseFloat(percentage)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 教育分布和性别分布 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              学历分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.educationDistribution.map((edu) => {
                  const percentage = stats.totalEmployees > 0
                    ? (edu.count / stats.totalEmployees * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={edu.level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{edu.level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{edu.count}人</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                      <Progress value={parseFloat(percentage)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>员工概况</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">在职员工</span>
                  <span className="font-bold">{stats.activeEmployees}人</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">平均年龄</span>
                  <span className="font-bold">{stats.avgAge.toFixed(1)}岁</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">平均司龄</span>
                  <span className="font-bold">{stats.avgTenure.toFixed(1)}年</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
