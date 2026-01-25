'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyDetails {
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
  maxEmployees: number;
  subAccountCount: number;
  maxSubAccounts: number;
  createdAt: string;
  updatedAt?: string;
  subscriptionEndAt?: string;
}

interface CompanyStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalAmount: number;
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    scale: 'sme',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    subscriptionTier: 'free' as const,
    isActive: true,
    maxEmployees: 0,
    maxSubAccounts: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchCompanyDetails();
  }, [companyId]);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取企业详情失败');
      }

      const data = await response.json();
      setCompany(data.company);
      setStats(data.stats || null);
      setFormData({
        name: data.company.name,
        industry: data.company.industry || '',
        scale: data.company.scale || 'sme',
        contactPerson: data.company.contactPerson || '',
        contactPhone: data.company.contactPhone || '',
        contactEmail: data.company.contactEmail || '',
        address: data.company.address || '',
        subscriptionTier: data.company.subscriptionTier,
        isActive: data.company.isActive,
        maxEmployees: data.company.maxEmployees,
        maxSubAccounts: data.company.maxSubAccounts,
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast.error('获取企业详情失败');
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新企业信息失败');
      }

      toast.success('企业信息已更新');
      fetchCompanyDetails();
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('更新企业信息失败');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">企业不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/companies">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">企业详情</h1>
                <p className="text-sm text-gray-600 mt-1">{company.name}</p>
              </div>
            </div>
            <Badge variant={company.isActive ? 'default' : 'secondary'}>
              {company.isActive ? '活跃' : '禁用'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">总用户数</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">活跃用户</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeUsers}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">订单数</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalOrders}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">总收入</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">¥{stats.totalAmount}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">企业名称</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入企业名称"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">行业</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="请输入行业"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale">企业规模</Label>
                    <Select
                      value={formData.scale}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, scale: value }))}
                    >
                      <SelectTrigger id="scale">
                        <SelectValue placeholder="选择规模" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">初创企业（1-10人）</SelectItem>
                        <SelectItem value="sme">中小企业（10-100人）</SelectItem>
                        <SelectItem value="large">大型企业（100+人）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subscriptionTier">订阅套餐</Label>
                    <Select
                      value={formData.subscriptionTier}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, subscriptionTier: value }))}
                    >
                      <SelectTrigger id="subscriptionTier">
                        <SelectValue placeholder="选择套餐" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">免费版</SelectItem>
                        <SelectItem value="basic">基础版</SelectItem>
                        <SelectItem value="professional">专业版</SelectItem>
                        <SelectItem value="enterprise">企业版</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxEmployees">最大员工数</Label>
                    <Input
                      id="maxEmployees"
                      type="number"
                      value={formData.maxEmployees}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) || 0 }))}
                      placeholder="请输入最大员工数"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSubAccounts">最大子账号数</Label>
                    <Input
                      id="maxSubAccounts"
                      type="number"
                      value={formData.maxSubAccounts}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxSubAccounts: parseInt(e.target.value) || 0 }))}
                      placeholder="请输入最大子账号数"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">地址</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="请输入企业地址"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>联系信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">联系人</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="请输入联系人姓名"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">联系电话</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="请输入联系电话"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="contactEmail">联系邮箱</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="请输入联系邮箱"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存更改'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  订阅信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">当前套餐</span>
                  {getTierBadge(company.subscriptionTier)}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">员工数</span>
                  <span className="text-sm font-medium">
                    {company.employeeCount} / {company.maxEmployees}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">子账号数</span>
                  <span className="text-sm font-medium">
                    {company.subAccountCount} / {company.maxSubAccounts}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">订阅到期</span>
                  <span className="text-sm font-medium">
                    {formatDate(company.subscriptionEndAt || '')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Time Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  时间信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">注册时间</span>
                  <p className="text-sm font-medium">{formatDate(company.createdAt)}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">更新时间</span>
                  <p className="text-sm font-medium">{formatDate(company.updatedAt || '')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/admin/users?companyId=${company.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    查看企业用户
                  </Button>
                </Link>
                <Link href={`/admin/orders?companyId=${company.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    查看订单记录
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
