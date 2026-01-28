'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Target,
  FileText,
  Calendar,
  Sparkles,
  Search,
  Archive,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'system' | 'task' | 'performance' | 'recruitment' | 'training' | 'compliance' | 'ai';
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read';
  timestamp: string;
  actions?: {
    label: string;
    href: string;
    variant?: 'default' | 'outline' | 'ghost';
  }[];
  metadata?: {
    [key: string]: any;
  };
}

// 模拟通知数据
const NOTIFICATIONS_DATA: Notification[] = [
  {
    id: '1',
    title: '绩效目标待审批',
    description: '销售团队Q4绩效目标(3个)等待您的审批',
    type: 'performance',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-01-17 14:30',
    actions: [
      { label: '去审批', href: '/performance/goal-setting', variant: 'default' },
      { label: '查看详情', href: '/performance/goals', variant: 'outline' },
    ],
    metadata: {
      count: 3,
      team: '销售团队',
      cycle: 'Q4',
    },
  },
  {
    id: '2',
    title: '面试提醒',
    description: '产品经理岗位二面 - 候选人李四,今天15:00',
    type: 'recruitment',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-01-17 10:00',
    actions: [
      { label: '查看简历', href: '/recruitment/resumes', variant: 'outline' },
      { label: '面试评估', href: '/recruitment/interviews', variant: 'default' },
    ],
    metadata: {
      position: '产品经理',
      candidate: '李四',
      round: 2,
      time: '15:00',
    },
  },
  {
    id: '3',
    title: 'AI岗位画像完成',
    description: '技术总监岗位智能画像分析已完成,您可以查看详细报告',
    type: 'ai',
    priority: 'medium',
    status: 'unread',
    timestamp: '2025-01-17 09:15',
    actions: [
      { label: '查看详情', href: '/ai-assistant/job-profile', variant: 'default' },
    ],
    metadata: {
      position: '技术总监',
      aiModel: 'Seed',
      accuracy: '95%',
    },
  },
  {
    id: '4',
    title: '劳动合同即将到期',
    description: '5名员工劳动合同将在30天内到期,请及时续签',
    type: 'compliance',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-01-16 16:45',
    actions: [
      { label: '去处理', href: '/compliance/contracts', variant: 'default' },
      { label: '查看员工列表', href: '/employees', variant: 'outline' },
    ],
    metadata: {
      count: 5,
      daysLeft: 30,
    },
  },
  {
    id: '5',
    title: '培训计划更新提醒',
    description: 'Q1新员工入职培训计划需要在1月20日前更新',
    type: 'training',
    priority: 'medium',
    status: 'unread',
    timestamp: '2025-01-16 14:20',
    actions: [
      { label: '去编辑', href: '/training', variant: 'default' },
    ],
    metadata: {
      quarter: 'Q1',
      deadline: '2025-01-20',
    },
  },
  {
    id: '6',
    title: '人效分析报告已生成',
    description: '12月人力资源效能分析报告已生成,人效比提升8%',
    type: 'system',
    priority: 'low',
    status: 'read',
    timestamp: '2025-01-15 10:00',
    actions: [
      { label: '查看报告', href: '/analytics/efficiency/dashboard', variant: 'outline' },
    ],
    metadata: {
      month: '12月',
      efficiencyGrowth: '+8%',
    },
  },
  {
    id: '7',
    title: '任务分配通知',
    description: '您被分配了2个新任务,请及时处理',
    type: 'task',
    priority: 'medium',
    status: 'read',
    timestamp: '2025-01-15 09:30',
    actions: [
      { label: '查看任务', href: '/tasks', variant: 'default' },
    ],
    metadata: {
      newTasks: 2,
    },
  },
  {
    id: '8',
    title: 'AI离职预警',
    description: '检测到3名员工存在较高离职风险,建议进行沟通关怀',
    type: 'ai',
    priority: 'high',
    status: 'read',
    timestamp: '2025-01-14 17:00',
    actions: [
      { label: '查看详情', href: '/ai-turnover-prediction', variant: 'default' },
      { label: '员工关怀', href: '/employee-care', variant: 'outline' },
    ],
    metadata: {
      riskLevel: 'high',
      employeeCount: 3,
    },
  },
  {
    id: '9',
    title: '入职流程完成',
    description: '新员工张三的入职流程已完成,欢迎加入团队',
    type: 'system',
    priority: 'low',
    status: 'read',
    timestamp: '2025-01-13 11:00',
    actions: [
      { label: '查看档案', href: '/employees', variant: 'outline' },
    ],
    metadata: {
      employeeName: '张三',
      position: '前端开发',
    },
  },
];

