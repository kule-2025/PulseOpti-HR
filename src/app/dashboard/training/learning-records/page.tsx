'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, User, Clock, PlayCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface LearningRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  courseName: string;
  progress: number;
  status: 'in_progress' | 'completed' | 'not_started';
  lastAccessed: string;
  duration: number;
  score?: number;
}

export default function LearningRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [records, setRecords] = useState<LearningRecord[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setRecords([
        { id: '1', employeeName: '张三', employeeId: 'EMP001', department: '技术部', courseName: '新员工入职培训', progress: 100, status: 'completed', lastAccessed: '2024-04-15', duration: 8, score: 95 },
        { id: '2', employeeName: '李四', employeeId: 'EMP002', department: '销售部', courseName: '销售技巧培训', progress: 75, status: 'in_progress', lastAccessed: '2024-04-14', duration: 6 },
        { id: '3', employeeName: '王五', employeeId: 'EMP003', department: '技术部', courseName: '领导力提升课程', progress: 45, status: 'in_progress', lastAccessed: '2024-04-13', duration: 12 },
        { id: '4', employeeName: '赵六', employeeId: 'EMP004', department: '市场部', courseName: '沟通技巧提升', progress: 100, status: 'completed', lastAccessed: '2024-04-12', duration: 5, score: 88 },
        { id: '5', employeeName: '钱七', employeeId: 'EMP005', department: '技术部', courseName: '项目管理基础', progress: 0, status: 'not_started', lastAccessed: '2024-04-01', duration: 10 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [records, searchTerm, departmentFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.status === 'completed').length;
    const inProgress = records.filter(r => r.status === 'in_progress').length;
    const avgProgress = records.reduce((sum, r) => sum + r.progress, 0) / total;
    return { total, completed, inProgress, avgProgress };
  }, [records]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学习记录</h1>
          <p className="text-muted-foreground mt-1">查看员工学习进度和完成情况</p>
        </div>
        <Button variant="outline">导出报表</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              学习人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">总学习记录</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              完成率 {((stats.completed / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {((stats.inProgress / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              平均进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">整体学习进度</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索员工姓名、工号或课程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="部门" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部部门</SelectItem>
            <SelectItem value="技术部">技术部</SelectItem>
            <SelectItem value="销售部">销售部</SelectItem>
            <SelectItem value="市场部">市场部</SelectItem>
            <SelectItem value="人力资源部">人力资源部</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="not_started">未开始</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 学习记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>学习记录列表</CardTitle>
          <CardDescription>所有员工的学习进度和完成情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{record.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{record.employeeId} · {record.department}</p>
                    </div>
                    <Badge
                      variant={
                        record.status === 'completed'
                          ? 'default'
                          : record.status === 'in_progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {record.status === 'completed' ? '已完成' : record.status === 'in_progress' ? '进行中' : '未开始'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium">{record.courseName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {record.duration}小时
                      </span>
                      <span>最后学习: {record.lastAccessed}</span>
                      {record.score && (
                        <span className="text-green-600 font-medium">成绩: {record.score}分</span>
                      )}
                    </div>
                    <Progress value={record.progress} className="mt-3 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{record.progress}% 完成</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的学习记录
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
