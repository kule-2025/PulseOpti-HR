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
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Edit,
  Download,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  shiftName: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'absent';
  overtime?: number;
  notes?: string;
}

interface ScheduleFormData {
  employeeId: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  shiftName: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}

export default function SchedulingPageContent() {
  const [statusFilter, setStatusFilter] = useLocalStorage('schedule-status', 'all');
  const [shiftFilter, setShiftFilter] = useLocalStorage('schedule-shift', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: schedules = [],
    loading,
    error,
    execute: fetchSchedules,
  } = useAsync<Schedule[]>();

  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    checkedIn: 0,
    absent: 0,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    employeeId: '',
    date: '',
    shiftType: 'morning',
    shiftName: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
  });

  const loadSchedules = useCallback(async (): Promise<Schedule[]> => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(shiftFilter !== 'all' && { shiftType: shiftFilter }),
      });

      const cacheKey = `schedules-${params.toString()}`;
      return await fetchWithCache<Schedule[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: Schedule[] }>(
          `/api/attendance/scheduling?${params.toString()}`
        );

        return (response.data as Schedule[]) || [];
      }, 2 * 60 * 1000);
    } catch (err) {
      console.error('加载排班数据失败:', err);
      monitor.trackError('loadSchedules', err as Error);
      throw err;
    }
  }, [statusFilter, shiftFilter]);

  const loadStats = useCallback((schedulesList: Schedule[]) => {
    setStats({
      total: schedulesList.length,
      scheduled: schedulesList.filter((item: any) => s => s.status === 'scheduled').length,
      checkedIn: schedulesList.filter((item: any) => s => s.status === 'checked_in').length,
      absent: schedulesList.filter((item: any) => s => s.status === 'absent').length,
    });
  }, []);

  useEffect(() => {
    fetchSchedules(loadSchedules).then((result) => {
      const schedulesList = (result as any) || [];
      loadStats(schedulesList);
    });
  }, [statusFilter, shiftFilter, fetchSchedules, loadSchedules, loadStats]);

  const filteredSchedules = useMemo(() => {
    return (schedules || []).filter((item: any) => schedule => {
      const matchesSearch = !debouncedQuery ||
        schedule.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        schedule.employeeId.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [schedules, debouncedQuery]);

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      scheduled: { text: '已排班', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      checked_in: { text: '已打卡', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      checked_out: { text: '已签退', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
      absent: { text: '缺勤', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const getShiftTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      morning: '早班',
      afternoon: '中班',
      night: '晚班',
      flexible: '弹性班',
    };
    return labels[type] || type;
  }, []);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      employeeId: schedule.employeeId,
      date: schedule.date,
      shiftType: schedule.shiftType,
      shiftName: schedule.shiftName,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      notes: schedule.notes,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (editingSchedule) {
        await put(`/api/attendance/scheduling/${editingSchedule.id}`, formData);
      } else {
        await post('/api/attendance/scheduling', formData);
      }
      setDialogOpen(false);
      setEditingSchedule(null);
      fetchSchedules(loadSchedules);
    } catch (err) {
      console.error('保存失败:', err);
    }
  }, [editingSchedule, formData, fetchSchedules, loadSchedules]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定要删除这条排班记录吗？')) return;
    try {
      await del(`/api/attendance/scheduling/${id}`);
      fetchSchedules(loadSchedules);
    } catch (err) {
      console.error('删除失败:', err);
    }
  }, [fetchSchedules, loadSchedules]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchSchedules(loadSchedules)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">排班管理</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理员工的工作排班和时间安排
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增排班
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总排班数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已排班</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已打卡</p>
                    <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">缺勤</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
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
                <SelectItem value="scheduled">已排班</SelectItem>
                <SelectItem value="checked_in">已打卡</SelectItem>
                <SelectItem value="checked_out">已签退</SelectItem>
                <SelectItem value="absent">缺勤</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部班次</SelectItem>
                <SelectItem value="morning">早班</SelectItem>
                <SelectItem value="afternoon">中班</SelectItem>
                <SelectItem value="night">晚班</SelectItem>
                <SelectItem value="flexible">弹性班</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>排班列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">暂无排班记录</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工信息</TableHead>
                  <TableHead>排班日期</TableHead>
                  <TableHead>班次类型</TableHead>
                  <TableHead>工作时间</TableHead>
                  <TableHead>工作地点</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{schedule.employeeName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{schedule.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {schedule.date}
                      </div>
                    </TableCell>
                    <TableCell>{getShiftTypeLabel(schedule.shiftType)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{schedule.startTime}</div>
                        <div className="text-gray-500">至 {schedule.endTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {schedule.location}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                          <Edit className="h-4 w-4" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? '编辑排班' : '新增排班'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>员工ID *</Label>
              <Input
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="请输入员工ID"
              />
            </div>
            <div>
              <Label>排班日期 *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>班次类型 *</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value: any) => setFormData({ ...formData, shiftType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">早班</SelectItem>
                  <SelectItem value="afternoon">中班</SelectItem>
                  <SelectItem value="night">晚班</SelectItem>
                  <SelectItem value="flexible">弹性班</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>开始时间 *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>结束时间 *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>工作地点</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="请输入工作地点"
              />
            </div>
            <div>
              <Label>备注</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="请输入备注"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
