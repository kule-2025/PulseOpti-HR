'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Zap,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'okr' | 'kpi' | 'personal' | 'team';
  status: 'draft' | 'pending' | 'in-progress' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  weight: number;
  assignee: string;
  department: string;
  cycle: string;
  startDate: string;
  endDate: string;
  keyResults: {
    id: string;
    title: string;
    progress: number;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
  }[];
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

// 模拟目标数据
const GOALS_DATA: Goal[] = [
  {
    id: '1',
    title: 'Q4销售额目标达成',
    description: '完成公司Q4季度销售额目标，提升市场占有率',
    category: 'kpi',
    status: 'in-progress',
    priority: 'high',
    progress: 78,
    weight: 30,
    assignee: '销售部',
    department: '销售部',
    cycle: '2024Q4',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    keyResults: [
      { id: 'kr-1', title: '完成5000万销售额', progress: 85, status: 'in-progress', dueDate: '2024-12-31' },
      { id: 'kr-2', title: '新增100家客户', progress: 70, status: 'in-progress', dueDate: '2024-12-31' },
      { id: 'kr-3', title: '客户满意度达到90%', progress: 92, status: 'completed', dueDate: '2024-12-15' },
    ],
    metrics: {
      current: 3900,
      target: 5000,
      unit: '万元',
    },
  },
  {
    id: '2',
    title: '产品迭代计划',
    description: '完成V2.0版本核心功能开发和上线',
    category: 'okr',
    status: 'in-progress',
    priority: 'high',
    weight: 25,
    assignee: '技术部',
    department: '技术部',
    cycle: '2024Q4',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    keyResults: [
      { id: 'kr-1', title: '完成需求分析和设计', progress: 100, status: 'completed', dueDate: '2024-10-31' },
      { id: 'kr-2', title: '完成核心功能开发', progress: 80, status: 'in-progress', dueDate: '2024-11-30' },
      { id: 'kr-3', title: '完成测试和上线', progress: 30, status: 'in-progress', dueDate: '2024-12-31' },
    ],
  },
  {
    id: '3',
    title: '人才培养计划',
    description: '提升核心员工能力，搭建人才梯队',
    category: 'team',
    status: 'in-progress',
    priority: 'medium',
    progress: 55,
    weight: 20,
    assignee: '人力资源部',
    department: '人力资源部',
    cycle: '2024Q4',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    keyResults: [
      { id: 'kr-1', title: '完成50人培训', progress: 70, status: 'in-progress', dueDate: '2024-12-31' },
      { id: 'kr-2', title: '建立人才梯队', progress: 40, status: 'in-progress', dueDate: '2024-12-31' },
    ],
  },
  {
    id: '4',
    title: '个人年度OKR',
    description: '个人年度目标设定与跟踪',
    category: 'personal',
    status: 'draft',
    priority: 'medium',
    progress: 0,
    weight: 10,
    assignee: '张三',
    department: '技术部',
    cycle: '2024年度',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    keyResults: [
      { id: 'kr-1', title: '完成技术方案设计', progress: 0, status: 'pending', dueDate: '2024-03-31' },
      { id: 'kr-2', title: '团队管理提升', progress: 0, status: 'pending', dueDate: '2024-06-30' },
    ],
  },
  {
    id: '5',
    title: '市场推广计划',
    description: '提升品牌知名度和市场占有率',
    category: 'team',
    status: 'completed',
    priority: 'high',
    progress: 100,
    weight: 15,
    assignee: '市场部',
    department: '市场部',
    cycle: '2024Q3',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    keyResults: [
      { id: 'kr-1', title: '举办3场市场活动', progress: 100, status: 'completed', dueDate: '2024-09-30' },
      { id: 'kr-2', title: '品牌曝光量提升50%', progress: 100, status: 'completed', dueDate: '2024-09-30' },
    ],
    metrics: {
      current: 150,
      target: 100,
      unit: '%',
    },
  },
];

