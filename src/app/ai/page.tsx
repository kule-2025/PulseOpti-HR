import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  Sparkles,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export default function AIPage() {
  const aiFeatures = [
    {
      icon: FileText,
      title: '岗位画像生成',
      desc: 'AI辅助生成专业岗位描述、能力模型、薪酬区间',
      benefit: '节省80%岗位描述撰写时间',
      color: 'from-blue-600 to-blue-500',
    },
    {
      icon: Users,
      title: '智能简历筛选',
      desc: '基于岗位画像关键词自动排序，智能推荐候选人',
      benefit: '提升70%初筛效率',
      color: 'from-purple-600 to-purple-500',
    },
    {
      icon: MessageSquare,
      title: 'AI面试官',
      desc: '实时语音识别、智能评分、面试报告生成',
      benefit: '标准化面试流程，降低主观偏差',
      color: 'from-pink-600 to-pink-500',
    },
    {
      icon: Target,
      title: '绩效目标生成',
      desc: '自动生成OKR、KPI目标，智能分解和对齐',
      benefit: '目标设定效率提升60%',
      color: 'from-red-600 to-red-500',
    },
    {
      icon: Target,
      title: '人才盘点九宫格',
      desc: 'AI分析员工绩效与潜力，自动生成人才地图',
      benefit: '识别高潜人才，制定发展计划',
      color: 'from-orange-600 to-orange-500',
    },
    {
      icon: FileText,
      title: '离职分析报告',
      desc: '一键生成专业离职分析报告，深度挖掘离职原因',
      benefit: '降低离职率，提升留存',
      color: 'from-green-600 to-green-500',
    },
    {
      icon: BarChart3,
      title: '人效监测',
      desc: '实时监控关键人效指标，AI深度归因分析',
      benefit: '数据驱动决策，提升组织效能',
      color: 'from-teal-600 to-teal-500',
    },
    {
      icon: TrendingUp,
      title: '智能预测分析',
      desc: '基于历史数据预测绩效、离职、人效趋势',
      benefit: '提前预警，主动干预',
      color: 'from-cyan-600 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" href="/" />

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold">
                  免费试用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              AI 驱动 · 智能高效
            </Badge>
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl leading-tight">
              让 HR 工作更智能
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI 赋能人力资源
                </span>
              </span>
            </h1>
            <p className="mb-10 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              集成8大AI功能，从岗位画像到离职分析，从智能面试到绩效预测，
              让每一步都更加高效、精准
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl rounded-xl text-base">
                  <Zap className="mr-2 h-5 w-5" />
                  立即体验 AI 功能
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI 功能 */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI 功能
          </Badge>
          <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
            8 大 AI 功能
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            深度集成豆包大语言模型，让 HR 工作更智能、更高效
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, idx) => (
            <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{feature.desc}</p>
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-950 dark:to-purple-950">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    ✨ {feature.benefit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 技术优势 */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              技术优势
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              基于先进的大语言模型，提供专业、可靠、智能的 AI 服务
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">大语言模型</h3>
                <p className="text-blue-100 leading-relaxed">
                  集成豆包大语言模型，具备强大的理解、推理和生成能力
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">场景化优化</h3>
                <p className="text-blue-100 leading-relaxed">
                  针对HR场景深度优化，提供专业、准确的分析和建议
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">实时响应</h3>
                <p className="text-blue-100 leading-relaxed">
                  流式输出技术，实时生成结果，提升用户体验
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 shadow-2xl">
            <h2 className="mb-4 text-3xl font-bold text-white">
              准备好体验 AI 赋能了吗？
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              立即注册，免费体验所有 AI 功能
            </p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl rounded-xl text-base">
                <Zap className="mr-2 h-5 w-5" />
                免费开始
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 PulseOpti HR 脉策聚效. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
