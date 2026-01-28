'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Target,
  Award,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface EffectivenessMetrics {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageScore: number;
  satisfactionRate: number;
  avgLearningTime: string;
  certificateIssued: number;
  improvementRate: number;
}

interface CourseEffectiveness {
  id: string;
  courseTitle: string;
  category: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  avgScore: number;
  satisfaction: number;
  avgTimeSpent: string;
  skillImprovement: string;
}

interface DepartmentEffectiveness {
  id: string;
  departmentName: string;
  employeeCount: number;
  totalHours: number;
  avgCompletionRate: number;
  avgScore: number;
  topCourse: string;
  areasForImprovement: string[];
}

// 模拟培训效果数据
const EFFECTIVENESS_METRICS: EffectivenessMetrics = {
  totalCourses: 15,
  totalEnrollments: 245,
  completionRate: 78.5,
  averageScore: 85.2,
  satisfactionRate: 92.3,
  avgLearningTime: '4.2小时',
  certificateIssued: 192,
  improvementRate: 12.5,
};

const COURSE_EFFECTIVENESS_DATA: CourseEffectiveness[] = [
  {
    id: '1',
    courseTitle: '新员工入职引导 - 企业文化篇',
    category: '入职培训',
    enrollments: 95,
    completions: 92,
    completionRate: 96.8,
    avgScore: 92.5,
    satisfaction: 95.0,
    avgTimeSpent: '45分钟',
    skillImprovement: '+15%',
  },
  {
    id: '2',
    courseTitle: '高效销售技巧与客户沟通',
    category: '技能培训',
    enrollments: 28,
    completions: 18,
    completionRate: 64.3,
    avgScore: 88.3,
    satisfaction: 90.5,
    avgTimeSpent: '2.8小时',
    skillImprovement: '+22%',
  },
  {
    id: '3',
    courseTitle: '中高层领导力修炼',
    category: '管理培训',
    enrollments: 15,
    completions: 0,
    completionRate: 0,
    avgScore: 0,
    satisfaction: 0,
    avgTimeSpent: '-',
    skillImprovement: '-',
  },
  {
    id: '4',
    courseTitle: '劳动法律法规实务',
    category: '合规培训',
    enrollments: 90,
    completions: 85,
    completionRate: 94.4,
    avgScore: 86.2,
    satisfaction: 88.5,
    avgTimeSpent: '1.5小时',
    skillImprovement: '+18%',
  },
  {
    id: '5',
    courseTitle: 'React前端开发进阶',
    category: '技能培训',
    enrollments: 22,
    completions: 12,
    completionRate: 54.5,
    avgScore: 91.8,
    satisfaction: 93.2,
    avgTimeSpent: '7.5小时',
    skillImprovement: '+28%',
  },
];

const DEPARTMENT_EFFECTIVENESS_DATA: DepartmentEffectiveness[] = [
  {
    id: '1',
    departmentName: '销售部',
    employeeCount: 45,
    totalHours: 180,
    avgCompletionRate: 82.3,
    avgScore: 87.5,
    topCourse: '高效销售技巧与客户沟通',
    areasForImprovement: ['产品知识', '谈判技巧'],
  },
  {
    id: '2',
    departmentName: '技术部',
    employeeCount: 35,
    totalHours: 280,
    avgCompletionRate: 75.5,
    avgScore: 89.2,
    topCourse: 'React前端开发进阶',
    areasForImprovement: ['项目管理', '团队协作'],
  },
  {
    id: '3',
    departmentName: '市场部',
    employeeCount: 20,
    totalHours: 120,
    avgCompletionRate: 90.0,
    avgScore: 84.5,
    topCourse: '新员工入职引导',
    areasForImprovement: ['数据分析', '营销策略'],
  },
  {
    id: '4',
    departmentName: '人力资源部',
    employeeCount: 12,
    totalHours: 60,
    avgCompletionRate: 95.0,
    avgScore: 90.5,
    topCourse: '劳动法律法规实务',
    areasForImprovement: ['业务理解'],
  },
];

const TREND_DATA = [
  { month: '8月', enrollments: 45, completion: 38, satisfaction: 88 },
  { month: '9月', enrollments: 52, completion: 44, satisfaction: 90 },
  { month: '10月', enrollments: 48, completion: 40, satisfaction: 89 },
  { month: '11月', enrollments: 55, completion: 48, satisfaction: 91 },
  { month: '12月', enrollments: 60, completion: 52, satisfaction: 92 },
  { month: '1月', enrollments: 62, completion: 56, satisfaction: 93 },
];

