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
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Eye,
  Filter,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface TrainingPlan {
  id: string;
  name: string;
  year: string;
  category: string;
  targetAudience: string;
  budget: number;
  usedBudget: number;
  startDate: string;
  endDate: string;
  coursesCount: number;
  participantsCount: number;
  completionRate: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  description: string;
  objectives: string[];
  kpis: {
    key: string;
    target: string;
    current: string;
  }[];
}

interface TrainingRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'incorporated';
}

export default function TrainingPlansPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([
    {
      id: '1',
      name: '2024年度技术能力提升计划',
      year: '2024',
      category: '技术培训',
      targetAudience: '技术部全体员工',
      budget: 200000,
      usedBudget: 125000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      coursesCount: 12,
      participantsCount: 85,
      completionRate: 78,
      status: 'active',
      description: '提升技术团队整体能力，包括新技术、架构设计、工程实践等方面',
      objectives: [
        '提升技术团队整体能力30%',
        '培养5名技术专家',
        '完成3个核心技术认证',
      ],
      kpis: [
        { key: '培训覆盖率', target: '100%', current: '85%' },
        { key: '课程完成率', target: '90%', current: '78%' },
        { key: '技能提升率', target: '80%', current: '75%' },
      ],
    },
    {
      id: '2',
      name: '管理干部培养计划',
      year: '2024',
      category: '管理培训',
      targetAudience: '中层管理者',
      budget: 150000,
      usedBudget: 95000,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      coursesCount: 8,
      participantsCount: 24,
      completionRate: 65,
      status: 'active',
      description: '培养优秀管理干部，提升团队管理能力和领导力',
      objectives: [
        '提升管理干部领导力',
        '培养3名高层后备人才',
        '建立管理人才梯队',
      ],
      kpis: [
        { key: '培训覆盖率', target: '100%', current: '92%' },
        { key: '课程完成率', target: '95%', current: '65%' },
        { key: '晋升率', target: '20%', current: '12%' },
      ],
    },
  ]);

  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      category: '技术培训',
      title: '微服务架构认证培训',
      reason: '公司正在转型微服务架构，需要深入学习相关技术',
      priority: 'high',
      estimatedCost: 15000,
      requestedDate: '2024-12-10',
      status: 'pending',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '产品部',
      category: '管理培训',
      title: '产品经理高级研修班',
      reason: '提升产品规划能力和团队管理能力',
      priority: 'medium',
      estimatedCost: 8000,
      requestedDate: '2024-12-08',
      status: 'approved',
    },
  ]);

  const [planFormData, setPlanFormData] = useState({
    name: '',
    year: '2024',
    category: '',
    targetAudience: '',
    budget: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const stats = {
    totalPlans: trainingPlans.length,
    activePlans: trainingPlans.filter(p => p.status === 'active').length,
    totalBudget: trainingPlans.reduce((sum, p) => sum + p.budget, 0),
    usedBudget: trainingPlans.reduce((sum, p) => sum + p.usedBudget, 0),
    totalCourses: trainingPlans.reduce((sum, p) => sum + p.coursesCount, 0),
    totalParticipants: trainingPlans.reduce((sum, p) => sum + p.participantsCount, 0),
    avgCompletionRate: Math.round(
      trainingPlans.reduce((sum, p) => sum + p.completionRate, 0) / trainingPlans.length
    ),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      active: { label: '进行中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      paused: { label: '已暂停', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      pending: { label: '待审批', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      approved: { label: '已批准', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      incorporated: { label: '已采纳', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
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

  const handleCreatePlan = () => {
    if (!planFormData.name || !planFormData.budget) {
      toast.error('请填写完整的培训计划信息');
      return;
    }

    const newPlan: TrainingPlan = {
      id: Date.now().toString(),
      name: planFormData.name,
      year: planFormData.year,
      category: planFormData.category,
      targetAudience: planFormData.targetAudience,
      budget: Number(planFormData.budget),
      usedBudget: 0,
      startDate: planFormData.startDate,
      endDate: planFormData.endDate,
      coursesCount: 0,
      participantsCount: 0,
      completionRate: 0,
      status: 'draft',
      description: planFormData.description,
      objectives: [],
      kpis: [],
    };

    setTrainingPlans([...trainingPlans, newPlan]);
    setShowCreateDialog(false);
    setPlanFormData({
      name: '',
      year: '2024',
      category: '',
      targetAudience: '',
      budget: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    toast.success('培训计划创建成功');
  };

  const handleApproveRequest = (requestId: string) => {
    setTrainingRequests(requests =>
      requests.map(r =>
        r.id === requestId ? { ...r, status: 'approved' as const } : r
      )
    );
    toast.success('培训申请已批准');
  };

  const handleRejectRequest = (requestId: string) => {
    setTrainingRequests(requests =>
      requests.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      )
    );
    toast.success('培训申请已拒绝');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              培训计划管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              年度培训规划、预算管理、培训需求收集
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出计划
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              创建计划
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">培训计划</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlans}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
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
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">总预算</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ¥{(stats.totalBudget / 10000).toFixed(0)}万
              </div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <DollarSign className="h-3 w-3 mr-1" />
                年度预算
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已使用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ¥{(stats.usedBudget / 10000).toFixed(0)}万
              </div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                使用率 {((stats.usedBudget / stats.totalBudget) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">课程数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCourses}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <BookOpen className="h-3 w-3 mr-1" />
                门
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">参训人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalParticipants}</div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              培训计划
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              培训需求
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              预算管理
            </TabsTrigger>
          </TabsList>

          {/* 培训计划列表 */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>培训计划列表</CardTitle>
                    <CardDescription>查看和管理年度培训计划</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      筛选
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingPlans.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {plan.name}
                              </h3>
                              {getStatusBadge(plan.status)}
                              <Badge variant="outline">{plan.year}年</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">培训类别</span>
                            <div className="font-medium text-gray-900 dark:text-white">{plan.category}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">目标人群</span>
                            <div className="font-medium text-gray-900 dark:text-white">{plan.targetAudience}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">预算使用</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ¥{plan.usedBudget.toLocaleString()} / ¥{plan.budget.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">时间范围</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {plan.startDate} ~ {plan.endDate}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-4 pt-4 border-t dark:border-gray-700">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plan.coursesCount}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">课程数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{plan.participantsCount}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">参训人数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plan.completionRate}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">完成率</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {((plan.usedBudget / plan.budget) * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">预算使用率</div>
                          </div>
                        </div>
                        {plan.kpis.length > 0 && (
                          <div className="pt-4 border-t dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">关键指标</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {plan.kpis.map((kpi, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{kpi.key}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {kpi.current} / {kpi.target}
                                  </span>
                                </div>
                              ))}
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

          {/* 培训需求 */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>培训需求收集</CardTitle>
                <CardDescription>员工提交的培训需求和申请</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>申请人</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>培训主题</TableHead>
                        <TableHead>类别</TableHead>
                        <TableHead>优先级</TableHead>
                        <TableHead>预计费用</TableHead>
                        <TableHead>申请日期</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employeeName}</TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{request.category}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>¥{request.estimatedCost.toLocaleString()}</TableCell>
                          <TableCell>{request.requestedDate}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 hover:bg-green-100 text-green-700"
                                    onClick={() => handleApproveRequest(request.id)}
                                  >
                                    批准
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 hover:bg-red-100 text-red-700"
                                    onClick={() => handleRejectRequest(request.id)}
                                  >
                                    拒绝
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 预算管理 */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>预算管理</CardTitle>
                <CardDescription>培训预算分配和使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">年度总预算</h3>
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      ¥{(stats.totalBudget / 10000).toFixed(0)}万
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.usedBudget / stats.totalBudget) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      已使用 ¥{(stats.usedBudget / 10000).toFixed(0)}万（{((stats.usedBudget / stats.totalBudget) * 100).toFixed(0)}%）
                    </div>
                  </div>

                  <div className="space-y-3">
                    {trainingPlans.map((plan) => (
                      <div key={plan.id} className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ¥{plan.usedBudget.toLocaleString()} / ¥{plan.budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (plan.usedBudget / plan.budget) > 0.8
                                ? 'bg-red-500'
                                : (plan.usedBudget / plan.budget) > 0.5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(plan.usedBudget / plan.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建计划对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建培训计划</DialogTitle>
              <DialogDescription>
                填写培训计划的基本信息和预算
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">计划名称 *</Label>
                <Input
                  id="name"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="例如：2024年度技术能力提升计划"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">年度 *</Label>
                <Select value={planFormData.year} onValueChange={(v) => setPlanFormData({ ...planFormData, year: v })}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024年</SelectItem>
                    <SelectItem value="2025">2025年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">培训类别</Label>
                <Select value={planFormData.category} onValueChange={(v) => setPlanFormData({ ...planFormData, category: v })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="技术培训">技术培训</SelectItem>
                    <SelectItem value="管理培训">管理培训</SelectItem>
                    <SelectItem value="销售培训">销售培训</SelectItem>
                    <SelectItem value="综合培训">综合培训</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">预算 *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={planFormData.budget}
                  onChange={(e) => setPlanFormData({ ...planFormData, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">目标人群</Label>
                <Input
                  id="targetAudience"
                  value={planFormData.targetAudience}
                  onChange={(e) => setPlanFormData({ ...planFormData, targetAudience: e.target.value })}
                  placeholder="例如：技术部全体员工"
                />
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">计划描述</Label>
                <Textarea
                  id="description"
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  placeholder="请描述培训计划的目标和内容..."
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
