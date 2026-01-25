'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Download,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  DollarSign,
  Bell,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface LeaveApplication {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
}

interface Payslip {
  id: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  status: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmployeePortalContent() {
  const [activeTab, setActiveTab] = useLocalStorage('portal-tab', 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: leaveApplications = [],
    loading: leaveLoading,
    error: leaveError,
    execute: fetchLeaves,
  } = useAsync<LeaveApplication[]>();

  const {
    data: payslips = [],
    loading: payslipLoading,
    error: payslipError,
    execute: fetchPayslips,
  } = useAsync<Payslip[]>();

  const {
    data: notifications = [],
    loading: notificationLoading,
    error: notificationError,
    execute: fetchNotifications,
  } = useAsync<Notification[]>();

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadLeaves = useCallback(async (): Promise<LeaveApplication[]> => {
    try {
      const cacheKey = 'employee-leaves';
      return await fetchWithCache<LeaveApplication[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: LeaveApplication[] }>(
          '/api/employee-portal/leaves'
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000);
    } catch (err) {
      console.error('加载请假记录失败:', err);
      monitor.trackError('loadEmployeeLeaves', err as Error);
      throw err;
    }
  }, []);

  const loadPayslips = useCallback(async (): Promise<Payslip[]> => {
    try {
      const cacheKey = 'employee-payslips';
      return await fetchWithCache<Payslip[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: Payslip[] }>(
          '/api/employee-portal/payslips'
        );

        return (response.data as any) || [];
      }, 10 * 60 * 1000);
    } catch (err) {
      console.error('加载工资条失败:', err);
      monitor.trackError('loadEmployeePayslips', err as Error);
      throw err;
    }
  }, []);

  const loadNotifications = useCallback(async (): Promise<Notification[]> => {
    try {
      const cacheKey = 'employee-notifications';
      return await fetchWithCache<Notification[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: Notification[] }>(
          '/api/employee-portal/notifications'
        );

        return (response.data as any) || [];
      }, 2 * 60 * 1000);
    } catch (err) {
      console.error('加载通知失败:', err);
      monitor.trackError('loadEmployeeNotifications', err as Error);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLeaves(loadLeaves);
    fetchPayslips(loadPayslips);
    fetchNotifications(loadNotifications);
  }, [fetchLeaves, fetchPayslips, fetchNotifications, loadLeaves, loadPayslips, loadNotifications]);

  const handleSubmitLeave = useCallback(async () => {
    try {
      await post('/api/employee-portal/leaves', leaveForm);
      setLeaveDialogOpen(false);
      setLeaveForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves(loadLeaves);
    } catch (err) {
      console.error('提交请假申请失败:', err);
    }
  }, [leaveForm, fetchLeaves, loadLeaves]);

  const getLeaveStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      pending: { text: '待审批', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      approved: { text: '已通过', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      rejected: { text: '已拒绝', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      cancelled: { text: '已撤销', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  const error = leaveError || payslipError || notificationError;

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => {
              fetchLeaves(loadLeaves);
              fetchPayslips(loadPayslips);
              fetchNotifications(loadNotifications);
            }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">员工门户</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            员工自助服务门户
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="leaves">请假管理</TabsTrigger>
          <TabsTrigger value="payslips">工资条</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待请假审批</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {leaveApplications.filter((item: any) => l => l.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">未读通知</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {notifications.filter((item: any) => n => !n.isRead).length}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">年度请假余额</p>
                    <p className="text-2xl font-bold text-green-600">12天</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">本月薪资</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ¥{payslips[0]?.netSalary?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>最新通知</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无通知</div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.isRead
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : 'bg-white dark:bg-gray-900 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">{notification.createdAt}</div>
                        </div>
                        {!notification.isRead && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            未读
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">请假管理</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">查看和管理您的请假申请</p>
            </div>
            <Button onClick={() => setLeaveDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新建请假
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>请假记录</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : leaveApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无请假记录</div>
              ) : (
                <div className="space-y-3">
                  {leaveApplications.map((leave) => (
                    <Card key={leave.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{leave.type}</span>
                              <span className="text-sm text-gray-600">· {leave.days}天</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {leave.startDate} 至 {leave.endDate}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {leave.reason || '无备注'}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getLeaveStatusBadge(leave.status)}
                            <div className="text-xs text-gray-500">
                              {leave.appliedAt}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>工资条</CardTitle>
            </CardHeader>
            <CardContent>
              {payslipLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : payslips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无工资条记录</div>
              ) : (
                <div className="space-y-3">
                  {payslips.map((payslip) => (
                    <Card key={payslip.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {payslip.year}年{payslip.month}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              应发: ¥{payslip.grossSalary?.toLocaleString() || '0'} ·
                              扣除: ¥{payslip.deductions?.toLocaleString() || '0'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ¥{payslip.netSalary?.toLocaleString() || '0'}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                查看
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无通知</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={notification.isRead ? 'bg-gray-50 dark:bg-gray-800' : ''}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{notification.title}</span>
                              {!notification.isRead && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                  未读
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {notification.createdAt}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建请假</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>请假类型</Label>
              <Select
                value={leaveForm.type}
                onValueChange={(value) => setLeaveForm({ ...leaveForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">年假</SelectItem>
                  <SelectItem value="sick">病假</SelectItem>
                  <SelectItem value="personal">事假</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>开始日期</Label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>结束日期</Label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>请假原因</Label>
              <Textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                placeholder="请输入请假原因"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmitLeave}>提交</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
