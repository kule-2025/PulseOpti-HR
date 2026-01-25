/**
 * 短信服务管理页面
 * 路径: /sms
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Send, Trash2, Edit, TestTube, TrendingUp, Activity } from 'lucide-react';

interface SmsConfig {
  id: string;
  name: string;
  provider: string;
  accessKeyId: string;
  signName: string;
  region?: string;
  isDefault: boolean;
  isActive: boolean;
  dailyLimit?: number;
  hourlyLimit?: number;
  createdAt: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  templateId?: string;
  content: string;
  variables?: string[];
  isActive: boolean;
  isSystem: boolean;
  usageCount: number;
  lastUsedAt?: string;
}

interface SmsLog {
  id: string;
  phoneNumber: string;
  content: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  createdAt: string;
  sentAt?: string;
  error?: string;
  template?: { name: string; code: string };
  config?: { name: string; provider: string };
}

export default function SmsManagementPage() {
  const [activeTab, setActiveTab] = useState('configs');
  const [configs, setConfigs] = useState<SmsConfig[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 配置表单
  const [configForm, setConfigForm] = useState({
    name: '',
    provider: 'aliyun',
    accessKeyId: '',
    accessKeySecret: '',
    signName: '',
    region: 'cn-hangzhou',
    isDefault: false,
    isActive: true,
    dailyLimit: 1000,
    hourlyLimit: 100,
  });

  // 模板表单
  const [templateForm, setTemplateForm] = useState({
    name: '',
    code: '',
    category: 'verification',
    templateId: '',
    content: '',
    variables: '',
    isActive: true,
  });

  // 发送表单
  const [sendForm, setSendForm] = useState({
    phoneNumber: '',
    templateCode: '',
    variables: '{}',
  });

  // 加载数据
  useEffect(() => {
    loadConfigs();
    loadTemplates();
    loadLogs();
    loadStats();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/sms/configs');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败');
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/sms/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      toast.error('加载模板失败');
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/sms/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      toast.error('加载记录失败');
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/sms/statistics');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      toast.error('加载统计数据失败');
    }
  };

  // 创建配置
  const handleCreateConfig = async () => {
    try {
      const res = await fetch('/api/sms/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('配置创建成功');
        loadConfigs();
        setConfigForm({
          name: '',
          provider: 'aliyun',
          accessKeyId: '',
          accessKeySecret: '',
          signName: '',
          region: 'cn-hangzhou',
          isDefault: false,
          isActive: true,
          dailyLimit: 1000,
          hourlyLimit: 100,
        });
      } else {
        toast.error(data.error || '创建配置失败');
      }
    } catch (error) {
      console.error('创建配置失败:', error);
      toast.error('创建配置失败');
    }
  };

  // 创建模板
  const handleCreateTemplate = async () => {
    try {
      const variables = templateForm.variables
        ? templateForm.variables.split(',').map(v => v.trim())
        : [];

      const res = await fetch('/api/sms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          variables,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('模板创建成功');
        loadTemplates();
        setTemplateForm({
          name: '',
          code: '',
          category: 'verification',
          templateId: '',
          content: '',
          variables: '',
          isActive: true,
        });
      } else {
        toast.error(data.error || '创建模板失败');
      }
    } catch (error) {
      console.error('创建模板失败:', error);
      toast.error('创建模板失败');
    }
  };

  // 发送短信
  const handleSendSms = async () => {
    try {
      const variables = JSON.parse(sendForm.variables);
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sendForm,
          variables,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('短信发送成功');
        loadLogs();
        loadStats();
        setSendForm({
          phoneNumber: '',
          templateCode: '',
          variables: '{}',
        });
      } else {
        toast.error(data.error || '发送短信失败');
      }
    } catch (error) {
      console.error('发送短信失败:', error);
      toast.error('发送短信失败');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">短信服务管理</h1>
        <p className="text-muted-foreground mt-2">管理短信配置、模板、发送记录和统计报表</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">今日发送</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                成功率: {stats.today?.successRate || 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">本月发送</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.month?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                成功: {stats.month?.successCount || 0} | 失败: {stats.month?.failedCount || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总发送量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                平均成功率: {stats.summary?.averageSuccessRate || 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">配置状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configs.filter(c => c.isActive).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                活跃配置数
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configs">短信配置</TabsTrigger>
          <TabsTrigger value="templates">短信模板</TabsTrigger>
          <TabsTrigger value="send">发送短信</TabsTrigger>
          <TabsTrigger value="logs">发送记录</TabsTrigger>
          <TabsTrigger value="statistics">统计报表</TabsTrigger>
        </TabsList>

        {/* 短信配置 */}
        <TabsContent value="configs">
          <Card>
            <CardHeader>
              <CardTitle>短信配置</CardTitle>
              <CardDescription>管理阿里云、腾讯云等短信服务商的配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>配置名称</Label>
                    <Input
                      value={configForm.name}
                      onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                      placeholder="如：阿里云短信"
                    />
                  </div>
                  <div>
                    <Label>服务商</Label>
                    <Select
                      value={configForm.provider}
                      onValueChange={(value) => setConfigForm({ ...configForm, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aliyun">阿里云</SelectItem>
                        <SelectItem value="tencent">腾讯云</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>AccessKey ID</Label>
                    <Input
                      value={configForm.accessKeyId}
                      onChange={(e) => setConfigForm({ ...configForm, accessKeyId: e.target.value })}
                      placeholder="输入AccessKey ID"
                    />
                  </div>
                  <div>
                    <Label>AccessKey Secret</Label>
                    <Input
                      type="password"
                      value={configForm.accessKeySecret}
                      onChange={(e) => setConfigForm({ ...configForm, accessKeySecret: e.target.value })}
                      placeholder="输入AccessKey Secret"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>签名</Label>
                    <Input
                      value={configForm.signName}
                      onChange={(e) => setConfigForm({ ...configForm, signName: e.target.value })}
                      placeholder="如：PulseOpti HR"
                    />
                  </div>
                  <div>
                    <Label>区域</Label>
                    <Input
                      value={configForm.region}
                      onChange={(e) => setConfigForm({ ...configForm, region: e.target.value })}
                      placeholder="如：cn-hangzhou"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>每日限制</Label>
                    <Input
                      type="number"
                      value={configForm.dailyLimit}
                      onChange={(e) => setConfigForm({ ...configForm, dailyLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>每小时限制</Label>
                    <Input
                      type="number"
                      value={configForm.hourlyLimit}
                      onChange={(e) => setConfigForm({ ...configForm, hourlyLimit: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={configForm.isDefault}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, isDefault: checked })}
                    />
                    <Label>设为默认</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={configForm.isActive}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, isActive: checked })}
                    />
                    <Label>启用</Label>
                  </div>
                </div>
                <Button onClick={handleCreateConfig}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建配置
                </Button>
              </div>

              {/* 配置列表 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">配置列表</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>服务商</TableHead>
                      <TableHead>签名</TableHead>
                      <TableHead>默认</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>{config.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{config.provider}</Badge>
                        </TableCell>
                        <TableCell>{config.signName}</TableCell>
                        <TableCell>
                          {config.isDefault && <Badge>默认</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.isActive ? 'default' : 'secondary'}>
                            {config.isActive ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 短信模板 */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>短信模板</CardTitle>
              <CardDescription>管理短信模板，支持变量替换</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>模板名称</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="如：验证码模板"
                    />
                  </div>
                  <div>
                    <Label>模板代码</Label>
                    <Input
                      value={templateForm.code}
                      onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                      placeholder="如：verification_code"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>分类</Label>
                    <Select
                      value={templateForm.category}
                      onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verification">验证码</SelectItem>
                        <SelectItem value="notification">通知</SelectItem>
                        <SelectItem value="marketing">营销</SelectItem>
                        <SelectItem value="system">系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>服务商模板ID</Label>
                    <Input
                      value={templateForm.templateId}
                      onChange={(e) => setTemplateForm({ ...templateForm, templateId: e.target.value })}
                      placeholder="服务商提供的模板ID"
                    />
                  </div>
                </div>
                <div>
                  <Label>模板内容</Label>
                  <Textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    placeholder="如：您的验证码是{{code}}，5分钟内有效。"
                  />
                </div>
                <div>
                  <Label>变量（逗号分隔）</Label>
                  <Input
                    value={templateForm.variables}
                    onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                    placeholder="如：code,name"
                  />
                </div>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建模板
                </Button>
              </div>

              {/* 模板列表 */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">模板列表</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>代码</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>使用次数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.code}</Badge>
                        </TableCell>
                        <TableCell>{template.category}</TableCell>
                        <TableCell>{template.usageCount}</TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 发送短信 */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>发送短信</CardTitle>
              <CardDescription>发送单条或批量短信</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>手机号</Label>
                  <Input
                    value={sendForm.phoneNumber}
                    onChange={(e) => setSendForm({ ...sendForm, phoneNumber: e.target.value })}
                    placeholder="请输入手机号"
                  />
                </div>
                <div>
                  <Label>模板</Label>
                  <Select
                    value={sendForm.templateCode}
                    onValueChange={(value) => setSendForm({ ...sendForm, templateCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.isActive).map((template) => (
                        <SelectItem key={template.id} value={template.code}>
                          {template.name} ({template.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>变量（JSON格式）</Label>
                  <Textarea
                    value={sendForm.variables}
                    onChange={(e) => setSendForm({ ...sendForm, variables: e.target.value })}
                    placeholder='{"code": "123456", "name": "张三"}'
                  />
                </div>
                <Button onClick={handleSendSms}>
                  <Send className="mr-2 h-4 w-4" />
                  发送短信
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 发送记录 */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>发送记录</CardTitle>
              <CardDescription>查看短信发送历史记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>手机号</TableHead>
                    <TableHead>模板</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发送时间</TableHead>
                    <TableHead>错误信息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.phoneNumber}</TableCell>
                      <TableCell>{log.template?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success' ? 'default' :
                            log.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {log.status === 'success' ? '成功' :
                           log.status === 'failed' ? '失败' :
                           log.status === 'sending' ? '发送中' : '待发送'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(log.sentAt || log.createdAt).toLocaleString('zh-CN')}</TableCell>
                      <TableCell className="text-red-500">{log.error || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 统计报表 */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>统计报表</CardTitle>
              <CardDescription>查看短信发送统计数据</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">发送趋势（最近30天）</h3>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">图表展示区域（可集成recharts等图表库）</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">详细统计</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>周期</TableHead>
                          <TableHead>总发送量</TableHead>
                          <TableHead>成功</TableHead>
                          <TableHead>失败</TableHead>
                          <TableHead>成功率</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.stats?.slice(0, 10).map((stat: any) => (
                          <TableRow key={stat.id}>
                            <TableCell>{stat.periodValue}</TableCell>
                            <TableCell>{stat.totalCount}</TableCell>
                            <TableCell className="text-green-600">{stat.successCount}</TableCell>
                            <TableCell className="text-red-600">{stat.failedCount}</TableCell>
                            <TableCell>{stat.successRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
