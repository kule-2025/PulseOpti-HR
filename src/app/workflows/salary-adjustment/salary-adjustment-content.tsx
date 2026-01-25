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
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Percent,
  Search,
  Filter,
  Eye,
  Edit3,
  Plus,
  Send,
  User,
  Award,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function SalaryAdjustmentContent() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);

  // 调薪流程数据
  const salaryAdjustments = [
    {
      id: 1,
      employeeId: 'EMP002',
      employeeName: '李四',
      gender: '男',
      phone: '139****1234',
      email: 'lisi@example.com',
      department: '技术部',
      position: '后端工程师',
      level: 'P5',
      manager: '张三',
      currentSalary: 18000,
      newSalary: 22000,
      adjustmentType: 'regular', // regular-定期调薪, promotion-晋升调薪, special-特殊调薪
      adjustmentPercent: 22.22,
      effectiveDate: '2024-03-01',
      status: '进行中',
      currentStep: '审批中',
      progress: 60,
      initiator: '张三',
      initiatorDate: '2024-02-15',
      estimatedCompletion: '2024-02-28',
      reasons: [
        '年度绩效评定为优秀（A级）',
        '承担了更多技术领导责任',
        '主导完成核心项目，贡献突出',
      ],
      checklist: [
        { task: '提交调薪申请', status: 'completed', completedBy: '张三', completedDate: '2024-02-15' },
        { task: '绩效数据核实', status: 'completed', completedBy: 'HRBP', completedDate: '2024-02-16' },
        { task: '部门预算审批', status: 'completed', completedBy: '张三', completedDate: '2024-02-18' },
        { task: 'HRBP评估', status: 'completed', completedBy: 'HRBP', completedDate: '2024-02-19' },
        { task: 'HR总监审批', status: 'in_progress', completedBy: '-', completedDate: '-' },
        { task: '总经理审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '薪资调整生效', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发送调薪通知', status: 'pending', completedBy: '-', completedDate: '-' },
      ],
    },
    {
      id: 2,
      employeeId: 'EMP007',
      employeeName: '孙小华',
      gender: '女',
      phone: '136****5678',
      email: 'sunxh@example.com',
      department: '销售部',
      position: '销售主管',
      level: 'M1',
      manager: '赵总监',
      currentSalary: 25000,
      newSalary: 28000,
      adjustmentType: 'promotion',
      adjustmentPercent: 12,
      effectiveDate: '2024-03-15',
      status: '待审批',
      currentStep: '-',
      progress: 20,
      initiator: '赵总监',
      initiatorDate: '2024-02-18',
      estimatedCompletion: '2024-03-10',
      reasons: [
        '晋升为销售经理',
        '带领团队业绩增长30%',
        '开发重要客户资源',
      ],
      checklist: [
        { task: '提交调薪申请', status: 'completed', completedBy: '赵总监', completedDate: '2024-02-18' },
        { task: '绩效数据核实', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '部门预算审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: 'HRBP评估', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: 'HR总监审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '总经理审批', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '薪资调整生效', status: 'pending', completedBy: '-', completedDate: '-' },
        { task: '发送调薪通知', status: 'pending', completedBy: '-', completedDate: '-' },
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

  const getAdjustmentTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: string }> = {
      'regular': { label: '定期调薪', variant: 'default' },
      'promotion': { label: '晋升调薪', variant: 'secondary' },
      'special': { label: '特殊调薪', variant: 'outline' },
    };
    const t = typeMap[type] || { label: type, variant: 'secondary' };
    return <Badge variant={t.variant as any}>{t.label}</Badge>;
  };

  const filteredAdjustments = selectedStatus === 'all'
    ? salaryAdjustments
    : salaryAdjustments.filter((item: any) => a => a.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            薪资调整管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            管理员工薪资调整流程，包括定期调薪、晋升调薪和特殊调薪
          </p>
        </div>
        <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              发起调薪
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>发起薪资调整</DialogTitle>
              <DialogDescription>
                填写员工调薪申请信息，提交审批流程
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
                      <SelectItem value="emp002">李四 - 后端工程师</SelectItem>
                      <SelectItem value="emp007">孙小华 - 销售主管</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">调薪类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择调薪类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">定期调薪</SelectItem>
                      <SelectItem value="promotion">晋升调薪</SelectItem>
                      <SelectItem value="special">特殊调薪</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentSalary">当前薪资</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="currentSalary" className="pl-9" placeholder="0.00" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newSalary">调整后薪资</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="newSalary" className="pl-9" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustmentPercent">调整幅度</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="adjustmentPercent" className="pl-9" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">生效日期</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">调薪原因</Label>
                <Textarea
                  id="reason"
                  placeholder="请详细说明调薪原因和依据"
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
            <CardTitle className="text-sm font-medium">总调薪数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">本月新增 8 个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">平均幅度 15.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">需尽快处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">调薪预算</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥85万</div>
            <p className="text-xs text-muted-foreground">年度预算使用 42%</p>
          </CardContent>
        </Card>
      </div>

      {/* 调薪列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>调薪列表</CardTitle>
              <CardDescription>所有员工的调薪申请和流程状态</CardDescription>
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
                <TableHead>岗位信息</TableHead>
                <TableHead>薪资调整</TableHead>
                <TableHead>调薪类型</TableHead>
                <TableHead>生效日期</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {adjustment.employeeName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{adjustment.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{adjustment.employeeId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adjustment.position}</div>
                      <div className="text-sm text-muted-foreground">{adjustment.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          ¥{adjustment.currentSalary.toLocaleString()}
                        </div>
                        <div className="font-medium">
                          ¥{adjustment.newSalary.toLocaleString()}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm text-green-600 font-medium">
                        +{adjustment.adjustmentPercent}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAdjustmentTypeBadge(adjustment.adjustmentType)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{adjustment.effectiveDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={adjustment.progress} className="w-[80px]" />
                      <span className="text-sm text-muted-foreground">{adjustment.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(adjustment.status)}
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
