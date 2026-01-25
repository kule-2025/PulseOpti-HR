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
  Download,
  Upload,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
  Building2,
  Wallet,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  performanceBonus: number;
  overtimePay: number;
  subsidy: number;
  deduction: number;
  totalSalary: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  paymentDate: string;
  notes: string;
}

export default function SalaryPageContent() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<SalaryRecord | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    baseSalary: 0,
    performanceBonus: 0,
    overtimePay: 0,
    subsidy: 0,
    deduction: 0,
    notes: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    status: '',
    month: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchSalaryRecords();
  }, [filters, pagination.page]);

  const fetchSalaryRecords = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockRecords: SalaryRecord[] = [
        {
          id: '1',
          employeeId: '1',
          employeeName: '张三',
          department: '研发部',
          position: '高级工程师',
          month: '2024-03',
          baseSalary: 20000,
          performanceBonus: 3000,
          overtimePay: 500,
          subsidy: 800,
          deduction: 0,
          totalSalary: 24300,
          status: 'paid',
          paymentDate: '2024-04-05',
          notes: '正常发放',
        },
        {
          id: '2',
          employeeId: '2',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          month: '2024-03',
          baseSalary: 18000,
          performanceBonus: 2000,
          overtimePay: 200,
          subsidy: 600,
          deduction: 0,
          totalSalary: 20800,
          status: 'paid',
          paymentDate: '2024-04-05',
          notes: '',
        },
        {
          id: '3',
          employeeId: '3',
          employeeName: '王五',
          department: '销售部',
          position: '销售专员',
          month: '2024-03',
          baseSalary: 15000,
          performanceBonus: 5000,
          overtimePay: 0,
          subsidy: 400,
          deduction: 100,
          totalSalary: 20300,
          status: 'paid',
          paymentDate: '2024-04-05',
          notes: '扣款：迟到',
        },
        {
          id: '4',
          employeeId: '4',
          employeeName: '赵六',
          department: '研发部',
          position: '实习生',
          month: '2024-03',
          baseSalary: 3000,
          performanceBonus: 500,
          overtimePay: 0,
          subsidy: 200,
          deduction: 0,
          totalSalary: 3700,
          status: 'approved',
          paymentDate: '',
          notes: '',
        },
        {
          id: '5',
          employeeId: '5',
          employeeName: '钱七',
          department: '市场部',
          position: '市场专员',
          month: '2024-04',
          baseSalary: 14000,
          performanceBonus: 1500,
          overtimePay: 300,
          subsidy: 500,
          deduction: 0,
          totalSalary: 16300,
          status: 'pending',
          paymentDate: '',
          notes: '',
        },
      ];

      setSalaryRecords(mockRecords);
      setPagination((prev) => ({
        ...prev,
        total: mockRecords.length,
      }));
    } catch (error) {
      console.error('获取薪资记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(salaryRecords.map((r) => r.id));
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

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      employeeId: '',
      month: '',
      baseSalary: 0,
      performanceBonus: 0,
      overtimePay: 0,
      subsidy: 0,
      deduction: 0,
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditRecord = (record: SalaryRecord) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      month: record.month,
      baseSalary: record.baseSalary,
      performanceBonus: record.performanceBonus,
      overtimePay: record.overtimePay,
      subsidy: record.subsidy,
      deduction: record.deduction,
      notes: record.notes,
    });
    setDialogOpen(true);
  };

  const handleViewRecord = (record: SalaryRecord) => {
    setViewingRecord(record);
  };

  const handleSaveRecord = async () => {
    try {
      alert('保存功能开发中...');
      setDialogOpen(false);
    } catch (error) {
      console.error('保存薪资记录失败:', error);
      alert('操作失败');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('确定要审批通过吗？')) {
      return;
    }
    alert('审批功能开发中...');
  };

  const handleReject = async (id: string) => {
    if (!confirm('确定要拒绝吗？')) {
      return;
    }
    alert('拒绝功能开发中...');
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要审批的记录');
      return;
    }
    if (!confirm(`确定要批量审批 ${selectedIds.length} 条记录吗？`)) {
      return;
    }
    alert('批量审批功能开发中...');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: FileText },
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: '已审批', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: XCircle },
      paid: { label: '已发放', color: 'bg-green-100 text-green-700', icon: CheckCircle },
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
  };

  const calculateTotal = () => {
    return formData.baseSalary + formData.performanceBonus + formData.overtimePay + formData.subsidy - formData.deduction;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-green-500" />
            薪酬管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            薪资发放、工资单管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出工资单
          </Button>
          <Button
            onClick={handleAddRecord}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建工资单
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">本月发放总额</p>
                <p className="text-2xl font-bold">
                  ¥{salaryRecords.reduce((sum, r) => sum + r.totalSalary, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已发放</p>
                <p className="text-2xl font-bold text-green-600">
                  {salaryRecords.filter((item: any) => (r) => r.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待审批</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {salaryRecords.filter((item: any) => (r) => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已审批</p>
                <p className="text-2xl font-bold text-blue-600">
                  {salaryRecords.filter((item: any) => (r) => r.status === 'approved').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
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
                placeholder="搜索员工姓名"
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
              <Label>月份</Label>
              <Select
                value={filters.month}
                onValueChange={(value) => setFilters({ ...filters, month: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部月份</SelectItem>
                  <SelectItem value="2024-04">2024-04</SelectItem>
                  <SelectItem value="2024-03">2024-03</SelectItem>
                  <SelectItem value="2024-02">2024-02</SelectItem>
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
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="approved">已审批</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="paid">已发放</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', department: '', status: '', month: '' })}>
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
                  批量导出
                </Button>
                <Button variant="outline" size="sm" onClick={handleBatchApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  批量审批
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 薪资记录列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === salaryRecords.length && salaryRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>员工信息</TableHead>
                <TableHead>部门/职位</TableHead>
                <TableHead>月份</TableHead>
                <TableHead>基本工资</TableHead>
                <TableHead>绩效奖金</TableHead>
                <TableHead>加班费</TableHead>
                <TableHead>补贴</TableHead>
                <TableHead>扣款</TableHead>
                <TableHead>实发薪资</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : salaryRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                salaryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectOne(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {record.employeeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{record.department}</div>
                        <div className="text-sm text-gray-500">{record.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.month}</TableCell>
                    <TableCell className="font-medium">¥{record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+¥{record.performanceBonus.toLocaleString()}</TableCell>
                    <TableCell className="text-blue-600">+¥{record.overtimePay.toLocaleString()}</TableCell>
                    <TableCell className="text-purple-600">+¥{record.subsidy.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-¥{record.deduction.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">¥{record.totalSalary.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecord(record)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {record.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(record.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(record.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
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

      {/* 新增/编辑工资单对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? '编辑工资单' : '新建工资单'}</DialogTitle>
            <DialogDescription>
              {editingRecord ? '修改薪资信息' : '创建新的工资单'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="month">月份 *</Label>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseSalary">基本工资 *</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  placeholder="输入基本工资"
                />
              </div>
              <div>
                <Label htmlFor="performanceBonus">绩效奖金</Label>
                <Input
                  id="performanceBonus"
                  type="number"
                  value={formData.performanceBonus}
                  onChange={(e) => setFormData({ ...formData, performanceBonus: Number(e.target.value) })}
                  placeholder="输入绩效奖金"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="overtimePay">加班费</Label>
                <Input
                  id="overtimePay"
                  type="number"
                  value={formData.overtimePay}
                  onChange={(e) => setFormData({ ...formData, overtimePay: Number(e.target.value) })}
                  placeholder="加班费"
                />
              </div>
              <div>
                <Label htmlFor="subsidy">补贴</Label>
                <Input
                  id="subsidy"
                  type="number"
                  value={formData.subsidy}
                  onChange={(e) => setFormData({ ...formData, subsidy: Number(e.target.value) })}
                  placeholder="补贴"
                />
              </div>
              <div>
                <Label htmlFor="deduction">扣款</Label>
                <Input
                  id="deduction"
                  type="number"
                  value={formData.deduction}
                  onChange={(e) => setFormData({ ...formData, deduction: Number(e.target.value) })}
                  placeholder="扣款"
                />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">实发薪资：</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="其他说明"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveRecord}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看工资单详情对话框 */}
      <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>工资单详情</DialogTitle>
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
                  <Label>月份</Label>
                  <p className="font-medium">{viewingRecord.month}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">薪资明细</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">基本工资</span>
                    <span className="font-medium">¥{viewingRecord.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>+ 绩效奖金</span>
                    <span>+¥{viewingRecord.performanceBonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>+ 加班费</span>
                    <span>+¥{viewingRecord.overtimePay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-purple-600">
                    <span>+ 补贴</span>
                    <span>+¥{viewingRecord.subsidy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- 扣款</span>
                    <span>-¥{viewingRecord.deduction.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>实发薪资</span>
                    <span className="text-green-600">¥{viewingRecord.totalSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label>状态</Label>
                  <p>{getStatusBadge(viewingRecord.status)}</p>
                </div>
                <div>
                  <Label>发放日期</Label>
                  <p className="text-sm">{viewingRecord.paymentDate || '未发放'}</p>
                </div>
              </div>
              {viewingRecord.notes && (
                <div>
                  <Label>备注</Label>
                  <p className="text-sm">{viewingRecord.notes}</p>
                </div>
              )}
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
