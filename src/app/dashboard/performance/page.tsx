'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { LazyImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { Target, TrendingUp, Award, Calendar, Plus, Search, Download, Edit, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface Goal {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  progress: number;
  dueDate: string;
  owner: string;
  department: string;
  description: string;
  createdAt: string;
  keyResults: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
  }>;
}

interface Assessment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  overallScore: number;
  status: string;
  selfScore: number;
  managerScore: number;
  submitDate: string;
  reviewDate: string | null;
  dimensions: Record<string, { score: number; weight: number }>;
}

interface KeyResult {
  id: string;
  title: string;
  progress: number;
  status: string;
}

// 模拟数据
const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: '完成Q1产品目标',
    type: '部门目标',
    priority: 'high',
    status: 'in-progress',
    progress: 75,
    dueDate: '2024-03-31',
    owner: '张三',
    department: '产品部',
    description: '完成新产品的核心功能开发和上线',
    createdAt: '2024-01-01',
    keyResults: [
      { id: 'kr1', title: '完成核心功能开发', progress: 100, status: 'completed' },
      { id: 'kr2', title: '通过内部测试', progress: 80, status: 'in-progress' },
      { id: 'kr3', title: '上线生产环境', progress: 40, status: 'in-progress' },
    ],
  },
  {
    id: '2',
    title: '提升用户满意度',
    type: '个人目标',
    priority: 'medium',
    status: 'in-progress',
    progress: 60,
    dueDate: '2024-03-31',
    owner: '李四',
    department: '客服部',
    description: '将用户满意度从85%提升到95%',
    createdAt: '2024-01-05',
    keyResults: [
      { id: 'kr4', title: '优化客服流程', progress: 70, status: 'in-progress' },
      { id: 'kr5', title: '培训客服团队', progress: 50, status: 'in-progress' },
    ],
  },
  {
    id: '3',
    title: '技术架构升级',
    type: '项目目标',
    priority: 'high',
    status: 'not-started',
    progress: 0,
    dueDate: '2024-06-30',
    owner: '王五',
    department: '技术部',
    description: '完成系统架构升级和性能优化',
    createdAt: '2024-01-10',
    keyResults: [
      { id: 'kr6', title: '完成架构设计', progress: 0, status: 'not-started' },
      { id: 'kr7', title: '实施微服务改造', progress: 0, status: 'not-started' },
    ],
  },
];

