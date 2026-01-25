'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  FileText,
  GraduationCap,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Play,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

// 性能优化工具
import { useDebounce, useLocalStorage } from '@/hooks/use-performance';
import { SkeletonCard, SkeletonList } from '@/components/ui/loading';
import { fetchWithConfig, getCacheConfig } from '@/lib/cache/advanced-cache';
import { get, post } from '@/lib/request/enhanced-request';
import monitor from '@/lib/performance/monitor';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  education?: string;
  degree?: string;
  status: string;
  jobId?: string;
  createdAt: string;
  notes?: string;
  workflowInstanceId?: string;
  workflowStatus?: string;
  currentStep?: {
    id: string;
    name: string;
    status: string;
  };
}

interface Job {
  id: string;
  title: string;
  department: string;
}

export default function ResumeManagementContent() {
  const [activeTab, setActiveTab] = useLocalStorage('recruitment-active-tab', 'new');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // 获取当前用户信息
  const getCurrentUser = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }, []);

  // 获取候选人列表（带缓存）
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user?.companyId) return;

      const params = {
        companyId: user.companyId,
        ...(selectedJob !== 'all' && { jobId: selectedJob }),
        ...(activeTab !== 'all' && { status: activeTab }),
        page,
        limit: 20,
      };

      return fetchWithConfig('candidates', params, async () => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== 'all') {
            queryParams.append(key, String(value));
          }
        });

        const response = await get<{ success: boolean; data?: Candidate[]; total?: number }>(
          `/api/recruitment/candidates?${queryParams}`,
          { enableMetrics: true }
        );

        return response;
      }).then(result => {
        if (result.success && result.data) {
          setCandidates(result.data);
          setTotalCount(result.total || result.data.length);
        }
      });
    } catch (error) {
      console.error('获取候选人列表失败:', error);
      monitor.trackError('fetchCandidates', error as Error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedJob, page, getCurrentUser]);

  // 获取职位列表（带缓存）
  const fetchJobs = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user?.companyId) return;

      return fetchWithConfig('recruitment', { companyId: user.companyId }, async () => {
        const response = await get<{ success: boolean; data?: Job[] }>(
          `/api/recruitment/jobs?companyId=${user.companyId}`,
          { enableMetrics: true }
        );

        return response;
      }).then(result => {
        if (result.success && result.data) {
          setJobs(result.data);
        }
      });
    } catch (error) {
      console.error('获取职位列表失败:', error);
      monitor.trackError('fetchJobs', error as Error);
    }
  }, [getCurrentUser]);

  // 启动工作流
  const startWorkflow = useCallback(async (candidateId: string, jobId: string) => {
    try {
      const response = await post<{ success: boolean; error?: string }>(
        '/api/recruitment/candidates',
        {
          action: 'start_workflow',
          candidateId,
          jobId,
        },
        { enableMetrics: true }
      );

      if (response.success) {
        await fetchCandidates();
        alert('招聘工作流启动成功');
      } else {
        alert(response.error || '启动失败');
      }
    } catch (error) {
      console.error('启动工作流失败:', error);
      monitor.trackError('startWorkflow', error as Error);
      alert('启动工作流失败');
    }
  }, [fetchCandidates]);

  // 推进步骤
  const advanceStep = useCallback(async (candidateId: string, stepId: string, result: string) => {
    try {
      const response = await post<{ success: boolean; error?: string }>(
        `/api/recruitment/candidates/${candidateId}/advance`,
        {
          stepId,
          result,
          advanceToNext: true,
        },
        { enableMetrics: true }
      );

      if (response.success) {
        await fetchCandidates();
        setShowDetailDialog(false);
        alert('步骤推进成功');
      } else {
        alert(response.error || '推进失败');
      }
    } catch (error) {
      console.error('推进步骤失败:', error);
      monitor.trackError('advanceStep', error as Error);
      alert('推进步骤失败');
    }
  }, [fetchCandidates]);

  // 初始化加载数据
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchCandidates();
  }, [activeTab, selectedJob, page, fetchCandidates]);

  // 状态配置
  const statusConfigs = [
    { key: 'all', label: '全部' },
    { key: 'new', label: '新简历' },
    { key: 'screening', label: '筛选中' },
    { key: 'interviewing', label: '面试中' },
    { key: 'offered', label: '录用中' },
  ] as const;

  // 过滤候选人
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item: any) => candidate => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        candidate.phone?.includes(debouncedSearchQuery);
      return matchesSearch;
    });
  }, [candidates, debouncedSearchQuery]);

  // 获取状态样式
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      screening: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      interviewing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      offered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      rejected: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: '新简历',
      screening: '筛选中',
      interviewing: '面试中',
      offered: '录用中',
      hired: '已录用',
      rejected: '已淘汰',
    };
    return labels[status] || status;
  };

  const getWorkflowStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">简历管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI智能筛选，基于工作流高效管理候选人
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="所有职位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有职位</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出简历
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusConfigs.map(status => (
          <Card
            key={status.key}
            className={`cursor-pointer transition-colors ${
              activeTab === status.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''
            }`}
            onClick={() => setActiveTab(status.key)}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  (status.key === 'all' ? totalCount : candidates.filter((item: any) => c => c.status === status.key).length)
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {status.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索候选人姓名、邮箱或手机号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 候选人列表 */}
      <Card>
        <CardHeader>
          <CardTitle>候选人列表</CardTitle>
          <CardDescription>
            共 {filteredCandidates.length} 位候选人
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonList count={5} />
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowDetailDialog(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <Badge className={getStatusColor(candidate.status)}>
                          {getStatusLabel(candidate.status)}
                        </Badge>
                        {candidate.workflowStatus && (
                          <Badge className={getWorkflowStatusColor(candidate.workflowStatus)}>
                            {candidate.workflowStatus === 'active' && '进行中'}
                            {candidate.workflowStatus === 'paused' && '已暂停'}
                            {candidate.workflowStatus === 'completed' && '已完成'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {candidate.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {candidate.phone}
                        </span>
                        {candidate.yearsOfExperience && (
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {candidate.yearsOfExperience}年经验
                          </span>
                        )}
                        {candidate.currentCompany && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {candidate.currentCompany}
                          </span>
                        )}
                      </div>
                      {candidate.currentStep && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">当前步骤：</span>
                          <span className="font-medium text-blue-600">{candidate.currentStep.name}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalCount > 20 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                共 {totalCount} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="text-sm">第 {page} 页</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= totalCount}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 候选人详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>候选人详情</DialogTitle>
            <DialogDescription>
              查看候选人信息并管理招聘流程
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>姓名</Label>
                    <div className="font-medium">{selectedCandidate.name}</div>
                  </div>
                  <div>
                    <Label>邮箱</Label>
                    <div className="font-medium">{selectedCandidate.email}</div>
                  </div>
                  <div>
                    <Label>手机号</Label>
                    <div className="font-medium">{selectedCandidate.phone}</div>
                  </div>
                  <div>
                    <Label>当前公司</Label>
                    <div className="font-medium">{selectedCandidate.currentCompany || '-'}</div>
                  </div>
                  <div>
                    <Label>工作年限</Label>
                    <div className="font-medium">{selectedCandidate.yearsOfExperience || '-'}年</div>
                  </div>
                  <div>
                    <Label>教育背景</Label>
                    <div className="font-medium">{selectedCandidate.education || '-'}</div>
                  </div>
                  <div>
                    <Label>学位</Label>
                    <div className="font-medium">{selectedCandidate.degree || '-'}</div>
                  </div>
                  <div>
                    <Label>申请日期</Label>
                    <div className="font-medium">{new Date(selectedCandidate.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* 工作流状态 */}
              <div>
                <h3 className="font-semibold mb-3">招聘流程</h3>
                {selectedCandidate.workflowInstanceId ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">工作流已启动</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          当前步骤：{selectedCandidate.currentStep?.name || '-'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const stepId = selectedCandidate.currentStep?.id;
                          if (stepId) {
                            advanceStep(selectedCandidate.id, stepId, 'approved');
                          }
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        推进到下一步
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                      该候选人尚未启动招聘工作流
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedCandidate.jobId) {
                          startWorkflow(selectedCandidate.id, selectedCandidate.jobId);
                        } else {
                          alert('请先为候选人分配职位');
                        }
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      启动工作流
                    </Button>
                  </div>
                )}
              </div>

              {/* 备注 */}
              <div>
                <Label>备注</Label>
                <Textarea
                  placeholder="添加备注..."
                  value={selectedCandidate.notes || ''}
                  rows={3}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
