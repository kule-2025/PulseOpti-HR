'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  TrendingUp,
  Briefcase,
  UserPlus,
} from 'lucide-react';

interface WorkflowTask {
  id: string;
  workflowType: 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary';
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  currentStep: number;
  totalSteps: number;
  startDate: string;
  targetDate: string;
  progress: number;
  steps: {
    step: number;
    name: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    assignee: string;
    completedDate?: string;
  }[];
  description: string;
}

// 模拟工作流数据
const WORKFLOW_DATA: WorkflowTask[] = [
  {
    id: '1',
    workflowType: 'onboarding',
    employeeName: '周八',
    employeeId: 'EMP008',
    department: '技术部',
    position: '后端工程师',
    status: 'in-progress',
    currentStep: 3,
    totalSteps: 5,
    startDate: '2025-01-10',
    targetDate: '2025-01-20',
    progress: 60,
    description: '新员工入职流程',
    steps: [
      { step: 1, name: '入职审批', status: 'completed', assignee: 'HRBP', completedDate: '2025-01-10' },
      { step: 2, name: '签署合同', status: 'completed', assignee: 'HRBP', completedDate: '2025-01-11' },
      { step: 3, name: '设备发放', status: 'in-progress', assignee: 'IT部门' },
      { step: 4, name: '系统账号开通', status: 'pending', assignee: 'IT部门' },
      { step: 5, name: '入职培训', status: 'pending', assignee: '培训部' },
    ],
  },
  {
    id: '2',
    workflowType: 'promotion',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '高级前端工程师',
    status: 'pending',
    currentStep: 1,
    totalSteps: 4,
    startDate: '2025-01-15',
    targetDate: '2025-02-15',
    progress: 25,
    description: '晋升申请：高级前端工程师 → 技术专家',
    steps: [
      { step: 1, name: '提交申请', status: 'pending', assignee: '张三' },
      { step: 2, name: '直属主管审批', status: 'pending', assignee: '技术经理' },
      { step: 3, name: 'HR审批', status: 'pending', assignee: 'HRBP' },
      { step: 4, name: '薪酬调整', status: 'pending', assignee: '薪酬组' },
    ],
  },
  {
    id: '3',
    workflowType: 'salary',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '销售经理',
    status: 'completed',
    currentStep: 4,
    totalSteps: 4,
    startDate: '2024-12-01',
    targetDate: '2025-01-01',
    progress: 100,
    description: '年度调薪申请',
    steps: [
      { step: 1, name: '提交申请', status: 'completed', assignee: '李四', completedDate: '2024-12-01' },
      { step: 2, name: '直属主管审批', status: 'completed', assignee: '销售总监', completedDate: '2024-12-10' },
      { step: 3, name: 'HR审批', status: 'completed', assignee: 'HRBP', completedDate: '2024-12-20' },
      { step: 4, name: '薪酬调整生效', status: 'completed', assignee: '薪酬组', completedDate: '2025-01-01' },
    ],
  },
  {
    id: '4',
    workflowType: 'offboarding',
    employeeName: '吴九',
    employeeId: 'EMP009',
    department: '市场部',
    position: '市场专员',
    status: 'in-progress',
    currentStep: 2,
    totalSteps: 6,
    startDate: '2025-01-12',
    targetDate: '2025-01-22',
    progress: 33,
    description: '员工离职流程',
    steps: [
      { step: 1, name: '离职申请', status: 'completed', assignee: '吴九', completedDate: '2025-01-12' },
      { step: 2, name: '离职面谈', status: 'in-progress', assignee: 'HRBP' },
      { step: 3, name: '工作交接', status: 'pending', assignee: '市场经理' },
      { step: 4, name: '资产归还', status: 'pending', assignee: '行政部' },
      { step: 5, name: '系统权限回收', status: 'pending', assignee: 'IT部门' },
      { step: 6, name: '离职证明', status: 'pending', assignee: 'HRBP' },
    ],
  },
  {
    id: '5',
    workflowType: 'transfer',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    position: '市场专员',
    status: 'pending',
    currentStep: 1,
    totalSteps: 3,
    startDate: '2025-01-16',
    targetDate: '2025-02-01',
    progress: 33,
    description: '转岗申请：市场专员 → 产品经理助理',
    steps: [
      { step: 1, name: '提交申请', status: 'pending', assignee: '王五' },
      { step: 2, name: '双方部门审批', status: 'pending', assignee: '部门经理' },
      { step: 3, name: 'HR审批', status: 'pending', assignee: 'HRBP' },
    ],
  },
];

