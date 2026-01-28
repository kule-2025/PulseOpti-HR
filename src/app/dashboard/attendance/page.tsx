'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  MapPin,
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave';
  location: string;
}

interface ShiftRule {
  id: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  workDays: string[];
  lateThreshold: number;
  earlyThreshold: number;
}

interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState('records');
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      date: '2024-12-15',
      checkIn: '09:00',
      checkOut: '18:30',
      workHours: 9.5,
      status: 'normal',
      location: '北京总部',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '产品部',
      date: '2024-12-15',
      checkIn: '09:15',
      checkOut: '18:00',
      workHours: 8.75,
      status: 'late',
      location: '上海分公司',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: '王五',
      department: '设计部',
      date: '2024-12-15',
      checkIn: '-',
      checkOut: '-',
      workHours: 0,
      status: 'leave',
      location: '-',
    },
  ]);

  const [shiftRules, setShiftRules] = useState<ShiftRule[]>([
    {
      id: '1',
      name: '标准班次',
      checkInTime: '09:00',
      checkOutTime: '18:00',
      workDays: ['周一', '周二', '周三', '周四', '周五'],
      lateThreshold: 15,
      earlyThreshold: 30,
    },
    {
      id: '2',
      name: '弹性班次',
      checkInTime: '10:00',
      checkOutTime: '19:00',
      workDays: ['周一', '周二', '周三', '周四', '周五'],
      lateThreshold: 30,
      earlyThreshold: 30,
    },
  ]);

  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      date: '2024-12-14',
      startTime: '18:00',
      endTime: '21:00',
      hours: 3,
      reason: '项目上线',
      status: 'approved',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      date: '2024-12-14',
      startTime: '18:00',
      endTime: '20:00',
      hours: 2,
      reason: '需求评审',
      status: 'pending',
    },
  ]);

  const stats = {
    totalEmployees: 156,
    todayPresent: 142,
    todayAbsent: 8,
    todayLate: 6,
    averageWorkHours: 8.5,
    monthOvertimeHours: 325,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      normal: { label: '正常', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      late: { label: '迟到', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      early: { label: '早退', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      absent: { label: '缺勤', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      leave: { label: '请假', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      pending: { label: '待审批', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      approved: { label: '已批准', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleExport = () => {
    toast.success('考勤数据导出成功');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              考勤管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              智能考勤、排班管理、加班审批
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Smartphone className="h-4 w-4 mr-2" />
              移动打卡
            </Button>
          </div>
        </div>

        {/* 考勤统计 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">员工总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">今日出勤</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.todayPresent}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                出勤率 {((stats.todayPresent / stats.totalEmployees) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">今日缺勤</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.todayAbsent}</div>
              <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                需关注
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">今日迟到</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.todayLate}</div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均工时</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averageWorkHours}h</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                正常范围
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">本月加班</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.monthOvertimeHours}h</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                环比下降
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              打卡记录
            </TabsTrigger>
            <TabsTrigger value="shift" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              排班管理
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              加班管理
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              审批管理
            </TabsTrigger>
          </TabsList>

          {/* 打卡记录 */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>打卡记录</CardTitle>
                    <CardDescription>查看员工的每日打卡详情</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-12">2024年12月</SelectItem>
                        <SelectItem value="2024-11">2024年11月</SelectItem>
                        <SelectItem value="2024-10">2024年10月</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      筛选
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>上班打卡</TableHead>
                        <TableHead>下班打卡</TableHead>
                        <TableHead>工时</TableHead>
                        <TableHead>地点</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.checkIn}</TableCell>
                          <TableCell>{record.checkOut}</TableCell>
                          <TableCell>{record.workHours}h</TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {record.location}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 排班管理 */}
          <TabsContent value="shift" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>排班规则</CardTitle>
                <CardDescription>设置和管理班次规则</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shiftRules.map((rule) => (
                    <Card key={rule.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">上班时间</span>
                            <div className="font-semibold text-gray-900 dark:text-white">{rule.checkInTime}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">下班时间</span>
                            <div className="font-semibold text-gray-900 dark:text-white">{rule.checkOutTime}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">工作日</span>
                            <div className="font-semibold text-gray-900 dark:text-white">{rule.workDays.join(', ')}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">迟到阈值</span>
                            <div className="font-semibold text-gray-900 dark:text-white">{rule.lateThreshold}分钟</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">编辑</Button>
                          <Button variant="outline" size="sm" className="flex-1">应用</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 加班管理 */}
          <TabsContent value="overtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>加班申请</CardTitle>
                <CardDescription>管理员工的加班申请</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>开始时间</TableHead>
                        <TableHead>结束时间</TableHead>
                        <TableHead>加班时长</TableHead>
                        <TableHead>原因</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overtimeRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employeeName}</TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>{request.startTime}</TableCell>
                          <TableCell>{request.endTime}</TableCell>
                          <TableCell>{request.hours}h</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 审批管理 */}
          <TabsContent value="approval" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>待审批</CardTitle>
                <CardDescription>处理请假、加班等申请审批</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overtimeRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{request.employeeName} 的加班申请</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">日期：</span>
                              <span className="text-gray-900 dark:text-white">{request.date}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">时长：</span>
                              <span className="text-gray-900 dark:text-white">{request.hours}小时</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">时间段：</span>
                              <span className="text-gray-900 dark:text-white">{request.startTime} - {request.endTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">原因：</span>
                              <span className="text-gray-900 dark:text-white">{request.reason}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            批准
                          </Button>
                          <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