const MOCK_ASSESSMENTS: Assessment[] = Array.from({ length: 30 }, (_, i) => ({
  id: `assessment-${i + 1}`,
  employeeId: `emp-${i + 1}`,
  employeeName: `员工${i + 1}`,
  department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
  period: '2024-Q1',
  overallScore: 70 + Math.floor(Math.random() * 30),
  status: i % 3 === 0 ? '待评估' : i % 3 === 1 ? '评估中' : '已完成',
  selfScore: 75 + Math.floor(Math.random() * 20),
  managerScore: i % 3 === 2 ? 70 + Math.floor(Math.random() * 30) : 0,
  submitDate: `2024-03-${String(i % 30 + 1).padStart(2, '0')}`,
  reviewDate: i % 3 === 2 ? `2024-04-${String(i % 28 + 1).padStart(2, '0')}` : null,
  dimensions: {
    工作业绩: { score: 70 + Math.floor(Math.random() * 30), weight: 40 },
    工作态度: { score: 70 + Math.floor(Math.random() * 30), weight: 20 },
    工作能力: { score: 70 + Math.floor(Math.random() * 30), weight: 25 },
    团队协作: { score: 70 + Math.floor(Math.random() * 30), weight: 15 },
  },
}));

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2024-Q1');
  const [isCreateGoalDialogOpen, setIsCreateGoalDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 获取目标数据
  const { data: goals, loading: goalsLoading } = useFetch<Goal[]>(
    '/api/performance/goals',
    { fallback: MOCK_GOALS }
  );

  // 获取评估数据
  const { data: assessments, loading: assessmentsLoading } = useFetch<Assessment[]>(
    '/api/performance/assessments',
    { fallback: MOCK_ASSESSMENTS }
  );

  // 筛选评估数据
  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];

    return assessments.filter((assessment: Assessment) => {
      const matchesSearch =
        assessment.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        assessment.department.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      const matchesPeriod = periodFilter === 'all' || assessment.period === periodFilter;
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [assessments, debouncedSearch, statusFilter, periodFilter]);

  // 虚拟列表项渲染器
  const AssessmentItem = useCallback((assessment: Assessment, index: number) => {
    const statusColors: Record<string, string> = {
      '待评估': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      '评估中': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      '已完成': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    const statusIcons: Record<string, React.ReactNode> = {
      '待评估': <AlertCircle className="w-3 h-3" />,
      '评估中': <Edit className="w-3 h-3" />,
      '已完成': <CheckCircle2 className="w-3 h-3" />,
    };

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
              {assessment.employeeName.charAt(0)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {assessment.employeeName}
              </h4>
              <Badge className={statusColors[assessment.status]}>
                {statusIcons[assessment.status]}
                <span className="ml-1">{assessment.status}</span>
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {assessment.department} · {assessment.period}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">提交时间</p>
              <p className="text-gray-900 dark:text-white font-medium">{assessment.submitDate}</p>
            </div>
            {assessment.status === '已完成' && assessment.reviewDate && (
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">评估完成</p>
                <p className="text-gray-900 dark:text-white font-medium">{assessment.reviewDate}</p>
              </div>
            )}
            {assessment.status === '已完成' && (
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">总分</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {assessment.overallScore}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button variant="outline" size="sm">
            详情
          </Button>
          {assessment.status === '待评估' && (
            <Button size="sm">
              开始评估
            </Button>
          )}
        </div>
      </div>
    );
  }, []);

  if (loading || goalsLoading || assessmentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            绩效管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            目标管理、绩效考核与评估
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
          <Dialog open={isCreateGoalDialogOpen} onOpenChange={setIsCreateGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建目标
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新目标</DialogTitle>
                <DialogDescription>
                  使用OKR框架设定清晰的目标和关键结果
                </DialogDescription>
              </DialogHeader>
              <CreateGoalForm onClose={() => setIsCreateGoalDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="进行中目标"
          value={goals?.filter((g: Goal) => g.status === 'in-progress').length || 0}
          icon={<Target className="w-4 h-4" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="待评估员工"
          value={assessments?.filter((a: Assessment) => a.status === '待评估').length || 0}
          icon={<Calendar className="w-4 h-4" />}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="平均绩效分"
          value={assessments && assessments.length > 0
            ? Math.round(assessments.reduce((sum: number, a: Assessment) => sum + a.overallScore, 0) / assessments.length)
            : 0}
          icon={<TrendingUp className="w-4 h-4" />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="优秀员工"
          value={assessments?.filter((a: Assessment) => a.status === '已完成' && a.overallScore >= 90).length || 0}
          icon={<Award className="w-4 h-4" />}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* 主内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="goals">目标管理 (OKR)</TabsTrigger>
          <TabsTrigger value="assessments">绩效评估</TabsTrigger>
          <TabsTrigger value="templates">评估模板</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <GoalsList goals={goals || []} />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsList
            assessments={filteredAssessments}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            periodFilter={periodFilter}
            onPeriodFilterChange={setPeriodFilter}
            AssessmentItem={AssessmentItem}
          />
        </TabsContent>

        <TabsContent value="templates">
          <AssessmentTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 统计卡片
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', color, 'text-white')}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// 目标列表
function GoalsList({ goals }: { goals: Goal[] }) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const statusColors: Record<string, string> = {
    'not-started': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const statusLabels: Record<string, string> = {
    'not-started': '未开始',
    'in-progress': '进行中',
    completed: '已完成',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>目标列表 ({goals.length})</CardTitle>
        <CardDescription>
          使用OKR框架管理和跟踪目标进度
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <Badge className={priorityColors[goal.priority]}>
                        {goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}
                      </Badge>
                      <Badge className={statusColors[goal.status]}>
                        {statusLabels[goal.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{goal.type}</span>
                      <span>{goal.owner}</span>
                      <span>{goal.department}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {goal.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {goal.progress}%
                    </div>
                    <Progress value={goal.progress} className="w-24" />
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {goal.description}
                  </p>
                )}
              </div>

              {expandedGoalId === goal.id && (
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">关键结果</h4>
                  <div className="space-y-3">
                    {goal.keyResults.map((kr) => (
                      <div key={kr.id} className="flex items-center gap-3">
                        <CheckCircle2 className={cn(
                          'w-5 h-5 shrink-0',
                          kr.status === 'completed'
                            ? 'text-green-500'
                            : 'text-gray-300 dark:text-gray-600'
                        )} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{kr.title}</p>
                          <Progress value={kr.progress} className="mt-1 h-2" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                          {kr.progress}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 评估列表
function AssessmentsList({
  assessments,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  periodFilter,
  onPeriodFilterChange,
  AssessmentItem,
}: {
  assessments: Assessment[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  AssessmentItem: (assessment: Assessment, index: number) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>绩效评估 ({assessments.length})</CardTitle>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索员工..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待评估">待评估</SelectItem>
                <SelectItem value="评估中">评估中</SelectItem>
                <SelectItem value="已完成">已完成</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
              <SelectTrigger className="w-full sm:w-32">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[600px]">
          <VirtualScroll
            items={assessments}
            renderItem={AssessmentItem}
            itemHeight={100}
            height={600}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 评估模板
function AssessmentTemplates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>评估模板</CardTitle>
        <CardDescription>
          管理绩效考核模板和评估标准
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无评估模板</p>
          <Button variant="link" className="mt-2">
            创建模板
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 创建目标表单
function CreateGoalForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">目标名称 *</Label>
          <Input id="title" placeholder="例如：完成Q1产品目标" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">目标类型 *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">部门目标</SelectItem>
                <SelectItem value="personal">个人目标</SelectItem>
                <SelectItem value="project">项目目标</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">优先级 *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner">负责人 *</Label>
            <Input id="owner" placeholder="负责人姓名" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">所属部门 *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">技术部</SelectItem>
                <SelectItem value="product">产品部</SelectItem>
                <SelectItem value="design">设计部</SelectItem>
                <SelectItem value="marketing">市场部</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">截止日期 *</Label>
          <Input id="dueDate" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">目标描述 *</Label>
          <Textarea
            id="description"
            placeholder="请详细描述目标内容"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyResults">关键结果 (KR) *</Label>
          <Textarea
            id="keyResults"
            placeholder="请输入关键结果，每条结果用换行分隔"
            rows={4}
          />
          <p className="text-sm text-gray-500">
            每条关键结果应该可衡量、可达成
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">
          创建目标
        </Button>
      </div>
    </form>
  );
}
