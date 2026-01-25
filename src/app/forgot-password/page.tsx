'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [resetMethod, setResetMethod] = useState<'sms' | 'email'>('sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 短信重置表单状态
  const [smsForm, setSmsForm] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [smsCountdown, setSmsCountdown] = useState(0);

  // 邮箱重置表单状态
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailCountdown, setEmailCountdown] = useState(0);

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
          purpose: 'reset',
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

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
          purpose: 'reset',
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || '发送失败');
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

  const handleSmsReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (smsForm.newPassword !== smsForm.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: smsForm.phone,
          code: smsForm.code,
          newPassword: smsForm.newPassword,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || '重置失败');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailForm.newPassword !== emailForm.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailForm.email,
          code: emailForm.code,
          newPassword: emailForm.newPassword,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || '重置失败');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white shadow-xl dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">密码重置成功</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  您的密码已成功重置，现在可以使用新密码登录
                </p>
              </div>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  立即登录
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回登录
        </Link>

        <Card className="bg-white shadow-xl dark:bg-gray-800">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">重置密码</CardTitle>
            <CardDescription>选择验证方式并设置新密码</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="sms" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sms" onClick={() => setResetMethod('sms')}>
                  手机验证
                </TabsTrigger>
                <TabsTrigger value="email" onClick={() => setResetMethod('email')}>
                  邮箱验证
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sms" className="space-y-4">
                <form onSubmit={handleSmsReset}>
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
                    <Label htmlFor="new-password">新密码</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      value={smsForm.newPassword}
                      onChange={(e) => setSmsForm({ ...smsForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="再次输入新密码"
                      value={smsForm.confirmPassword}
                      onChange={(e) => setSmsForm({ ...smsForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '重置密码'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailReset}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新密码</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="至少8位，包含字母和数字"
                      value={emailForm.newPassword}
                      onChange={(e) => setEmailForm({ ...emailForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="再次输入新密码"
                      value={emailForm.confirmPassword}
                      onChange={(e) => setEmailForm({ ...emailForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '重置密码'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500 dark:text-gray-500">
              重置密码后，您需要使用新密码登录
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
