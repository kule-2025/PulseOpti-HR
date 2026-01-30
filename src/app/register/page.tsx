'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ArrowLeft, Loader2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 密码显示状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 注册表单状态
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: '',
    industry: '',
    companySize: '',
  });

  // 验证状态
  const [validations, setValidations] = useState({
    email: { status: 'idle' as 'idle' | 'valid' | 'invalid', message: '' },
    phone: { status: 'idle' as 'idle' | 'valid' | 'invalid', message: '' },
    username: { status: 'idle' as 'idle' | 'valid' | 'invalid', message: '' },
    password: { status: 'idle' as 'idle' | 'valid' | 'invalid', message: '' },
  });

  // 确保客户端已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 防抖检查邮箱
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        checkEmail();
      } else {
        setValidations(prev => ({ ...prev, email: { status: 'idle', message: '' } }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email, mounted]);

  // 防抖检查手机号
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (formData.phone && formData.phone.length === 11) {
        checkPhone();
      } else {
        setValidations(prev => ({ ...prev, phone: { status: 'idle', message: '' } }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.phone, mounted]);

  // 防抖检查用户名
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 4) {
        checkUsername();
      } else {
        setValidations(prev => ({ ...prev, username: { status: 'idle', message: '' } }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, mounted]);

  // 检查邮箱是否已被注册
  const checkEmail = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidations(prev => ({
        ...prev,
        email: { status: 'invalid', message: '邮箱格式不正确' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.exists) {
        setValidations(prev => ({
          ...prev,
          email: { status: 'invalid', message: '该邮箱已被注册' }
        }));
      } else {
        setValidations(prev => ({
          ...prev,
          email: { status: 'valid', message: '邮箱可用' }
        }));
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 检查手机号是否已被注册
  const checkPhone = async () => {
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      setValidations(prev => ({
        ...prev,
        phone: { status: 'invalid', message: '手机号格式不正确' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await response.json();
      if (data.exists) {
        setValidations(prev => ({
          ...prev,
          phone: { status: 'invalid', message: '该手机号已被注册' }
        }));
      } else {
        setValidations(prev => ({
          ...prev,
          phone: { status: 'valid', message: '手机号可用' }
        }));
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 检查用户名是否已被注册
  const checkUsername = async () => {
    if (!formData.username) return;

    // 格式验证
    if (formData.username.length < 4) {
      setValidations(prev => ({
        ...prev,
        username: { status: 'invalid', message: '用户名至少4位' }
      }));
      return;
    }
    if (formData.username.length > 20) {
      setValidations(prev => ({
        ...prev,
        username: { status: 'invalid', message: '用户名最多20位' }
      }));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setValidations(prev => ({
        ...prev,
        username: { status: 'invalid', message: '用户名只能包含字母、数字和下划线' }
      }));
      return;
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      setValidations(prev => ({
        ...prev,
        username: { status: 'invalid', message: '用户名不能是邮箱格式' }
      }));
      return;
    }
    if (/^1[3-9]\d{9}$/.test(formData.username)) {
      setValidations(prev => ({
        ...prev,
        username: { status: 'invalid', message: '用户名不能是手机号' }
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      });
      const data = await response.json();
      if (data.exists) {
        setValidations(prev => ({
          ...prev,
          username: { status: 'invalid', message: '该用户名已被注册' }
        }));
      } else {
        setValidations(prev => ({
          ...prev,
          username: { status: 'valid', message: '用户名可用' }
        }));
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 验证密码强度
  useEffect(() => {
    if (!mounted) return;

    if (!formData.password) {
      setValidations(prev => ({ ...prev, password: { status: 'idle', message: '' } }));
      return;
    }

    if (formData.password.length < 8) {
      setValidations(prev => ({
        ...prev,
        password: { status: 'invalid', message: '密码至少8位' }
      }));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setValidations(prev => ({
        ...prev,
        password: { status: 'invalid', message: '密码需包含字母和数字' }
      }));
      return;
    }

    setValidations(prev => ({
      ...prev,
      password: { status: 'valid', message: '密码强度合格' }
    }));
  }, [formData.password, mounted]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 验证至少提供一种注册方式
    const hasEmail = !!formData.email;
    const hasPhone = !!formData.phone;
    const hasUsername = !!formData.username;

    if (!hasEmail && !hasPhone && !hasUsername) {
      setError('请至少提供一种注册方式（邮箱、手机号或用户名）');
      return;
    }

    // 验证必填字段
    if (!formData.name) {
      setError('请输入姓名');
      return;
    }
    if (!formData.companyName) {
      setError('请输入企业名称');
      return;
    }
    if (!formData.password) {
      setError('请输入密码');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    // 检查验证状态
    if (formData.email && validations.email.status === 'invalid') {
      setError(validations.email.message);
      return;
    }
    if (formData.phone && validations.phone.status === 'invalid') {
      setError(validations.phone.message);
      return;
    }
    if (formData.username && validations.username.status === 'invalid') {
      setError(validations.username.message);
      return;
    }
    if (validations.password.status === 'invalid') {
      setError(validations.password.message);
      return;
    }

    if (!agreed) {
      setError('请同意服务条款和隐私政策');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          username: formData.username || undefined,
          name: formData.name,
          password: formData.password,
          companyName: formData.companyName,
          industry: formData.industry || undefined,
          companySize: formData.companySize || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '注册失败');
      }

      if (!data.success) {
        throw new Error(data.message || '注册失败');
      }

      setSuccess(true);
      // 保存用户信息到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
      }

      // 2秒后跳转到仪表盘
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 输入框样式
  const getInputClassName = (validation: { status: string }) => cn(
    'pr-10',
    validation.status === 'valid' && 'border-green-500 focus-visible:ring-green-500',
    validation.status === 'invalid' && 'border-red-500 focus-visible:ring-red-500'
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-lg">
          <Card className="bg-white shadow-xl dark:bg-gray-800">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>

        <Card className="bg-white shadow-xl dark:bg-gray-800">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">创建账号</CardTitle>
            <CardDescription>开始您的 HR SaaS 之旅</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 注册方式 - 至少提供一种 */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-200 dark:border-gray-600">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  请至少提供一种注册方式
                </div>

                {/* 邮箱 */}
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱（可选）</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={getInputClassName(validations.email)}
                    />
                    {validations.email.status === 'valid' && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {validations.email.status === 'invalid' && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {validations.email.message && (
                    <p className={cn(
                      'text-xs',
                      validations.email.status === 'valid' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {validations.email.message}
                    </p>
                  )}
                </div>

                {/* 手机号 */}
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号（可选）</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="13800138000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      className={getInputClassName(validations.phone)}
                    />
                    {validations.phone.status === 'valid' && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {validations.phone.status === 'invalid' && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {validations.phone.message && (
                    <p className={cn(
                      'text-xs',
                      validations.phone.status === 'valid' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {validations.phone.message}
                    </p>
                  )}
                </div>

                {/* 用户名 */}
                <div className="space-y-2">
                  <Label htmlFor="username">用户名（可选）</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="4-20位字母、数字、下划线"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={getInputClassName(validations.username)}
                    />
                    {validations.username.status === 'valid' && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {validations.username.status === 'invalid' && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {validations.username.message && (
                    <p className={cn(
                      'text-xs',
                      validations.username.status === 'valid' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {validations.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少8位，包含字母和数字"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={getInputClassName(validations.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validations.password.message && (
                  <p className={cn(
                    'text-xs',
                    validations.password.status === 'valid' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {validations.password.message}
                  </p>
                )}
              </div>

              {/* 确认密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={cn(
                      'pr-10',
                      formData.confirmPassword && formData.password !== formData.confirmPassword && 'border-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600">两次输入的密码不一致</p>
                )}
              </div>

              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* 企业名称 */}
              <div className="space-y-2">
                <Label htmlFor="companyName">企业名称 *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="请输入企业名称"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              {/* 行业（可选） */}
              <div className="space-y-2">
                <Label htmlFor="industry">行业（可选）</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择行业" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="互联网">互联网</SelectItem>
                    <SelectItem value="金融">金融</SelectItem>
                    <SelectItem value="制造业">制造业</SelectItem>
                    <SelectItem value="零售">零售</SelectItem>
                    <SelectItem value="教育">教育</SelectItem>
                    <SelectItem value="医疗">医疗</SelectItem>
                    <SelectItem value="房地产">房地产</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 企业规模（可选） */}
              <div className="space-y-2">
                <Label htmlFor="companySize">企业规模（可选）</Label>
                <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择企业规模" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10人</SelectItem>
                    <SelectItem value="11-50">11-50人</SelectItem>
                    <SelectItem value="51-100">51-100人</SelectItem>
                    <SelectItem value="101-500">101-500人</SelectItem>
                    <SelectItem value="501-1000">501-1000人</SelectItem>
                    <SelectItem value="1000+">1000人以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 服务条款 */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreed"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <label htmlFor="agreed" className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    服务条款
                  </Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    隐私政策
                  </Link>
                </label>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* 成功提示 */}
              {success && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <p className="font-medium">注册成功！</p>
                    <p>正在跳转到仪表盘...</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '立即注册'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                立即登录
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
