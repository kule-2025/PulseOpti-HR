'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  CreditCard,
  Laptop,
  UserX,
  Search,
  Filter,
  Eye,
  Edit3,
  Download,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Archive,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function OffboardingContent() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  // 离职流程数据
  const offboardingWorkflows = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: '张三',
      gender: '男',
      phone: '138****1234',
      email: 'zhangsan@example.com',
      department: '销售部',
      position: '销售经理',
      level: 'M2',
      manager: '王总监',
      lastWorkDate: '2024-03-15',
      resignationType: '个人原因',
      status: '进行中',
      currentStep: '工作交接',
      progress: 60,
      initiator: '张三',
      initiatorDate: '2024-02-20',
      estimatedCompletion: '2024-03-20',
      checklist: [
        { task: '提交离职申请', status: 'completed', completedBy: '张三', completedDate: '2024-02-20' },
        { task: '离职面谈', status: 'completed', completedBy: '张HR', completedDate: '2024-02-21' },
        { task: '工作交接', status: 'in_progress', completedBy: '张三', completedDate: '-' },
        { task: '资产归还', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '权限关闭', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '办理离职手续', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发送离职证明', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 2,
      employeeId: 'EMP005',
      employeeName: '陈小华',
      gender: '女',
      phone: '139****5678',
      email: 'chenxh@example.com',
      department: '市场部',
      position: '市场专员',
      level: 'P4',
      manager: '李经理',
      lastWorkDate: '2024-02-28',
      resignationType: '公司原因',
      status: '待审批',
      currentStep: '-',
      progress: 10,
      initiator: '陈小华',
      initiatorDate: '2024-02-18',
      estimatedCompletion: '2024-03-05',
      checklist: [
        { task: '提交离职申请', status: 'completed', completedBy: '陈小华', completedDate: '2024-02-18' },
        { task: '离职面谈', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '工作交接', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '资产归还', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '权限关闭', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '办理离职手续', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发送离职证明', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 3,
      employeeId: 'EMP008',
      employeeName: '赵六',
      gender: '男',
      phone: '136****9012',
      email: 'zhaoliu@example.com',
      department: '技术部',
      position: '后端工程师',
      level: 'P5',
      manager: '张三',
      lastWorkDate: '2024-02-20',
      resignationType: '个人原因',
      status: '已完成',
      currentStep: '已完成',
      progress: 100,
      initiator: '赵六',
      initiatorDate: '2024-02-10',
      estimatedCompletion: '2024-02-20',
      checklist: [
        { task: '提交离职申请', status: 'completed', completedBy: '赵六', completedDate: '2024-02-10' },
        { task: '离职面谈', status: 'completed', completedBy: '张HR', completedDate: '2024-02-11' },
        { task: '工作交接', status: 'completed', completedBy: '赵六', completedDate: '2024-02-15' },
        { task: '资产归还', status: 'completed', completedBy: '行政部', completedDate: '2024-02-18' },
        { task: '权限关闭', status: 'completed', completedBy: 'IT部', completedDate: '2024-02-19' },
        { task: '办理离职手续', status: 'completed', completedBy: '张HR', completedDate: '2024-02-20' },
        { task: '发送离职证明', status: 'completed', completedBy: '张HR', completedDate: '2024-02-20' },
      ],
    },
  ];

  // 统计数据
  const stats = [
    {
      label: '进行中',
      value: '2',
      unit: '人',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '待审批',
      value: '1',
      unit: '人',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: '已完成',
      value: '8',
      unit: '人',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '本月离职',
      value: '3',
      unit: '人',
      icon: LogOut,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '进行中':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '待审批':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">离职流程</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理员工离职流程，包括离职申请、工作交接、资产归还等
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            发起离职流程
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <div className={cn('rounded-lg p-2', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.unit && <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 离职流程列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>离职流程列表</CardTitle>
              <CardDescription>
                共 {offboardingWorkflows.length} 个离职流程
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工信息</TableHead>
                <TableHead>部门/职位</TableHead>
                <TableHead>最后工作日</TableHead>
                <TableHead>离职原因</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>当前步骤</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offboardingWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{workflow.employeeName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{workflow.employeeName}</div>
                        <div className="text-sm text-gray-500">{workflow.gender}</div>
                        <div className="text-xs text-gray-400">{workflow.employeeId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workflow.department}</div>
                      <div className="text-sm text-gray-500">{workflow.position} · {workflow.level}</div>
                      <div className="text-xs text-gray-400">主管：{workflow.manager}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {workflow.lastWorkDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workflow.resignationType === '公司原因' ? 'destructive' : 'secondary'}>
                      {workflow.resignationType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={workflow.progress} className="h-2" />
                      <div className="text-xs text-gray-500">{workflow.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{workflow.currentStep}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 流程步骤说明 */}
      <Card>
        <CardHeader>
          <CardTitle>离职流程步骤</CardTitle>
          <CardDescription>
            标准离职流程包含以下7个步骤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, icon: FileText, title: '提交离职申请', description: '员工提交离职申请，说明离职原因和最后工作日' },
              { step: 2, icon: MessageSquare, title: '离职面谈', description: 'HR与员工进行离职面谈，了解离职原因和建议' },
              { step: 3, icon: ClipboardCheck, title: '工作交接', description: '员工完成工作交接，确保工作平稳过渡' },
              { step: 4, icon: Laptop, title: '资产归还', description: '归还公司设备、证件等资产' },
              { step: 5, icon: Archive, title: '权限关闭', description: '关闭公司系统、邮箱等权限' },
              { step: 6, icon: CheckCircle2, title: '办理离职手续', description: '签署离职文件，办理离职手续' },
              { step: 7, icon: Download, title: '发送离职证明', description: '发送离职证明和离职相关文件' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{item.title}</div>
                      <Badge variant="secondary">{item.step}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
