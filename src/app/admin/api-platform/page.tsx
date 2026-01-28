'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
  BookOpen,
  Zap,
  Terminal,
  Globe,
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  lastUsed: string;
  permissions: string[];
  rateLimit: number;
  expiresAt: string;
}

interface APICall {
  id: string;
  method: string;
  endpoint: string;
  status: number;
  timestamp: string;
  responseTime: number;
  key: string;
}

// 模拟API密钥数据
const API_KEYS_DATA: APIKey[] = [
  {
    id: '1',
    name: '生产环境密钥',
    key: 'pk_live_PLACEHOLDER_KEY_XXXXXXXXXXXXXXXXXXXX',
    status: 'active',
    createdAt: '2024-01-01',
    lastUsed: '2025-01-16 10:30',
    permissions: ['employees.read', 'performance.read', 'attendance.read'],
    rateLimit: 1000,
    expiresAt: '2026-01-01',
  },
  {
    id: '2',
    name: '测试环境密钥',
    key: 'pk_test_PLACEHOLDER_KEY_XXXXXXXXXXXXXXXXXXXX',
    status: 'active',
    createdAt: '2024-06-01',
    lastUsed: '2025-01-15 15:20',
    permissions: ['*'],
    rateLimit: 100,
    expiresAt: '2025-06-01',
  },
];

// 模拟API调用记录
const API_CALLS_DATA: APICall[] = [
  {
    id: '1',
    method: 'GET',
    endpoint: '/api/v1/employees',
    status: 200,
    timestamp: '2025-01-16 10:30:25',
    responseTime: 125,
    key: 'sk_live_***',
  },
  {
    id: '2',
    method: 'POST',
    endpoint: '/api/v1/attendance/checkin',
    status: 200,
    timestamp: '2025-01-16 10:25:10',
    responseTime: 89,
    key: 'sk_test_***',
  },
  {
    id: '3',
    method: 'GET',
    endpoint: '/api/v1/performance/goals',
    status: 401,
    timestamp: '2025-01-16 10:20:05',
    responseTime: 45,
    key: 'sk_live_***',
  },
];

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/employees',
    description: '获取员工列表',
    scope: 'employees.read',
  },
  {
    method: 'POST',
    path: '/api/v1/employees',
    description: '创建员工',
    scope: 'employees.write',
  },
  {
    method: 'GET',
    path: '/api/v1/employees/{id}',
    description: '获取员工详情',
    scope: 'employees.read',
  },
  {
    method: 'PUT',
    path: '/api/v1/employees/{id}',
    description: '更新员工信息',
    scope: 'employees.write',
  },
  {
    method: 'DELETE',
    path: '/api/v1/employees/{id}',
    description: '删除员工',
    scope: 'employees.write',
  },
  {
    method: 'GET',
    path: '/api/v1/performance/goals',
    description: '获取绩效目标',
    scope: 'performance.read',
  },
  {
    method: 'POST',
    path: '/api/v1/performance/goals',
    description: '创建绩效目标',
    scope: 'performance.write',
  },
  {
    method: 'GET',
    path: '/api/v1/attendance/records',
    description: '获取考勤记录',
    scope: 'attendance.read',
  },
  {
    method: 'POST',
    path: '/api/v1/attendance/checkin',
    description: '员工打卡',
    scope: 'attendance.write',
  },
  {
    method: 'GET',
    path: '/api/v1/export/data',
    description: '导出数据',
    scope: 'export.read',
  },
];

export default function APIPlatformPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const copyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
      POST: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      PUT: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
      DELETE: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    };
    return colors[method] || 'bg-gray-100 text-gray-600';
  };

  const stats = {
    totalKeys: API_KEYS_DATA.length,
    activeKeys: API_KEYS_DATA.filter(k => k.status === 'active').length,
    totalCalls: 12580,
    successRate: 98.5,
    avgResponseTime: 95,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API开放平台
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Zap className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            通过API集成PulseOpti HR到您的应用
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          创建API密钥
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>API密钥</CardDescription>
            <CardTitle className="text-3xl">{stats.totalKeys}</CardTitle>
            <div className="text-xs text-green-600 mt-1">
              {stats.activeKeys} 个活跃
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-600" />
              总调用次数
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalCalls.toLocaleString()}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              本月
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>成功率</CardDescription>
            <CardTitle className="text-3xl">{stats.successRate}%</CardTitle>
            <div className="text-xs text-green-600 mt-1">
              ↑ 2.3% 较上月
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均响应时间</CardDescription>
            <CardTitle className="text-3xl">{stats.avgResponseTime}ms</CardTitle>
            <div className="text-xs text-green-600 mt-1">
              ↓ 15ms 较上月
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 功能标签 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="keys">API密钥</TabsTrigger>
          <TabsTrigger value="docs">API文档</TabsTrigger>
          <TabsTrigger value="logs">调用日志</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 快速开始 */}
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>快速集成API到您的应用</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">创建API密钥</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        在API密钥页面创建新的密钥
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">配置权限</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        设置密钥的权限范围和速率限制
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">调用API</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        使用密钥调用API接口
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  查看详细文档
                  <BookOpen className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* API限制 */}
            <Card>
              <CardHeader>
                <CardTitle>API使用限制</CardTitle>
                <CardDescription>不同套餐的调用限制</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">基础版</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">1,000次/天</div>
                    </div>
                    <Badge variant="outline">免费</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">专业版</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">100,000次/天</div>
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">PRO</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">企业版</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">无限制</div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">ENT</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API密钥 */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API密钥管理</CardTitle>
              <CardDescription>管理您的API密钥和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {API_KEYS_DATA.map((apiKey) => {
                  const isHidden = !showKey[apiKey.id];
                  const maskedKey = apiKey.key.substring(0, 7) + '...' + apiKey.key.substring(apiKey.key.length - 4);

                  return (
                    <Card key={apiKey.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {apiKey.name}
                              </h3>
                              <Badge variant="outline" className="bg-green-100 text-green-600">
                                活跃
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono">
                                {isHidden ? maskedKey : apiKey.key}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {isHidden ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyKey(apiKey.key, apiKey.id)}
                              >
                                {copiedKey === apiKey.id ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                              <div>
                                <div className="text-gray-600 dark:text-gray-400">创建时间</div>
                                <div className="text-gray-900 dark:text-white">{apiKey.createdAt}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 dark:text-gray-400">最后使用</div>
                                <div className="text-gray-900 dark:text-white">{apiKey.lastUsed}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 dark:text-gray-400">速率限制</div>
                                <div className="text-gray-900 dark:text-white">{apiKey.rateLimit}/天</div>
                              </div>
                              <div>
                                <div className="text-gray-600 dark:text-gray-400">过期时间</div>
                                <div className="text-gray-900 dark:text-white">{apiKey.expiresAt}</div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">权限</div>
                              <div className="flex flex-wrap gap-2">
                                {apiKey.permissions.map((perm, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              刷新
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-1" />
                              撤销
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API文档 */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API接口文档</CardTitle>
              <CardDescription>可用的API接口列表</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
                      {endpoint.path}
                    </code>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {endpoint.description}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {endpoint.scope}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  查看完整文档
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 调用日志 */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API调用日志</CardTitle>
              <CardDescription>查看API调用历史</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_CALLS_DATA.map((call) => (
                  <div key={call.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Badge className={getMethodColor(call.method)}>
                      {call.method}
                    </Badge>
                    <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
                      {call.endpoint}
                    </code>
                    <Badge
                      variant="outline"
                      className={
                        call.status >= 200 && call.status < 300
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }
                    >
                      {call.status}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {call.responseTime}ms
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {call.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
