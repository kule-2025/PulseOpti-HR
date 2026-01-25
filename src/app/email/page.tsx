/**
 * 邮件服务管理页面
 * 路径: /email
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
import { Plus, Send, Trash2, Edit, TestTube, TrendingUp, Activity, Mail, Settings, FileText, BarChart3 } from 'lucide-react';

interface SmtpConfig {
  id: string;
  name: string;
  provider: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromAddress: string;
  isDefault: boolean;
  isActive: boolean;
  dailyLimit: number;
  hourlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  subject: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  id: string;
  toAddress: string;
  toName: string;
  subject: string;
  status: string;
  messageId: string;
  error: string;
  sentAt: string;
  openedAt: string;
  clickedAt: string;
  createdAt: string;
  templateName: string;
  templateCode: string;
  configName: string;
  configProvider: string;
}

interface EmailStatistics {
  id: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export default function EmailManagementPage() {
  const [activeTab, setActiveTab] = useState('configs');
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 配置表单
  const [configForm, setConfigForm] = useState({
    name: '',
    provider: 'smtp',
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromName: '',
    fromAddress: '',
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
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: '',
    description: '',
    isActive: true,
  });

  // 发送表单
  const [sendForm, setSendForm] = useState({
    toAddress: '',
    toName: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    templateId: '',
    configId: '',
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
      const res = await fetch('/api/email/configs');
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
      const res = await fetch('/api/email/templates');
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
      const res = await fetch('/api/email/logs');
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
      const res = await fetch('/api/email/statistics');
      const data = await res.json();
      if (data.success) {
        setStats(data.overall);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      toast.error('加载统计数据失败');
    }
  };

  // 创建配置
  const handleCreateConfig = async () => {
    try {
      const res = await fetch('/api/email/configs', {
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
          provider: 'smtp',
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '',
          fromName: '',
          fromAddress: '',
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

      const res = await fetch('/api/email/templates', {
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
          subject: '',
          htmlContent: '',
          textContent: '',
          variables: '',
          description: '',
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

  // 发送邮件
  const handleSendEmail = async () => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('邮件发送成功');
        loadLogs();
        loadStats();
        setSendForm({
          toAddress: '',
          toName: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          templateId: '',
          configId: '',
        });
      } else {
        toast.error(data.error || '发送邮件失败');
      }
    } catch (error) {
      console.error('发送邮件失败:', error);
      toast.error('发送邮件失败');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">邮件服务管理</h1>
        <p className="text-muted-foreground">管理SMTP配置、邮件模板、发送记录和统计数据</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总发送数</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                成功率: {stats.successRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功发送</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successCount}</div>
              <p className="text-xs text-muted-foreground">
                打开率: {stats.openRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">失败/退回</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedCount + stats.bouncedCount}</div>
              <p className="text-xs text-muted-foreground">
                退回率: {stats.bounceRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">点击数</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.clickedCount}</div>
              <p className="text-xs text-muted-foreground">
                点击率: {stats.clickRate}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configs">
            <Settings className="h-4 w-4 mr-2" />
            SMTP配置
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            邮件模板
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Mail className="h-4 w-4 mr-2" />
            发送记录
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            发送邮件
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>SMTP配置</CardTitle>
                  <CardDescription>配置邮件发送服务器</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      新建配置
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>新建SMTP配置</DialogTitle>
                      <DialogDescription>
                        配置SMTP服务器以发送邮件
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">配置名称</Label>
                        <Input
                          id="name"
                          value={configForm.name}
                          onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                          placeholder="例如：163邮箱"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="provider">服务商</Label>
                        <Select
                          value={configForm.provider}
                          onValueChange={(value) => setConfigForm({ ...configForm, provider: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smtp">SMTP</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="aliyun">阿里云</SelectItem>
                            <SelectItem value="tencent">腾讯云</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="host">SMTP服务器</Label>
                          <Input
                            id="host"
                            value={configForm.host}
                            onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
                            placeholder="smtp.163.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="port">端口</Label>
                          <Input
                            id="port"
                            type="number"
                            value={configForm.port}
                            onChange={(e) => setConfigForm({ ...configForm, port: parseInt(e.target.value) })}
                            placeholder="587"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="username">用户名</Label>
                          <Input
                            id="username"
                            value={configForm.username}
                            onChange={(e) => setConfigForm({ ...configForm, username: e.target.value })}
                            placeholder="yourname@163.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">密码</Label>
                          <Input
                            id="password"
                            type="password"
                            value={configForm.password}
                            onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
                            placeholder="SMTP授权码"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fromName">发件人名称</Label>
                          <Input
                            id="fromName"
                            value={configForm.fromName}
                            onChange={(e) => setConfigForm({ ...configForm, fromName: e.target.value })}
                            placeholder="PulseOpti HR"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fromAddress">发件人地址</Label>
                          <Input
                            id="fromAddress"
                            type="email"
                            value={configForm.fromAddress}
                            onChange={(e) => setConfigForm({ ...configForm, fromAddress: e.target.value })}
                            placeholder="noreply@example.com"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="secure"
                          checked={configForm.secure}
                          onCheckedChange={(checked) => setConfigForm({ ...configForm, secure: checked })}
                        />
                        <Label htmlFor="secure">使用SSL/TLS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isDefault"
                          checked={configForm.isDefault}
                          onCheckedChange={(checked) => setConfigForm({ ...configForm, isDefault: checked })}
                        />
                        <Label htmlFor="isDefault">设为默认配置</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="dailyLimit">每日限制</Label>
                          <Input
                            id="dailyLimit"
                            type="number"
                            value={configForm.dailyLimit}
                            onChange={(e) => setConfigForm({ ...configForm, dailyLimit: parseInt(e.target.value) })}
                            placeholder="1000"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="hourlyLimit">每小时限制</Label>
                          <Input
                            id="hourlyLimit"
                            type="number"
                            value={configForm.hourlyLimit}
                            onChange={(e) => setConfigForm({ ...configForm, hourlyLimit: parseInt(e.target.value) })}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateConfig}>创建配置</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>服务商</TableHead>
                    <TableHead>服务器</TableHead>
                    <TableHead>发件人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="font-medium">{config.name}</div>
                        {config.isDefault && (
                          <Badge variant="secondary" className="mt-1">默认</Badge>
                        )}
                      </TableCell>
                      <TableCell>{config.provider}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {config.host}:{config.port}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {config.secure ? 'SSL/TLS' : '未加密'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {config.fromName || '未知'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {config.fromAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                          {config.isActive ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>邮件模板</CardTitle>
                  <CardDescription>管理邮件模板</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      新建模板
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>新建邮件模板</DialogTitle>
                      <DialogDescription>
                        创建自定义邮件模板
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="templateName">模板名称</Label>
                          <Input
                            id="templateName"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                            placeholder="登录验证码邮件"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="templateCode">模板代码</Label>
                          <Input
                            id="templateCode"
                            value={templateForm.code}
                            onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                            placeholder="login_verification"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">分类</Label>
                        <Select
                          value={templateForm.category}
                          onValueChange={(value) => setTemplateForm({ ...templateForm, category: value as any })}
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
                      <div className="grid gap-2">
                        <Label htmlFor="subject">邮件主题</Label>
                        <Input
                          id="subject"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                          placeholder="PulseOpti HR - 登录验证码"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="htmlContent">HTML内容</Label>
                        <Textarea
                          id="htmlContent"
                          value={templateForm.htmlContent}
                          onChange={(e) => setTemplateForm({ ...templateForm, htmlContent: e.target.value })}
                          placeholder="<h1>您的验证码是：{{code}}</h1>"
                          rows={10}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="textContent">纯文本内容（可选）</Label>
                        <Textarea
                          id="textContent"
                          value={templateForm.textContent}
                          onChange={(e) => setTemplateForm({ ...templateForm, textContent: e.target.value })}
                          placeholder="您的验证码是：{{code}}"
                          rows={5}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="variables">变量（逗号分隔）</Label>
                        <Input
                          id="variables"
                          value={templateForm.variables}
                          onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                          placeholder="code, name, company"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">描述（可选）</Label>
                        <Textarea
                          id="description"
                          value={templateForm.description}
                          onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                          placeholder="模板描述"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateTemplate}>创建模板</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>代码</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                        {template.isSystem && (
                          <Badge variant="outline" className="mt-1">系统</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{template.code}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                      <TableCell>{template.usageCount}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!template.isSystem && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>发送记录</CardTitle>
              <CardDescription>查看邮件发送历史记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>收件人</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>模板</TableHead>
                    <TableHead>配置</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发送时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">{log.toName || log.toAddress}</div>
                        <div className="text-xs text-muted-foreground">{log.toAddress}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                      <TableCell>
                        <div className="text-sm">{log.templateName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{log.templateCode || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.configName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{log.configProvider || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success' ? 'default' :
                            log.status === 'failed' ? 'destructive' :
                            log.status === 'bounced' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {log.status === 'success' ? '成功' :
                           log.status === 'failed' ? '失败' :
                           log.status === 'bounced' ? '退回' :
                           log.status === 'sending' ? '发送中' :
                           log.status}
                        </Badge>
                        {log.error && (
                          <div className="text-xs text-red-500 mt-1 truncate max-w-xs">
                            {log.error}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString('zh-CN') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>发送邮件</CardTitle>
              <CardDescription>发送单封邮件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="toAddress">收件人地址 *</Label>
                  <Input
                    id="toAddress"
                    type="email"
                    value={sendForm.toAddress}
                    onChange={(e) => setSendForm({ ...sendForm, toAddress: e.target.value })}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="toName">收件人姓名</Label>
                  <Input
                    id="toName"
                    value={sendForm.toName}
                    onChange={(e) => setSendForm({ ...sendForm, toName: e.target.value })}
                    placeholder="张三"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="templateId">使用模板（可选）</Label>
                  <Select
                    value={sendForm.templateId}
                    onValueChange={(value) => setSendForm({ ...sendForm, templateId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="configId">SMTP配置（可选）</Label>
                  <Select
                    value={sendForm.configId}
                    onValueChange={(value) => setSendForm({ ...sendForm, configId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择配置（默认使用默认配置）" />
                    </SelectTrigger>
                    <SelectContent>
                      {configs.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.name} ({config.host})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">邮件主题 *</Label>
                <Input
                  id="subject"
                  value={sendForm.subject}
                  onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                  placeholder="邮件主题"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="htmlContent">HTML内容 *</Label>
                <Textarea
                  id="htmlContent"
                  value={sendForm.htmlContent}
                  onChange={(e) => setSendForm({ ...sendForm, htmlContent: e.target.value })}
                  placeholder="<h1>您好！</h1>"
                  rows={10}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="textContent">纯文本内容（可选）</Label>
                <Textarea
                  id="textContent"
                  value={sendForm.textContent}
                  onChange={(e) => setSendForm({ ...sendForm, textContent: e.target.value })}
                  placeholder="纯文本内容"
                  rows={5}
                />
              </div>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                发送邮件
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
