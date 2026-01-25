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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Star,
  Award,
  Search,
  Filter,
  Eye,
  Edit3,
  Plus,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function PromotionContent() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  // 晋升流程数据
  const promotionWorkflows = [
    {
      id: 1,
      employeeId: 'EMP002',
      employeeName: '李四',
      gender: '男',
      phone: '139****1234',
      email: 'lisi@example.com',
      department: '技术部',
      currentPosition: '后端工程师',
      currentLevel: 'P5',
      targetPosition: '高级后端工程师',
      targetLevel: 'P6',
      manager: '张三',
      effectiveDate: '2024-03-01',
      status: '进行中',
      currentStep: '审批中',
      progress: 60,
      initiator: '张三',
      initiatorDate: '2024-02-15',
      estimatedCompletion: '2024-02-28',
      reasons: [
        '技术能力突出，主导完成多个重要项目',
        '团队协作能力强，善于带领新人',
        '工作认真负责，质量意识强',
      ],
      checklist: [
        { task: '提交晋升申请', status: 'completed', completedBy: '张三', completedDate: '2024-02-15' },
        { task: '能力评估', status: 'completed', completedBy: 'HRBP', completedDate: '2024-02-18' },
        { task: '部门审批', status: 'completed', completedBy: '张三', completedDate: '2024-02-19' },
        { task: 'HR审批', status: 'in_progress', completedBy: '-', completedDate: '-' },
        { task: '总经理审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '薪资调整', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发布晋升通知', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 2,
      employeeId: 'EMP004',
      employeeName: '赵六',
      gender: '女',
      phone: '136****5678',
      email: 'zhaoliu@example.com',
      department: '产品部',
      currentPosition: '产品专员',
      currentLevel: 'P4',
      targetPosition: '产品经理',
      targetLevel: 'P6',
      manager: '王芳',
      effectiveDate: '2024-03-15',
      status: '待审批',
      currentStep: '-',
      progress: 30,
      initiator: '王芳',
      initiatorDate: '2024-02-18',
      estimatedCompletion: '2024-03-10',
      reasons: [
        '产品思维清晰，需求分析能力强',
        '独立负责多个产品模块',
        '用户反馈良好，满意度高',
      ],
      checklist: [
        { task: '提交晋升申请', status: 'completed', completedBy: '王芳', completedDate: '2024-02-18' },
        { task: '能力评估', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '部门审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: 'HR审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '总经理审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '薪资调整', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发布晋升通知', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: '王五',
      gender: '男',
      phone: '135****9012',
      email: 'wangwu@example.com',
      department: '销售部',
      currentPosition: '销售专员',
      currentLevel: 'P4',
      targetPosition: '销售主管',
      targetLevel: 'M1',
      manager: '赵六',
      effectiveDate: '2024-02-20',
      status: '已完成',
      currentStep: '已完成',
      progress: 100,
      initiator: '赵六',
      initiatorDate: '2024-02-10',
      estimatedCompletion: '2024-02-20',
      reasons: [
        '销售业绩优秀，连续3季度超额完成目标',
        '团队管理能力强，培养2名优秀新人',
        '客户关系维护良好，口碑优异',
      ],
      checklist: [
        { task: '提交晋升申请', status: 'completed', completedBy: '赵六', completedDate: '2024-02-10' },
        { task: '能力评估', status: 'completed', completedBy: 'HRBP', completedDate: '2024-02-12' },
        { task: '部门审批', status: 'completed', completedBy: '赵六', completedDate: '2024-02-13' },
        { task: 'HR审批', status: 'completed', completedBy: 'HR总监', completedDate: '2024-02-15' },
        { task: '总经理审批', status: 'completed', completedBy: '总经理', completedDate: '2024-02-17' },
        { task: '薪资调整', status: 'completed', completedBy: '薪酬部', completedDate: '2024-02-19' },
        { task: '发布晋升通知', status: 'completed', completedBy: '人力资源', completedDate: '2024-02-20' },
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
      value: '5',
      unit: '人',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '本月晋升',
      value: '3',
      unit: '人',
      icon: TrendingUp,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">晋升流程</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理员工晋升流程，包括能力评估、审批、薪资调整等
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            查找
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            发起晋升流程
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

      {/* 晋升流程列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>晋升流程列表</CardTitle>
              <CardDescription>
                共 {promotionWorkflows.length} 个晋升流程
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
                <TableHead>晋升方向</TableHead>
                <TableHead>生效日期</TableHead>
                <TableHead>晋升理由</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>当前步骤</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotionWorkflows.map((workflow) => (
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
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{workflow.currentLevel}</span>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">{workflow.targetLevel}</span>
                      </div>
                      <div className="text-sm text-gray-500">{workflow.currentPosition} → {workflow.targetPosition}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {workflow.effectiveDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      {workflow.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="text-sm text-gray-600 truncate">
                          • {reason}
                        </div>
                      ))}
                      {workflow.reasons.length > 2 && (
                        <div className="text-xs text-gray-400">+{workflow.reasons.length - 2} 更多</div>
                      )}
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
          <CardTitle>晋升流程步骤</CardTitle>
          <CardDescription>
            标准晋升流程包含以下7个步骤
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, icon: FileText, title: '提交晋升申请', description: '主管提交员工晋升申请，说明晋升理由' },
              { step: 2, icon: Star, title: '能力评估', description: 'HRBP和部门进行综合能力评估' },
              { step: 3, icon: CheckCircle2, title: '部门审批', description: '部门负责人审核晋升申请' },
              { step: 4, icon: Award, title: 'HR审批', description: 'HR部门审核并给出意见' },
              { step: 5, icon: TrendingUp, title: '总经理审批', description: '总经理最终审批晋升申请' },
              { step: 6, icon: Calendar, title: '薪资调整', description: '薪酬部门根据晋升调整薪资' },
              { step: 7, icon: Send, title: '发布晋升通知', description: '发布晋升通知，正式生效' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
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
