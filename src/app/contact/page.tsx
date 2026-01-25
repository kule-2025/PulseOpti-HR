'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'inquiry',
          category: 'contact',
          content: formData.message,
          userId: 'guest', // 访客用户
          companyId: 'none',
          contactEmail: formData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('感谢您的留言！我们会尽快联系您。');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        alert(data.error || '发送失败，请重试');
      }
    } catch (error) {
      console.error('发送留言失败:', error);
      alert('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" href="/" />

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold">
                  免费试用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-12 text-center">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
        <Badge className="mb-4 bg-blue-100 text-blue-700">
          <MessageSquare className="mr-2 h-3.5 w-3.5" />
          联系我们
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          随时为您提供帮助
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          有问题或需要支持？请联系我们，我们的团队将竭诚为您服务
        </p>
      </section>

      {/* 联系信息 */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <CardTitle>邮箱</CardTitle>
              <CardDescription>发送邮件咨询</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">PulseOptiHR@163.com</p>
              <p className="text-sm text-gray-600 mt-2">通常在24小时内回复</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <CardTitle>工作时间</CardTitle>
              <CardDescription>客服时间</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">周一至周五</p>
              <p className="text-sm text-gray-600 mt-2">9:00-12:00, 14:00-18:00</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle>地址</CardTitle>
              <CardDescription>上门洽谈</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">广州市天河区</p>
              <p className="text-sm text-gray-600 mt-2">期待与您的会面</p>
            </CardContent>
          </Card>
        </div>

        {/* 微信二维码 */}
        <div className="mt-12 flex justify-center">
          <Card className="border-2 max-w-sm">
            <CardHeader>
              <CardTitle className="text-center">微信咨询</CardTitle>
              <CardDescription className="text-center">扫码添加客服微信</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">二维码</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 联系表单 */}
      <section className="container mx-auto px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">发送消息</CardTitle>
              <CardDescription>请填写以下信息，我们会尽快与您联系</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 *</Label>
                    <Input
                      id="name"
                      placeholder="请输入您的姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入您的邮箱"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">电话</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入您的电话"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">公司名称</Label>
                    <Input
                      id="company"
                      placeholder="请输入公司名称"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">留言 *</Label>
                  <Textarea
                    id="message"
                    placeholder="请输入您的问题或需求"
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      发送消息
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 PulseOpti HR 脉策聚效. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
