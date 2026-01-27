'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { GraduationCap, Plus, Search, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
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
  status: string;
  description: string;
}

interface Enrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  trainingId: string;
  trainingTitle: string;
  enrollDate: string;
  status: string;
  progress: number;
}

// 模拟数据
const MOCK_TRAININGS: Training[] = Array.from({ length: 30 }, (_, i) => ({
  id: `training-${i + 1}`,
  title: `培训课程${i + 1}`,
  type: ['新员工培训', '技能培训', '管理培训', '安全培训'][i % 4],
  instructor: `讲师${i + 1}`,
  startDate: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
  endDate: `2024-03-${String(((i % 28) + 2)).padStart(2, '0')}`,
  duration: `${(i % 3) + 1}天`,
  capacity: 20 + Math.floor(Math.random() * 30),
  enrolled: Math.floor(Math.random() * 20),
  status: i % 3 === 0 ? '进行中' : i % 3 === 1 ? '已结束' : '报名中',
  description: '提升员工专业技能和管理能力',
}));

const MOCK_ENROLLMENTS: Enrollment[] = Array.from({ length: 50 }, (_, i) => ({
  id: `enroll-${i + 1}`,
  employeeId: `emp-${i + 1}`,
  employeeName: `员工${i + 1}`,
  department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
  trainingId: `training-${(i % 30) + 1}`,
  trainingTitle: `培训课程${(i % 30) + 1}`,
  enrollDate: `2024-03-${String(i % 30 + 1).padStart(2, '0')}`,
  status: i % 3 === 0 ? '已报名' : i % 3 === 1 ? '进行中' : '已完成',
  progress: i % 3 === 2 ? 100 : Math.floor(Math.random() * 80),
}));

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: trainings, loading: trainingsLoading } = useFetch<Training[]>('/api/training/courses', { fallback: MOCK_TRAININGS });
  const { data: enrollments, loading: enrollmentsLoading } = useFetch<Enrollment[]>('/api/training/enrollments', { fallback: MOCK_ENROLLMENTS });

  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter((t: Training) => t.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [trainings, debouncedSearch]);

  const TrainingItem = useCallback((training: Training, index: number) => {
    const statusColors: Record<string, string> = { '报名中': 'bg-blue-100 text-blue-800', '进行中': 'bg-green-100 text-green-800', '已结束': 'bg-gray-100 text-gray-800' };

    return (
      <div className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{training.title}</h4>
              <Badge className={statusColors[training.status]}>{training.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span>{training.type}</span>
              <span>{training.instructor}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{training.startDate} ~ {training.endDate}</span>
              <span>{training.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{training.enrolled}/{training.capacity}</div>
            <Button size="sm" className="mt-2" disabled={training.status === '已结束'}>{training.status === '报名中' ? '立即报名' : '查看详情'}</Button>
          </div>
        </div>
      </div>
    );
  }, []);

  if (loading || trainingsLoading || enrollmentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">培训管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">培训计划、课程管理与学习进度</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />发布课程</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="全部课程" value={trainings?.length || 0} icon={<GraduationCap className="w-4 h-4" />} color="from-blue-500 to-blue-600" />
        <StatCard title="报名中" value={trainings?.filter((t: Training) => t.status === '报名中').length || 0} icon={<Users className="w-4 h-4" />} color="from-green-500 to-green-600" />
        <StatCard title="进行中" value={trainings?.filter((t: Training) => t.status === '进行中').length || 0} icon={<Calendar className="w-4 h-4" />} color="from-purple-500 to-purple-600" />
        <StatCard title="已完成培训" value={enrollments?.filter((e: Enrollment) => e.status === '已完成').length || 0} icon={<CheckCircle2 className="w-4 h-4" />} color="from-orange-500 to-orange-500" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">培训课程</TabsTrigger>
          <TabsTrigger value="enrollments">培训记录</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>培训课程 ({filteredTrainings.length})</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="搜索课程" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <VirtualScroll items={filteredTrainings} renderItem={TrainingItem} itemHeight={100} height={600} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="enrollments"><Card><CardContent className="py-12 text-center text-gray-500"><GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>暂无培训记录</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', color, 'text-white')}>{icon}</div>
      </CardHeader>
      <CardContent><div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div></CardContent>
    </Card>
  );
}
