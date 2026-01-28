'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Target,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Star,
  Award,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Zap,
} from 'lucide-react';

interface TalentPlan {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  level: string;
  developmentGoals: string[];
  currentSkills: string[];
  targetSkills: string[];
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  targetDate: string;
  progress: number;
  mentor: string;
  achievements: {
    id: string;
    title: string;
    completedDate: string;
  }[];
  metrics: {
    performanceScore: number;
    potentialScore: number;
    readiness: number;
  };
}

// 模拟人才发展数据
const TALENT_PLANS_DATA: TalentPlan[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '高级前端工程师',
    level: 'P7',
    developmentGoals: [
      '提升技术架构能力',
      '培养团队管理技能',
      '掌握云原生技术',
    ],
    currentSkills: ['React', 'TypeScript', 'Node.js'],
    targetSkills: ['架构设计', '团队管理', '微服务', 'Kubernetes'],
    status: 'active',
    startDate: '2024-01-01',
    targetDate: '2025-12-31',
    progress: 65,
    mentor: '技术总监',
    achievements: [
      { id: 'ach-1', title: '完成微服务架构设计认证', completedDate: '2024-06-15' },
      { id: 'ach-2', title: '主导完成技术方案重构', completedDate: '2024-09-01' },
    ],
    metrics: {
      performanceScore: 92,
      potentialScore: 88,
      readiness: 80,
    },
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '销售经理',
    level: 'P6',
    developmentGoals: [
      '提升大客户谈判能力',
      '学习数字营销',
      '培养团队领导力',
    ],
    currentSkills: ['B2B销售', '客户管理', 'CRM'],
    targetSkills: ['大客户销售', '数字营销', '团队管理', '战略规划'],
    status: 'active',
    startDate: '2024-03-01',
    targetDate: '2025-03-31',
    progress: 75,
    mentor: '销售总监',
    achievements: [
      { id: 'ach-1', title: '完成大客户销售培训', completedDate: '2024-05-20' },
    ],
    metrics: {
      performanceScore: 88,
      potentialScore: 90,
      readiness: 85,
    },
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    position: '市场专员',
    level: 'P5',
    developmentGoals: [
      '提升数据分析能力',
      '学习SEO/SEM',
      '培养创意策划能力',
    ],
    currentSkills: ['社交媒体', '内容创作', '活动策划'],
    targetSkills: ['数据分析', 'SEO/SEM', '品牌管理', '创意策略'],
    status: 'active',
    startDate: '2024-06-01',
    targetDate: '2025-06-30',
    progress: 40,
    mentor: '市场总监',
    achievements: [],
    metrics: {
      performanceScore: 85,
      potentialScore: 92,
      readiness: 60,
    },
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '技术部',
    position: '后端工程师',
    level: 'P6',
    developmentGoals: [
      '深入掌握分布式系统',
      '提升代码质量',
      '学习系统设计',
    ],
    currentSkills: ['Java', 'Spring', 'MySQL'],
    targetSkills: ['分布式架构', '高并发', '系统设计', 'Redis'],
    status: 'completed',
    startDate: '2023-01-01',
    targetDate: '2024-01-31',
    progress: 100,
    mentor: '技术总监',
    achievements: [
      { id: 'ach-1', title: '通过系统架构师认证', completedDate: '2023-08-15' },
      { id: 'ach-2', title: '主导完成系统性能优化', completedDate: '2023-12-01' },
    ],
    metrics: {
      performanceScore: 95,
      potentialScore: 85,
      readiness: 100,
    },
  },
];

const LEVEL_CONFIG = {
  'P5': { label: 'P5 - 初级', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' },
  'P6': { label: 'P6 - 中级', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' },
  'P7': { label: 'P7 - 高级', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  'P8': { label: 'P8 - 专家', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400' },
  'P9': { label: 'P9 - 架构师', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
};

const STATUS_CONFIG = {
  active: {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  'on-hold': {
    label: '暂停',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

export default function TalentPlansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤人才计划
  const filteredPlans = useMemo(() => {
    let plans = TALENT_PLANS_DATA;

    // 按级别过滤
    if (levelFilter !== 'all') {
      plans = plans.filter(p => p.level === levelFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      plans = plans.filter(p => p.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      plans = plans.filter(p =>
        p.employeeName.toLowerCase().includes(query) ||
        p.employeeId.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query)
      );
    }

    return plans;
  }, [searchQuery, levelFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: TALENT_PLANS_DATA.length,
      active: TALENT_PLANS_DATA.filter(p => p.status === 'active').length,
      completed: TALENT_PLANS_DATA.filter(p => p.status === 'completed').length,
      avgProgress: TALENT_PLANS_DATA.filter(p => p.status === 'active')
        .reduce((sum, p) => sum + p.progress, 0) / TALENT_PLANS_DATA.filter(p => p.status === 'active').length || 0,
      highPotential: TALENT_PLANS_DATA.filter(p => p.metrics.potentialScore >= 90).length,
    };
  }, []);

  // 获取所有级别
  const levels = useMemo(() => {
    return Array.from(new Set(TALENT_PLANS_DATA.map(plan => plan.level)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            发展计划
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            人才发展规划与能力提升跟踪
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          创建发展计划
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>发展计划总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              进行中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              高潜人才
            </CardDescription>
            <CardTitle className="text-3xl">{stats.highPotential}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均完成度</CardDescription>
            <CardTitle className="text-3xl">{stats.avgProgress.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 发展计划列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>发展计划列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  {Object.entries(LEVEL_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm-w-36">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无发展计划
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有发展计划
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const levelConfig = LEVEL_CONFIG[plan.level as keyof typeof LEVEL_CONFIG];
                const statusConfig = STATUS_CONFIG[plan.status];

                return (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={levelConfig?.color}>
                            {levelConfig?.label}
                          </Badge>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          {plan.metrics.potentialScore >= 90 && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Zap className="h-3 w-3 mr-1" />
                              高潜
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {plan.employeeName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{plan.employeeName}</CardTitle>
                          <CardDescription>
                            {plan.department} · {plan.position}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 进度 */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">发展进度</span>
                          <span className="font-medium">{plan.progress}%</span>
                        </div>
                        <Progress value={plan.progress} className="h-2" />
                      </div>

                      {/* 九宫格指标 */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {plan.metrics.performanceScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">绩效分</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {plan.metrics.potentialScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">潜质分</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                          <div className={`text-2xl font-bold ${
                            plan.metrics.readiness >= 80 ? 'text-green-600' :
                            plan.metrics.readiness >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {plan.metrics.readiness}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">就绪度</div>
                        </div>
                      </div>

                      {/* 发展目标 */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          发展目标
                        </h4>
                        <div className="space-y-1">
                          {plan.developmentGoals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 成就 */}
                      {plan.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            已达成成就
                          </h4>
                          <div className="space-y-1">
                            {plan.achievements.map((achievement) => (
                              <div key={achievement.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                <span>{achievement.title}</span>
                                <span className="text-xs text-gray-500">
                                  ({achievement.completedDate})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 导师和时间 */}
                      <div className="flex items-center justify-between pt-3 border-t text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>导师: {plan.mentor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{plan.targetDate}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {plan.status === 'active' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            更新
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
