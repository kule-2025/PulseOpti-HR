'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Users,
  Clock,
  Play,
  Star,
  Plus,
  Search,
  Filter,
  Video,
  FileText,
  Link as LinkIcon,
  Download,
  Edit,
  Trash2,
  TrendingUp,
  Award,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'skills' | 'management' | 'compliance';
  type: 'video' | 'document' | 'online' | 'offline';
  status: 'draft' | 'published' | 'archived';
  duration: string;
  enrolled: number;
  completed: number;
  rating: number;
  reviews: number;
  instructor: string;
  lastUpdated: string;
  tags: string[];
}

// 模拟课程数据
const COURSES_DATA: Course[] = [
  {
    id: '1',
    title: '新员工入职引导 - 企业文化篇',
    description: '深入了解公司文化、价值观、发展历程,快速融入团队',
    category: 'onboarding',
    type: 'video',
    status: 'published',
    duration: '45分钟',
    enrolled: 95,
    completed: 78,
    rating: 4.8,
    reviews: 45,
    instructor: '人力资源部',
    lastUpdated: '2025-01-10',
    tags: ['企业文化', '新员工', '必修'],
  },
  {
    id: '2',
    title: '高效销售技巧与客户沟通',
    description: '掌握专业的销售话术、客户心理分析、谈判技巧',
    category: 'skills',
    type: 'online',
    status: 'published',
    duration: '3小时',
    enrolled: 28,
    completed: 12,
    rating: 4.9,
    reviews: 18,
    instructor: '销售总监',
    lastUpdated: '2025-01-08',
    tags: ['销售', '沟通', '实战'],
  },
  {
    id: '3',
    title: '中高层领导力修炼',
    description: '提升管理者的领导力、决策力、团队建设能力',
    category: 'management',
    type: 'offline',
    status: 'published',
    duration: '2天',
    enrolled: 15,
    completed: 0,
    rating: 4.7,
    reviews: 10,
    instructor: '外部讲师',
    lastUpdated: '2025-01-05',
    tags: ['领导力', '管理', '高级'],
  },
  {
    id: '4',
    title: '劳动法律法规实务',
    description: '劳动合同管理、用工风险防范、劳动争议处理',
    category: 'compliance',
    type: 'document',
    status: 'published',
    duration: '1.5小时',
    enrolled: 90,
    completed: 85,
    rating: 4.6,
    reviews: 35,
    instructor: '法务部',
    lastUpdated: '2024-12-20',
    tags: ['合规', '法律', '必修'],
  },
  {
    id: '5',
    title: 'React前端开发进阶',
    description: '深入理解React原理、性能优化、最佳实践',
    category: 'skills',
    type: 'online',
    status: 'published',
    duration: '8小时',
    enrolled: 22,
    completed: 8,
    rating: 4.9,
    reviews: 15,
    instructor: '技术总监',
    lastUpdated: '2025-01-12',
    tags: ['技术', '前端', 'React'],
  },
  {
    id: '6',
    title: '新员工信息安全意识培训',
    description: '了解企业信息安全规范,提升安全防范意识',
    category: 'onboarding',
    type: 'video',
    status: 'draft',
    duration: '30分钟',
    enrolled: 0,
    completed: 0,
    rating: 0,
    reviews: 0,
    instructor: 'IT部门',
    lastUpdated: '2025-01-15',
    tags: ['安全', '新员工', '必修'],
  },
];

const CATEGORY_CONFIG = {
  onboarding: {
    label: '入职培训',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  skills: {
    label: '技能培训',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  management: {
    label: '管理培训',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  compliance: {
    label: '合规培训',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
};

const TYPE_CONFIG = {
  video: {
    label: '视频课程',
    icon: Video,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
  },
  document: {
    label: '文档资料',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  },
  online: {
    label: '在线课程',
    icon: LinkIcon,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  offline: {
    label: '线下培训',
    icon: Users,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
};

const STATUS_CONFIG = {
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  published: {
    label: '已发布',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  archived: {
    label: '已归档',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  },
};

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤课程
  const filteredCourses = useMemo(() => {
    let courses = COURSES_DATA;

    // 按分类过滤
    if (categoryFilter !== 'all') {
      courses = courses.filter(course => course.category === categoryFilter);
    }

    // 按类型过滤
    if (typeFilter !== 'all') {
      courses = courses.filter(course => course.type === typeFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      courses = courses.filter(course => course.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return courses;
  }, [searchQuery, categoryFilter, typeFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: COURSES_DATA.length,
      published: COURSES_DATA.filter(c => c.status === 'published').length,
      totalEnrolled: COURSES_DATA.reduce((sum, c) => sum + c.enrolled, 0),
      totalCompleted: COURSES_DATA.reduce((sum, c) => sum + c.completed, 0),
      avgRating: COURSES_DATA.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / COURSES_DATA.filter(c => c.rating > 0).length || 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            课程管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            创建和管理培训课程
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建课程
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>课程总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              已发布
            </CardDescription>
            <CardTitle className="text-3xl">{stats.published}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总学习人次</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEnrolled}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均评分</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              {stats.avgRating.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 课程列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>课程列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无课程
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有课程
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const categoryConfig = CATEGORY_CONFIG[course.category];
                const typeConfig = TYPE_CONFIG[course.type];
                const statusConfig = STATUS_CONFIG[course.status];
                const TypeIcon = typeConfig.icon;

                const completionRate = course.enrolled > 0
                  ? (course.completed / course.enrolled) * 100
                  : 0;

                return (
                  <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3.5 w-3.5 fill-yellow-500" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${typeConfig.color}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>
                        <Badge variant="outline" className={categoryConfig.color}>
                          {categoryConfig.label}
                        </Badge>
                      </div>

                      <CardTitle className="text-base line-clamp-2 min-h-[2.5rem]">
                        {course.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-3">
                      <CardDescription className="line-clamp-2 flex-1">
                        {course.description}
                      </CardDescription>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-1">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 课程信息 */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="h-3.5 w-3.5" />
                          <span>{course.enrolled}人学习</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Award className="h-3.5 w-3.5" />
                          <span>讲师: {course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>完成率 {completionRate.toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2 mt-auto">
                        <Button size="sm" className="flex-1">
                          <Play className="h-3.5 w-3.5 mr-1" />
                          {course.status === 'published' ? '查看课程' : '编辑'}
                        </Button>
                        {course.status === 'published' && (
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