const WORKFLOW_TYPE_CONFIG = {
  onboarding: {
    label: '入职流程',
    icon: UserPlus,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  offboarding: {
    label: '离职流程',
    icon: Users,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
  promotion: {
    label: '晋升流程',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  transfer: {
    label: '转岗流程',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  salary: {
    label: '调薪流程',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
};

const STATUS_CONFIG = {
  pending: {
    label: '待处理',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  'in-progress': {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  rejected: {
    label: '已拒绝',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
};

const STEP_STATUS_CONFIG = {
  pending: { color: 'bg-gray-300 dark:bg-gray-700', label: '待处理' },
  'in-progress': { color: 'bg-blue-600 dark:bg-blue-500', label: '进行中' },
  completed: { color: 'bg-green-600 dark:bg-green-500', label: '已完成' },
  skipped: { color: 'bg-gray-400 dark:bg-gray-600', label: '已跳过' },
};

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤工作流
  const filteredWorkflows = useMemo(() => {
    let workflows = WORKFLOW_DATA;

    // 按类型过滤
    if (typeFilter !== 'all') {
      workflows = workflows.filter(w => w.workflowType === typeFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      workflows = workflows.filter(w => w.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      workflows = workflows.filter(w =>
        w.employeeName.toLowerCase().includes(query) ||
        w.employeeId.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query)
      );
    }

    return workflows;
  }, [searchQuery, typeFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: WORKFLOW_DATA.length,
      pending: WORKFLOW_DATA.filter(w => w.status === 'pending').length,
      inProgress: WORKFLOW_DATA.filter(w => w.status === 'in-progress').length,
      completed: WORKFLOW_DATA.filter(w => w.status === 'completed').length,
      avgProgress: WORKFLOW_DATA.reduce((sum, w) => sum + w.progress, 0) / WORKFLOW_DATA.length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            工作流管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            入职、离职、晋升、转岗、调薪流程管理
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>工作流总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              待处理
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              进行中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均进度</CardDescription>
            <CardTitle className="text-3xl">{stats.avgProgress.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Button variant="outline" className="h-auto flex-col py-6 gap-2">
          <UserPlus className="h-6 w-6 text-green-600" />
          <span>入职流程</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col py-6 gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          <span>晋升流程</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col py-6 gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <span>转岗流程</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col py-6 gap-2">
          <FileText className="h-6 w-6 text-orange-600" />
          <span>调薪流程</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col py-6 gap-2">
          <Users className="h-6 w-6 text-red-600" />
          <span>离职流程</span>
        </Button>
      </div>

      {/* 工作流列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>工作流列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索工作流..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部类型</option>
                {Object.entries(WORKFLOW_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部状态</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无工作流
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有工作流
                </p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => {
                const typeConfig = WORKFLOW_TYPE_CONFIG[workflow.workflowType];
                const statusConfig = STATUS_CONFIG[workflow.status];
                const TypeIcon = typeConfig.icon;

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 流程类型 */}
                        <div className={`p-3 rounded-lg ${typeConfig.color} shrink-0`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>

                        {/* 流程信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {workflow.description}
                                </h3>
                                <Badge variant="outline" className={statusConfig.color}>
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {workflow.employeeName} · {workflow.employeeId}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {workflow.department} · {workflow.position}
                              </p>
                            </div>
                          </div>

                          {/* 步骤进度 */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                进度 ({workflow.currentStep}/{workflow.totalSteps})
                              </span>
                              <span className="font-medium">{workflow.progress}%</span>
                            </div>
                            <Progress value={workflow.progress} className="h-2 mb-4" />

                            {/* 步骤列表 */}
                            <div className="space-y-2">
                              {workflow.steps.map((step) => {
                                const stepStatus = STEP_STATUS_CONFIG[step.status];

                                return (
                                  <div
                                    key={step.step}
                                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${stepStatus.color}`}
                                    >
                                      {step.step}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {step.name}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                        负责人: {step.assignee}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${stepStatus.color}`}>
                                      {stepStatus.label}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 时间信息 */}
                        <div className="w-40 shrink-0 px-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>开始: {workflow.startDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>目标: {workflow.targetDate}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          {workflow.status !== 'completed' && (
                            <Button size="sm">
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
        </CardContent>
      </Card>
    </div>
  );
}
