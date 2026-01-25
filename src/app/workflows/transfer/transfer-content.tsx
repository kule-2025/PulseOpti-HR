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
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  Briefcase,
  Search,
  Filter,
  Eye,
  Edit3,
  Plus,
  Send,
  MapPin,
  User,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function TransferContent() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  // 转岗流程数据
  const transferWorkflows = [
    {
      id: 1,
      employeeId: 'EMP003',
      employeeName: '王五',
      gender: '男',
      phone: '137****1234',
      email: 'wangwu@example.com',
      currentDepartment: '技术部',
      currentPosition: '前端工程师',
      currentLevel: 'P5',
      targetDepartment: '产品部',
      targetPosition: '产品专员',
      targetLevel: 'P5',
      currentManager: '张三',
      targetManager: '王芳',
      transferDate: '2024-03-01',
      status: '进行中',
      currentStep: '接收部门审批',
      progress: 60,
      initiator: '王五',
      initiatorDate: '2024-02-18',
      estimatedCompletion: '2024-02-28',
      reasons: [
        '希望从技术开发转向产品设计，发挥个人优势',
        '有产品思维，对产品设计有浓厚兴趣',
        '在产品部有实习经历，了解业务流程',
      ],
      checklist: [
        { task: '提交转岗申请', status: 'completed', completedBy: '王五', completedDate: '2024-02-18' },
        { task: '当前部门审批', status: 'completed', completedBy: '张三', completedDate: '2024-02-19' },
        { task: '接收部门面试', status: 'completed', completedBy: '王芳', completedDate: '2024-02-20' },
        { task: '接收部门审批', status: 'in_progress', completedBy: '-', completedDate: '-' },
        { task: 'HRBP评估', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '工作交接', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '系统权限调整', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发布转岗通知', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 2,
      employeeId: 'EMP006',
      employeeName: '刘小红',
      gender: '女',
      phone: '135****5678',
      email: 'liuxh@example.com',
      currentDepartment: '市场部',
      currentPosition: '市场专员',
      currentLevel: 'P4',
      targetDepartment: '销售部',
      targetPosition: '销售主管',
      targetLevel: 'M1',
      currentManager: '李经理',
      targetManager: '赵总监',
      transferDate: '2024-03-10',
      status: '待审批',
      currentStep: '-',
      progress: 20,
      initiator: '刘小红',
      initiatorDate: '2024-02-20',
      estimatedCompletion: '2024-03-08',
      reasons: [
        '在市场部积累了丰富的客户资源',
        '希望挑战销售工作，提升业绩',
        '沟通能力强，适合销售岗位',
      ],
      checklist: [
        { task: '提交转岗申请', status: 'completed', completedBy: '刘小红', completedDate: '2024-02-20' },
        { task: '当前部门审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '接收部门面试', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '接收部门审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: 'HRBP评估', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '工作交接', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '系统权限调整', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发布转岗通知', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      '进行中': { label: '进行中', variant: 'default' },
      '待审批': { label: '待审批', variant: 'secondary' },
      '已完成': { label: '已完成', variant: 'default' },
      '已拒绝': { label: '已拒绝', variant: 'destructive' },
    };
    const s = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={s.variant as any}>{s.label}</Badge>;
  };

  const filteredWorkflows = selectedStatus === 'all'
    ? transferWorkflows
    : transferWorkflows.filter((item: any) => w => w.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            员工转岗管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            管理员工内部转岗流程，包括申请、审批、交接等环节
          </p>
        </div>
        <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              发起转岗
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>发起员工转岗</DialogTitle>
              <DialogDescription>
                填写员工转岗申请信息，提交审批流程
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">员工</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择员工" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp003">王五 - 前端工程师</SelectItem>
                      <SelectItem value="emp006">刘小红 - 市场专员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferDate">生效日期</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentDept">当前部门</Label>
                  <Input id="currentDept" value="技术部" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPosition">当前岗位</Label>
                  <Input id="currentPosition" value="前端工程师" disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetDept">目标部门</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标部门" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">产品部</SelectItem>
                      <SelectItem value="sales">销售部</SelectItem>
                      <SelectItem value="hr">人力资源部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetPosition">目标岗位</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标岗位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-specialist">产品专员</SelectItem>
                      <SelectItem value="product-manager">产品经理</SelectItem>
                      <SelectItem value="product-director">产品总监</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">转岗原因</Label>
                <Textarea
                  id="reason"
                  placeholder="请详细说明转岗原因"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInitiateDialogOpen(false)}>
                取消
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                提交申请
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总转岗数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">本月新增 3 个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">平均进度 65%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">需尽快处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">成功率 92%</p>
          </CardContent>
        </Card>
      </div>

      {/* 转岗列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>转岗列表</CardTitle>
              <CardDescription>所有员工的转岗申请和流程状态</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="待审批">待审批</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已拒绝">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工信息</TableHead>
                <TableHead>当前岗位</TableHead>
                <TableHead>目标岗位</TableHead>
                <TableHead>转岗日期</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>当前步骤</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {workflow.employeeName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{workflow.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{workflow.employeeId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workflow.currentPosition}</div>
                      <div className="text-sm text-muted-foreground">{workflow.currentDepartment}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div>
                        <div className="font-medium">{workflow.targetPosition}</div>
                        <div className="text-sm text-muted-foreground">{workflow.targetDepartment}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{workflow.transferDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={workflow.progress} className="w-[80px]" />
                      <span className="text-sm text-muted-foreground">{workflow.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{workflow.currentStep}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(workflow.status)}
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
    </div>
  );
}
