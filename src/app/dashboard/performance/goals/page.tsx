'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Target,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  TrendingUp,
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react';

interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  title: string;
  description: string;
  period: string;
  weight: number;
  target: string;
  currentProgress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  deadline: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'pending' | 'completed' | 'overdue';
}

export default function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Goal['status']>('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    description: '',
    period: '2024-Q1',
    weight: 50,
    target: '',
    deadline: '',
  });

  // 获取目标列表
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance/goals?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setGoals(data.data || []);
      }
    } catch (error) {
      console.error('获取目标列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建目标
  const createGoal = async () => {
    try {
      const response = await fetch('/api/performance/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: 'demo-company',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchGoals();
      }
    } catch (error) {
      console.error('创建目标失败:', error);
    }
  };

  // 更新目标
  const updateGoal = async () => {
    if (!editingGoal) return;

    try {
      const response = await fetch(`/api/performance/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchGoals();
      }
    } catch (error) {
      console.error('更新目标失败:', error);
    }
  };

  // 删除目标
  const deleteGoal = async (id: string) => {
    if (!confirm('确定要删除这个目标吗？')) return;

    try {
      const response = await fetch(`/api/performance/goals/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchGoals();
      }
    } catch (error) {
      console.error('删除目标失败:', error);
    }
  };

  // AI生成目标建议
  const generateGoals = async (employeeId: string) => {
    try {
      const response = await fetch('/api/ai/goal-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      const data = await response.json();
      if (data.success) {
        alert('AI已生成目标建议，请查看详情');
        // 这里应该打开一个对话框显示AI生成的建议
      }
    } catch (error) {
      console.error('AI生成目标建议失败:', error);
    }
  };

  // 打开编辑对话框
  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description,
      period: goal.period,
      weight: goal.weight,
      target: goal.target,
      deadline: goal.deadline.split('T')[0],
    });
    setDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      employeeId: '',
      title: '',
      description: '',
      period: '2024-Q1',
      weight: 50,
      target: '',
      deadline: '',
    });
    setEditingGoal(null);
  };

  // 获取状态徽章
  const getStatusBadge = (status: Goal['status']) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      'in-progress': 'default',
      completed: 'default',
      cancelled: 'outline',
    };
    const labels: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 计算进度
  const calculateProgress = (goal: Goal) => {
    const totalMilestones = goal.milestones.length;
    if (totalMilestones === 0) return goal.currentProgress;

    const completedMilestones = goal.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  // 过滤目标
  const filteredGoals = goals.filter(goal => {
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || goal.period === periodFilter;
    return matchesStatus && matchesPeriod;
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">目标设定</h1>
          <p className="text-muted-foreground mt-1">
            设定和管理员工绩效目标
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加目标
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGoal ? '编辑目标' : '添加目标'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? '编辑目标信息' : '为员工设定新的绩效目标'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee">员工 *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择员工" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp-1">张三</SelectItem>
                    <SelectItem value="emp-2">李四</SelectItem>
                    <SelectItem value="emp-3">王五</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">目标标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：完成前端框架重构"
                />
              </div>

              <div>
                <Label htmlFor="description">目标描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="详细描述目标内容、预期结果等"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period">周期 *</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-Q1">2024年第一季度</SelectItem>
                      <SelectItem value="2024-Q2">2024年第二季度</SelectItem>
                      <SelectItem value="2024-Q3">2024年第三季度</SelectItem>
                      <SelectItem value="2024-Q4">2024年第四季度</SelectItem>
                      <SelectItem value="2024-H1">2024年上半年</SelectItem>
                      <SelectItem value="2024-H2">2024年下半年</SelectItem>
                      <SelectItem value="2024">2024全年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">权重 (%) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="target">完成标准 *</Label>
                <Textarea
                  id="target"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="描述目标完成的具体标准和衡量指标"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="deadline">截止日期 *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingGoal ? updateGoal : createGoal}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {editingGoal ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总目标数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均完成率</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.length > 0
                ? Math.round(goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>目标列表</CardTitle>
            <div className="flex gap-2">
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部周期</SelectItem>
                  <SelectItem value="2024-Q1">2024-Q1</SelectItem>
                  <SelectItem value="2024-Q2">2024-Q2</SelectItem>
                  <SelectItem value="2024-Q3">2024-Q3</SelectItem>
                  <SelectItem value="2024-Q4">2024-Q4</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待开始</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工</TableHead>
                <TableHead>目标标题</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>权重</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>截止日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredGoals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无目标
                  </TableCell>
                </TableRow>
              ) : (
                filteredGoals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{goal.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{goal.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {goal.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{goal.period}</Badge>
                    </TableCell>
                    <TableCell>{goal.weight}%</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{calculateProgress(goal)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${calculateProgress(goal)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(goal.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
