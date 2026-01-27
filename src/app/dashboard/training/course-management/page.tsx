'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Users, Clock, BookOpen, Play, Edit, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  duration: number;
  enrolled: number;
  completed: number;
  rating: number;
  createdAt: string;
}

export default function CourseManagementPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setCourses([
        { id: '1', name: '新员工入职培训', category: '入职培训', status: 'published', duration: 8, enrolled: 120, completed: 98, rating: 4.8, createdAt: '2024-01-15' },
        { id: '2', name: '领导力提升课程', category: '管理培训', status: 'published', duration: 12, enrolled: 45, completed: 32, rating: 4.9, createdAt: '2024-02-10' },
        { id: '3', name: '销售技巧培训', category: '技能培训', status: 'published', duration: 6, enrolled: 89, completed: 67, rating: 4.6, createdAt: '2024-03-05' },
        { id: '4', name: '项目管理基础', category: '管理培训', status: 'draft', duration: 10, enrolled: 0, completed: 0, rating: 0, createdAt: '2024-04-01' },
        { id: '5', name: '沟通技巧提升', category: '技能培训', status: 'published', duration: 5, enrolled: 156, completed: 134, rating: 4.7, createdAt: '2024-04-10' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">课程管理</h1>
          <p className="text-muted-foreground mt-1">管理企业培训课程</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />新建课程</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              课程总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">所有课程</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              总报名人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.enrolled, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">累计学习</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Play className="h-4 w-4" />
              完成课程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.filter(c => c.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground mt-1">已发布课程</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              总学时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.duration, 0)}h</div>
            <p className="text-xs text-muted-foreground mt-1">课程时长</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索课程名称..."
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
            <SelectItem value="archived">已归档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 课程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>课程列表</CardTitle>
          <CardDescription>管理所有培训课程</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                    <Badge
                      variant={
                        course.status === 'published'
                          ? 'default'
                          : course.status === 'draft'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {course.status === 'published' ? '已发布' : course.status === 'draft' ? '草稿' : '已归档'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{course.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}小时
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled}人已报名
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.completed}人完成
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      ⭐ {course.rating > 0 ? course.rating.toFixed(1) : '暂无评分'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的课程
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
