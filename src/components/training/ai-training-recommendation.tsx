"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  Star,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  PlayCircle,
  Filter,
  Search,
  Download,
  Share,
  Calendar,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 员工能力画像
export interface EmployeeProfile {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  skills: {
    name: string;
    level: number; // 0-100
    category: 'technical' | 'soft' | 'leadership';
  }[];
  performanceScore: number;
  learningGoals: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  careerPath: string;
  skillGaps: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
  }[];
}

// 培训课程
export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 小时
  format: 'online' | 'offline' | 'hybrid';
  price?: number;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  completionRate: number;
  skills: string[];
  prerequisites: string[];
  instructor: string;
  tags: string[];
  coverUrl?: string;
}

// 学习路径
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  estimatedDuration: number; // 天数
  difficulty: 'easy' | 'medium' | 'hard';
  courses: {
    courseId: string;
    order: number;
    isRequired: boolean;
    estimatedHours: number;
  }[];
  milestones: {
    name: string;
    courseId: string;
    skills: string[];
  }[];
  popularity: number;
  successRate: number;
}

// AI推荐结果
export interface AIRecommendation {
  employeeProfile: EmployeeProfile;
  recommendedCourses: {
    course: TrainingCourse;
    matchScore: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: {
      skill: string;
      improvement: number;
    }[];
  }[];
  recommendedPaths: {
    path: LearningPath;
    matchScore: number;
    reason: string;
    fitPercentage: number;
  }[];
  skillGapAnalysis: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    recommendedCourses: string[];
    priority: number;
  }[];
  personalizedInsights: string[];
  learningTips: string[];
  confidenceScore: number;
  generatedAt: Date;
}

interface AITrainingRecommendationProps {
  employeeProfile: EmployeeProfile;
  availableCourses: TrainingCourse[];
  availablePaths: LearningPath[];
  onStartCourse?: (courseId: string) => void;
  onEnrollPath?: (pathId: string) => void;
}

// 模拟数据
const MOCK_EMPLOYEE_PROFILE: EmployeeProfile = {
  id: 'emp001',
  name: '张三',
  avatar: undefined,
  department: '技术部',
  position: '前端工程师',
  skills: [
    { name: 'JavaScript', level: 85, category: 'technical' },
    { name: 'React', level: 80, category: 'technical' },
    { name: 'TypeScript', level: 70, category: 'technical' },
    { name: '团队协作', level: 75, category: 'soft' },
    { name: '项目管理', level: 60, category: 'leadership' },
  ],
  performanceScore: 82,
  learningGoals: ['提升领导力', '掌握高级前端技术', '学习架构设计'],
  learningStyle: 'visual',
  careerPath: '高级前端工程师 → 技术主管 → 技术总监',
  skillGaps: [
    { skill: '架构设计', currentLevel: 55, targetLevel: 80, gap: 25 },
    { skill: '团队管理', currentLevel: 60, targetLevel: 85, gap: 25 },
    { skill: '性能优化', currentLevel: 65, targetLevel: 85, gap: 20 },
  ],
};

const MOCK_COURSES: TrainingCourse[] = [
  {
    id: 'c1',
    title: 'React高级模式与架构设计',
    description: '深入理解React架构原理，掌握高级模式',
    category: '技术',
    level: 'advanced',
    duration: 12,
    format: 'online',
    rating: 4.8,
    reviewCount: 234,
    enrolledCount: 1250,
    completionRate: 78,
    skills: ['React', '架构设计', '性能优化'],
    prerequisites: ['React基础', 'JavaScript高级'],
    instructor: '李专家',
    tags: ['前端', '架构', 'React'],
  },
  {
    id: 'c2',
    title: '团队领导力培养',
    description: '提升团队管理能力，成为优秀的技术主管',
    category: '管理',
    level: 'intermediate',
    duration: 8,
    format: 'hybrid',
    rating: 4.7,
    reviewCount: 189,
    enrolledCount: 890,
    completionRate: 82,
    skills: ['团队管理', '领导力', '沟通'],
    prerequisites: ['团队协作'],
    instructor: '王总监',
    tags: ['管理', '领导力', '团队'],
  },
  {
    id: 'c3',
    title: '前端性能优化实战',
    description: '全面提升前端应用性能，掌握优化技巧',
    category: '技术',
    level: 'intermediate',
    duration: 10,
    format: 'online',
    rating: 4.9,
    reviewCount: 312,
    enrolledCount: 1560,
    completionRate: 85,
    skills: ['性能优化', 'JavaScript', 'Web'],
    prerequisites: ['JavaScript高级'],
    instructor: '张架构师',
    tags: ['前端', '性能', '优化'],
  },
  {
    id: 'c4',
    title: 'TypeScript深度应用',
    description: '从基础到高级，全面掌握TypeScript',
    category: '技术',
    level: 'intermediate',
    duration: 15,
    format: 'online',
    rating: 4.6,
    reviewCount: 278,
    enrolledCount: 1340,
    completionRate: 80,
    skills: ['TypeScript', 'JavaScript'],
    prerequisites: ['JavaScript基础'],
    instructor: '赵专家',
    tags: ['前端', 'TypeScript', 'JavaScript'],
  },
];

