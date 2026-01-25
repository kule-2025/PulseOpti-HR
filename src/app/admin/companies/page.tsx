'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Building2,
  Users,
  Shield,
  Calendar,
  Edit,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/utils/csv-export';

interface Company {
  id: string;
  name: string;
  industry?: string;
  scale?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt?: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'basic' | 'professional' | 'enterprise'>('all');
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCompanies();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取企业列表失败');
      }

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('获取企业列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.contactPerson && company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.isActive) ||
      (statusFilter === 'inactive' && !company.isActive);

    const matchesTier = tierFilter === 'all' || company.subscriptionTier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="secondary">免费版</Badge>;
      case 'basic':
        return <Badge className="bg-blue-600">基础版</Badge>;
      case 'professional':
        return <Badge className="bg-purple-600">专业版</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-600">企业版</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getScaleBadge = (scale?: string) => {
    if (!scale) return '-';
    switch (scale) {
      case 'startup':
        return <Badge variant="outline">初创企业</Badge>;
      case 'sme':
        return <Badge variant="outline">中小企业</Badge>;
      case 'large':
        return <Badge variant="outline">大型企业</Badge>;
      default:
        return <Badge variant="outline">{scale}</Badge>;
    }
  };

  // 复选框相关函数
  const toggleCompanySelection = (companyId: string) => {
    const newSelection = new Set(selectedCompanies);
    if (newSelection.has(companyId)) {
      newSelection.delete(companyId);
    } else {
      newSelection.add(companyId);
    }
    setSelectedCompanies(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedCompanies.size === filteredCompanies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(filteredCompanies.map(c => c.id)));
    }
  };

  // 批量操作函数
  const handleBatchDelete = async () => {
    if (selectedCompanies.size === 0) {
      toast.error('请先选择要删除的企业');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedCompanies.size} 个企业吗？此操作不可恢复。`)) {
      return;
    }

    setBatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/companies', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batchDelete',
          companyIds: Array.from(selectedCompanies),
        }),
      });

      if (!response.ok) {
        throw new Error('删除企业失败');
      }

      const data = await response.json();
      toast.success(data.message || '删除成功');
      setSelectedCompanies(new Set());
      fetchCompanies();
    } catch (error) {
      console.error('批量删除企业失败:', error);
      toast.error('批量删除企业失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // 导出CSV函数
  const handleExportCSV = () => {
    if (filteredCompanies.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const columns = [
      { key: 'name' as keyof Company, label: '企业名称' },
      { key: 'industry' as keyof Company, label: '行业' },
      { key: 'scale' as keyof Company, label: '规模' },
      { key: 'subscriptionTier' as keyof Company, label: '订阅套餐' },
      { key: 'employeeCount' as keyof Company, label: '员工数' },
      { key: 'contactPerson' as keyof Company, label: '联系人' },
      { key: 'contactPhone' as keyof Company, label: '联系电话' },
      { key: 'contactEmail' as keyof Company, label: '联系邮箱' },
      { key: 'isActive' as keyof Company, label: '状态' },
      { key: 'createdAt' as keyof Company, label: '注册时间' },
    ];

    const exportData = filteredCompanies.map((company) => ({
      ...company,
      subscriptionTier: company.subscriptionTier === 'free' ? '免费版' :
                      company.subscriptionTier === 'basic' ? '基础版' :
                      company.subscriptionTier === 'professional' ? '专业版' :
                      company.subscriptionTier === 'enterprise' ? '企业版' : '未知',
      isActive: company.isActive ? '活跃' : '禁用',
      createdAt: company.createdAt ? new Date(company.createdAt).toLocaleString('zh-CN') : '',
    }));

    exportToCSV(exportData, columns, `企业列表_${new Date().toLocaleDateString('zh-CN')}`);
    toast.success('导出成功');
  };

  const handleBatchUpdateStatus = async (isActive: boolean) => {
    if (selectedCompanies.size === 0) {
      toast.error('请先选择要操作的企业');
      return;
    }

    setBatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batchUpdateStatus',
          companyIds: Array.from(selectedCompanies),
          data: { isActive },
        }),
      });

      if (!response.ok) {
        throw new Error('更新企业状态失败');
      }

      const data = await response.json();
      toast.success(data.message || '更新成功');
      setSelectedCompanies(new Set());
      fetchCompanies();
    } catch (error) {
      console.error('批量更新企业状态失败:', error);
      toast.error('批量更新企业状态失败');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">企业管理</h1>
              <p className="text-sm text-gray-600 mt-1">管理系统所有企业账号</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  返回仪表盘
                </Button>
              </Link>
              <Button
                onClick={fetchCompanies}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
              >
                导出CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总企业数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃企业</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {companies.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总员工数</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {companies.reduce((sum, c) => sum + c.employeeCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">付费企业</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {companies.filter(c => c.subscriptionTier !== 'free').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索企业名称、联系人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="企业状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={(value: any) => setTierFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="订阅套餐" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部套餐</SelectItem>
                <SelectItem value="free">免费版</SelectItem>
                <SelectItem value="basic">基础版</SelectItem>
                <SelectItem value="professional">专业版</SelectItem>
                <SelectItem value="enterprise">企业版</SelectItem>
              </SelectContent>
            </Select>

            {/* 批量操作按钮 */}
            {selectedCompanies.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">已选择 {selectedCompanies.size} 项</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdateStatus(true)}
                  disabled={batchLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  批量启用
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdateStatus(false)}
                  disabled={batchLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  批量禁用
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={batchLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  批量删除
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAllSelection}
                      className="p-0 h-8 w-8"
                    >
                      {selectedCompanies.size === filteredCompanies.length && filteredCompanies.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>企业信息</TableHead>
                  <TableHead>套餐</TableHead>
                  <TableHead>规模</TableHead>
                  <TableHead>员工数</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-center">
                        <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">暂无企业数据</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCompanySelection(company.id)}
                          className="p-0 h-8 w-8"
                        >
                          {selectedCompanies.has(company.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.industry || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(company.subscriptionTier)}</TableCell>
                      <TableCell>{getScaleBadge(company.scale)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{company.employeeCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm text-gray-900">{company.contactPerson || '-'}</div>
                          <div className="text-sm text-gray-500">{company.contactPhone || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(company.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isActive ? 'default' : 'secondary'}>
                          {company.isActive ? '活跃' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/companies/${company.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                查看详情
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
