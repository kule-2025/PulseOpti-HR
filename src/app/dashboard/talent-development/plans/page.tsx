'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Award,
  Plus,
  Edit,
  Eye,
  Filter,
  Download,
  ArrowRight,
  BookOpen,
  Briefcase,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface DevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  level: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  goals: DevelopmentGoal[];
  mentor?: string;
  mentorId?: string;
  note: string;
}

interface DevelopmentGoal {
  id: string;
  title: string;
  category: 'skill' | 'knowledge' | 'behavior' | 'career';
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  actions: DevelopmentAction[];
  resources: string[];
  competencyGap?: string;
}

interface DevelopmentAction {
  id: string;
  title: string;
  type: 'training' | 'project' | 'assignment' | 'mentoring' | 'self-study';
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completionDate?: string;
  result?: string;
}

interface ExtendedAction extends DevelopmentAction {
  employeeName: string;
  goalTitle: string;
  department: string;
}

export default function DevelopmentPlansPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      position: '高级工程师',
      level: 'P7',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      progress: 75,
      mentor: '李总',
      mentorId: 'M001',
      note: '目标晋升为技术专家',
      goals: [
        {
          id: 'g1',
          title: '提升技术架构能力',
          category: 'skill',
          priority: 'high',
          targetDate: '2024-06-30',
          status: 'completed',
          progress: 100,
          competencyGap: '需要掌握分布式系统设计',
          actions: [
            { id: 'a1', title: '参加架构师认证培训', type: 'training', targetDate: '2024-03-31', status: 'completed', completionDate: '2024-04-15', result: '获得认证' },
            { id: 'a2', title: '负责核心系统重构', type: 'project', targetDate: '2024-06-30', status: 'completed', completionDate: '2024-06-20', result: '系统性能提升50%' },
          ],
          resources: ['架构设计课程', '导师辅导'],
        },
        {
          id: 'g2',
          title: '提升团队管理能力',
          category: 'behavior',
          priority: 'medium',
          targetDate: '2024-09-30',
          status: 'in-progress',
          progress: 60,
          actions: [
            { id: 'a3', title: '参加管理培训课程', type: 'training', targetDate: '2024-08-31', status: 'in-progress' },
            { id: 'a4', title: '带领小团队完成项目', type: 'assignment', targetDate: '2024-09-30', status: 'pending' },
          ],
          resources: ['管理课程', '导师指导'],
        },
        {
          id: 'g3',
          title: '拓展业务知识',
          category: 'knowledge',
          priority: 'medium',
          targetDate: '2024-12-31',
          status: 'not-started',
          progress: 0,
          actions: [
            { id: 'a5', title: '参与产品需求评审', type: 'assignment', targetDate: '2024-12-31', status: 'pending' },
          ],
          resources: ['产品文档', '业务培训'],
        },
      ],
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '销售部',
      position: '销售经理',
      level: 'M3',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      status: 'active',
      progress: 60,
      mentor: '王总',
      mentorId: 'M002',
      note: '准备晋升为销售总监',
      goals: [
        {
          id: 'g4',
          title: '提升战略规划能力',
          category: 'career',
          priority: 'high',
          targetDate: '2024-08-31',
          status: 'in-progress',
          progress: 70,
          actions: [
            { id: 'a6', title: '参加战略规划培训', type: 'training', targetDate: '2024-06-30', status: 'completed', completionDate: '2024-07-01', result: '完成培训' },
            { id: 'a7', title: '制定年度销售战略', type: 'assignment', targetDate: '2024-08-31', status: 'in-progress' },
          ],
          resources: ['战略课程', '导师辅导'],
        },
      ],
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: '王五',
      department: '产品部',
      position: '产品经理',
      level: 'P5',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      status: 'active',
      progress: 30,
      mentor: '张总',
      mentorId: 'M003',
      note: '目标晋升为高级产品经理',
      goals: [
        {
          id: 'g5',
          title: '提升数据分析能力',
          category: 'skill',
          priority: 'high',
          targetDate: '2024-12-31',
          status: 'in-progress',
          progress: 40,
          actions: [
            { id: 'a8', title: '学习数据分析课程', type: 'training', targetDate: '2024-09-30', status: 'completed', completionDate: '2024-10-01', result: '完成课程' },
            { id: 'a9', title: '完成数据驱动产品优化项目', type: 'project', targetDate: '2024-12-31', status: 'in-progress' },
          ],
          resources: ['数据分析课程', '导师指导'],
        },
      ],
    },
  ]);

  const [planFormData, setPlanFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    mentor: '',
    note: '',
  });

  const stats = {
    totalPlans: developmentPlans.length,
    activePlans: developmentPlans.filter(p => p.status === 'active').length,
    completedPlans: developmentPlans.filter(p => p.status === 'completed').length,
    totalGoals: developmentPlans.reduce((sum, p) => sum + p.goals.length, 0),
    completedGoals: developmentPlans.reduce(
      (sum, p) => sum + p.goals.filter(g => g.status === 'completed').length,
      0
    ),
    avgProgress: Math.round(
      developmentPlans.reduce((sum, p) => sum + p.progress, 0) / developmentPlans.length
    ),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { label: '进行中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      paused: { label: '已暂停', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      cancelled: { label: '已取消', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      'not-started': { label: '未开始', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      'in-progress': { label: '进行中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      delayed: { label: '已延期', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      high: { label: '高', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      medium: { label: '中', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      low: { label: '低', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    };
    const variant = variants[priority];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      skill: Zap,
      knowledge: BookOpen,
      behavior: Star,
      career: Briefcase,
    };
    return icons[category] || Target;
  };

  const handleCreatePlan = () => {
    if (!planFormData.employeeId) {
      toast.error('请选择员工');
      return;
    }

    const newPlan: DevelopmentPlan = {
      id: Date.now().toString(),
      employeeId: planFormData.employeeId,
      employeeName: '新员工',
      department: '',
      position: '',
      level: '',
      startDate: planFormData.startDate,
      endDate: planFormData.endDate,
      status: 'active',
      progress: 0,
      mentor: planFormData.mentor,
      note: planFormData.note,
      goals: [],
    };

    setDevelopmentPlans([...developmentPlans, newPlan]);
    setShowCreateDialog(false);
    setPlanFormData({
      employeeId: '',
      startDate: '',
      endDate: '',
      mentor: '',
      note: '',
    });
    toast.success('发展计划创建成功');
  };

  const filteredPlans = developmentPlans.filter(plan => {
    const matchesDepartment = selectedDepartment === 'all' || plan.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    return matchesDepartment && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              发展计划
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              制定员工个人发展计划，助力人才成长
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出计划
            </Button>
            <Button className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              创建计划
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">计划总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlans}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Target className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activePlans}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedPlans}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">发展目标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalGoals}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Target className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">目标完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.completedGoals}</div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                {((stats.completedGoals / stats.totalGoals) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.avgProgress}%</div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                整体进度
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              发展计划
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              目标管理
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              行动跟踪
            </TabsTrigger>
          </TabsList>

          {/* 发展计划列表 */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>发展计划列表</CardTitle>
                    <CardDescription>查看和管理所有员工发展计划</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="技术部">技术部</SelectItem>
                        <SelectItem value="产品部">产品部</SelectItem>
                        <SelectItem value="销售部">销售部</SelectItem>
                        <SelectItem value="市场部">市场部</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="active">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="paused">已暂停</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPlans.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-md transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-green-500 text-white">
                                {plan.employeeName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.employeeName}</h3>
                                {getStatusBadge(plan.status)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>{plan.department}</span>
                                <span>·</span>
                                <span>{plan.position}</span>
                                <span>·</span>
                                <span>{plan.level}</span>
                              </div>
                              {plan.mentor && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  导师：{plan.mentor}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">总体进度</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                plan.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">开始时间</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{plan.startDate}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">结束时间</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{plan.endDate}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">发展目标</span>
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">{plan.goals.length}个</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">已完成</span>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {plan.goals.filter(g => g.status === 'completed').length}个
                            </div>
                          </div>
                        </div>
                        {plan.note && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              <Star className="h-3 w-3 inline mr-1" />
                              目标：{plan.note}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 目标管理 */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>发展目标汇总</CardTitle>
                <CardDescription>所有发展目标的完成情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {developmentPlans.flatMap(plan =>
                    plan.goals.map(goal => ({
                      ...goal,
                      employeeName: plan.employeeName,
                      department: plan.department,
                      position: plan.position,
                    }))
                  ).map((goal, idx) => {
                    const CategoryIcon = getCategoryIcon(goal.category);
                    return (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                                    {getPriorityBadge(goal.priority)}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {goal.employeeName} · {goal.department}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(goal.status)}
                                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                    {goal.progress}%
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    goal.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>目标日期: {goal.targetDate}</span>
                                <span>{goal.actions.length} 个行动项</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 行动跟踪 */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>行动项跟踪</CardTitle>
                <CardDescription>所有发展行动的执行情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>发展目标</TableHead>
                        <TableHead>行动项</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>目标日期</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>结果</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const allActions: ExtendedAction[] = [];
                        developmentPlans.forEach(plan => {
                          plan.goals.forEach(goal => {
                            goal.actions.forEach(action => {
                              allActions.push({
                                ...action,
                                employeeName: plan.employeeName,
                                goalTitle: goal.title,
                                department: plan.department,
                              });
                            });
                          });
                        });
                        return allActions.map((action, idx) => {
                          const typeLabels: Record<string, string> = {
                            training: '培训',
                            project: '项目',
                            assignment: '任务',
                            mentoring: '辅导',
                            'self-study': '自学',
                          };
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <div className="font-medium">{action.employeeName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{action.department}</div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate">{action.goalTitle}</div>
                              </TableCell>
                              <TableCell>{action.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{typeLabels[action.type]}</Badge>
                              </TableCell>
                              <TableCell>{action.targetDate}</TableCell>
                              <TableCell>{getStatusBadge(action.status)}</TableCell>
                              <TableCell>
                                {action.result || <span className="text-gray-400">-</span>}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建计划对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建发展计划</DialogTitle>
              <DialogDescription>
                为员工制定个人发展计划
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">选择员工 *</Label>
                <Select value={planFormData.employeeId} onValueChange={(v) => setPlanFormData({ ...planFormData, employeeId: v })}>
                  <SelectTrigger id="employeeId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">张三 - 技术部</SelectItem>
                    <SelectItem value="EMP002">李四 - 销售部</SelectItem>
                    <SelectItem value="EMP003">王五 - 产品部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={planFormData.startDate}
                  onChange={(e) => setPlanFormData({ ...planFormData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={planFormData.endDate}
                  onChange={(e) => setPlanFormData({ ...planFormData, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentor">导师</Label>
                <Input
                  id="mentor"
                  value={planFormData.mentor}
                  onChange={(e) => setPlanFormData({ ...planFormData, mentor: e.target.value })}
                  placeholder="选择或输入导师姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">计划说明</Label>
                <Textarea
                  id="note"
                  value={planFormData.note}
                  onChange={(e) => setPlanFormData({ ...planFormData, note: e.target.value })}
                  placeholder="描述发展目标、职业规划等..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
              <Button onClick={handleCreatePlan}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
