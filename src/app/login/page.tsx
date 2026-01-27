'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowLeft, Loader2, Bug } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms' | 'email'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  // 检测是否是开发模式
  useEffect(() => {
    setIsDevMode(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  // 密码登录表单状态
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    password: '',
  });

  // 短信登录表单状态
  const [smsForm, setSmsForm] = useState({
    phone: '',
    code: '',
  });
  const [smsCountdown, setSmsCountdown] = useState(0);

  // 邮箱登录表单状态
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: '',
  });
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [devCode, setDevCode] = useState(''); // 开发环境验证码

  // 开发模式快速登录
  const handleDevLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: 'admin',
          password: 'admin123',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || '开发模式登录失败');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || '开发模式登录失败');
      }

      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '开发模式登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: passwordForm.username,
          password: passwordForm.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = '登录失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `登录失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // 保存用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      // 跳转到仪表盘
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
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
          purpose: 'login',
        }),
      });

      if (!response.ok) {
        let errorMessage = '发送失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `发送失败 (${response.status})`;
        }
        throw new Error(errorMessage);
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
          purpose: 'login',
        }),
      });

      if (!response.ok) {
        let errorMessage = '发送失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `发送失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // 开发环境：保存验证码以便显示给用户
      if (data.data?.code) {
        setDevCode(data.data.code);
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

  const handleSmsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsForm),
      });

      if (!response.ok) {
        let errorMessage = '验证码错误';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `验证码错误 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || '验证码错误');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '验证码错误');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm),
      });

      if (!response.ok) {
        let errorMessage = '验证码错误';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `验证码错误 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || '验证码错误');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '验证码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
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
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录到 PulseOpti HR 脉策聚效</CardDescription>
          </CardHeader>

          <CardContent>
            {/* 开发模式快速登录 */}
            {isDevMode && (
              <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Bug className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    开发模式：使用 admin / admin123 快速登录
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    onClick={handleDevLogin}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : '一键登录'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="password" onClick={() => setLoginMethod('password')}>
                  密码登录
                </TabsTrigger>
                <TabsTrigger value="sms" onClick={() => setLoginMethod('sms')}>
                  手机验证
                </TabsTrigger>
                <TabsTrigger value="email" onClick={() => setLoginMethod('email')}>
                  邮箱登录
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="username">账号</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入手机号或邮箱"
                      value={passwordForm.username}
                      onChange={(e) => setPasswordForm({ ...passwordForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">密码</Label>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                        忘记密码?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <form onSubmit={handleSmsLogin}>
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
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin}>
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
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '登录'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              还没有账号?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                立即注册
              </Link>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              登录即表示同意我们的
              <Link href="/terms" className="text-blue-600 hover:text-blue-700"> 服务条款 </Link>
              和
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700"> 隐私政策</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
