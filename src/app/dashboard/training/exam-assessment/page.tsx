'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ClipboardCheck, Clock, Users, TrendingUp, Plus, FileText, Award } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  course: string;
  type: 'quiz' | 'final' | 'certification';
  duration: number;
  questions: number;
  passingScore: number;
  participants: number;
  avgScore: number;
  passRate: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}

export default function ExamAssessmentPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setExams([
        { id: '1', name: '入职培训测验', course: '新员工入职培训', type: 'quiz', duration: 30, questions: 20, passingScore: 60, participants: 120, avgScore: 78.5, passRate: 85.8, status: 'published', createdAt: '2024-01-20' },
        { id: '2', name: '销售技巧认证考试', course: '销售技巧培训', type: 'certification', duration: 60, questions: 40, passingScore: 70, participants: 89, avgScore: 82.3, passRate: 78.6, status: 'published', createdAt: '2024-03-10' },
        { id: '3', name: '沟通能力测试', course: '沟通技巧提升', type: 'quiz', duration: 25, questions: 15, passingScore: 60, participants: 156, avgScore: 75.2, passRate: 82.1, status: 'published', createdAt: '2024-04-12' },
        { id: '4', name: '管理能力综合评估', course: '领导力提升课程', type: 'final', duration: 90, questions: 50, passingScore: 70, participants: 45, avgScore: 68.4, passRate: 64.4, status: 'published', createdAt: '2024-04-15' },
        { id: '5', name: '项目管理知识测试', course: '项目管理基础', type: 'quiz', duration: 45, questions: 30, passingScore: 65, participants: 0, avgScore: 0, passRate: 0, status: 'draft', createdAt: '2024-04-18' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch =
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [exams, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = exams.length;
    const published = exams.filter(e => e.status === 'published').length;
    const totalParticipants = exams.reduce((sum, e) => sum + e.participants, 0);
    const avgPassRate = exams.filter(e => e.participants > 0).reduce((sum, e) => sum + e.passRate, 0) / exams.filter(e => e.participants > 0).length || 0;
    return { total, published, totalParticipants, avgPassRate };
  }, [exams]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">考试评估</h1>
          <p className="text-muted-foreground mt-1">管理在线考试和评估</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />新建考试</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              考试总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">所有考试</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              总参与人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-1">累计参考</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              平均及格率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgPassRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">整体通过率</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              已发布考试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground mt-1">可参与考试</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索考试名称或课程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="closed">已关闭</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 考试列表 */}
      <Card>
        <CardHeader>
          <CardTitle>考试列表</CardTitle>
          <CardDescription>管理所有考试和评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{exam.name}</h3>
                        <p className="text-sm text-muted-foreground">{exam.course}</p>
                      </div>
                      <Badge
                        variant={
                          exam.type === 'certification'
                            ? 'default'
                            : exam.type === 'final'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {exam.type === 'quiz' ? '小测验' : exam.type === 'final' ? '期末考试' : '认证考试'}
                      </Badge>
                      <Badge
                        variant={exam.status === 'published' ? 'default' : exam.status === 'draft' ? 'secondary' : 'outline'}
                      >
                        {exam.status === 'published' ? '已发布' : exam.status === 'draft' ? '草稿' : '已关闭'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">考试时长</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration}分钟
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">题目数量</p>
                        <p className="font-semibold">{exam.questions}题</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">及格分数</p>
                        <p className="font-semibold">{exam.passingScore}分</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">创建时间</p>
                        <p className="font-semibold">{exam.createdAt}</p>
                      </div>
                    </div>

                    {exam.participants > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">参与: {exam.participants}人</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">平均分: {exam.avgScore.toFixed(1)}分</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">及格率: {exam.passRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">编辑</Button>
                    <Button variant="outline" size="sm">查看结果</Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredExams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的考试
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
