'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Target,
  Sparkles,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  category: 'recruitment' | 'performance' | 'training' | 'compliance' | 'ai';
  dueDate: string;
  assignee: string;
  progress?: number;
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  actions?: {
    label: string;
    href: string;
  }[];
}

// 模拟任务数据
const TASKS_DATA: Task[] = [
  {
    id: '1',
    title: '审批3个绩效目标',
    description: '销售团队的Q4绩效目标需要审批',
    type: 'pending',
    priority: 'high',
    category: 'performance',
    dueDate: '2025-01-18',
    assignee: '张经理',
    progress: 0,
    subtasks: [
      { id: '1-1', title: '查看目标详情', completed: true },
      { id: '1-2', title: '审核指标合理性', completed: false },
      { id: '1-3', title: '确认并提交审批', completed: false },
    ],
    actions: [
      { label: '去审批', href: '/performance/goal-setting' },
    ],
  },
  {
    id: '2',
    title: '面试候选人李四',
    description: '产品经理岗位二面安排',
    type: 'in-progress',
    priority: 'high',
    category: 'recruitment',
    dueDate: '2025-01-17',
    assignee: '王HR',
    progress: 50,
    subtasks: [
      { id: '2-1', title: '准备面试题库', completed: true },
      { id: '2-2', title: '发送面试邀请', completed: true },
      { id: '2-3', title: '进行面试评估', completed: false },
    ],
    actions: [
      { label: '查看简历', href: '/ai-resume-parser' },
    ],
  },
  {
    id: '3',
    title: '更新培训计划',
    description: 'Q1新员工入职培训计划需要更新',
    type: 'pending',
    priority: 'medium',
    category: 'training',
    dueDate: '2025-01-20',
    assignee: '刘培训',
    actions: [
      { label: '去编辑', href: '/training' },
    ],
  },
  {
    id: '4',
    title: 'AI岗位画像分析',
    description: '技术总监岗位智能画像分析完成',
    type: 'completed',
    priority: 'low',
    category: 'ai',
    dueDate: '2025-01-15',
    assignee: '系统',
    progress: 100,
    actions: [
      { label: '查看详情', href: '/ai-assistant/job-profile' },
    ],
  },
  {
    id: '5',
    title: '劳动合同签署提醒',
    description: '5名员工劳动合同即将到期',
    type: 'pending',
    priority: 'high',
    category: 'compliance',
    dueDate: '2025-01-19',
    assignee: '赵HR',
    actions: [
      { label: '去处理', href: '/compliance/contracts' },
    ],
  },
  {
    id: '6',
    title: '人效分析报告',
    description: '12月人效分析报告已生成',
    type: 'completed',
    priority: 'medium',
    category: 'performance',
    dueDate: '2025-01-10',
    assignee: '系统',
    progress: 100,
    actions: [
      { label: '查看报告', href: '/analytics/efficiency/dashboard' },
    ],
  },
];

const TASK_CATEGORY_CONFIG = {
  recruitment: {
    label: '招聘管理',
    icon: Users,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  performance: {
    label: '绩效管理',
    icon: Target,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  training: {
    label: '培训管理',
    icon: FileText,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  compliance: {
    label: '合规管理',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
  ai: {
    label: 'AI智能',
    icon: Sparkles,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
};

const TASK_TYPE_CONFIG = {
  pending: {
    label: '待处理',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  },
  'in-progress': {
    label: '进行中',
    icon: ChevronRight,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle,
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

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 过滤任务
  const filteredTasks = useMemo(() => {
    let tasks = TASKS_DATA;

    // 按标签过滤
    if (activeTab !== 'all') {
      tasks = tasks.filter(task => task.type === activeTab);
    }

    // 按分类过滤
    if (categoryFilter !== 'all') {
      tasks = tasks.filter(task => task.category === categoryFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    return tasks;
  }, [activeTab, searchQuery, categoryFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: TASKS_DATA.length,
      pending: TASKS_DATA.filter(t => t.type === 'pending').length,
      inProgress: TASKS_DATA.filter(t => t.type === 'in-progress').length,
      completed: TASKS_DATA.filter(t => t.type === 'completed').length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            我的任务
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理和处理您的工作任务
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建任务
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>全部任务</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              待处理
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-blue-600" />
              进行中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              已完成
            </CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>任务列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索任务..."
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
                  {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending">待处理</TabsTrigger>
              <TabsTrigger value="in-progress">进行中</TabsTrigger>
              <TabsTrigger value="completed">已完成</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <CheckCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      暂无任务
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      当前筛选条件下没有任务
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const categoryConfig = TASK_CATEGORY_CONFIG[task.category];
                    const typeConfig = TASK_TYPE_CONFIG[task.type];
                    const priorityConfig = PRIORITY_CONFIG[task.priority];
                    const CategoryIcon = categoryConfig.icon;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* 图标 */}
                            <div className={`p-2 rounded-lg ${categoryConfig.color} shrink-0`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>

                            {/* 内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {task.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {task.description}
                                  </p>
                                </div>
                                <Badge className={priorityConfig.color}>
                                  {priorityConfig.label}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <TypeIcon className="h-4 w-4" />
                                  <span>{typeConfig.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{task.dueDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-4 w-4" />
                                  <span>{task.assignee}</span>
                                </div>
                              </div>

                              {/* 子任务 */}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    子任务 ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                                  </div>
                                  <div className="space-y-1">
                                    {task.subtasks.map((subtask) => (
                                      <div
                                        key={subtask.id}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        {subtask.completed ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                                        )}
                                        <span
                                          className={subtask.completed
                                            ? 'text-gray-400 line-through'
                                            : 'text-gray-700 dark:text-gray-300'
                                          }
                                        >
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 进度条 */}
                              {task.progress !== undefined && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>进度</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 操作按钮 */}
                            {task.actions && task.actions.length > 0 && (
                              <div className="flex flex-col gap-2 shrink-0">
                                {task.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={action.href}>
                                      {action.label}
                                    </a>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
