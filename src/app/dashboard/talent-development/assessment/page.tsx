'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Plus,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Building,
  Eye,
  Edit,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type AssessmentStatus = 'pending' | 'in-progress' | 'completed';
type AssessmentType = 'annual' | 'quarterly' | 'promotion' | 'skill';

interface Assessment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  type: AssessmentType;
  status: AssessmentStatus;
  period: string;
  assessor: string;
  overallScore: number;
  maxScore: number;
  competencyScores: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  assessedDate?: string;
  createdAt: string;
}

export default function TalentAssessmentPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newAssessment, setNewAssessment] = useState({
    employeeName: '',
    department: '',
    position: '',
    type: 'annual' as AssessmentType,
    period: '',
    assessor: '',
    competencyScores: [
      { name: '专业能力', score: '', maxScore: 100, weight: 30 },
      { name: '沟通协作', score: '', maxScore: 100, weight: 20 },
      { name: '领导力', score: '', maxScore: 100, weight: 20 },
      { name: '创新能力', score: '', maxScore: 100, weight: 15 },
      { name: '执行力', score: '', maxScore: 100, weight: 15 },
    ],
    strengths: [''],
    improvements: [''],
    recommendations: [''],
  });

  useEffect(() => {
    // 模拟获取评估数据
    setTimeout(() => {
      setAssessments([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          type: 'annual',
          status: 'completed',
          period: '2024-Q1',
          assessor: '李技术总监',
          overallScore: 88,
          maxScore: 100,
          competencyScores: [
            { name: '专业能力', score: 92, maxScore: 100, weight: 30 },
            { name: '沟通协作', score: 85, maxScore: 100, weight: 20 },
            { name: '领导力', score: 80, maxScore: 100, weight: 20 },
            { name: '创新能力', score: 90, maxScore: 100, weight: 15 },
            { name: '执行力', score: 88, maxScore: 100, weight: 15 },
          ],
          strengths: [
            '技术能力强，能独立解决复杂问题',
            '乐于分享，团队协作意识好',
            '学习能力强，快速掌握新技术',
          ],
          improvements: [
            '需要加强项目管理能力',
            '提升文档编写质量',
          ],
          recommendations: [
            '推荐参加项目管理培训',
            '建议承担更重要的技术项目',
          ],
          assessedDate: '2024-01-15',
          createdAt: '2024-01-10T10:00:00',
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          type: 'quarterly',
          status: 'completed',
          period: '2024-Q1',
          assessor: '王产品总监',
          overallScore: 85,
          maxScore: 100,
          competencyScores: [
            { name: '专业能力', score: 88, maxScore: 100, weight: 30 },
            { name: '沟通协作', score: 90, maxScore: 100, weight: 20 },
            { name: '领导力', score: 82, maxScore: 100, weight: 20 },
            { name: '创新能力', score: 85, maxScore: 100, weight: 15 },
            { name: '执行力', score: 82, maxScore: 100, weight: 15 },
          ],
          strengths: [
            '产品思维清晰，用户体验意识强',
            '沟通能力强，能协调各方资源',
          ],
          improvements: [
            '需要提升数据驱动决策能力',
          ],
          recommendations: [
            '建议加强数据分析技能培训',
          ],
          assessedDate: '2024-01-20',
          createdAt: '2024-01-15T14:30:00',
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          position: '销售代表',
          type: 'skill',
          status: 'in-progress',
          period: '2024-Q1',
          assessor: '赵销售总监',
          overallScore: 0,
          maxScore: 100,
          competencyScores: [],
          strengths: [],
          improvements: [],
          recommendations: [],
          createdAt: '2024-01-25T09:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateAssessment = () => {
    const totalScore = newAssessment.competencyScores.reduce(
      (sum, item) => sum + (parseInt(item.score) || 0) * (item.weight / 100),
      0
    );

    const assessment: Assessment = {
      id: Date.now().toString(),
      employeeId: 'E' + Date.now().toString().slice(-4),
      employeeName: newAssessment.employeeName,
      department: newAssessment.department,
      position: newAssessment.position,
      type: newAssessment.type,
      status: 'pending',
      period: newAssessment.period,
      assessor: newAssessment.assessor,
      overallScore: totalScore,
      maxScore: 100,
      competencyScores: newAssessment.competencyScores.map(item => ({
        ...item,
        score: parseInt(item.score) || 0,
      })),
      strengths: newAssessment.strengths.filter(s => s.trim() !== ''),
      improvements: newAssessment.improvements.filter(s => s.trim() !== ''),
      recommendations: newAssessment.recommendations.filter(s => s.trim() !== ''),
      createdAt: new Date().toISOString(),
    };
    setAssessments([assessment, ...assessments]);
    setShowCreateAssessment(false);
    toast.success('评估已创建');
    setNewAssessment({
      employeeName: '',
      department: '',
      position: '',
      type: 'annual',
      period: '',
      assessor: '',
      competencyScores: [
        { name: '专业能力', score: '', maxScore: 100, weight: 30 },
        { name: '沟通协作', score: '', maxScore: 100, weight: 20 },
        { name: '领导力', score: '', maxScore: 100, weight: 20 },
        { name: '创新能力', score: '', maxScore: 100, weight: 15 },
        { name: '执行力', score: '', maxScore: 100, weight: 15 },
      ],
      strengths: [''],
      improvements: [''],
      recommendations: [''],
    });
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeConfig: Record<AssessmentType, { label: string; color: string }> = {
    annual: { label: '年度评估', color: 'bg-blue-500' },
    quarterly: { label: '季度评估', color: 'bg-green-500' },
    promotion: { label: '晋升评估', color: 'bg-purple-500' },
    skill: { label: '技能评估', color: 'bg-orange-500' },
  };

  const statusConfig: Record<AssessmentStatus, { label: string; color: string; icon: any }> = {
    pending: { label: '待评估', color: 'bg-gray-500', icon: Clock },
    'in-progress': { label: '进行中', color: 'bg-yellow-500', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
  };

  const statistics = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    pending: assessments.filter(a => a.status === 'pending').length,
    averageScore: assessments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.overallScore, 0) / assessments.filter(a => a.status === 'completed').length || 0,
  };

  const addField = (field: 'strengths' | 'improvements' | 'recommendations') => {
    setNewAssessment({
      ...newAssessment,
      [field]: [...newAssessment[field], ''],
    });
  };

  const updateField = (
    field: 'strengths' | 'improvements' | 'recommendations',
    index: number,
    value: string
  ) => {
    const updated = [...newAssessment[field]];
    updated[index] = value;
    setNewAssessment({
      ...newAssessment,
      [field]: updated,
    });
  };

  const removeField = (
    field: 'strengths' | 'improvements' | 'recommendations',
    index: number
  ) => {
    const updated = newAssessment[field].filter((_, i) => i !== index);
    setNewAssessment({
      ...newAssessment,
      [field]: updated.length > 0 ? updated : [''],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-blue-600" />
              人才评估
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              对员工进行全面的能力评估
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateAssessment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建评估
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总评估数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">待评估</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">平均分</p>
                  <p className="text-2xl font-bold">
                    {statistics.averageScore > 0 ? statistics.averageScore.toFixed(1) : '-'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索员工姓名或部门..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(typeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 评估列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无评估记录</p>
              <Button className="mt-4" onClick={() => setShowCreateAssessment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建评估
              </Button>
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assessment.employeeName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <span>{assessment.position}</span>
                        <span>·</span>
                        <span>{assessment.department}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`${typeConfig[assessment.type].color} text-white border-0`}>
                      {typeConfig[assessment.type].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig[assessment.status].color + ' text-white border-0'}>
                          {statusConfig[assessment.status].label}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {assessment.period}
                        </span>
                      </div>
                      {assessment.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">综合评分</span>
                          <div className="flex items-center gap-1">
                            {assessment.overallScore >= 90 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : assessment.overallScore >= 80 ? (
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            ) : assessment.overallScore >= 60 ? (
                              <TrendingDown className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-2xl font-bold text-blue-600">
                              {assessment.overallScore}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              /{assessment.maxScore}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {assessment.status === 'completed' && (
                      <>
                        <div>
                          <p className="text-sm font-medium mb-2">能力维度得分</p>
                          <div className="space-y-2">
                            {assessment.competencyScores.map((competency) => (
                              <div key={competency.name}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">{competency.name}</span>
                                  <span>
                                    {competency.score}/{competency.maxScore} (权重{competency.weight}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      competency.score >= 90 ? 'bg-green-500' :
                                      competency.score >= 80 ? 'bg-blue-500' :
                                      competency.score >= 60 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${(competency.score / competency.maxScore) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">优势</p>
                            <p className="font-medium">{assessment.strengths.length} 项</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">改进点</p>
                            <p className="font-medium">{assessment.improvements.length} 项</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">建议</p>
                            <p className="font-medium">{assessment.recommendations.length} 项</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                      {assessment.status === 'pending' && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          开始评估
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 创建评估弹窗 */}
      <Dialog open={showCreateAssessment} onOpenChange={setShowCreateAssessment}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建人才评估</DialogTitle>
            <DialogDescription>
              创建新的员工能力评估
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="details">评估详情</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>员工姓名 *</Label>
                  <Input
                    placeholder="输入员工姓名"
                    value={newAssessment.employeeName}
                    onChange={(e) => setNewAssessment({ ...newAssessment, employeeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>部门 *</Label>
                  <Input
                    placeholder="输入部门"
                    value={newAssessment.department}
                    onChange={(e) => setNewAssessment({ ...newAssessment, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>职位 *</Label>
                  <Input
                    placeholder="输入职位"
                    value={newAssessment.position}
                    onChange={(e) => setNewAssessment({ ...newAssessment, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>评估类型 *</Label>
                  <Select
                    value={newAssessment.type}
                    onValueChange={(v) => setNewAssessment({ ...newAssessment, type: v as AssessmentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>评估周期 *</Label>
                  <Input
                    placeholder="例如：2024-Q1"
                    value={newAssessment.period}
                    onChange={(e) => setNewAssessment({ ...newAssessment, period: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>评估人 *</Label>
                  <Input
                    placeholder="输入评估人姓名"
                    value={newAssessment.assessor}
                    onChange={(e) => setNewAssessment({ ...newAssessment, assessor: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <p className="font-medium mb-3">能力维度评分</p>
                <div className="space-y-3">
                  {newAssessment.competencyScores.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3">
                      <div className="col-span-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          权重 {item.weight}%
                        </p>
                      </div>
                      <div className="col-span-3 flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={item.maxScore}
                          placeholder={`评分 (0-${item.maxScore})`}
                          value={item.score}
                          onChange={(e) => {
                            const updated = [...newAssessment.competencyScores];
                            updated[index] = { ...updated[index], score: e.target.value };
                            setNewAssessment({ ...newAssessment, competencyScores: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>优势</Label>
                  <Button variant="outline" size="sm" onClick={() => addField('strengths')}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {newAssessment.strengths.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="输入优势"
                        value={item}
                        onChange={(e) => updateField('strengths', index, e.target.value)}
                      />
                      {newAssessment.strengths.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField('strengths', index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>改进点</Label>
                  <Button variant="outline" size="sm" onClick={() => addField('improvements')}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {newAssessment.improvements.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="输入改进点"
                        value={item}
                        onChange={(e) => updateField('improvements', index, e.target.value)}
                      />
                      {newAssessment.improvements.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField('improvements', index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>发展建议</Label>
                  <Button variant="outline" size="sm" onClick={() => addField('recommendations')}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {newAssessment.recommendations.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="输入发展建议"
                        value={item}
                        onChange={(e) => updateField('recommendations', index, e.target.value)}
                      />
                      {newAssessment.recommendations.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField('recommendations', index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAssessment(false)}>
              取消
            </Button>
            <Button onClick={handleCreateAssessment}>
              <Plus className="h-4 w-4 mr-2" />
              创建评估
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
