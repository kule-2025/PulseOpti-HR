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
  FileText,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  RefreshCw,
  UserPlus,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Workflow {
  id: string;
  type: 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary_adjustment';
  name: string;
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  currentStepIndex: number;
  steps: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  initiatorName?: string;
  startDate?: string;
  endDate?: string;
  relatedEntityName?: string;
  createdAt: string;
}

export default function WorkflowsContent() {
  const [activeTab, setActiveTab] = useLocalStorage('workflows-tab', 'all');
  const [typeFilter, setTypeFilter] = useLocalStorage('workflows-type', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: workflows = [],
    loading,
    error,
    execute: fetchWorkflows,
  } = useAsync<Workflow[]>();

  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
    paused: 0,
  });

  const loadWorkflows = useCallback(async (): Promise<Workflow[]> => {
    try {
      const params = new URLSearchParams({
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const cacheKey = `workflows-${params.toString()}`;
      return await fetchWithCache<Workflow[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: Workflow[] }>(
          `/api/workflows?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 2 * 60 * 1000);
    } catch (err) {
      console.error('加载工作流失败:', err);
      monitor.trackError('loadWorkflows', err as Error);
      throw err;
    }
  }, [typeFilter]);

  const loadStats = useCallback((workflowsList: Workflow[]) => {
    setStats({
      total: workflowsList.length,
      running: workflowsList.filter((item: any) => w => w.status === 'running').length,
      completed: workflowsList.filter((item: any) => w => w.status === 'completed').length,
      paused: workflowsList.filter((item: any) => w => w.status === 'paused').length,
    });
  }, []);

  useEffect(() => {
    fetchWorkflows(loadWorkflows).then((result) => {
      const workflowsList = (result as any) || [];
      loadStats(workflowsList);
    });
  }, [typeFilter, fetchWorkflows, loadWorkflows, loadStats]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((item: any) => workflow => {
      const matchesTab = activeTab === 'all' || workflow.status === activeTab;
      const matchesSearch = !debouncedQuery ||
        workflow.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (workflow.relatedEntityName && workflow.relatedEntityName.toLowerCase().includes(debouncedQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [workflows, activeTab, debouncedQuery]);

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string; icon?: any }> = {
      running: { text: '进行中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Play },
      completed: { text: '已完成', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
      paused: { text: '已暂停', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Pause },
      cancelled: { text: '已取消', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
    };
    return badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
  }, []);

  const getWorkflowTypeIcon = useCallback((type: string) => {
    const icons: Record<string, any> = {
      onboarding: UserPlus,
      offboarding: UserMinus,
      promotion: TrendingUp,
      transfer: ArrowRight,
      salary_adjustment: DollarSign,
    };
    return icons[type] || FileText;
  }, []);

  const getWorkflowTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      onboarding: '入职流程',
      offboarding: '离职流程',
      promotion: '晋升流程',
      transfer: '调岗流程',
      salary_adjustment: '调薪流程',
    };
    return labels[type] || type;
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchWorkflows(loadWorkflows)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">工作流管理</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理各类HR工作流程
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchWorkflows(loadWorkflows)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建工作流
          </Button>
        </div>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已暂停</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
                  </div>
                  <Pause className="h-8 w-8 text-yellow-600" />
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
                placeholder="搜索工作流名称或相关人员"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="onboarding">入职流程</SelectItem>
                <SelectItem value="offboarding">离职流程</SelectItem>
                <SelectItem value="promotion">晋升流程</SelectItem>
                <SelectItem value="transfer">调岗流程</SelectItem>
                <SelectItem value="salary_adjustment">调薪流程</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
          <TabsTrigger value="running">进行中 ({stats.running})</TabsTrigger>
          <TabsTrigger value="completed">已完成 ({stats.completed})</TabsTrigger>
          <TabsTrigger value="paused">已暂停 ({stats.paused})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无工作流</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工作流名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>发起人</TableHead>
                  <TableHead>相关人员</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>当前步骤</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => {
                  const statusBadge = getStatusBadge(workflow.status);
                  const TypeIcon = getWorkflowTypeIcon(workflow.type);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span>{getWorkflowTypeLabel(workflow.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{workflow.initiatorName || '-'}</TableCell>
                      <TableCell>{workflow.relatedEntityName || '-'}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={workflow.progress} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1 text-right">{workflow.progress}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {workflow.steps[workflow.currentStepIndex]?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge.color}>
                          {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{workflow.createdAt.split('T')[0]}</div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