export default function TrainingEffectivenessPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            培训效果评估
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            分析培训投入产出和员工技能提升效果
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出报告
        </Button>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>培训完成率</CardDescription>
            <CardTitle className="text-3xl">{EFFECTIVENESS_METRICS.completionRate}%</CardTitle>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>较上月提升 5.2%</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均成绩</CardDescription>
            <CardTitle className="text-3xl">{EFFECTIVENESS_METRICS.averageScore}</CardTitle>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>较上月提升 2.3分</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>满意度</CardDescription>
            <CardTitle className="text-3xl">{EFFECTIVENESS_METRICS.satisfactionRate}%</CardTitle>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>较上月提升 1.8%</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>技能提升率</CardDescription>
            <CardTitle className="text-3xl">{EFFECTIVENESS_METRICS.improvementRate}%</CardTitle>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>培训效果显著</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="courses">课程效果</TabsTrigger>
          <TabsTrigger value="departments">部门效果</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
        </TabsList>

        {/* 课程效果 */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>课程培训效果排名</CardTitle>
              <CardDescription>
                各课程的参与率、完成率、成绩和满意度分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {COURSE_EFFECTIVENESS_DATA.map((course, index) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 排名 */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {index + 1}
                        </div>

                        {/* 课程信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {course.courseTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Badge variant="outline">{course.category}</Badge>
                            <Users className="h-3.5 w-3.5" />
                            <span>{course.enrollments}人参与</span>
                          </div>
                        </div>

                        {/* 指标数据 */}
                        <div className="grid grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {course.completionRate}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">完成率</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {course.avgScore}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">平均分</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {course.satisfaction}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">满意度</div>
                          </div>

                          <div className="text-center">
                            <div className={`text-2xl font-bold ${course.skillImprovement !== '-' ? 'text-green-600' : 'text-gray-400'}`}>
                              {course.skillImprovement}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">技能提升</div>
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="w-48">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">进度</span>
                            <span className="font-medium">{course.completionRate}%</span>
                          </div>
                          <Progress value={course.completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 部门效果 */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>部门培训效果对比</CardTitle>
              <CardDescription>
                各部门的培训参与度、完成率和效果分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPARTMENT_EFFECTIVENESS_DATA.map((dept) => (
                  <Card key={dept.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{dept.departmentName}</CardTitle>
                        <Badge variant="outline">{dept.employeeCount}人</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 核心指标 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            平均完成率
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {dept.avgCompletionRate}%
                          </div>
                          <Progress value={dept.avgCompletionRate} className="h-2 mt-1" />
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            平均成绩
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {dept.avgScore}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Award className="h-3.5 w-3.5 text-yellow-500" />
                            <span>优秀</span>
                          </div>
                        </div>
                      </div>

                      {/* 学习时长 */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          总学习时长
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {dept.totalHours}小时
                        </span>
                      </div>

                      {/* 最佳课程 */}
                      <div className="pt-2 border-t">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          最佳课程
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {dept.topCourse}
                        </div>
                      </div>

                      {/* 待改进领域 */}
                      <div className="pt-2 border-t">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          待改进领域
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dept.areasForImprovement.map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 趋势分析 */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>培训趋势分析</CardTitle>
              <CardDescription>
                近6个月的培训参与、完成和满意度趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 简化的趋势展示 */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    月度培训参与趋势
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {TREND_DATA.map((data) => (
                      <div key={data.month} className="text-center">
                        <div
                          className="h-32 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                          style={{
                            height: `${(data.enrollments / 70) * 100}%`,
                          }}
                        />
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {data.month}
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {data.enrollments}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>平均参与人数</CardDescription>
                      <CardTitle className="text-3xl">
                        {Math.round(TREND_DATA.reduce((sum, d) => sum + d.enrollments, 0) / TREND_DATA.length)}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>持续增长</span>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>平均完成人数</CardDescription>
                      <CardTitle className="text-3xl">
                        {Math.round(TREND_DATA.reduce((sum, d) => sum + d.completion, 0) / TREND_DATA.length)}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>稳定提升</span>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>平均满意度</CardDescription>
                      <CardTitle className="text-3xl">
                        {Math.round(TREND_DATA.reduce((sum, d) => sum + d.satisfaction, 0) / TREND_DATA.length)}%
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>逐步改善</span>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
