'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Zap,
  Plus,
} from 'lucide-react';

// 模拟数据
const dashboardData = {
  // 关键指标
  metrics: {
    totalEmployees: 485,
    newEmployeesThisMonth: 12,
    activeRecruitments: 25,
    pendingApprovals: 8,
    avgAttendance: 96.8,
    trainingCompletion: 87.5,
  },

  // 待办事项
  tasks: [
    {
      id: '1',
      title: '审批张三的晋升申请',
      type: 'approval',
      priority: 'high',
      deadline: '2025-01-18',
      status: 'pending',
    },
    {
      id: '2',
      title: '确认本月工资发放',
      type: 'task',
      priority: 'high',
      deadline: '2025-01-20',
      status: 'pending',
    },
    {
      id: '3',
      title: '完成Q1培训计划制定',
      type: 'task',
      priority: 'medium',
      deadline: '2025-01-25',
      status: 'pending',
    },
    {
      id: '4',
      title: '面试候选人李明',
      type: 'interview',
      priority: 'medium',
      deadline: '2025-01-17',
      status: 'pending',
    },
  ],

  // 最新动态
  activities: [
    {
      id: '1',
      type: 'hire',
      message: '新员工王六入职技术部',
      time: '2小时前',
    },
    {
      id: '2',
      type: 'training',
      message: '《领导力发展》培训课程完成率85%',
      time: '4小时前',
    },
    {
      id: '3',
      type: 'performance',
      message: '12月绩效考核数据已生成',
      time: '昨天',
    },
    {
      id: '4',
      type: 'compliance',
      message: '3份劳动合同即将到期',
      time: '昨天',
    },
  ],

  // 快捷入口
  shortcuts: [
    {
      icon: Users,
      label: '员工管理',
      href: '/coe/employees',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Briefcase,
      label: '招聘管理',
      href: '/recruitment',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Target,
      label: '绩效管理',
      href: '/performance',
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: DollarSign,
      label: '薪酬管理',
      href: '/compensation',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: FileText,
      label: '考勤管理',
      href: '/attendance',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: Calendar,
      label: '培训管理',
      href: '/training',
      color: 'from-pink-500 to-rose-600',
    },
  ],

  // 图表数据
  charts: {
    monthlyHires: [
      { month: '8月', value: 8 },
      { month: '9月', value: 12 },
      { month: '10月', value: 15 },
      { month: '11月', value: 10 },
      { month: '12月', value: 18 },
      { month: '1月', value: 12 },
    ],
    departmentDistribution: [
      { name: '技术部', value: 120 },
      { name: '销售部', value: 85 },
      { name: '市场部', value: 65 },
      { name: '产品部', value: 75 },
      { name: '人力资源部', value: 35 },
      { name: '财务部', value: 30 },
      { name: '行政部', value: 25 },
      { name: '运营部', value: 50 },
    ],
  },
};

const TASK_TYPE_CONFIG = {
  approval: { label: '审批', icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
  task: { label: '任务', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  interview: { label: '面试', icon: Users, color: 'bg-green-100 text-green-600' },
};

const PRIORITY_CONFIG = {
  high: { label: '高', color: 'bg-red-100 text-red-600' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-600' },
  low: { label: '低', color: 'bg-gray-100 text-gray-600' },
};

const ACTIVITY_TYPE_CONFIG = {
  hire: { label: '入职', icon: Users, color: 'bg-green-100 text-green-600' },
  training: { label: '培训', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
  performance: { label: '绩效', icon: Target, color: 'bg-purple-100 text-purple-600' },
  compliance: { label: '合规', icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
};

export default function DashboardPage() {
  const [showAllTasks, setShowAllTasks] = useState(false);

  // 显示的待办事项
  const displayTasks = showAllTasks ? dashboardData.tasks : dashboardData.tasks.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            工作台
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            欢迎回来，张经理！今天是{new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            消息通知
            <Badge className="ml-2 bg-red-600">5</Badge>
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            快速创建
          </Button>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>员工总数</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{dashboardData.metrics.totalEmployees}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-100 text-green-600">
                +{dashboardData.metrics.newEmployeesThisMonth}
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">本月新增</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>招聘中</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{dashboardData.metrics.activeRecruitments}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-blue-100 text-blue-600">进行中</Badge>
              <span className="text-gray-600 dark:text-gray-400">岗位数量</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>待审批</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{dashboardData.metrics.pendingApprovals}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-red-100 text-red-600">紧急</Badge>
              <span className="text-gray-600 dark:text-gray-400">需处理</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>出勤率</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{dashboardData.metrics.avgAttendance}%</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">↑ 2.3%</span>
              <span className="text-gray-600 dark:text-gray-400">较上月</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>培训完成率</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{dashboardData.metrics.trainingCompletion}%</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-purple-100 text-purple-600">Q4</Badge>
              <span className="text-gray-600 dark:text-gray-400">季度</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>人效指数</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">95.8</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">↑ 5.2%</span>
              <span className="text-gray-600 dark:text-gray-400">较上月</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 待办事项和最新动态 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 待办事项 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>待办事项</CardTitle>
                <Badge className="bg-red-600 text-white">
                  {dashboardData.tasks.filter(t => t.status === 'pending').length}
                </Badge>
              </div>
              <CardDescription>
                您有 {dashboardData.tasks.filter(t => t.status === 'pending').length} 项待处理任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayTasks.map((task) => {
                  const typeConfig = TASK_TYPE_CONFIG[task.type as keyof typeof TASK_TYPE_CONFIG];
                  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center shrink-0`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              <Badge variant="outline" className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{task.deadline}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {typeConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            处理
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {dashboardData.tasks.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={() => setShowAllTasks(!showAllTasks)}>
                    {showAllTasks ? '收起' : '查看全部'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最新动态 */}
          <Card>
            <CardHeader>
              <CardTitle>最新动态</CardTitle>
              <CardDescription>实时了解企业运营状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.activities.map((activity) => {
                  const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type as keyof typeof ACTIVITY_TYPE_CONFIG];
                  const ActivityIcon = typeConfig.icon;

                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center shrink-0`}>
                        <ActivityIcon className="h-5 w-5" />
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
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧 - 快捷入口和图表 */}
        <div className="space-y-6">
          {/* 快捷入口 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷入口</CardTitle>
              <CardDescription>常用功能快速访问</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData.shortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;

                  return (
                    <Button
                      key={shortcut.label}
                      variant="outline"
                      className={`h-auto flex-col py-6 gap-2 bg-gradient-to-br ${shortcut.color} text-white border-0 hover:opacity-90`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{shortcut.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 入职趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>入职趋势</CardTitle>
              <CardDescription>近6个月新增员工数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.charts.monthlyHires.map((item) => (
                  <div key={item.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.month}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <Progress value={(item.value / 20) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 部门分布 */}
          <Card>
            <CardHeader>
              <CardTitle>部门分布</CardTitle>
              <CardDescription>各部门员工数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.charts.departmentDistribution.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <Progress value={(item.value / 120) * 100} className="h-2" />
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
