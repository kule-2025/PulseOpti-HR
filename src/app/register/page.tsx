'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [registerMethod, setRegisterMethod] = useState<'password' | 'sms' | 'email'>('password');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 密码注册表单状态
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });

  // 短信注册表单状态
  const [smsForm, setSmsForm] = useState({
    phone: '',
    code: '',
    password: '',
    companyName: '',
    name: '',
    email: '', // 可选
  });
  const [smsCountdown, setSmsCountdown] = useState(0);

  // 邮箱注册表单状态
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: '',
    password: '',
    companyName: '',
    name: '',
    phone: '', // 可选
  });
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [devCode, setDevCode] = useState(''); // 开发环境验证码

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (!passwordForm.email || !passwordForm.name) {
      setError('请填写邮箱和姓名');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: passwordForm.email,
          name: passwordForm.name,
          password: passwordForm.password,
          companyName: passwordForm.companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '注册失败');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 发送短信验证码
  const handleSendSmsCode = async () => {
    if (!smsForm.phone) {
      setError('请先输入手机号');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: smsForm.phone,
          purpose: 'register',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '发送失败');
      }

      // 开始倒计时
      setSmsCountdown(60);
      const timer = setInterval(() => {
        setSmsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError('');
    } catch (err: any) {
      setError(err.message || '验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    if (!emailForm.email) {
      setError('请先输入邮箱');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailForm.email,
          purpose: 'register',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '发送失败');
      }

      // 开发环境：保存验证码以便显示给用户
      if (data.data?.code) {
        setDevCode(data.data.code);
        setError(`验证码已发送到 ${emailForm.email}`);
      }

      // 开始倒计时
      setEmailCountdown(60);
      const timer = setInterval(() => {
        setEmailCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError('');
    } catch (err: any) {
      setError(err.message || '验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '注册失败');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '注册失败');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
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
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="password" onClick={() => setRegisterMethod('password')}>
                  密码注册
                </TabsTrigger>
                <TabsTrigger value="sms" onClick={() => setRegisterMethod('sms')}>
                  手机注册
                </TabsTrigger>
                <TabsTrigger value="email" onClick={() => setRegisterMethod('email')}>
                  邮箱注册
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={passwordForm.email}
                      onChange={(e) => setPasswordForm({ ...passwordForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={passwordForm.name}
                      onChange={(e) => setPasswordForm({ ...passwordForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="再次输入密码"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">企业名称</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="请输入企业名称"
                      value={passwordForm.companyName}
                      onChange={(e) => setPasswordForm({ ...passwordForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agree"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    />
                    <label
                      htmlFor="agree"
                      className="text-sm text-gray-600 dark:text-gray-400 leading-tight"
                    >
                      我已阅读并同意
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700 mx-1">服务条款</Link>
                      和
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700 mx-1">隐私政策</Link>
                    </label>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!agreed || loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '注册并开始免费试用'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <form onSubmit={handleSmsRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={smsForm.phone}
                      onChange={(e) => setSmsForm({ ...smsForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-code">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sms-code"
                        type="text"
                        placeholder="请输入验证码"
                        className="flex-1"
                        value={smsForm.code}
                        onChange={(e) => setSmsForm({ ...smsForm, code: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        onClick={handleSendSmsCode}
                        disabled={smsCountdown > 0 || loading}
                      >
                        {smsCountdown > 0 ? `${smsCountdown}秒后重试` : '获取验证码'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-name">姓名</Label>
                    <Input
                      id="sms-name"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={smsForm.name}
                      onChange={(e) => setSmsForm({ ...smsForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">设置密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      value={smsForm.password}
                      onChange={(e) => setSmsForm({ ...smsForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">企业名称</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="请输入企业名称"
                      value={smsForm.companyName}
                      onChange={(e) => setSmsForm({ ...smsForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '注册并开始免费试用'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-code">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email-code"
                        type="text"
                        placeholder="请输入验证码"
                        className="flex-1"
                        value={emailForm.code}
                        onChange={(e) => setEmailForm({ ...emailForm, code: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0"
                        onClick={handleSendEmailCode}
                        disabled={emailCountdown > 0 || loading}
                      >
                        {emailCountdown > 0 ? `${emailCountdown}秒后重试` : '获取验证码'}
                      </Button>
                    </div>
                    {devCode && (
                      <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        💡 开发环境验证码：<strong>{devCode}</strong>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-name">姓名</Label>
                    <Input
                      id="email-name"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={emailForm.name}
                      onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">设置密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">企业名称</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="请输入企业名称"
                      value={emailForm.companyName}
                      onChange={(e) => setEmailForm({ ...emailForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '注册并开始免费试用'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              已有账号?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                立即登录
              </Link>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-center text-sm text-blue-900 dark:text-blue-300">
                <span className="font-semibold">免费试用权益:</span> 基础招聘（3个岗位）、30人以内员工档案、基础报表
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
