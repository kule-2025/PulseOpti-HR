'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  GraduationCap,
  TrendingUp,
  Target,
  Heart,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
} from 'lucide-react';

// 模拟数据
const hrbpData = {
  // 关键指标
  metrics: {
    activeRecruitments: 25,
    interviewsScheduled: 48,
    trainingPrograms: 18,
    trainingCompletion: 87.5,
    efficiencyScore: 95.8,
    employeeSatisfaction: 88.3,
  },

  // 功能模块
  modules: [
    {
      id: 'recruitment',
      title: '招聘管理',
      description: '全流程招聘管理，从职位发布到候选人入职，实现招聘数字化转型',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-600',
      features: [
        '职位发布与管理',
        '简历智能筛选',
        '面试安排与评估',
        '人才库管理',
        '招聘数据分析',
      ],
      stats: {
        positions: 25,
        candidates: 368,
        hired: 12,
      },
      href: '/recruitment',
    },
    {
      id: 'training',
      title: '培训发展',
      description: '企业培训体系建设，打造学习型组织，提升员工能力与绩效',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-600',
      features: [
        '培训计划管理',
        '在线课程平台',
        '讲师资源管理',
        '学习效果评估',
        '职业发展规划',
      ],
      stats: {
        programs: 18,
        participants: 285,
        completion: '87.5%',
      },
      href: '/training',
    },
    {
      id: 'efficiency',
      title: '人效分析',
      description: '人力资源效能分析，通过数据驱动决策，提升组织效率与产出',
      icon: TrendingUp,
      color: 'from-green-500 to-teal-600',
      features: [
        '人效指标监控',
        '部门效率分析',
        '人才盘点',
        '离职预警',
        'AI智能分析',
      ],
      stats: {
        score: 95.8,
        analysis: 12,
        improvement: '+5.2%',
      },
      href: '/human-efficiency',
    },
    {
      id: 'business',
      title: '业务支持',
      description: '深入业务一线，提供HR业务伙伴服务，助力业务目标达成',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      features: [
        '业务目标对齐',
        '组织诊断',
        '人才盘点',
        '团队建设',
        '变革管理',
      ],
      stats: {
        departments: 8,
        projects: 15,
        satisfaction: '92.5%',
      },
      href: '/business-support',
    },
    {
      id: 'care',
      title: '员工关怀',
      description: '全方位员工关怀体系，提升员工满意度与归属感',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      features: [
        '员工健康关怀',
        '生日福利',
        '团建活动',
        '员工反馈',
        '心理咨询',
      ],
      stats: {
        activities: 24,
        satisfaction: '88.3%',
        engagement: '92.0%',
      },
      href: '/employee-care',
    },
  ],

  // 待办提醒
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: '3个面试待安排',
      description: '技术部候选人面试需要尽快安排',
      action: '立即安排',
      href: '/recruitment/interviews',
    },
    {
      id: '2',
      type: 'info',
      title: 'Q1培训计划待审核',
      description: '销售部培训计划已提交，请及时审核',
      action: '查看计划',
      href: '/training/programs',
    },
    {
      id: '3',
      type: 'success',
      title: '新人入职培训完成',
      description: '12名新员工入职培训全部完成',
      action: '查看详情',
      href: '/training/records',
    },
  ],

  // 最新动态
  activities: [
    {
      id: '1',
      type: 'recruitment',
      message: '技术部新入职3名工程师',
      time: '今天 14:30',
    },
    {
      id: '2',
      type: 'training',
      message: '《领导力发展》培训课程完成率85%',
      time: '今天 10:15',
    },
    {
      id: '3',
      type: 'efficiency',
      message: 'Q4人效分析报告已生成',
      time: '昨天 16:20',
    },
  ],
};

const ALERT_CONFIG = {
  warning: { icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
  info: { icon: Calendar, color: 'bg-blue-100 text-blue-600' },
  success: { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
};

export default function HRBPPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            HRBP中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            人力资源业务伙伴 - 深入业务一线，助力组织发展
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <ArrowRight className="h-4 w-4 mr-2" />
            业务对齐
        </Button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>招聘中岗位</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.activeRecruitments}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>待安排面试</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.interviewsScheduled}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>培训项目</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.trainingPrograms}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>培训完成率</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.trainingCompletion}%</CardTitle>
            <Progress value={hrbpData.metrics.trainingCompletion} className="mt-2" />
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>人效指数</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.efficiencyScore}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-100 text-green-600">
                +5.2%
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">较上月</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>员工满意度</CardDescription>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl">{hrbpData.metrics.employeeSatisfaction}%</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-blue-100 text-blue-600">
                Q4
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">季度</span>
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
              <CardDescription>HRBP提供的业务支持服务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hrbpData.modules.map((module) => {
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
                                  {key === 'positions' ? '岗位数' :
                                   key === 'candidates' ? '候选人' :
                                   key === 'hired' ? '已录用' :
                                   key === 'programs' ? '培训数' :
                                   key === 'participants' ? '参与人数' :
                                   key === 'completion' ? '完成率' :
                                   key === 'score' ? '人效指数' :
                                   key === 'analysis' ? '分析报告' :
                                   key === 'improvement' ? '改善幅度' :
                                   key === 'departments' ? '支持部门' :
                                   key === 'projects' ? '支持项目' :
                                   key === 'satisfaction' ? '满意度' :
                                   key === 'activities' ? '活动数量' :
                                   key === 'engagement' ? '员工敬业度' : key}
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
                {hrbpData.alerts.map((alert) => {
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
              <CardDescription>HRBP中心最新操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hrbpData.activities.map((activity) => (
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
