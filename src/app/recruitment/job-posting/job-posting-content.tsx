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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/loading';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Globe,
  Share2,
  Eye,
  MoreHorizontal,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  level: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'paused' | 'closed';
  applicantCount: number;
  viewCount: number;
  publishDate: string;
  expiryDate: string;
  hiringManager: string;
  channels: string[];
  description: string;
  requirements: string[];
  benefits: string[];
}

export default function JobPostingContent() {
  const [activeTab, setActiveTab] = useLocalStorage('job-posting-tab', 'active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword] = useDebounce(searchKeyword, 300);
  const [selectedDepartment, setSelectedDepartment] = useLocalStorage('job-posting-dept', 'all');

  // 获取职位列表
  const {
    data: jobPostings = [],
    loading,
    error,
    execute: fetchJobPostings,
  } = useAsync<JobPosting[]>();

  const loadJobPostings = useCallback(async (): Promise<JobPosting[]> => {
    try {
      const cacheKey = `job-postings-${activeTab}-${selectedDepartment}-${debouncedKeyword}`;
      return await fetchWithCache<JobPosting[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          status: activeTab,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
          ...(debouncedKeyword && { keyword: debouncedKeyword }),
        });

        const response = await get<{ success: boolean; data?: JobPosting[] }>(
          `/api/recruitment/job-postings?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000); // 3分钟缓存
    } catch (err) {
      console.error('获取职位列表失败:', err);
      monitor.trackError('loadJobPostings', err as Error);
      throw err;
    }
  }, [activeTab, selectedDepartment, debouncedKeyword]);

  useEffect(() => {
    fetchJobPostings(loadJobPostings);
  }, [activeTab, selectedDepartment, fetchJobPostings, loadJobPostings]);

  // 部门列表
  const departments = useMemo(() => [
    { id: 'all', name: '全部部门' },
    { id: 'tech', name: '技术部' },
    { id: 'product', name: '产品部' },
    { id: 'sales', name: '销售部' },
    { id: 'marketing', name: '市场部' },
  ], []);

  // 统计数据
  const stats = useMemo(() => ({
    total: jobPostings.length,
    active: jobPostings.filter((item: any) => job => job.status === 'active').length,
    paused: jobPostings.filter((item: any) => job => job.status === 'paused').length,
    closed: jobPostings.filter((item: any) => job => job.status === 'closed').length,
    totalApplicants: jobPostings.reduce((sum, job) => sum + job.applicantCount, 0),
    totalViews: jobPostings.reduce((sum, job) => sum + job.viewCount, 0),
  }), [jobPostings]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定要删除该职位吗？')) {
      return;
    }

    try {
      await del<{ success: boolean }>(`/api/recruitment/job-postings/${id}`);
      await fetchJobPostings(loadJobPostings);
    } catch (err) {
      console.error('删除职位失败:', err);
      monitor.trackError('deleteJobPosting', err as Error);
      alert('删除失败');
    }
  }, [fetchJobPostings, loadJobPostings]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchJobPostings(loadJobPostings)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">岗位发布</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理职位信息，多渠道分发招聘需求
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              发布新职位
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>发布新职位</DialogTitle>
              <DialogDescription>
                填写职位信息，选择发布渠道，吸引优秀人才
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="font-semibold">基本信息</h3>
                <div>
                  <Label htmlFor="job-title">职位名称 *</Label>
                  <Input id="job-title" placeholder="例如：高级前端工程师" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-department">所属部门 *</Label>
                    <Select>
                      <SelectTrigger id="job-department">
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="job-level">职级</Label>
                    <Select>
                      <SelectTrigger id="job-level">
                        <SelectValue placeholder="选择职级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P4">P4 - 专员级</SelectItem>
                        <SelectItem value="P5">P5 - 主管级</SelectItem>
                        <SelectItem value="P6">P6 - 经理级</SelectItem>
                        <SelectItem value="P7">P7 - 高级经理</SelectItem>
                        <SelectItem value="M1">M1 - 经理</SelectItem>
                        <SelectItem value="M2">M2 - 高级经理</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-location">工作地点 *</Label>
                    <Input id="job-location" placeholder="例如：北京" />
                  </div>
                  <div>
                    <Label htmlFor="job-manager">招聘负责人</Label>
                    <Input id="job-manager" placeholder="输入负责人姓名" />
                  </div>
                </div>
              </div>

              {/* 薪资范围 */}
              <div className="space-y-4">
                <h3 className="font-semibold">薪资范围</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary-min">最低薪资 *</Label>
                    <Input id="salary-min" type="number" placeholder="例如：20000" />
                  </div>
                  <div>
                    <Label htmlFor="salary-max">最高薪资 *</Label>
                    <Input id="salary-max" type="number" placeholder="例如：30000" />
                  </div>
                </div>
              </div>

              {/* 发布设置 */}
              <div className="space-y-4">
                <h3 className="font-semibold">发布设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publish-date">发布日期 *</Label>
                    <Input id="publish-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">有效期至 *</Label>
                    <Input id="expiry-date" type="date" />
                  </div>
                </div>
                <div>
                  <Label>发布渠道</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-1" />
                      <Label htmlFor="channel-1">Boss直聘</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-2" />
                      <Label htmlFor="channel-2">拉勾网</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-3" />
                      <Label htmlFor="channel-3">智联招聘</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-4" />
                      <Label htmlFor="channel-4">前程无忧</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 职位描述 */}
              <div className="space-y-4">
                <h3 className="font-semibold">职位描述</h3>
                <div>
                  <Label htmlFor="job-description">职位概述 *</Label>
                  <Textarea
                    id="job-description"
                    placeholder="简要描述职位职责和工作内容"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="job-requirements">任职要求 *</Label>
                  <Textarea
                    id="job-requirements"
                    placeholder="列出对候选人的要求（每行一条）"
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="job-benefits">福利待遇</Label>
                  <Textarea
                    id="job-benefits"
                    placeholder="列出公司提供的福利（每行一条）"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" />
                  发布职位
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总职位数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已暂停</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.paused}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总应聘</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalApplicants}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">浏览量</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
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
                  placeholder="搜索职位名称"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 职位列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">
                进行中 ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="paused">
                已暂停 ({stats.paused})
              </TabsTrigger>
              <TabsTrigger value="closed">
                已关闭 ({stats.closed})
              </TabsTrigger>
              <TabsTrigger value="all">
                全部 ({stats.total})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : jobPostings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无职位数据</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobPostings.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status === 'active' ? '进行中' :
                             job.status === 'paused' ? '已暂停' : '已关闭'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ¥{job.salaryMin.toLocaleString()} - ¥{job.salaryMax.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.department}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.level}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            应聘: {job.applicantCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            浏览: {job.viewCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            发布: {job.publishDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            渠道: {job.channels.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          预览
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          分享
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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
