'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  User,
  Building2,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'employee' | 'manager';
  isSuperAdmin: boolean;
  isActive: boolean;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee' as const,
    isActive: true,
  });

  useEffect(() => {
    checkAuth();
    fetchUserDetails();
  }, [userId]);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取用户详情失败');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        isActive: data.user.isActive,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('获取用户详情失败');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_profile',
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('更新用户信息失败');
      }

      toast.success('用户信息已更新');
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('更新用户信息失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle_status',
          isActive: !formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('更新用户状态失败');
      }

      toast.success(formData.isActive ? '用户已禁用' : '用户已启用');
      setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
      fetchUserDetails();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('更新用户状态失败');
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

  const getRoleBadge = (user: UserDetails) => {
    if (user.isSuperAdmin) {
      return <Badge className="bg-purple-600">超级管理员</Badge>;
    }
    switch (user.role) {
      case 'admin':
        return <Badge className="bg-blue-600">管理员</Badge>;
      case 'manager':
        return <Badge className="bg-green-600">经理</Badge>;
      case 'employee':
        return <Badge variant="secondary">员工</Badge>;
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">用户不存在</p>
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
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">用户详情</h1>
                <p className="text-sm text-gray-600 mt-1">{user.name} - {user.email}</p>
              </div>
            </div>
            <Badge variant={formData.isActive ? 'default' : 'secondary'}>
              {formData.isActive ? '活跃' : '禁用'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入姓名"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="请输入邮箱"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="请输入手机号"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}
                      disabled={user.isSuperAdmin}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">员工</SelectItem>
                        <SelectItem value="manager">经理</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Ban className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {formData.isActive ? '用户状态：活跃' : '用户状态：禁用'}
                    </span>
                  </div>
                  {!user.isSuperAdmin && (
                    <Button
                      variant={formData.isActive ? 'destructive' : 'default'}
                      onClick={handleToggleStatus}
                    >
                      {formData.isActive ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          禁用用户
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          启用用户
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存更改'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Role Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  权限信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">用户角色</span>
                  {getRoleBadge(user)}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">超级管理员</span>
                  <Badge variant={user.isSuperAdmin ? 'default' : 'secondary'}>
                    {user.isSuperAdmin ? '是' : '否'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">用户状态</span>
                  <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                    {formData.isActive ? '活跃' : '禁用'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  所属企业
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">企业名称</span>
                  <span className="text-sm font-medium">
                    {user.companyName || '-'}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">企业ID</span>
                  <span className="text-sm font-medium text-gray-500">
                    {user.companyId || '-'}
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
                  <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">最后登录</span>
                  <p className="text-sm font-medium">{formatDate(user.lastLoginAt || '')}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">更新时间</span>
                  <p className="text-sm font-medium">{formatDate(user.updatedAt || '')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
