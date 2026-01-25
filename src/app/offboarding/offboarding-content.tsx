'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Eye,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

// 性能优化工具
import { useDebounce, useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  level: string;
  joinDate: string;
  lastWorkDay: string;
  resignationType: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  handoverStatus: 'not_started' | 'in_progress' | 'completed';
  interviewStatus: 'not_scheduled' | 'scheduled' | 'completed' | 'declined';
  appliedAt: string;
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
}

export default function OffboardingPageContent() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OffboardingRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OffboardingRecord | null>(null);
  const [currentPage, setCurrentPage] = useLocalStorage('offboarding-page', 1);

  const [formData, setFormData] = useState({
    employeeId: '',
    lastWorkDay: '',
    resignationType: 'voluntary' as const,
    reason: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    status: '',
    resignationType: '',
  });

  const [debouncedKeyword] = useDebounce(filters.keyword, 300);

  // 获取离职记录
  const {
    data: records = [],
    loading,
    error,
    execute: fetchRecords,
  } = useAsync<OffboardingRecord[]>();

  // 加载数据
  useEffect(() => {
    loadOffboardingRecords();
  }, [filters, debouncedKeyword, currentPage]);

  const loadOffboardingRecords = useCallback(async () => {
    try {
      const cacheKey = `offboarding-records-${currentPage}-${JSON.stringify(filters)}-${debouncedKeyword}`;
      return await fetchWithCache<OffboardingRecord[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          ...(debouncedKeyword && { keyword: debouncedKeyword }),
          ...(filters.department && { department: filters.department }),
          ...(filters.status && { status: filters.status }),
          ...(filters.resignationType && { resignationType: filters.resignationType }),
        });

        const response = await get<{ success: boolean; data?: OffboardingRecord[]; total?: number }>(
          `/api/offboarding/records?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000); // 3分钟缓存
    } catch (err) {
      console.error('获取离职记录失败:', err);
      monitor.trackError('loadOffboardingRecords', err as Error);
      throw err;
    }
  }, [filters, debouncedKeyword, currentPage]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(records.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  }, [records]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  }, [selectedIds]);

  const handleAddRecord = useCallback(() => {
    setEditingRecord(null);
    setFormData({
      employeeId: '',
      lastWorkDay: '',
      resignationType: 'voluntary',
      reason: '',
    });
    setDialogOpen(true);
  }, []);

  const handleEditRecord = useCallback((record: OffboardingRecord) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      lastWorkDay: record.lastWorkDay,
      resignationType: record.resignationType,
      reason: record.reason,
    });
    setDialogOpen(true);
  }, []);

  const handleViewRecord = useCallback((record: OffboardingRecord) => {
    setViewingRecord(record);
  }, []);

  const handleSaveRecord = useCallback(async () => {
    try {
      const endpoint = editingRecord
        ? `/api/offboarding/records/${editingRecord.id}`
        : '/api/offboarding/records';

      const response = await post<{ success: boolean; message?: string }>(
        endpoint,
        {
          ...formData,
          ...(editingRecord && { id: editingRecord.id }),
        }
      );

      if (response.success) {
        setDialogOpen(false);
        await fetchRecords();
      }
    } catch (err) {
      console.error('保存离职记录失败:', err);
      monitor.trackError('saveOffboardingRecord', err as Error);
      alert('操作失败');
    }
  }, [editingRecord, formData, fetchRecords]);

  const handleDeleteRecord = useCallback(async (id: string) => {
    if (!confirm('确定要删除该离职记录吗？')) {
      return;
    }

    try {
      await del<{ success: boolean }>(`/api/offboarding/records/${id}`);
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
      await fetchRecords();
    } catch (err) {
      console.error('删除离职记录失败:', err);
      monitor.trackError('deleteOffboardingRecord', err as Error);
      alert('操作失败');
    }
  }, [selectedIds, fetchRecords]);

  // 统计数据
  const stats = useMemo(() => ({
    total: records.length,
    pending: records.filter((item: any) => (r) => r.status === 'pending').length,
    processing: records.filter((item: any) => (r) => r.status === 'processing').length,
    completed: records.filter((item: any) => (r) => r.status === 'completed').length,
  }), [records]);

  // 过滤后的记录
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (debouncedKeyword) {
      result = result.filter((item: any) => r =>
        r.employeeName.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(debouncedKeyword.toLowerCase())
      );
    }

    return result;
  }, [records, debouncedKeyword]);

  const getResignationTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      voluntary: '自愿离职',
      involuntary: '非自愿离职',
      retirement: '退休',
      contract_end: '合同到期',
    };
    return labels[type] || type;
  }, []);

  const getResignationTypeColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      voluntary: 'bg-blue-100 text-blue-700',
      involuntary: 'bg-red-100 text-red-700',
      retirement: 'bg-green-100 text-green-700',
      contract_end: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-700', icon: Clock },
      completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: FileText,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  }, []);

  const getHandoverBadge = useCallback((status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      not_started: { label: '未开始', color: 'bg-gray-100 text-gray-700' },
      in_progress: { label: '进行中', color: 'bg-yellow-100 text-yellow-700' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={color}>{label}</Badge>;
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={fetchRecords} variant="outline">
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
            <FileText className="h-6 w-6 text-red-500" />
            离职管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理员工离职申请、交接、访谈
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            onClick={handleAddRecord}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建离职
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总离职数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待审批</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">处理中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <Input
                placeholder="搜索员工姓名、工号"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>部门</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部部门</SelectItem>
                  <SelectItem value="研发部">研发部</SelectItem>
                  <SelectItem value="产品部">产品部</SelectItem>
                  <SelectItem value="销售部">销售部</SelectItem>
                  <SelectItem value="市场部">市场部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>离职类型</Label>
              <Select
                value={filters.resignationType}
                onValueChange={(value) => setFilters({ ...filters, resignationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部类型</SelectItem>
                  <SelectItem value="voluntary">自愿离职</SelectItem>
                  <SelectItem value="involuntary">非自愿离职</SelectItem>
                  <SelectItem value="retirement">退休</SelectItem>
                  <SelectItem value="contract_end">合同到期</SelectItem>
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
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', department: '', status: '', resignationType: '' })}>
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
                  <Download className="h-4 w-4 mr-2" />
                  导出选中
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 离职记录列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>员工信息</TableHead>
                <TableHead>部门/职位</TableHead>
                <TableHead>入职日期</TableHead>
                <TableHead>最后工作日</TableHead>
                <TableHead>离职类型</TableHead>
                <TableHead>离职原因</TableHead>
                <TableHead>交接状态</TableHead>
                <TableHead>访谈状态</TableHead>
                <TableHead>流程状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <Skeleton className="h-12" />
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectOne(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">{record.level}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{record.department}</div>
                        <div className="text-sm text-gray-500">{record.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.joinDate}</TableCell>
                    <TableCell className="font-medium">{record.lastWorkDay}</TableCell>
                    <TableCell>
                      <Badge className={getResignationTypeColor(record.resignationType)}>
                        {getResignationTypeLabel(record.resignationType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{record.reason}</TableCell>
                    <TableCell>{getHandoverBadge(record.handoverStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.interviewStatus === 'not_scheduled' && '未安排'}
                        {record.interviewStatus === 'scheduled' && '已安排'}
                        {record.interviewStatus === 'completed' && '已完成'}
                        {record.interviewStatus === 'declined' && '已拒绝'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {record.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* 新建/编辑离职对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRecord ? '编辑离职记录' : '新建离职申请'}</DialogTitle>
            <DialogDescription>
              {editingRecord ? '修改离职信息' : '创建新的离职申请'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employeeId">员工ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="输入员工ID"
              />
            </div>
            <div>
              <Label htmlFor="lastWorkDay">最后工作日 *</Label>
              <Input
                id="lastWorkDay"
                type="date"
                value={formData.lastWorkDay}
                onChange={(e) => setFormData({ ...formData, lastWorkDay: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="resignationType">离职类型 *</Label>
              <Select
                value={formData.resignationType}
                onValueChange={(value: any) => setFormData({ ...formData, resignationType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voluntary">自愿离职</SelectItem>
                  <SelectItem value="involuntary">非自愿离职</SelectItem>
                  <SelectItem value="retirement">退休</SelectItem>
                  <SelectItem value="contract_end">合同到期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">离职原因 *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="请输入离职原因"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveRecord}>
                提交申请
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看离职详情对话框 */}
      <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>离职详情</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>员工姓名</Label>
                  <p className="font-medium">{viewingRecord.employeeName}</p>
                </div>
                <div>
                  <Label>部门</Label>
                  <p>{viewingRecord.department}</p>
                </div>
                <div>
                  <Label>职位</Label>
                  <p>{viewingRecord.position}</p>
                </div>
                <div>
                  <Label>职级</Label>
                  <p>{viewingRecord.level}</p>
                </div>
                <div>
                  <Label>入职日期</Label>
                  <p>{viewingRecord.joinDate}</p>
                </div>
                <div>
                  <Label>最后工作日</Label>
                  <p className="font-medium">{viewingRecord.lastWorkDay}</p>
                </div>
                <div>
                  <Label>离职类型</Label>
                  <Badge className={getResignationTypeColor(viewingRecord.resignationType)}>
                    {getResignationTypeLabel(viewingRecord.resignationType)}
                  </Badge>
                </div>
                <div>
                  <Label>申请时间</Label>
                  <p className="text-sm text-gray-600">{viewingRecord.appliedAt}</p>
                </div>
              </div>
              <div>
                <Label>离职原因</Label>
                <p className="text-sm">{viewingRecord.reason}</p>
              </div>
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label>交接状态</Label>
                  <p>{getHandoverBadge(viewingRecord.handoverStatus)}</p>
                </div>
                <div>
                  <Label>访谈状态</Label>
                  <Badge variant="outline">
                    {viewingRecord.interviewStatus === 'not_scheduled' && '未安排'}
                    {viewingRecord.interviewStatus === 'scheduled' && '已安排'}
                    {viewingRecord.interviewStatus === 'completed' && '已完成'}
                    {viewingRecord.interviewStatus === 'declined' && '已拒绝'}
                  </Badge>
                </div>
                <div>
                  <Label>流程状态</Label>
                  <p>{getStatusBadge(viewingRecord.status)}</p>
                </div>
                {viewingRecord.approverName && (
                  <div>
                    <Label>审批人</Label>
                    <p className="text-sm">{viewingRecord.approverName}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setViewingRecord(null)}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