const NOTIFICATION_TYPE_CONFIG = {
  system: {
    label: '系统通知',
    icon: Bell,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  task: {
    label: '任务通知',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  performance: {
    label: '绩效通知',
    icon: Target,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  recruitment: {
    label: '招聘通知',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
  training: {
    label: '培训通知',
    icon: FileText,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
  },
  compliance: {
    label: '合规通知',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
  ai: {
    label: 'AI智能',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 dark:from-purple-900 dark:to-pink-900 dark:text-purple-400',
  },
};

const PRIORITY_CONFIG = {
  high: {
    label: '高',
    color: 'bg-red-500',
  },
  medium: {
    label: '中',
    color: 'bg-yellow-500',
  },
  low: {
    label: '低',
    color: 'bg-gray-500',
  },
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // 过滤通知
  const filteredNotifications = useMemo(() => {
    let notifications = NOTIFICATIONS_DATA;

    // 按标签过滤
    if (activeTab !== 'all') {
      if (activeTab === 'unread') {
        notifications = notifications.filter(n => n.status === 'unread');
      } else if (activeTab === 'read') {
        notifications = notifications.filter(n => n.status === 'read');
      }
    }

    // 按类型过滤
    if (typeFilter !== 'all') {
      notifications = notifications.filter(n => n.type === typeFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      notifications = notifications.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query)
      );
    }

    return notifications;
  }, [activeTab, searchQuery, typeFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: NOTIFICATIONS_DATA.length,
      unread: NOTIFICATIONS_DATA.filter(n => n.status === 'unread').length,
      read: NOTIFICATIONS_DATA.filter(n => n.status === 'read').length,
    };
  }, []);

  // 标记全部已读
  const markAllAsRead = () => {
    // 在实际应用中,这里会调用API
    console.log('标记全部已读');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            消息通知
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            查看和管理系统通知
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          <Check className="h-4 w-4 mr-2" />
          全部标记已读
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>全部通知</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              未读
            </CardDescription>
            <CardTitle className="text-3xl">{stats.unread}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已读</CardDescription>
            <CardTitle className="text-3xl">{stats.read}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 通知列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>通知列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索通知..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(NOTIFICATION_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="unread">未读</TabsTrigger>
              <TabsTrigger value="read">已读</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      暂无通知
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      当前筛选条件下没有通知
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type];
                    const priorityConfig = PRIORITY_CONFIG[notification.priority];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <Card
                        key={notification.id}
                        className={`hover:shadow-md transition-shadow ${
                          notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* 图标 */}
                            <div className={`p-2 rounded-lg ${typeConfig.color} shrink-0`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>

                            {/* 内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold ${
                                      notification.status === 'unread'
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    {notification.status === 'unread' && (
                                      <Badge variant="secondary" className="text-xs">
                                        新
                                      </Badge>
                                    )}
                                    <Badge className={`${priorityConfig.color} text-white text-xs`}>
                                      {priorityConfig.label}
                                    </Badge>
                                  </div>
                                  <p className={`text-sm ${
                                    notification.status === 'unread'
                                      ? 'text-gray-700 dark:text-gray-300'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {notification.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{notification.timestamp}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {typeConfig.label}
                                </Badge>
                              </div>

                              {/* 操作按钮 */}
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {notification.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant={action.variant || 'outline'}
                                      size="sm"
                                      asChild
                                    >
                                      <a href={action.href}>
                                        {action.label}
                                      </a>
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 标记操作 */}
                            <div className="flex items-center gap-1 shrink-0">
                              {notification.status === 'unread' ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="标记已读"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="标记未读"
                                >
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
