'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Loader2,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface SyncTask {
  id: string;
  type: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  progress: number;
  retryCount: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface SyncLog {
  id: string;
  taskId: string;
  level: string;
  message: string;
  createdAt: string;
}

interface SyncStats {
  summary: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    runningTasks: number;
    errorLogs: number;
  };
  taskStats: Array<{ status: string; count: number }>;
  logStats: Array<{ level: string; count: number }>;
  typeStats: Array<{
    type: string;
    source: string;
    total: number;
    success: number;
    failed: number;
  }>;
}

export default function DataSyncManager() {
  const [tasks, setTasks] = useState<SyncTask[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sync/create');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取日志
  const fetchLogs = async (taskId?: string) => {
    try {
      const url = taskId ? `/api/sync/logs?taskId=${taskId}` : '/api/sync/logs';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sync/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 创建同步任务
  const createTask = async (type: string, source: string) => {
    try {
      const response = await fetch('/api/sync/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, source, priority: 5 }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('创建任务失败:', error);
    }
  };

  // 取消任务
  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/sync/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('取消任务失败:', error);
    }
  };

  // 重试任务
  const retryTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/sync/task', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('重试任务失败:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchTasks();
        fetchStats();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      running: 'default',
      completed: 'success',
      failed: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4" />,
      running: <Loader2 className="h-4 w-4 animate-spin" />,
      completed: <CheckCircle2 className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据同步管理</h1>
          <p className="text-muted-foreground mt-1">
            管理数据同步任务、监控同步进度、查看同步日志
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? '停止刷新' : '自动刷新'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总任务数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">执行中</CardTitle>
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.runningTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">失败</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.failedTasks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">同步任务</TabsTrigger>
          <TabsTrigger value="logs">同步日志</TabsTrigger>
          <TabsTrigger value="stats">统计分析</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => createTask('full', 'all')}>
                <Play className="h-4 w-4 mr-2" />
                全量同步
              </Button>
              <Button variant="outline" onClick={() => createTask('incremental', 'all')}>
                <Play className="h-4 w-4 mr-2" />
                增量同步
              </Button>
            </div>
            <Button onClick={fetchTasks} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>任务列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <Badge variant={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                        <span className="font-medium">
                          {task.type} - {task.source}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        创建时间: {new Date(task.createdAt).toLocaleString()}
                      </div>
                      {task.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            进度: {task.progress}%
                          </div>
                        </div>
                      )}
                      {task.error && (
                        <Alert className="mt-2" variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{task.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelTask(task.id)}
                        >
                          取消
                        </Button>
                      )}
                      {task.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryTask(task.id)}
                        >
                          重试
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          fetchLogs(task.id);
                        }}
                      >
                        查看日志
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>同步日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded ${
                      log.level === 'error'
                        ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300'
                        : log.level === 'warn'
                        ? 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-1">{log.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>任务状态分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.taskStats.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between"
                        >
                          <Badge variant="outline">{item.status}</Badge>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>日志级别分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.logStats.map((item) => (
                        <div
                          key={item.level}
                          className="flex items-center justify-between"
                        >
                          <Badge variant="outline">{item.level}</Badge>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>各类型同步成功率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.typeStats.map((item) => (
                      <div key={`${item.type}-${item.source}`}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">
                            {item.type} - {item.source}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            成功: {item.success} | 失败: {item.failed}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${item.total > 0 ? (item.success / item.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          成功率: {item.total > 0 ? ((item.success / item.total) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
