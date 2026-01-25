'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Eye,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  overtimeType: 'workday' | 'weekend' | 'holiday';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applyTime: string;
  approverName?: string;
  approvalTime?: string;
  approverComment?: string;
}

export default function OvertimeContent() {
  const [statusFilter, setStatusFilter] = useLocalStorage('overtime-status', 'pending');
  const [typeFilter, setTypeFilter] = useLocalStorage('overtime-type', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: overtimeRecords = [],
    loading,
    error,
    execute: fetchOvertimeRecords,
  } = useAsync<OvertimeRecord[]>();

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0,
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadOvertimeRecords = useCallback(async (): Promise<OvertimeRecord[]> => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const cacheKey = `overtime-records-${params.toString()}`;
      return await fetchWithCache<OvertimeRecord[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: OvertimeRecord[] }>(
          `/api/attendance/overtime?${params.toString()}`
        );

        return (response.data as OvertimeRecord[]) || [];
      }, 2 * 60 * 1000);
    } catch (err) {
      console.error('加载加班记录失败:', err);
      monitor.trackError('loadOvertimeRecords', err as Error);
      throw err;
    }
  }, [statusFilter, typeFilter]);

  const loadStats = useCallback((records: OvertimeRecord[]) => {
    const approvedRecords = records.filter((item: any) => r => r.status === 'approved');
    setStats({
      pending: records.filter((item: any) => r => r.status === 'pending').length,
      approved: approvedRecords.length,
      rejected: records.filter((item: any) => r => r.status === 'rejected').length,
      totalHours: approvedRecords.reduce((sum, r) => sum + r.duration, 0) / 60,
    });
  }, []);

  useEffect(() => {
    fetchOvertimeRecords(loadOvertimeRecords).then((result) => {
      const records = (result as any) || [];
      loadStats(records);
    });
  }, [statusFilter, typeFilter, fetchOvertimeRecords, loadOvertimeRecords, loadStats]);

  const filteredRecords = useMemo(() => {
    return (overtimeRecords || []).filter((item: any) => record => {
      const matchesSearch = !debouncedQuery ||
        record.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [overtimeRecords, debouncedQuery]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await put(`/api/attendance/overtime/${id}/approve`, {});
      fetchOvertimeRecords(loadOvertimeRecords);
    } catch (err) {
      console.error('审批失败:', err);
    }
  }, [fetchOvertimeRecords, loadOvertimeRecords]);

  const handleReject = useCallback(async () => {
    if (!rejectingId || !rejectReason.trim()) return;

    try {
      await put(`/api/attendance/overtime/${rejectingId}/reject`, {
        reason: rejectReason,
      });
      setRejectDialogOpen(false);
      setRejectReason('');
      setRejectingId(null);
      fetchOvertimeRecords(loadOvertimeRecords);
    } catch (err) {
      console.error('拒绝失败:', err);
    }
  }, [rejectingId, rejectReason, fetchOvertimeRecords, loadOvertimeRecords]);

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      pending: { text: '待审批', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      approved: { text: '已通过', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      rejected: { text: '已拒绝', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      cancelled: { text: '已取消', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const getOvertimeTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      workday: '工作日加班',
      weekend: '周末加班',
      holiday: '节假日加班',
    };
    return labels[type] || type;
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
            <Button onClick={() => fetchOvertimeRecords(loadOvertimeRecords)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">加班管理</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理和审批员工的加班申请
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新增加班
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待审批</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已通过</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已拒绝</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总工时</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
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
                placeholder="搜索员工姓名或工号"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="workday">工作日加班</SelectItem>
                <SelectItem value="weekend">周末加班</SelectItem>
                <SelectItem value="holiday">节假日加班</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>加班记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">暂无加班记录</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工信息</TableHead>
                  <TableHead>加班日期</TableHead>
                  <TableHead>加班时段</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>状态</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {record.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{record.startTime}</div>
                        <div className="text-gray-500">至 {record.endTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getOvertimeTypeLabel(record.overtimeType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {(record.duration / 60).toFixed(1)}小时
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={record.reason}>
                      {record.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {record.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(record.id)}>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRejectingId(record.id);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝加班申请</DialogTitle>
            <DialogDescription>请输入拒绝原因</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>拒绝原因 *</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={handleReject}>确认拒绝</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
