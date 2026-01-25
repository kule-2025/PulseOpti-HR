'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConditionBuilder, AlertCondition } from '@/components/condition-builder';
import {
  Plus,
  Edit,
  Trash2,
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  companyId: string;
  category: 'employee' | 'recruiting' | 'performance' | 'compensation' | 'attendance' | 'system';
  conditions: AlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: ('email' | 'sms' | 'system')[];
  recipients: string[];
  cooldownMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export default function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'employee' as AlertRule['category'],
    conditions: [] as AlertCondition[],
    severity: 'medium' as AlertRule['severity'],
    enabled: true,
    notificationChannels: ['email'] as AlertRule['notificationChannels'],
    recipients: '',
    cooldownMinutes: 60,
  });

  // 获取告警规则列表
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts/rules?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setRules(data.data || []);
      }
    } catch (error) {
      console.error('获取告警规则失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建告警规则
  const createRule = async () => {
    try {
      const response = await fetch('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: 'demo-company',
          recipients: formData.recipients.split('\n').filter(r => r.trim()),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('创建告警规则失败:', error);
    }
  };

  // 更新告警规则
  const updateRule = async () => {
    if (!editingRule) return;

    try {
      const response = await fetch(`/api/alerts/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients.split('\n').filter(r => r.trim()),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('更新告警规则失败:', error);
    }
  };

  // 删除告警规则
  const deleteRule = async (id: string) => {
    if (!confirm('确定要删除这个告警规则吗？')) return;

    try {
      const response = await fetch(`/api/alerts/rules/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('删除告警规则失败:', error);
    }
  };

  // 切换规则启用状态
  const toggleRule = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/alerts/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json();
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('切换告警规则失败:', error);
    }
  };

  // 获取类别标签
  const getCategoryLabel = (category: AlertRule['category']): string => {
    const labels: Record<string, string> = {
      employee: '员工管理',
      recruiting: '招聘管理',
      performance: '绩效管理',
      compensation: '薪酬管理',
      attendance: '考勤管理',
      system: '系统监控',
    };
    return labels[category] || category;
  };

  // 获取严重性徽章
  const getSeverityBadge = (severity: AlertRule['severity']) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    };
    const labels: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
    };
    const icons: Record<string, any> = {
      low: Bell,
      medium: AlertTriangle,
      high: AlertTriangle,
      critical: AlertTriangle,
    };
    const Icon = icons[severity];

    return (
      <Badge variant={variants[severity]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[severity]}
      </Badge>
    );
  };

  // 获取通知渠道徽章
  const getNotificationChannelBadge = (channel: AlertRule['notificationChannels'][0]) => {
    const variants: Record<string, any> = {
      email: 'default',
      sms: 'secondary',
      system: 'outline',
    };
    const labels: Record<string, string> = {
      email: '邮件',
      sms: '短信',
      system: '系统消息',
    };
    const icons: Record<string, any> = {
      email: Mail,
      sms: MessageSquare,
      system: Bell,
    };
    const Icon = icons[channel];

    return (
      <Badge variant={variants[channel]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[channel]}
      </Badge>
    );
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'employee',
      conditions: [],
      severity: 'medium',
      enabled: true,
      notificationChannels: ['email'],
      recipients: '',
      cooldownMinutes: 60,
    });
    setEditingRule(null);
  };

  // 打开编辑对话框
  const openEditDialog = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      conditions: rule.conditions || [],
      severity: rule.severity,
      enabled: rule.enabled,
      notificationChannels: rule.notificationChannels,
      recipients: rule.recipients.join('\n'),
      cooldownMinutes: rule.cooldownMinutes,
    });
    setDialogOpen(true);
  };

  // 切换通知渠道
  const toggleNotificationChannel = (channel: 'email' | 'sms' | 'system') => {
    const currentChannels = formData.notificationChannels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    setFormData({ ...formData, notificationChannels: newChannels });
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">告警规则</h1>
          <p className="text-muted-foreground mt-1">
            配置和管理系统告警规则
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建规则
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? '编辑规则' : '创建规则'}</DialogTitle>
              <DialogDescription>
                {editingRule ? '编辑告警规则配置' : '创建新的告警规则'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">规则名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：员工离职率告警"
                />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述该告警规则的用途"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="category">类别 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: AlertRule['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">员工管理</SelectItem>
                    <SelectItem value="recruiting">招聘管理</SelectItem>
                    <SelectItem value="performance">绩效管理</SelectItem>
                    <SelectItem value="compensation">薪酬管理</SelectItem>
                    <SelectItem value="attendance">考勤管理</SelectItem>
                    <SelectItem value="system">系统监控</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>触发条件 *</Label>
                <ConditionBuilder
                  conditions={formData.conditions}
                  onChange={(conditions) => setFormData({ ...formData, conditions })}
                />
              </div>
              <div>
                <Label htmlFor="severity">严重级别 *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: AlertRule['severity']) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="critical">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>通知渠道</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.notificationChannels.includes('email') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleNotificationChannel('email')}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    邮件
                  </Button>
                  <Button
                    type="button"
                    variant={formData.notificationChannels.includes('sms') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleNotificationChannel('sms')}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    短信
                  </Button>
                  <Button
                    type="button"
                    variant={formData.notificationChannels.includes('system') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleNotificationChannel('system')}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    系统消息
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="recipients">接收人（每行一个）</Label>
                <Textarea
                  id="recipients"
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="输入接收人姓名或工号"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="cooldownMinutes">冷却时间（分钟）</Label>
                <Input
                  id="cooldownMinutes"
                  type="number"
                  value={formData.cooldownMinutes}
                  onChange={(e) => setFormData({ ...formData, cooldownMinutes: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
                <Label htmlFor="enabled">启用规则</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingRule ? updateRule : createRule}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {editingRule ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 告警规则列表 */}
      <Card>
        <CardHeader>
          <CardTitle>规则列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>规则名称</TableHead>
                <TableHead>类别</TableHead>
                <TableHead>触发条件</TableHead>
                <TableHead>严重级别</TableHead>
                <TableHead>通知渠道</TableHead>
                <TableHead>冷却时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无告警规则
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(rule.category)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.conditions && rule.conditions.length > 0
                        ? `${rule.conditions.length} 个条件`
                        : '未设置'}
                    </TableCell>
                    <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {rule.notificationChannels.map((channel) => (
                          <span key={channel}>{getNotificationChannelBadge(channel)}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{rule.cooldownMinutes}分钟</TableCell>
                    <TableCell>
                      {rule.enabled ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          启用
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          禁用
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleRule(rule.id, !rule.enabled)}
                        >
                          {rule.enabled ? <XCircle className="h-4 w-4 text-gray-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
