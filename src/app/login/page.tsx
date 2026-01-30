'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowLeft, Loader2, Eye, EyeOff, Bug, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  // 密码显示状态
  const [showPassword, setShowPassword] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    account: '',
    password: '',
  });

  // 确保客户端已挂载
  useEffect(() => {
    setMounted(true);
    // 检测是否是开发模式
    setIsDevMode(
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );
  }, []);

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

      // 保存用户信息到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '开发模式登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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
          account: formData.account,
          password: formData.password,
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

      if (!data.success) {
        throw new Error(data.message || '登录失败');
      }

      // 保存用户信息到 localStorage
      if (data.data?.user && data.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('token', data.data.token);
        }
      } else {
        throw new Error('服务器返回数据格式错误');
      }

      // 跳转到仪表盘
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
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

          <CardContent className="space-y-6">
            {/* 开发模式快速登录 */}
            {isDevMode && (
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
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

            {/* 登录提示 */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                支持使用邮箱、手机号或用户名登录
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* 账号输入 */}
              <div className="space-y-2">
                <Label htmlFor="account">账号 *</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder="请输入邮箱、手机号或用户名"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  required
                  autoComplete="username"
                />
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码 *</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    忘记密码?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>
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
