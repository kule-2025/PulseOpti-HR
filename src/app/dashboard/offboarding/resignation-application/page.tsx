'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, User, Calendar, MessageSquare, Clock, Plus, FileText, AlertCircle } from 'lucide-react';

interface Resignation {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  resignationDate: string;
  lastWorkDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  progress: number;
  appliedAt: string;
}

export default function ResignationApplicationPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resignations, setResignations] = useState<Resignation[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setResignations([
        { id: '1', employeeName: '张三', employeeId: 'EMP001', department: '技术部', position: '高级工程师', resignationDate: '2024-04-10', lastWorkDate: '2024-05-10', reason: '个人发展', status: 'pending', progress: 10, appliedAt: '2024-04-10' },
        { id: '2', employeeName: '李四', employeeId: 'EMP002', department: '销售部', position: '销售经理', resignationDate: '2024-04-05', lastWorkDate: '2024-05-05', reason: '家庭原因', status: 'approved', progress: 50, appliedAt: '2024-04-05' },
        { id: '3', employeeName: '王五', employeeId: 'EMP003', department: '技术部', position: '前端工程师', resignationDate: '2024-04-01', lastWorkDate: '2024-04-30', reason: '职业转换', status: 'processing', progress: 75, appliedAt: '2024-04-01' },
        { id: '4', employeeName: '赵六', employeeId: 'EMP004', department: '市场部', position: '市场专员', resignationDate: '2024-03-20', lastWorkDate: '2024-04-20', reason: '薪资原因', status: 'completed', progress: 100, appliedAt: '2024-03-20' },
        { id: '5', employeeName: '钱七', employeeId: 'EMP005', department: '人力资源部', position: 'HR专员', resignationDate: '2024-03-15', lastWorkDate: '2024-04-15', reason: '健康原因', status: 'rejected', progress: 0, appliedAt: '2024-03-15' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredResignations = useMemo(() => {
    return resignations.filter(resignation => {
      const matchesSearch =
        resignation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resignation.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resignation.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || resignation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resignations, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = resignations.length;
    const pending = resignations.filter(r => r.status === 'pending').length;
    const processing = resignations.filter(r => r.status === 'processing').length;
    const completed = resignations.filter(r => r.status === 'completed').length;
    return { total, pending, processing, completed };
  }, [resignations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">待审批</Badge>;
      case 'approved':
        return <Badge>已批准</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>;
      case 'processing':
        return <Badge variant="secondary">办理中</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600">已完成</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">离职申请</h1>
          <p className="text-muted-foreground mt-1">管理员工离职申请</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />提交申请</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              申请总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">本月申请</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              待审批
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">需要处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              办理中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">交接进行</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">流程结束</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索员工姓名、工号或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待审批</SelectItem>
            <SelectItem value="approved">已批准</SelectItem>
            <SelectItem value="processing">办理中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 离职申请列表 */}
      <Card>
        <CardHeader>
          <CardTitle>离职申请列表</CardTitle>
          <CardDescription>查看和处理所有离职申请</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResignations.map((resignation) => (
              <div
                key={resignation.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{resignation.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">{resignation.employeeId} · {resignation.department}</p>
                      </div>
                      <p className="text-sm font-medium">{resignation.position}</p>
                      {getStatusBadge(resignation.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">申请日期</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {resignation.resignationDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">最后工作日</p>
                        <p className="font-semibold">{resignation.lastWorkDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">离职原因</p>
                        <p className="font-semibold">{resignation.reason}</p>
                      </div>
                    </div>

                    {resignation.status !== 'rejected' && resignation.status !== 'completed' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>流程进度</span>
                          <span>{resignation.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${resignation.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {resignation.status === 'pending' && (
                      <>
                        <Button size="sm">批准</Button>
                        <Button variant="outline" size="sm">拒绝</Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">查看详情</Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredResignations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的离职申请
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
