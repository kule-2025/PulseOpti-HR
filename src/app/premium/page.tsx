'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  Download,
  Code,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  Lock,
  Zap,
} from 'lucide-react';

// 模拟数据
const premiumData = {
  // 功能模块
  modules: [
    {
      id: 'data-dashboard',
      title: '数据大屏',
      description: '实时数据可视化大屏，一屏掌握企业人力资源核心指标，助力管理决策',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-600',
      badge: 'PRO',
      features: [
        '实时数据更新',
        '多维度分析',
        '自定义配置',
        '大屏展示',
        '移动端适配',
      ],
      stats: {
        metrics: 18,
        refresh: '实时',
        views: '2.5K/月',
      },
      href: '/admin/data-dashboard',
      price: '¥299/月',
    },
    {
      id: 'custom-reports',
      title: '自定义报表',
      description: '灵活的报表生成工具，支持拖拽式报表设计，满足个性化数据需求',
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      badge: 'PRO',
      features: [
        '拖拽式设计',
        '多数据源支持',
        '定时发送',
        '导出多种格式',
        '报表模板',
      ],
      stats: {
        templates: 50,
        created: 128,
        exports: '1.2K',
      },
      href: '/admin/custom-reports',
      price: '¥199/月',
    },
    {
      id: 'data-export',
      title: '数据导出',
      description: '一键导出各类HR数据，支持多种格式，方便二次分析与备份',
      icon: Download,
      color: 'from-green-500 to-teal-600',
      badge: 'PRO',
      features: [
        '批量导出',
        '定时任务',
        '增量导出',
        '数据加密',
        '日志记录',
      ],
      stats: {
        exports: 856,
        size: '2.3GB',
        formats: 5,
      },
      href: '/data-export',
      price: '¥99/月',
    },
    {
      id: 'api-platform',
      title: 'API开放平台',
      description: '开放API接口，支持系统集成与二次开发，打造生态化HR管理',
      icon: Code,
      color: 'from-orange-500 to-red-600',
      badge: 'PRO',
      features: [
        'RESTful API',
        'Webhook通知',
        'SDK支持',
        '文档齐全',
        '技术支持',
      ],
      stats: {
        apis: 45,
        calls: '50K/月',
        partners: 12,
      },
      href: '/admin/api-platform',
      price: '¥499/月',
    },
    {
      id: 'advanced-permissions',
      title: '高级权限管理',
      description: '精细化的权限控制体系，支持角色自定义、字段级权限、数据权限',
      icon: Shield,
      color: 'from-indigo-500 to-blue-600',
      badge: 'PRO',
      features: [
        '角色自定义',
        '字段级权限',
        '数据权限',
        '审批流程',
        '操作日志',
      ],
      stats: {
        roles: 25,
        permissions: 156,
        logs: '8.5K',
      },
      href: '/admin/settings/permissions',
      price: '¥199/月',
    },
    {
      id: 'collaboration',
      title: '企业协作',
      description: '支持多部门、多角色协作，实现HR管理无缝衔接，提升组织效率',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      badge: 'PRO',
      features: [
        '多部门协作',
        '角色分工',
        '任务流转',
        '消息通知',
        '数据共享',
      ],
      stats: {
        departments: 12,
        tasks: 458,
        efficiency: '+35%',
      },
      href: '/collaboration',
      price: '¥299/月',
    },
    {
      id: 'ai-features',
      title: 'AI智能功能',
      description: '基于大模型的AI能力，提供智能简历解析、人才推荐、离职预警等',
      icon: Sparkles,
      color: 'from-violet-500 to-purple-600',
      badge: 'AI',
      features: [
        '简历智能解析',
        'AI人才推荐',
        '离职预测',
        '智能问答',
        '自动化流程',
      ],
      stats: {
        features: 8,
        usage: '85%',
        accuracy: '92%',
      },
      href: '/ai',
      price: '¥599/月',
    },
  ],

  // 套餐信息
  plans: [
    {
      name: '基础版',
      price: '免费',
      description: '适合小微企业使用',
      features: [
        '基础员工管理',
        '简单考勤管理',
        '基础报表',
        '5GB存储',
        '支持10人',
      ],
      popular: false,
    },
    {
      name: '专业版',
      price: '¥999/月',
      description: '适合成长型企业',
      features: [
        '所有基础功能',
        '数据大屏',
        '自定义报表',
        '数据导出',
        '高级权限',
        '50GB存储',
        '支持100人',
      ],
      popular: true,
    },
    {
      name: '企业版',
      price: '¥2,999/月',
      description: '适合大型企业',
      features: [
        '所有专业功能',
        'API开放平台',
        'AI智能功能',
        '企业协作',
        '专属客服',
        '无限存储',
        '不限人数',
      ],
      popular: false,
    },
  ],
};

export default function PremiumPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            高级功能
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            解锁PRO功能，提升管理效能
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Zap className="h-4 w-4 mr-2" />
          升级专业版
        </Button>
      </div>

      {/* 功能模块 */}
      <Card>
        <CardHeader>
          <CardTitle>PRO功能</CardTitle>
          <CardDescription>解锁高级功能，释放系统全部潜能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumData.modules.map((module) => {
              const Icon = module.icon;

              return (
                <Card key={module.id} className="hover:shadow-xl transition-all hover:-translate-y-1 relative">
                  {module.badge && (
                    <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {module.badge}
                    </Badge>
                  )}
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
                              {key === 'metrics' ? '指标数' :
                               key === 'refresh' ? '刷新频率' :
                               key === 'views' ? '访问量' :
                               key === 'templates' ? '模板数' :
                               key === 'created' ? '已创建' :
                               key === 'exports' ? '导出次数' :
                               key === 'size' ? '数据量' :
                               key === 'formats' ? '格式数' :
                               key === 'apis' ? 'API数' :
                               key === 'calls' ? '调用次数' :
                               key === 'partners' ? '合作方' :
                               key === 'roles' ? '角色数' :
                               key === 'permissions' ? '权限数' :
                               key === 'logs' ? '日志量' :
                               key === 'departments' ? '部门数' :
                               key === 'tasks' ? '任务数' :
                               key === 'efficiency' ? '效率提升' :
                               key === 'features' ? '功能数' :
                               key === 'usage' ? '使用率' :
                               key === 'accuracy' ? '准确率' : key}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-lg font-bold text-purple-600">
                          {module.price}
                        </span>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          立即使用
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

      {/* 套餐选择 */}
      <Card>
        <CardHeader>
          <CardTitle>套餐选择</CardTitle>
          <CardDescription>选择最适合您的套餐，开启高效管理之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumData.plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative hover:shadow-xl transition-all ${
                  plan.popular ? 'border-purple-500 ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      最受欢迎
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.price !== '免费' && (
                      <span className="text-gray-600 dark:text-gray-400">/月</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {plan.price === '免费' ? '开始使用' : '立即订阅'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用统计 */}
      <Card>
        <CardHeader>
          <CardTitle>功能使用统计</CardTitle>
          <CardDescription>了解各功能的使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                已解锁功能
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">2.5K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                本月使用次数
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                满意度
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">+35%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                效率提升
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
