'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading, Skeleton } from '@/components/ui/loading';
import { VirtualScroll } from '@/components/ui/virtual-scroll';
import {
  Target,
  Plus,
  Calendar,
  User,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache, clearCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';

interface KeyResult {
  id: number;
  title: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  progress: number;
}

interface Goal {
  id: number;
  title: string;
  type: 'KPI' | 'OKR' | 'MBO';
  category: string;
  department: string;
  owner: string;
  timeframe: string;
  status: '进行中' | '即将完成' | '已完成' | '已延期';
  priority: '高' | '中' | '低';
  deadline: string;
  overallProgress: number;
  keyResults: KeyResult[];
  description: string;
}

export default function GoalSettingContent() {
  const [activeTab, setActiveTab] = useLocalStorage('goal-tab', 'kpi');
  const [selectedType, setSelectedType] = useLocalStorage('goal-type', 'all');
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 使用 useAsync Hook 管理异步状态
  const {
    data: goals = [],
    loading,
    error,
    execute: fetchGoals,
    reset,
  } = useAsync<Goal[]>();

  // 获取目标数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = `goals-${activeTab}-${selectedType}-${debouncedKeyword}-${refreshKey}`;
        const data = await fetchWithCache(
          cacheKey,
          async () => {
            // 这里应该是实际的 API 调用
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            // 返回模拟数据
            return getMockGoals(activeTab, selectedType, debouncedKeyword);
          },
          5 * 60 * 1000 // 5 分钟缓存
        );
        return data;
      } catch (err) {
        console.error('Failed to fetch goals:', err);
        throw err;
      }
    };

    fetchGoals(fetchData);
  }, [activeTab, selectedType, debouncedKeyword, refreshKey, fetchGoals]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    clearCache('goals-');
    setRefreshKey(prev => prev + 1);
  }, []);

  // 筛选目标
  const filteredGoals = (goals || []).filter((item: any) => goal => {
    if (selectedType !== 'all' && goal.type !== activeTab.toUpperCase()) {
      return false;
    }
    if (debouncedKeyword) {
      const keywordLower = debouncedKeyword.toLowerCase();
      return (
        goal.title.toLowerCase().includes(keywordLower) ||
        goal.owner.toLowerCase().includes(keywordLower) ||
        goal.department.toLowerCase().includes(keywordLower)
      );
    }
    return true;
  });

  // 新建目标
  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setShowCreateDialog(true);
  };

  // 编辑目标
  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowCreateDialog(true);
  };

  // 删除目标
  const handleDeleteGoal = (goalId: number) => {
    if (confirm('确定要删除该目标吗？')) {
      clearCache('goals-');
      setRefreshKey(prev => prev + 1);
    }
  };

  // 保存目标
  const handleSaveGoal = () => {
    clearCache('goals-');
    setShowCreateDialog(false);
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '进行中':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '即将完成':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case '已延期':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case '中':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case '低':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading && (!goals || goals.length === 0)) {
    return (
      <div className="p-6">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">加载失败: {error.message}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-500" />
            目标设定
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            KPI、OKR、MBO 目标管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            onClick={handleCreateGoal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建目标
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '总目标数', value: (goals || []).length, icon: Target, color: 'text-blue-600' },
          { label: '进行中', value: (goals || []).filter((item: any) => g => g.status === '进行中').length, icon: Clock, color: 'text-yellow-600' },
          { label: '已完成', value: (goals || []).filter((item: any) => g => g.status === '已完成').length, icon: CheckCircle2, color: 'text-green-600' },
          { label: '已延期', value: (goals || []).filter((item: any) => g => g.status === '已延期').length, icon: MoreHorizontal, color: 'text-red-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索目标名称、负责人、部门"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>目标类型</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="okr">OKR</SelectItem>
                  <SelectItem value="mbo">MBO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 目标列表 - 使用虚拟滚动优化性能 */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="kpi">KPI ({(goals || []).filter((item: any) => g => g.type === 'KPI').length})</TabsTrigger>
              <TabsTrigger value="okr">OKR ({(goals || []).filter((item: any) => g => g.type === 'OKR').length})</TabsTrigger>
              <TabsTrigger value="mbo">MBO ({(goals || []).filter((item: any) => g => g.type === 'MBO').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredGoals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">暂无目标数据</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 新建/编辑目标对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? '编辑目标' : '新建目标'}</DialogTitle>
            <DialogDescription>
              {selectedGoal ? '修改目标信息' : '创建新的目标'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>目标标题 *</Label>
              <Input placeholder="输入目标标题" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>目标类型 *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kpi">KPI</SelectItem>
                    <SelectItem value="okr">OKR</SelectItem>
                    <SelectItem value="mbo">MBO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>优先级</Label>
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
            <div>
              <Label>截止日期 *</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>目标描述</Label>
              <Textarea placeholder="输入目标描述" rows={3} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveGoal}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 目标卡片组件
function GoalCard({
  goal,
  onEdit,
  onDelete,
  getStatusColor,
  getPriorityColor,
}: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
              <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
            </div>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {goal.owner}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {goal.department}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {goal.deadline}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">整体进度</span>
            <span className="text-sm font-bold">{goal.overallProgress}%</span>
          </div>
          <Progress value={goal.overallProgress} className="h-2" />
        </div>
        {goal.keyResults && goal.keyResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {goal.keyResults.map((kr) => (
              <div key={kr.id} className="flex items-center justify-between text-sm">
                <span>{kr.title}</span>
                <span className="font-medium">
                  {kr.currentValue} / {kr.targetValue} ({kr.progress}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 模拟数据
function getMockGoals(tab: string, type: string, keyword: string): Goal[] {
  const allGoals: Goal[] = [
    {
      id: 1,
      title: 'Q1 销售目标达成',
      type: 'KPI',
      category: '业绩指标',
      department: '销售部',
      owner: '张三',
      timeframe: '2024 Q1',
      status: '进行中',
      priority: '高',
      deadline: '2024-03-31',
      overallProgress: 76,
      description: '完成Q1季度销售目标，确保团队业绩稳步增长',
      keyResults: [
        { id: 1, title: '销售额达成', targetValue: '500万', currentValue: '380万', unit: '元', progress: 76 },
        { id: 2, title: '新客户开发', targetValue: '50家', currentValue: '35家', unit: '家', progress: 70 },
        { id: 3, title: '客户续费率', targetValue: '90%', currentValue: '92%', unit: '%', progress: 102 },
      ],
    },
    {
      id: 2,
      title: '客户满意度提升',
      type: 'OKR',
      category: '服务质量',
      department: '客服部',
      owner: '李四',
      timeframe: '2024 Q1',
      status: '进行中',
      priority: '高',
      deadline: '2024-03-31',
      overallProgress: 88,
      description: '通过优化服务流程，提升客户整体满意度',
      keyResults: [
        { id: 1, title: 'NPS评分', targetValue: '50分', currentValue: '42分', unit: '分', progress: 84 },
        { id: 2, title: '投诉率降低', targetValue: '2%', currentValue: '1.5%', unit: '%', progress: 100 },
        { id: 3, title: '响应时间', targetValue: '30分钟', currentValue: '25分钟', unit: '分钟', progress: 100 },
      ],
    },
    {
      id: 3,
      title: '团队规模扩张',
      type: 'KPI',
      category: '团队建设',
      department: '人力资源',
      owner: '赵六',
      timeframe: '2024 Q1',
      status: '即将完成',
      priority: '中',
      deadline: '2024-02-28',
      overallProgress: 90,
      description: '完成年度招聘计划，补充关键岗位人才',
      keyResults: [
        { id: 1, title: '技术岗位招聘', targetValue: '10人', currentValue: '9人', unit: '人', progress: 90 },
        { id: 2, title: '市场岗位招聘', targetValue: '5人', currentValue: '5人', unit: '人', progress: 100 },
        { id: 3, title: '运营岗位招聘', targetValue: '5人', currentValue: '4人', unit: '人', progress: 80 },
      ],
    },
  ];

  let filtered = allGoals;
  if (tab !== 'kpi') {
    filtered = filtered.filter((item: any) => g => g.type.toLowerCase() === tab);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter((item: any) => g =>
      g.title.toLowerCase().includes(kw) ||
      g.owner.toLowerCase().includes(kw) ||
      g.department.toLowerCase().includes(kw)
    );
  }
  return filtered;
}

// 修复：添加缺失的导入
import { Building2 } from 'lucide-react';
