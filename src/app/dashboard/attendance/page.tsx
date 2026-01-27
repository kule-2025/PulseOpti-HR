'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useForm } from '@/hooks/use-form';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  Filter,
  TrendingUp,
  MapPin,
  User,
  Plus,
  RefreshCw,
  LogIn,
  LogOut,
  Coffee,
  Home,
  Edit,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'normal' | 'late' | 'early_leave' | 'absent' | 'leave';
  workHours: number;
  location: string;
  avatar: string | null;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applyDate: string;
  approver: string | null;
  approveDate: string | null;
  avatar: string | null;
}

interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  workDate: string;
  shiftType: 'day' | 'night' | 'flex';
  startTime: string;
  endTime: string;
  location: string;
  avatar: string | null;
}

// 状态映射
const attendanceStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  normal: { label: '正常', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
  late: { label: '迟到', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: AlertCircle },
  early_leave: { label: '早退', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: Clock },
  absent: { label: '缺勤', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: X },
  leave: { label: '请假', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Coffee },
};

const leaveStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  approved: { label: '已批准', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

const leaveTypeMap: Record<string, { label: string; icon: any }> = {
  annual: { label: '年假', icon: Calendar },
  sick: { label: '病假', icon: AlertCircle },
  personal: { label: '事假', icon: Coffee },
  maternity: { label: '产假', icon: User },
  paternity: { label: '陪产假', icon: User },
};

// 模拟数据生成
const generateMockAttendance = (): AttendanceRecord[] =>
  Array.from({ length: 200 }, (_, i) => {
    const statuses: Array<'normal' | 'late' | 'early_leave' | 'absent' | 'leave'> =
      ['normal', 'normal', 'normal', 'late', 'early_leave', 'absent', 'leave'];
    const status = statuses[i % statuses.length];

    return {
      id: `att-${i + 1}`,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      employeeName: `员工${String.fromCharCode(65 + (i % 26))}${i + 1}`,
      department: ['技术部', '产品部', '市场部', '运营部', '人事部'][i % 5],
      date: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
      timeIn: status === 'absent' ? '-' : `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
      timeOut: status === 'absent' ? '-' : `18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
      status,
      workHours: status === 'absent' ? 0 : status === 'late' ? 7.5 : status === 'early_leave' ? 7 : 8 + Math.random(),
      location: '北京总部',
      avatar: null,
    };
  });

const generateMockLeaveRequests = (): LeaveRequest[] =>
  Array.from({ length: 50 }, (_, i) => {
    const types: Array<'annual' | 'sick' | 'personal' | 'maternity' | 'paternity'> =
      ['annual', 'sick', 'personal', 'annual', 'sick'];
    const statuses: Array<'pending' | 'approved' | 'rejected'> =
      ['pending', 'approved', 'approved', 'rejected', 'pending'];

    return {
      id: `leave-${i + 1}`,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      employeeName: `员工${String.fromCharCode(65 + (i % 26))}${i + 1}`,
      department: ['技术部', '产品部', '市场部', '运营部', '人事部'][i % 5],
      type: types[i % types.length],
      startDate: `2024-03-${String((i % 15) + 1).padStart(2, '0')}`,
      endDate: `2024-03-${String((i % 15) + 3).padStart(2, '0')}`,
      days: Math.floor(Math.random() * 5) + 1,
      reason: i % 3 === 0 ? '个人事务' : i % 3 === 1 ? '身体不适' : '家庭事务',
      status: statuses[i % statuses.length],
      applyDate: `2024-03-${String(i % 10 + 1).padStart(2, '0')}`,
      approver: statuses[i % statuses.length] !== 'pending' ? `经理${i % 3 + 1}` : null,
      approveDate: statuses[i % statuses.length] !== 'pending' ? `2024-03-${String(i % 10 + 2).padStart(2, '0')}` : null,
      avatar: null,
    };
  });

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const debouncedSearch = useDebounce(searchQuery, 300);

  const [attendanceRecords] = useState<AttendanceRecord[]>(generateMockAttendance());
  const [leaveRequests] = useState<LeaveRequest[]>(generateMockLeaveRequests());

  const departments = Array.from(new Set(attendanceRecords.map((r) => r.department)));

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter((r) => r.date === today);

    return {
      total: attendanceRecords.length,
      todayClockIn: todayRecords.filter((r) => r.timeIn !== '-').length,
      onTime: todayRecords.filter((r) => r.status === 'normal').length,
      late: todayRecords.filter((r) => r.status === 'late').length,
      leavePending: leaveRequests.filter((r) => r.status === 'pending').length,
      avgWorkHours: attendanceRecords.reduce((sum, r) => sum + r.workHours, 0) / attendanceRecords.length,
    };
  }, [attendanceRecords, leaveRequests]);

  const leaveForm = useForm({
    initialValues: {
      type: 'annual',
      startDate: '',
      endDate: '',
      days: '',
      reason: '',
    },
    validationRules: {
      type: { required: true },
      startDate: { required: true },
      endDate: { required: true },
      days: { required: true },
      reason: { required: true, minLength: 5 },
    },
    onSubmit: async (values) => {
      console.log('Submitting leave request:', values);
      setIsLeaveDialogOpen(false);
      leaveForm.resetForm();
    },
  });

  // 筛选考勤记录
  const filteredRecords = useMemo(() => {
    let filtered = [...attendanceRecords];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(query) ||
          r.employeeId.toLowerCase().includes(query) ||
          r.department.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((r) => r.department === departmentFilter);
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [attendanceRecords, debouncedSearch, statusFilter, departmentFilter]);

  // 筛选请假申请
  const filteredLeaveRequests = useMemo(() => {
    let filtered = [...leaveRequests];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(query) ||
          r.department.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime());

    return filtered;
  }, [leaveRequests, debouncedSearch, statusFilter]);

  // 考勤记录项
  const AttendanceRecordItem = useCallback((record: AttendanceRecord) => {
    const statusInfo = attendanceStatusMap[record.status];
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {record.avatar ? (
              <ResponsiveImage src={record.avatar} alt={record.employeeName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
                {record.employeeName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {record.employeeName}
              </h4>
              <Badge variant="outline" className="text-xs">{record.employeeId}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.department}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 shrink-0 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{record.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <LogIn size={16} />
              <span>{record.timeIn}</span>
            </div>
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>{record.timeOut}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{record.workHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        <Badge className={statusInfo.color} variant="secondary">
          <StatusIcon size={12} className="mr-1" />
          {statusInfo.label}
        </Badge>
      </div>
    );
  }, []);

  // 请假申请项
  const LeaveRequestItem = useCallback((request: LeaveRequest) => {
    const statusInfo = leaveStatusMap[request.status];
    const typeInfo = leaveTypeMap[request.type];
    const TypeIcon = typeInfo.icon;

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {request.avatar ? (
              <ResponsiveImage src={request.avatar} alt={request.employeeName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                {request.employeeName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {request.employeeName}
              </h4>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <TypeIcon size={12} />
                {typeInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.reason}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {request.startDate} 至 {request.endDate} · {request.days}天
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{request.applyDate} 申请</span>
            </div>
            {request.approver && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{request.approver}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusInfo.color} variant="secondary">
            {statusInfo.label}
          </Badge>
          {request.status === 'pending' && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                <Check size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                <X size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">考勤管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            打卡管理、排班、请假审批
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            导出报表
          </Button>
          <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <RefreshCw size={16} className="mr-2" />
                打卡
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>上下班打卡</DialogTitle>
                <DialogDescription>
                  记录您的上下班时间
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">当前时间</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {currentTime.toLocaleTimeString('zh-CN')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentTime.toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" className="flex flex-col gap-2 h-32">
                    <LogIn size={32} />
                    <span>上班打卡</span>
                  </Button>
                  <Button size="lg" variant="outline" className="flex flex-col gap-2 h-32">
                    <LogOut size={32} />
                    <span>下班打卡</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>当前定位: 北京总部</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Plus size={16} className="mr-2" />
                请假申请
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>请假申请</DialogTitle>
                <DialogDescription>
                  提交请假申请，等待审批
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={leaveForm.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>请假类型 *</Label>
                  <select
                    value={leaveForm.values.type}
                    onChange={(e) => leaveForm.handleChange('type', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="annual">年假</option>
                    <option value="sick">病假</option>
                    <option value="personal">事假</option>
                    <option value="maternity">产假</option>
                    <option value="paternity">陪产假</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>开始日期 *</Label>
                    <Input
                      type="date"
                      value={leaveForm.values.startDate}
                      onChange={(e) => leaveForm.handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>结束日期 *</Label>
                    <Input
                      type="date"
                      value={leaveForm.values.endDate}
                      onChange={(e) => leaveForm.handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>请假天数 *</Label>
                  <Input
                    type="number"
                    placeholder="请输入天数"
                    value={leaveForm.values.days}
                    onChange={(e) => leaveForm.handleChange('days', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>请假原因 *</Label>
                  <Input
                    placeholder="请说明请假原因"
                    value={leaveForm.values.reason}
                    onChange={(e) => leaveForm.handleChange('reason', e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={leaveForm.submitting}>
                    {leaveForm.submitting ? '提交中...' : '提交申请'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              今日打卡
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.todayClockIn}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              实到 / 总人数
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              准时率
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.todayClockIn > 0 ? Math.round((stats.onTime / stats.todayClockIn) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              迟到 {stats.late} 人
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              待审批
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.leavePending}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              请假申请
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              平均工时
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgWorkHours.toFixed(1)}h
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              日均工作时长
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索员工姓名、工号或部门..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">全部状态</option>
                <option value="normal">正常</option>
                <option value="late">迟到</option>
                <option value="early_leave">早退</option>
                <option value="absent">缺勤</option>
                <option value="leave">请假</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">全部部门</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="records">考勤记录</TabsTrigger>
              <TabsTrigger value="leaves">请假审批</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              <VirtualScroll
                items={filteredRecords}
                itemHeight={100}
                renderItem={AttendanceRecordItem}
                height={600}
              />
            </TabsContent>

            <TabsContent value="leaves" className="space-y-4">
              <VirtualScroll
                items={filteredLeaveRequests}
                itemHeight={120}
                renderItem={LeaveRequestItem}
                height={600}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
