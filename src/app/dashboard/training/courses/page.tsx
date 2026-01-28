'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  Video,
  FileText,
  Star,
  Users,
  Clock,
  Plus,
  Edit,
  Eye,
  Trash2,
  Filter,
  Search,
  PlayCircle,
  Upload,
  Download,
  Copy,
  Share2,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  category: string;
  type: 'video' | 'document' | 'live' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  description: string;
  coverImage: string;
  instructor: string;
  targetAudience: string;
  objectives: string[];
  resources: Resource[];
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  reviewCount: number;
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  lastUpdated: string;
  tags: string[];
}

interface Resource {
  id: string;
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live';
  title: string;
  url: string;
  duration?: number;
  fileSize?: string;
  order: number;
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: '新员工入职培训',
      category: '入职培训',
      type: 'mixed',
      difficulty: 'beginner',
      duration: 180,
      description: '帮助新员工快速了解公司文化、规章制度和业务流程',
      coverImage: '',
      instructor: 'HR部门',
      targetAudience: '新入职员工',
      objectives: [
        '了解公司发展历程和文化价值观',
        '熟悉公司规章制度和流程',
        '掌握基本工作技能和要求',
      ],
      resources: [
        { id: 'r1', type: 'video', title: '公司介绍', url: '', duration: 30, order: 1 },
        { id: 'r2', type: 'document', title: '员工手册', url: '', fileSize: '5.2MB', order: 2 },
        { id: 'r3', type: 'video', title: '业务流程讲解', url: '', duration: 90, order: 3 },
      ],
      enrollmentCount: 125,
      completionCount: 98,
      averageRating: 4.7,
      reviewCount: 45,
      status: 'published',
      publishDate: '2024-01-15',
      lastUpdated: '2024-12-10',
      tags: ['入职', '基础', '必修'],
    },
    {
      id: '2',
      title: '领导力提升课程',
      category: '管理培训',
      type: 'live',
      difficulty: 'advanced',
      duration: 360,
      description: '提升管理者的领导能力和团队管理水平',
      coverImage: '',
      instructor: '外部专家',
      targetAudience: '中层以上管理者',
      objectives: [
        '提升领导力核心能力',
        '掌握团队管理技巧',
        '增强决策能力和战略思维',
      ],
      resources: [
        { id: 'r4', type: 'live', title: '领导力工作坊', url: '', duration: 360, order: 1 },
      ],
      enrollmentCount: 45,
      completionCount: 38,
      averageRating: 4.9,
      reviewCount: 32,
      status: 'published',
      publishDate: '2024-03-20',
      lastUpdated: '2024-11-28',
      tags: ['领导力', '管理', '高级'],
    },
    {
      id: '3',
      title: 'Excel高级应用培训',
      category: '技能培训',
      type: 'video',
      difficulty: 'intermediate',
      duration: 240,
      description: 'Excel高级功能和数据分析技巧',
      coverImage: '',
      instructor: '技术部',
      targetAudience: '全体员工',
      objectives: [
        '掌握Excel高级函数',
        '学会数据透视表和数据可视化',
        '提升数据分析效率',
      ],
      resources: [
        { id: 'r5', type: 'video', title: '函数篇', url: '', duration: 90, order: 1 },
        { id: 'r6', type: 'video', title: '数据透视表篇', url: '', duration: 75, order: 2 },
        { id: 'r7', type: 'video', title: '图表与可视化', url: '', duration: 75, order: 3 },
      ],
      enrollmentCount: 78,
      completionCount: 52,
      averageRating: 4.5,
      reviewCount: 28,
      status: 'published',
      publishDate: '2024-05-10',
      lastUpdated: '2024-12-05',
      tags: ['Excel', '办公技能', '实用'],
    },
  ]);

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    category: '',
    type: 'video',
    difficulty: 'beginner',
    duration: '',
    description: '',
    instructor: '',
    targetAudience: '',
  });

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'published').length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
    totalCompletions: courses.reduce((sum, c) => sum + c.completionCount, 0),
    averageRating: (courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length).toFixed(1),
    totalDuration: courses.reduce((sum, c) => sum + c.duration, 0),
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, any> = {
      beginner: { label: '初级', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      intermediate: { label: '中级', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      advanced: { label: '高级', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[difficulty];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      published: { label: '已发布', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      archived: { label: '已归档', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      video: Video,
      document: FileText,
      live: PlayCircle,
      mixed: BookOpen,
    };
    return icons[type] || BookOpen;
  };

  const handleCreateCourse = () => {
    if (!courseFormData.title || !courseFormData.category) {
      toast.error('请填写完整的课程信息');
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseFormData.title,
      category: courseFormData.category,
      type: courseFormData.type as any,
      difficulty: courseFormData.difficulty as any,
      duration: Number(courseFormData.duration),
      description: courseFormData.description,
      coverImage: '',
      instructor: courseFormData.instructor,
      targetAudience: courseFormData.targetAudience,
      objectives: [],
      resources: [],
      enrollmentCount: 0,
      completionCount: 0,
      averageRating: 0,
      reviewCount: 0,
      status: 'draft',
      publishDate: '',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: [],
    };

    setCourses([...courses, newCourse]);
    setShowCreateDialog(false);
    setCourseFormData({
      title: '',
      category: '',
      type: 'video',
      difficulty: 'beginner',
      duration: '',
      description: '',
      instructor: '',
      targetAudience: '',
    });
    toast.success('课程创建成功');
  };

  const handlePublishCourse = (courseId: string) => {
    setCourses(courses.map(c =>
      c.id === courseId ? { ...c, status: 'published' as const, publishDate: new Date().toISOString().split('T')[0] } : c
    ));
    toast.success('课程已发布');
  };

  const handleArchiveCourse = (courseId: string) => {
    setCourses(courses.map(c =>
      c.id === courseId ? { ...c, status: 'archived' as const } : c
    ));
    toast.success('课程已归档');
  };

  const filteredCourses = courses.filter(course => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'published' && course.status === 'published') ||
      (activeTab === 'draft' && course.status === 'draft');
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              课程管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              创建和管理培训课程，支持视频、文档、直播等多种形式
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出课程
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              创建课程
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">课程总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <BookOpen className="h-3 w-3 mr-1" />
                门
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.publishedCourses}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                门
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">学习人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalEnrollments}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人次
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">完成人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCompletions}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                人次
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均评分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <Star className="h-6 w-6 fill-current" />
                {stats.averageRating}
              </div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                分
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">总时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{Math.floor(stats.totalDuration / 60)}h</div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                分钟
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 课程列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>课程列表</CardTitle>
                <CardDescription>管理所有培训课程</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索课程..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">全部课程 ({courses.length})</TabsTrigger>
                <TabsTrigger value="published">已发布 ({courses.filter(c => c.status === 'published').length})</TabsTrigger>
                <TabsTrigger value="draft">草稿 ({courses.filter(c => c.status === 'draft').length})</TabsTrigger>
              </TabsList>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const TypeIcon = getTypeIcon(course.type);
                  return (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
                        <div className="absolute top-4 left-4">
                          {getStatusBadge(course.status)}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          {getDifficultyBadge(course.difficulty)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TypeIcon className="h-16 w-16 text-white/80" />
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                            {course.title}
                          </h3>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" />
                              <span>{course.enrollmentCount}人学习</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.floor(course.averageRating)
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-gray-600 dark:text-gray-400 ml-1">
                                {course.averageRating} ({course.reviewCount})
                              </span>
                            </div>
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              {((course.completionCount / course.enrollmentCount) * 100).toFixed(0)}% 完成
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {course.status === 'draft' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handlePublishCourse(course.id)}
                              >
                                发布
                              </Button>
                            )}
                            {course.status === 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchiveCourse(course.id)}
                              >
                                归档
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* 创建课程对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建新课程</DialogTitle>
              <DialogDescription>
                填写课程基本信息，创建后可以添加课程内容
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">课程名称 *</Label>
                <Input
                  id="title"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="例如：新员工入职培训"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">课程类别 *</Label>
                <Select value={courseFormData.category} onValueChange={(v) => setCourseFormData({ ...courseFormData, category: v })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="入职培训">入职培训</SelectItem>
                    <SelectItem value="管理培训">管理培训</SelectItem>
                    <SelectItem value="技能培训">技能培训</SelectItem>
                    <SelectItem value="合规培训">合规培训</SelectItem>
                    <SelectItem value="安全培训">安全培训</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">课程类型</Label>
                <Select value={courseFormData.type} onValueChange={(v) => setCourseFormData({ ...courseFormData, type: v })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">视频课程</SelectItem>
                    <SelectItem value="document">文档课程</SelectItem>
                    <SelectItem value="live">直播课程</SelectItem>
                    <SelectItem value="mixed">混合课程</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">难度等级</Label>
                <Select value={courseFormData.difficulty} onValueChange={(v) => setCourseFormData({ ...courseFormData, difficulty: v })}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初级</SelectItem>
                    <SelectItem value="intermediate">中级</SelectItem>
                    <SelectItem value="advanced">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">课程时长（分钟）</Label>
                <Input
                  id="duration"
                  type="number"
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">授课讲师</Label>
                <Input
                  id="instructor"
                  value={courseFormData.instructor}
                  onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                  placeholder="例如：HR部门、外部专家"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="targetAudience">目标学员</Label>
                <Input
                  id="targetAudience"
                  value={courseFormData.targetAudience}
                  onChange={(e) => setCourseFormData({ ...courseFormData, targetAudience: e.target.value })}
                  placeholder="例如：新入职员工、中层管理者"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">课程描述</Label>
                <Textarea
                  id="description"
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="请描述课程的主要内容和学习目标..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
              <Button onClick={handleCreateCourse}>创建课程</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
