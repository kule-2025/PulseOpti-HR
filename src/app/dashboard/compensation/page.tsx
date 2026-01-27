'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { LazyImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { DollarSign, Download, Search, TrendingUp, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface Salary {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  bonus: number;
  socialInsurance: number;
  tax: number;
  netSalary: number;
  month: string;
  status: string;
  payDate: string | null;
}

// 模拟数据
const MOCK_SALARIES: Salary[] = Array.from({ length: 60 }, (_, i) => ({
  id: `salary-${i + 1}`,
  employeeId: `emp-${i + 1}`,
  employeeName: `员工${i + 1}`,
  department: ['技术部', '产品部', '市场部', '人事部'][i % 4],
  position: i % 3 === 0 ? '前端工程师' : i % 3 === 1 ? '产品经理' : '数据分析师',
  baseSalary: 15000 + Math.floor(Math.random() * 20000),
  bonus: Math.floor(Math.random() * 5000),
  socialInsurance: 3000 + Math.floor(Math.random() * 1000),
  tax: Math.floor(Math.random() * 2000),
  netSalary: 15000 + Math.floor(Math.random() * 20000) - 4000,
  month: '2024-03',
  status: i % 3 === 0 ? '待发放' : '已发放',
  payDate: i % 3 !== 0 ? `2024-03-${String(i % 28 + 1).padStart(2, '0')}` : null,
}));

export default function CompensationPage() {
  const [activeTab, setActiveTab] = useState('salaries');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('2024-03');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: salaries, loading: salariesLoading } = useFetch<Salary[]>(
    '/api/compensation/salaries',
    { fallback: MOCK_SALARIES }
  );

  const filteredSalaries = useMemo(() => {
    if (!salaries) return [];
    return salaries.filter((s: Salary) => {
      const matchesSearch = s.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesMonth = s.month === monthFilter;
      return matchesSearch && matchesMonth;
    });
  }, [salaries, debouncedSearch, monthFilter]);

  const SalaryItem = useCallback((salary: Salary, index: number) => {
    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
              {salary.employeeName.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{salary.employeeName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{salary.department} · {salary.position}</p>
          </div>
          <div className="hidden md:flex items-center gap-6 shrink-0 text-sm">
            <div><p className="text-gray-500">基本工资</p><p className="font-medium">¥{salary.baseSalary.toLocaleString()}</p></div>
            <div><p className="text-gray-500">奖金</p><p className="font-medium">¥{salary.bonus.toLocaleString()}</p></div>
            <div><p className="text-gray-500">社保</p><p className="font-medium">-¥{salary.socialInsurance.toLocaleString()}</p></div>
            <div><p className="text-gray-500">个税</p><p className="font-medium">-¥{salary.tax.toLocaleString()}</p></div>
            <div><p className="text-gray-500">实发</p><p className="font-bold text-green-600">¥{salary.netSalary.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Badge variant={salary.status === '已发放' ? 'default' : 'secondary'}>{salary.status}</Badge>
          {salary.status === '待发放' && <Button size="sm">发放</Button>}
        </div>
      </div>
    );
  }, []);

  if (loading || salariesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">薪酬管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">工资核算、福利管理与薪酬分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />导出</Button>
          <Button><DollarSign className="w-4 h-4 mr-2" />计算工资</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="本月发放总额" value={`¥${salaries?.reduce((sum: number, s: Salary) => sum + (s.status === '已发放' ? s.netSalary : 0), 0).toLocaleString() || 0}`} icon={<DollarSign className="w-4 h-4" />} color="from-green-500 to-green-600" />
        <StatCard title="待发放" value={`${salaries?.filter((s: Salary) => s.status === '待发放').length || 0}人`} icon={<Users className="w-4 h-4" />} color="from-yellow-500 to-orange-500" />
        <StatCard title="平均薪酬" value={`¥${salaries && salaries.length > 0 ? Math.round(salaries.reduce((sum: number, s: Salary) => sum + s.netSalary, 0) / salaries.length).toLocaleString() : 0}`} icon={<TrendingUp className="w-4 h-4" />} color="from-blue-500 to-blue-600" />
        <StatCard title="统计月份" value={monthFilter} icon={<Calendar className="w-4 h-4" />} color="from-purple-500 to-purple-600" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="salaries">工资管理</TabsTrigger>
          <TabsTrigger value="structure">薪酬结构</TabsTrigger>
          <TabsTrigger value="benefits">福利管理</TabsTrigger>
        </TabsList>
        <TabsContent value="salaries">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>工资发放 ({filteredSalaries.length})</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="搜索员工" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64" />
                  </div>
                  <Input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-full sm:w-36" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <VirtualScroll items={filteredSalaries} renderItem={SalaryItem} itemHeight={90} height={600} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="structure"><Card><CardContent className="py-12 text-center text-gray-500"><DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>暂无薪酬结构</p></CardContent></Card></TabsContent>
        <TabsContent value="benefits"><Card><CardContent className="py-12 text-center text-gray-500"><DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>暂无福利项目</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
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
