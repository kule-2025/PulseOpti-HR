'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Briefcase,
  Award,
  Target,
  Zap,
  Crown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Bell,
  ChevronRight,
  Rocket,
  Shield,
  Download,
  Building,
  Settings,
  FileText,
  Calendar,
  User,
  GraduationCap,
  Gift,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 企业关键指标 - 符合老板/决策者视角
  const businessMetrics = [
    {
      title: '人力资源ROI',
      value: '4.2',
      unit: '倍',
      change: '+0.8',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
      description: '每投入1元，产出4.2元'
    },
    {
      title: '人均创收',
      value: '28.5',
      unit: '万/年',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
      description: '员工人均年收入贡献'
    },
    {
      title: '人才留存率',
      value: '92.5',
      unit: '%',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'purple',
      description: '年度人才留存率'
    },
    {
      title: '人均培训时长',
      value: '48',
      unit: '小时/年',
      change: '+6',
      trend: 'up',
      icon: GraduationCap,
      color: 'orange',
      description: '员工年度培训总时长'
    },
  ];

  // 待办事项 - 优先级排序
  const urgentTasks = [
    { title: '审批：高级工程师Offer（张三）', type: '招聘', priority: '紧急', time: '2小时后截止' },
    { title: '签署：销售团队季度绩效考核表', type: '绩效', priority: '紧急', time: '今天' },
    { title: '面试：产品经理岗位（3位候选人）', type: '招聘', priority: '高', time: '明天10:00' },
    { title: '月度薪酬核算确认', type: '薪酬', priority: '高', time: '本周五' },
    { title: '新员工入职培训安排', type: '培训', priority: '中', time: '下周' },
  ];

  // 实时动态 - 符合真实企业场景
  const activities = [
    { type: '入职', content: '技术部新员工李四已完成入职手续', time: '10分钟前', icon: CheckCircle, color: 'green' },
    { type: '请假', content: '销售部王五提交了年假申请（5天）', time: '25分钟前', icon: Calendar, color: 'blue' },
    { type: '绩效', content: '市场部赵六完成了Q1绩效自评', time: '1小时前', icon: Target, color: 'purple' },
    { type: '预警', content: '技术部1人可能出现离职风险（需要关注）', time: '2小时前', icon: AlertTriangle, color: 'orange' },
    { type: '招聘', content: '收到5份高级工程师简历', time: '3小时前', icon: Briefcase, color: 'cyan' },
  ];

  // 三支柱快捷入口
  const quickAccess = {
    coe: [
      { name: '绩效评估', desc: '进行中 15/50 人已完成', href: '/performance/performance-assessment', icon: Target },
      { name: '薪酬核算', desc: '本月待发放 ¥1,280,000', href: '/compensation/salary-calculation', icon: DollarSign },
      { name: '培训课程', desc: '12门课程，85%员工参与', href: '/training/courses', icon: GraduationCap },
    ],
    hrbp: [
      { name: '招聘任务', desc: '5个职位，23位候选人', href: '/recruitment/jobs', icon: Briefcase },
      { name: '人才盘点', desc: '高潜人才 15 人', href: '/talent-development', icon: Award },
      { name: '员工关怀', desc: '本月关怀 12 人次', href: '/employee-care', icon: User },
    ],
    ssc: [
      { name: '待办审批', desc: '8项待处理', href: '/attendance', icon: Clock },
      { name: '考勤异常', desc: '3人需要关注', href: '/attendance', icon: AlertTriangle },
      { name: '福利发放', desc: '本月待发放 ¥85,000', href: '/benefits', icon: Gift },
    ],
  };

  // 商业变现功能 - PRO版
  const premiumFeatures = [
    {
      title: '高级权限管理',
      description: '企业级权限控制，支持角色继承和细粒度权限管理',
      icon: Shield,
      href: '/dashboard/permissions/advanced',
      badge: 'PRO',
      highlight: true,
    },
    {
      title: '数据导出功能',
      description: '支持Excel、CSV、PDF等多种格式，自定义导出字段',
      icon: Download,
      href: '/dashboard/data-export',
      badge: 'PRO',
      highlight: false,
    },
    {
      title: '企业协作集成',
      description: '无缝对接钉钉、飞书、企业微信等主流协作平台',
      icon: Building,
      href: '/dashboard/integration',
      badge: 'PRO',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎头部 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              工作台
            </h1>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">企业版</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            全方位人力资源数据洞察，助力企业业绩增长
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            查看通知 (3)
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            onClick={() => window.location.href = '/orders/subscription'}
          >
            <Crown className="h-4 w-4 mr-2" />
            升级企业版
          </Button>
        </div>
      </div>

      {/* 升级引导横幅 - 商业变现入口 */}
      <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
        <Rocket className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-semibold">升级企业版，解锁全部高级功能：</span>
            <span className="ml-2">高级权限管理、数据导出、企业协作集成等</span>
          </div>
          <Button
            variant="link"
            className="h-auto p-0 text-red-600 ml-4 font-medium"
            onClick={() => window.location.href = '/orders/subscription'}
          >
            立即升级 <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </AlertDescription>
      </Alert>

      {/* 业务关键指标 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                <metric.icon className={`h-4 w-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {metric.unit}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-xs text-gray-500">vs 上月</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：待办事项和动态 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 紧急待办 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  待办事项
                </CardTitle>
                <Badge variant="secondary">{urgentTasks.length} 项待处理</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        task.priority === '紧急'
                          ? 'bg-red-500'
                          : task.priority === '高'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{task.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 实时动态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                实时动态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`p-1.5 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/30`}
                    >
                      <activity.icon
                        className={`h-4 w-4 text-${activity.color}-600 dark:text-${activity.color}-400`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activity.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：快捷入口和PRO功能 */}
        <div className="space-y-6">
          {/* 三支柱快捷入口 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>常用功能快速访问</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* COE */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  <span className="text-xs font-semibold text-gray-600">COE 专家中心</span>
                </div>
                <div className="space-y-1">
                  {quickAccess.coe.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <item.icon className="h-4 w-4 text-purple-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* HRBP */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-semibold text-gray-600">HRBP 业务伙伴</span>
                </div>
                <div className="space-y-1">
                  {quickAccess.hrbp.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <item.icon className="h-4 w-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SSC */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span className="text-xs font-semibold text-gray-600">SSC 共享中心</span>
                </div>
                <div className="space-y-1">
                  {quickAccess.ssc.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <item.icon className="h-4 w-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PRO功能推广 - 商业变现核心 */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-red-600" />
                  企业版功能
                </CardTitle>
                <Badge className="bg-gradient-to-r from-red-600 to-pink-600">PRO</Badge>
              </div>
              <CardDescription>解锁更多高级功能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <Link key={index} href={feature.href}>
                    <div
                      className={`p-3 rounded-lg border-2 ${
                        feature.highlight
                          ? 'border-red-300 bg-white dark:bg-gray-900'
                          : 'border-red-200 bg-white/50 dark:bg-gray-900/50'
                      } hover:border-red-400 hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <feature.icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {feature.title}
                            </div>
                            {feature.badge && (
                              <Badge className="text-xs bg-red-600 text-white">
                                {feature.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {feature.description}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button
                className="w-full mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                onClick={() => window.location.href = '/orders/subscription'}
              >
                <Rocket className="h-4 w-4 mr-2" />
                立即升级企业版
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
