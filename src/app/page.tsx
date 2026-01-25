import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import VideoTutorials from '@/components/tutorials/VideoTutorials';
import {
  Users,
  Target,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Crown,
  Building2,
  Clock,
  Star,
  TrendingUp,
  ShieldCheck,
  HeadphonesIcon,
  Rocket,
  MessageSquare,
  FileText,
  Diamond
} from 'lucide-react';

// 强制使用静态生成，避免每次请求都重新渲染
export const dynamic = 'force-static';
export const revalidate = 3600; // 每小时重新验证一次

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" href="/" />
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                功能
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                价格
              </Link>
              <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                关于我们
              </Link>
              <Link href="/sync-guide" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                数据同步
              </Link>
              <Link href="/support" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                帮助中心
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                  免费试用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 md:py-32">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              AI 驱动 + 价格仅为竞品 3%-20%
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                PulseOpti HR
              </span>
              {' '}脉策聚效
            </h1>
            
            <p className="mb-10 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              从人事事务自动化到人才战略数据化，让每一家企业都拥有专业、可用的 HRBP 能力。
              <br />
              <span className="font-semibold">降本 · 增效 · 控险 · 赋能</span>
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl rounded-xl text-base">
                  <Rocket className="mr-2 h-5 w-5" />
                  立即开始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl text-base">
                  了解价格
                </Button>
              </Link>
            </div>

            {/* 数据展示 */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">10-500</p>
                <p className="text-sm text-blue-200 mt-1">适合企业规模</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">15+</p>
                <p className="text-sm text-blue-200 mt-1">工作流模板</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">8 大</p>
                <p className="text-sm text-blue-200 mt-1">AI 功能</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 三大支柱 */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 font-medium">
            <Target className="mr-2 h-3.5 w-3.5" />
            核心架构
          </Badge>
          <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
            HRBP/COE/SSC 三支柱架构
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            融合人力资源专业智慧，构建完整的管理闭环
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* COE */}
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">卓越中心 (COE)</CardTitle>
              <CardDescription className="text-base">核心人力资源管理</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, text: '智能招聘与入职' },
                  { icon: CheckCircle2, text: '组织人事管理' },
                  { icon: CheckCircle2, text: '绩效目标管理' },
                  { icon: CheckCircle2, text: '薪酬福利管理' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <item.icon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* HRBP */}
          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                业务伙伴 (HRBP)
              </CardTitle>
              <CardDescription className="text-base font-semibold text-purple-700">
                核心差异化能力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, text: '管理者数据驾驶舱' },
                  { icon: CheckCircle2, text: '场景化 HR 工具包' },
                  { icon: CheckCircle2, text: '人才洞察与预警' },
                  { icon: CheckCircle2, text: '业务决策支持' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <item.icon className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* SSC */}
          <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white hover:border-green-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">共享服务中心 (SSC)</CardTitle>
              <CardDescription className="text-base">系统与配置</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, text: '权限与角色管理' },
                  { icon: CheckCircle2, text: '流程自定义引擎' },
                  { icon: CheckCircle2, text: '合规风险管控' },
                  { icon: CheckCircle2, text: '系统集成与 API' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <item.icon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="bg-gradient-to-br from-slate-50 to-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-700 font-medium">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              核心功能
            </Badge>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
              从招聘到留人，全生命周期管理
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              8 大 AI 功能 + 15 种工作流，让 HR 工作更智能、更高效
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: '岗位画像生成器', desc: 'AI 辅助生成专业岗位描述，包含职责、能力模型、薪酬区间', color: 'from-blue-500 to-blue-600' },
              { icon: Users, title: '智能简历筛选', desc: '基于岗位画像关键词自动排序，节省初筛时间', color: 'from-purple-500 to-purple-600' },
              { icon: MessageSquare, title: '结构化面试', desc: '提供面试题库、评分表与面试官协作空间', color: 'from-pink-500 to-pink-600' },
              { icon: Clock, title: '试用期管理', desc: '一键生成 30/60/90 天试用期目标与考核计划', color: 'from-orange-500 to-orange-600' },
              { icon: Target, title: '绩效目标管理', desc: '支持 OKR、KPI 等多种目标设定与对齐方式', color: 'from-red-500 to-red-600' },
              { icon: BarChart3, title: '人才盘点九宫格', desc: '可视化呈现人才分布，识别高潜与风险员工', color: 'from-amber-500 to-amber-600' },
              { icon: ShieldCheck, title: '离职分析报告', desc: '一键生成专业离职分析报告，洞察离职原因', color: 'from-green-500 to-green-600' },
              { icon: TrendingUp, title: '人效监测系统', desc: '实时监控关键人效指标，AI 深度归因分析', color: 'from-teal-500 to-teal-600' },
              { icon: Zap, title: '智能预测分析', desc: '基于历史数据预测绩效、离职、人效趋势', color: 'from-cyan-500 to-cyan-600' },
            ].map((feature, idx) => (
              <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 价格预览 */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-amber-100 text-amber-700 font-medium">
              <Crown className="mr-2 h-3.5 w-3.5" />
              透明定价
            </Badge>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
              选择适合您的套餐
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              价格仅为竞品的 3%-20%，无隐藏费用
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* 基础版 */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-2 bg-blue-100 text-blue-700">性价比之选</Badge>
                <CardTitle className="text-2xl">基础版</CardTitle>
                <CardDescription>适合 30-50 人小团队</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    ¥599
                  </span>
                  <span className="text-gray-600">/年</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {['最多 50 人', '5 个 AI 功能', '标准工作流模板', '在线客服支持'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    查看详情
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 专业版 */}
            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mb-4">
                  <Diamond className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-2 bg-purple-100 text-purple-700">最受欢迎</Badge>
                <CardTitle className="text-2xl">专业版</CardTitle>
                <CardDescription>适合 50-100 人中型团队</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    ¥1,499
                  </span>
                  <span className="text-gray-600">/年</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {['最多 100 人', '7 个 AI 功能', '自定义工作流', '专属客服支持'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    查看详情
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 企业版 */}
            <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-2 bg-amber-100 text-amber-700">尊享版</Badge>
                <CardTitle className="text-2xl">企业版</CardTitle>
                <CardDescription>适合 100-500 人大型企业</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ¥2,999
                  </span>
                  <span className="text-gray-600">/年</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {['最多 500 人', '8 个 AI 功能', '完全自定义工作流', '7x24 专属客服'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    查看详情
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 优势对比 */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              为什么选择 PulseOpti HR 脉策聚效？
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              与市场上主流 HR SaaS 产品相比，我们提供更具竞争力的价格和更强大的 AI 功能
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">价格优势</h3>
                <p className="text-blue-100 leading-relaxed">
                  价格仅为竞品的 <span className="font-bold text-white">3%-20%</span>，无需高昂投入即可享受专业 HR SaaS 服务
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI 深度集成</h3>
                <p className="text-blue-100 leading-relaxed">
                  <span className="font-bold text-white">8 大 AI 功能</span>，岗位画像、人才盘点、离职分析、智能面试，让 HR 工作更智能
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  <Diamond className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">工作流引擎</h3>
                <p className="text-blue-100 leading-relaxed">
                  <span className="font-bold text-white">15 种标准流程</span>，可视化编辑、自定义节点，适配企业个性化需求
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 客户评价 */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-green-100 text-green-700 font-medium">
              <Star className="mr-2 h-3.5 w-3.5" />
              客户评价
            </Badge>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900">
              客户怎么说
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: '张总', company: '某互联网公司（50人）', content: 'PulseOpti HR 脉策聚效帮我们将招聘效率提升了 60%，AI 智能面试功能非常实用。', rating: 5 },
              { name: '李经理', company: '某制造企业（200人）', content: '人效监测系统让我们实时掌握组织效率，AI 归因分析帮助我们精准决策。', rating: 5 },
              { name: '王总监', company: '某培训机构（100人）', content: '价格太有竞争力了，功能却很全面，尤其是工作流引擎，大大提升了我们的管理效率。', rating: 5 },
            ].map((review, idx) => (
              <Card key={idx} className="border-2 border-gray-100 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl mb-8">
              <Rocket className="w-10 h-10" />
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-bold">
              准备好开启 HR 数字化之旅了吗？
            </h2>
            <p className="mb-10 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              立即注册，免费体验核心功能。无信用卡，无风险，随时取消。
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold shadow-xl hover:shadow-2xl rounded-xl text-base">
                  免费开始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl text-base">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  联系销售
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 视频教程 */}
      <VideoTutorials />

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PulseOpti HR
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                赋能中小企业，让 HR 工作更智能、更高效。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">产品</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">价格</Link></li>
                <li><Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">功能</Link></li>
                <li><Link href="/ai" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">AI 功能</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">支持</h4>
              <ul className="space-y-2">
                <li><Link href="/support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">帮助中心</Link></li>
                <li><Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">文档</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">联系我们</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>邮箱：PulseOptiHR@163.com</li>
                <li>地址：广州市天河区</li>
              </ul>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">微信扫码咨询</p>
                <Image
                  src="/assets/微信二维码.png"
                  alt="微信二维码"
                  width={120}
                  height={120}
                  className="rounded-lg border border-gray-200"
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 120px"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-sm text-gray-600">
              © 2025 PulseOpti HR 脉策聚效. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
