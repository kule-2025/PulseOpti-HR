'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Target,
  Plus,
  Search,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  User,
  Building,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type PlanStatus = 'draft' | 'active' | 'completed' | 'paused';
type PlanType = 'career' | 'skill' | 'leadership' | 'custom';

interface DevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  title: string;
  type: PlanType;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  objectives: string[];
  currentStage: string;
  progress: number;
  mentor: string;
  budget: number;
  description: string;
  createdBy: string;
  createdAt: string;
}

export default function DevelopmentPlansPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newPlan, setNewPlan] = useState({
    employeeName: '',
    department: '',
    position: '',
    title: '',
    type: 'career' as PlanType,
    startDate: '',
    endDate: '',
    mentor: '',
    budget: '',
    description: '',
    objectives: [''],
  });

  useEffect(() => {
    // 模拟获取发展计划数据
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          title: '前端技术专家培养计划',
          type: 'skill',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          objectives: [
            '掌握React高级特性',
            '学习性能优化技巧',
            '完成3个技术分享',
          ],
          currentStage: '学习React Server Components',
          progress: 45,
          mentor: '李技术总监',
          budget: 5000,
          description: '培养成为团队技术骨干',
          createdBy: 'HR BP',
          createdAt: '2024-01-01T10:00:00',
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          title: '产品负责人发展计划',
          type: 'leadership',
          status: 'active',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          objectives: [
            '学习战略规划方法',
            '提升团队管理能力',
            '成功主导2个大型项目',
          ],
          currentStage: '学习战略规划',
          progress: 35,
          mentor: '王产品总监',
          budget: 8000,
          description: '培养成为产品负责人',
          createdBy: 'HR Director',
          createdAt: '2024-02-01T14:30:00',
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          position: '销售代表',
          title: '销售精英成长计划',
          type: 'career',
          status: 'completed',
          startDate: '2023-06-01',
          endDate: '2024-05-31',
          objectives: [
            '完成销售目标100万',
            '开发5个大客户',
            '完成产品知识认证',
          ],
          currentStage: '已完成',
          progress: 100,
          mentor: '赵销售总监',
          budget: 3000,
          description: '培养成为销售精英',
          createdBy: 'HR BP',
          createdAt: '2023-06-01T09:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreatePlan = () => {
    const plan: DevelopmentPlan = {
      id: Date.now().toString(),
      employeeId: 'E' + Date.now().toString().slice(-4),
      employeeName: newPlan.employeeName,
      department: newPlan.department,
      position: newPlan.position,
      title: newPlan.title,
      type: newPlan.type,
      status: 'draft',
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      objectives: newPlan.objectives.filter(obj => obj.trim() !== ''),
      currentStage: '待开始',
      progress: 0,
      mentor: newPlan.mentor,
      budget: parseFloat(newPlan.budget) || 0,
      description: newPlan.description,
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
    };
    setPlans([plan, ...plans]);
    setShowCreatePlan(false);
    toast.success('发展计划已创建');
    setNewPlan({
      employeeName: '',
      department: '',
      position: '',
      title: '',
      type: 'career',
      startDate: '',
      endDate: '',
      mentor: '',
      budget: '',
      description: '',
      objectives: [''],
    });
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeConfig: Record<PlanType, { label: string; color: string; icon: any }> = {
    career: { label: '职业发展', color: 'bg-blue-500', icon: Target },
    skill: { label: '技能提升', color: 'bg-green-500', icon: Award },
    leadership: { label: '领导力', color: 'bg-purple-500', icon: TrendingUp },
    custom: { label: '自定义', color: 'bg-gray-500', icon: Target },
  };

  const statusConfig: Record<PlanStatus, { label: string; color: string; icon: any }> = {
    draft: { label: '草稿', color: 'bg-gray-500', icon: FileText },
    active: { label: '进行中', color: 'bg-green-500', icon: Clock },
    completed: { label: '已完成', color: 'bg-blue-500', icon: CheckCircle },
    paused: { label: '已暂停', color: 'bg-yellow-500', icon: Clock },
  };

  const statistics = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    completed: plans.filter(p => p.status === 'completed').length,
    averageProgress: plans.length > 0 ? plans.reduce((sum, p) => sum + p.progress, 0) / plans.length : 0,
  };

  const addObjective = () => {
    setNewPlan({
      ...newPlan,
      objectives: [...newPlan.objectives, ''],
    });
  };

  const updateObjective = (index: number, value: string) => {
    const updatedObjectives = [...newPlan.objectives];
    updatedObjectives[index] = value;
    setNewPlan({
      ...newPlan,
      objectives: updatedObjectives,
    });
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = newPlan.objectives.filter((_, i) => i !== index);
    setNewPlan({
      ...newPlan,
      objectives: updatedObjectives.length > 0 ? updatedObjectives : [''],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              发展计划
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              制定和管理员工职业发展计划
            </p>
          </div>
          <Button onClick={() => setShowCreatePlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建计划
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总计划数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">平均进度</p>
                  <p className="text-2xl font-bold">{statistics.averageProgress.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索员工姓名或计划名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(typeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 计划列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无发展计划</p>
              <Button className="mt-4" onClick={() => setShowCreatePlan(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建计划
              </Button>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const typeIcon = typeConfig[plan.type].icon;
              const TypeIcon = typeIcon;
              return (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${typeConfig[plan.type].color} text-white border-0 flex items-center gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[plan.type].label}
                          </Badge>
                          <Badge className={statusConfig[plan.status].color + ' text-white border-0'}>
                            {statusConfig[plan.status].label}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{plan.employeeName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.position} · {plan.department}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">完成进度</span>
                          <span className="font-medium">{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              plan.progress >= 80 ? 'bg-green-500' :
                              plan.progress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">当前阶段</span>
                          <p className="font-medium">{plan.currentStage}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">导师</span>
                          <p className="font-medium">{plan.mentor}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">开始日期</span>
                          <p className="font-medium">{plan.startDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">结束日期</span>
                          <p className="font-medium">{plan.endDate}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">发展目标</p>
                        <ul className="space-y-1">
                          {plan.objectives.slice(0, 3).map((obj, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                          {plan.objectives.length > 3 && (
                            <li className="text-sm text-gray-500">
                              还有 {plan.objectives.length - 3} 个目标...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 创建计划弹窗 */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建发展计划</DialogTitle>
            <DialogDescription>
              为员工制定个性化发展计划
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>员工姓名 *</Label>
                <Input
                  placeholder="输入员工姓名"
                  value={newPlan.employeeName}
                  onChange={(e) => setNewPlan({ ...newPlan, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>部门 *</Label>
                <Input
                  placeholder="输入部门"
                  value={newPlan.department}
                  onChange={(e) => setNewPlan({ ...newPlan, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>职位 *</Label>
                <Input
                  placeholder="输入职位"
                  value={newPlan.position}
                  onChange={(e) => setNewPlan({ ...newPlan, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>计划类型 *</Label>
                <Select
                  value={newPlan.type}
                  onValueChange={(v) => setNewPlan({ ...newPlan, type: v as PlanType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>计划标题 *</Label>
              <Input
                placeholder="输入发展计划标题"
                value={newPlan.title}
                onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>计划描述</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="详细描述发展计划的目标和内容..."
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期 *</Label>
                <Input
                  type="date"
                  value={newPlan.startDate}
                  onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>结束日期 *</Label>
                <Input
                  type="date"
                  value={newPlan.endDate}
                  onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>导师</Label>
                <Input
                  placeholder="输入导师姓名"
                  value={newPlan.mentor}
                  onChange={(e) => setNewPlan({ ...newPlan, mentor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>预算 (元)</Label>
                <Input
                  type="number"
                  placeholder="输入培训预算"
                  value={newPlan.budget}
                  onChange={(e) => setNewPlan({ ...newPlan, budget: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>发展目标</Label>
                <Button variant="outline" size="sm" onClick={addObjective}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加目标
                </Button>
              </div>
              <div className="space-y-2">
                {newPlan.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="输入发展目标"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                    />
                    {newPlan.objectives.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeObjective(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlan(false)}>
              取消
            </Button>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              创建计划
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
