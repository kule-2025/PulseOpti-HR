'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardCheck,
  Star,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  Award,
  Target,
  Filter,
  Edit3,
  Trash2,
  BarChart3,
  Sparkles,
  User,
  Calendar,
  FileText,
  Download,
  Send,
  Plus,
  RefreshCw,
  MessageSquare,
  Flag,
} from 'lucide-react';

interface Assessment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  period: string;
  cycle: string;
  score: number;
  grade: string;
  status: 'draft' | 'in-progress' | 'submitted' | 'reviewing' | 'completed' | 'rejected';
  startDate: string;
  endDate: string;
  assessedBy: string;
  assessedByAvatar?: string;
  reviewer?: string;
  dimensions: Dimension[];
  comments: string;
  strengths: string[];
  improvements: string[];
  goals: string[];
  attachments: number;
  createdAt: string;
  updatedAt: string;
}

interface Dimension {
  id: string;
  name: string;
  weight: number;
  score: number;
  description: string;
  examples: string[];
}

export default function PerformanceAssessmentPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Assessment['status']>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const [newAssessment, setNewAssessment] = useState({
    employeeId: '',
    period: '',
    cycle: 'Q1',
    startDate: '',
    endDate: '',
  });

  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setAssessments([
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          period: '2025',
          cycle: 'Q1',
          score: 92,
          grade: 'A',
          status: 'completed',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          assessedBy: '李经理',
          reviewer: '王总监',
          dimensions: [
            { id: '1', name: '工作业绩', weight: 40, score: 95, description: '完成工作任务的质量和效率', examples: ['按时完成项目', '代码质量高'] },
            { id: '2', name: '能力素质', weight: 30, score: 90, description: '专业技能和综合能力', examples: ['技术能力强', '沟通能力好'] },
            { id: '3', name: '态度行为', weight: 20, score: 90, description: '工作态度和行为表现', examples: ['积极主动', '团队协作'] },
            { id: '4', name: '创新改进', weight: 10, score: 85, description: '创新意识和改进建议', examples: ['提出优化方案', '技术分享'] },
          ],
          comments: '张三在本季度表现优秀，按时完成所有任务，工作质量高。在团队协作和技术分享方面表现突出。',
          strengths: ['技术能力强', '责任心强', '团队协作好'],
          improvements: ['加强项目管理能力', '提升业务理解'],
          goals: ['完成2个核心项目', '进行3次技术分享'],
          attachments: 3,
          createdAt: '2025-01-05',
          updatedAt: '2025-04-10',
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: '李四',
          department: '产品部',
          position: '高级产品经理',
          period: '2025',
          cycle: 'Q1',
          score: 88,
          grade: 'B+',
          status: 'reviewing',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          assessedBy: '王总监',
          dimensions: [
            { id: '1', name: '工作业绩', weight: 40, score: 85, description: '完成工作任务的质量和效率', examples: [] },
            { id: '2', name: '能力素质', weight: 30, score: 90, description: '专业技能和综合能力', examples: [] },
            { id: '3', name: '态度行为', weight: 20, score: 88, description: '工作态度和行为表现', examples: [] },
            { id: '4', name: '创新改进', weight: 10, score: 90, description: '创新意识和改进建议', examples: [] },
          ],
          comments: '李四工作认真负责，产品规划能力强。需要加强跨部门沟通。',
          strengths: ['产品规划能力强', '分析能力好'],
          improvements: ['加强跨部门沟通', '提升数据分析能力'],
          goals: ['完成2个产品版本', '建立用户反馈机制'],
          attachments: 2,
          createdAt: '2025-01-08',
          updatedAt: '2025-04-08',
        },
        {
          id: '3',
          employeeId: 'EMP003',
          employeeName: '王五',
          department: '技术部',
          position: '后端工程师',
          period: '2025',
          cycle: 'Q1',
          score: 0,
          grade: '',
          status: 'in-progress',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          assessedBy: '李经理',
          dimensions: [
            { id: '1', name: '工作业绩', weight: 40, score: 0, description: '完成工作任务的质量和效率', examples: [] },
            { id: '2', name: '能力素质', weight: 30, score: 0, description: '专业技能和综合能力', examples: [] },
            { id: '3', name: '态度行为', weight: 20, score: 0, description: '工作态度和行为表现', examples: [] },
            { id: '4', name: '创新改进', weight: 10, score: 0, description: '创新意识和改进建议', examples: [] },
          ],
          comments: '',
          strengths: [],
          improvements: [],
          goals: [],
          attachments: 0,
          createdAt: '2025-01-10',
          updatedAt: '2025-04-05',
        },
        {
          id: '4',
          employeeId: 'EMP004',
          employeeName: '赵六',
          department: '市场部',
          position: '市场专员',
          period: '2025',
          cycle: 'Q1',
          score: 85,
          grade: 'B',
          status: 'completed',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          assessedBy: '陈经理',
          dimensions: [
            { id: '1', name: '工作业绩', weight: 40, score: 88, description: '完成工作任务的质量和效率', examples: [] },
            { id: '2', name: '能力素质', weight: 30, score: 85, description: '专业技能和综合能力', examples: [] },
            { id: '3', name: '态度行为', weight: 20, score: 82, description: '工作态度和行为表现', examples: [] },
            { id: '4', name: '创新改进', weight: 10, score: 80, description: '创新意识和改进建议', examples: [] },
          ],
          comments: '赵六积极完成市场推广任务，效果良好。需要加强数据分析能力。',
          strengths: ['执行力强', '沟通能力好'],
          improvements: ['提升数据分析', '加强市场研究'],
          goals: ['完成2场活动', '提升品牌知名度'],
          attachments: 4,
          createdAt: '2025-01-12',
          updatedAt: '2025-04-12',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const departments = useMemo(() => {
    return Array.from(new Set(assessments.map((a) => a.department)));
  }, [assessments]);

  const cycles = useMemo(() => {
    return Array.from(new Set(assessments.map((a) => a.cycle)));
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || assessment.department === departmentFilter;
      const matchesCycle = cycleFilter === 'all' || assessment.cycle === cycleFilter;
      return matchesSearch && matchesStatus && matchesDepartment && matchesCycle;
    });
  }, [assessments, searchTerm, statusFilter, departmentFilter, cycleFilter]);

  const stats = useMemo(() => {
    return {
      total: assessments.length,
      completed: assessments.filter((a) => a.status === 'completed').length,
      inProgress: assessments.filter((a) => a.status === 'in-progress').length,
      reviewing: assessments.filter((a) => a.status === 'reviewing').length,
      avgScore: assessments
        .filter((a) => a.status === 'completed' && a.score > 0)
        .reduce((sum, a) => sum + a.score, 0) / Math.max(assessments.filter((a) => a.status === 'completed').length, 1),
      gradeDistribution: {
        A: assessments.filter((a) => a.grade === 'A').length,
        B: assessments.filter((a) => a.grade.startsWith('B')).length,
        C: assessments.filter((a) => a.grade.startsWith('C')).length,
        D: assessments.filter((a) => a.grade.startsWith('D')).length,
      },
    };
  }, [assessments]);

  const getStatusBadge = (status: Assessment['status']) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      submitted: 'bg-purple-100 text-purple-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      'in-progress': '评估中',
      submitted: '已提交',
      reviewing: '审核中',
      completed: '已完成',
      rejected: '已驳回',
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const getGradeBadge = (grade: string) => {
    if (!grade) return <Badge variant="outline">未评级</Badge>;
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[grade.charAt(0)]}>{grade}</Badge>;
  };

  const calculateOverallScore = (dimensions: Dimension[]) => {
    return dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight) / 100, 0);
  };

  const handleCreateAssessment = async () => {
    try {
      const newAssessmentData: Assessment = {
        id: Date.now().toString(),
        ...newAssessment,
        employeeName: '选择员工',
        department: '技术部',
        position: '员工职位',
        score: 0,
        grade: '',
        status: 'draft',
        assessedBy: '当前用户',
        dimensions: [
          { id: '1', name: '工作业绩', weight: 40, score: 0, description: '完成工作任务的质量和效率', examples: [] },
          { id: '2', name: '能力素质', weight: 30, score: 0, description: '专业技能和综合能力', examples: [] },
          { id: '3', name: '态度行为', weight: 20, score: 0, description: '工作态度和行为表现', examples: [] },
          { id: '4', name: '创新改进', weight: 10, score: 0, description: '创新意识和改进建议', examples: [] },
        ],
        comments: '',
        strengths: [],
        improvements: [],
        goals: [],
        attachments: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setAssessments([newAssessmentData, ...assessments]);
      setCreateDialogOpen(false);
      setNewAssessment({ employeeId: '', period: '', cycle: 'Q1', startDate: '', endDate: '' });
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">绩效评估</h1>
          <p className="text-muted-foreground mt-1">进行员工绩效评估和考核</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            分析统计
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新建评估
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建评估</DialogTitle>
                <DialogDescription>创建新的绩效评估</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>选择员工</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择员工" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMP001">张三 - 技术部</SelectItem>
                      <SelectItem value="EMP002">李四 - 产品部</SelectItem>
                      <SelectItem value="EMP003">王五 - 技术部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>评估周期</Label>
                    <Select value={newAssessment.cycle} onValueChange={(v) => setNewAssessment({ ...newAssessment, cycle: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">第一季度</SelectItem>
                        <SelectItem value="Q2">第二季度</SelectItem>
                        <SelectItem value="Q3">第三季度</SelectItem>
                        <SelectItem value="Q4">第四季度</SelectItem>
                        <SelectItem value="H1">上半年</SelectItem>
                        <SelectItem value="H2">下半年</SelectItem>
                        <SelectItem value="YEAR">年度</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>评估年度</Label>
                    <Input
                      type="text"
                      placeholder="2025"
                      value={newAssessment.period}
                      onChange={(e) => setNewAssessment({ ...newAssessment, period: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>开始日期</Label>
                    <Input
                      type="date"
                      value={newAssessment.startDate}
                      onChange={(e) => setNewAssessment({ ...newAssessment, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>结束日期</Label>
                    <Input
                      type="date"
                      value={newAssessment.endDate}
                      onChange={(e) => setNewAssessment({ ...newAssessment, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateAssessment}>
                  创建评估
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评估总数</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">已完成 {stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评估中</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              审核中 {stats.reviewing}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均得分</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">满分100分</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A等级</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.gradeDistribution.A}</div>
            <p className="text-xs text-muted-foreground mt-1">
              B等级 {stats.gradeDistribution.B}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {((stats.completed / stats.total) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} / {stats.total}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>评估列表 ({filteredAssessments.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索员工、职位、工号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cycleFilter} onValueChange={(v) => setCycleFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部周期</SelectItem>
                  {cycles.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="in-progress">评估中</SelectItem>
                  <SelectItem value="submitted">已提交</SelectItem>
                  <SelectItem value="reviewing">审核中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              没有找到匹配的评估记录
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {assessment.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{assessment.employeeName}</h3>
                            {getStatusBadge(assessment.status)}
                            {getGradeBadge(assessment.grade)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{assessment.department}</span>
                            <span>·</span>
                            <span>{assessment.position}</span>
                            <span>·</span>
                            <span>{assessment.period} {assessment.cycle}</span>
                            <span>·</span>
                            <span>评估人: {assessment.assessedBy}</span>
                          </div>
                          {assessment.dimensions.length > 0 && assessment.score > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {assessment.dimensions.map((dim) => (
                                <div key={dim.id} className="text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-muted-foreground">{dim.name}</span>
                                    <span className="font-medium">{dim.score}</span>
                                  </div>
                                  <Progress value={dim.score} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{assessment.startDate} ~ {assessment.endDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{assessment.attachments} 个附件</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>更新于 {assessment.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {assessment.status === 'completed' ? (
                          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                            <div>
                              <p className="text-2xl font-bold text-green-600">{assessment.score}</p>
                              <p className="text-xs text-muted-foreground">综合得分</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">评估进度</p>
                            <div className="relative w-16 h-16">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${assessment.score} 100`}
                                  className="text-primary"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-semibold">{assessment.score}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAssessment(assessment); setViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      {assessment.status === 'in-progress' && (
                        <Button size="sm" onClick={() => { setSelectedAssessment(assessment); setAssessDialogOpen(true); }}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          继续评估
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        添加评论
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            编辑评估
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            导出报告
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            发送通知
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除评估
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>评估详情</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedAssessment.employeeName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-bold">{selectedAssessment.employeeName}</h3>
                      {getStatusBadge(selectedAssessment.status)}
                      {getGradeBadge(selectedAssessment.grade)}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {selectedAssessment.position} · {selectedAssessment.department}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>评估周期: {selectedAssessment.period} {selectedAssessment.cycle}</span>
                      <span>评估人: {selectedAssessment.assessedBy}</span>
                    </div>
                  </div>
                  {selectedAssessment.status === 'completed' && (
                    <div className="text-center">
                      <div className="flex items-center gap-2 bg-green-50 px-6 py-3 rounded-lg">
                        <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                        <div>
                          <p className="text-3xl font-bold text-green-600">{selectedAssessment.score}</p>
                          <p className="text-xs text-muted-foreground">综合得分</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">评估维度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedAssessment.dimensions.map((dimension) => (
                        <div key={dimension.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{dimension.name}</div>
                              <div className="text-sm text-muted-foreground">{dimension.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{dimension.score}</div>
                              <div className="text-xs text-muted-foreground">权重 {dimension.weight}%</div>
                            </div>
                          </div>
                          <Progress value={dimension.score} className="mb-2" />
                          {dimension.examples.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">示例: </span>
                              {dimension.examples.join('、')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedAssessment.comments && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">综合评价</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedAssessment.comments}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedAssessment.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          优势亮点
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {selectedAssessment.strengths.map((item, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {selectedAssessment.improvements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          改进建议
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {selectedAssessment.improvements.map((item, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <Flag className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedAssessment.goals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">下期目标</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {selectedAssessment.goals.map((goal, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>创建时间: {selectedAssessment.createdAt}</p>
                  <p>更新时间: {selectedAssessment.updatedAt}</p>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              关闭
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
