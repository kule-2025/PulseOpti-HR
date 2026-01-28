'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  BookOpen,
  TrendingUp,
  Award,
  Star,
  Search,
  Filter,
  Download,
  Eye,
} from 'lucide-react';

interface LearningRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  courseTitle: string;
  courseId: string;
  category: 'onboarding' | 'skills' | 'management' | 'compliance';
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  enrolledDate: string;
  completedDate?: string;
  lastAccessDate: string;
  duration: string;
  score?: number;
  certificate?: boolean;
}

// 模拟学习记录数据
const LEARNING_RECORDS_DATA: LearningRecord[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '销售部',
    courseTitle: '新员工入职引导 - 企业文化篇',
    courseId: 'course-1',
    category: 'onboarding',
    status: 'completed',
    progress: 100,
    enrolledDate: '2025-01-10',
    completedDate: '2025-01-12',
    lastAccessDate: '2025-01-12',
    duration: '45分钟',
    score: 95,
    certificate: true,
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '技术部',
    courseTitle: 'React前端开发进阶',
    courseId: 'course-5',
    category: 'skills',
    status: 'in-progress',
    progress: 65,
    enrolledDate: '2025-01-08',
    lastAccessDate: '2025-01-15',
    duration: '8小时',
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '销售部',
    courseTitle: '高效销售技巧与客户沟通',
    courseId: 'course-2',
    category: 'skills',
    status: 'in-progress',
    progress: 40,
    enrolledDate: '2025-01-10',
    lastAccessDate: '2025-01-14',
    duration: '3小时',
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '人力资源部',
    courseTitle: '劳动法律法规实务',
    courseId: 'course-4',
    category: 'compliance',
    status: 'completed',
    progress: 100,
    enrolledDate: '2024-12-25',
    completedDate: '2024-12-28',
    lastAccessDate: '2024-12-28',
    duration: '1.5小时',
    score: 88,
    certificate: true,
  },
  {
    id: '5',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '技术部',
    courseTitle: 'React前端开发进阶',
    courseId: 'course-5',
    category: 'skills',
    status: 'not-started',
    progress: 0,
    enrolledDate: '2025-01-15',
    lastAccessDate: '-',
    duration: '8小时',
  },
  {
    id: '6',
    employeeName: '周八',
    employeeId: 'EMP006',
    department: '市场部',
    courseTitle: '中高层领导力修炼',
    courseId: 'course-3',
    category: 'management',
    status: 'in-progress',
    progress: 20,
    enrolledDate: '2025-01-12',
    lastAccessDate: '2025-01-13',
    duration: '2天',
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

const STATUS_CONFIG = {
  'not-started': {
    label: '未开始',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  'in-progress': {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
};

export default function LearningRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤学习记录
  const filteredRecords = useMemo(() => {
    let records = LEARNING_RECORDS_DATA;

    // 按分类过滤
    if (categoryFilter !== 'all') {
      records = records.filter(record => record.category === categoryFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      records = records.filter(record => record.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      records = records.filter(record =>
        record.employeeName.toLowerCase().includes(query) ||
        record.employeeId.toLowerCase().includes(query) ||
        record.courseTitle.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query)
      );
    }

    return records;
  }, [searchQuery, categoryFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: LEARNING_RECORDS_DATA.length,
      completed: LEARNING_RECORDS_DATA.filter(r => r.status === 'completed').length,
      inProgress: LEARNING_RECORDS_DATA.filter(r => r.status === 'in-progress').length,
      notStarted: LEARNING_RECORDS_DATA.filter(r => r.status === 'not-started').length,
      avgProgress: LEARNING_RECORDS_DATA.reduce((sum, r) => sum + r.progress, 0) / LEARNING_RECORDS_DATA.length,
      avgScore: LEARNING_RECORDS_DATA.filter(r => r.score !== undefined).reduce((sum, r) => sum + (r.score || 0), 0) / LEARNING_RECORDS_DATA.filter(r => r.score !== undefined).length || 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            学习记录
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            跟踪员工学习进度和成绩
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>学习记录总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              已完成
            </CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均完成进度</CardDescription>
            <CardTitle className="text-3xl">{stats.avgProgress.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均成绩</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <Award className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              {stats.avgScore.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 学习记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>学习记录列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工、课程..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
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
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无学习记录
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有学习记录
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const categoryConfig = CATEGORY_CONFIG[record.category];
                const statusConfig = STATUS_CONFIG[record.status];

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {record.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {record.employeeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {record.employeeId}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {record.department}
                            </p>
                          </div>
                        </div>

                        {/* 课程信息 */}
                        <div className="flex-1 min-w-0 px-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                            {record.courseTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Badge variant="outline" className={categoryConfig.color}>
                              {categoryConfig.label}
                            </Badge>
                            <Clock className="h-3 w-3" />
                            <span>{record.duration}</span>
                          </div>
                        </div>

                        {/* 进度和状态 */}
                        <div className="w-48 shrink-0 px-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">进度</span>
                            <span className="font-medium">{record.progress}%</span>
                          </div>
                          <Progress value={record.progress} className="h-2" />
                          <div className="mt-2">
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* 成绩和证书 */}
                        <div className="w-40 shrink-0 px-4">
                          {record.score !== undefined && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{record.score}分</span>
                            </div>
                          )}
                          {record.certificate && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              <Award className="h-3 w-3 mr-1" />
                              已获证书
                            </Badge>
                          )}
                        </div>

                        {/* 时间信息 */}
                        <div className="w-40 shrink-0 px-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="truncate">{record.enrolledDate}</span>
                          </div>
                          {record.completedDate && (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="truncate">{record.completedDate}</span>
                            </div>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看详情
                          </Button>
                        </div>
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
