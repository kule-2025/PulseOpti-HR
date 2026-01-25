'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit,
  Trash2,
  GitBranch,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Circle,
  Loader2,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'approval' | 'notify' | 'end';
  approvers?: string[];
  timeout?: number;
}

interface Workflow {
  id: string;
  name: string;
  type: 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary' | 'custom';
  category: string;
  status: 'active' | 'draft' | 'paused';
  description: string;
  nodes: WorkflowNode[];
  totalSteps: number;
  avgDuration: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
  creator: string;
}

export default function WorkflowPageContent() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    type: 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary' | 'custom';
    description: string;
  }>({
    name: '',
    type: 'onboarding',
    description: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchWorkflows();
  }, [filters, pagination.page]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: '新员工入职流程',
          type: 'onboarding',
          category: '入职管理',
          status: 'active',
          description: '新员工入职标准流程，包含信息录入、设备领取、培训安排等',
          nodes: [
            { id: '1', name: '开始', type: 'start' },
            { id: '2', name: 'HR审批', type: 'approval', approvers: ['HR总监'] },
            { id: '3', name: '部门确认', type: 'approval', approvers: ['部门负责人'] },
            { id: '4', name: 'IT配置', type: 'notify', timeout: 1 },
            { id: '5', name: '结束', type: 'end' },
          ],
          totalSteps: 5,
          avgDuration: 3,
          totalCount: 156,
          successCount: 148,
          failCount: 8,
          createdAt: '2024-01-15',
          updatedAt: '2024-03-20',
          creator: '张三',
        },
        {
          id: '2',
          name: '离职申请流程',
          type: 'offboarding',
          category: '离职管理',
          status: 'active',
          description: '员工离职申请审批流程，包含交接确认、资产回收等',
          nodes: [
            { id: '1', name: '开始', type: 'start' },
            { id: '2', name: '部门审批', type: 'approval', approvers: ['部门负责人'] },
            { id: '3', name: 'HR确认', type: 'approval', approvers: ['HR经理'] },
            { id: '4', name: '交接确认', type: 'approval', approvers: ['交接人'] },
            { id: '5', name: '资产回收', type: 'notify', timeout: 2 },
            { id: '6', name: '结束', type: 'end' },
          ],
          totalSteps: 6,
          avgDuration: 5,
          totalCount: 45,
          successCount: 42,
          failCount: 3,
          createdAt: '2024-02-01',
          updatedAt: '2024-03-25',
          creator: '李四',
        },
        {
          id: '3',
          name: '晋升申请流程',
          type: 'promotion',
          category: '晋升管理',
          status: 'active',
          description: '员工晋升申请审批流程，包含绩效评估、多级审批',
          nodes: [
            { id: '1', name: '开始', type: 'start' },
            { id: '2', name: '直属主管审批', type: 'approval', approvers: ['直属主管'] },
            { id: '3', name: '部门负责人审批', type: 'approval', approvers: ['部门负责人'] },
            { id: '4', name: 'HRBP评估', type: 'approval', approvers: ['HRBP'] },
            { id: '5', name: '总经理审批', type: 'approval', approvers: ['总经理'] },
            { id: '6', name: '结束', type: 'end' },
          ],
          totalSteps: 6,
          avgDuration: 7,
          totalCount: 32,
          successCount: 28,
          failCount: 4,
          createdAt: '2024-01-20',
          updatedAt: '2024-03-15',
          creator: '王五',
        },
        {
          id: '4',
          name: '调薪申请流程',
          type: 'salary',
          category: '薪酬管理',
          status: 'paused',
          description: '员工调薪申请审批流程，包含薪酬评估、预算审核',
          nodes: [
            { id: '1', name: '开始', type: 'start' },
            { id: '2', name: '部门负责人审批', type: 'approval', approvers: ['部门负责人'] },
            { id: '3', name: 'HR薪酬评估', type: 'approval', approvers: ['薪酬主管'] },
            { id: '4', name: '财务审核', type: 'approval', approvers: ['财务总监'] },
            { id: '5', name: '结束', type: 'end' },
          ],
          totalSteps: 5,
          avgDuration: 4,
          totalCount: 28,
          successCount: 25,
          failCount: 3,
          createdAt: '2024-02-10',
          updatedAt: '2024-03-28',
          creator: '赵六',
        },
        {
          id: '5',
          name: '转岗申请流程',
          type: 'transfer',
          category: '转岗管理',
          status: 'draft',
          description: '员工内部转岗申请流程，包含双方部门确认',
          nodes: [
            { id: '1', name: '开始', type: 'start' },
            { id: '2', name: '当前部门同意', type: 'approval', approvers: ['当前部门负责人'] },
            { id: '3', name: '目标部门同意', type: 'approval', approvers: ['目标部门负责人'] },
            { id: '4', name: 'HR确认', type: 'approval', approvers: ['HR经理'] },
            { id: '5', name: '结束', type: 'end' },
          ],
          totalSteps: 5,
          avgDuration: 3,
          totalCount: 0,
          successCount: 0,
          failCount: 0,
          createdAt: '2024-03-01',
          updatedAt: '2024-03-01',
          creator: '钱七',
        },
      ];

      setWorkflows(mockWorkflows);
      setPagination((prev) => ({
        ...prev,
        total: mockWorkflows.length,
      }));
    } catch (error) {
      console.error('获取工作流列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(workflows.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  };

  const handleAddWorkflow = () => {
    setEditingWorkflow(null);
    setFormData({
      name: '',
      type: 'onboarding',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      type: workflow.type,
      description: workflow.description,
    });
    setDialogOpen(true);
  };

  const handleSaveWorkflow = async () => {
    try {
      alert('保存功能开发中...');
      setDialogOpen(false);
    } catch (error) {
      console.error('保存工作流失败:', error);
      alert('操作失败');
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('确定要激活该工作流吗？')) {
      return;
    }
    alert('激活功能开发中...');
  };

  const handlePause = async (id: string) => {
    if (!confirm('确定要暂停该工作流吗？')) {
      return;
    }
    alert('暂停功能开发中...');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该工作流吗？')) {
      return;
    }
    alert('删除功能开发中...');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      onboarding: '入职',
      offboarding: '离职',
      promotion: '晋升',
      transfer: '转岗',
      salary: '调薪',
      custom: '自定义',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      onboarding: 'bg-green-100 text-green-700',
      offboarding: 'bg-red-100 text-red-700',
      promotion: 'bg-blue-100 text-blue-700',
      transfer: 'bg-purple-100 text-purple-700',
      salary: 'bg-yellow-100 text-yellow-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      active: { label: '运行中', color: 'bg-green-100 text-green-700', icon: Play },
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: Edit },
      paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-700', icon: Pause },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: Circle,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getSuccessRate = (workflow: Workflow) => {
    if (workflow.totalCount === 0) return '0%';
    return ((workflow.successCount / workflow.totalCount) * 100).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-orange-500" />
            工作流
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            入职、离职、晋升、转岗、调薪流程管理
          </p>
        </div>
        <Button
          onClick={handleAddWorkflow}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          新建工作流
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总工作流</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">运行中</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter((item: any) => (w) => w.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">草稿</p>
                <p className="text-2xl font-bold text-gray-600">
                  {workflows.filter((item: any) => (w) => w.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已暂停</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {workflows.filter((item: any) => (w) => w.status === 'paused').length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <Input
                placeholder="搜索工作流名称"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>类型</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部类型</SelectItem>
                  <SelectItem value="onboarding">入职</SelectItem>
                  <SelectItem value="offboarding">离职</SelectItem>
                  <SelectItem value="promotion">晋升</SelectItem>
                  <SelectItem value="transfer">转岗</SelectItem>
                  <SelectItem value="salary">调薪</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="active">运行中</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', type: '', status: '' })}>
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                已选择 <span className="font-bold">{selectedIds.length}</span> 项
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  批量暂停
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 工作流列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === workflows.length && workflows.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>工作流名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>总节点</TableHead>
                <TableHead>执行统计</TableHead>
                <TableHead>平均时长</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>创建人</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(workflow.id)}
                        onCheckedChange={(checked) => handleSelectOne(workflow.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-500">{workflow.category}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(workflow.type)}>
                        {getTypeLabel(workflow.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                    <TableCell className="text-center">{workflow.totalSteps}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{workflow.successCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>{workflow.failCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-4 w-4" />
                          <span>总计 {workflow.totalCount}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {workflow.avgDuration > 0 ? `${workflow.avgDuration}天` : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{getSuccessRate(workflow)}</span>
                    </TableCell>
                    <TableCell>{workflow.creator}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {workflow.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {workflow.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(workflow.id)}
                          >
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {workflow.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePause(workflow.id)}
                          >
                            <Pause className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        {workflow.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(workflow.id)}
                          >
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(workflow.id)}
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

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {pagination.total} 条记录，每页 {pagination.limit} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 新增/编辑工作流对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWorkflow ? '编辑工作流' : '新建工作流'}</DialogTitle>
            <DialogDescription>
              {editingWorkflow ? '修改工作流信息' : '创建新的工作流程'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">工作流名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：新员工入职流程"
              />
            </div>
            <div>
              <Label htmlFor="type">工作流类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">入职</SelectItem>
                  <SelectItem value="offboarding">离职</SelectItem>
                  <SelectItem value="promotion">晋升</SelectItem>
                  <SelectItem value="transfer">转岗</SelectItem>
                  <SelectItem value="salary">调薪</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="工作流描述"
                rows={3}
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                提示：创建后可在工作流编辑器中配置节点和审批流程
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveWorkflow}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
