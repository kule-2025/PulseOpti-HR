'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  UserPlus,
  Shield,
  AlertTriangle,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface SubAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isMainAccount: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Quota {
  currentAccounts: number;
  maxAccounts: number;
  availableAccounts: number;
  canAdd: boolean;
}

export default function SubAccountsPage() {
  const [accounts, setAccounts] = useState<SubAccount[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, quotaRes] = await Promise.all([
        fetch('/api/admin/sub-accounts'),
        fetch('/api/admin/sub-accounts/quota'),
      ]);

      const accountsData = await accountsRes.json();
      const quotaData = await quotaRes.json();

      if (accountsData.success) {
        setAccounts(accountsData.data);
      }

      if (quotaData.success) {
        setQuota(quotaData.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      setError('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证表单
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/sub-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('子账号创建成功');
        setShowCreateDialog(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'admin',
        });
        fetchData();
      } else {
        setError(data.error || '创建失败');
      }
    } catch (error) {
      console.error('创建子账号失败:', error);
      setError('创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/sub-accounts/${selectedAccount?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password',
          newPassword: resetPasswordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('密码重置成功');
        setShowResetPasswordDialog(false);
        setResetPasswordData({
          newPassword: '',
          confirmPassword: '',
        });
        setSelectedAccount(null);
      } else {
        setError(data.error || '密码重置失败');
      }
    } catch (error) {
      console.error('密码重置失败:', error);
      setError('密码重置失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateAccount = async (accountId: string) => {
    if (!confirm('确定要停用该子账号吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sub-accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('子账号已停用');
        fetchData();
      } else {
        setError(data.error || '停用失败');
      }
    } catch (error) {
      console.error('停用子账号失败:', error);
      setError('停用失败，请稍后重试');
    }
  };

  const handleActivateAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/admin/sub-accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'activate',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('子账号已激活');
        fetchData();
      } else {
        setError(data.error || '激活失败');
      }
    } catch (error) {
      console.error('激活子账号失败:', error);
      setError('激活失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">子账号管理</h1>
          <p className="text-gray-600 mt-1">管理公司的管理员账号</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!quota?.canAdd}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          添加子账号
        </Button>
      </div>

      {/* Quota Card */}
      {quota && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              账号配额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">已用 {quota.currentAccounts} / {quota.maxAccounts} 个</span>
                  <span className="text-sm font-semibold text-blue-600">
                    可用 {quota.availableAccounts} 个
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all ${
                      quota.canAdd ? '' : 'bg-red-500'
                    }`}
                    style={{ width: `${(quota.currentAccounts / quota.maxAccounts) * 100}%` }}
                  />
                </div>
                {!quota.canAdd && (
                  <p className="text-sm text-red-600 mt-2">
                    子账号数量已达上限，请升级套餐
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            管理员账号列表
          </CardTitle>
          <CardDescription>
            共 {accounts.length} 个账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    account.isMainAccount
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{account.name}</span>
                      {account.isMainAccount && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                          主账号
                        </Badge>
                      )}
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? '正常' : '已停用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {account.email} · {account.role === 'admin' ? '管理员' : '管理者'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!account.isMainAccount && (
                    <>
                      {account.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateAccount(account.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          停用
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateAccount(account.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          激活
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowResetPasswordDialog(true);
                        }}
                      >
                        <Key className="h-4 w-4 mr-1" />
                        重置密码
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无管理员账号</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加子账号</DialogTitle>
            <DialogDescription>
              创建新的管理员账号，用于协公司管理工作
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <Label htmlFor="role">角色 *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="manager">管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码（至少6位）"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="请再次输入密码"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {submitting ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为账号 {selectedAccount?.name} 重置密码
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">新密码 *</Label>
              <Input
                id="newPassword"
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) =>
                  setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })
                }
                placeholder="请输入新密码（至少6位）"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">确认新密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })
                }
                placeholder="请再次输入新密码"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetPasswordDialog(false);
                  setSelectedAccount(null);
                }}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {submitting ? '重置中...' : '确认重置'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