const CATEGORY_CONFIG = {
  okr: {
    label: 'OKR',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  kpi: {
    label: 'KPI',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  personal: {
    label: '个人',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  team: {
    label: '团队',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
};

const STATUS_CONFIG = {
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  pending: {
    label: '待审核',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  },
  'in-progress': {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  archived: {
    label: '已归档',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

const PRIORITY_CONFIG = {
  high: {
    label: '高',
    color: 'bg-red-500 text-white',
  },
  medium: {
    label: '中',
    color: 'bg-yellow-500 text-white',
  },
  low: {
    label: '低',
    color: 'bg-gray-500 text-white',
  },
};

export default function GoalSettingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  // 过滤目标
  const filteredGoals = useMemo(() => {
    let goals = GOALS_DATA;

    // 按分类过滤
    if (categoryFilter !== 'all') {
      goals = goals.filter(g => g.category === categoryFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      goals = goals.filter(g => g.status === statusFilter);
    }

    // 按周期过滤
    if (cycleFilter !== 'all') {
      goals = goals.filter(g => g.cycle === cycleFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      goals = goals.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.assignee.toLowerCase().includes(query)
      );
    }

    return goals;
  }, [searchQuery, categoryFilter, statusFilter, cycleFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: GOALS_DATA.length,
      inProgress: GOALS_DATA.filter(g => g.status === 'in-progress').length,
      completed: GOALS_DATA.filter(g => g.status === 'completed').length,
      avgProgress: GOALS_DATA.reduce((sum, g) => sum + g.progress, 0) / GOALS_DATA.length,
      onTrack: GOALS_DATA.filter(g => g.progress >= 70 && g.status === 'in-progress').length,
      atRisk: GOALS_DATA.filter(g => g.progress < 50 && g.status === 'in-progress').length,
    };
  }, []);

  // 获取所有周期
  const cycles = useMemo(() => {
    return Array.from(new Set(GOALS_DATA.map(goal => goal.cycle)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            目标设定
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            OKR/KPI目标管理，驱动组织和个人成长
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          创建新目标
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>目标总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
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

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均完成度</CardDescription>
            <CardTitle className="text-3xl">{stats.avgProgress.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>风险预警</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.atRisk}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              目标进度不足50%
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 目标列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>目标列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索目标..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="分类" />
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

              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部周期</SelectItem>
                  {cycles.map(cycle => (
                    <SelectItem key={cycle} value={cycle}>
                      {cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="状态" />
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
          <div className="space-y-4">
            {filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无目标
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有目标
                </p>
              </div>
            ) : (
              filteredGoals.map((goal) => {
                const categoryConfig = CATEGORY_CONFIG[goal.category];
                const statusConfig = STATUS_CONFIG[goal.status];
                const priorityConfig = PRIORITY_CONFIG[goal.priority];

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={categoryConfig.color}>
                              {categoryConfig.label}
                            </Badge>
                            <Badge className={priorityConfig.color}>
                              {priorityConfig.label}优先级
                            </Badge>
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                        <div className="text-center shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            完成度
                          </div>
                          <div className={`text-4xl font-bold ${
                            goal.progress >= 80 ? 'text-green-600' :
                            goal.progress >= 50 ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            {goal.progress}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 进度条 */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">目标进度</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-3" />
                      </div>

                      {/* 关键指标 */}
                      {goal.metrics && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {goal.metrics.current}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">当前</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {goal.metrics.target}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">目标</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              goal.metrics.current >= goal.metrics.target ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {goal.metrics.current >= goal.metrics.target ? <ArrowUp /> : <ArrowDown />}
                              {((goal.metrics.current / goal.metrics.target) * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">达成率</div>
                          </div>
                        </div>
                      )}

                      {/* 关键结果 */}
                      {goal.keyResults && goal.keyResults.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            关键结果 (KR)
                          </h4>
                          <div className="space-y-2">
                            {goal.keyResults.map((kr) => (
                              <div key={kr.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                                    {kr.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>截止: {kr.dueDate}</span>
                                  </div>
                                </div>
                                <div className="w-32">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>进度</span>
                                    <span>{kr.progress}%</span>
                                  </div>
                                  <Progress value={kr.progress} className="h-2" />
                                </div>
                                <Badge variant="outline" className={
                                  kr.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  kr.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                  'bg-gray-100 text-gray-600'
                                }>
                                  {kr.status === 'completed' ? '已完成' : kr.status === 'in-progress' ? '进行中' : '待开始'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 目标信息 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            责任人
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {goal.assignee}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            部门
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {goal.department}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            周期
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {goal.cycle}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            权重
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {goal.weight}%
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {goal.status !== 'completed' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
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
