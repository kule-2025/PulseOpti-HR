'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Calendar,
  DollarSign,
  UserCircle,
  MessageSquare,
  Ticket,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
} from 'lucide-react';

// 模拟数据
const sscData = {
  // 关键指标
  metrics: {
    todayAttendance: 476,
    onLeave: 12,
    pendingLeaves: 8,
    salaryProcessed: 485,
    ticketsOpen: 15,
    serviceScore: 96.5,
  },

  // 功能模块
  modules: [
    {
      id: 'attendance',
      title: '考勤管理',
      description: '智能化考勤管理系统，支持打卡、请假、加班等考勤业务',
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      features: [
        '智能打卡',
        '排班管理',
        '考勤统计',
        '异常处理',
        '考勤报表',
      ],
      stats: {
        today: 476,
        rate: '96.8%',
        pending: 5,
      },
      href: '/attendance',
    },
    {
      id: 'leave',
      title: '假期管理',
      description: '全流程假期管理，支持各类假期申请、审批、余额查询',
      icon: Calendar,
      color: 'from-green-500 to-teal-600',
      features: [
        '年假管理',
        '病假申请',
        '事假审批',
        '假期余额',
        '请假规则',
      ],
      stats: {
        approved: 145,
        pending: 8,
        avgDuration: '3.2天',
      },
      href: '/leave',
    },
    {
      id: 'salary',
      title: '薪酬发放',
      description: '薪酬核算与发放管理，确保工资准确、及时发放',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      features: [
        '工资核算',
        '个税计算',
        '社保扣缴',
        '工资条',
        '发放记录',
      ],
      stats: {
        processed: 485,
        amount: '1,250万',
        accuracy: '100%',
      },
      href: '/salary',
    },
    {
      id: 'self-service',
      title: '员工自助',
      description: '员工自助服务平台，提供个人信息、证明开具、政策查询等服务',
      icon: UserCircle,
      color: 'from-purple-500 to-pink-600',
      features: [
        '个人信息',
        '证明开具',
        '政策查询',
        '历史记录',
        '移动访问',
      ],
      stats: {
        users: 485,
        visits: '2.5万',
        satisfaction: '95.2%',
      },
      href: '/self-service',
    },
    {
      id: 'tickets',
      title: '工单处理',
      description: 'HR服务工单系统，快速响应员工咨询与需求',
      icon: Ticket,
      color: 'from-indigo-500 to-blue-600',
      features: [
        '在线咨询',
        '工单提交',
        '进度跟踪',
        '满意度评价',
        '知识库',
      ],
      stats: {
        open: 15,
        closed: 328,
        response: '2.3小时',
      },
      href: '/tickets',
    },
  ],

  // 待办提醒
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: '5条考勤异常待处理',
      description: '本月考勤异常需要人工确认',
      action: '立即处理',
      href: '/attendance/exceptions',
    },
    {
      id: '2',
      type: 'info',
      title: '8条请假申请待审批',
      description: '包括年假、病假等申请',
      action: '查看申请',
      href: '/leave/approvals',
    },
    {
      id: '3',
      type: 'success',
      title: '12月工资已全部发放',
      description: '485名员工工资发放成功',
      action: '查看明细',
      href: '/salary/records',
    },
  ],

  // 最新动态
  activities: [
    {
      id: '1',
      type: 'attendance',
      message: '今日出勤率 96.8%（476/492）',
      time: '今天 09:30',
    },
    {
      id: '2',
      type: 'leave',
      message: '批准李明的年假申请（5天）',
      time: '今天 14:20',
    },
    {
      id: '3',
      type: 'ticket',
      message: '完成工单 #2025-0189 社保咨询',
      time: '今天 11:45',
    },
  ],
};

const ALERT_CONFIG = {
  warning: { icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
  info: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  success: { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
};

export default function SSCPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SSC中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            共享服务中心 - 高效服务，贴心体验
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <MessageSquare className="h-4 w-4 mr-2" />
          在线客服
        </Button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>今日出勤</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.todayAttendance}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-100 text-green-600">
                {sscData.metrics.todayAttendance}/492
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">出勤率 96.8%</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>请假人数</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.onLeave}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>待审批</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.pendingLeaves}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>工资发放</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.salaryProcessed}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-100 text-green-600">
                12月
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">已发放</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>工单待办</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                <Ticket className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.ticketsOpen}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-orange-100 text-orange-600">
                待处理
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>服务评分</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{sscData.metrics.serviceScore}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-blue-100 text-blue-600">
                满分5.0
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 功能模块 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>核心功能</CardTitle>
              <CardDescription>SSC提供的标准化服务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sscData.modules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <Card key={module.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shrink-0`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {module.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {module.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                            {Object.entries(module.stats).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {key === 'today' ? '今日打卡' :
                                   key === 'rate' ? '出勤率' :
                                   key === 'pending' ? '待处理' :
                                   key === 'approved' ? '已批准' :
                                   key === 'avgDuration' ? '平均时长' :
                                   key === 'processed' ? '已发放' :
                                   key === 'amount' ? '发放金额' :
                                   key === 'accuracy' ? '准确率' :
                                   key === 'users' ? '使用人数' :
                                   key === 'visits' ? '访问次数' :
                                   key === 'satisfaction' ? '满意度' :
                                   key === 'open' ? '待处理' :
                                   key === 'closed' ? '已关闭' :
                                   key === 'response' ? '响应时间' : key}
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Button className="w-full mt-2" variant="outline">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            进入模块
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧 - 待办提醒和最新动态 */}
        <div className="space-y-6">
          {/* 待办提醒 */}
          <Card>
            <CardHeader>
              <CardTitle>待办提醒</CardTitle>
              <CardDescription>需要关注的重要事项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sscData.alerts.map((alert) => {
                  const config = ALERT_CONFIG[alert.type as keyof typeof ALERT_CONFIG];
                  const AlertIcon = config.icon;

                  return (
                    <Card key={alert.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                            <AlertIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {alert.description}
                            </p>
                            <Button size="sm" variant="outline" className="text-xs">
                              {alert.action}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 最新动态 */}
          <Card>
            <CardHeader>
              <CardTitle>最新动态</CardTitle>
              <CardDescription>SSC中心最新操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sscData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
