'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Eye,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'compensatory';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
  approverName?: string;
  approvedAt?: string;
  rejectReason?: string;
}

export default function LeaveApprovalPageContent() {
  const [statusFilter, setStatusFilter] = useLocalStorage('leave-status', 'pending');
  const [departmentFilter, setDepartmentFilter] = useLocalStorage('leave-dept', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: applications = [],
    loading,
    error,
    execute: fetchApplications,
  } = useAsync<LeaveApplication[]>();

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadApplications = useCallback(async (): Promise<LeaveApplication[]> => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(departmentFilter !== 'all' && { department: departmentFilter }),
      });

      const cacheKey = `leave-applications-${params.toString()}`;
      return await fetchWithCache<LeaveApplication[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: LeaveApplication[] }>(
          `/api/attendance/leave/approvals?${params.toString()}`
        );

        return (response.data as LeaveApplication[]) || [];
      }, 2 * 60 * 1000);
    } catch (err) {
      console.error('加载请假申请失败:', err);
      monitor.trackError('loadLeaveApplications', err as Error);
      throw err;
    }
  }, [statusFilter, departmentFilter]);

  const loadStats = useCallback((apps: LeaveApplication[]) => {
    setStats({
      pending: apps.filter((item: any) => a => a.status === 'pending').length,
      approved: apps.filter((item: any) => a => a.status === 'approved').length,
      rejected: apps.filter((item: any) => a => a.status === 'rejected').length,
      total: apps.length,
    });
  }, []);

  useEffect(() => {
    fetchApplications(loadApplications).then((result) => {
      const apps = (result as LeaveApplication[]) || [];
      loadStats(apps);
    });
  }, [statusFilter, departmentFilter, fetchApplications, loadApplications, loadStats]);

  const filteredApplications = useMemo(() => {
    return (applications || []).filter((item: any) => app => {
      const matchesSearch = !debouncedQuery ||
        app.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        app.employeeId.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [applications, debouncedQuery]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await put(`/api/attendance/leave/approvals/${id}/approve`, {});
      fetchApplications(loadApplications);
    } catch (err) {
      console.error('审批失败:', err);
    }
  }, [fetchApplications, loadApplications]);

  const handleReject = useCallback(async () => {
    if (!rejectingId || !rejectReason.trim()) return;

    try {
      await put(`/api/attendance/leave/approvals/${rejectingId}/reject`, {
        reason: rejectReason,
      });
      setRejectDialogOpen(false);
      setRejectReason('');
      setRejectingId(null);
      fetchApplications(loadApplications);
    } catch (err) {
      console.error('拒绝失败:', err);
    }
  }, [rejectingId, rejectReason, fetchApplications, loadApplications]);

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      pending: { text: '待审批', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      approved: { text: '已通过', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      rejected: { text: '已拒绝', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      cancelled: { text: '已撤销', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const getLeaveTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      maternity: '产假',
      paternity: '陪产假',
      compensatory: '调休',
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
            <Button onClick={() => fetchApplications(loadApplications)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">请假审批</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            审批员工的请假申请
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出记录
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
                  <CheckCircle className="h-8 w-8 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总申请数</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>请假申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">暂无请假申请</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工信息</TableHead>
                  <TableHead>请假类型</TableHead>
                  <TableHead>请假时间</TableHead>
                  <TableHead>天数</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.employeeName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{app.employeeId}</div>
                        <div className="text-xs text-gray-500">{app.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getLeaveTypeLabel(app.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{app.startDate}</div>
                        <div className="text-gray-500">至 {app.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>{app.days}天</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={app.reason}>
                      {app.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {app.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(app.id)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRejectingId(app.id);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
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
            <DialogTitle>拒绝请假申请</DialogTitle>
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
