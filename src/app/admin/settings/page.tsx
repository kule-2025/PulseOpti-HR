'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Settings,
  Mail,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpSecure: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enableAiFeatures: boolean;
  enableAuditLogs: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'PulseOpti HR 脉策聚效',
    siteUrl: 'https://pulseopti-hr.vercel.app',
    adminEmail: 'admin@pulseopti.com',
    supportEmail: 'PulseOptiHR@163.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpSecure: true,
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enableAiFeatures: true,
    enableAuditLogs: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    maintenanceMode: false,
  });

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('保存设置失败');
      }

      toast.success('系统设置已保存');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      toast.info('正在发送测试邮件...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: settings.adminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('发送测试邮件失败');
      }

      toast.success('测试邮件已发送');
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('发送测试邮件失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
                <p className="text-sm text-gray-600 mt-1">全局配置与功能开关</p>
              </div>
            </div>
            <Button
              onClick={fetchSettings}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-4xl space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                基本设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">系统名称</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">系统网址</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">管理员邮箱</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">支持邮箱</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                邮件配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP主机</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP端口</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="smtpUser">SMTP用户名</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="smtpSecure">启用SSL/TLS</Label>
                  <p className="text-sm text-gray-600">使用安全的SMTP连接</p>
                </div>
                <Switch
                  id="smtpSecure"
                  checked={settings.smtpSecure}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smtpSecure: checked }))}
                />
              </div>

              <Button onClick={handleTestEmail} variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                发送测试邮件
              </Button>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                功能开关
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="enableEmailNotifications">邮件通知</Label>
                  <p className="text-sm text-gray-600">启用系统邮件通知</p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="enableSmsNotifications">短信通知</Label>
                  <p className="text-sm text-gray-600">启用系统短信通知</p>
                </div>
                <Switch
                  id="enableSmsNotifications"
                  checked={settings.enableSmsNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSmsNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="enableAiFeatures">AI功能</Label>
                  <p className="text-sm text-gray-600">启用AI预测分析和智能推荐</p>
                </div>
                <Switch
                  id="enableAiFeatures"
                  checked={settings.enableAiFeatures}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAiFeatures: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="enableAuditLogs">审计日志</Label>
                  <p className="text-sm text-gray-600">记录所有管理员操作</p>
                </div>
                <Switch
                  id="enableAuditLogs"
                  checked={settings.enableAuditLogs}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAuditLogs: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                安全设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">最大登录尝试次数</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">会话超时时间（分钟）</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <Label htmlFor="maintenanceMode" className="text-yellow-800">维护模式</Label>
                  <p className="text-sm text-yellow-700">启用后普通用户无法访问系统</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
