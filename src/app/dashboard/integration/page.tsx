'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building, CheckCircle, XCircle, Plus, Settings, RefreshCw } from 'lucide-react';

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState('available');

  const integrations = [
    {
      name: '钉钉',
      description: '阿里钉钉企业办公平台集成',
      icon: '🔷',
      status: 'connected',
      features: ['员工同步', '考勤打卡', '审批对接', '消息通知'],
      connectedAt: '2024-01-15',
    },
    {
      name: '飞书',
      description: '字节跳动企业协作平台集成',
      icon: '🦅',
      status: 'disconnected',
      features: ['员工同步', '日历同步', '文档集成', '消息推送'],
    },
    {
      name: '企业微信',
      description: '腾讯企业微信集成',
      icon: '💬',
      status: 'disconnected',
      features: ['员工同步', '消息通知', '审批对接', '客户管理'],
    },
  ];

  const syncSettings = {
    interval: '每小时',
    autoSync: true,
    dataTypes: ['员工信息', '组织架构', '考勤数据'],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">企业集成</h1>
                <Badge className="bg-purple-600">PRO</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                钉钉、飞书、企微无缝集成
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              添加集成
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                已连接应用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
                  <div className="text-xs text-gray-500 mt-1">钉钉已连接</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                同步状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">正常</div>
                  <div className="text-xs text-gray-500 mt-1">最后同步: 5分钟前</div>
                </div>
                <RefreshCw className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                数据同步
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,248</div>
                  <div className="text-xs text-gray-500 mt-1">条记录已同步</div>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                同步频率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">每小时</div>
                  <div className="text-xs text-gray-500 mt-1">自动同步</div>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="available">可用集成</TabsTrigger>
            <TabsTrigger value="settings">同步设置</TabsTrigger>
            <TabsTrigger value="logs">同步日志</TabsTrigger>
          </TabsList>

          {/* 可用集成标签页 */}
          <TabsContent value="available" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>企业应用集成</CardTitle>
                <CardDescription>连接第三方企业应用，实现数据同步和功能联动</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{integration.icon}</div>
                            <div>
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {integration.status === 'connected' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <Badge className="bg-green-600 text-xs">已连接</Badge>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                    <Badge variant="secondary" className="text-xs">未连接</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardDescription>{integration.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              集成功能
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {integration.features.map((feature, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {integration.status === 'connected' && (
                            <div className="text-sm text-gray-500">
                              连接时间：{integration.connectedAt}
                            </div>
                          )}
                          <div>
                            {integration.status === 'connected' ? (
                              <Button className="w-full" variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                配置设置
                              </Button>
                            ) : (
                              <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                连接应用
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 同步设置标签页 */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>同步设置</CardTitle>
                <CardDescription>配置数据同步规则和频率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 自动同步开关 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">自动同步</h3>
                        <p className="text-sm text-gray-500">
                          开启后将自动同步第三方应用的数据
                        </p>
                      </div>
                      <Switch checked={syncSettings.autoSync} />
                    </div>
                  </div>

                  {/* 同步频率 */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">同步频率</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['实时', '每小时', '每天', '每周'].map((freq, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                            freq === syncSettings.interval
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{freq}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 数据类型选择 */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">同步数据类型</h3>
                    <div className="space-y-3">
                      {[
                        { name: '员工信息', description: '员工基本信息、部门职位' },
                        { name: '组织架构', description: '部门结构、岗位层级' },
                        { name: '考勤数据', description: '打卡记录、请假数据' },
                        { name: '审批数据', description: '审批流程、审批记录' },
                        { name: '消息通知', description: '系统消息、提醒通知' },
                        { name: '日历数据', description: '日程安排、会议记录' },
                      ].map((type, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                          <Switch
                            checked={syncSettings.dataTypes.includes(type.name) || index < 3}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 手动同步 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">手动同步</h3>
                        <p className="text-sm text-gray-500">
                          立即触发一次数据同步操作
                        </p>
                      </div>
                      <Button>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        立即同步
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 同步日志标签页 */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>同步日志</CardTitle>
                    <CardDescription>查看所有数据同步记录和状态</CardDescription>
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      app: '钉钉',
                      dataType: '员工信息',
                      status: 'success',
                      records: 1248,
                      duration: '2.3秒',
                      syncTime: '2024-12-01 14:30:00',
                    },
                    {
                      app: '钉钉',
                      dataType: '考勤数据',
                      status: 'success',
                      records: 856,
                      duration: '1.8秒',
                      syncTime: '2024-12-01 14:00:00',
                    },
                    {
                      app: '钉钉',
                      dataType: '审批数据',
                      status: 'failed',
                      records: 0,
                      duration: '0.5秒',
                      syncTime: '2024-12-01 13:00:00',
                      error: 'API调用失败：权限不足',
                    },
                  ].map((log, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              log.status === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}
                          >
                            {log.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {log.app}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {log.dataType}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  log.status === 'success'
                                    ? 'bg-green-600'
                                    : 'bg-red-600'
                                }`}
                              >
                                {log.status === 'success' ? '成功' : '失败'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{log.records} 条记录</span>
                              <span>•</span>
                              <span>耗时 {log.duration}</span>
                              <span>•</span>
                              <span>{log.syncTime}</span>
                            </div>
                            {log.error && (
                              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                错误：{log.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
