'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Star,
  MessageSquare,
  Award,
  Target,
  CheckCircle,
  BarChart3,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  ThumbsUp,
  ThumbsDown,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseEvaluation {
  id: string;
  courseId: string;
  courseName: string;
  courseCategory: string;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  satisfactionRate: number;
  knowledgeGainRate: number;
  skillImproveRate: number;
  recommendations: string[];
  commonFeedback: {
    positive: string[];
    negative: string[];
    suggestions: string[];
  };
  roi: {
    totalInvestment: number;
    estimatedBenefit: number;
    benefitParticipants: number;
    roiPercentage: number;
  };
}

interface Review {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  courseId: string;
  courseName: string;
  rating: number;
  completionDate: string;
  content: string;
  pros: string[];
  cons: string[];
  suggestions: string;
  wouldRecommend: boolean;
  helpfulCount: number;
}

export default function TrainingEffectivenessPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const [courseEvaluations, setCourseEvaluations] = useState<CourseEvaluation[]>([
    {
      id: '1',
      courseId: '1',
      courseName: '新员工入职培训',
      courseCategory: '入职培训',
      averageRating: 4.7,
      totalReviews: 45,
      completionRate: 78,
      satisfactionRate: 85,
      knowledgeGainRate: 82,
      skillImproveRate: 78,
      recommendations: ['内容清晰实用', '帮助快速融入', '建议增加更多实操'],
      commonFeedback: {
        positive: ['内容结构清晰', '讲师专业', '互动性好'],
        negative: ['部分内容过于简单', '时间安排紧张'],
        suggestions: ['增加案例分享', '延长答疑时间'],
      },
      roi: {
        totalInvestment: 50000,
        estimatedBenefit: 150000,
        benefitParticipants: 98,
        roiPercentage: 200,
      },
    },
    {
      id: '2',
      courseId: '2',
      courseName: '领导力提升课程',
      courseCategory: '管理培训',
      averageRating: 4.9,
      totalReviews: 32,
      completionRate: 84,
      satisfactionRate: 92,
      knowledgeGainRate: 88,
      skillImproveRate: 85,
      recommendations: ['实战性强', '老师经验丰富', '值得推荐'],
      commonFeedback: {
        positive: ['实战案例丰富', '老师经验丰富', '互动讨论深入'],
        negative: ['课程周期较长', '需要更多练习机会'],
        suggestions: ['增加线上辅导', '提供学习资料'],
      },
      roi: {
        totalInvestment: 120000,
        estimatedBenefit: 360000,
        benefitParticipants: 38,
        roiPercentage: 200,
      },
    },
    {
      id: '3',
      courseId: '3',
      courseName: 'Excel高级应用培训',
      courseCategory: '技能培训',
      averageRating: 4.5,
      totalReviews: 28,
      completionRate: 67,
      satisfactionRate: 80,
      knowledgeGainRate: 85,
      skillImproveRate: 78,
      recommendations: ['实用性强', '学到很多技巧', '建议多练习'],
      commonFeedback: {
        positive: ['技巧实用', '老师讲解清晰', '案例贴近工作'],
        negative: ['进度较快', '基础不够扎实的学员吃力'],
        suggestions: ['增加课后练习', '提供录播回放'],
      },
      roi: {
        totalInvestment: 30000,
        estimatedBenefit: 90000,
        benefitParticipants: 52,
        roiPercentage: 200,
      },
    },
  ]);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      courseId: '1',
      courseName: '新员工入职培训',
      rating: 5,
      completionDate: '2024-01-18',
      content: '课程内容非常实用，帮助我快速了解了公司文化和工作流程。',
      pros: ['内容结构清晰', '讲师专业', '互动性好'],
      cons: ['部分内容可以更深入'],
      suggestions: '建议增加更多实操环节',
      wouldRecommend: true,
      helpfulCount: 15,
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '销售部',
      courseId: '2',
      courseName: '领导力提升课程',
      rating: 5,
      completionDate: '2024-03-28',
      content: '通过这个课程，我对团队管理有了全新的认识，实战案例非常精彩。',
      pros: ['实战案例丰富', '老师经验丰富', '互动讨论深入'],
      cons: ['课程周期较长'],
      suggestions: '希望能有后续的进阶课程',
      wouldRecommend: true,
      helpfulCount: 20,
    },
    {
      id: '3',
      employeeId: 'EMP004',
      employeeName: '赵六',
      department: '市场部',
      courseId: '3',
      courseName: 'Excel高级应用培训',
      rating: 4,
      completionDate: '2024-10-15',
      content: '课程很实用，学到了很多平时没注意的技巧。',
      pros: ['技巧实用', '老师讲解清晰'],
      cons: ['进度有点快'],
      suggestions: '希望能提供录播回放，方便复习',
      wouldRecommend: true,
      helpfulCount: 12,
    },
  ]);

  const stats = {
    totalCourses: courseEvaluations.length,
    averageRating: (courseEvaluations.reduce((sum, c) => sum + c.averageRating, 0) / courseEvaluations.length).toFixed(1),
    totalReviews: courseEvaluations.reduce((sum, c) => sum + c.totalReviews, 0),
    avgCompletionRate: Math.round(courseEvaluations.reduce((sum, c) => sum + c.completionRate, 0) / courseEvaluations.length),
    avgSatisfactionRate: Math.round(courseEvaluations.reduce((sum, c) => sum + c.satisfactionRate, 0) / courseEvaluations.length),
    totalInvestment: courseEvaluations.reduce((sum, c) => sum + c.roi.totalInvestment, 0),
    estimatedBenefit: courseEvaluations.reduce((sum, c) => sum + c.roi.estimatedBenefit, 0),
    avgRoi: Math.round(
      courseEvaluations.reduce((sum, c) => sum + c.roi.roiPercentage, 0) / courseEvaluations.length
    ),
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              培训效果评估
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              全面评估培训效果，持续优化培训质量
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              生成分析
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均评分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <Star className="h-6 w-6 fill-current" />
                {stats.averageRating}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <MessageSquare className="h-3 w-3 mr-1" />
                {stats.totalReviews}条评价
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">完成率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgCompletionRate}%</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                平均完成率
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">满意度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgSatisfactionRate}%</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <ThumbsUp className="h-3 w-3 mr-1" />
                平均满意度
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">知识获取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(courseEvaluations.reduce((sum, c) => sum + c.knowledgeGainRate, 0) / courseEvaluations.length)}%
              </div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Target className="h-3 w-3 mr-1" />
                知识掌握度
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">技能提升</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round(courseEvaluations.reduce((sum, c) => sum + c.skillImproveRate, 0) / courseEvaluations.length)}%
              </div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                技能改善率
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">投资回报</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.avgRoi}%</div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
                <DollarSign className="h-3 w-3 mr-1" />
                平均ROI
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              效果概览
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              学员评价
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ROI分析
            </TabsTrigger>
          </TabsList>

          {/* 效果概览 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {evaluation.courseName}
                          </h3>
                          <Badge variant="outline">{evaluation.courseCategory}</Badge>
                        </div>
                        {renderStars(evaluation.averageRating)}
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {evaluation.totalReviews}条评价
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">完成率</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {evaluation.completionRate}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">满意度</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {evaluation.satisfactionRate}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">知识获取</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {evaluation.knowledgeGainRate}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">技能提升</div>
                        <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                          {evaluation.skillImproveRate}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">正面反馈</div>
                        <div className="flex flex-wrap gap-1">
                          {evaluation.commonFeedback.positive.slice(0, 2).map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">改进建议</div>
                        <div className="flex flex-wrap gap-1">
                          {evaluation.commonFeedback.suggestions.slice(0, 2).map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 学员评价 */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>学员评价详情</CardTitle>
                <CardDescription>查看所有学员的课程评价和反馈</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {review.employeeName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{review.employeeName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {review.department} · {review.completionDate}
                                </div>
                              </div>
                              {renderStars(review.rating)}
                            </div>
                            <div className="mb-3">
                              <Badge variant="outline">{review.courseName}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                              {review.content}
                            </p>
                            <div className="grid md:grid-cols-2 gap-3 mb-3">
                              {review.pros.length > 0 && (
                                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                  <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-2">
                                    优点
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {review.pros.map((item, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {review.cons.length > 0 && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                  <div className="text-xs text-orange-700 dark:text-orange-300 font-medium mb-2">
                                    不足
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {review.cons.map((item, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {review.suggestions && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                                  建议
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{review.suggestions}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                {review.wouldRecommend ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    推荐
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    不推荐
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {review.helpfulCount}人觉得有帮助
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI分析 */}
          <TabsContent value="roi" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>投资回报概览</CardTitle>
                  <CardDescription>培训投资与收益分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">总投资</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ¥{(stats.totalInvestment / 10000).toFixed(0)}万
                          </div>
                        </div>
                        <DollarSign className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">预估收益</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ¥{(stats.estimatedBenefit / 10000).toFixed(0)}万
                          </div>
                        </div>
                        <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">平均ROI</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.avgRoi}%
                          </div>
                        </div>
                        <Award className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>课程ROI详情</CardTitle>
                  <CardDescription>各课程投资回报分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="p-4 border rounded-lg dark:border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{evaluation.courseName}</h4>
                            <Badge variant="outline" className="text-xs mt-1">{evaluation.courseCategory}</Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ROI {evaluation.roi.roiPercentage}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">投资</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ¥{(evaluation.roi.totalInvestment / 10000).toFixed(1)}万
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">收益</span>
                            <div className="font-medium text-green-600 dark:text-green-400">
                              ¥{(evaluation.roi.estimatedBenefit / 10000).toFixed(1)}万
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">受益人数</span>
                            <div className="font-medium text-blue-600 dark:text-blue-400">
                              {evaluation.roi.benefitParticipants}人
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
