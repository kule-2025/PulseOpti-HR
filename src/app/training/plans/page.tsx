'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Play,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'skills' | 'management' | 'compliance';
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  targetEmployees: number;
  enrolledEmployees: number;
  completedEmployees: number;
  courses: number;
  budget: number;
  priority: 'high' | 'medium' | 'low';
}

// 模拟培训计划数据
const TRAINING_PLANS_DATA: TrainingPlan[] = [
  {
    id: '1',
    name: '2025年Q1新员工入职培训',
    description: '为新入职员工提供公司文化、制度、业务流程等全面培训',
    category: 'onboarding',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-01-30',
    targetEmployees: 20,
    enrolledEmployees: 18,
    completedEmployees: 5,
    courses: 8,
    budget: 50000,
    priority: 'high',
  },
  {
    id: '2',
    name: '销售技能提升培训',
    description: '针对销售团队的销售技巧、客户沟通、谈判技巧等培训',
    category: 'skills',
    status: 'active',
    startDate: '2025-01-10',
    endDate: '2025-02-15',
    targetEmployees: 30,
    enrolledEmployees: 28,
    completedEmployees: 10,
    courses: 12,
    budget: 80000,
    priority: 'high',
  },
  {
    id: '3',
    name: '中高层管理干部领导力培训',
    description: '提升管理干部的领导力、决策力、团队管理能力',
    category: 'management',
    status: 'draft',
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    targetEmployees: 15,
    enrolledEmployees: 0,
    completedEmployees: 0,
    courses: 6,
    budget: 120000,
    priority: 'medium',
  },
  {
    id: '4',
    name: '劳动法规合规培训',
    description: '全员劳动法律法规、劳动合同管理、用工风险防范培训',
    category: 'compliance',
    status: 'completed',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    targetEmployees: 100,
    enrolledEmployees: 95,
    completedEmployees: 90,
    courses: 5,
    budget: 30000,
    priority: 'high',
  },
  {
    id: '5',
    name: '技术研发能力提升培训',
    description: '技术团队新技术、新框架、最佳实践培训',
    category: 'skills',
    status: 'active',
    startDate: '2025-01-05',
    endDate: '2025-02-28',
    targetEmployees: 25,
    enrolledEmployees: 22,
    completedEmployees: 8,
    courses: 10,
    budget: 100000,
    priority: 'medium',
  },
];

const CATEGORY_CONFIG = {
  onboarding: {
    label: '入职培训',
    icon: Users,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  skills: {
    label: '技能培训',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  management: {
    label: '管理培训',
    icon: Target,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  compliance: {
    label: '合规培训',
    icon: CheckCircle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
};

const STATUS_CONFIG = {
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  active: {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
};

const PRIORITY_CONFIG = {
  high: {
    label: '高优先级',
    color: 'bg-red-500 text-white',
  },
  medium: {
    label: '中优先级',
    color: 'bg-yellow-500 text-white',
  },
  low: {
    label: '低优先级',
    color: 'bg-gray-500 text-white',
  },
};

export default function TrainingPlansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤培训计划
  const filteredPlans = useMemo(() => {
    let plans = TRAINING_PLANS_DATA;

    // 按分类过滤
    if (categoryFilter !== 'all') {
      plans = plans.filter(plan => plan.category === categoryFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      plans = plans.filter(plan => plan.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      plans = plans.filter(plan =>
        plan.name.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query)
      );
    }

    return plans;
  }, [searchQuery, categoryFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: TRAINING_PLANS_DATA.length,
      active: TRAINING_PLANS_DATA.filter(p => p.status === 'active').length,
      completed: TRAINING_PLANS_DATA.filter(p => p.status === 'completed').length,
      draft: TRAINING_PLANS_DATA.filter(p => p.status === 'draft').length,
      totalBudget: TRAINING_PLANS_DATA.reduce((sum, p) => sum + p.budget, 0),
      totalEmployees: TRAINING_PLANS_DATA.reduce((sum, p) => sum + p.targetEmployees, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            培训计划
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理企业培训计划和进度跟踪
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建培训计划
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>培训计划总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-600" />
              进行中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>目标员工总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEmployees}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总预算</CardDescription>
            <CardTitle className="text-3xl">
              ¥{(stats.totalBudget / 10000).toFixed(1)}万
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 培训计划列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>培训计划列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索培训计划..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="分类筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无培训计划
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有培训计划
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const categoryConfig = CATEGORY_CONFIG[plan.category];
                const statusConfig = STATUS_CONFIG[plan.status];
                const priorityConfig = PRIORITY_CONFIG[plan.priority];
                const CategoryIcon = categoryConfig.icon;

                const completionRate = plan.targetEmployees > 0
                  ? (plan.completedEmployees / plan.targetEmployees) * 100
                  : 0;
                const enrollmentRate = plan.targetEmployees > 0
                  ? (plan.enrolledEmployees / plan.targetEmployees) * 100
                  : 0;

                return (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded ${categoryConfig.color}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {plan.description}
                          </CardDescription>
                        </div>
                        <Badge className={priorityConfig.color}>
                          {priorityConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 状态标签 */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline">
                          {categoryConfig.label}
                        </Badge>
                      </div>

                      {/* 培训进度 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">完成进度</span>
                          <span className="font-medium">{completionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>已参与 {plan.enrolledEmployees}/{plan.targetEmployees} 人</span>
                          <span>已完成 {plan.completedEmployees} 人</span>
                        </div>
                      </div>

                      {/* 培训信息 */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="truncate">{plan.startDate} ~ {plan.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{plan.courses} 门课程</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>目标 {plan.targetEmployees} 人</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <TrendingUp className="h-4 w-4" />
                          <span>预算 ¥{plan.budget.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          查看详情
                        </Button>
                        {plan.status === 'active' && (
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
