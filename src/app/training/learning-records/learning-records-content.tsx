'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Download,
  Eye,
  Award,
  RefreshCw,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface LearningRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  courseTitle: string;
  enrollmentDate: string;
  startDate: string;
  endDate: string;
  progress: number;
  completionDate: string;
  status: string;
  score: number;
  maxScore: number;
  grade: string;
  learningHours: number;
}

export default function LearningRecordsContent() {
  const [selectedDepartment, setSelectedDepartment] = useLocalStorage('learning-dept', 'all');
  const [selectedStatus, setSelectedStatus] = useLocalStorage('learning-status', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: records = [],
    loading,
    error,
    execute: fetchRecords,
  } = useAsync<LearningRecord[]>();

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    avgProgress: 0,
  });

  const loadRecords = useCallback(async (): Promise<LearningRecord[]> => {
    try {
      const params = new URLSearchParams({
        ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
      });

      const cacheKey = `learning-records-${params.toString()}`;
      return await fetchWithCache<LearningRecord[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: LearningRecord[] }>(
          `/api/training/records?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000);
    } catch (err) {
      console.error('加载学习记录失败:', err);
      monitor.trackError('loadLearningRecords', err as Error);
      throw err;
    }
  }, [selectedDepartment, selectedStatus]);

  const loadStats = useCallback((recordsList: LearningRecord[]) => {
    const total = recordsList.length;
    const inProgress = recordsList.filter((item: any) => r => r.status === 'in_progress').length;
    const completed = recordsList.filter((item: any) => r => r.status === 'completed').length;
    const avgProgress = total > 0
      ? recordsList.reduce((sum, r) => sum + r.progress, 0) / total
      : 0;

    setStats({ total, inProgress, completed, avgProgress });
  }, []);

  useEffect(() => {
    fetchRecords(loadRecords).then((result) => {
      const recordsList = (result as any) || [];
      loadStats(recordsList);
    });
  }, [selectedDepartment, selectedStatus, fetchRecords, loadRecords, loadStats]);

  const filteredRecords = useMemo(() => {
    return records.filter((item: any) => record => {
      const matchesSearch = !debouncedQuery ||
        record.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        record.courseTitle.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [records, debouncedQuery]);

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      in_progress: { text: '学习中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      completed: { text: '已完成', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      pending: { text: '待开始', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      expired: { text: '已过期', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const getGradeBadge = useCallback((grade: string) => {
    const badges: Record<string, string> = {
      'S': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'A': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'B': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'D': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return badges[grade] || 'bg-gray-100 text-gray-700';
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
            <Button onClick={() => fetchRecords(loadRecords)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">学习记录</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            查看和追踪员工的学习进度与成果
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出报表
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总记录数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">学习中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均进度</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgProgress.toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索员工或课程"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="in_progress">学习中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="pending">待开始</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学习记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">暂无学习记录</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工信息</TableHead>
                  <TableHead>课程</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>学习时长</TableHead>
                  <TableHead>成绩</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{record.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.courseTitle}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress value={record.progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1 text-right">{record.progress}%</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {record.learningHours.toFixed(1)}h
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <Badge className={getGradeBadge(record.grade)}>
                            {record.grade}
                          </Badge>
                          <span className="text-sm">
                            {record.score}/{record.maxScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
