'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours: number;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave';
  location?: string;
  notes?: string;
}

// 模拟考勤数据
const ATTENDANCE_DATA: AttendanceRecord[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    date: '2025-01-17',
    checkInTime: '08:55',
    checkOutTime: '18:10',
    workHours: 9.25,
    status: 'normal',
    location: '北京总部',
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    date: '2025-01-17',
    checkInTime: '09:15',
    checkOutTime: '18:00',
    workHours: 8.75,
    status: 'late',
    location: '上海分公司',
    notes: '交通拥堵',
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    date: '2025-01-17',
    checkInTime: '08:50',
    checkOutTime: '17:30',
    workHours: 8.67,
    status: 'early',
    location: '广州办公室',
    notes: '个人原因',
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '技术部',
    date: '2025-01-17',
    checkInTime: '-',
    checkOutTime: '-',
    workHours: 0,
    status: 'leave',
    location: '-',
    notes: '病假',
  },
  {
    id: '5',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '人力资源部',
    date: '2025-01-17',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    workHours: 9,
    status: 'normal',
    location: '北京总部',
  },
  {
    id: '6',
    employeeName: '周八',
    employeeId: 'EMP006',
    department: '技术部',
    date: '2025-01-17',
    checkInTime: '-',
    checkOutTime: '-',
    workHours: 0,
    status: 'absent',
    location: '-',
    notes: '未打卡',
  },
];

const STATUS_CONFIG = {
  normal: {
    label: '正常',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  late: {
    label: '迟到',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: Clock,
  },
  early: {
    label: '早退',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    icon: Clock,
  },
  absent: {
    label: '缺勤',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    icon: XCircle,
  },
  leave: {
    label: '请假',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    icon: FileText,
  },
};

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤考勤记录
  const filteredRecords = useMemo(() => {
    let records = ATTENDANCE_DATA;

    // 按部门过滤
    if (departmentFilter !== 'all') {
      records = records.filter(r => r.department === departmentFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      records = records.filter(r => r.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      records = records.filter(r =>
        r.employeeName.toLowerCase().includes(query) ||
        r.employeeId.toLowerCase().includes(query)
      );
    }

    return records;
  }, [searchQuery, departmentFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: ATTENDANCE_DATA.length,
      normal: ATTENDANCE_DATA.filter(r => r.status === 'normal').length,
      abnormal: ATTENDANCE_DATA.filter(r => ['late', 'early', 'absent'].includes(r.status)).length,
      leave: ATTENDANCE_DATA.filter(r => r.status === 'leave').length,
      avgWorkHours: ATTENDANCE_DATA.reduce((sum, r) => sum + r.workHours, 0) / ATTENDANCE_DATA.filter(r => r.status !== 'absent' && r.status !== 'leave').length || 0,
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(ATTENDANCE_DATA.map(record => record.department)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            考勤记录
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            查看和管理员工每日考勤情况
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button>
            手动补卡
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>应打卡人数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              正常出勤
            </CardDescription>
            <CardTitle className="text-3xl">{stats.normal}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              异常考勤
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.abnormal}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均工时</CardDescription>
            <CardTitle className="text-3xl">{stats.avgWorkHours.toFixed(1)}小时</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 考勤列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>考勤记录列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无记录
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有考勤记录
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const statusConfig = STATUS_CONFIG[record.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {record.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {record.employeeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {record.employeeId}
                              </Badge>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {record.department}
                            </p>
                          </div>
                        </div>

                        {/* 打卡信息 */}
                        <div className="w-40 shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            上班打卡
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {record.checkInTime || '-'}
                          </div>
                        </div>

                        <div className="w-40 shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            下班打卡
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {record.checkOutTime || '-'}
                          </div>
                        </div>

                        {/* 工时和地点 */}
                        <div className="w-36 shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            工作时长
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {record.workHours.toFixed(1)}h
                          </div>
                        </div>

                        <div className="w-36 shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            打卡地点
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{record.location || '-'}</span>
                          </div>
                        </div>

                        {/* 备注 */}
                        <div className="w-40 shrink-0">
                          {record.notes && (
                            <>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                备注
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {record.notes}
                              </div>
                            </>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                          {record.status === 'absent' && (
                            <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-600">
                              补卡
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
