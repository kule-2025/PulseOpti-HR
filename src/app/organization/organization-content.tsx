'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useDebounce, useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Department {
  id: string;
  departmentId: string;
  name: string;
  parentId?: string;
  managerId?: string;
  level: number;
  description?: string;
  employeeCount: number;
  children?: Department[];
}

export default function OrganizationPageContent() {
  const [expandedIds, setExpandedIds] = useLocalStorage<Set<string>>('org-expanded-ids', new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    parentId: '',
    managerId: '',
    level: 1,
    description: '',
  });

  const [debouncedKeyword] = useDebounce(searchKeyword, 300);

  // 获取部门列表
  const {
    data: departments = [],
    loading,
    error,
    execute: fetchDepartments,
  } = useAsync<Department[]>();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      return await fetchWithCache<Department[]>('organization-departments', async () => {
        const response = await get<{ success: boolean; data?: Department[] }>(
          '/api/departments'
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000); // 5分钟缓存
    } catch (err) {
      console.error('获取部门列表失败:', err);
      monitor.trackError('loadDepartments', err as Error);
      throw err;
    }
  }, []);

  const toggleExpand = useCallback((id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  }, [expandedIds, setExpandedIds]);

  const handleAddDept = useCallback(() => {
    setEditingDept(null);
    setFormData({
      departmentId: '',
      name: '',
      parentId: '',
      managerId: '',
      level: 1,
      description: '',
    });
    setDialogOpen(true);
  }, []);

  const handleEditDept = useCallback((dept: Department) => {
    setEditingDept(dept);
    setFormData({
      departmentId: dept.departmentId,
      name: dept.name,
      parentId: dept.parentId || '',
      managerId: dept.managerId || '',
      level: dept.level,
      description: dept.description || '',
    });
    setDialogOpen(true);
  }, []);

  const handleSaveDept = useCallback(async () => {
    try {
      if (editingDept) {
        await put<{ success: boolean }>(
          `/api/departments/${editingDept.id}`,
          formData
        );
      } else {
        await post<{ success: boolean }>(
          '/api/departments',
          formData
        );
      }

      setDialogOpen(false);
      await fetchDepartments();
    } catch (err) {
      console.error('保存部门失败:', err);
      monitor.trackError('saveDepartment', err as Error);
      alert('操作失败');
    }
  }, [editingDept, formData, fetchDepartments]);

  const handleDeleteDept = useCallback(async (id: string) => {
    if (!confirm('确定要删除该部门吗？')) {
      return;
    }

    try {
      await del<{ success: boolean }>(`/api/departments/${id}`);
      await fetchDepartments();
    } catch (err) {
      console.error('删除部门失败:', err);
      monitor.trackError('deleteDepartment', err as Error);
      alert('删除失败');
    }
  }, [fetchDepartments]);

  // 统计数据
  const stats = useMemo(() => ({
    total: departments.length,
    level1: departments.filter((item: any) => d => d.level === 1).length,
    totalEmployees: departments.reduce((sum, d) => sum + d.employeeCount, 0),
    maxLevel: Math.max(...departments.map(d => d.level), 0),
  }), [departments]);

  // 过滤后的部门
  const filteredDepartments = useMemo(() => {
    if (!debouncedKeyword) return departments;

    const filterTree = (depts: Department[]): Department[] => {
      return depts.reduce((acc: Department[], dept) => {
        const matches = dept.name.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
                       dept.departmentId.toLowerCase().includes(debouncedKeyword.toLowerCase());

        const filteredChildren = dept.children ? filterTree(dept.children) : [];

        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...dept,
            children: filteredChildren.length > 0 ? filteredChildren : dept.children,
          });
        }

        return acc;
      }, []);
    };

    return filterTree(departments);
  }, [departments, debouncedKeyword]);

  const getLevelBadge = useCallback((level: number) => {
    const colors = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
    const color = colors[(level - 1) % colors.length];
    return <Badge className={color}>L{level}</Badge>;
  }, []);

  const renderDepartment = useCallback((dept: Department, indent = 0): JSX.Element => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedIds.has(dept.id);

    return (
      <div key={dept.id} style={{ marginLeft: `${indent * 20}px` }}>
        <div className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-3 p-3">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(dept.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className="flex-1 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{dept.name}</div>
                <div className="text-sm text-gray-500">{dept.departmentId}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getLevelBadge(dept.level)}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                {dept.employeeCount}人
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditDept(dept)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDept(dept.id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {dept.children!.map((child) => renderDepartment(child, indent + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedIds, toggleExpand, getLevelBadge, handleEditDept, handleDeleteDept]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={fetchDepartments} variant="outline">
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
            <Building2 className="h-6 w-6 text-blue-500" />
            组织架构
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理公司组织架构、部门层级
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            onClick={handleAddDept}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增部门
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总部门数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">一级部门</p>
                    <p className="text-2xl font-bold">{stats.level1}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总员工数</p>
                    <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">最大层级</p>
                    <p className="text-2xl font-bold">{stats.maxLevel}</p>
                  </div>
                  <ChevronRight className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索部门名称或编号"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 组织架构树 */}
      <Card>
        <CardHeader>
          <CardTitle>组织架构图</CardTitle>
          <CardDescription>
            点击箭头展开/收起子部门
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无部门数据</div>
          ) : (
            <div>
              {filteredDepartments.map((dept) => renderDepartment(dept))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? '编辑部门' : '新增部门'}</DialogTitle>
            <DialogDescription>
              {editingDept ? '修改部门信息' : '创建新的部门'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="departmentId">部门编号 *</Label>
              <Input
                id="departmentId"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                placeholder="例如：DEPT001"
              />
            </div>
            <div>
              <Label htmlFor="name">部门名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：研发中心"
              />
            </div>
            <div>
              <Label htmlFor="parentId">上级部门</Label>
              <Input
                id="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                placeholder="选择上级部门ID（可选）"
              />
            </div>
            <div>
              <Label htmlFor="managerId">负责人</Label>
              <Input
                id="managerId"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                placeholder="输入负责人ID（可选）"
              />
            </div>
            <div>
              <Label htmlFor="description">部门描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="部门职责描述"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveDept}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
