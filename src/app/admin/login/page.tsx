'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, Crown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

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
          account: formData.username,
          password: formData.password,
        }),
      });

      // 使用 text() + JSON.parse() 处理空响应
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { success: false, data: null, error: '服务器返回空响应' };
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        throw new Error('服务器返回数据格式错误');
      }

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || '登录失败';
        console.error('登录失败:', { status: response.status, data });
        throw new Error(errorMessage);
      }

      // 检查数据是否存在
      if (!data.data) {
        console.error('数据结构错误:', data);
        throw new Error('登录失败：服务器未返回数据');
      }

      if (!data.data.user) {
        console.error('用户数据缺失:', data);
        throw new Error('登录失败：服务器未返回用户信息');
      }

      // 检查是否为超级管理员
      if (!data.data.user.isSuperAdmin) {
        throw new Error('该账号不是超级管理员，无法访问超管端');
      }

      if (!data.data.token) {
        console.error('Token缺失:', data);
        throw new Error('登录失败：服务器未返回认证令牌');
      }

      // 保存用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('isSuperAdmin', 'true');

      // 跳转到超管端仪表盘
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('登录异常:', err);
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            超级管理后台
          </h1>
          <p className="text-purple-200">
            PulseOpti HR 脉策聚效 - 系统管理
          </p>
        </div>

        {/* 登录卡片 */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-white">
              管理员登录
            </CardTitle>
            <CardDescription className="text-purple-200">
              使用超级管理员账号登录后台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 账号 */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  管理员账号
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="输入管理员账号"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:ring-purple-500"
                  disabled={loading}
                  required
                />
              </div>

              {/* 密码 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:ring-purple-500"
                  disabled={loading}
                  required
                />
              </div>

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
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

            {/* 返回首页 */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-purple-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回用户端
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <div className="mt-6 text-center">
          <p className="text-purple-300 text-sm">
            如果您没有超级管理员账号，请联系系统管理员
          </p>
        </div>
      </div>
    </div>
  );
}
