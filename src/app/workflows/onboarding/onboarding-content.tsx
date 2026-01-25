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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  CreditCard,
  Laptop,
  Wifi,
  Coffee,
  Search,
  Filter,
  Eye,
  Edit3,
  Download,
  Plus,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function OnboardingContent() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);

  // 入职流程数据
  const onboardingWorkflows = [
    {
      id: 1,
      employeeId: 'EMP010',
      employeeName: '张小明',
      gender: '男',
      age: 26,
      phone: '138****1234',
      email: 'zhangxm@example.com',
      department: '技术部',
      position: '前端工程师',
      level: 'P5',
      manager: '张三',
      startDate: '2024-03-01',
      status: '进行中',
      currentStep: '入职材料提交',
      progress: 40,
      initiator: '张HR',
      initiatorDate: '2024-02-20',
      estimatedCompletion: '2024-02-28',
      checklist: [
        { task: '确认入职意向', status: 'completed', completedBy: '张HR', completedDate: '2024-02-20' },
        { task: '发送入职offer', status: 'completed', completedBy: '张HR', completedDate: '2024-02-21' },
        { task: '提交入职材料', status: 'in_progress', completedBy: '-', completedDate: '-' },
        { task: '背景调查', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '工位设备准备', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '入职培训安排', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '系统账号开通', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '办理入职手续', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 2,
      employeeId: 'EMP011',
      employeeName: '李小红',
      gender: '女',
      age: 25,
      phone: '139****5678',
      email: 'lixh@example.com',
      department: '产品部',
      position: '产品经理',
      level: 'P6',
      manager: '王芳',
      startDate: '2024-03-05',
      status: '待开始',
      currentStep: '-',
      progress: 0,
      initiator: '张HR',
      initiatorDate: '2024-02-18',
      estimatedCompletion: '2024-03-03',
      checklist: [
        { task: '确认入职意向', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发送入职offer', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '提交入职材料', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '背景调查', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '工位设备准备', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '入职培训安排', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '系统账号开通', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '办理入职手续', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 3,
      employeeId: 'EMP012',
      employeeName: '王小伟',
      gender: '男',
      age: 28,
      phone: '136****9012',
      email: 'wangxw@example.com',
      department: '销售部',
      position: '销售经理',
      level: 'M2',
      manager: '赵六',
      startDate: '2024-02-25',
      status: '已完成',
      currentStep: '已完成',
      progress: 100,
      initiator: '张HR',
      initiatorDate: '2024-02-10',
      estimatedCompletion: '2024-02-24',
      checklist: [
        { task: '确认入职意向', status: 'completed', completedBy: '张HR', completedDate: '2024-02-10' },
        { task: '发送入职offer', status: 'completed', completedBy: '张HR', completedDate: '2024-02-11' },
        { task: '提交入职材料', status: 'completed', completedBy: '王小伟', completedDate: '2024-02-15' },
        { task: '背景调查', status: 'completed', completedBy: '张HR', completedDate: '2024-02-16' },
        { task: '工位设备准备', status: 'completed', completedBy: '行政部', completedDate: '2024-02-20' },
        { task: '入职培训安排', status: 'completed', completedBy: '张HR', completedDate: '2024-02-21' },
        { task: '系统账号开通', status: 'completed', completedBy: 'IT部', completedDate: '2024-02-23' },
        { task: '办理入职手续', status: 'completed', completedBy: '张HR', completedDate: '2024-02-24' },
      ],
    },
  ];

  // 统计数据
  const stats = [
    {
      label: '进行中',
      value: '3',
      unit: '人',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '待开始',
      value: '2',
      unit: '人',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: '已完成',
      value: '15',
      unit: '人',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '本月入职',
      value: '5',
      unit: '人',
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '进行中':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '待开始':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">入职流程</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理新员工入职流程，包括材料提交、背景调查、设备准备等
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                发起入职流程
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>发起入职流程</DialogTitle>
                <DialogDescription>
                  为新员工发起入职准备工作流程
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-name">员工姓名 *</Label>
                  <Input id="employee-name" placeholder="输入员工姓名" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">性别</Label>
                    <Select>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号 *</Label>
                    <Input id="phone" placeholder="输入手机号" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input id="email" type="email" placeholder="输入邮箱地址" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">入职日期 *</Label>
                    <Input id="start-date" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">部门 *</Label>
                    <Select>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">技术部</SelectItem>
                        <SelectItem value="product">产品部</SelectItem>
                        <SelectItem value="sales">销售部</SelectItem>
                        <SelectItem value="hr">人力资源</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">职位 *</Label>
                    <Input id="position" placeholder="输入职位名称" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">直属主管</Label>
                  <Input id="manager" placeholder="输入直属主管姓名" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
                  取消
                </Button>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  发起流程
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* 入职流程列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>入职流程列表</CardTitle>
              <CardDescription>
                共 {onboardingWorkflows.length} 个入职流程
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待开始</SelectItem>
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
                <TableHead>入职日期</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>当前步骤</TableHead>
                <TableHead>预计完成</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {onboardingWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{workflow.employeeName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{workflow.employeeName}</div>
                        <div className="text-sm text-gray-500">{workflow.gender} · {workflow.age}岁</div>
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
                      {workflow.startDate}
                    </div>
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
                    <div className="text-sm text-gray-500">
                      {workflow.estimatedCompletion}
                    </div>
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
                      <Button variant="ghost" size="icon">
                        <Edit3 className="h-4 w-4" />
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
          <CardTitle>入职流程步骤</CardTitle>
          <CardDescription>
            标准入职流程包含以下8个步骤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, icon: UserPlus, title: '确认入职意向', description: '与候选人确认入职意向和入职时间' },
              { step: 2, icon: Send, title: '发送入职offer', description: '发送正式入职offer和入职指引' },
              { step: 3, icon: FileText, title: '提交入职材料', description: '候选人提交身份证、学历等材料' },
              { step: 4, icon: Search, title: '背景调查', description: '进行必要的背景调查和核实' },
              { step: 5, icon: Laptop, title: '工位设备准备', description: '准备工位、电脑等办公设备' },
              { step: 6, icon: GraduationCap, title: '入职培训安排', description: '安排入职培训和相关学习' },
              { step: 7, icon: Wifi, title: '系统账号开通', description: '开通公司系统、邮箱等账号' },
              { step: 8, icon: CheckCircle2, title: '办理入职手续', description: '签署劳动合同，正式办理入职' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
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
