'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  RefreshCw,
  Download as DownloadIcon,
} from 'lucide-react';

// 性能优化工具
import { useDebounce, useLocalStorage } from '@/hooks/use-performance';
import { SkeletonCard, SkeletonList, SkeletonTable } from '@/components/ui/loading';
import { fetchWithConfig } from '@/lib/cache/advanced-cache';
import { getCacheConfig } from '@/lib/cache/config';
import { get, post } from '@/lib/request/enhanced-request';
import monitor from '@/lib/performance/monitor';

interface ClockInRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  workHours?: number;
  clockInLocation?: string;
  clockOutLocation?: string;
  status: 'normal' | 'late' | 'early_leave' | 'absent' | 'leave' | 'overtime';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  notes?: string;
}

export default function ClockInPageContent() {
  const [records, setRecords] = useState<ClockInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filters, setFilters] = useLocalStorage('attendance-filters', {
    employeeId: '',
    department: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  const [debouncedFilters] = useDebounce(filters, 300);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // 获取打卡记录
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      // 将 debouncedFilters 转换为普通对象
      const filterObj: Record<string, any> = {};
      const filterKeys = Object.keys(filters);
      for (const key of filterKeys) {
        filterObj[key] = (debouncedFilters as any)[key];
      }

      const params: Record<string, any> = {
        ...filterObj,
        page: pagination.page,
        limit: pagination.limit,
      };

      return fetchWithConfig('attendance', params, async () => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        const response = await get<{ success: boolean; data?: ClockInRecord[]; total?: number }>(
          `/api/attendance/clock-in?${queryParams}`,
          { enableMetrics: true }
        );

        return response;
      }).then(result => {
        if (result.success && result.data) {
          setRecords(result.data);
          setPagination((prev) => ({
            ...prev,
            total: result.total ?? result.data.length,
          }));
        }
      });
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      monitor.trackError('fetchAttendanceRecords', error as Error);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 统计数据
  const statistics = useMemo(() => {
    return {
      total: pagination.total,
      normal: records.filter((item: any) => (r) => r.status === 'normal').length,
      late: records.filter((item: any) => (r) => r.status === 'late').length,
      earlyLeave: records.filter((item: any) => (r) => r.status === 'early_leave').length,
      absent: records.filter((item: any) => (r) => r.status === 'absent').length,
    };
  }, [records, pagination.total]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(records.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  }, [records]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  }, [selectedIds]);

  const handleExport = useCallback(async () => {
    try {
      const response = await post<{ success: boolean; data?: { url?: string } }>(
        '/api/attendance/export',
        {
          ids: selectedIds,
          filters,
        },
        { enableMetrics: true }
      );

      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        alert('导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      monitor.trackError('exportAttendance', error as Error);
      alert('导出失败');
    }
  }, [selectedIds, filters]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      normal: { label: '正常', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      late: { label: '迟到', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
      early_leave: { label: '早退', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
      absent: { label: '缺勤', color: 'bg-red-100 text-red-700', icon: XCircle },
      leave: { label: '请假', color: 'bg-blue-100 text-blue-700', icon: Calendar },
      overtime: { label: '加班', color: 'bg-purple-100 text-purple-700', icon: Clock },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: Clock,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-green-500" />
            打卡记录
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            查看和管理员工打卡记录
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={selectedIds.length === 0}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({ ...filters, startDate: today, endDate: today });
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            今日记录
          </Button>
          <Button
            onClick={fetchRecords}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总记录数</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold">{statistics.total}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">正常</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{statistics.normal}</p>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">迟到</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">{statistics.late}</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">早退</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-orange-600">{statistics.earlyLeave}</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">缺勤</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{statistics.absent}</p>
                )}
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>员工ID</Label>
              <Input
                placeholder="输入员工ID"
                value={filters.employeeId}
                onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>部门</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部部门</SelectItem>
                  <SelectItem value="研发部">研发部</SelectItem>
                  <SelectItem value="产品部">产品部</SelectItem>
                  <SelectItem value="销售部">销售部</SelectItem>
                  <SelectItem value="市场部">市场部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>开始日期</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>结束日期</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="late">迟到</SelectItem>
                  <SelectItem value="early_leave">早退</SelectItem>
                  <SelectItem value="absent">缺勤</SelectItem>
                  <SelectItem value="leave">请假</SelectItem>
                  <SelectItem value="overtime">加班</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ employeeId: '', department: '', startDate: '', endDate: '', status: '' })}>
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                已选择 <span className="font-bold">{selectedIds.length}</span> 项
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  导出选中
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 打卡记录列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === records.length && records.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>日期</TableHead>
                <TableHead>员工</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>签到时间</TableHead>
                <TableHead>签退时间</TableHead>
                <TableHead>工时</TableHead>
                <TableHead>签到地点</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonTable rows={5} columns={10} />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectOne(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {record.clockInTime || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {record.clockOutTime || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {record.clockInLocation || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {record.lateMinutes && `迟到${record.lateMinutes}分钟`}
                      {record.earlyLeaveMinutes && `早退${record.earlyLeaveMinutes}分钟`}
                      {!record.lateMinutes && !record.earlyLeaveMinutes && '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {pagination.total} 条记录，每页 {pagination.limit} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
