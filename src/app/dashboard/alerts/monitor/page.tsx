'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

interface AlertData {
  id: string;
  ruleId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  taskId?: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  createdAt: string;
}

interface AlertRule {
  id: string;
  type: string;
  condition: any;
  enabled: boolean;
  notificationChannels: string[];
  recipients: string[];
}

export default function AlertMonitor() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取活跃告警
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('获取告警失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取告警规则
  const fetchRules = async () => {
    try {
      const response = await fetch('/api/alerts/rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.data);
      }
    } catch (error) {
      console.error('获取告警规则失败:', error);
    }
  };

  // 确认告警
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, userId: 'current-user-id' }),
      });
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('确认告警失败:', error);
    }
  };

  // 切换规则启用状态
  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/alerts/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled }),
      });
      const data = await response.json();
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('切换规则状态失败:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchRules();

    // 每30秒自动刷新
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    };
    return variants[severity] || 'secondary';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500',
    };
    return colors[severity] || 'text-gray-500';
  };

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, React.ReactNode> = {
      low: <CheckCircle2 className="h-4 w-4" />,
      medium: <AlertTriangle className="h-4 w-4" />,
      high: <AlertTriangle className="h-4 w-4" />,
      critical: <XCircle className="h-4 w-4" />,
    };
    return icons[severity] || <Bell className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">告警监控</h1>
          <p className="text-muted-foreground mt-1">
            实时监控系统告警，及时处理异常情况
          </p>
        </div>
        <Button onClick={fetchAlerts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 告警统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃告警</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">严重告警</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高级告警</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用规则</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.enabled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">活跃告警</TabsTrigger>
          <TabsTrigger value="rules">告警规则</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>活跃告警列表</CardTitle>
              <CardDescription>
                未确认的告警需要及时处理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>暂无活跃告警</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                      className="border-l-4"
                      style={{
                        borderLeftColor: 
                          alert.severity === 'critical' ? '#ef4444' :
                          alert.severity === 'high' ? '#f97316' :
                          alert.severity === 'medium' ? '#eab308' : '#3b82f6',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSeverityIcon(alert.severity)}
                            <Badge variant={getSeverityBadge(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="font-semibold">{alert.title}</span>
                          </div>
                          <AlertDescription className="mt-2">
                            {alert.message}
                          </AlertDescription>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>
                          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <strong>详细信息:</strong>
                              <pre className="mt-1 overflow-x-auto">
                                {JSON.stringify(alert.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          确认
                        </Button>
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle>告警规则</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加规则
            </Button>
          </div>
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{rule.type}</CardTitle>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRule(rule.id, !rule.enabled)}
                      >
                        {rule.enabled ? '禁用' : '启用'}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    通知渠道: {rule.notificationChannels.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">触发条件:</span>
                      <pre className="mt-1 text-sm bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(rule.condition, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
