'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/branding/Logo';
import { ArrowLeft, Home, Search, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="full" size="lg" href="/" />
          </div>

          {/* 404 Icon */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20"></div>
            <div className="relative text-7xl font-bold bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              404
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            页面未找到
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            抱歉，您访问的页面不存在或已被移除
          </p>

          {/* Quick Links */}
          <div className="grid gap-3 md:grid-cols-3 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                仪表盘
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                价格方案
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                联系支持
              </Button>
            </Link>
          </div>

          {/* Back Button */}
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            如果您认为这是一个错误，请{' '}
            <Link href="/support" className="text-blue-600 hover:underline">
              联系我们
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
