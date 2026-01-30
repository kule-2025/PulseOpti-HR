'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserGuide, useShouldShowGuide } from '@/components/layout/user-guide';
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
  Crown,
  BarChart3,
  Settings,
  ChevronRight,
  Home,
  Sparkles,
  Gift,
  Shield,
  Download,
  Flame,
} from 'lucide-react';

// 模拟数据 - 基于企业真实用户场景优化
const dashboardData = {
  // 关键指标 - 增强人效分析和合规风险
  metrics: {
    totalEmployees: 485,
    newEmployeesThisMonth: 12,
    activeRecruitments: 25,
    pendingApprovals: 8,
    avgAttendance: 96.8,
    trainingCompletion: 87.5,
    // 新增：人效相关指标
    efficiencyScore: 92.5,
    turnoverRate: 8.3,
    avgRevenuePerEmployee: 850000,
    // 新增：合规风险
    complianceRisk: 3,
    contractsExpiring: 5,
  },

  // 待办事项 - 优化优先级和类型
  tasks: [
    {
      id: '1',
      title: '审批张三的晋升申请',
      type: 'approval',
      priority: 'high',
      deadline: '2025-01-18',
      status: 'pending',
      department: '技术部',
      urgent: true,
    },
    {
      id: '2',
      title: '确认本月工资发放',
      type: 'task',
      priority: 'high',
      deadline: '2025-01-20',
      status: 'pending',
      department: '人力资源部',
      urgent: true,
    },
    {
      id: '3',
      title: '完成Q1培训计划制定',
      type: 'task',
      priority: 'medium',
      deadline: '2025-01-25',
      status: 'pending',
      department: '人力资源部',
      urgent: false,
    },
    {
      id: '4',
      title: '面试候选人李明',
      type: 'interview',
      priority: 'medium',
      deadline: '2025-01-17',
      status: 'pending',
      department: '技术部',
      urgent: false,
    },
    {
      id: '5',
      title: '处理劳动合同到期提醒',
      type: 'compliance',
      priority: 'high',
      deadline: '2025-01-16',
      status: 'pending',
      department: '人力资源部',
      urgent: true,
    },
  ],

  // 最新动态 - 优化内容
  activities: [
    {
      id: '1',
      type: 'hire',
      message: '新员工王六入职技术部，入职完成率100%',
      time: '2小时前',
      department: '技术部',
    },
    {
      id: '2',
      type: 'training',
      message: '《领导力发展》培训课程完成率85%，预计提升团队效率20%',
      time: '4小时前',
      department: '培训部',
    },
    {
      id: '3',
      type: 'performance',
      message: '12月绩效考核数据已生成，人均绩效评分4.2/5.0',
      time: '昨天',
      department: '人力资源部',
    },
    {
      id: '4',
      type: 'compliance',
      message: '3份劳动合同即将到期，系统已自动发送提醒',
      time: '昨天',
      department: '人力资源部',
    },
    {
      id: '5',
      type: 'turnover',
      message: '本月流失预警：销售部有2名员工存在离职风险',
      time: '2天前',
      department: '销售部',
    },
  ],

  // 合规风险预警 - 新增
  complianceRisks: [
    {
      id: '1',
      type: 'contract',
      severity: 'high',
      message: '5份劳动合同将在30天内到期',
      impact: '用工风险',
      action: '立即处理',
    },
    {
      id: '2',
      type: 'probation',
      severity: 'medium',
      message: '3名员工试用期即将结束',
      impact: '转正评估',
      action: '及时评估',
    },
    {
      id: '3',
      type: 'overtime',
      severity: 'medium',
      message: '本月有15人加班时长超过36小时',
      impact: '合规风险',
      action: '关注调整',
    },
  ],

  // 人效数据 - 新增
  efficiencyData: {
    trend: [
      { month: '8月', value: 85 },
      { month: '9月', value: 88 },
      { month: '10月', value: 90 },
      { month: '11月', value: 91 },
      { month: '12月', value: 92 },
      { month: '1月', value: 92.5 },
    ],
    topDepartments: [
      { name: '销售部', score: 95, revenue: 12500000 },
      { name: '技术部', score: 93, revenue: 8500000 },
      { name: '产品部', score: 91, revenue: 6200000 },
    ],
    warnings: [
      { department: '市场部', issue: '人均产出下降5%', trend: 'down' },
      { department: '行政部', issue: '人员利用率低于70%', trend: 'stable' },
    ],
  },

  // 快捷入口
  shortcuts: [
    {
      icon: Users,
      label: '员工管理',
      href: '/dashboard/employees',
      color: 'from-blue-500 to-cyan-600',
      description: '员工档案管理',
    },
    {
      icon: Briefcase,
      label: '招聘管理',
      href: '/recruitment',
      color: 'from-purple-500 to-pink-600',
      description: '岗位发布面试',
    },
    {
      icon: Target,
      label: '绩效管理',
      href: '/performance',
      color: 'from-green-500 to-teal-600',
      description: '目标设定评估',
    },
    {
      icon: DollarSign,
      label: '薪酬管理',
      href: '/compensation',
      color: 'from-orange-500 to-red-600',
      description: '薪资核算发放',
    },
    {
      icon: FileText,
      label: '考勤管理',
      href: '/attendance',
      color: 'from-indigo-500 to-blue-600',
      description: '打卡排班审批',
    },
    {
      icon: Calendar,
      label: '培训管理',
      href: '/training',
      color: 'from-pink-500 to-rose-600',
      description: '培训课程记录',
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

  // PRO功能推广
  proFeatures: [
    {
      title: '数据大屏',
      description: '实时数据可视化，关键指标一目了然',
      icon: BarChart3,
      color: 'from-red-500 to-pink-600',
      href: '/admin/data-dashboard',
      badge: 'PRO',
    },
    {
      title: '自定义报表',
      description: '拖拽式报表设计，创建专属数据分析',
      icon: FileText,
      color: 'from-orange-500 to-red-600',
      href: '/admin/custom-reports',
      badge: 'PRO',
    },
    {
      title: 'AI智能招聘',
      description: 'AI面试、简历解析、智能匹配',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      href: '/recruitment/ai-interview',
      badge: 'AI',
    },
  ],
};

const TASK_TYPE_CONFIG = {
  approval: { label: '审批', icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
  task: { label: '任务', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  interview: { label: '面试', icon: Users, color: 'bg-green-100 text-green-600' },
  compliance: { label: '合规', icon: Shield, color: 'bg-orange-100 text-orange-600' },
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
  turnover: { label: '流失预警', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
};

const COMPLIANCE_RISK_CONFIG = {
  high: { label: '高风险', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  medium: { label: '中风险', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
  low: { label: '低风险', color: 'bg-green-100 text-green-600', icon: CheckCircle },
};

export default function DashboardPageOptimized() {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showProBanner, setShowProBanner] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [showGuide, setShowGuide] = useState(useShouldShowGuide());

  // 显示的待办事项
  const displayTasks = showAllTasks ? dashboardData.tasks : dashboardData.tasks.slice(0, 3);

  // 3秒后自动隐藏PRO推广横幅
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProBanner(false);
    }, 30000); // 30秒后隐藏

    return () => clearTimeout(timer);
  }, []);

  // 设置当前日期（客户端）
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>首页</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900 dark:text-white">工作台</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            工作台
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            欢迎回来，张经理！今天是{currentDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            消息通知
            <Badge className="ml-2 bg-red-600">5</Badge>
          </Button>
          <Link href="/dashboard/quick-actions">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              快速创建
            </Button>
          </Link>
        </div>
      </div>

      {/* PRO功能推广横幅 */}
      {showProBanner && (
        <Alert className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800">
          <Crown className="h-4 w-4 text-red-600" />
          <AlertTitle className="flex items-center gap-2">
            <span>升级PRO，解锁企业级功能</span>
            <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white">限时优惠</Badge>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">立即升级，享受数据大屏、自定义报表、AI智能招聘等高级功能，提升管理效率50%+</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowProBanner(false)}>
                  关闭
                </Button>
                <Link href="/premium">
                  <Button size="sm" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                    立即升级
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 关键指标 - 增强版，添加人效和合规指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/employees'}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/recruitment'}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/tasks'}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/attendance'}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/training'}>
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200 dark:border-red-800" onClick={() => window.location.href = '/admin/data-dashboard'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>数据大屏</CardDescription>
              <div className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-red-600" />
                <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs">PRO</Badge>
              </div>
            </div>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-red-600" />
              实时
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Flame className="h-3.5 w-3.5 text-red-600" />
              <span className="text-red-600 font-medium">30秒自动刷新</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 第二行：人效分析和合规预警 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 人效分析 */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  人效分析
                </CardTitle>
                <CardDescription className="mt-1">
                  企业人力资源效率实时监控
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-600">
                {dashboardData.metrics.efficiencyScore}分
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 人效趋势 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">人效趋势</span>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +7.5%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {dashboardData.efficiencyData.trend.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all hover:from-green-700 hover:to-green-500"
                        style={{ height: `${(item.value / 100) * 100}%` }}
                      />
                      <span className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 人均产出 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">人均年产值</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ¥{(dashboardData.metrics.avgRevenuePerEmployee / 10000).toFixed(0)}万
                  </span>
                </div>
              </div>

              {/* 流失率 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">员工流失率</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.metrics.turnoverRate}%
                  </span>
                </div>
                <Progress value={dashboardData.metrics.turnoverRate} className="mt-2 h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>行业平均：12%</span>
                  <span className="text-green-600">优于行业</span>
                </div>
              </div>

              {/* 优秀部门 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">优秀部门</span>
                <div className="mt-2 space-y-2">
                  {dashboardData.efficiencyData.topDepartments.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {dept.score}分
                        </Badge>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          ¥{(dept.revenue / 10000).toFixed(0)}万
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 合规风险预警 */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  合规风险预警
                </CardTitle>
                <CardDescription className="mt-1">
                  实时监控用工风险，确保合规经营
                </CardDescription>
              </div>
              <Badge className="bg-orange-100 text-orange-600">
                {dashboardData.metrics.complianceRisk}项
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.complianceRisks.map((risk) => {
                const config = COMPLIANCE_RISK_CONFIG[risk.severity as keyof typeof COMPLIANCE_RISK_CONFIG];
                const RiskIcon = config.icon;

                return (
                  <Card key={risk.id} className={`border-${risk.severity === 'high' ? 'red' : risk.severity === 'medium' ? 'yellow' : 'green'}-200 dark:border-${risk.severity === 'high' ? 'red' : risk.severity === 'medium' ? 'yellow' : 'green'}-800`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                          <RiskIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {risk.message}
                            </h4>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              影响：{risk.impact}
                            </span>
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              {risk.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* 人效警告 */}
              {dashboardData.efficiencyData.warnings.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">人效警告</span>
                  <div className="mt-2 space-y-2">
                    {dashboardData.efficiencyData.warnings.map((warning, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {warning.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {warning.issue}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {warning.trend === 'down' ? '下降' : warning.trend === 'up' ? '上升' : '稳定'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/compliance">
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    查看完整合规报告
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
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
                    <Card key={task.id} className={`hover:shadow-md transition-shadow cursor-pointer ${task.urgent ? 'border-red-200 dark:border-red-800' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center shrink-0`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h4>
                              {task.urgent && (
                                <Badge className="bg-red-600 text-white text-xs">紧急</Badge>
                              )}
                              <Badge variant="outline" className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{task.deadline}</span>
                              </div>
                              {'department' in task && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span>{task.department}</span>
                                </div>
                              )}
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
                  <Link href="/dashboard/tasks">
                    <Button variant="ghost">
                      查看全部 {dashboardData.tasks.length} 项任务
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRO功能推荐 */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-red-600" />
                    PRO功能推荐
                  </CardTitle>
                  <CardDescription>提升企业人效，助力业绩倍增</CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white">热门</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData.proFeatures.map((feature) => {
                  const FeatureIcon = feature.icon;

                  return (
                    <Link key={feature.title} href={feature.href}>
                      <Card className="hover:shadow-lg transition-all hover:border-red-400 dark:hover:border-red-600 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                              <FeatureIcon className="h-5 w-5" />
                            </div>
                            <Badge variant="outline" className={feature.badge === 'PRO' ? 'bg-red-100 text-red-600 border-red-300' : 'bg-purple-100 text-purple-600 border-purple-300'}>
                              {feature.badge}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Link href="/premium">
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                    查看全部PRO功能
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
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
                    <Link key={shortcut.label} href={shortcut.href}>
                      <Button
                        variant="outline"
                        className={`h-auto flex-col py-6 gap-2 bg-gradient-to-br ${shortcut.color} text-white border-0 hover:opacity-90 w-full`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{shortcut.label}</span>
                      </Button>
                    </Link>
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

          {/* 快速返回首页 */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <Link href="/dashboard" className="block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">返回首页</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">快速回到工作台</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 用户引导 */}
      <UserGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onComplete={() => setShowGuide(false)}
      />
    </div>
  );
}
