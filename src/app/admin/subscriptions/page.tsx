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
  Package,
  Building2,
  CreditCard,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MoreVertical,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/utils/csv-export';

interface Subscription {
  id: string;
  companyId: string;
  companyName: string;
  tier: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  maxEmployees: number;
  maxSubAccounts: number;
  createdAt: string;
  autoRenew: boolean;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending' | 'cancelled'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'basic' | 'professional' | 'enterprise'>('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchSubscriptions();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取订阅列表失败');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesTier = tierFilter === 'all' || subscription.tier === tierFilter;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />生效中</Badge>;
      case 'expired':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />已过期</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" />待审核</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />已取消</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getCycleBadge = (cycle: string) => {
    return cycle === 'monthly'
      ? <Badge variant="outline">月付</Badge>
      : <Badge variant="outline">年付</Badge>;
  };

  // 复选框相关函数
  const toggleSubscriptionSelection = (subscriptionId: string) => {
    const newSelection = new Set(selectedSubscriptions);
    if (newSelection.has(subscriptionId)) {
      newSelection.delete(subscriptionId);
    } else {
      newSelection.add(subscriptionId);
    }
    setSelectedSubscriptions(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedSubscriptions.size === filteredSubscriptions.length) {
      setSelectedSubscriptions(new Set());
    } else {
      setSelectedSubscriptions(new Set(filteredSubscriptions.map(s => s.id)));
    }
  };

  // 批量操作函数
  const handleBatchDelete = async () => {
    if (selectedSubscriptions.size === 0) {
      toast.error('请先选择要删除的订阅');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedSubscriptions.size} 个订阅吗？此操作不可恢复。`)) {
      return;
    }

    setBatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscriptions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batchDelete',
          subscriptionIds: Array.from(selectedSubscriptions),
        }),
      });

      if (!response.ok) {
        throw new Error('删除订阅失败');
      }

      const data = await response.json();
      toast.success(data.message || '删除成功');
      setSelectedSubscriptions(new Set());
      fetchSubscriptions();
    } catch (error) {
      console.error('批量删除订阅失败:', error);
      toast.error('批量删除订阅失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // 导出CSV函数
  const handleExportCSV = () => {
    if (filteredSubscriptions.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const columns = [
      { key: 'companyName' as keyof Subscription, label: '企业名称' },
      { key: 'tier' as keyof Subscription, label: '套餐' },
      { key: 'billingCycle' as keyof Subscription, label: '周期' },
      { key: 'amount' as keyof Subscription, label: '金额' },
      { key: 'startDate' as keyof Subscription, label: '生效时间' },
      { key: 'endDate' as keyof Subscription, label: '到期时间' },
      { key: 'status' as keyof Subscription, label: '状态' },
      { key: 'createdAt' as keyof Subscription, label: '创建时间' },
    ];

    const exportData = filteredSubscriptions.map((subscription) => ({
      ...subscription,
      tier: subscription.tier === 'free' ? '免费版' :
           subscription.tier === 'basic' ? '基础版' :
           subscription.tier === 'professional' ? '专业版' :
           subscription.tier === 'enterprise' ? '企业版' : '未知',
      billingCycle: subscription.billingCycle === 'monthly' ? '月付' : '年付',
      status: subscription.status === 'active' ? '生效中' :
              subscription.status === 'expired' ? '已过期' :
              subscription.status === 'pending' ? '待审核' :
              subscription.status === 'cancelled' ? '已取消' : '未知',
      startDate: subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('zh-CN') : '',
      endDate: subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('zh-CN') : '',
      createdAt: subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString('zh-CN') : '',
    }));

    exportToCSV(exportData, columns, `订阅列表_${new Date().toLocaleDateString('zh-CN')}`);
    toast.success('导出成功');
  };

  const handleBatchUpdateStatus = async (status: string) => {
    if (selectedSubscriptions.size === 0) {
      toast.error('请先选择要操作的订阅');
      return;
    }

    setBatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'batchUpdateStatus',
          subscriptionIds: Array.from(selectedSubscriptions),
          data: { status },
        }),
      });

      if (!response.ok) {
        throw new Error('更新订阅状态失败');
      }

      const data = await response.json();
      toast.success(data.message || '更新成功');
      setSelectedSubscriptions(new Set());
      fetchSubscriptions();
    } catch (error) {
      console.error('批量更新订阅状态失败:', error);
      toast.error('批量更新订阅状态失败');
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
              <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
              <p className="text-sm text-gray-600 mt-1">管理所有企业订阅订单</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  返回仪表盘
                </Button>
              </Link>
              <Button
                onClick={fetchSubscriptions}
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
                <p className="text-sm text-gray-600">总订阅数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{subscriptions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">生效中</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待审核</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {subscriptions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月收入</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  ¥{subscriptions.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
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
                  placeholder="搜索企业名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="订阅状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
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
            {selectedSubscriptions.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">已选择 {selectedSubscriptions.size} 项</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdateStatus('active')}
                  disabled={batchLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  批量激活
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdateStatus('cancelled')}
                  disabled={batchLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  批量取消
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

        {/* Subscriptions Table */}
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
                      {selectedSubscriptions.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>企业信息</TableHead>
                  <TableHead>套餐</TableHead>
                  <TableHead>周期</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>生效时间</TableHead>
                  <TableHead>到期时间</TableHead>
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
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-center">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">暂无订阅数据</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubscriptionSelection(subscription.id)}
                          className="p-0 h-8 w-8"
                        >
                          {selectedSubscriptions.has(subscription.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{subscription.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(subscription.tier)}</TableCell>
                      <TableCell>{getCycleBadge(subscription.billingCycle)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{subscription.amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(subscription.startDate)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(subscription.endDate)}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/subscriptions/${subscription.id}`}>
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
