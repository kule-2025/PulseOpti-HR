'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Layers,
  UserPlus,
  UserMinus,
  TrendingUp,
  ArrowRightLeft,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Eye,
  Play,
  Pause,
  Edit,
  BarChart,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type WorkflowStatus = 'active' | 'paused' | 'draft';
type WorkflowPriority = 'high' | 'medium' | 'low';
type WorkflowType = 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'task' | 'automatic';
  assignee?: string;
  order: number;
  duration?: number;
}

interface WorkflowInstance {
  id: string;
  workflowType: WorkflowType;
  employeeName: string;
  employeeId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  initiator: string;
  data: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  version: string;
  steps: WorkflowStep[];
  avgDuration: number;
  totalInstances: number;
  successRate: number;
  lastUsed: string;
  icon: any;
  color: string;
}

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'instances'>('templates');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 模拟获取工作流数据
    setTimeout(() => {
      setTemplates([
        {
          id: 'WF-001',
          name: '员工入职流程',
          description: '新员工入职全流程管理，包括入职准备、入职培训、权限开通等',
          type: 'onboarding',
          status: 'active',
          priority: 'high',
          version: 'v2.1',
          steps: [
            { id: '1', name: '入职准备', type: 'task', assignee: 'HR BP', order: 1, duration: 3 },
            { id: '2', name: '部门审批', type: 'approval', assignee: '部门负责人', order: 2, duration: 1 },
            { id: '3', name: '创建账号', type: 'automatic', order: 3, duration: 1 },
            { id: '4', name: '权限开通', type: 'automatic', order: 4, duration: 1 },
            { id: '5', name: '入职培训', type: 'task', assignee: 'HR部门', order: 5, duration: 7 },
            { id: '6', name: '入职确认', type: 'notification', assignee: '系统', order: 6 },
          ],
          avgDuration: 5,
          totalInstances: 156,
          successRate: 98,
          lastUsed: '2024-02-28',
          icon: UserPlus,
          color: 'bg-green-500',
        },
        {
          id: 'WF-002',
          name: '员工离职流程',
          description: '员工离职审批流程，包括工作交接、权限回收、离职手续等',
          type: 'offboarding',
          status: 'active',
          priority: 'high',
          version: 'v1.8',
          steps: [
            { id: '1', name: '离职申请', type: 'task', assignee: '员工', order: 1, duration: 1 },
            { id: '2', name: '部门审批', type: 'approval', assignee: '部门负责人', order: 2, duration: 2 },
            { id: '3', name: 'HR审批', type: 'approval', assignee: 'HR总监', order: 3, duration: 2 },
            { id: '4', name: '工作交接', type: 'task', assignee: '员工', order: 4, duration: 3 },
            { id: '5', name: '资产归还', type: 'task', assignee: '行政', order: 5, duration: 1 },
            { id: '6', name: '权限回收', type: 'automatic', order: 6, duration: 1 },
            { id: '7', name: '离职证明', type: 'automatic', order: 7 },
          ],
          avgDuration: 7,
          totalInstances: 42,
          successRate: 95,
          lastUsed: '2024-02-25',
          icon: UserMinus,
          color: 'bg-red-500',
        },
        {
          id: 'WF-003',
          name: '晋升审批流程',
          description: '员工晋升审批流程，包括绩效评估、晋升审核、薪资调整等',
          type: 'promotion',
          status: 'active',
          priority: 'high',
          version: 'v1.5',
          steps: [
            { id: '1', name: '晋升提名', type: 'task', assignee: '部门负责人', order: 1, duration: 2 },
            { id: '2', name: '绩效评估', type: 'task', assignee: 'HR部门', order: 2, duration: 3 },
            { id: '3', name: '晋升评审', type: 'approval', assignee: '晋升委员会', order: 3, duration: 3 },
            { id: '4', name: 'HR审批', type: 'approval', assignee: 'HR总监', order: 4, duration: 2 },
            { id: '5', name: '薪资调整', type: 'automatic', order: 5, duration: 1 },
            { id: '6', name: '晋升通知', type: 'notification', assignee: '系统', order: 6 },
          ],
          avgDuration: 8,
          totalInstances: 28,
          successRate: 92,
          lastUsed: '2024-02-20',
          icon: TrendingUp,
          color: 'bg-purple-500',
        },
        {
          id: 'WF-004',
          name: '转岗审批流程',
          description: '员工内部转岗流程，包括转岗申请、部门协调、交接安排等',
          type: 'transfer',
          status: 'active',
          priority: 'medium',
          version: 'v1.2',
          steps: [
            { id: '1', name: '转岗申请', type: 'task', assignee: '员工', order: 1, duration: 1 },
            { id: '2', name: '现部门审批', type: 'approval', assignee: '现部门负责人', order: 2, duration: 2 },
            { id: '3', name: '新部门审批', type: 'approval', assignee: '新部门负责人', order: 3, duration: 2 },
            { id: '4', name: 'HR审批', type: 'approval', assignee: 'HR部门', order: 4, duration: 2 },
            { id: '5', name: '工作交接', type: 'task', assignee: '员工', order: 5, duration: 3 },
            { id: '6', name: '岗位调整', type: 'automatic', order: 6, duration: 1 },
          ],
          avgDuration: 6,
          totalInstances: 35,
          successRate: 94,
          lastUsed: '2024-02-18',
          icon: ArrowRightLeft,
          color: 'bg-blue-500',
        },
        {
          id: 'WF-005',
          name: '调薪审批流程',
          description: '员工薪资调整审批流程，包括调薪申请、审批确认、薪资生效等',
          type: 'salary',
          status: 'active',
          priority: 'medium',
          version: 'v1.3',
          steps: [
            { id: '1', name: '调薪申请', type: 'task', assignee: '部门负责人', order: 1, duration: 1 },
            { id: '2', name: 'HR审核', type: 'task', assignee: 'HR部门', order: 2, duration: 2 },
            { id: '3', name: '部门审批', type: 'approval', assignee: '部门负责人', order: 3, duration: 2 },
            { id: '4', name: '财务审批', type: 'approval', assignee: '财务总监', order: 4, duration: 2 },
            { id: '5', name: '薪资更新', type: 'automatic', order: 5, duration: 1 },
            { id: '6', name: '薪资通知', type: 'notification', assignee: '系统', order: 6 },
          ],
          avgDuration: 5,
          totalInstances: 67,
          successRate: 96,
          lastUsed: '2024-02-15',
          icon: DollarSign,
          color: 'bg-orange-500',
        },
      ]);

      setInstances([
        {
          id: 'INST-001',
          workflowType: 'onboarding',
          employeeName: '张伟',
          employeeId: 'E100',
          status: 'in-progress',
          currentStep: '入职培训',
          startedAt: '2024-02-20',
          initiator: '李HR',
          data: { position: '前端工程师', department: '技术部' },
        },
        {
          id: 'INST-002',
          workflowType: 'offboarding',
          employeeName: '李明',
          employeeId: 'E056',
          status: 'in-progress',
          currentStep: '工作交接',
          startedAt: '2024-02-25',
          initiator: '李明',
          data: { reason: '个人发展', lastDay: '2024-03-05' },
        },
        {
          id: 'INST-003',
          workflowType: 'promotion',
          employeeName: '王芳',
          employeeId: 'E089',
          status: 'pending',
          currentStep: '晋升提名',
          startedAt: '2024-02-28',
          initiator: '张技术总监',
          data: { currentPosition: '高级工程师', newPosition: '技术专家' },
        },
        {
          id: 'INST-004',
          workflowType: 'salary',
          employeeName: '赵六',
          employeeId: 'E123',
          status: 'completed',
          currentStep: '薪资通知',
          startedAt: '2024-02-10',
          completedAt: '2024-02-15',
          initiator: '李销售总监',
          data: { currentSalary: 25000, newSalary: 28000 },
        },
        {
          id: 'INST-005',
          workflowType: 'transfer',
          employeeName: '孙七',
          employeeId: 'E145',
          status: 'pending',
          currentStep: '现部门审批',
          startedAt: '2024-02-27',
          initiator: '孙七',
          data: { currentDepartment: '销售部', newDepartment: '市场部' },
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleStartWorkflow = (type: WorkflowType) => {
    toast.info(`启动${type}流程`);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstances = instances.filter(i =>
    i.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const workflowTypeConfig: Record<WorkflowType, { label: string; icon: any; color: string }> = {
    onboarding: { label: '入职流程', icon: UserPlus, color: 'bg-green-500' },
    offboarding: { label: '离职流程', icon: UserMinus, color: 'bg-red-500' },
    promotion: { label: '晋升流程', icon: TrendingUp, color: 'bg-purple-500' },
    transfer: { label: '转岗流程', icon: ArrowRightLeft, color: 'bg-blue-500' },
    salary: { label: '调薪流程', icon: DollarSign, color: 'bg-orange-500' },
  };

  const statusConfig: Record<WorkflowInstance['status'] | WorkflowStatus, { label: string; color: string; icon: any }> = {
    active: { label: '启用', color: 'bg-green-500', icon: Play },
    paused: { label: '暂停', color: 'bg-yellow-500', icon: Pause },
    draft: { label: '草稿', color: 'bg-gray-500', icon: FileText },
    pending: { label: '待处理', color: 'bg-blue-500', icon: Clock },
    'in-progress': { label: '进行中', color: 'bg-purple-500', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-600', icon: CheckCircle },
    rejected: { label: '已拒绝', color: 'bg-red-600', icon: AlertCircle },
  };

  const statistics = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.status === 'active').length,
    totalInstances: instances.length,
    inProgress: instances.filter(i => i.status === 'in-progress').length,
    pending: instances.filter(i => i.status === 'pending').length,
    completed: instances.filter(i => i.status === 'completed').length,
    avgSuccessRate: templates.length > 0 ? templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layers className="h-8 w-8 text-blue-600" />
              工作流中心
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理和监控企业人事流程，提升流程效率
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            创建流程
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">流程模板</p>
                  <p className="text-2xl font-bold">{statistics.totalTemplates}</p>
                </div>
                <Layers className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">启用模板</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.activeTemplates}</p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">流程实例</p>
                  <p className="text-2xl font-bold">{statistics.totalInstances}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
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
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">待处理</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">成功率</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.avgSuccessRate.toFixed(0)}%</p>
                </div>
                <BarChart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('templates')}
          >
            <Layers className="h-4 w-4 mr-2" />
            流程模板
          </Button>
          <Button
            variant={activeTab === 'instances' ? 'default' : 'outline'}
            onClick={() => setActiveTab('instances')}
          >
            <FileText className="h-4 w-4 mr-2" />
            流程实例
          </Button>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === 'templates' ? '搜索流程模板...' : '搜索流程实例...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 流程模板 */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无流程模板</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const Icon = template.icon;
                const StatusIcon = statusConfig[template.status].icon;
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 ${template.color} rounded-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <Badge className={statusConfig[template.status].color + ' text-white border-0 flex items-center gap-1'}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig[template.status].label}
                              </Badge>
                            </div>
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">版本</p>
                          <p className="font-semibold">{template.version}</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">步骤数</p>
                          <p className="font-semibold">{template.steps.length}</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">平均时长</p>
                          <p className="font-semibold">{template.avgDuration}天</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400">成功率</p>
                          <p className="font-semibold text-green-600">{template.successRate}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>使用次数：{template.totalInstances}</span>
                        <span>最后使用：{template.lastUsed}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑流程
                        </Button>
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Play className="h-4 w-4 mr-1" />
                          启动流程
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* 流程实例 */}
        {activeTab === 'instances' && (
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无流程实例</p>
              </div>
            ) : (
              filteredInstances.map((instance) => {
                const config = workflowTypeConfig[instance.workflowType];
                const Icon = config.icon;
                const StatusIcon = statusConfig[instance.status].icon;
                return (
                  <Card key={instance.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${config.color} rounded-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{instance.employeeName}</h3>
                              <Badge variant="outline">{instance.employeeId}</Badge>
                              <Badge className={statusConfig[instance.status].color + ' text-white border-0 flex items-center gap-1'}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig[instance.status].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>{config.label}</span>
                              <span>当前步骤：{instance.currentStep}</span>
                              <span>发起人：{instance.initiator}</span>
                              <span>开始时间：{instance.startedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看详情
                          </Button>
                          {instance.status === 'pending' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Play className="h-4 w-4 mr-1" />
                              处理
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
        )}

        {/* 快速启动 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              快速启动流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(workflowTypeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleStartWorkflow(type as WorkflowType)}
                >
                  <div className={`p-2 ${config.color} rounded-lg`}>
                    <config.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm">{config.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
