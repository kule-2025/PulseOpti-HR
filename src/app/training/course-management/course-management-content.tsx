'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  BookOpen,
  Plus,
  Edit3,
  Eye,
  PlayCircle,
  CheckCircle2,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  FileText,
  Video,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number;
}

interface TrainingCourse {
  id: string;
  title: string;
  description?: string;
  type?: string;
  category?: string;
  duration: number;
  instructorName?: string;
  rating?: number;
  reviewCount?: number;
  maxParticipants?: number;
  learnerCount?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  lessons?: Lesson[];
}

export default function CourseManagementContent() {
  const [activeTab, setActiveTab] = useLocalStorage('course-tab', 'all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useLocalStorage('course-category', 'all');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: courses = [],
    loading,
    error,
    execute: fetchCourses,
  } = useAsync<TrainingCourse[]>();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLearners: 0,
    avgRating: 0,
    totalHours: 0,
  });

  const loadCourses = useCallback(async (): Promise<TrainingCourse[]> => {
    try {
      const cacheKey = `courses-${categoryFilter}`;
      return await fetchWithCache<TrainingCourse[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: TrainingCourse[] }>(
          `/api/training/courses?isActive=true&limit=100`
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error('加载课程失败:', err);
      monitor.trackError('loadCourses', err as Error);
      throw err;
    }
  }, [categoryFilter]);

  const loadStats = useCallback(async (coursesList: TrainingCourse[]) => {
    const totalCourses = coursesList.length;
    const totalLearners = coursesList.reduce((sum, c) => sum + (c.learnerCount || 0), 0);
    const avgRating = coursesList.length > 0
      ? coursesList.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesList.length
      : 0;
    const totalHours = coursesList.reduce((sum, c) => sum + (c.duration || 0), 0);

    setStats({ totalCourses, totalLearners, avgRating, totalHours });
  }, []);

  useEffect(() => {
    fetchCourses(loadCourses).then((result) => {
      const coursesList = (result as any) || [];
      loadStats(coursesList);
    });
  }, [categoryFilter, fetchCourses, loadCourses, loadStats]);

  const filteredCourses = useMemo(() => {
    return courses.filter((item: any) => course => {
      const matchesSearch = !debouncedQuery ||
        course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(debouncedQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [courses, debouncedQuery, categoryFilter]);

  const categories = [
    { id: 'all', name: '全部课程' },
    { id: 'management', name: '管理培训' },
    { id: 'skill', name: '技能培训' },
    { id: 'professional', name: '专业培训' },
    { id: 'compliance', name: '合规培训' },
  ];

  const getStatusBadge = useCallback((isActive?: boolean, startDate?: string, endDate?: string) => {
    if (!isActive) {
      return <Badge variant="outline">已下架</Badge>;
    }

    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && now < start) {
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">未开始</Badge>;
    }

    if (end && now > end) {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">已结束</Badge>;
    }

    return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">进行中</Badge>;
  }, []);

  const getLessonTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'document':
        return FileText;
      case 'quiz':
        return CheckCircle2;
      default:
        return BookOpen;
    }
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
            <Button onClick={() => fetchCourses(loadCourses)} variant="outline">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">课程管理</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理培训课程、课程内容和学员学习情况
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          创建课程
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">课程总数</CardTitle>
                <div className="rounded-lg p-2 bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCourses}
                  <span className="text-sm font-normal text-gray-500 ml-1">门</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">在学人数</CardTitle>
                <div className="rounded-lg p-2 bg-green-100">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalLearners}
                  <span className="text-sm font-normal text-gray-500 ml-1">人</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">平均评分</CardTitle>
                <div className="rounded-lg p-2 bg-yellow-100">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.avgRating.toFixed(1)}
                  <span className="text-sm font-normal text-gray-500 ml-1">分</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">总课时</CardTitle>
                <div className="rounded-lg p-2 bg-purple-100">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalHours}
                  <span className="text-sm font-normal text-gray-500 ml-1">小时</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新课程</DialogTitle>
            <DialogDescription>填写课程基本信息和内容</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>课程标题 *</Label>
              <Input placeholder="请输入课程标题" className="mt-1" />
            </div>
            <div>
              <Label>课程描述</Label>
              <Textarea placeholder="请输入课程描述" className="mt-1" rows={3} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>课程分类</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">管理培训</SelectItem>
                    <SelectItem value="skill">技能培训</SelectItem>
                    <SelectItem value="professional">专业培训</SelectItem>
                    <SelectItem value="compliance">合规培训</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>课程时长（小时）</Label>
                <Input type="number" placeholder="请输入时长" className="mt-1" />
              </div>
              <div>
                <Label>讲师</Label>
                <Input placeholder="请输入讲师姓名" className="mt-1" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>开始日期</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>结束日期</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>创建课程</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>课程列表</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索课程标题"
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">暂无课程数据</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>课程信息</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>讲师</TableHead>
                  <TableHead>学员</TableHead>
                  <TableHead>评分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {course.duration}小时
                          {course.lessons && (
                            <span>· {course.lessons.length}课时</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>{course.instructorName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{course.learnerCount || 0}</span>
                        {course.maxParticipants && (
                          <span className="text-gray-500">/{course.maxParticipants}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.rating.toFixed(1)}</span>
                          {course.reviewCount && (
                            <span className="text-sm text-gray-500">({course.reviewCount})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(course.isActive, course.startDate, course.endDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
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
