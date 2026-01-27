'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, CheckCircle, Clock, AlertCircle, FileText, User, Calendar } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'in_progress' | 'failed';
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

interface OffboardingWorkflow {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  lastWorkDate: string;
  status: 'pending' | 'processing' | 'completed' | 'on_hold';
  steps: WorkflowStep[];
  createdAt: string;
}

export default function OffboardingProcessPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workflows, setWorkflows] = useState<OffboardingWorkflow[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setWorkflows([
        {
          id: '1',
          employeeName: '张三',
          employeeId: 'EMP001',
          department: '技术部',
          position: '高级工程师',
          lastWorkDate: '2024-05-10',
          status: 'processing',
          createdAt: '2024-04-10',
          steps: [
            { id: '1', name: '提交离职申请', status: 'completed', completedBy: '张三', completedAt: '2024-04-10' },
            { id: '2', name: '部门经理审批', status: 'completed', completedBy: '王经理', completedAt: '2024-04-11' },
            { id: '3', name: 'HR确认', status: 'completed', completedBy: '李HR', completedAt: '2024-04-12' },
            { id: '4', name: '工作交接', status: 'in_progress', notes: '正在交接项目文档' },
            { id: '5', name: '资产归还', status: 'pending' },
            { id: '6', name: '权限回收', status: 'pending' },
            { id: '7', name: '薪资结算', status: 'pending' },
            { id: '8', name: '离职证明', status: 'pending' },
          ],
        },
        {
          id: '2',
          employeeName: '李四',
          employeeId: 'EMP002',
          department: '销售部',
          position: '销售经理',
          lastWorkDate: '2024-05-05',
          status: 'processing',
          createdAt: '2024-04-05',
          steps: [
            { id: '1', name: '提交离职申请', status: 'completed', completedBy: '李四', completedAt: '2024-04-05' },
            { id: '2', name: '部门经理审批', status: 'completed', completedBy: '张总监', completedAt: '2024-04-06' },
            { id: '3', name: 'HR确认', status: 'completed', completedBy: '李HR', completedAt: '2024-04-07' },
            { id: '4', name: '工作交接', status: 'completed', completedBy: '李四', completedAt: '2024-04-20' },
            { id: '5', name: '资产归还', status: 'in_progress' },
            { id: '6', name: '权限回收', status: 'pending' },
            { id: '7', name: '薪资结算', status: 'pending' },
            { id: '8', name: '离职证明', status: 'pending' },
          ],
        },
        {
          id: '3',
          employeeName: '王五',
          employeeId: 'EMP003',
          department: '技术部',
          position: '前端工程师',
          lastWorkDate: '2024-04-30',
          status: 'completed',
          createdAt: '2024-04-01',
          steps: [
            { id: '1', name: '提交离职申请', status: 'completed', completedBy: '王五', completedAt: '2024-04-01' },
            { id: '2', name: '部门经理审批', status: 'completed', completedBy: '陈经理', completedAt: '2024-04-02' },
            { id: '3', name: 'HR确认', status: 'completed', completedBy: '李HR', completedAt: '2024-04-03' },
            { id: '4', name: '工作交接', status: 'completed', completedBy: '王五', completedAt: '2024-04-15' },
            { id: '5', name: '资产归还', status: 'completed', completedBy: '王五', completedAt: '2024-04-20' },
            { id: '6', name: '权限回收', status: 'completed', completedBy: 'IT部门', completedAt: '2024-04-25' },
            { id: '7', name: '薪资结算', status: 'completed', completedBy: '财务部', completedAt: '2024-04-28' },
            { id: '8', name: '离职证明', status: 'completed', completedBy: 'HR部门', completedAt: '2024-04-29' },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch =
        workflow.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = workflows.length;
    const processing = workflows.filter(w => w.status === 'processing').length;
    const completed = workflows.filter(w => w.status === 'completed').length;
    const onHold = workflows.filter(w => w.status === 'on_hold').length;
    return { total, processing, completed, onHold };
  }, [workflows]);

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">已完成</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">进行中</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="outline">待处理</Badge>;
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">离职流程</h1>
          <p className="text-muted-foreground mt-1">管理离职流程和工作交接</p>
        </div>
        <Button variant="outline">导出报表</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              流程总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">所有流程</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">正在办理</p>
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
            <p className="text-xs text-muted-foreground mt-1">流程结束</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              暂停中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.onHold}</div>
            <p className="text-xs text-muted-foreground mt-1">等待处理</p>
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
            <SelectItem value="processing">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="on_hold">暂停中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 流程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>离职流程列表</CardTitle>
          <CardDescription>查看和管理所有离职流程</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{workflow.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.employeeId} · {workflow.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={workflow.status === 'completed' ? 'default' : workflow.status === 'processing' ? 'secondary' : 'outline'}>
                      {workflow.status === 'completed' ? '已完成' : workflow.status === 'processing' ? '进行中' : '暂停中'}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {workflow.lastWorkDate}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      {getStepStatusIcon(step.status)}
                      <span className="flex-1 text-sm">{step.name}</span>
                      {getStepStatusBadge(step.status)}
                      {step.completedBy && (
                        <span className="text-xs text-muted-foreground">由 {step.completedBy} 完成</span>
                      )}
                      {step.notes && (
                        <span className="text-xs text-muted-foreground">备注: {step.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredWorkflows.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的离职流程
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
