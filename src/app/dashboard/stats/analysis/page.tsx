'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
  Loader2,
  Sparkles,
  Send,
} from 'lucide-react';

interface StatsData {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    probationEmployees: number;
    resignedEmployees: number;
    totalJobs: number;
    openJobs: number;
    totalCandidates: number;
    totalInterviews: number;
    completedPerformanceRecords: number;
    pendingPerformanceRecords: number;
    avgPerformanceScore: number;
    avgSalary: number;
  };
  employeeStats: any;
  recruitmentStats: any;
  performanceStats: any;
  departmentStats: any[];
  positionStats: any[];
  hireTrend: any[];
}

export default function StatsAnalysis() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI分析员工数据
  const analyzeEmployees = async () => {
    if (!stats) return;

    try {
      setIsAnalyzing(true);
      setAiAnalysis('');

      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'employee',
          data: {
            totalEmployees: stats.summary.totalEmployees,
            activeEmployees: stats.summary.activeEmployees,
            probationEmployees: stats.summary.probationEmployees,
            resignedEmployees: stats.summary.resignedEmployees,
            avgSalary: stats.summary.avgSalary,
            departmentStats: stats.departmentStats,
          },
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          setAiAnalysis(prev => prev + text);
        }
      }
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 提问
  const askQuestion = async () => {
    if (!question.trim() || !stats) return;

    try {
      setIsAnswering(true);
      setAnswer('');

      const response = await fetch('/api/ai/analysis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: JSON.stringify(stats.summary, null, 2),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnswer(data.data.answer);
      }
    } catch (error) {
      console.error('提问失败:', error);
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">统计分析</h1>
          <p className="text-muted-foreground mt-1">
            数据统计与AI智能分析
          </p>
        </div>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总员工</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                在职: {stats.summary.activeEmployees}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">职位</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                开放中: {stats.summary.openJobs}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">候选人</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                面试: {stats.summary.totalInterviews}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">绩效</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.avgPerformanceScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                已完成: {stats.summary.completedPerformanceRecords}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均薪资</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary.avgSalary.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">元</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月入职</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.hireTrend?.[stats.hireTrend.length - 1]?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                最近12个月: {stats.hireTrend?.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">数据概览</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI智能分析</TabsTrigger>
          <TabsTrigger value="qa">AI问答</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>部门分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.departmentStats.map((dept) => (
                        <div key={dept.departmentId}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{dept.departmentName}</span>
                            <span className="text-sm text-muted-foreground">
                              {dept.employeeCount}人
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(dept.employeeCount / stats.summary.activeEmployees) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>职位分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.positionStats.slice(0, 5).map((pos) => (
                        <div key={pos.positionId}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{pos.positionName}</span>
                            <span className="text-sm text-muted-foreground">
                              {pos.employeeCount}人
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(pos.employeeCount / stats.summary.activeEmployees) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>入职趋势（最近12个月）</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-48">
                    {stats.hireTrend.map((item, index) => {
                      const maxCount = Math.max(...stats.hireTrend.map(t => t.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-primary rounded-t transition-all" style={{ height: `${height}%`, minHeight: '4px' }} />
                          <div className="text-xs text-muted-foreground mt-2">
                            {item.month}
                          </div>
                          <div className="text-sm font-medium">
                            {item.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI智能分析
                  </CardTitle>
                  <CardDescription>
                    基于AI对员工数据进行深度分析
                  </CardDescription>
                </div>
                <Button onClick={analyzeEmployees} disabled={isAnalyzing || !stats}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      开始分析
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiAnalysis ? (
                <div className="prose dark:prose-invert max-w-none">
                  {aiAnalysis.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <p>点击"开始分析"按钮，AI将为您生成详细的分析报告</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI问答</CardTitle>
              <CardDescription>
                向AI提问任何关于HR管理的问题
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="请输入您的问题..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={askQuestion} disabled={isAnswering || !question.trim()}>
                  {isAnswering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      思考中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      提问
                    </>
                  )}
                </Button>
              </div>

              {answer && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">AI回答：</div>
                  <div className="prose dark:prose-invert max-w-none">
                    {answer.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
