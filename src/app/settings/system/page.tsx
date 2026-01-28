'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Shield,
  Users,
  Globe,
  Bell,
  Mail,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  Zap,
  Crown,
} from 'lucide-react';

interface SystemConfig {
  company: {
    name: string;
    logo: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
    industry: string;
    scale: string;
  };
  permissions: {
    adminRole: string;
    canExportData: boolean;
    canUseAPI: boolean;
    canCreateReports: boolean;
    canAccessDashboard: boolean;
    maxUsers: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    notificationTypes: {
      attendance: boolean;
      performance: boolean;
      recruitment: boolean;
      training: boolean;
      compensation: boolean;
      workflow: boolean;
    };
  };
  integrations: {
    oaSystem: string;
    financeSystem: string;
    crmSystem: string;
  };
}

// 模拟系统配置
const SYSTEM_CONFIG: SystemConfig = {
  company: {
    name: '脉冲科技',
    logo: '/logo.png',
    address: '北京市朝阳区科技园区',
    contactPhone: '010-12345678',
    contactEmail: 'hr@pulsetech.com',
    industry: '互联网',
    scale: '100-500人',
  },
  permissions: {
    adminRole: 'HR_ADMIN',
    canExportData: true,
    canUseAPI: true,
    canCreateReports: true,
    canAccessDashboard: true,
    maxUsers: 500,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    notificationTypes: {
      attendance: true,
      performance: true,
      recruitment: true,
      training: true,
      compensation: true,
      workflow: true,
    },
  },
  integrations: {
    oaSystem: '钉钉',
    financeSystem: 'SAP',
    crmSystem: 'Salesforce',
  },
};

export default function SystemSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>(SYSTEM_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setConfig(SYSTEM_CONFIG);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            系统设置
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            配置系统参数、权限管理和通知设置
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 保存成功提示 */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2 text-green-800 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>设置已成功保存</span>
        </div>
      )}

      {/* 企业基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            企业基本信息
          </CardTitle>
          <CardDescription>
            配置公司基本信息和联系方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                公司名称
              </label>
              <Input
                value={config.company.name}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, name: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                行业
              </label>
              <Input
                value={config.company.industry}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, industry: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                企业规模
              </label>
              <Input
                value={config.company.scale}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, scale: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                联系电话
              </label>
              <Input
                value={config.company.contactPhone}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, contactPhone: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                联系邮箱
              </label>
              <Input
                type="email"
                value={config.company.contactEmail}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, contactEmail: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                企业地址
              </label>
              <Input
                value={config.company.address}
                onChange={(e) => setConfig({
                  ...config,
                  company: { ...config.company, address: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 权限管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            权限管理
          </CardTitle>
          <CardDescription>
            配置系统权限和功能访问
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 高级功能 */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              高级功能（PRO版专属）
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">数据导出</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">支持导出员工、绩效、考勤等数据</div>
                </div>
                <Switch
                  checked={config.permissions.canExportData}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    permissions: { ...config.permissions, canExportData: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">API接口</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">开放API接口供第三方集成</div>
                </div>
                <Switch
                  checked={config.permissions.canUseAPI}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    permissions: { ...config.permissions, canUseAPI: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">自定义报表</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">支持创建自定义数据报表</div>
                </div>
                <Switch
                  checked={config.permissions.canCreateReports}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    permissions: { ...config.permissions, canCreateReports: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">数据大屏</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">访问企业数据大屏</div>
                </div>
                <Switch
                  checked={config.permissions.canAccessDashboard}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    permissions: { ...config.permissions, canAccessDashboard: checked }
                  })}
                />
              </div>
            </div>
          </div>

          {/* 用户数量限制 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              最大用户数量
            </label>
            <Input
              type="number"
              value={config.permissions.maxUsers}
              onChange={(e) => setConfig({
                ...config,
                permissions: { ...config.permissions, maxUsers: parseInt(e.target.value) || 0 }
              })}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              当前版本最多支持 {config.permissions.maxUsers} 个用户
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            通知设置
          </CardTitle>
          <CardDescription>
            配置系统通知方式和类型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 通知渠道 */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">通知渠道</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">邮件通知</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">通过邮件发送通知</div>
                  </div>
                </div>
                <Switch
                  checked={config.notifications.emailEnabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notifications: { ...config.notifications, emailEnabled: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">短信通知</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">通过短信发送紧急通知</div>
                </div>
                <Switch
                  checked={config.notifications.smsEnabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notifications: { ...config.notifications, smsEnabled: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">推送通知</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">通过系统推送通知</div>
                </div>
                <Switch
                  checked={config.notifications.pushEnabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    notifications: { ...config.notifications, pushEnabled: checked }
                  })}
                />
              </div>
            </div>
          </div>

          {/* 通知类型 */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">通知类型</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(config.notifications.notificationTypes).map(([key, value]) => {
                const typeLabels: Record<string, string> = {
                  attendance: '考勤通知',
                  performance: '绩效通知',
                  recruitment: '招聘通知',
                  training: '培训通知',
                  compensation: '薪酬通知',
                  workflow: '工作流通知',
                };

                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {typeLabels[key]}
                    </span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        notifications: {
                          ...config.notifications,
                          notificationTypes: {
                            ...config.notifications.notificationTypes,
                            [key]: checked
                          }
                        }
                      })}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统集成 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            系统集成
          </CardTitle>
          <CardDescription>
            配置第三方系统集成
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                OA系统
              </label>
              <Input
                value={config.integrations.oaSystem}
                onChange={(e) => setConfig({
                  ...config,
                  integrations: { ...config.integrations, oaSystem: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                财务系统
              </label>
              <Input
                value={config.integrations.financeSystem}
                onChange={(e) => setConfig({
                  ...config,
                  integrations: { ...config.integrations, financeSystem: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                CRM系统
              </label>
              <Input
                value={config.integrations.crmSystem}
                onChange={(e) => setConfig({
                  ...config,
                  integrations: { ...config.integrations, crmSystem: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
