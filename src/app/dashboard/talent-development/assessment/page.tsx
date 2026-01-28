'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  ClipboardCheck,
  TrendingUp,
  Target,
  Award,
  Star,
  Plus,
  Eye,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  BarChart3,
  User,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompetencyScore {
  id: string;
  name: string;
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  description: string;
}

interface Assessment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  level: string;
  assessmentType: string;
  period: string;
  status: 'draft' | 'in-review' | 'completed';
  assessor?: string;
  assessDate?: string;
  overallScore: number;
  maxScore: number;
  ranking?: number;
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  competencies: CompetencyScore[];
  ratingDistribution: {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
  };
}

export default function TalentAssessmentPage() {
  const [activeTab, setActiveTab] = useState('assessments');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      position: '高级工程师',
      level: 'P7',
      assessmentType: '年度评估',
      period: '2024年度',
      status: 'completed',
      assessor: '李总',
      assessDate: '2024-12-10',
      overallScore: 85,
      maxScore: 100,
      ranking: 3,
      strengths: ['技术能力强', '解决问题能力强', '团队协作好'],
      developmentAreas: ['需要提升管理能力', '沟通表达可以更清晰'],
      recommendations: ['参加管理培训', '多参与跨部门项目', '提升演讲能力'],
      competencies: [
        { id: 'c1', name: '技术能力', category: '专业技能', score: 90, maxScore: 100, weight: 30, description: '技术深度和广度' },
        { id: 'c2', name: '问题解决', category: '专业技能', score: 85, maxScore: 100, weight: 25, description: '分析和解决问题的能力' },
        { id: 'c3', name: '团队协作', category: '软技能', score: 88, maxScore: 100, weight: 20, description: '团队合作和沟通能力' },
        { id: 'c4', name: '创新能力', category: '专业技能', score: 80, maxScore: 100, weight: 15, description: '创新思维和技术突破' },
        { id: 'c5', name: '项目管理', category: '管理能力', score: 75, maxScore: 100, weight: 10, description: '项目规划和执行能力' },
      ],
      ratingDistribution: {
        excellent: 2,
        good: 2,
        satisfactory: 1,
        needsImprovement: 0,
      },
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '销售部',
      position: '销售经理',
      level: 'M3',
      assessmentType: '年度评估',
      period: '2024年度',
      status: 'completed',
      assessor: '王总',
      assessDate: '2024-12-08',
      overallScore: 92,
      maxScore: 100,
      ranking: 1,
      strengths: ['业绩突出', '客户关系好', '团队管理能力强'],
      developmentAreas: ['战略思维需提升', '数据分析能力'],
      recommendations: ['参加战略培训', '学习数据分析工具', '培养后备人才'],
      competencies: [
        { id: 'c6', name: '销售能力', category: '专业技能', score: 95, maxScore: 100, weight: 30, description: '销售业绩和市场开拓' },
        { id: 'c7', name: '客户关系', category: '专业技能', score: 92, maxScore: 100, weight: 25, description: '客户维护和关系管理' },
        { id: 'c8', name: '团队管理', category: '管理能力', score: 90, maxScore: 100, weight: 25, description: '团队建设和激励' },
        { id: 'c9', name: '战略思维', category: '管理能力', score: 80, maxScore: 100, weight: 10, description: '战略规划和决策能力' },
        { id: 'c10', name: '数据分析', category: '专业技能', score: 85, maxScore: 100, weight: 10, description: '数据分析和应用' },
      ],
      ratingDistribution: {
        excellent: 3,
        good: 2,
        satisfactory: 0,
        needsImprovement: 0,
      },
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: '王五',
      department: '产品部',
      position: '产品经理',
      level: 'P5',
      assessmentType: '年度评估',
      period: '2024年度',
      status: 'in-review',
      assessor: '张总',
      overallScore: 78,
      maxScore: 100,
      strengths: ['产品感好', '用户研究深入'],
      developmentAreas: ['技术理解需要加强', '项目管理能力'],
      recommendations: ['学习技术基础', '参加项目管理培训'],
      competencies: [
        { id: 'c11', name: '产品规划', category: '专业技能', score: 85, maxScore: 100, weight: 30, description: '产品规划和设计能力' },
        { id: 'c12', name: '用户研究', category: '专业技能', score: 88, maxScore: 100, weight: 25, description: '用户需求分析和研究' },
        { id: 'c13', name: '数据分析', category: '专业技能', score: 80, maxScore: 100, weight: 20, description: '数据驱动产品决策' },
        { id: 'c14', name: '项目管理', category: '管理能力', score: 70, maxScore: 100, weight: 15, description: '项目规划和执行' },
        { id: 'c15', name: '技术理解', category: '专业技能', score: 65, maxScore: 100, weight: 10, description: '技术理解和沟通' },
      ],
      ratingDistribution: {
        excellent: 1,
        good: 2,
        satisfactory: 1,
        needsImprovement: 1,
      },
    },
    {
      id: '4',
      employeeId: 'EMP004',
      employeeName: '赵六',
      department: '市场部',
      position: '市场专员',
      level: 'P4',
      assessmentType: '半年评估',
      period: '2024下半年',
      status: 'draft',
      overallScore: 0,
      maxScore: 100,
      competencies: [],
      ratingDistribution: {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        needsImprovement: 0,
      },
      strengths: [],
      developmentAreas: [],
      recommendations: [],
    },
  ]);

  const [assessmentFormData, setAssessmentFormData] = useState({
    employeeId: '',
    assessmentType: '',
    period: '',
  });

  const stats = {
    totalAssessments: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    inReview: assessments.filter(a => a.status === 'in-review').length,
    draft: assessments.filter(a => a.status === 'draft').length,
    avgScore: assessments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.overallScore, 0) /
      assessments.filter(a => a.status === 'completed').length || 0,
    highPerformers: assessments.filter(a => a.overallScore >= 85).length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      'in-review': { label: '评审中', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">优秀</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">良好</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">合格</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">需改进</Badge>;
  };

  const handleCreateAssessment = () => {
    if (!assessmentFormData.employeeId || !assessmentFormData.assessmentType) {
      toast.error('请填写完整的评估信息');
      return;
    }

    const newAssessment: Assessment = {
      id: Date.now().toString(),
      employeeId: assessmentFormData.employeeId,
      employeeName: '新员工',
      department: '',
      position: '',
      level: '',
      assessmentType: assessmentFormData.assessmentType,
      period: assessmentFormData.period,
      status: 'draft',
      overallScore: 0,
      maxScore: 100,
      competencies: [],
      ratingDistribution: {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        needsImprovement: 0,
      },
      strengths: [],
      developmentAreas: [],
      recommendations: [],
    };

    setAssessments([...assessments, newAssessment]);
    setShowCreateDialog(false);
    setAssessmentFormData({
      employeeId: '',
      assessmentType: '',
      period: '',
    });
    toast.success('评估创建成功');
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesDepartment = selectedDepartment === 'all' || assessment.department === selectedDepartment;
    const matchesPeriod = selectedPeriod === 'all' || assessment.period === selectedPeriod;
    return matchesDepartment && matchesPeriod;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <ClipboardCheck className="h-7 w-7 text-white" />
              </div>
              人才评估
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              全面评估员工能力素质，科学制定人才发展策略
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <Plus className="h-4 w-4 mr-2" />
              创建评估
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">评估总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssessments}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <ClipboardCheck className="h-3 w-3 mr-1" />
                份
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                份
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">评审中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inReview}</div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                份
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">草稿</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                <Filter className="h-3 w-3 mr-1" />
                份
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgScore.toFixed(1)}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Star className="h-3 w-3 mr-1" />
                分
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">高绩效</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highPerformers}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              评估列表
            </TabsTrigger>
            <TabsTrigger value="competencies" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              能力分析
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              排名对比
            </TabsTrigger>
          </TabsList>

          {/* 评估列表 */}
          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>人才评估列表</CardTitle>
                    <CardDescription>查看和管理所有员工评估</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="技术部">技术部</SelectItem>
                        <SelectItem value="产品部">产品部</SelectItem>
                        <SelectItem value="销售部">销售部</SelectItem>
                        <SelectItem value="市场部">市场部</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部周期</SelectItem>
                        <SelectItem value="2024年度">2024年度</SelectItem>
                        <SelectItem value="2024下半年">2024下半年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>部门/职位</TableHead>
                        <TableHead>评估类型</TableHead>
                        <TableHead>周期</TableHead>
                        <TableHead>评估人</TableHead>
                        <TableHead>总分</TableHead>
                        <TableHead>排名</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                                  {assessment.employeeName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{assessment.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{assessment.department}</div>
                              <div className="text-gray-500 dark:text-gray-400">{assessment.position}</div>
                            </div>
                          </TableCell>
                          <TableCell>{assessment.assessmentType}</TableCell>
                          <TableCell>{assessment.period}</TableCell>
                          <TableCell>{assessment.assessor || '-'}</TableCell>
                          <TableCell>
                            {assessment.overallScore > 0 ? (
                              <div className={`font-bold ${getScoreColor(assessment.overallScore, assessment.maxScore)}`}>
                                {assessment.overallScore}/{assessment.maxScore}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {assessment.ranking ? (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                第{assessment.ranking}名
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 能力分析 */}
          <TabsContent value="competencies" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {assessments.filter(a => a.status === 'completed').map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                            {assessment.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{assessment.employeeName}</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {assessment.department} · {assessment.position}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(assessment.overallScore, assessment.maxScore)}`}>
                          {assessment.overallScore}
                        </div>
                        {getScoreBadge(assessment.overallScore, assessment.maxScore)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {assessment.competencies.map((competency) => (
                        <div key={competency.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {competency.name}
                            </span>
                            <span className={`text-sm font-medium ${getScoreColor(competency.score, competency.maxScore)}`}>
                              {competency.score}/{competency.maxScore}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (competency.score / competency.maxScore) >= 0.9
                                  ? 'bg-green-500'
                                  : (competency.score / competency.maxScore) >= 0.8
                                  ? 'bg-blue-500'
                                  : (competency.score / competency.maxScore) >= 0.7
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${(competency.score / competency.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {assessment.strengths.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg mb-3">
                        <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-2">优势</div>
                        <div className="flex flex-wrap gap-1">
                          {assessment.strengths.map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {assessment.developmentAreas.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <div className="text-xs text-orange-700 dark:text-orange-300 font-medium mb-2">发展领域</div>
                        <div className="flex flex-wrap gap-1">
                          {assessment.developmentAreas.map((item, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 排名对比 */}
          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>评估排名</CardTitle>
                <CardDescription>各部门人才评估分数排名</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments
                    .filter(a => a.status === 'completed')
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .map((assessment, idx) => (
                      <div key={assessment.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex-shrink-0">
                          {idx === 0 ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                              {idx + 1}
                            </div>
                          ) : idx === 1 ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold">
                              {idx + 1}
                            </div>
                          ) : idx === 2 ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white font-bold">
                              {idx + 1}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                            {assessment.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{assessment.employeeName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {assessment.department} · {assessment.position}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(assessment.overallScore, assessment.maxScore)}`}>
                            {assessment.overallScore}
                          </div>
                          {getScoreBadge(assessment.overallScore, assessment.maxScore)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建评估对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建人才评估</DialogTitle>
              <DialogDescription>
                发起新的员工能力评估
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">选择员工 *</Label>
                <Select value={assessmentFormData.employeeId} onValueChange={(v) => setAssessmentFormData({ ...assessmentFormData, employeeId: v })}>
                  <SelectTrigger id="employeeId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMP001">张三 - 技术部</SelectItem>
                    <SelectItem value="EMP002">李四 - 销售部</SelectItem>
                    <SelectItem value="EMP003">王五 - 产品部</SelectItem>
                    <SelectItem value="EMP004">赵六 - 市场部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentType">评估类型 *</Label>
                <Select value={assessmentFormData.assessmentType} onValueChange={(v) => setAssessmentFormData({ ...assessmentFormData, assessmentType: v })}>
                  <SelectTrigger id="assessmentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="年度评估">年度评估</SelectItem>
                    <SelectItem value="半年评估">半年评估</SelectItem>
                    <SelectItem value="季度评估">季度评估</SelectItem>
                    <SelectItem value="晋升评估">晋升评估</SelectItem>
                    <SelectItem value="专项评估">专项评估</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">评估周期</Label>
                <Input
                  id="period"
                  value={assessmentFormData.period}
                  onChange={(e) => setAssessmentFormData({ ...assessmentFormData, period: e.target.value })}
                  placeholder="例如：2024年度、2024下半年"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
              <Button onClick={handleCreateAssessment}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
