'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  User,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeDepartment: string;
  date: string;
  clockIn: {
    time: string;
    location?: string;
    device?: string;
  };
  clockOut: {
    time: string;
    location?: string;
    device?: string;
  } | null;
  workHours: number;
  status: 'normal' | 'late' | 'early-leave' | 'absent' | 'leave';
  overtimeHours: number;
  notes?: string;
  createdAt: string;
}

export default function AttendanceClockIn() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceRecord['status']>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // 获取考勤记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?companyId=demo-company&date=${dateFilter}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('获取考勤记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants: Record<string, any> = {
      normal: 'default',
      late: 'destructive',
      'early-leave': 'destructive',
      absent: 'destructive',
      leave: 'secondary',
    };
    const labels: Record<string, string> = {
      normal: '正常',
      late: '迟到',
      'early-leave': '早退',
      absent: '缺勤',
      leave: '请假',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 获取状态图标
  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'late':
      case 'early-leave':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // 导出考勤记录
  const exportRecords = async () => {
    try {
      const response = await fetch('/api/attendance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo-company',
          date: dateFilter,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${dateFilter}.xlsx`;
        a.click();
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  // 计算统计
  const calculateStats = () => {
    return {
      total: records.length,
      normal: records.filter(r => r.status === 'normal').length,
      late: records.filter(r => r.status === 'late').length,
      absent: records.filter(r => r.status === 'absent').length,
      avgWorkHours: records.length > 0
        ? records.reduce((sum, r) => sum + r.workHours, 0) / records.length
        : 0,
    };
  };

  const stats = calculateStats();

  useEffect(() => {
    fetchRecords();
  }, [dateFilter]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">打卡记录</h1>
          <p className="text-muted-foreground mt-1">
            查看和管理员工打卡记录
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRecords}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" onClick={fetchRecords}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总打卡人数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">正常打卡</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.normal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">迟到</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">缺勤</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均工时</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgWorkHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label>日期</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>状态</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="late">迟到</SelectItem>
                  <SelectItem value="early-leave">早退</SelectItem>
                  <SelectItem value="absent">缺勤</SelectItem>
                  <SelectItem value="leave">请假</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 考勤记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>打卡记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>上班打卡</TableHead>
                <TableHead>下班打卡</TableHead>
                <TableHead>工时</TableHead>
                <TableHead>加班</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无考勤记录
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{record.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.employeeDepartment}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.clockIn.time}</div>
                        {record.clockIn.location && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {record.clockIn.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.clockOut ? (
                        <div>
                          <div className="font-medium">{record.clockOut.time}</div>
                          {record.clockOut.location && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {record.clockOut.location}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">未打卡</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.workHours}h</span>
                    </TableCell>
                    <TableCell>
                      {record.overtimeHours > 0 ? (
                        <span className="text-blue-600 font-medium">+{record.overtimeHours}h</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className="ml-2">{getStatusBadge(record.status)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
