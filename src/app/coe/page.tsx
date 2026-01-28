'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  DollarSign,
  Target,
  Scale,
  Users,
  Award,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// 模拟数据
const coeData = {
  // 关键指标
  metrics: {
    departments: 12,
    totalPositions: 156,
    activeEmployees: 485,
    budgetUtilization: 78.5,
    performanceCompletion: 92.3,
    contractsExpiring: 8,
  },

  // 功能模块
  modules: [
    {
      id: 'organization',
      title: '组织架构管理',
      description: '管理企业组织结构、岗位体系、职级体系，实现组织架构的灵活配置与可视化展示',
      icon: Building2,
      color: 'from-blue-500 to-cyan-600',
      features: [
        '组织架构图可视化',
        '岗位体系管理',
        '职级体系配置',
        '编制管理',
        '组织调整审批',
      ],
      stats: {
        departments: 12,
        positions: 156,
        hierarchy: 5,
      },
      href: '/coe/organization',
    },
    {
      id: 'compensation',
      title: '薪酬福利管理',
      description: '设计与管理企业薪酬体系、福利制度、奖金激励，实现薪酬的公平性、竞争力和激励性',
      icon: DollarSign,
      color: 'from-green-500 to-teal-600',
      features: [
        '薪酬体系设计',
        '工资核算发放',
        '福利管理',
        '奖金激励',
        '社保公积金',
      ],
      stats: {
        budget: '1,250万',
        utilization: '78.5%',
        avgSalary: '15,800元',
      },
      href: '/compensation',
    },
    {
      id: 'performance',
      title: '绩效考核',
      description: '建立科学的绩效考核体系，实现目标设定、过程跟踪、结果评估、反馈改进的全流程管理',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      features: [
        'KPI目标管理',
        '绩效周期管理',
        '360度评估',
        '结果应用',
        '绩效面谈',
      ],
      stats: {
        completion: '92.3%',
        cycles: 4,
        avgScore: '86.5',
      },
      href: '/performance',
    },
    {
      id: 'compliance',
      title: '合规管理',
      description: '管理劳动合同、试用期管理、合规风险，确保人力资源管理合法合规，降低法律风险',
      icon: Scale,
      color: 'from-orange-500 to-red-600',
      features: [
        '劳动合同管理',
        '试用期管理',
        '合规检查',
        '风险预警',
        '档案管理',
      ],
      stats: {
        contracts: 485,
        expiring: 8,
        compliance: '99.2%',
      },
      href: '/compliance',
    },
  ],

  // 待办提醒
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: '8份劳动合同即将到期',
      description: '请及时跟进续签或终止手续',
      action: '立即处理',
      href: '/compliance/contracts',
    },
    {
      id: '2',
      type: 'info',
      title: 'Q1绩效评估即将开始',
      description: '请提前准备目标设定和评估方案',
      action: '查看详情',
      href: '/performance',
    },
    {
      id: '3',
      type: 'success',
      title: '年度薪酬调整方案已确认',
      description: '薪酬调整将于下月生效',
      action: '查看方案',
      href: '/compensation',
    },
  ],

  // 最新动态
  activities: [
    {
      id: '1',
      type: 'organization',
      message: '新增"人工智能研究院"部门',
      time: '今天 10:30',
    },
    {
      id: '2',
      type: 'compensation',
      message: '2024年终奖核算完成',
      time: '昨天 16:20',
    },
    {
      id: '3',
      type: 'performance',
      message: '技术部Q4绩效评估完成率95%',
      time: '昨天 14:15',
    },
  ],
};

const ALERT_CONFIG = {
  warning: { icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
  info: { icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
  success: { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
};

export default function COEPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            COE中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            人力资源专家中心 - 专业知识支持与政策制定
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <ArrowRight className="h-4 w-4 mr-2" />
          进入知识库
        </Button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>部门数量</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.departments}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>岗位数量</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.totalPositions}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>在职员工</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.activeEmployees}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>预算使用率</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.budgetUtilization}%</CardTitle>
            <Progress value={coeData.metrics.budgetUtilization} className="mt-2" />
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>绩效完成率</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.performanceCompletion}%</CardTitle>
            <Progress value={coeData.metrics.performanceCompletion} className="mt-2" />
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>即将到期合同</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
                <Scale className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{coeData.metrics.contractsExpiring}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 功能模块 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>核心功能</CardTitle>
              <CardDescription>COE提供的专业服务与支持</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coeData.modules.map((module) => {
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
                                  {key === 'budget' ? '预算' :
                                   key === 'utilization' ? '使用率' :
                                   key === 'avgSalary' ? '平均薪资' :
                                   key === 'completion' ? '完成率' :
                                   key === 'cycles' ? '周期数' :
                                   key === 'avgScore' ? '平均分' :
                                   key === 'contracts' ? '合同数' :
                                   key === 'expiring' ? '即将到期' :
                                   key === 'compliance' ? '合规率' :
                                   key === 'departments' ? '部门数' :
                                   key === 'positions' ? '岗位数' :
                                   key === 'hierarchy' ? '职级层数' : key}
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
                {coeData.alerts.map((alert) => {
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
              <CardDescription>COE中心最新操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coeData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
