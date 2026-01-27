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
import { DollarSign, Download, Search, TrendingUp, Calendar, Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/theme';

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
  status: 'pending' | 'paid';
  payDate: string | null;
  avatar: string | null;
}

const generateMockSalaries = (): Salary[] =>
  Array.from({ length: 80 }, (_, i) => ({
    id: `salary-${i + 1}`,
    employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
    employeeName: `员工${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    department: ['技术部', '产品部', '市场部', '人事部', '运营部'][i % 5],
    position: ['高级工程师', '工程师', '经理', '主管', '专员'][i % 5],
    baseSalary: 15000 + Math.floor(Math.random() * 25000),
    bonus: Math.floor(Math.random() * 8000),
    socialInsurance: 3000 + Math.floor(Math.random() * 1500),
    tax: Math.floor(Math.random() * 3000),
    netSalary: 15000 + Math.floor(Math.random() * 20000),
    month: '2024-03',
    status: i % 3 === 0 ? 'pending' : 'paid',
    payDate: i % 3 !== 0 ? `2024-03-${String(i % 28 + 1).padStart(2, '0')}` : null,
    avatar: null,
  }));

const statusMap = {
  pending: { label: '待发放', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  paid: { label: '已发放', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

export default function CompensationPage() {
  const [activeTab, setActiveTab] = useState('salaries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const [salaries] = useState<Salary[]>(generateMockSalaries());

  const departments = Array.from(new Set(salaries.map((s) => s.department)));

  const stats = useMemo(() => {
    return {
      totalSalaries: salaries.reduce((sum, s) => sum + s.netSalary, 0),
      avgSalary: Math.round(salaries.reduce((sum, s) => sum + s.netSalary, 0) / salaries.length),
      pendingCount: salaries.filter((s) => s.status === 'pending').length,
      paidCount: salaries.filter((s) => s.status === 'paid').length,
    };
  }, [salaries]);

  const filteredSalaries = useMemo(() => {
    let filtered = [...salaries];
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(query) ||
          s.employeeId.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter((s) => s.status === statusFilter);
    if (departmentFilter !== 'all') filtered = filtered.filter((s) => s.department === departmentFilter);
    filtered.sort((a, b) => b.netSalary - a.netSalary);
    return filtered;
  }, [salaries, debouncedSearch, statusFilter, departmentFilter]);

  const SalaryItem = useCallback((salary: Salary) => (
    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="shrink-0">
          {salary.avatar ? (
            <ResponsiveImage src={salary.avatar} alt={salary.employeeName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-medium text-sm">
              {salary.employeeName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{salary.employeeName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{salary.position} · {salary.department}</p>
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">基本工资</p>
            <p className="font-medium">¥{salary.baseSalary.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">奖金</p>
            <p className="font-medium text-green-600">+¥{salary.bonus.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">扣除</p>
            <p className="font-medium text-red-600">-¥{(salary.socialInsurance + salary.tax).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">实发工资</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">¥{salary.netSalary.toLocaleString()}</p>
        </div>
        <Badge className={statusMap[salary.status].color} variant="secondary">
          {statusMap[salary.status].label}
        </Badge>
        <Button variant="ghost" size="icon">
          <Eye size={16} />
        </Button>
      </div>
    </div>
  ), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">薪酬管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">工资核算、福利管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            导出工资表
          </Button>
          <Button size="sm">
            <TrendingUp size={16} className="mr-2" />
            发放工资
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">总工资支出</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">¥{(stats.totalSalaries / 10000).toFixed(1)}万</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均薪资</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">¥{stats.avgSalary.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">待发放</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingCount}人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已发放</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paidCount}人</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索员工姓名、工号或部门..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                <option value="all">全部状态</option>
                <option value="pending">待发放</option>
                <option value="paid">已发放</option>
              </select>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                <option value="all">全部部门</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VirtualScroll items={filteredSalaries} itemHeight={100} renderItem={SalaryItem} height={600} />
        </CardContent>
      </Card>
    </div>
  );
}
