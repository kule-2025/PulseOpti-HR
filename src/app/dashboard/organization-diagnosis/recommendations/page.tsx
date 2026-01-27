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
  Lightbulb,
  Plus,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  User,
  Building,
  Eye,
  Edit,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
type RecommendationCategory = 'talent' | 'process' | 'culture' | 'system' | 'compensation';
type RecommendationStatus = 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';

interface Recommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  description: string;
  expectedImpact: string;
  estimatedCost?: number;
  estimatedTimeline: string;
  relatedIssue?: string;
  proposedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  startDate?: string;
  targetDate?: string;
  progress?: number;
  createdAt: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRecommendation, setShowCreateRecommendation] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newRecommendation, setNewRecommendation] = useState({
    title: '',
    category: 'talent' as RecommendationCategory,
    priority: 'medium' as RecommendationPriority,
    description: '',
    expectedImpact: '',
    estimatedCost: '',
    estimatedTimeline: '',
    relatedIssue: '',
  });

  useEffect(() => {
    // 模拟获取改进建议数据
    setTimeout(() => {
      setRecommendations([
        {
          id: '1',
          title: '优化核心人才激励机制',
          category: 'compensation',
          priority: 'critical',
          status: 'approved',
          description: '为核心人才设计更具竞争力的薪酬和股权激励方案，降低流失率',
          expectedImpact: '预计将核心人才流失率降低15%',
          estimatedCost: 500000,
          estimatedTimeline: '3个月',
          relatedIssue: '核心人才流失严重',
          proposedBy: 'HR Director',
          approvedBy: 'CEO',
          approvalDate: '2024-01-20',
          startDate: '2024-02-01',
          targetDate: '2024-05-01',
          progress: 20,
          createdAt: '2024-01-15T10:00:00',
        },
        {
          id: '2',
          title: '完善跨部门协作流程',
          category: 'process',
          priority: 'high',
          status: 'in-progress',
          description: '建立跨部门沟通机制和项目管理平台，提高协作效率',
          expectedImpact: '项目交付周期缩短20%',
          estimatedCost: 200000,
          estimatedTimeline: '6个月',
          relatedIssue: '跨部门协作效率低',
          proposedBy: 'COO',
          approvedBy: 'CEO',
          approvalDate: '2024-01-18',
          startDate: '2024-02-01',
          targetDate: '2024-08-01',
          progress: 30,
          createdAt: '2024-01-10T14:30:00',
        },
        {
          id: '3',
          title: '推行弹性工作制度',
          category: 'culture',
          priority: 'medium',
          status: 'completed',
          description: '允许员工根据工作需要灵活安排工作时间和地点',
          expectedImpact: '员工满意度提升10%',
          estimatedCost: 50000,
          estimatedTimeline: '1个月',
          proposedBy: 'HR BP',
          approvedBy: 'HR Director',
          approvalDate: '2024-01-05',
          startDate: '2024-01-15',
          targetDate: '2024-02-15',
          progress: 100,
          createdAt: '2024-01-01T09:00:00',
        },
        {
          id: '4',
          title: '完善新员工培训体系',
          category: 'system',
          priority: 'high',
          status: 'approved',
          description: '建立系统化的新员工培训课程和导师制度',
          expectedImpact: '新员工首月胜任率提升30%',
          estimatedCost: 300000,
          estimatedTimeline: '2个月',
          relatedIssue: '新员工培训体系不完善',
          proposedBy: 'HR Administrator',
          approvedBy: 'HR Director',
          approvalDate: '2024-01-25',
          startDate: '2024-02-10',
          targetDate: '2024-04-10',
          progress: 0,
          createdAt: '2024-01-20T16:00:00',
        },
        {
          id: '5',
          title: '优化绩效考核机制',
          category: 'talent',
          priority: 'medium',
          status: 'pending',
          description: '引入OKR和360度评估，提高考核的客观性和全面性',
          expectedImpact: '员工对考核的满意度提升15%',
          estimatedCost: 150000,
          estimatedTimeline: '4个月',
          relatedIssue: '绩效考核机制不公',
          proposedBy: 'HR BP',
          createdAt: '2024-01-25T11:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateRecommendation = () => {
    const recommendation: Recommendation = {
      id: Date.now().toString(),
      title: newRecommendation.title,
      category: newRecommendation.category,
      priority: newRecommendation.priority,
      status: 'pending',
      description: newRecommendation.description,
      expectedImpact: newRecommendation.expectedImpact,
      estimatedCost: newRecommendation.estimatedCost ? parseFloat(newRecommendation.estimatedCost) : undefined,
      estimatedTimeline: newRecommendation.estimatedTimeline,
      relatedIssue: newRecommendation.relatedIssue,
      proposedBy: '当前用户',
      createdAt: new Date().toISOString(),
    };
    setRecommendations([recommendation, ...recommendations]);
    setShowCreateRecommendation(false);
    toast.success('建议已创建');
    setNewRecommendation({
      title: '',
      category: 'talent',
      priority: 'medium',
      description: '',
      expectedImpact: '',
      estimatedCost: '',
      estimatedTimeline: '',
      relatedIssue: '',
    });
  };

  const filteredRecommendations = recommendations.filter((recommendation) => {
    const matchesSearch =
      recommendation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recommendation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || recommendation.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || recommendation.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || recommendation.status === statusFilter;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const categoryConfig: Record<RecommendationCategory, { label: string; color: string; icon: any }> = {
    talent: { label: '人才', color: 'bg-blue-500', icon: User },
    process: { label: '流程', color: 'bg-yellow-500', icon: TrendingUp },
    culture: { label: '文化', color: 'bg-purple-500', icon: Target },
    system: { label: '系统', color: 'bg-orange-500', icon: Lightbulb },
    compensation: { label: '薪酬', color: 'bg-green-500', icon: TrendingUp },
  };

  const priorityConfig: Record<RecommendationPriority, { label: string; color: string; level: number }> = {
    critical: { label: '关键', color: 'bg-red-500', level: 4 },
    high: { label: '高', color: 'bg-orange-500', level: 3 },
    medium: { label: '中', color: 'bg-yellow-500', level: 2 },
    low: { label: '低', color: 'bg-blue-500', level: 1 },
  };

  const statusConfig: Record<RecommendationStatus, { label: string; color: string; icon: any }> = {
    pending: { label: '待审批', color: 'bg-gray-500', icon: Clock },
    approved: { label: '已批准', color: 'bg-blue-500', icon: CheckCircle },
    'in-progress': { label: '进行中', color: 'bg-green-500', icon: TrendingUp },
    completed: { label: '已完成', color: 'bg-green-600', icon: CheckCircle },
    rejected: { label: '已拒绝', color: 'bg-red-500', icon: Clock },
  };

  const statistics = {
    total: recommendations.length,
    pending: recommendations.filter((r) => r.status === 'pending').length,
    inProgress: recommendations.filter((r) => r.status === 'in-progress').length,
    completed: recommendations.filter((r) => r.status === 'completed').length,
    totalCost: recommendations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              改进建议
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              提出和管理组织改进建议
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateRecommendation(true)}>
              <Plus className="h-4 w-4 mr-2" />
              提交建议
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总建议数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">待审批</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.inProgress}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">预估成本</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(statistics.totalCost / 10000).toFixed(0)}万
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
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
                  placeholder="搜索建议标题或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(categoryConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部优先级</SelectItem>
                  {Object.entries(priorityConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
          </CardContent>
        </Card>

        {/* 建议列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无改进建议</p>
              <Button className="mt-4" onClick={() => setShowCreateRecommendation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                提交建议
              </Button>
            </div>
          ) : (
            filteredRecommendations.map((recommendation) => {
              const categoryIcon = categoryConfig[recommendation.category].icon;
              const CategoryIcon = categoryIcon;
              const statusIcon = statusConfig[recommendation.status].icon;
              const StatusIcon = statusIcon;

              return (
                <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className={`${categoryConfig[recommendation.category].color} text-white border-0 flex items-center gap-1`}>
                            <CategoryIcon className="h-3 w-3" />
                            {categoryConfig[recommendation.category].label}
                          </Badge>
                          <Badge className={`${priorityConfig[recommendation.priority].color} text-white border-0`}>
                            {priorityConfig[recommendation.priority].label}
                          </Badge>
                          <Badge className={statusConfig[recommendation.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[recommendation.status].label}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {recommendation.description}
                      </p>

                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">预期影响</p>
                        <p className="text-sm">{recommendation.expectedImpact}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">预估周期</span>
                          <p className="font-medium">{recommendation.estimatedTimeline}</p>
                        </div>
                        {recommendation.estimatedCost && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">预估成本</span>
                            <p className="font-medium">
                              {(recommendation.estimatedCost / 10000).toFixed(1)}万元
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">提出人</span>
                          <p className="font-medium">{recommendation.proposedBy}</p>
                        </div>
                        {recommendation.approvedBy && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">批准人</span>
                            <p className="font-medium">{recommendation.approvedBy}</p>
                          </div>
                        )}
                      </div>

                      {recommendation.relatedIssue && (
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">关联问题</span>
                          <p className="text-sm">{recommendation.relatedIssue}</p>
                        </div>
                      )}

                      {recommendation.status === 'in-progress' && recommendation.progress !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">进度</span>
                            <span className="font-medium">{recommendation.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500 transition-all"
                              style={{ width: `${recommendation.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {recommendation.targetDate && recommendation.status !== 'completed' && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            目标完成日期：{recommendation.targetDate}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {recommendation.status === 'pending' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 创建建议弹窗 */}
      <Dialog open={showCreateRecommendation} onOpenChange={setShowCreateRecommendation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>提交改进建议</DialogTitle>
            <DialogDescription>
              提出组织改进的建议方案
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>建议标题 *</Label>
              <Input
                placeholder="输入建议标题"
                value={newRecommendation.title}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>建议分类 *</Label>
                <Select
                  value={newRecommendation.category}
                  onValueChange={(v) => setNewRecommendation({ ...newRecommendation, category: v as RecommendationCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>优先级 *</Label>
                <Select
                  value={newRecommendation.priority}
                  onValueChange={(v) => setNewRecommendation({ ...newRecommendation, priority: v as RecommendationPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>建议描述 *</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="详细描述建议内容..."
                value={newRecommendation.description}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>预期影响 *</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="描述建议的预期效果..."
                value={newRecommendation.expectedImpact}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, expectedImpact: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>预估成本（元）</Label>
                <Input
                  type="number"
                  placeholder="输入预估成本"
                  value={newRecommendation.estimatedCost}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, estimatedCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>预估周期</Label>
                <Input
                  placeholder="例如：3个月"
                  value={newRecommendation.estimatedTimeline}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, estimatedTimeline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>关联问题</Label>
              <Input
                placeholder="输入关联的问题（可选）"
                value={newRecommendation.relatedIssue}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, relatedIssue: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRecommendation(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRecommendation}>
              <Plus className="h-4 w-4 mr-2" />
              提交建议
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
