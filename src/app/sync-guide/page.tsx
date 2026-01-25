'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Users, ArrowLeft, Shield, Zap, RefreshCw, Database } from 'lucide-react';

export default function SyncGuidePage() {
  const features = [
    {
      id: 1,
      title: '多账号管理',
      icon: <Users className="w-6 h-6" />,
      description: '支持企业主账号、子账号、普通员工账号的协同工作',
      details: [
        '企业主账号拥有完整管理权限',
        '子账号可自定义功能权限',
        '普通员工账号自助操作个人信息'
      ]
    },
    {
      id: 2,
      title: '实时数据同步',
      icon: <Zap className="w-6 h-6" />,
      description: '所有账号之间的数据实时同步，确保信息一致性',
      details: [
        '组织架构变更实时同步',
        '人事信息更新即时生效',
        '考勤数据自动汇总'
      ]
    },
    {
      id: 3,
      title: '权限分级管理',
      icon: <Shield className="w-6 h-6" />,
      description: '基于角色的权限控制，确保数据安全',
      details: [
        '企业主账号可自定义子账号权限',
        '敏感操作需要相应权限',
        '完整的操作审计日志'
      ]
    },
    {
      id: 4,
      title: '数据安全保护',
      icon: <Database className="w-6 h-6" />,
      description: '企业级数据加密和安全防护',
      details: [
        'AES-256 加密存储',
        '定期自动备份',
        '符合数据安全法规要求'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PulseOpti HR 脉策聚效
            </Link>

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

      <div className="container mx-auto px-6 py-12">
        {/* 返回首页 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            数据同步
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            多账号协同管理
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            支持企业主账号、子账号、普通员工账号的实时数据同步，确保团队协作高效顺畅
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={feature.id} className="border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Notice */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-green-800">
              <Shield className="w-6 h-6" />
              数据安全保障
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              我们采用企业级安全措施保护您的数据安全：
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">加密存储</h4>
                <p className="text-sm text-gray-600">AES-256企业级加密，确保数据安全</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">定期备份</h4>
                <p className="text-sm text-gray-600">每日自动备份，异地容灾</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">权限控制</h4>
                <p className="text-sm text-gray-600">精细化权限管理，完整审计日志</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-gray-600 mb-8">
            立即注册，体验多账号协同管理
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
              免费开始
              <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
