'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  TrendingUp,
  Users,
  Award,
  Star,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function CasesPage() {
  const cases = [
    {
      id: 1,
      company: '某互联网科技公司',
      industry: '互联网',
      employees: 120,
      challenges: ['人事管理混乱', '数据统计困难', '效率低下'],
      solution: '实施PulseOpti HR脉策聚效全系统',
      results: ['效率提升60%', '人工成本降低40%', '决策效率提升50%'],
    },
    {
      id: 2,
      company: '某零售连锁企业',
      industry: '零售',
      employees: 85,
      challenges: ['排班复杂', '考勤管理困难', '培训跟踪缺失'],
      solution: '重点实施考勤和培训管理',
      results: ['排班效率提升80%', '考勤准确率100%', '培训完成率提升30%'],
    },
    {
      id: 3,
      company: '某制造企业',
      industry: '制造业',
      employees: 200,
      challenges: ['薪酬核算复杂', '社保管理困难', '报表统计耗时'],
      solution: '重点实施薪酬和考勤管理',
      results: ['薪酬核算时间减少90%', '社保零差错', '报表实时生成'],
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: '张总',
      position: 'CEO',
      company: '某科技公司',
      content: 'PulseOpti HR脉策聚效帮助我们实现了人事管理的数字化转型，AI驱动的数据分析让决策更精准，员工满意度大幅提升。',
      rating: 5,
    },
    {
      id: 2,
      name: '李总',
      position: 'HR总监',
      company: '某制造企业',
      content: '从传统的人事管理到智能化HR SaaS，PulseOpti HR脉策聚效让我们的工作效率提升了3倍，强烈推荐！',
      rating: 5,
    },
    {
      id: 3,
      name: '王总',
      position: '运营总监',
      company: '某零售企业',
      content: '考勤排班、培训管理一站式解决，价格只有竞品的一半，性价比超高！',
      rating: 5,
    },
  ];

  const industries = [
    { name: '互联网', icon: '💻', description: '适合科技公司、互联网企业' },
    { name: '零售', icon: '🏪', description: '适合零售、连锁企业' },
    { name: '制造', icon: '🏭', description: '适合制造、生产企业' },
    { name: '教育', icon: '🎓', description: '适合学校、培训机构' },
    { name: '服务', icon: '🏨', description: '适合服务、咨询企业' },
    { name: '金融', icon: '🏦', description: '适合金融、保险企业' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-blue-600 text-white">成功案例</Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            已助力
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}1000+{' '}
            </span>
            企业提升人效
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            看看他们如何使用PulseOpti HR脉策聚效实现数字化升级
          </p>
        </div>

        {/* 客户案例 */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
            客户案例
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <Card
                key={item.id}
                className="border-2 bg-white shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.company}
                      </h3>
                      <Badge variant="outline">{item.industry}</Badge>
                    </div>
                  </div>

                  <div className="mb-4 grid gap-3 text-sm">
                    <div>
                      <p className="mb-1 font-medium text-gray-900 dark:text-white">
                        员工规模
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{item.employees}人</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-gray-900 dark:text-white">
                        面临挑战
                      </p>
                      <ul className="space-y-1">
                        {item.challenges.map((challenge, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">
                            • {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-gray-900 dark:text-white">
                        解决方案
                      </p>
                      <p className="text-blue-600">{item.solution}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-gray-900 dark:text-white">
                        实施效果
                      </p>
                      <ul className="space-y-1">
                        {item.results.map((result, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 客户评价 */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
            客户评价
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.id}
                className="border-2 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: item.rating || 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    "{item.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.position} · {item.company}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 行业解决方案 */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
            行业解决方案
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {industries.map((industry, index) => (
              <Card
                key={index}
                className="border-2 bg-white p-6 text-center shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 text-5xl">{industry.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {industry.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {industry.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            准备好提升人效了吗？
          </h2>
          <p className="mb-6 text-lg opacity-90">
            加入1000+企业的行列，开启HR数字化之旅
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              免费试用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white hover:bg-white/10">
              联系销售
            </Button>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: '服务企业', value: '1000+', icon: Building2 },
            { label: '覆盖员工', value: '50,000+', icon: Users },
            { label: '客户满意度', value: '98%', icon: Star },
            { label: '效率提升', value: '平均60%', icon: TrendingUp },
          ].map((stat, index) => (
            <Card
              key={index}
              className="border-2 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800"
            >
              <stat.icon className="mx-auto mb-3 h-10 w-10 text-blue-600" />
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
