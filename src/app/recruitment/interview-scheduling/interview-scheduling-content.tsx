'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit3,
  Video,
  MapPin,
  User,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Bell,
  Eye,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/theme';
import { format } from 'date-fns';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Interview {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateAvatar: string;
  position: string;
  department: string;
  jobId: number;
  jobTitle: string;
  interviewer: string[];
  round: number;
  roundName: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'offline' | 'phone';
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  reminderSent: boolean;
}

export default function InterviewSchedulingContent() {
  const [activeTab, setActiveTab] = useLocalStorage('interview-tab', 'upcoming');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword] = useDebounce(searchKeyword, 300);
  const [selectedDepartment, setSelectedDepartment] = useLocalStorage('interview-dept', 'all');

  // 获取面试列表
  const {
    data: interviews = [],
    loading,
    error,
    execute: fetchInterviews,
  } = useAsync<Interview[]>();

  const loadInterviews = useCallback(async (): Promise<Interview[]> => {
    try {
      const cacheKey = `interviews-${activeTab}-${selectedDepartment}-${debouncedKeyword}`;
      return await fetchWithCache<Interview[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          tab: activeTab,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
          ...(debouncedKeyword && { keyword: debouncedKeyword }),
        });

        const response = await get<{ success: boolean; data?: Interview[] }>(
          `/api/recruitment/interviews?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000); // 3分钟缓存
    } catch (err) {
      console.error('获取面试列表失败:', err);
      monitor.trackError('loadInterviews', err as Error);
      throw err;
    }
  }, [activeTab, selectedDepartment, debouncedKeyword]);

  useEffect(() => {
    fetchInterviews(loadInterviews);
  }, [activeTab, selectedDepartment, fetchInterviews, loadInterviews]);

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
    total: interviews.length,
    upcoming: interviews.filter((item: any) => i => i.status === 'scheduled' || i.status === 'confirmed').length,
    completed: interviews.filter((item: any) => i => i.status === 'completed').length,
    today: interviews.filter((item: any) => i => i.date === format(new Date(), 'yyyy-MM-dd')).length,
  }), [interviews]);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      no_show: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'offline':
        return <MapPin className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  }, []);

  const handleConfirm = useCallback(async (id: number) => {
    try {
      await put<{ success: boolean }>(`/api/recruitment/interviews/${id}`, { status: 'confirmed' });
      await fetchInterviews(loadInterviews);
    } catch (err) {
      console.error('确认面试失败:', err);
      monitor.trackError('confirmInterview', err as Error);
      alert('操作失败');
    }
  }, [fetchInterviews, loadInterviews]);

  const handleCancel = useCallback(async (id: number) => {
    if (!confirm('确定要取消此面试吗？')) {
      return;
    }
    try {
      await put<{ success: boolean }>(`/api/recruitment/interviews/${id}`, { status: 'cancelled' });
      await fetchInterviews(loadInterviews);
    } catch (err) {
      console.error('取消面试失败:', err);
      monitor.trackError('cancelInterview', err as Error);
      alert('操作失败');
    }
  }, [fetchInterviews, loadInterviews]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchInterviews(loadInterviews)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">面试安排</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理面试日程，支持视频/现场/电话面试
          </p>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              安排面试
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>安排新面试</DialogTitle>
              <DialogDescription>
                选择候选人，安排面试时间
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate">候选人 *</Label>
                <Select>
                  <SelectTrigger id="candidate">
                    <SelectValue placeholder="选择候选人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">李明 - 高级前端工程师</SelectItem>
                    <SelectItem value="2">王芳 - 产品经理</SelectItem>
                    <SelectItem value="3">张伟 - 后端工程师</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="round">面试轮次 *</Label>
                <Select>
                  <SelectTrigger id="round">
                    <SelectValue placeholder="选择轮次" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">初试</SelectItem>
                    <SelectItem value="2">复试</SelectItem>
                    <SelectItem value="3">终面</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interviewers">面试官 *</Label>
                <Input id="interviewers" placeholder="输入面试官姓名（多个用逗号分隔）" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interview-date">面试日期 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '选择日期'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="interview-time">面试时间 *</Label>
                  <Input id="interview-time" type="time" />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">面试时长（分钟）</Label>
                <Input id="duration" type="number" defaultValue="60" />
              </div>
              <div>
                <Label htmlFor="interview-type">面试方式 *</Label>
                <Select>
                  <SelectTrigger id="interview-type">
                    <SelectValue placeholder="选择方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        视频面试
                      </div>
                    </SelectItem>
                    <SelectItem value="offline">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        现场面试
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        电话面试
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">面试地点</Label>
                <Input id="location" placeholder="例如：线上会议室或公司会议室" />
              </div>
              <div>
                <Label htmlFor="notes">备注</Label>
                <Textarea id="notes" placeholder="填写面试备注信息" rows={3} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsScheduleDialogOpen(false)}>
                  取消
                </Button>
                <Button className="flex-1">
                  确认安排
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总面试数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待面试</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">今日面试</p>
                    <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                  </div>
                  <Bell className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-purple-600" />
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
                  placeholder="搜索候选人或职位"
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

      {/* 面试列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming">待面试 ({stats.upcoming})</TabsTrigger>
              <TabsTrigger value="today">今日面试 ({stats.today})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({stats.completed})</TabsTrigger>
              <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无面试安排</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>候选人</TableHead>
                  <TableHead>职位信息</TableHead>
                  <TableHead>面试轮次</TableHead>
                  <TableHead>面试官</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>方式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{interview.candidateAvatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{interview.candidateName}</div>
                          <div className="text-xs text-gray-500">{interview.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{interview.jobTitle}</div>
                        <div className="text-xs text-gray-500">{interview.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{interview.roundName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {interview.interviewer.map((name, idx) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                            <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{interview.date}</div>
                        <div className="text-xs text-gray-500">{interview.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(interview.type)}
                        <span className="text-sm">
                          {interview.type === 'video' ? '视频' :
                           interview.type === 'offline' ? '现场' : '电话'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status === 'scheduled' ? '待确认' :
                         interview.status === 'confirmed' ? '已确认' :
                         interview.status === 'completed' ? '已完成' :
                         interview.status === 'cancelled' ? '已取消' : '缺席'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {interview.notes}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {interview.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirm(interview.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {(interview.status === 'scheduled' || interview.status === 'confirmed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(interview.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
