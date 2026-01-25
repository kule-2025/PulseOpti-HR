'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Layers,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Users,
  Target,
  Settings,
  Search,
  Filter,
  MessageSquare,
  // TrendingUp,
  // DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  companyId: string;
  steps: any[];
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowInstance {
  id: string;
  name: string;
  type: string;
  status: string;
  currentStepIndex: number;
  steps: any[];
  initiatorId: string;
  initiatorName: string;
  startDate: string;
  endDate?: string;
  relatedEntityName?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

const WORKFLOW_TYPES = {
  // 核心业务流程
  recruitment: { label: '招聘流程', icon: Users, color: 'from-blue-600 to-blue-500' },
  onboarding: { label: '入职流程', icon: Users, color: 'from-purple-600 to-purple-500' },
  resignation: { label: '离职流程', icon: AlertCircle, color: 'from-red-600 to-red-500' },
  performance: { label: '绩效流程', icon: Target, color: 'from-green-600 to-green-500' },
  promotion: { label: '晋升流程', icon: CheckCircle2, color: 'from-yellow-600 to-yellow-500' },
  transfer: { label: '转岗流程', icon: Layers, color: 'from-cyan-600 to-cyan-500' },
  salary_adjustment: { label: '调薪流程', icon: FileText, color: 'from-pink-600 to-pink-500' },
  // 扩展业务流程
  training: { label: '培训流程', icon: FileText, color: 'from-indigo-600 to-indigo-500' },
  salary_calculation: { label: '薪酬核算流程', icon: FileText, color: 'from-amber-600 to-amber-500' },
  attendance: { label: '考勤流程', icon: Clock, color: 'from-teal-600 to-teal-500' },
  points: { label: '积分流程', icon: Target, color: 'from-rose-600 to-rose-500' },
  contract_renewal: { label: '合同续签流程', icon: FileText, color: 'from-lime-600 to-lime-500' },
  probation_assessment: { label: '试用期考核流程', icon: CheckCircle2, color: 'from-fuchsia-600 to-fuchsia-500' },
  interview: { label: '面试流程', icon: Users, color: 'from-sky-600 to-sky-500' },
  exit_interview: { label: '离职访谈流程', icon: MessageSquare, color: 'from-violet-600 to-violet-500' },
};

const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: FileText },
  active: { label: '进行中', color: 'bg-blue-100 text-blue-700', icon: Play },
  paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-700', icon: Pause },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  error: { label: '异常', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function AdminWorkflowsPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showInstanceDialog, setShowInstanceDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const user = getCurrentUser();
      if (!user || !user.companyId) {
        throw new Error('用户信息或企业ID不存在');
      }

      // 并行获取模板和实例数据
      const [templatesRes, instancesRes] = await Promise.all([
        fetch(`/api/workflows?companyId=${user.companyId}`),
        fetch(`/api/workflows/instances?companyId=${user.companyId}`),
      ]);

      if (!templatesRes.ok || !instancesRes.ok) {
        throw new Error('获取数据失败');
      }

      const templatesData = await templatesRes.json();
      const instancesData = await instancesRes.json();

      if (templatesData.success) {
        setTemplates(templatesData.data);
      }

      if (instancesData.success) {
        setInstances(instancesData.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchType = typeFilter === 'all' || template.type === typeFilter;
    const matchStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // 过滤实例
  const filteredInstances = instances.filter(instance => {
    const matchType = typeFilter === 'all' || instance.type === typeFilter;
    const matchStatus = statusFilter === 'all' || instance.status === statusFilter;
    const matchSearch = !searchQuery || 
      instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.relatedEntityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.initiatorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getWorkflowTypeBadge = (type: string) => {
    const config = WORKFLOW_TYPES[type as keyof typeof WORKFLOW_TYPES];
    if (!config) return <Badge variant="outline">{type}</Badge>;

    return (
      <Badge
        className={cn(
          'text-white',
          `bg-gradient-to-r ${config.color}`
        )}
      >
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getProgress = (instance: WorkflowInstance) => {
    const totalSteps = instance.steps.length;
    const currentStep = instance.currentStepIndex;
    return Math.round((currentStep / totalSteps) * 100);
  };

  const handleViewInstance = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/workflows/instances/${instanceId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedInstance(result.data);
          setShowInstanceDialog(true);
        }
      }
    } catch (error) {
      console.error('获取工作流实例详情失败:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              工作流管理
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              管理所有工作流模板和实例，实现100%流程闭环
            </p>
          </div>
          <Button
            onClick={() => setActiveTab('templates')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建工作流
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                活跃工作流
              </CardTitle>
              <Play className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.filter(i => i.status === 'active').length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                当前进行中的流程
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                本月完成
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.filter(i => 
                  i.status === 'completed' && 
                  i.endDate && 
                  new Date(i.endDate).getMonth() === new Date().getMonth()
                ).length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                本月完成的流程
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                待处理
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.filter(i => i.status === 'active').length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                需要人工干预
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                模板总数
              </CardTitle>
              <Layers className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                可用的工作流模板
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">
              <Layers className="h-4 w-4 mr-2" />
              工作流模板
            </TabsTrigger>
            <TabsTrigger value="instances">
              <Play className="h-4 w-4 mr-2" />
              运行实例
            </TabsTrigger>
          </TabsList>

          {/* 工作流模板标签页 */}
          <TabsContent value="templates" className="space-y-4">
            {/* 筛选栏 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索模板名称或描述..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="流程类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {Object.entries(WORKFLOW_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">进行中</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 模板列表 */}
            <Card>
              <CardHeader>
                <CardTitle>工作流模板列表</CardTitle>
                <CardDescription>
                  管理所有工作流模板，包括创建、编辑、删除等操作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>模板名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>步骤数</TableHead>
                      <TableHead>公开</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center">
                            <Layers className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">暂无工作流模板</p>
                            <Button
                              variant="link"
                              className="mt-2"
                              onClick={() => setShowTemplateDialog(true)}
                            >
                              创建第一个模板
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">
                            {template.name}
                          </TableCell>
                          <TableCell>
                            {getWorkflowTypeBadge(template.type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(template.status)}
                          </TableCell>
                          <TableCell>
                            {template.steps?.length || 0} 步
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                              {template.isPublic ? '是' : '否'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(template.updatedAt).toLocaleString('zh-CN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
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
          </TabsContent>

          {/* 运行实例标签页 */}
          <TabsContent value="instances" className="space-y-4">
            {/* 筛选栏 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索实例名称、关联实体或发起人..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="流程类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {Object.entries(WORKFLOW_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">进行中</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 实例列表 */}
            <Card>
              <CardHeader>
                <CardTitle>运行实例列表</CardTitle>
                <CardDescription>
                  监控所有工作流实例的运行状态，支持实时查看和干预
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>实例名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>进度</TableHead>
                      <TableHead>关联实体</TableHead>
                      <TableHead>发起人</TableHead>
                      <TableHead>开始时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center">
                            <Play className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">暂无运行实例</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInstances.map((instance) => (
                        <TableRow key={instance.id}>
                          <TableCell className="font-medium">
                            {instance.name}
                          </TableCell>
                          <TableCell>
                            {getWorkflowTypeBadge(instance.type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(instance.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${getProgress(instance)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {getProgress(instance)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {instance.relatedEntityName || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {instance.initiatorName || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(instance.startDate).toLocaleString('zh-CN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInstance(instance.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {instance.status === 'active' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Pause className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                </>
                              )}
                              {instance.status === 'paused' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Play className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 工作流实例详情对话框 */}
      <Dialog open={showInstanceDialog} onOpenChange={setShowInstanceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>工作流实例详情</DialogTitle>
            <DialogDescription>
              查看工作流的详细执行过程和当前状态
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">实例名称</Label>
                  <p className="text-sm font-medium mt-1">{selectedInstance.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedInstance.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">发起人</Label>
                  <p className="text-sm font-medium mt-1">{selectedInstance.initiatorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">关联实体</Label>
                  <p className="text-sm font-medium mt-1">{selectedInstance.relatedEntityName || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">开始时间</Label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedInstance.startDate).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">结束时间</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedInstance.endDate
                      ? new Date(selectedInstance.endDate).toLocaleString('zh-CN')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* 流程步骤 */}
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  流程步骤
                </Label>
                <div className="mt-2 space-y-2">
                  {selectedInstance.steps.map((step: any, index: number) => (
                    <div
                      key={step.id}
                      className={cn(
                        'p-4 rounded-lg border-2',
                        index === selectedInstance.currentStepIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700',
                        step.status === 'completed' && 'opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              step.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : step.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : step.status === 'in_progress' ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{step.name}</p>
                            {step.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={
                            step.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : step.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {step.status === 'completed'
                            ? '已完成'
                            : step.status === 'in_progress'
                            ? '进行中'
                            : '待处理'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
