import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Zap, Shield, Users, BarChart3, Award, Star, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const plans = [
    {
      name: '免费版',
      tier: 'free',
      price: '¥0',
      period: '/永久',
      description: '体验基础功能，适合10人以下小团队',
      maxEmployees: 10,
      features: [
        '员工基础信息管理',
        '部门管理（最多3个）',
        '基础报表查看',
        '10次AI调用/月',
        '1GB存储空间',
        '社区支持',
      ],
      cta: '免费开始',
      popular: false,
    },
    {
      name: '基础版',
      tier: 'basic',
      price: '¥199',
      period: '/月',
      description: '适合10-50人成长型企业',
      maxEmployees: 50,
      features: [
        '免费版所有功能',
        '无限制部门管理',
        '招聘流程管理',
        '基础绩效管理',
        '100次AI调用/月',
        '10GB存储空间',
        '邮件支持',
      ],
      cta: '开始使用',
      popular: true,
    },
    {
      name: '专业版',
      tier: 'professional',
      price: '¥599',
      period: '/月',
      description: '适合50-200人规模企业，HR三支柱架构',
      maxEmployees: 200,
      features: [
        '基础版所有功能',
        '完整招聘系统（AI简历筛选）',
        '360度绩效评估',
        '人才盘点九宫格',
        '离职预测分析',
        '1000次AI调用/月',
        '100GB存储空间',
        '优先技术支持',
        '自定义报表',
        '工作流引擎',
      ],
      cta: '推荐选择',
      popular: false,
    },
    {
      name: '企业版',
      tier: 'enterprise',
      price: '¥1999',
      period: '/月',
      description: '适合200人以上大型企业，深度定制',
      maxEmployees: 9999,
      features: [
        '专业版所有功能',
        '无限AI调用',
        '1TB存储空间',
        '专属客户经理',
        '企业品牌定制',
        '私有化部署选项',
        'API接口开放',
        'SSO单点登录',
        '数据大屏定制',
        '7x24小时支持',
      ],
      cta: '联系销售',
      popular: false,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI驱动',
      description: '集成豆包大语言模型，智能生成岗位画像、人才盘点、离职分析报告',
    },
    {
      icon: Shield,
      title: '数据安全',
      description: '多租户数据隔离，企业级安全保障，符合数据保护法规',
    },
    {
      icon: Users,
      title: 'HR三支柱',
      description: '基于HRBP/COE/SSC架构设计，提供专业的人力资源管理框架',
    },
    {
      icon: BarChart3,
      title: '数据洞察',
      description: '管理驾驶舱实时展示关键指标，让业务负责人看得见、有抓手',
    },
    {
      icon: Award,
      title: '工作流引擎',
      description: '灵活配置招聘、绩效、入职、离职、晋升等标准流程',
    },
    {
      icon: Star,
      title: '超高性价比',
      description: '价格仅为竞品的50%，提供更优质的服务和功能',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 text-sm">
              🎉 限时优惠 - 立享5折优惠
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PulseOpti HR 脉策聚效
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              赋能中小企业管理者，内置人力资源专业智慧<br />
              从人事事务自动化到人才战略数据化
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-8 py-6">
                免费开始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                了解更多
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              无需信用卡 · 10人以下永久免费 · 30天无理由退款
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择我们</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              专业、智能、高效的人力资源管理平台
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">简单透明的定价</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              价格仅为竞品的50%，无隐藏费用
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <Check className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                年付立享8折优惠
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-2xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      最受欢迎
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      可容纳 {plan.maxEmployees} 名员工
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              准备好提升组织人效了吗？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              加入数千家企业的选择，体验专业的人力资源管理
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                免费注册
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                预约演示
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© 2025 PulseOpti HR 脉策聚效. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
