'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/loading';
import {
  User,
  Star,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface AssessmentCriteria {
  id: number;
  category: string;
  weight: number;
  score: number;
  comment: string;
}

interface Assessment {
  id: number;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  avatar: string;
  cycle: string;
  assessor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision';
  overallScore: number;
  level: string;
  assessmentDate: string;
  lastModified: string;
  criteria: AssessmentCriteria[];
  strengths: string[];
  improvements: string[];
}

export default function PerformanceAssessmentContent() {
  const [activeTab, setActiveTab] = useLocalStorage('assessment-tab', 'pending');
  const [showAssessDialog, setShowAssessDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // 获取考核列表
  const {
    data: assessments = [],
    loading,
    error,
    execute: fetchAssessments,
  } = useAsync<Assessment[]>();

  const loadAssessments = useCallback(async (): Promise<Assessment[]> => {
    try {
      const cacheKey = `assessments-${activeTab}-${debouncedQuery}`;
      return await fetchWithCache<Assessment[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          tab: activeTab,
          ...(debouncedQuery && { keyword: debouncedQuery }),
        });

        const response = await get<{ success: boolean; data?: Assessment[] }>(
          `/api/performance/assessments?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000);
    } catch (err) {
      console.error('获取考核列表失败:', err);
      monitor.trackError('loadAssessments', err as Error);
      throw err;
    }
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchAssessments(loadAssessments);
  }, [activeTab, fetchAssessments, loadAssessments]);

  // 统计数据
  const stats = useMemo(() => ({
    total: assessments.length,
    pending: assessments.filter((item: any) => a => a.status === 'pending').length,
    inProgress: assessments.filter((item: any) => a => a.status === 'in_progress').length,
    completed: assessments.filter((item: any) => a => a.status === 'completed').length,
  }), [assessments]);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }, []);

  const getLevelBadge = useCallback((level: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'S': { text: '优秀', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
      'A': { text: '良好', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'B': { text: '合格', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'C': { text: '需改进', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      'D': { text: '不合格', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    };
    const badge = badges[level] || { text: '-', color: 'bg-gray-100 text-gray-700' };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchAssessments(loadAssessments)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">绩效评估</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            对员工进行绩效考核，记录评估结果
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          新建考核
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总考核数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待评估</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索员工姓名或工号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 考核列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">待评估 ({stats.pending})</TabsTrigger>
              <TabsTrigger value="in_progress">进行中 ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({stats.completed})</TabsTrigger>
              <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无考核记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{assessment.employeeName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{assessment.employeeName}</h3>
                            <Badge className={getStatusColor(assessment.status)}>
                              {assessment.status === 'pending' ? '待评估' :
                               assessment.status === 'in_progress' ? '进行中' :
                               assessment.status === 'completed' ? '已完成' : '需修改'}
                            </Badge>
                            {assessment.overallScore > 0 && getLevelBadge(assessment.level)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span>{assessment.employeeId}</span>
                            <span>{assessment.department}</span>
                            <span>{assessment.position}</span>
                            <span>{assessment.cycle}</span>
                          </div>
                          {assessment.overallScore > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">综合评分</span>
                                <Progress value={assessment.overallScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{assessment.overallScore}分</span>
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            评估人: {assessment.assessor} · 最后修改: {assessment.lastModified}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          导出
                        </Button>
                        {assessment.status !== 'completed' && (
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Edit className="h-4 w-4 mr-1" />
                            评估
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
