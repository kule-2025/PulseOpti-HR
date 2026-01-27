'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useForm } from '@/hooks/use-form';
import { useDebounce } from '@/hooks/use-debounce';
import { GraduationCap, Plus, Search, Calendar, Users, CheckCircle2, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/theme';

interface Training {
  id: string;
  title: string;
  type: string;
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  capacity: number;
  enrolled: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  avatar: string | null;
}

interface Enrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  trainingId: string;
  trainingTitle: string;
  enrollDate: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  progress: number;
  avatar: string | null;
}

const generateMockTrainings = (): Training[] =>
  Array.from({ length: 40 }, (_, i) => ({
    id: `training-${i + 1}`,
    title: `培训课程${i + 1} - ${['新员工', '技能', '管理', '安全'][i % 4]}培训`,
    type: ['新员工培训', '技能培训', '管理培训', '安全培训'][i % 4],
    instructor: `讲师${i + 1}`,
    startDate: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
    endDate: `2024-03-${String((i % 28) + 3).padStart(2, '0')}`,
    duration: `${(i % 5 + 1) * 2}小时`,
    capacity: 30,
    enrolled: Math.floor(Math.random() * 30),
    status: i % 3 === 0 ? 'upcoming' : i % 3 === 1 ? 'ongoing' : 'completed',
    description: '这是一门重要的培训课程，旨在提升员工的专业技能和综合能力。',
    avatar: null,
  }));

const generateMockEnrollments = (): Enrollment[] =>
  Array.from({ length: 100 }, (_, i) => ({
    id: `enroll-${i + 1}`,
    employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
    employeeName: `员工${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
    trainingId: `training-${(i % 10) + 1}`,
    trainingTitle: `培训课程${(i % 10) + 1}`,
    enrollDate: `2024-03-${String((i % 15) + 1).padStart(2, '0')}`,
    status: i % 3 === 0 ? 'enrolled' : i % 3 === 1 ? 'in_progress' : 'completed',
    progress: Math.floor(Math.random() * 101),
    avatar: null,
  }));

const statusMap = {
  upcoming: { label: '即将开始', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  ongoing: { label: '进行中', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
};

const enrollStatusMap = {
  enrolled: { label: '已报名', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  in_progress: { label: '学习中', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
};

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const [trainings] = useState<Training[]>(generateMockTrainings());
  const [enrollments] = useState<Enrollment[]>(generateMockEnrollments());

  const types = Array.from(new Set(trainings.map((t) => t.type)));

  const stats = useMemo(() => {
    return {
      totalCourses: trainings.length,
      totalEnrollments: enrollments.length,
      completedRate: Math.round((enrollments.filter((e) => e.status === 'completed').length / enrollments.length) * 100),
      avgProgress: Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length),
    };
  }, [trainings, enrollments]);

  const filteredTrainings = useMemo(() => {
    let filtered = [...trainings];
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(query) || t.instructor.toLowerCase().includes(query));
    }
    if (typeFilter !== 'all') filtered = filtered.filter((t) => t.type === typeFilter);
    return filtered;
  }, [trainings, debouncedSearch, typeFilter]);

  const TrainingItem = useCallback((training: Training) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{training.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{training.instructor}</p>
          </div>
          <Badge className={statusMap[training.status].color} variant="secondary">{statusMap[training.status].label}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={14} /> {training.startDate} - {training.endDate}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {training.duration}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">报名进度</span>
            <span>{training.enrolled} / {training.capacity}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(training.enrolled / training.capacity) * 100}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  ), []);

  const EnrollmentItem = useCallback((enrollment: Enrollment) => {
    const statusInfo = enrollStatusMap[enrollment.status];
    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {enrollment.avatar ? (
              <ResponsiveImage src={enrollment.avatar} alt={enrollment.employeeName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                {enrollment.employeeName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{enrollment.employeeName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{enrollment.trainingTitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0 text-sm text-gray-600 dark:text-gray-400">
            <span>{enrollment.department}</span>
            <span>{enrollment.enrollDate} 报名</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">学习进度</p>
            <p className="text-lg font-bold text-blue-600">{enrollment.progress}%</p>
          </div>
          <Badge className={statusInfo.color} variant="secondary">{statusInfo.label}</Badge>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">培训管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">培训计划、课程管理</p>
        </div>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          创建课程
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">课程总数</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">报名人数</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">完成率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均进度</CardTitle>
            <Play className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索课程或讲师..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
              <option value="all">全部类型</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="courses">培训课程</TabsTrigger>
              <TabsTrigger value="enrollments">报名记录</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrainings.map(TrainingItem)}
              </div>
            </TabsContent>

            <TabsContent value="enrollments">
              <VirtualScroll items={enrollments} itemHeight={100} renderItem={EnrollmentItem} height={600} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
