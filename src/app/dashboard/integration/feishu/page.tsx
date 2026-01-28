'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  UserPlus,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Zap,
  Crown,
  ArrowRight,
  ExternalLink,
  Shield,
  Key,
  Plug,
  Play,
  Pause,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

type SyncStatus = 'active' | 'paused' | 'error' | 'disconnected';
type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

interface SyncConfig {
  appId: string;
  appSecret: string;
  enabled: boolean;
  autoSync: boolean;
  syncFrequency: SyncFrequency;
  syncOrganizations: boolean;
  syncDepartments: boolean;
  syncEmployees: boolean;
  syncAttendances: boolean;
  syncApprovals: boolean;
}

export default function FeishuIntegrationPage() {
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');

  const [config, setConfig] = useState<SyncConfig>({
    appId: '',
    appSecret: '',
    enabled: false,
    autoSync: true,
    syncFrequency: 'daily',
    syncOrganizations: true,
    syncDepartments: true,
    syncEmployees: true,
    syncAttendances: false,
    syncApprovals: false,
  });

  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [nextSyncTime, setNextSyncTime] = useState<string>('');

  const syncStatistics = [
    { label: '组织架构', value: 12, unit: '个', icon: Building2, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900' },
    { label: '部门数据', value: 45, unit: '个', icon: Users, color: 'text-green-600 bg-green-100 dark:bg-green-900' },
    { label: '员工数据', value: 156, unit: '人', icon: UserPlus, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900' },
    { label: '考勤记录', value: 2890, unit: '条', icon: Clock, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' },
  ];

  const integrationSteps = [
    {
      title: '创建飞书应用',
      description: '在飞书开放平台创建自建应用',
      icon: Plug,
      completed: false,
    },
    {
      title: '获取应用凭证',
      description: '获取App ID和App Secret',
      icon: Key,
      completed: false,
    },
    {
      title: '配置权限',
      description: '授予组织架构、通讯录、考勤等权限',
      icon: Shield,
      completed: false,
    },
    {
      title: '建立连接',
      description: '配置凭证并建立同步连接',
      icon: CheckCircle,
      completed: false,
    },
  ];

  useEffect(() => {
    // 模拟加载
    setTimeout(() => {
      setLastSyncTime('2024-12-15 10:30:00');
      setNextSyncTime('2024-12-16 02:00:00');
    }, 500);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnecting(false);
    setConnectionStatus('connected');
    setSyncStatus('active');
    toast.success('飞书集成连接成功');
    setShowConfigDialog(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setConnectionStatus('disconnected');
    setSyncStatus('disconnected');
    toast.success('已断开飞书集成');
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSyncing(false);
    setLastSyncTime(new Date().toLocaleString('zh-CN'));
    toast.success('数据同步完成');
  };

  const handleTestConnection = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    if (config.appId && config.appSecret) {
      toast.success('连接测试成功');
    } else {
      toast.error('请先配置App ID和App Secret');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      connected: { label: '已连接', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      disconnected: { label: '未连接', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      error: { label: '连接失败', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      active: { label: '同步中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      paused: { label: '已暂停', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    };
    const variant = variants[status] || variants.disconnected;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              飞书集成
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              与飞书无缝对接，实现数据自动同步和流程协同
            </p>
          </div>
          <div className="flex gap-2">
            {connectionStatus === 'connected' && (
              <>
                <Button variant="outline" onClick={handleSyncNow} disabled={syncing}>
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      同步中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      立即同步
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  配置同步
                </Button>
                <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
                  断开连接
                </Button>
              </>
            )}
            {connectionStatus !== 'connected' && (
              <Button
                onClick={() => setShowConfigDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plug className="h-4 w-4 mr-2" />
                开始集成
              </Button>
            )}
          </div>
        </div>

        {/* 连接状态卡片 */}
        <Card className={`border-2 ${connectionStatus === 'connected' ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {connectionStatus === 'connected' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  集成状态
                </CardTitle>
                <CardDescription className="mt-1">
                  当前飞书集成连接状态
                </CardDescription>
              </div>
              {getStatusBadge(connectionStatus)}
            </div>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'connected' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {syncStatistics.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="p-3 rounded-lg border dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded ${stat.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                          <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                            {stat.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">上次同步</div>
                      <div className="font-medium text-gray-900 dark:text-white">{lastSyncTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">下次同步</div>
                      <div className="font-medium text-gray-900 dark:text-white">{nextSyncTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {connectionStatus !== 'connected' && (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  还未连接飞书，点击"开始集成"按钮开始配置
                </p>
                <Button
                  onClick={() => setShowConfigDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plug className="h-4 w-4 mr-2" />
                  开始集成
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 集成步骤指南 */}
        <Card>
          <CardHeader>
            <CardTitle>集成步骤</CardTitle>
            <CardDescription>
              按照以下步骤完成飞书集成配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {integrationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <div className={`p-4 rounded-lg border-2 transition-all ${step.completed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${step.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Icon className={`h-5 w-5 ${step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                        </div>
                        {step.completed && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                    {index < integrationSteps.length - 1 && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block">
                        <ArrowRight className="h-6 w-6 text-gray-300 dark:text-gray-700" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 功能配置 */}
        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              数据同步
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              消息通知
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              审批流程
            </TabsTrigger>
          </TabsList>

          {/* 数据同步配置 */}
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>同步数据类型</CardTitle>
                <CardDescription>
                  选择需要从飞书同步到本系统的数据类型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">组织架构</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">同步飞书组织架构信息</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.syncOrganizations}
                    onCheckedChange={(checked) => setConfig({ ...config, syncOrganizations: checked })}
                    disabled={connectionStatus !== 'connected'}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">部门信息</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">同步飞书部门结构和人员</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.syncDepartments}
                    onCheckedChange={(checked) => setConfig({ ...config, syncDepartments: checked })}
                    disabled={connectionStatus !== 'connected'}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                      <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">员工信息</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">同步飞书员工基本信息</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.syncEmployees}
                    onCheckedChange={(checked) => setConfig({ ...config, syncEmployees: checked })}
                    disabled={connectionStatus !== 'connected'}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">考勤数据</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">同步飞书考勤打卡记录</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.syncAttendances}
                    onCheckedChange={(checked) => setConfig({ ...config, syncAttendances: checked })}
                    disabled={connectionStatus !== 'connected'}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded">
                      <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">审批流程</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">同步飞书审批记录</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.syncApprovals}
                    onCheckedChange={(checked) => setConfig({ ...config, syncApprovals: checked })}
                    disabled={connectionStatus !== 'connected'}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>同步设置</CardTitle>
                <CardDescription>
                  配置数据同步的频率和方式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>同步频率</Label>
                    <Select
                      value={config.syncFrequency}
                      onValueChange={(v) => setConfig({ ...config, syncFrequency: v as SyncFrequency })}
                      disabled={connectionStatus !== 'connected'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">实时同步</SelectItem>
                        <SelectItem value="hourly">每小时</SelectItem>
                        <SelectItem value="daily">每天</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>自动同步</Label>
                    <div className="flex items-center gap-2 p-3 border rounded-lg dark:border-gray-700">
                      <Switch
                        checked={config.autoSync}
                        onCheckedChange={(checked) => setConfig({ ...config, autoSync: checked })}
                        disabled={connectionStatus !== 'connected'}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        按设定频率自动同步数据
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 消息通知配置 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>飞书消息通知</CardTitle>
                <CardDescription>
                  配置系统事件推送到飞书群聊或个人
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: '员工入职通知', icon: UserPlus, desc: '新员工入职时发送通知' },
                    { name: '审批流程通知', icon: FileText, desc: '审批申请和结果通知' },
                    { name: '考勤异常提醒', icon: Clock, desc: '考勤异常时发送提醒' },
                    { name: '生日祝福', icon: Calendar, desc: '员工生日自动发送祝福' },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <Switch disabled={connectionStatus !== 'connected'} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 审批流程配置 */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>审批流程集成</CardTitle>
                <CardDescription>
                  集成飞书审批流程，实现双向同步
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: '请假审批', icon: Calendar, count: 45, sync: true },
                    { name: '报销审批', icon: FileText, count: 32, sync: true },
                    { name: '出差审批', icon: Clock, count: 18, sync: false },
                    { name: '加班审批', icon: Clock, count: 28, sync: true },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              已同步 {item.count} 条记录
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.sync && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              已同步
                            </Badge>
                          )}
                          <Switch defaultChecked={item.sync} disabled={connectionStatus !== 'connected'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 配置对话框 */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>配置飞书集成</DialogTitle>
              <DialogDescription>
                输入飞书应用凭证以建立连接
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                      获取应用凭证
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      1. 访问<a href="https://open.feishu.cn" target="_blank" rel="noopener noreferrer" className="underline mx-1">飞书开放平台</a><br />
                      2. 创建应用或选择已有应用<br />
                      3. 在"凭证与基础信息"中获取App ID和App Secret
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID *</Label>
                  <Input
                    id="appId"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                    placeholder="cli_xxxxxxxxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appSecret">App Secret *</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    value={config.appSecret}
                    onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleTestConnection} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  测试连接
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={connecting || !config.appId || !config.appSecret}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex-1"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      连接中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      确认连接
                    </>
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                取消
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PRO提示 */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  企业协作高级功能
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  升级企业版可解锁更多高级功能，包括双向数据同步、自定义字段映射、历史数据回溯、多租户管理等
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                立即升级
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
