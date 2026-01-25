'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  TrendingUp,
  FileText,
  Sparkles,
  Send,
  Download,
} from 'lucide-react';

interface PerformanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeDepartment: string;
  period: string;
  status: 'pending' | 'in-progress' | 'completed';
  goals: GoalAssessment[];
  overallScore: number;
  overallRating: 'S' | 'A' | 'B' | 'C' | 'D';
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  managerComment: string;
  employeeComment?: string;
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalAssessment {
  goalId: string;
  goalTitle: string;
  weight: number;
  target: string;
  actual: string;
  score: number;
  comment: string;
}

export default function PerformanceAssessment() {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | PerformanceRecord['status']>('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // 对话框状态
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PerformanceRecord | null>(null);

  // 评估表单状态
  const [assessmentData, setAssessmentData] = useState({
    recordId: '',
    goals: [] as GoalAssessment[],
    overallScore: 0,
    strengths: '',
    weaknesses: '',
    improvementSuggestions: '',
    managerComment: '',
  });

  // 获取绩效评估记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance/assessments?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('获取绩效评估记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提交评估
  const submitAssessment = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch(`/api/performance/assessments/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: assessmentData.goals,
          overallScore: assessmentData.overallScore,
          strengths: assessmentData.strengths.split('\n').filter(s => s.trim()),
          weaknesses: assessmentData.weaknesses.split('\n').filter(s => s.trim()),
          improvementSuggestions: assessmentData.improvementSuggestions.split('\n').filter(s => s.trim()),
          managerComment: assessmentData.managerComment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssessmentDialogOpen(false);
        fetchRecords();
      }
    } catch (error) {
      console.error('提交评估失败:', error);
    }
  };

  // AI生成评估建议
  const generateAssessment = async (recordId: string) => {
    try {
      const response = await fetch('/api/ai/performance-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAssessmentData(prev => ({
          ...prev,
          strengths: data.data.strengths?.join('\n') || '',
          weaknesses: data.data.weaknesses?.join('\n') || '',
          improvementSuggestions: data.data.suggestions?.join('\n') || '',
        }));
      }
    } catch (error) {
      console.error('AI生成评估建议失败:', error);
    }
  };

  // 查看详情
  const viewDetail = (record: PerformanceRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  // 打开评估对话框
  const openAssessmentDialog = (record: PerformanceRecord) => {
    setSelectedRecord(record);
    setAssessmentData({
      recordId: record.id,
      goals: record.goals.map(g => ({
        goalId: g.goalId,
        goalTitle: g.goalTitle,
        weight: g.weight,
        target: g.target,
        actual: g.actual,
        score: g.score,
        comment: g.comment,
      })),
      overallScore: record.overallScore,
      strengths: record.strengths.join('\n'),
      weaknesses: record.weaknesses.join('\n'),
      improvementSuggestions: record.improvementSuggestions.join('\n'),
      managerComment: record.managerComment,
    });
    setAssessmentDialogOpen(true);
  };

  // 计算等级
  const calculateRating = (score: number): string => {
    if (score >= 95) return 'S';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  // 获取等级颜色
  const getRatingColor = (rating: string): string => {
    const colors: Record<string, string> = {
      S: 'bg-purple-500',
      A: 'bg-blue-500',
      B: 'bg-green-500',
      C: 'bg-yellow-500',
      D: 'bg-red-500',
    };
    return colors[rating] || 'bg-gray-500';
  };

  // 过滤记录
  const filteredRecords = records.filter(record => {
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || record.period === periodFilter;
    return matchesStatus && matchesPeriod;
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">绩效评估</h1>
          <p className="text-muted-foreground mt-1">
            评估和记录员工绩效表现
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待评估</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评估中</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均分</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'completed').length > 0
                ? Math.round(
                    records
                      .filter(r => r.status === 'completed')
                      .reduce((sum, r) => sum + r.overallScore, 0) /
                      records.filter(r => r.status === 'completed').length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 评估列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>评估记录</CardTitle>
            <div className="flex gap-2">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部周期</SelectItem>
                  <SelectItem value="2024-Q1">2024-Q1</SelectItem>
                  <SelectItem value="2024-Q2">2024-Q2</SelectItem>
                  <SelectItem value="2024-Q3">2024-Q3</SelectItem>
                  <SelectItem value="2024-Q4">2024-Q4</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待评估</SelectItem>
                  <SelectItem value="in-progress">评估中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>分数</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>评估时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无评估记录
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{record.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.employeeDepartment}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.period}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{record.overallScore}</span>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`text-white px-2 py-1 rounded text-xs font-bold ${getRatingColor(record.overallRating)}`}
                      >
                        {record.overallRating}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.status === 'pending' && (
                        <Badge variant="secondary">待评估</Badge>
                      )}
                      {record.status === 'in-progress' && (
                        <Badge variant="default">评估中</Badge>
                      )}
                      {record.status === 'completed' && (
                        <Badge variant="default">已完成</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.reviewDate ? new Date(record.reviewDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {record.status === 'pending' || record.status === 'in-progress' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssessmentDialog(record)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            评估
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetail(record)}
                          >
                            查看
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 评估对话框 */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>绩效评估</DialogTitle>
            <DialogDescription>
              评估员工绩效表现
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{selectedRecord.employeeName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedRecord.employeeName}</div>
                      <div className="text-sm text-gray-500">{selectedRecord.employeeDepartment}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{selectedRecord.period}</Badge>
                </div>
              </div>

              {/* 目标评估 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">目标评估</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAssessment(selectedRecord.id)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI生成建议
                  </Button>
                </div>
                <div className="space-y-4">
                  {assessmentData.goals.map((goal, index) => (
                    <div key={goal.goalId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{goal.goalTitle}</div>
                          <div className="text-sm text-gray-500">权重: {goal.weight}%</div>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={goal.score}
                          onChange={(e) => {
                            const newGoals = [...assessmentData.goals];
                            newGoals[index].score = Number(e.target.value);
                            setAssessmentData({ ...assessmentData, goals: newGoals });
                          }}
                          className="w-20 text-center"
                        />
                        <span className="text-sm">分</span>
                      </div>
                      <div>
                        <Label>目标</Label>
                        <p className="text-sm text-gray-600">{goal.target}</p>
                      </div>
                      <div>
                        <Label>实际完成情况</Label>
                        <Textarea
                          value={goal.actual}
                          onChange={(e) => {
                            const newGoals = [...assessmentData.goals];
                            newGoals[index].actual = e.target.value;
                            setAssessmentData({ ...assessmentData, goals: newGoals });
                          }}
                          rows={2}
                          placeholder="描述实际完成情况"
                        />
                      </div>
                      <div>
                        <Label>评价意见</Label>
                        <Textarea
                          value={goal.comment}
                          onChange={(e) => {
                            const newGoals = [...assessmentData.goals];
                            newGoals[index].comment = e.target.value;
                            setAssessmentData({ ...assessmentData, goals: newGoals });
                          }}
                          rows={2}
                          placeholder="填写评价意见"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 综合评价 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="overallScore">总分 (0-100)</Label>
                  <Input
                    id="overallScore"
                    type="number"
                    min={0}
                    max={100}
                    value={assessmentData.overallScore}
                    onChange={(e) => setAssessmentData({ ...assessmentData, overallScore: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="strengths">优势（每行一条）</Label>
                  <Textarea
                    id="strengths"
                    value={assessmentData.strengths}
                    onChange={(e) => setAssessmentData({ ...assessmentData, strengths: e.target.value })}
                    rows={3}
                    placeholder="例如：技术能力强，工作积极主动"
                  />
                </div>

                <div>
                  <Label htmlFor="weaknesses">待改进（每行一条）</Label>
                  <Textarea
                    id="weaknesses"
                    value={assessmentData.weaknesses}
                    onChange={(e) => setAssessmentData({ ...assessmentData, weaknesses: e.target.value })}
                    rows={3}
                    placeholder="例如：沟通能力需要提升"
                  />
                </div>

                <div>
                  <Label htmlFor="improvementSuggestions">改进建议（每行一条）</Label>
                  <Textarea
                    id="improvementSuggestions"
                    value={assessmentData.improvementSuggestions}
                    onChange={(e) => setAssessmentData({ ...assessmentData, improvementSuggestions: e.target.value })}
                    rows={3}
                    placeholder="例如：加强沟通培训，参与跨部门项目"
                  />
                </div>

                <div>
                  <Label htmlFor="managerComment">主管评价</Label>
                  <Textarea
                    id="managerComment"
                    value={assessmentData.managerComment}
                    onChange={(e) => setAssessmentData({ ...assessmentData, managerComment: e.target.value })}
                    rows={4}
                    placeholder="总体评价和期望"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessmentDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={submitAssessment}>
              <Send className="h-4 w-4 mr-2" />
              提交评估
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
