'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  Filter,
  MapPin,
  Eye,
  Calendar as CalendarIcon,
  Clock3,
  Coffee,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface ClockInRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  recordDate: string;
  clockInTime: string;
  clockOutTime: string;
  workHours: number;
  location: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  departmentId?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  applyTime: string;
  workflowInstanceId?: string;
  workflowStatus?: string;
}

interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  departmentId?: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  status: string;
  workflowInstanceId?: string;
  workflowStatus?: string;
}

interface ScheduleData {
  id: string;
  date: string;
  shift: string;
  time: string;
  employees: string[];
}

interface StatItem {
  label: string;
  value: string;
  total?: string;
  unit?: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  bgColor: string;
}

export default function AttendanceContent() {
  const [activeTab, setActiveTab] = useState('clock-in');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 数据状态
  const [clockInRecords, setClockInRecords] = useState<ClockInRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 并行获取所有数据
      const [
        clockInRes,
        leaveRes,
        overtimeRes,
        scheduleRes,
        statsRes,
      ] = await Promise.all([
        fetch(`/api/attendance/clock-in?limit=20`),
        fetch(`/api/attendance/leave?limit=20`),
        fetch(`/api/attendance/overtime?limit=20`),
        fetch(`/api/attendance/scheduling?limit=50`),
        fetch(`/api/attendance/statistics?dateFrom=${lastMonth}&dateTo=${today}&type=all`),
      ]);

      // 处理响应
      const clockInData = clockInRes.ok ? await clockInRes.json() : { data: [] };
      const leaveData = leaveRes.ok ? await leaveRes.json() : { data: [] };
      const overtimeData = overtimeRes.ok ? await overtimeRes.json() : { data: [] };
      const scheduleDataRes = scheduleRes.ok ? await scheduleRes.json() : { data: [] };
      const statsData = statsRes.ok ? await statsRes.json() : { data: {} };

      // 转换打卡记录
      const clockInRecords: ClockInRecord[] = (clockInData.data || []).map((record: any) => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName || '未知员工',
        recordDate: record.recordDate,
        clockInTime: record.clockInTime
          ? (record.clockInTime instanceof Date ? record.clockInTime : new Date(record.clockInTime)).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '-',
        clockOutTime: record.clockOutTime
          ? (record.clockOutTime instanceof Date ? record.clockOutTime : new Date(record.clockOutTime)).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '-',
        workHours: record.workHours,
        location: record.location || '未知地点',
        status: translateAttendanceStatus(record.status),
      }));

      // 转换请假记录
      const leaveRequests: LeaveRequest[] = (leaveData.data || []).map((request: any) => ({
        id: request.id,
        employeeId: request.employeeId,
        employeeName: request.employeeName || '未知员工',
        department: '各部门',
        departmentId: request.departmentId,
        leaveType: translateLeaveType(request.leaveType),
        startDate: request.startDate,
        endDate: request.endDate,
        days: request.days,
        reason: request.reason,
        status: translateStatus(request.status),
        applyTime: request.createdAt ? new Date(request.createdAt).toLocaleString('zh-CN') : '-',
        workflowInstanceId: request.workflowInstanceId,
        workflowStatus: request.workflowStatus,
      }));

      // 转换加班记录
      const overtimeRecords: OvertimeRecord[] = (overtimeData.data || []).map((record: any) => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName || '未知员工',
        department: '各部门',
        departmentId: record.departmentId,
        overtimeDate: record.overtimeDate,
        startTime: record.startTime ? (record.startTime instanceof Date ? record.startTime : new Date(record.startTime)).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '-',
        endTime: record.endTime ? (record.endTime instanceof Date ? record.endTime : new Date(record.endTime)).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '-',
        duration: record.duration / 60, // 分钟转小时
        reason: record.reason,
        status: translateStatus(record.status),
        workflowInstanceId: record.workflowInstanceId,
        workflowStatus: record.workflowStatus,
      }));

      // 转换排班数据
      const scheduleData: ScheduleData[] = (scheduleDataRes.data || []).map((schedule: any) => ({
        id: schedule.id,
        date: schedule.scheduleDate,
        shift: schedule.shiftType || schedule.shiftName,
        time: `${schedule.startTime} - ${schedule.endTime}`,
        employees: [schedule.employeeName || '未知员工'],
      }));

      // 计算统计数据
      const totalEmployees = clockInRecords.length || 0;
      const presentToday = clockInRecords.filter((item: any) => (r) => r.status === '正常').length || 0;
      const lateCount = clockInRecords.filter((item: any) => (r) => r.status === '迟到').length || 0;
      const leaveCount = leaveRequests.filter((item: any) => (r) => r.status === '待审批').length || 0;
      const totalOvertimeHours = overtimeRecords.reduce((sum, r) => sum + r.duration, 0);

      const calculatedStats: StatItem[] = [
        {
          label: '今日出勤',
          value: presentToday.toString(),
          total: totalEmployees.toString(),
          change: '+93.3%',
          trend: 'up',
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          label: '迟到人数',
          value: lateCount.toString(),
          change: '-1',
          trend: 'down',
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        },
        {
          label: '请假人数',
          value: leaveCount.toString(),
          change: '+1',
          trend: 'up',
          icon: Coffee,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          label: '加班时长',
          value: totalOvertimeHours.toFixed(1),
          unit: '小时',
          change: '+12.3',
          trend: 'up',
          icon: Clock3,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        },
      ];

      setClockInRecords(clockInRecords);
      setLeaveRequests(leaveRequests);
      setOvertimeRecords(overtimeRecords);
      setScheduleData(scheduleData);
      setStats(calculatedStats);

    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载考勤数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 翻译考勤状态
  const translateAttendanceStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'normal': '正常',
      'late': '迟到',
      'early': '早退',
      'absent': '缺勤',
      'overtime': '加班',
    };
    return statusMap[status] || status;
  };

  // 翻译请假类型
  const translateLeaveType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'annual': '年假',
      'sick': '病假',
      'personal': '事假',
      'marriage': '婚假',
      'bereavement': '丧假',
      'maternity': '产假',
      'paternity': '陪产假',
    };
    return typeMap[type] || type;
  };

  // 翻译状态
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': '待审批',
      'approved': '已通过',
      'rejected': '已拒绝',
      'cancelled': '已取消',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常':
      case '已通过':
      case '已审批':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '迟到':
      case '加班':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case '未打卡':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case '待审批':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '已拒绝':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '正常':
      case '已通过':
      case '已审批':
        return <CheckCircle2 className="h-4 w-4" />;
      case '迟到':
      case '加班':
        return <AlertTriangle className="h-4 w-4" />;
      case '未打卡':
        return <XCircle className="h-4 w-4" />;
      case '待审批':
        return <Clock className="h-4 w-4" />;
      case '已拒绝':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            正在加载考勤数据...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {error}
        </p>
        <Button
          onClick={loadData}
          className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
        >
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            考勤管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            打卡管理、排班安排、请假审批、加班管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                申请请假
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>申请请假</DialogTitle>
                <DialogDescription>
                  请填写请假申请信息
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="leaveType">请假类型</Label>
                  <Select>
                    <SelectTrigger id="leaveType">
                      <SelectValue placeholder="选择请假类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">年假</SelectItem>
                      <SelectItem value="sick">病假</SelectItem>
                      <SelectItem value="personal">事假</SelectItem>
                      <SelectItem value="marriage">婚假</SelectItem>
                      <SelectItem value="maternity">产假</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">开始日期</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">结束日期</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">请假原因</Label>
                  <Textarea
                    id="reason"
                    placeholder="请详细说明请假原因..."
                    rows={4}
                  />
                </div>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">温馨提示</p>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                        <li>• 请提前3天提交请假申请，特殊情况除外</li>
                        <li>• 病假需提供医院证明</li>
                        <li>• 年假需提前与直属上级沟通</li>
                        <li>• 请假期间的工作交接请提前安排</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">取消</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  提交申请
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-2 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                      {stat.unit && <span className="text-sm font-normal ml-1">{stat.unit}</span>}
                    </p>
                  </div>
                  <div className={cn('rounded-full p-3', stat.bgColor)}>
                    <Icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {stat.trend === 'up' ? (
                    <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="mr-1 h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {stat.change}
                  </span>
                  {stat.total && <span className="ml-1 text-gray-500 dark:text-gray-400">/ {stat.total}</span>}
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    较昨日
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 主内容区 - Tab切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800">
          <TabsTrigger value="clock-in" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Clock className="mr-2 h-4 w-4" />
            打卡记录
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            排班管理
          </TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Coffee className="mr-2 h-4 w-4" />
            请假审批
          </TabsTrigger>
          <TabsTrigger value="overtime" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Clock3 className="mr-2 h-4 w-4" />
            加班管理
          </TabsTrigger>
        </TabsList>

        {/* 打卡记录 Tab */}
        <TabsContent value="clock-in" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>今日打卡记录</CardTitle>
              <CardDescription>2024年2月20日员工打卡详情</CardDescription>
            </CardHeader>
            <CardContent>
              {clockInRecords.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      暂无打卡记录数据
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      请先进行员工打卡或查看其他日期
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工姓名</TableHead>
                        <TableHead>上班打卡</TableHead>
                        <TableHead>下班打卡</TableHead>
                        <TableHead>工作时长</TableHead>
                        <TableHead>打卡地点</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clockInRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-green-600" />
                              {record.clockInTime}
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.clockOutTime === '-' ? (
                              <span className="text-gray-400">未打卡</span>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                {record.clockOutTime}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.workHours > 0 ? `${record.workHours} 小时` : '-'}
                          </TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              <span className="mr-1">{getStatusIcon(record.status)}</span>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 排班管理 Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>今日排班</CardTitle>
              <CardDescription>2024年2月20日班次安排</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      暂无排班数据
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      请先创建排班计划
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {scheduleData.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {schedule.shift}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {schedule.date}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            schedule.shift === '早班'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-purple-600 text-purple-600'
                          }
                        >
                          {schedule.time}
                        </Badge>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          员工名单：
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {schedule.employees.map((employee, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {employee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 请假审批 Tab */}
        <TabsContent value="leave" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>请假申请</CardTitle>
              <CardDescription>待审批和已处理的请假申请</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <Coffee className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      暂无请假申请数据
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      请先提交请假申请或查看其他记录
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工姓名</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>请假类型</TableHead>
                        <TableHead>请假时间</TableHead>
                        <TableHead>天数</TableHead>
                        <TableHead>请假原因</TableHead>
                        <TableHead>申请时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employeeName}</TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.leaveType}</Badge>
                          </TableCell>
                          <TableCell>
                            {request.startDate} 至 {request.endDate}
                          </TableCell>
                          <TableCell className="font-medium">{request.days} 天</TableCell>
                          <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                          <TableCell>{request.applyTime}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === '待审批' && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  通过
                                </Button>
                                <Button variant="outline" size="sm">
                                  拒绝
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 加班管理 Tab */}
        <TabsContent value="overtime" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>加班记录</CardTitle>
              <CardDescription>员工加班申请和审批记录</CardDescription>
            </CardHeader>
            <CardContent>
              {overtimeRecords.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <Clock3 className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      暂无加班记录数据
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      请先提交加班申请或查看其他记录
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工姓名</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>加班日期</TableHead>
                        <TableHead>加班时段</TableHead>
                        <TableHead>加班时长</TableHead>
                        <TableHead>加班原因</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overtimeRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.overtimeDate}</TableCell>
                          <TableCell>
                            {record.startTime} - {record.endTime}
                          </TableCell>
                          <TableCell className="font-medium text-purple-600">
                            {record.duration} 小时
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