const MOCK_PATHS: LearningPath[] = [
  {
    id: 'p1',
    name: '高级前端工程师进阶路径',
    description: '从初级到高级前端工程师的完整学习路径',
    targetRole: '高级前端工程师',
    estimatedDuration: 60,
    difficulty: 'hard',
    courses: [
      { courseId: 'c4', order: 1, isRequired: true, estimatedHours: 15 },
      { courseId: 'c3', order: 2, isRequired: true, estimatedHours: 10 },
      { courseId: 'c1', order: 3, isRequired: true, estimatedHours: 12 },
    ],
    milestones: [
      { name: 'TypeScript精通', courseId: 'c4', skills: ['TypeScript', '类型系统'] },
      { name: '性能优化专家', courseId: 'c3', skills: ['性能优化', 'Web性能'] },
      { name: '架构设计能力', courseId: 'c1', skills: ['架构设计', '设计模式'] },
    ],
    popularity: 85,
    successRate: 78,
  },
];

export default function AITrainingRecommendation({
  employeeProfile = MOCK_EMPLOYEE_PROFILE,
  availableCourses = MOCK_COURSES,
  availablePaths = MOCK_PATHS,
  onStartCourse,
  onEnrollPath,
}: AITrainingRecommendationProps) {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟AI推荐结果
  const recommendation: AIRecommendation = useMemo(() => ({
    employeeProfile,
    recommendedCourses: availableCourses.map(course => ({
      course,
      matchScore: Math.floor(Math.random() * 30) + 70,
      reason: `该课程可以帮助提升${course.skills[0]}能力,弥补当前技能短板`,
      priority: (Math.random() > 0.5 ? 'high' : 'medium') as 'high' | 'medium',
      expectedImpact: course.skills.map(skill => ({
        skill,
        improvement: Math.floor(Math.random() * 20) + 10,
      })),
    })).sort((a, b) => b.matchScore - a.matchScore),
    recommendedPaths: availablePaths.map(path => ({
      path,
      matchScore: Math.floor(Math.random() * 20) + 80,
      reason: `该学习路径与员工职业目标高度匹配`,
      fitPercentage: Math.floor(Math.random() * 20) + 80,
    })),
    skillGapAnalysis: employeeProfile.skillGaps.map(gap => ({
      ...gap,
      recommendedCourses: availableCourses
        .filter(c => c.skills.some(s => s.includes(gap.skill)))
        .slice(0, 2)
        .map(c => c.id),
      priority: Math.floor(Math.random() * 5) + 1,
    })).sort((a, b) => b.gap - a.gap),
    personalizedInsights: [
      '你的JavaScript和React能力很强,建议向架构设计方向发展',
      '团队管理能力需要提升,可以通过领导力课程快速提升',
      '学习风格偏向视觉型,建议多观看视频教程和图示说明的课程',
    ],
    learningTips: [
      '建议每周投入8-10小时进行学习',
      '学习完每个课程后要进行实战练习',
      '定期复习之前学过的知识',
      '参与课程社区讨论,与同学交流学习心得',
    ],
    confidenceScore: 87,
    generatedAt: new Date(),
  }), [employeeProfile, availableCourses, availablePaths]);

  // 过滤课程
  const filteredCourses = useMemo(() => {
    return recommendation.recommendedCourses.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.course.category === selectedCategory;
      const searchMatch =
        searchQuery === '' ||
        item.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [recommendation.recommendedCourses, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 员工画像概览 */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage src={employeeProfile.avatar} />
                <AvatarFallback className="text-2xl">
                  {employeeProfile.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{employeeProfile.name}</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {employeeProfile.position}
                  </Badge>
                </div>
                <p className="text-white/80 mb-3">
                  {employeeProfile.department} | 绩效评分: {employeeProfile.performanceScore}分
                </p>

                <div className="flex flex-wrap gap-2">
                  {employeeProfile.skills.slice(0, 4).map((skill, idx) => (
                    <div key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-white/70 ml-1">{skill.level}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-5 w-5" />
                  <span className="font-medium">AI匹配度</span>
                </div>
                <p className="text-3xl font-bold">{recommendation.confidenceScore}%</p>
              </div>
            </div>

            {/* 职业路径 */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              <span className="text-white/70">职业路径:</span>
              <span className="font-medium">{employeeProfile.careerPath}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">AI推荐</TabsTrigger>
            <TabsTrigger value="paths">学习路径</TabsTrigger>
            <TabsTrigger value="gaps">技能差距</TabsTrigger>
            <TabsTrigger value="insights">AI洞察</TabsTrigger>
          </TabsList>

          {/* AI推荐课程 */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* 过滤器 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索课程..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', '技术', '管理', '业务'].map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === 'all' ? '全部' : category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 课程列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((item, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.course.coverUrl && (
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-500" />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{item.course.category}</Badge>
                      <Badge
                        variant={item.priority === 'high' ? 'default' : 'secondary'}
                        className={item.priority === 'high' ? 'bg-orange-500' : ''}
                      >
                        {item.priority === 'high' ? '高优先' : '中优先'}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">{item.course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Progress value={item.matchScore} className="flex-1" />
                      <span className="text-sm font-medium">{item.matchScore}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{item.course.duration}小时</span>
                      <Users className="h-4 w-4 ml-2" />
                      <span>{item.course.enrolledCount}人已学</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="font-medium">{item.course.rating}</span>
                      <span className="text-sm text-muted-foreground">({item.course.reviewCount}评价)</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{item.reason}</p>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => onStartCourse?.(item.course.id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        开始学习
                      </Button>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 学习路径 */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendation.recommendedPaths.map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.path.name}</CardTitle>
                      <Badge variant="outline">{item.fitPercentage}%匹配</Badge>
                    </div>
                    <CardDescription>{item.path.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{item.path.estimatedDuration}天</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>成功率 {item.path.successRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>热度 {item.path.popularity}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">包含课程 ({item.path.courses.length})</p>
                      <div className="space-y-2">
                        {item.path.courses.map((courseItem, cidx) => {
                          const course = availableCourses.find(c => c.id === courseItem.courseId);
                          return (
                            <div key={cidx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                              <Badge variant="outline" className="text-xs">{courseItem.order}</Badge>
                              <span className="text-sm flex-1">{course?.title}</span>
                              {courseItem.isRequired && (
                                <Badge variant="secondary" className="text-xs">必修</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{courseItem.estimatedHours}h</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => onEnrollPath?.(item.path.id)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      加入学习路径
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 技能差距分析 */}
          <TabsContent value="gaps" className="space-y-6">
            <div className="grid gap-6">
              {recommendation.skillGapAnalysis.map((gap, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{gap.skill}</h4>
                          <Badge variant={gap.priority >= 4 ? 'destructive' : gap.priority >= 2 ? 'default' : 'secondary'}>
                            优先级 {gap.priority}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">当前水平</span>
                              <span>{gap.currentLevel}%</span>
                            </div>
                            <Progress value={gap.currentLevel} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">目标水平</span>
                              <span>{gap.targetLevel}%</span>
                            </div>
                            <Progress value={gap.targetLevel} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <span className="text-sm font-medium">技能差距</span>
                            <span className="text-lg font-bold text-blue-600">+{gap.gap}%</span>
                          </div>
                        </div>

                        {gap.recommendedCourses.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">推荐课程</p>
                            <div className="flex flex-wrap gap-2">
                              {gap.recommendedCourses.map(courseId => {
                                const course = availableCourses.find(c => c.id === courseId);
                                return course ? (
                                  <Badge key={courseId} variant="outline">
                                    {course.title}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => {
                          gap.recommendedCourses.forEach(courseId => onStartCourse?.(courseId));
                        }}>
                          开始学习
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI洞察 */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 个性化洞察 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    个性化洞察
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recommendation.personalizedInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 学习建议 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    学习建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recommendation.learningTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 综合分析 */}
            <Card>
              <CardHeader>
                <CardTitle>综合分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold">优势技能</p>
                    <p className="text-sm text-muted-foreground">JavaScript, React</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-2">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="font-semibold">待提升技能</p>
                    <p className="text-sm text-muted-foreground">架构设计, 团队管理</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-2">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="font-semibold">学习重点</p>
                    <p className="text-sm text-muted-foreground">架构 + 管理双轨发展</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
