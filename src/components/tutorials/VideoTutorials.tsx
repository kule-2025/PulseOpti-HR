import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Clock,
  Users,
  FileText,
  Target,
  DollarSign,
  Zap,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  HeadphonesIcon,
  BarChart3,
} from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: any;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'ready' | 'coming-soon';
}

const tutorials: Tutorial[] = [
  {
    id: 'quick-start',
    title: '5分钟快速上手',
    description: '从注册到完成第一次员工档案管理，快速掌握系统核心功能',
    duration: '5:30',
    category: '快速开始',
    icon: Zap,
    level: 'beginner',
    status: 'ready',
  },
  {
    id: 'organization',
    title: '组织人事管理',
    description: '学习如何创建组织架构、管理员工档案和职位体系',
    duration: '8:45',
    category: '核心功能',
    icon: Users,
    level: 'beginner',
    status: 'ready',
  },
  {
    id: 'recruitment',
    title: '招聘全流程管理',
    description: '从职位发布、简历筛选到面试安排、Offer发放的完整流程',
    duration: '12:20',
    category: '核心功能',
    icon: Target,
    level: 'intermediate',
    status: 'ready',
  },
  {
    id: 'performance',
    title: '绩效管理与评估',
    description: '目标设定（OKR/KPI）、绩效评估、结果分析的完整操作指南',
    duration: '10:15',
    category: '核心功能',
    icon: FileText,
    level: 'intermediate',
    status: 'ready',
  },
  {
    id: 'compensation',
    title: '薪酬管理实战',
    description: '工资核算、薪酬结构配置、社保公积金自动计算详解',
    duration: '11:30',
    category: '核心功能',
    icon: DollarSign,
    level: 'intermediate',
    status: 'ready',
  },
  {
    id: 'ai-job-profile',
    title: 'AI岗位画像生成',
    description: '使用AI助手快速生成专业的岗位描述和能力模型',
    duration: '6:00',
    category: 'AI功能',
    icon: Zap,
    level: 'beginner',
    status: 'ready',
  },
  {
    id: 'ai-resume',
    title: 'AI智能简历筛选',
    description: '基于AI的候选人排序和智能匹配，提升招聘效率',
    duration: '7:45',
    category: 'AI功能',
    icon: Target,
    level: 'intermediate',
    status: 'ready',
  },
  {
    id: 'ai-interview',
    title: 'AI面试官使用指南',
    description: '设置AI面试问题、语音识别、智能评分的全流程操作',
    duration: '9:30',
    category: 'AI功能',
    icon: BookOpen,
    level: 'advanced',
    status: 'ready',
  },
  {
    id: 'ai-talent',
    title: '人才盘点九宫格',
    description: '使用AI进行人才盘点、关键人才识别和IDP生成',
    duration: '8:00',
    category: 'AI功能',
    icon: Users,
    level: 'advanced',
    status: 'ready',
  },
  {
    id: 'workflow',
    title: '工作流引擎使用',
    description: '可视化编辑工作流、自定义节点、跨表联动的完整教程',
    duration: '15:00',
    category: '高级功能',
    icon: FileText,
    level: 'advanced',
    status: 'coming-soon',
  },
  {
    id: 'dashboard',
    title: '数据看板与分析',
    description: 'HR数据可视化、报表生成、数据分析的深度使用',
    duration: '10:45',
    category: '高级功能',
    icon: BarChart3,
    level: 'intermediate',
    status: 'coming-soon',
  },
  {
    id: 'integration',
    title: '第三方集成',
    description: '企业微信、钉钉、飞书等平台的集成与数据同步',
    duration: '12:00',
    category: '高级功能',
    icon: Zap,
    level: 'advanced',
    status: 'coming-soon',
  },
];

const levelConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-700' },
};

export default function VideoTutorials() {
  const readyTutorials = tutorials.filter(t => t.status === 'ready');
  const comingSoonTutorials = tutorials.filter(t => t.status === 'coming-soon');

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50 py-24 border-t border-gray-200">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            <Play className="mr-2 h-3.5 w-3.5" />
            视频教程
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            手把手教你使用 PulseOpti HR
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            从快速入门到高级功能，100+分钟真实操作视频，让HR工作更轻松
          </p>
        </div>

        {/* 已发布教程 */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
            <h3 className="text-2xl font-bold text-gray-900">已发布教程</h3>
            <div className="h-1 flex-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readyTutorials.map((tutorial) => {
              const Icon = tutorial.icon;
              const levelInfo = levelConfig[tutorial.level];

              return (
                <Card
                  key={tutorial.id}
                  className="border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:border-blue-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={levelInfo.color}>
                        {levelInfo.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {tutorial.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{tutorial.duration}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 group-hover:bg-blue-50">
                        <Play className="w-3.5 h-3.5 mr-1" />
                        播放
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 即将发布 */}
        {comingSoonTutorials.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 flex-1 bg-gray-200 rounded-full" />
              <h3 className="text-2xl font-bold text-gray-900">即将发布</h3>
              <div className="h-1 flex-1 bg-gray-200 rounded-full" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comingSoonTutorials.map((tutorial) => {
                const Icon = tutorial.icon;
                const levelInfo = levelConfig[tutorial.level];

                return (
                  <Card
                    key={tutorial.id}
                    className="border-2 border-dashed border-gray-300 bg-gray-50 opacity-75"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200">
                          <Icon className="h-6 w-6 text-gray-400" />
                        </div>
                        <Badge className="bg-gray-200 text-gray-600">
                          敬请期待
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-gray-700 line-clamp-2">
                        {tutorial.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {tutorial.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{tutorial.duration}</span>
                        </div>
                        <Badge className={levelInfo.color}>
                          {levelInfo.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 学习路径 */}
        <div className="mt-16 bg-white border-2 rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                推荐学习路径
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">快速入门</p>
                    <p className="text-sm text-gray-600">5分钟快速上手 + 组织人事管理</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">核心功能</p>
                    <p className="text-sm text-gray-600">招聘 + 绩效 + 薪酬管理</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI功能</p>
                    <p className="text-sm text-gray-600">AI助手 + 智能面试 + 人才盘点</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HeadphonesIcon className="w-6 h-6 text-blue-600" />
                需要帮助？
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  如果在学习过程中遇到问题，可以通过以下方式获取帮助：
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>查看帮助文档：<a href="/docs" className="text-blue-600 hover:underline">文档中心</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>联系客服：<a href="mailto:PulseOptiHR@163.com" className="text-blue-600 hover:underline">PulseOptiHR@163.com</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>服务时间：周一至周五 9:00-12:00, 14:00-18:00</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
