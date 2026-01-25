'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Loading, Skeleton, TableSkeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache, clearCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import { ApiResponse } from '@/lib/api-helpers';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  level: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'probation' | 'resigned';
  avatar?: string;
  skills: string[];
  salary: number;
  performanceScore: number;
  potentialScore: number;
}

interface EmployeeFormData {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  level: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'probation' | 'resigned';
  skills: string[];
  salary: number;
}

interface EmployeeApiResponse {
  success: boolean;
  data?: Employee[];
  total?: number;
  error?: string;
}

export default function EmployeesPageContent() {
  const [keyword, setKeyword] = useLocalStorage('employee-search', '');
  const debouncedKeyword = useDebounce(keyword, 300);

  const [filters, setFilters] = useLocalStorage('employee-filters', {
    department: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    name: '',
    department: '',
    position: '',
    level: '',
    email: '',
    phone: '',
    hireDate: '',
    status: 'active',
    skills: [],
    salary: 0,
  });

  // 使用 useAsync Hook 管理异步状态
  const {
    data: employees = [],
    loading,
    error,
    execute: fetchEmployees,
    reset,
  } = useAsync<Employee[]>();

  // 获取员工数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = `employees-${pagination.page}-${filters.department}-${filters.status}-${debouncedKeyword}-${refreshKey}`;
        const result = await fetchWithCache<ApiResponse<EmployeeApiResponse>>(
          cacheKey,
          async () => {
            // 调用真实 API
            const params = new URLSearchParams({
              page: String(pagination.page),
              limit: String(pagination.limit),
              ...(filters.department && { department: filters.department }),
              ...(filters.status && { status: filters.status }),
              ...(debouncedKeyword && { keyword: debouncedKeyword }),
            });

            const response = await get<EmployeeApiResponse>(
              `/api/employees?${params.toString()}`
            );

            return response;
          },
          3 * 60 * 1000 // 3 分钟缓存
        );

        if (!result.success || !result.data) {
          throw new Error(result.error || '获取员工数据失败');
        }

        return result.data.data || [];
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        throw err;
      }
    };

    fetchEmployees(fetchData);
  }, [pagination.page, filters, debouncedKeyword, refreshKey, fetchEmployees]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    clearCache('employees-');
    setRefreshKey(prev => prev + 1);
  }, []);

  // 筛选员工
  const filteredEmployees = (employees || []).filter((item: any) => employee => {
    if (filters.department && employee.department !== filters.department) {
      return false;
    }
    if (filters.status && employee.status !== filters.status) {
      return false;
    }
    if (debouncedKeyword) {
      const keywordLower = debouncedKeyword.toLowerCase();
      return (
        employee.name.toLowerCase().includes(keywordLower) ||
        employee.employeeId.toLowerCase().includes(keywordLower) ||
        employee.email.toLowerCase().includes(keywordLower) ||
        employee.phone.includes(keywordLower)
      );
    }
    return true;
  });

  // 更新总数
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: filteredEmployees.length }));
  }, [filteredEmployees]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEmployees.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => selectedId => selectedId !== id));
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: '',
      name: '',
      department: '',
      position: '',
      level: '',
      email: '',
      phone: '',
      hireDate: '',
      status: 'active',
      skills: [],
      salary: 0,
    });
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      level: employee.level,
      email: employee.email,
      phone: employee.phone,
      hireDate: employee.hireDate,
      status: employee.status,
      skills: employee.skills,
      salary: employee.salary,
    });
    setDialogOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleSaveEmployee = async () => {
    try {
      if (editingEmployee) {
        await put(`/api/employees/${editingEmployee.id}`, formData);
      } else {
        await post('/api/employees', formData);
      }
      clearCache('employees-');
      setDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('保存员工失败:', error);
      alert('操作失败');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('确定要删除该员工吗？')) {
      return;
    }
    try {
      await del(`/api/employees/${id}`);
      clearCache('employees-');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('删除员工失败:', error);
      alert('操作失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的员工');
      return;
    }
    if (!confirm(`确定要删除 ${selectedIds.length} 位员工吗？`)) {
      return;
    }
    try {
      await Promise.all(selectedIds.map(id => del(`/api/employees/${id}`)));
      clearCache('employees-');
      setSelectedIds([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const response = await get('/api/employees/export');
      if (response.success) {
        alert('导出成功');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      active: { label: '在职', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      probation: { label: '试用期', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      resigned: { label: '离职', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={color}>{label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const levelNum = parseInt(level.replace('P', ''));
    if (levelNum >= 8) return <Badge className="bg-purple-100 text-purple-700">{level}</Badge>;
    if (levelNum >= 6) return <Badge className="bg-blue-100 text-blue-700">{level}</Badge>;
    if (levelNum >= 4) return <Badge className="bg-green-100 text-green-700">{level}</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">{level}</Badge>;
  };

  if (loading && (!employees || employees.length === 0)) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={handleRefresh} variant="outline">
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
            <User className="h-6 w-6 text-blue-500" />
            员工管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            员工档案、信息管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            onClick={handleAddEmployee}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增员工
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '总员工数', value: (employees || []).length, icon: User, color: 'text-blue-600' },
          { label: '在职员工', value: (employees || []).filter((item: any) => e => e.status === 'active').length, icon: Building2, color: 'text-green-600' },
          { label: '试用期', value: (employees || []).filter((item: any) => e => e.status === 'probation').length, icon: Calendar, color: 'text-yellow-600' },
          { label: '离职员工', value: (employees || []).filter((item: any) => e => e.status === 'resigned').length, icon: TrendingUp, color: 'text-gray-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索姓名、工号、邮箱、手机号"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>部门</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部部门</SelectItem>
                  <SelectItem value="研发部">研发部</SelectItem>
                  <SelectItem value="产品部">产品部</SelectItem>
                  <SelectItem value="销售部">销售部</SelectItem>
                  <SelectItem value="市场部">市场部</SelectItem>
                  <SelectItem value="人力资源部">人力资源部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="probation">试用期</SelectItem>
                  <SelectItem value="resigned">离职</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setFilters({ department: '', status: '' });
                setKeyword('');
              }}>
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
                <Button variant="outline" size="sm" onClick={handleBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 员工列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>员工信息</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>职位</TableHead>
                <TableHead>职级</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>入职日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loading size="sm" />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">暂无员工数据</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(employee.id)}
                        onCheckedChange={(checked) => handleSelectOne(employee.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{getLevelBadge(employee.level)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {employee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.hireDate}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewEmployee(employee)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
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

      {/* 新增/编辑员工对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? '编辑员工' : '新增员工'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? '修改员工信息' : '创建新的员工档案'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>员工编号 *</Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="例如：EMP001"
                />
              </div>
              <div>
                <Label>姓名 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入员工姓名"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>部门 *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="研发部">研发部</SelectItem>
                    <SelectItem value="产品部">产品部</SelectItem>
                    <SelectItem value="销售部">销售部</SelectItem>
                    <SelectItem value="市场部">市场部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>职位 *</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="输入职位"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>职级 *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择职级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1</SelectItem>
                    <SelectItem value="P2">P2</SelectItem>
                    <SelectItem value="P3">P3</SelectItem>
                    <SelectItem value="P4">P4</SelectItem>
                    <SelectItem value="P5">P5</SelectItem>
                    <SelectItem value="P6">P6</SelectItem>
                    <SelectItem value="P7">P7</SelectItem>
                    <SelectItem value="P8">P8</SelectItem>
                    <SelectItem value="P9">P9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态 *</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">在职</SelectItem>
                    <SelectItem value="probation">试用期</SelectItem>
                    <SelectItem value="resigned">离职</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>邮箱 *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@company.com"
                />
              </div>
              <div>
                <Label>手机号 *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="输入手机号"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>入职日期 *</Label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
              <div>
                <Label>薪资</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  placeholder="输入薪资"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveEmployee}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看员工详情对话框 */}
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>员工详情</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                  {viewingEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{viewingEmployee.name}</h3>
                  <p className="text-gray-500">{viewingEmployee.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>部门</Label>
                  <p className="font-medium">{viewingEmployee.department}</p>
                </div>
                <div>
                  <Label>职位</Label>
                  <p className="font-medium">{viewingEmployee.position}</p>
                </div>
                <div>
                  <Label>职级</Label>
                  <p>{getLevelBadge(viewingEmployee.level)}</p>
                </div>
                <div>
                  <Label>状态</Label>
                  <p>{getStatusBadge(viewingEmployee.status)}</p>
                </div>
                <div>
                  <Label>邮箱</Label>
                  <p>{viewingEmployee.email}</p>
                </div>
                <div>
                  <Label>手机号</Label>
                  <p>{viewingEmployee.phone}</p>
                </div>
                <div>
                  <Label>入职日期</Label>
                  <p>{viewingEmployee.hireDate}</p>
                </div>
                <div>
                  <Label>薪资</Label>
                  <p className="font-medium">¥{viewingEmployee.salary.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setViewingEmployee(null)}>
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
