'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { Clock, Calendar, CheckCircle2, AlertCircle, Search, Download, Filter, TrendingUp } from 'lucide-react';
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
  status: string;
  workHours: number;
  avatar: string | null;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  applyDate: string;
  approver: string | null;
  approveDate: string | null;
  avatar: string | null;
}

// 模拟数据
const MOCK_RECORDS: AttendanceRecord[] = Array.from({ length: 80 }, (_, i) => {
  const statuses = ['正常', '迟到', '早退', '旷工', '请假'];
  const status = statuses[i % statuses.length];
  const timeIn = status === '迟到' ? '09:15' : status === '旷工' ? '--:--' : '08:55';
  const timeOut = status === '早退' ? '17:30' : status === '旷工' ? '--:--' : '18:05';

  return {
    id: `record-${i + 1}`,
    employeeId: `emp-${i + 1}`,
    employeeName: `员工${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
    date: `2024-03-${String((i % 30) + 1).padStart(2, '0')}`,
    timeIn,
    timeOut,
    status,
    workHours: status === '旷工' ? 0 : 8.5 - (status === '迟到' || status === '早退' ? 0.5 : 0),
    avatar: null,
  };
});

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = Array.from({ length: 20 }, (_, i) => {
  const types = ['年假', '病假', '事假', '调休'];
  const statuses = ['待审批', '已通过', '已拒绝'];
  const status = statuses[i % statuses.length];

  return {
    id: `leave-${i + 1}`,
    employeeId: `emp-${i + 1}`,
    employeeName: `员工${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
    type: types[i % types.length],
    startDate: `2024-03-${String((i % 20) + 1).padStart(2, '0')}`,
    endDate: `2024-03-${String(((i % 20) + 1)).padStart(2, '0')}`,
    days: 1,
    reason: '个人原因',
    status,
    applyDate: `2024-03-${String(i % 25 + 1).padStart(2, '0')}`,
    approver: status !== '待审批' ? '张经理' : null,
    approveDate: status !== '待审批' ? `2024-03-${String(i % 25 + 2).padStart(2, '0')}` : null,
    avatar: null,
  };
});

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2024-03');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 获取考勤记录
  const { data: records, loading: recordsLoading } = useFetch<AttendanceRecord[]>(
    '/api/attendance/records',
    { fallback: MOCK_RECORDS }
  );

  // 获取请假申请
  const { data: leaveRequests, loading: leaveLoading } = useFetch<LeaveRequest[]>(
    '/api/attendance/leave',
    { fallback: MOCK_LEAVE_REQUESTS }
  );

  // 筛选考勤记录
  const filteredRecords = useMemo(() => {
    if (!records) return [];

    return records.filter((record: AttendanceRecord) => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        record.department.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesDate = record.date.startsWith(dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [records, debouncedSearch, statusFilter, dateFilter]);

  // 筛选请假申请
  const filteredLeaveRequests = useMemo(() => {
    if (!leaveRequests) return [];

    return leaveRequests.filter((request: LeaveRequest) => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        request.department.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = leaveStatusFilter === 'all' || request.status === leaveStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, debouncedSearch, leaveStatusFilter]);

  // 虚拟列表项渲染器 - 考勤记录
  const RecordItem = useCallback((record: AttendanceRecord, index: number) => {
    const statusColors: Record<string, string> = {
      '正常': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '迟到': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '早退': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      '旷工': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      '请假': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {record.avatar ? (
              <ResponsiveImage
                src={record.avatar}
                alt={record.employeeName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
                {record.employeeName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {record.employeeName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.department}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">日期</p>
              <p className="text-gray-900 dark:text-white font-medium">{record.date}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">签到</p>
              <p className="text-gray-900 dark:text-white font-medium">{record.timeIn}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">签退</p>
              <p className="text-gray-900 dark:text-white font-medium">{record.timeOut}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">工时</p>
              <p className="text-gray-900 dark:text-white font-medium">{record.workHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Badge className={statusColors[record.status]}>
            {record.status}
          </Badge>
          <Button variant="ghost" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }, []);

  // 虚拟列表项渲染器 - 请假申请
  const LeaveItem = useCallback((request: LeaveRequest, index: number) => {
    const statusColors: Record<string, string> = {
      '待审批': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '已通过': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '已拒绝': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {request.avatar ? (
              <ResponsiveImage
                src={request.avatar}
                alt={request.employeeName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                {request.employeeName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {request.employeeName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.department}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">请假类型</p>
              <p className="text-gray-900 dark:text-white font-medium">{request.type}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">时间</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {request.startDate} ~ {request.endDate}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">天数</p>
              <p className="text-gray-900 dark:text-white font-medium">{request.days}天</p>
            </div>
            {request.approver && (
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">审批人</p>
                <p className="text-gray-900 dark:text-white font-medium">{request.approver}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Badge className={statusColors[request.status]}>
            {request.status}
          </Badge>
          {request.status === '待审批' && (
            <>
              <Button variant="outline" size="sm">
                拒绝
              </Button>
              <Button size="sm">
                通过
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }, []);

  if (loading || recordsLoading || leaveLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            考勤管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            打卡记录、请假审批与排班管理
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            申请请假
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="今日出勤"
          value={`${records?.filter((r: AttendanceRecord) => r.status === '正常' && r.date === '2024-03-15').length || 0}人`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="迟到"
          value={`${records?.filter((r: AttendanceRecord) => r.status === '迟到').length || 0}人`}
          icon={<AlertCircle className="w-4 h-4" />}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="待审批请假"
          value={leaveRequests?.filter((r: LeaveRequest) => r.status === '待审批').length || 0}
          icon={<Clock className="w-4 h-4" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="平均工时"
          value={`${(records && records.length > 0 ? records.reduce((sum: number, r: AttendanceRecord) => sum + r.workHours, 0) / records.length : 0)}h`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* 主内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">打卡记录</TabsTrigger>
          <TabsTrigger value="leave">请假管理</TabsTrigger>
          <TabsTrigger value="schedule">排班管理</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <RecordsList
            records={filteredRecords}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            RecordItem={RecordItem}
          />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveList
            leaveRequests={filteredLeaveRequests}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            leaveStatusFilter={leaveStatusFilter}
            onLeaveStatusFilterChange={setLeaveStatusFilter}
            LeaveItem={LeaveItem}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 统计卡片
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', color, 'text-white')}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// 考勤记录列表
function RecordsList({
  records,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  RecordItem,
}: {
  records: AttendanceRecord[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  RecordItem: (record: AttendanceRecord, index: number) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>打卡记录 ({records.length})</CardTitle>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索员工..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="迟到">迟到</SelectItem>
                <SelectItem value="早退">早退</SelectItem>
                <SelectItem value="旷工">旷工</SelectItem>
                <SelectItem value="请假">请假</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="w-full sm:w-36"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[600px]">
          <VirtualScroll
            items={records}
            renderItem={RecordItem}
            itemHeight={80}
            height={600}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 请假列表
function LeaveList({
  leaveRequests,
  searchQuery,
  onSearchChange,
  leaveStatusFilter,
  onLeaveStatusFilterChange,
  LeaveItem,
}: {
  leaveRequests: LeaveRequest[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  leaveStatusFilter: string;
  onLeaveStatusFilterChange: (value: string) => void;
  LeaveItem: (request: LeaveRequest, index: number) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>请假管理 ({leaveRequests.length})</CardTitle>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索员工..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            <Select value={leaveStatusFilter} onValueChange={onLeaveStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待审批">待审批</SelectItem>
                <SelectItem value="已通过">已通过</SelectItem>
                <SelectItem value="已拒绝">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[600px]">
          <VirtualScroll
            items={leaveRequests}
            renderItem={LeaveItem}
            itemHeight={100}
            height={600}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 排班管理
function ScheduleManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>排班管理</CardTitle>
        <CardDescription>
          管理员工工作班次和排班计划
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无排班计划</p>
          <Button variant="link" className="mt-2">
            创建排班
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
