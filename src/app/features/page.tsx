import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  Target,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Clock,
  FileText,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Trophy,
  Layers,
  MessageSquare,
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      category: '核心管理',
      items: [
        { icon: Users, title: '组织人事', desc: '员工档案、组织架构、职位体系' },
        { icon: Briefcase, title: '招聘管理', desc: '岗位发布、简历筛选、面试安排、Offer管理' },
        { icon: Target, title: '绩效管理', desc: '目标设定、绩效评估、结果分析' },
        { icon: DollarSign, title: '薪酬管理', desc: '工资核算、薪酬结构、社保公积金' },
        { icon: Clock, title: '考勤管理', desc: '打卡记录、排班管理、请假审批、加班管理' },
        { icon: GraduationCap, title: '培训管理', desc: '培训计划、课程管理、学习记录' },
      ],
    },
    {
      category: 'AI智能',
      items: [
        { icon: Sparkles, title: '岗位画像生成', desc: 'AI辅助生成专业岗位描述和能力模型' },
        { icon: MessageSquare, title: '智能面试', desc: 'AI面试官、语音识别、智能评分' },
        { icon: Target, title: '人才盘点', desc: '九宫格可视化、关键人才识别' },
        { icon: FileText, title: '离职分析', desc: '一键生成专业离职分析报告' },
        { icon: TrendingUp, title: '人效监测', desc: '实时监控、AI深度归因、预测干预' },
        { icon: Zap, title: '绩效预测', desc: '基于历史数据预测绩效和离职风险' },
      ],
    },
    {
      category: '工作流程',
      items: [
        { icon: Layers, title: '工作流引擎', desc: '可视化编辑、自定义节点、跨表联动' },
        { icon: Users, title: '入职流程', desc: '自动化入职办理、任务分配、进度跟踪' },
        { icon: Target, title: '晋升流程', desc: '晋升申请、评估、审批、通知' },
        { icon: Layers, title: '转岗流程', desc: '转岗申请、审批、交接、生效' },
        { icon: DollarSign, title: '调薪流程', desc: '调薪申请、审批、生效、通知' },
        { icon: FileText, title: '离职流程', desc: '离职申请、交接、访谈、离职分析' },
      ],
    },
    {
      category: '增值服务',
      items: [
        { icon: Trophy, title: '积分管理', desc: '积分系统、规则配置、兑换商城、排行榜' },
        { icon: BarChart3, title: 'HR报表', desc: '人员结构、人效、离职率、薪酬分析' },
        { icon: Shield, title: '合规管理', desc: '劳动合同、试用期考核、合同续签' },
        { icon: Users, title: '员工自助', desc: '个人信息、请假、报销、工资查询' },
        { icon: Target, title: '人才库', desc: '候选人库、员工池、离职校友库' },
      ],
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

      {/* Header */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
        <div id="quick-start" className="pt-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            功能详解
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            全方位 HR 管理解决方案
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            从招聘到留人，从入职到离职，覆盖人力资源全生命周期
          </p>
        </div>
      </section>

      {/* 功能列表 */}
      <section className="container mx-auto px-6 pb-24">
        {/* 核心管理 */}
        <div id="core-management" className="mb-16">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">核心管理</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card id="organization" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">组织人事</CardTitle>
                <CardDescription className="text-xs">员工档案、组织架构、职位体系</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">完整的员工信息管理，支持组织架构可视化和职位体系配置，实现人事数据统一管理。</p>
              </CardContent>
            </Card>

            <Card id="recruitment" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">招聘管理</CardTitle>
                <CardDescription className="text-xs">岗位发布、简历筛选、面试安排、Offer管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">从职位发布到入职的全流程管理，AI智能筛选简历，自动化面试安排，提升招聘效率。</p>
              </CardContent>
            </Card>

            <Card id="performance" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">绩效管理</CardTitle>
                <CardDescription className="text-xs">目标设定、绩效评估、结果分析</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">支持OKR、KPI等多种目标设定方式，多维度绩效评估，可视化结果分析。</p>
              </CardContent>
            </Card>

            <Card id="compensation" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">薪酬管理</CardTitle>
                <CardDescription className="text-xs">工资核算、薪酬结构、社保公积金</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">智能工资核算，灵活的薪酬结构配置，自动计算社保公积金，支持多城市标准。</p>
              </CardContent>
            </Card>

            <Card id="attendance" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">考勤管理</CardTitle>
                <CardDescription className="text-xs">打卡记录、排班管理、请假审批、加班管理</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">多种打卡方式，灵活排班，智能考勤统计，自动计算工时和加班。</p>
              </CardContent>
            </Card>

            <Card id="training" className="border-2 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">培训管理</CardTitle>
                <CardDescription className="text-xs">培训计划、课程管理、学习记录</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">制定培训计划，上传培训课程，跟踪学习进度，评估培训效果。</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI智能 */}
        <div id="ai-features" className="mb-16">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">AI 智能</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card id="ai-job-profile" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">岗位画像生成</CardTitle>
                <CardDescription className="text-xs">AI辅助生成专业岗位描述和能力模型</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">基于行业大数据，AI自动生成岗位JD，包含职责描述、能力要求、薪酬区间建议。</p>
              </CardContent>
            </Card>

            <Card id="ai-resume" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">智能简历筛选</CardTitle>
                <CardDescription className="text-xs">基于AI的候选人排序和推荐</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">智能解析简历，基于岗位画像自动匹配度和排序，快速筛选优质候选人。</p>
              </CardContent>
            </Card>

            <Card id="ai-interview" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-red-600 shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">AI面试官</CardTitle>
                <CardDescription className="text-xs">智能面试与评分</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">AI辅助面试提问，语音识别转文字，智能评分，生成面试报告。</p>
              </CardContent>
            </Card>

            <Card id="ai-talent" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">人才盘点</CardTitle>
                <CardDescription className="text-xs">九宫格可视化、关键人才识别</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">基于绩效、潜力等多维度分析，生成人才九宫格，识别高潜人才和风险员工。</p>
              </CardContent>
            </Card>

            <Card id="ai-turnover" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">离职分析</CardTitle>
                <CardDescription className="text-xs">一键生成专业离职分析报告</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">AI深度分析离职原因，生成可视化报告，提供留人建议。</p>
              </CardContent>
            </Card>

            <Card id="ai-efficiency" className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">人效监测</CardTitle>
                <CardDescription className="text-xs">实时监控、AI深度归因、预测干预</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">实时监控人效指标，AI归因分析，预测趋势，提供优化建议。</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            准备好开始了吗？
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            立即注册，免费体验所有功能
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                免费开始
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-14 px-8 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-semibold">
                联系销售
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
