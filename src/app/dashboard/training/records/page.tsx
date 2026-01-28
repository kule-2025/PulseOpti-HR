'use client';

import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  GraduationCap,
  Award,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

type LearningStatus = 'not-started' | 'in-progress' | 'completed' | 'failed';
type CompletionRate = 'low' | 'medium' | 'high';

interface LearningRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  courseId: string;
  courseName: string;
  category: string;
  status: LearningStatus;
  startDate: string;
  completedDate?: string;
  progress: number;
  score?: number;
  hoursSpent: number;
}

export default function TrainingRecordsPage() {
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟获取学习记录数据
    setTimeout(() => {
      setRecords([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          courseId: 'C001',
          courseName: 'React高级开发',
          category: '技能培训',
          status: 'completed',
          startDate: '2024-01-15',
          completedDate: '2024-01-30',
          progress: 100,
          score: 92,
          hoursSpent: 16,
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '销售部',
          courseId: 'C002',
          courseName: '销售技巧提升',
          category: '技能培训',
          status: 'in-progress',
          startDate: '2024-02-01',
          progress: 65,
          hoursSpent: 8,
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '市场部',
          courseId: 'C003',
          courseName: '团队领导力',
          category: '领导力培训',
          status: 'completed',
          startDate: '2024-01-10',
          completedDate: '2024-01-25',
          progress: 100,
          score: 88,
          hoursSpent: 12,
        },
        {
          id: '4',
          employeeId: 'E004',
          employeeName: '赵六',
          department: '技术部',
          courseId: 'C004',
          courseName: 'Java并发编程',
          category: '技能培训',
          status: 'not-started',
          startDate: '2024-02-15',
          progress: 0,
          hoursSpent: 0,
        },
        {
          id: '5',
          employeeId: 'E005',
          employeeName: '孙七',
          department: '人力资源部',
          courseId: 'C005',
          courseName: '绩效管理实务',
          category: '专业培训',
          status: 'in-progress',
          startDate: '2024-02-01',
          progress: 45,
          hoursSpent: 6,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleExport = () => {
    toast.success('正在导出学习记录...');
    setTimeout(() => {
      toast.success('学习记录已导出');
    }, 2000);
  };

  const statusConfig: Record<LearningStatus, { label: string; color: string; icon: any }> = {
    'not-started': { label: '未开始', color: 'bg-gray-500', icon: Clock },
    'in-progress': { label: '进行中', color: 'bg-blue-500', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
    failed: { label: '未通过', color: 'bg-red-500', icon: XCircle },
  };

  const statistics = {
    totalRecords: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    inProgress: records.filter(r => r.status === 'in-progress').length,
    totalHours: records.reduce((sum, r) => sum + r.hoursSpent, 0),
    averageScore: records
      .filter(r => r.score !== undefined)
      .reduce((sum, r) => sum + (r.score || 0), 0) / records.filter(r => r.score !== undefined).length || 0,
  };

  const departments = [...new Set(records.map(r => r.department))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              学习记录
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              查看员工的学习进度和培训记录
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出记录
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总记录数</p>
                  <p className="text-2xl font-bold">{statistics.totalRecords}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总学时</p>
                  <p className="text-2xl font-bold">{statistics.totalHours}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">平均分数</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics.averageScore.toFixed(1)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索员工姓名、课程或部门..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 学习记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>学习记录列表</CardTitle>
            <CardDescription>
              共 {filteredRecords.length} 条记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无学习记录</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>课程</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>学时</TableHead>
                    <TableHead>分数</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>完成日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const statusIcon = statusConfig[record.status].icon;
                    const StatusIcon = statusIcon;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.courseName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  record.progress === 100 ? 'bg-green-500' :
                                  record.progress >= 50 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${record.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{record.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[record.status].color} text-white border-0 flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[record.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.hoursSpent}h</TableCell>
                        <TableCell>
                          {record.score !== undefined ? (
                            <span className={record.score >= 80 ? 'text-green-600 font-semibold' : record.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                              {record.score}分
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{record.startDate}</TableCell>
                        <TableCell className="text-sm">
                          {record.completedDate || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 学习趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                部门学习情况
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => {
                  const deptRecords = records.filter(r => r.department === dept);
                  const completedCount = deptRecords.filter(r => r.status === 'completed').length;
                  const completionRate = (completedCount / deptRecords.length) * 100;
                  const avgScore = deptRecords
                    .filter(r => r.score !== undefined)
                    .reduce((sum, r) => sum + (r.score || 0), 0) / deptRecords.filter(r => r.score !== undefined).length || 0;
                  
                  return (
                    <div key={dept} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{dept}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {completedCount}/{deptRecords.length} 完成 · 平均 {avgScore.toFixed(1)}分
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            completionRate >= 80 ? 'bg-green-500' :
                            completionRate >= 50 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                学习时长排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records
                  .reduce((acc, record) => {
                    const existing = acc.find(r => r.employeeName === record.employeeName);
                    if (existing) {
                      existing.totalHours += record.hoursSpent;
                      existing.courseCount += 1;
                    } else {
                      acc.push({
                        employeeName: record.employeeName,
                        department: record.department,
                        totalHours: record.hoursSpent,
                        courseCount: 1,
                      });
                    }
                    return acc;
                  }, [] as any[])
                  .sort((a, b) => b.totalHours - a.totalHours)
                  .slice(0, 5)
                  .map((employee: any, index: number) => (
                    <div key={employee.employeeName} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{employee.employeeName}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {employee.department} · {employee.courseCount} 门课程
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{employee.totalHours}h</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
