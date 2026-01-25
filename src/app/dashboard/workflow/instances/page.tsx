'use client';

import { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  RotateCcw,
  User,
  FileText,
} from 'lucide-react';

interface ApprovalRecord {
  id: string;
  nodeId: string;
  nodeName: string;
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected' | 'pending' | 'skipped';
  comment?: string;
  actedAt: string;
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  businessType: string;
  companyId: string;
  requesterId: string;
  requesterName: string;
  currentNodeId: string;
  currentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  businessData: Record<string, any>;
  approvals: ApprovalRecord[];
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowInstances() {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    businessType: '',
    keyword: '',
  });

  // 详情对话框
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);

  // 审批对话框
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    action: 'approved' as 'approved' | 'rejected',
    comment: '',
  });

  // 获取流程实例列表
  const fetchInstances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.businessType) params.append('businessType', filter.businessType);
      if (filter.keyword) params.append('keyword', filter.keyword);

      const response = await fetch(`/api/workflow/instances?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setInstances(data.data || []);
      }
    } catch (error) {
      console.error('获取流程实例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 审批操作
  const handleApproval = async () => {
    if (!selectedInstance) return;

    try {
      const response = await fetch(`/api/workflow/instances/${selectedInstance.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalForm),
      });

      const data = await response.json();
      if (data.success) {
        setApprovalDialogOpen(false);
        setDetailDialogOpen(false);
        fetchInstances();
      }
    } catch (error) {
      console.error('审批操作失败:', error);
    }
  };

  // 取消流程
  const cancelInstance = async (id: string) => {
    if (!confirm('确定要取消这个流程吗？')) return;

    try {
      const response = await fetch(`/api/workflow/instances/${id}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (data.success) {
        fetchInstances();
      }
    } catch (error) {
      console.error('取消流程失败:', error);
    }
  };

  // 重启流程
  const restartInstance = async (id: string) => {
    if (!confirm('确定要重启这个流程吗？')) return;

    try {
      const response = await fetch(`/api/workflow/instances/${id}/restart`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (data.success) {
        fetchInstances();
      }
    } catch (error) {
      console.error('重启流程失败:', error);
    }
  };

  // 获取业务类型标签
  const getBusinessTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      onboarding: '入职',
      resignation: '离职',
      promotion: '晋升',
      transfer: '转岗',
      'salary-adjustment': '调薪',
      leave: '请假',
    };
    return labels[type] || type;
  };

  // 获取状态徽章
  const getStatusBadge = (status: WorkflowInstance['currentStatus']) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      cancelled: 'outline',
      completed: 'default',
    };
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝',
      cancelled: '已取消',
      completed: '已完成',
    };
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle2,
      rejected: XCircle,
      cancelled: XCircle,
      completed: CheckCircle2,
    };
    const Icon = icons[status];

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    );
  };

  // 获取审批操作徽章
  const getApprovalActionBadge = (action: ApprovalRecord['action']) => {
    const variants: Record<string, any> = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary',
      skipped: 'outline',
    };
    const labels: Record<string, string> = {
      approved: '通过',
      rejected: '拒绝',
      pending: '待审批',
      skipped: '跳过',
    };
    return (
      <Badge variant={variants[action]}>{labels[action]}</Badge>
    );
  };

  // 打开详情对话框
  const openDetailDialog = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setDetailDialogOpen(true);
  };

  // 打开审批对话框
  const openApprovalDialog = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setApprovalForm({ action: 'approved', comment: '' });
    setApprovalDialogOpen(true);
  };

  useEffect(() => {
    fetchInstances();
  }, [filter]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工作流实例</h1>
          <p className="text-muted-foreground mt-1">
            查看和管理工作流程实例
          </p>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>状态</Label>
              <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>业务类型</Label>
              <Select value={filter.businessType} onValueChange={(value) => setFilter({ ...filter, businessType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部类型</SelectItem>
                  <SelectItem value="onboarding">入职</SelectItem>
                  <SelectItem value="resignation">离职</SelectItem>
                  <SelectItem value="promotion">晋升</SelectItem>
                  <SelectItem value="transfer">转岗</SelectItem>
                  <SelectItem value="salary-adjustment">调薪</SelectItem>
                  <SelectItem value="leave">请假</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>关键词</Label>
              <Input
                placeholder="搜索发起人、流程名称"
                value={filter.keyword}
                onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setFilter({ status: '', businessType: '', keyword: '' })} variant="outline" className="w-full">
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 流程实例列表 */}
      <Card>
        <CardHeader>
          <CardTitle>流程实例列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>流程名称</TableHead>
                <TableHead>业务类型</TableHead>
                <TableHead>发起人</TableHead>
                <TableHead>当前节点</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    暂无流程实例
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.definitionName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getBusinessTypeLabel(instance.businessType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {instance.requesterName}
                      </div>
                    </TableCell>
                    <TableCell>{instance.currentNodeId || '-'}</TableCell>
                    <TableCell>{getStatusBadge(instance.currentStatus)}</TableCell>
                    <TableCell>
                      {new Date(instance.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openDetailDialog(instance)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {instance.currentStatus === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => openApprovalDialog(instance)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            审批
                          </Button>
                        )}
                        {instance.currentStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelInstance(instance.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {instance.currentStatus === 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restartInstance(instance.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            重启
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

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>流程详情</DialogTitle>
            <DialogDescription>
              {selectedInstance && selectedInstance.definitionName}
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>流程名称</Label>
                  <p className="mt-1 font-medium">{selectedInstance.definitionName}</p>
                </div>
                <div>
                  <Label>业务类型</Label>
                  <p className="mt-1">{getBusinessTypeLabel(selectedInstance.businessType)}</p>
                </div>
                <div>
                  <Label>发起人</Label>
                  <p className="mt-1">{selectedInstance.requesterName}</p>
                </div>
                <div>
                  <Label>当前状态</Label>
                  <p className="mt-1">{getStatusBadge(selectedInstance.currentStatus)}</p>
                </div>
                <div>
                  <Label>开始时间</Label>
                  <p className="mt-1">{new Date(selectedInstance.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>完成时间</Label>
                  <p className="mt-1">{selectedInstance.completedAt ? new Date(selectedInstance.completedAt).toLocaleString() : '未完成'}</p>
                </div>
              </div>

              {/* 业务数据 */}
              <div>
                <Label>业务数据</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedInstance.businessData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* 审批记录 */}
              <div>
                <Label>审批记录</Label>
                <div className="mt-2 space-y-2">
                  {selectedInstance.approvals.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无审批记录</p>
                  ) : (
                    selectedInstance.approvals.map((approval) => (
                      <div key={approval.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getApprovalActionBadge(approval.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{approval.nodeName}</span>
                            <span className="text-sm text-gray-500">· {approval.approverName}</span>
                          </div>
                          {approval.comment && (
                            <p className="mt-1 text-sm text-gray-600">{approval.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(approval.actedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              {selectedInstance.currentStatus === 'pending' && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => cancelInstance(selectedInstance.id)}>
                    取消流程
                  </Button>
                  <Button onClick={() => {
                    setDetailDialogOpen(false);
                    openApprovalDialog(selectedInstance);
                  }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    立即审批
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 审批对话框 */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审批操作</DialogTitle>
            <DialogDescription>
              请对该流程进行审批
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>审批意见</Label>
              <Textarea
                value={approvalForm.comment}
                onChange={(e) => setApprovalForm({ ...approvalForm, comment: e.target.value })}
                placeholder="请输入审批意见"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => setApprovalForm({ ...approvalForm, action: 'rejected' })}
            >
              <X className="h-4 w-4 mr-2" />
              拒绝
            </Button>
            <Button onClick={handleApproval}>
              <Check className="h-4 w-4 mr-2" />
              通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
