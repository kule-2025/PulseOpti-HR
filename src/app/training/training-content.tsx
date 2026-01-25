'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  CheckCircle,
  Play,
  Eye,
  Calendar,
} from 'lucide-react';

interface TrainingCourse {
  id: string;
  courseId: string;
  name: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  totalHours: number;
  maxParticipants: number;
  enrolledCount: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
  price: number;
  materials: string[];
  createdAt: string;
}

export default function TrainingPageContent() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);

  const [formData, setFormData] = useState({
    courseId: '',
    name: '',
    description: '',
    category: '',
    instructor: '',
    duration: 0,
    totalHours: 0,
    maxParticipants: 0,
    startDate: '',
    endDate: '',
    price: 0,
  });

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockCourses: TrainingCourse[] = [
        {
          id: '1',
          courseId: 'TC001',
          name: '领导力提升培训',
          description: '提升管理人员的领导力和团队管理能力',
          category: '管理技能',
          instructor: '张老师',
          duration: 3,
          totalHours: 24,
          maxParticipants: 30,
          enrolledCount: 25,
          status: 'ongoing',
          startDate: '2025-01-20',
          endDate: '2025-01-22',
          price: 2000,
          materials: ['课件.pdf', '案例集.pdf'],
          createdAt: '2025-01-15',
        },
        {
          id: '2',
          courseId: 'TC002',
          name: '项目管理实战',
          description: 'PMP项目管理方法论和实战技能',
          category: '专业技能',
          instructor: '李老师',
          duration: 5,
          totalHours: 40,
          maxParticipants: 25,
          enrolledCount: 20,
          status: 'ongoing',
          startDate: '2025-01-18',
          endDate: '2025-01-22',
          price: 5000,
          materials: ['教材.pdf', '习题集.pdf'],
          createdAt: '2025-01-10',
        },
        {
          id: '3',
          courseId: 'TC003',
          name: '新员工入职培训',
          description: '公司文化、制度和业务流程介绍',
          category: '入职培训',
          instructor: 'HR部门',
          duration: 2,
          totalHours: 16,
          maxParticipants: 50,
          enrolledCount: 45,
          status: 'published',
          startDate: '2025-02-01',
          endDate: '2025-02-02',
          price: 0,
          materials: ['手册.pdf'],
          createdAt: '2025-01-20',
        },
      ];

      setCourses(mockCourses);
      setPagination((prev) => ({
        ...prev,
        total: mockCourses.length,
      }));
    } catch (error) {
      console.error('获取培训课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(courses.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      courseId: '',
      name: '',
      description: '',
      category: '',
      instructor: '',
      duration: 0,
      totalHours: 0,
      maxParticipants: 0,
      startDate: '',
      endDate: '',
      price: 0,
    });
    setDialogOpen(true);
  };

  const handleEditCourse = (course: TrainingCourse) => {
    setEditingCourse(course);
    setFormData({
      courseId: course.courseId,
      name: course.name,
      description: course.description,
      category: course.category,
      instructor: course.instructor,
      duration: course.duration,
      totalHours: course.totalHours,
      maxParticipants: course.maxParticipants,
      startDate: course.startDate,
      endDate: course.endDate,
      price: course.price,
    });
    setDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    try {
      alert('保存功能开发中...');
      setDialogOpen(false);
    } catch (error) {
      console.error('保存培训课程失败:', error);
      alert('操作失败');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('确定要删除该课程吗？')) {
      return;
    }

    try {
      alert('删除成功');
      fetchCourses();
    } catch (error) {
      console.error('删除培训课程失败:', error);
      alert('操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: Edit },
      published: { label: '已发布', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      ongoing: { label: '进行中', color: 'bg-green-100 text-green-700', icon: Play },
      completed: { label: '已完成', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: BookOpen,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-500" />
            培训管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理培训课程、学习记录
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            onClick={handleAddCourse}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建课程
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总课程数</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter((item: any) => (c) => c.status === 'ongoing').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总学员</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + c.enrolledCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总课时</p>
                <p className="text-2xl font-bold text-orange-600">
                  {courses.reduce((sum, c) => sum + c.totalHours, 0)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <Input
                placeholder="搜索课程名称、讲师"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>课程分类</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部分类</SelectItem>
                  <SelectItem value="管理技能">管理技能</SelectItem>
                  <SelectItem value="专业技能">专业技能</SelectItem>
                  <SelectItem value="入职培训">入职培训</SelectItem>
                  <SelectItem value="职业素养">职业素养</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="ongoing">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', category: '', status: '' })}>
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                已选择 <span className="font-bold">{selectedIds.length}</span> 项
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出选中
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 培训课程列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === courses.length && courses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>课程编号</TableHead>
                <TableHead>课程名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>讲师</TableHead>
                <TableHead>培训时间</TableHead>
                <TableHead>培训时长</TableHead>
                <TableHead>报名情况</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(course.id)}
                        onCheckedChange={(checked) => handleSelectOne(course.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{course.courseId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{course.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category}</Badge>
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{course.startDate}</div>
                        <div className="text-gray-500">至 {course.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {course.duration}天 / {course.totalHours}小时
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{course.enrolledCount}/{course.maxParticipants}</span>
                        </div>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(course.enrolledCount / course.maxParticipants) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {course.price === 0 ? '免费' : `¥${course.price.toLocaleString()}`}
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {pagination.total} 条记录，每页 {pagination.limit} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 新增/编辑课程对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? '编辑课程' : '新建课程'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? '修改课程信息' : '创建新的培训课程'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseId">课程编号 *</Label>
                <Input
                  id="courseId"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  placeholder="例如：TC001"
                />
              </div>
              <div>
                <Label htmlFor="name">课程名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入课程名称"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">课程描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述课程内容"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">课程分类 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="管理技能">管理技能</SelectItem>
                    <SelectItem value="专业技能">专业技能</SelectItem>
                    <SelectItem value="入职培训">入职培训</SelectItem>
                    <SelectItem value="职业素养">职业素养</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructor">讲师 *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="输入讲师姓名"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">培训天数 *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  placeholder="例如：3"
                />
              </div>
              <div>
                <Label htmlFor="totalHours">培训时长（小时）*</Label>
                <Input
                  id="totalHours"
                  type="number"
                  value={formData.totalHours}
                  onChange={(e) => setFormData({ ...formData, totalHours: Number(e.target.value) })}
                  placeholder="例如：24"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">最大人数 *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  placeholder="例如：30"
                />
              </div>
              <div>
                <Label htmlFor="price">价格</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0表示免费"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">开始日期 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">结束日期 *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveCourse}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
