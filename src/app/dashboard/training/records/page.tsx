'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Users,
  Award,
  Search,
  Filter,
  Download,
  Calendar,
  BarChart,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface LearningRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  courseId: string;
  courseName: string;
  courseCategory: string;
  enrollmentDate: string;
  lastStudyDate: string | null;
  progress: number;
  status: 'in-progress' | 'completed' | 'not-started' | 'expired';
  totalDuration: number;
  completedDuration: number;
  score?: number;
  certificateIssued?: boolean;
  learningSessions: LearningSession[];
}

interface LearningSession {
  id: string;
  date: string;
  duration: number;
  contentId: string;
  contentName: string;
}

export default function LearningRecordsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      position: '工程师',
      courseId: '1',
      courseName: '新员工入职培训',
      courseCategory: '入职培训',
      enrollmentDate: '2024-01-15',
      lastStudyDate: '2024-12-15',
      progress: 100,
      status: 'completed',
      totalDuration: 180,
      completedDuration: 180,
      score: 95,
      certificateIssued: true,
      learningSessions: [
        { id: 's1', date: '2024-01-15', duration: 30, contentId: 'r1', contentName: '公司介绍' },
        { id: 's2', date: '2024-01-16', duration: 60, contentId: 'r3', contentName: '业务流程讲解' },
        { id: 's3', date: '2024-01-18', duration: 90, contentId: 'r2', contentName: '员工手册' },
      ],
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '销售部',
      position: '销售经理',
      courseId: '2',
      courseName: '领导力提升课程',
      courseCategory: '管理培训',
      enrollmentDate: '2024-03-20',
      lastStudyDate: '2024-12-12',
      progress: 85,
      status: 'in-progress',
      totalDuration: 360,
      completedDuration: 306,
      learningSessions: [
        { id: 's4', date: '2024-03-20', duration: 120, contentId: 'r4', contentName: '领导力工作坊-1' },
        { id: 's5', date: '2024-03-25', duration: 120, contentId: 'r4', contentName: '领导力工作坊-2' },
        { id: 's6', date: '2024-12-12', duration: 66, contentId: 'r4', contentName: '领导力工作坊-3' },
      ],
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: '王五',
      department: '产品部',
      position: '产品经理',
      courseId: '3',
      courseName: 'Excel高级应用培训',
      courseCategory: '技能培训',
      enrollmentDate: '2024-05-10',
      lastStudyDate: '2024-11-20',
      progress: 65,
      status: 'in-progress',
      totalDuration: 240,
      completedDuration: 156,
      learningSessions: [
        { id: 's7', date: '2024-05-10', duration: 90, contentId: 'r5', contentName: '函数篇' },
        { id: 's8', date: '2024-11-20', duration: 66, contentId: 'r6', contentName: '数据透视表篇' },
      ],
    },
    {
      id: '4',
      employeeId: 'EMP004',
      employeeName: '赵六',
      department: '市场部',
      position: '市场专员',
      courseId: '3',
      courseName: 'Excel高级应用培训',
      courseCategory: '技能培训',
      enrollmentDate: '2024-06-01',
      lastStudyDate: '2024-10-15',
      progress: 100,
      status: 'completed',
      totalDuration: 240,
      completedDuration: 240,
      score: 88,
      certificateIssued: true,
      learningSessions: [
        { id: 's9', date: '2024-06-01', duration: 90, contentId: 'r5', contentName: '函数篇' },
        { id: 's10', date: '2024-06-05', duration: 75, contentId: 'r6', contentName: '数据透视表篇' },
        { id: 's11', date: '2024-10-15', duration: 75, contentId: 'r7', contentName: '图表与可视化' },
      ],
    },
    {
      id: '5',
      employeeId: 'EMP005',
      employeeName: '钱七',
      department: '技术部',
      position: '工程师',
      courseId: '3',
      courseName: 'Excel高级应用培训',
      courseCategory: '技能培训',
      enrollmentDate: '2024-07-10',
      lastStudyDate: null,
      progress: 0,
      status: 'not-started',
      totalDuration: 240,
      completedDuration: 0,
      learningSessions: [],
    },
  ]);

  const stats = {
    totalLearners: new Set(learningRecords.map(r => r.employeeId)).size,
    inProgress: learningRecords.filter(r => r.status === 'in-progress').length,
    completed: learningRecords.filter(r => r.status === 'completed').length,
    notStarted: learningRecords.filter(r => r.status === 'not-started').length,
    avgProgress: Math.round(
      learningRecords.reduce((sum, r) => sum + r.progress, 0) / learningRecords.length
    ),
    totalLearningTime: learningRecords.reduce((sum, r) => sum + r.completedDuration, 0),
    certificateIssued: learningRecords.filter(r => r.certificateIssued === true).length,
    avgScore: (() => {
      const scoredRecords = learningRecords.filter(r => r.score !== undefined);
      if (scoredRecords.length === 0) return 0;
      return scoredRecords.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRecords.length;
    })(),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'in-progress': { label: '学习中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'not-started': { label: '未开始', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      expired: { label: '已过期', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const filteredRecords = learningRecords.filter(record => {
    const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const departmentStats = () => {
    const departments = Array.from(new Set(learningRecords.map(r => r.department)));
    return departments.map(dept => {
      const deptRecords = learningRecords.filter(r => r.department === dept);
      return {
        name: dept,
        total: new Set(deptRecords.map(r => r.employeeId)).size,
        completed: deptRecords.filter(r => r.status === 'completed').length,
        avgProgress: Math.round(deptRecords.reduce((sum, r) => sum + r.progress, 0) / deptRecords.length),
      };
    });
  };

  const courseStats = () => {
    const courses = Array.from(new Set(learningRecords.map(r => r.courseId)));
    return courses.map(courseId => {
      const courseRecords = learningRecords.filter(r => r.courseId === courseId);
      const firstRecord = courseRecords[0];
      return {
        id: courseId,
        name: firstRecord.courseName,
        category: firstRecord.courseCategory,
        totalEnrolled: courseRecords.length,
        completed: courseRecords.filter(r => r.status === 'completed').length,
        avgProgress: Math.round(courseRecords.reduce((sum, r) => sum + r.progress, 0) / courseRecords.length),
        avgScore: (() => {
          const scoredRecords = courseRecords.filter(r => r.score !== undefined);
          if (scoredRecords.length === 0) return 0;
          return scoredRecords.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRecords.length;
        })(),
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              学习记录
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              跟踪员工学习进度，监控培训效果
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <Target className="h-4 w-4 mr-2" />
              发送学习提醒
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">学习人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLearners}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">学习中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <PlayCircle className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgProgress}%</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                整体进度
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">学习时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{Math.floor(stats.totalLearningTime / 60)}h</div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                总时长
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已发证书</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.certificateIssued}</div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                份
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              学习概览
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              学习记录
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              统计分析
            </TabsTrigger>
          </TabsList>

          {/* 学习概览 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 部门学习概况 */}
              <Card>
                <CardHeader>
                  <CardTitle>部门学习概况</CardTitle>
                  <CardDescription>各部门学习进度对比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentStats().map((dept, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {dept.completed}/{dept.total} ({dept.avgProgress}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              dept.avgProgress >= 80
                                ? 'bg-green-500'
                                : dept.avgProgress >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${dept.avgProgress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 课程学习概况 */}
              <Card>
                <CardHeader>
                  <CardTitle>课程学习概况</CardTitle>
                  <CardDescription>各课程学习情况统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseStats().map((course, idx) => (
                      <div key={idx} className="p-4 border rounded-lg dark:border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{course.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{course.category}</p>
                          </div>
                          <Badge variant="secondary">{course.avgProgress}%</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">学习人数</span>
                            <div className="font-medium text-gray-900 dark:text-white">{course.totalEnrolled}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">完成人数</span>
                            <div className="font-medium text-green-600 dark:text-green-400">{course.completed}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">平均分数</span>
                            <div className="font-medium text-purple-600 dark:text-purple-400">
                              {course.avgScore > 0 ? course.avgScore.toFixed(1) : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 学习记录 */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>学习记录详情</CardTitle>
                    <CardDescription>查看所有员工的学习进度</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="技术部">技术部</SelectItem>
                        <SelectItem value="产品部">产品部</SelectItem>
                        <SelectItem value="销售部">销售部</SelectItem>
                        <SelectItem value="市场部">市场部</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="in-progress">学习中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="not-started">未开始</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工</TableHead>
                        <TableHead>部门/职位</TableHead>
                        <TableHead>课程</TableHead>
                        <TableHead>报名日期</TableHead>
                        <TableHead>进度</TableHead>
                        <TableHead>学习时长</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>成绩</TableHead>
                        <TableHead>证书</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                  {record.employeeName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{record.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{record.department}</div>
                              <div className="text-gray-500 dark:text-gray-400">{record.position}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.courseName}</div>
                              <Badge variant="outline" className="text-xs">
                                {record.courseCategory}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{record.enrollmentDate}</TableCell>
                          <TableCell>
                            <div className="w-24">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{record.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    record.progress === 100
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${record.progress}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {Math.floor(record.completedDuration / 60)}h {record.completedDuration % 60}m
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.score !== undefined ? (
                              <Badge className={record.score >= 90 ? 'bg-green-100 text-green-800' : record.score >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                                {record.score}分
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.certificateIssued ? (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Award className="h-3 w-3 mr-1" />
                                已发放
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计分析 */}
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>学习时长Top5</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningRecords
                      .sort((a, b) => b.completedDuration - a.completedDuration)
                      .slice(0, 5)
                      .map((record, idx) => (
                        <div key={record.id} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{record.employeeName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{record.courseName}</div>
                          </div>
                          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {Math.floor(record.completedDuration / 60)}h
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>完成率Top5</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningRecords
                      .filter(r => r.status === 'completed')
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .slice(0, 5)
                      .map((record, idx) => (
                        <div key={record.id} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{record.employeeName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{record.courseName}</div>
                          </div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {record.score}分
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>活跃学习天数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningRecords
                      .filter(r => r.status === 'in-progress')
                      .slice(0, 5)
                      .map((record, idx) => (
                        <div key={record.id} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{record.employeeName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{record.courseName}</div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {record.learningSessions.length}次学习
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
