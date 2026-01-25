import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Code,
  Settings,
  Zap,
  ChevronRight,
  Sparkles,
  Target,
  Lock,
} from 'lucide-react';

// 文档路由映射
const docRoutes: Record<string, string> = {
  // 快速开始
  '5分钟快速上手': '/features#quick-start',
  '账号设置': '/features#account-setup',
  '邀请团队成员': '/features#invite-team',  // 功能介绍页面，不是admin

  // 功能指南
  '招聘管理': '/features#recruitment',
  '绩效管理': '/features#performance',
  '薪酬管理': '/features#compensation',
  '考勤管理': '/features#attendance',
  '培训管理': '/features#training',

  // AI功能
  '岗位画像生成': '/features#ai-job-profile',
  '智能简历筛选': '/features#ai-resume',
  'AI面试官': '/features#ai-interview',
  '人才盘点': '/features#ai-talent',
  '离职分析': '/features#ai-turnover',

  // 工作流
  '工作流编辑器': '/pricing',  // 付费会员功能
  '标准流程': '/support',  // 点击标准流程进入客服中心
  '自定义流程': '/pricing',  // 付费会员功能

  // API开发
  'API 概览': '/docs#api-overview',
  '认证授权': '/docs#api-auth',
  'API 参考': '/docs#api-reference',
  'SDK 与示例': '/docs#api-sdk',

  // 常见问题
  '账号问题': '/support#account',
  '功能使用': '/support#usage',
  '计费问题': '/support#pricing',
  '技术支持': '/support#technical',
};

export default function DocsPage() {
  const docCategories = [
    {
      title: '快速开始',
      description: '快速了解 PulseOpti HR脉策聚效的基本功能和使用方法',
      icon: Zap,
      docs: [
        { title: '5分钟快速上手', href: '#', desc: '了解系统核心功能' },
        { title: '账号设置', href: '#', desc: '创建账号、企业认证' },
        { title: '邀请团队成员', href: '#', desc: '添加子账号、分配权限' },
      ],
    },
    {
      title: '功能指南',
      description: '深入学习各个模块的使用方法',
      icon: BookOpen,
      docs: [
        { title: '招聘管理', href: '#', desc: '从职位发布到入职的完整流程' },
        { title: '绩效管理', href: '#', desc: '目标设定、评估、结果分析' },
        { title: '薪酬管理', href: '#', desc: '工资核算、结构管理' },
        { title: '考勤管理', href: '#', desc: '打卡、排班、请假' },
        { title: '培训管理', href: '#', desc: '课程管理、学习记录' },
      ],
    },
    {
      title: 'AI 功能',
      description: '了解如何使用 AI 功能提升效率',
      icon: Sparkles,
      docs: [
        { title: '岗位画像生成', href: '#', desc: 'AI辅助生成岗位描述' },
        { title: '智能简历筛选', href: '#', desc: '基于AI的候选人排序' },
        { title: 'AI面试官', href: '#', desc: '智能面试与评分' },
        { title: '人才盘点', href: '#', desc: '九宫格分析人才' },
        { title: '离职分析', href: '#', desc: 'AI生成分析报告' },
      ],
    },
    {
      title: '工作流',
      description: '配置和使用工作流引擎',
      icon: Settings,
      docs: [
        { title: '工作流编辑器', href: '#', desc: '可视化编辑工作流' },
        { title: '标准流程', href: '#', desc: '15种标准工作流模板' },
        { title: '自定义流程', href: '#', desc: '创建个性化工作流' },
      ],
    },
    {
      title: 'API 开发',
      description: 'API 文档和集成指南',
      icon: Code,
      docs: [
        { title: 'API 概览', href: '#', desc: '了解API基础' },
        { title: '认证授权', href: '#', desc: '获取API密钥' },
        { title: 'API 参考', href: '#', desc: '完整的API文档' },
        { title: 'SDK 与示例', href: '#', desc: 'SDK和代码示例' },
      ],
    },
    {
      title: '常见问题',
      description: '使用过程中的常见问题和解决方案',
      icon: HelpCircle,
      docs: [
        { title: '账号问题', href: '#', desc: '登录、注册、权限' },
        { title: '功能使用', href: '#', desc: '各模块常见问题' },
        { title: '计费问题', href: '#', desc: '套餐、支付、发票' },
        { title: '技术支持', href: '#', desc: '故障排查、联系支持' },
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
      <section className="container mx-auto px-6 py-12">
        <div className="mb-6 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
        <div className="text-center pt-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <BookOpen className="mr-2 h-3.5 w-3.5" />
            帮助文档
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            完整的使用文档
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            快速上手、功能指南、API 文档，帮助您更好地使用 PulseOpti HR脉策聚效
          </p>
        </div>
      </section>

      {/* 文档分类 */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {docCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.docs.map((doc, docIdx) => {
                      const docHref = docRoutes[doc.title] || doc.href;
                      const isPaidFeature = ['工作流编辑器', '自定义流程'].includes(doc.title);

                      return (
                        <li key={docIdx}>
                          <Link
                            href={docHref}
                            className="flex items-start gap-3 group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {doc.title}
                                </p>
                                {isPaidFeature && (
                                  <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                    <Lock className="h-2.5 w-2.5 mr-1" />
                                    付费功能
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{doc.desc}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 视频教程 */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Video className="mr-2 h-3.5 w-3.5" />
              视频教程
            </Badge>
            <h2 className="mb-4 text-3xl md:text-4xl font-bold">
              视频教程
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              观看视频教程，快速掌握核心功能
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { title: '快速入门', duration: '5:30', icon: Zap },
              { title: '招聘流程', duration: '8:15', icon: BookOpen },
              { title: '绩效管理', duration: '6:45', icon: Target },
            ].map((video, idx) => {
              const Icon = video.icon;
              return (
                <Card key={idx} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Video className="w-6 h-6" />
                      </div>
                      <Badge className="bg-white/20 text-white">{video.duration}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-blue-100">观看教程 →</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 还需要帮助？ */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                还需要帮助？
              </h2>
              <p className="text-gray-600 mb-6">
                查看我们的帮助中心，或联系我们的支持团队
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/support">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    访问帮助中心
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-2 border-gray-200">
                    联系支持
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
