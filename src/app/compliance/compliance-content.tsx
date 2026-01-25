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
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building2,
  Shield,
  TrendingUp,
} from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  contractType: 'labor' | 'service' | 'internship' | 'outsource';
  startDate: string;
  endDate: string;
  probationPeriod: number;
  probationEndDate: string;
  status: 'active' | 'probation' | 'expired' | 'terminated' | 'renewing';
  salary: number;
  workLocation: string;
  signedDate: string;
  attachments: string[];
  notes: string;
}

export default function CompliancePageContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  const [formData, setFormData] = useState<{
    contractNumber: string;
    employeeId: string;
    contractType: 'labor' | 'service' | 'internship' | 'outsource';
    startDate: string;
    endDate: string;
    probationPeriod: number;
    salary: number;
    workLocation: string;
    notes: string;
  }>({
    contractNumber: '',
    employeeId: '',
    contractType: 'labor',
    startDate: '',
    endDate: '',
    probationPeriod: 3,
    salary: 0,
    workLocation: '',
    notes: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    status: '',
    contractType: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchContracts();
  }, [filters, pagination.page]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockContracts: Contract[] = [
        {
          id: '1',
          contractNumber: 'CON2024-001',
          employeeId: '1',
          employeeName: '张三',
          department: '研发部',
          position: '高级工程师',
          contractType: 'labor',
          startDate: '2024-01-15',
          endDate: '2026-01-14',
          probationPeriod: 3,
          probationEndDate: '2024-04-14',
          status: 'active',
          salary: 25000,
          workLocation: '北京总部',
          signedDate: '2024-01-10',
          attachments: ['合同.pdf', '附件.pdf'],
          notes: '正式劳动合同',
        },
        {
          id: '2',
          contractNumber: 'CON2024-002',
          employeeId: '2',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          contractType: 'labor',
          startDate: '2024-02-01',
          endDate: '2026-01-31',
          probationPeriod: 3,
          probationEndDate: '2024-04-30',
          status: 'probation',
          salary: 22000,
          workLocation: '北京总部',
          signedDate: '2024-01-28',
          attachments: ['合同.pdf'],
          notes: '试用期即将结束',
        },
        {
          id: '3',
          contractNumber: 'CON2023-055',
          employeeId: '3',
          employeeName: '王五',
          department: '销售部',
          position: '销售专员',
          contractType: 'labor',
          startDate: '2023-06-01',
          endDate: '2024-05-31',
          probationPeriod: 2,
          probationEndDate: '2023-07-31',
          status: 'renewing',
          salary: 18000,
          workLocation: '上海分公司',
          signedDate: '2023-05-25',
          attachments: ['合同.pdf'],
          notes: '即将到期，需续签',
        },
        {
          id: '4',
          contractNumber: 'CON2024-003',
          employeeId: '4',
          employeeName: '赵六',
          department: '研发部',
          position: '实习生',
          contractType: 'internship',
          startDate: '2024-01-10',
          endDate: '2024-04-10',
          probationPeriod: 0,
          probationEndDate: '',
          status: 'active',
          salary: 3000,
          workLocation: '北京总部',
          signedDate: '2024-01-08',
          attachments: ['实习协议.pdf'],
          notes: '实习合同',
        },
      ];

      setContracts(mockContracts);
      setPagination((prev) => ({
        ...prev,
        total: mockContracts.length,
      }));
    } catch (error) {
      console.error('获取合同列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contracts.map((c) => c.id));
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

  const handleAddContract = () => {
    setEditingContract(null);
    setFormData({
      contractNumber: '',
      employeeId: '',
      contractType: 'labor',
      startDate: '',
      endDate: '',
      probationPeriod: 3,
      salary: 0,
      workLocation: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      contractNumber: contract.contractNumber,
      employeeId: contract.employeeId,
      contractType: contract.contractType,
      startDate: contract.startDate,
      endDate: contract.endDate,
      probationPeriod: contract.probationPeriod,
      salary: contract.salary,
      workLocation: contract.workLocation,
      notes: contract.notes,
    });
    setDialogOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    setViewingContract(contract);
  };

  const handleSaveContract = async () => {
    try {
      alert('保存功能开发中...');
      setDialogOpen(false);
    } catch (error) {
      console.error('保存合同失败:', error);
      alert('操作失败');
    }
  };

  const handleRenewContract = async (id: string) => {
    if (!confirm('确定要续签该合同吗？')) {
      return;
    }
    alert('续签功能开发中...');
  };

  const handleTerminateContract = async (id: string) => {
    if (!confirm('确定要终止该合同吗？')) {
      return;
    }
    alert('终止功能开发中...');
  };

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      labor: '劳动合同',
      service: '服务合同',
      internship: '实习合同',
      outsource: '外包合同',
    };
    return labels[type] || type;
  };

  const getContractTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      labor: 'bg-blue-100 text-blue-700',
      service: 'bg-purple-100 text-purple-700',
      internship: 'bg-green-100 text-green-700',
      outsource: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      active: { label: '生效中', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      probation: { label: '试用期', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      expired: { label: '已过期', color: 'bg-gray-100 text-gray-700', icon: XCircle },
      terminated: { label: '已终止', color: 'bg-red-100 text-red-700', icon: XCircle },
      renewing: { label: '续签中', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
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

  const getExpirationStatus = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return { label: '已过期', color: 'text-red-600' };
    if (daysDiff <= 30) return { label: `${daysDiff}天后到期`, color: 'text-orange-600' };
    if (daysDiff <= 90) return { label: `${daysDiff}天后到期`, color: 'text-yellow-600' };
    return { label: `${daysDiff}天后到期`, color: 'text-green-600' };
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            合规管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理劳动合同、试用期跟踪
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </Button>
          <Button
            onClick={handleAddContract}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建合同
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总合同数</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">生效中</p>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter((item: any) => (c) => c.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">试用期</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contracts.filter((item: any) => (c) => c.status === 'probation').length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">即将到期</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contracts.filter((item: any) => (c) => {
                    const daysDiff = Math.floor(
                      (new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysDiff > 0 && daysDiff <= 30;
                  }).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待续签</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contracts.filter((item: any) => (c) => c.status === 'renewing').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
                placeholder="搜索合同号、员工姓名"
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
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>合同类型</Label>
              <Select
                value={filters.contractType}
                onValueChange={(value) => setFilters({ ...filters, contractType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部类型</SelectItem>
                  <SelectItem value="labor">劳动合同</SelectItem>
                  <SelectItem value="service">服务合同</SelectItem>
                  <SelectItem value="internship">实习合同</SelectItem>
                  <SelectItem value="outsource">外包合同</SelectItem>
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
                  <SelectItem value="active">生效中</SelectItem>
                  <SelectItem value="probation">试用期</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                  <SelectItem value="terminated">已终止</SelectItem>
                  <SelectItem value="renewing">续签中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', department: '', status: '', contractType: '' })}>
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 合同列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === contracts.length && contracts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>合同编号</TableHead>
                <TableHead>员工信息</TableHead>
                <TableHead>部门/职位</TableHead>
                <TableHead>合同类型</TableHead>
                <TableHead>合同期限</TableHead>
                <TableHead>试用期</TableHead>
                <TableHead>到期时间</TableHead>
                <TableHead>薪资</TableHead>
                <TableHead>状态</TableHead>
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
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => {
                  const expiration = getExpirationStatus(contract.endDate);
                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(contract.id)}
                          onCheckedChange={(checked) => handleSelectOne(contract.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {contract.employeeName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{contract.department}</div>
                          <div className="text-sm text-gray-500">{contract.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getContractTypeColor(contract.contractType)}>
                          {getContractTypeLabel(contract.contractType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{contract.startDate}</div>
                          <div className="text-gray-500">至 {contract.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{contract.probationPeriod}个月</div>
                          {contract.probationEndDate && (
                            <div className="text-gray-500">至 {contract.probationEndDate}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${expiration.color}`}>
                          {expiration.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        ¥{contract.salary.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContract(contract)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {contract.status === 'renewing' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRenewContract(contract.id)}
                            >
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {contract.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTerminateContract(contract.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* 新增/编辑合同对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContract ? '编辑合同' : '新建合同'}</DialogTitle>
            <DialogDescription>
              {editingContract ? '修改合同信息' : '创建新的劳动合同'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractNumber">合同编号 *</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  placeholder="例如：CON2024-001"
                />
              </div>
              <div>
                <Label htmlFor="employeeId">员工ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="输入员工ID"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contractType">合同类型 *</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="labor">劳动合同</SelectItem>
                  <SelectItem value="service">服务合同</SelectItem>
                  <SelectItem value="internship">实习合同</SelectItem>
                  <SelectItem value="outsource">外包合同</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">开始日期 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">结束日期 *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="probationPeriod">试用期（月）</Label>
                <Input
                  id="probationPeriod"
                  type="number"
                  value={formData.probationPeriod}
                  onChange={(e) => setFormData({ ...formData, probationPeriod: Number(e.target.value) })}
                  placeholder="默认3个月"
                />
              </div>
              <div>
                <Label htmlFor="salary">薪资 *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  placeholder="输入薪资"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="workLocation">工作地点</Label>
              <Input
                id="workLocation"
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                placeholder="例如：北京总部"
              />
            </div>
            <div>
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="其他说明"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveContract}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看合同详情对话框 */}
      <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>合同详情</DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>合同编号</Label>
                  <p className="font-medium">{viewingContract.contractNumber}</p>
                </div>
                <div>
                  <Label>员工姓名</Label>
                  <p className="font-medium">{viewingContract.employeeName}</p>
                </div>
                <div>
                  <Label>部门</Label>
                  <p>{viewingContract.department}</p>
                </div>
                <div>
                  <Label>职位</Label>
                  <p>{viewingContract.position}</p>
                </div>
                <div>
                  <Label>合同类型</Label>
                  <Badge className={getContractTypeColor(viewingContract.contractType)}>
                    {getContractTypeLabel(viewingContract.contractType)}
                  </Badge>
                </div>
                <div>
                  <Label>合同状态</Label>
                  <p>{getStatusBadge(viewingContract.status)}</p>
                </div>
                <div>
                  <Label>开始日期</Label>
                  <p>{viewingContract.startDate}</p>
                </div>
                <div>
                  <Label>结束日期</Label>
                  <p className="font-medium">{viewingContract.endDate}</p>
                </div>
                <div>
                  <Label>试用期</Label>
                  <p>{viewingContract.probationPeriod}个月</p>
                </div>
                <div>
                  <Label>试用期结束</Label>
                  <p>{viewingContract.probationEndDate || '无'}</p>
                </div>
                <div>
                  <Label>薪资</Label>
                  <p className="font-medium">¥{viewingContract.salary.toLocaleString()}</p>
                </div>
                <div>
                  <Label>工作地点</Label>
                  <p>{viewingContract.workLocation}</p>
                </div>
                <div>
                  <Label>签订日期</Label>
                  <p className="text-sm text-gray-600">{viewingContract.signedDate}</p>
                </div>
                <div>
                  <Label>附件</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewingContract.attachments.map((file, index) => (
                      <Badge key={index} variant="outline">{file}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label>备注</Label>
                <p className="text-sm">{viewingContract.notes || '无'}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setViewingContract(null)}>
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
