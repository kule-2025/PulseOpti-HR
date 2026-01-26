'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { LazyImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { Users, Plus, Search, Building2, Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/theme';

const MOCK_EMPLOYEES = Array.from({ length: 100 }, (_, i) => ({
  id: `emp-${i + 1}`,
  name: `员工${i + 1}`,
  employeeId: `E${String(i + 1).padStart(4, '0')}`,
  department: ['技术部', '产品部', '市场部', '人事部', '财务部'][i % 5],
  position: i % 4 === 0 ? '前端工程师' : i % 4 === 1 ? '产品经理' : i % 4 === 2 ? '数据分析师' : 'UI设计师',
  level: ['P5', 'P6', 'P7', 'P8'][i % 4],
  email: `employee${i + 1}@company.com`,
  phone: `138****${String(i).padStart(4, '0')}`,
  hireDate: `2020-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  status: i % 10 === 0 ? '离职' : i % 5 === 0 ? '试用期' : '正式',
  manager: i % 5 === 0 ? '张经理' : '李总监',
  avatar: null,
  education: ['本科', '硕士', '博士'][i % 3],
  university: ['清华大学', '北京大学', '复旦大学', '上海交大'][i % 4],
}));

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: employees, loading: employeesLoading } = useFetch('/api/employees', { fallback: MOCK_EMPLOYEES });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || emp.employeeId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, debouncedSearch, departmentFilter, statusFilter]);

  const EmployeeItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const employee = filteredEmployees[index];
    if (!employee) return null;

    const statusColors = {
      '正式': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '试用期': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '离职': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <div style={style} className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {employee.avatar ? (
              <LazyImage src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h4>
              <Badge variant="outline">{employee.employeeId}</Badge>
              <Badge className={statusColors[employee.status as keyof typeof statusColors]}>{employee.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{employee.department}</span>
              <span>{employee.position}</span>
              <span>{employee.level}</span>
              <span>{employee.education} · {employee.university}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-sm">
            <div><p className="text-gray-500">邮箱</p><p className="text-gray-900 dark:text-white">{employee.email}</p></div>
            <div><p className="text-gray-500">电话</p><p className="text-gray-900 dark:text-white">{employee.phone}</p></div>
            <div><p className="text-gray-500">入职日期</p><p className="text-gray-900 dark:text-white">{employee.hireDate}</p></div>
            <div><p className="text-gray-500">直属上级</p><p className="text-gray-900 dark:text-white">{employee.manager}</p></div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    );
  }, [filteredEmployees]);

  if (loading || employeesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">员工管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">员工档案、组织架构与人事管理</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />添加员工</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="总员工数" value={employees?.length || 0} icon={<Users className="w-4 h-4" />} color="from-blue-500 to-blue-600" />
        <StatCard title="正式员工" value={employees?.filter(e => e.status === '正式').length || 0} icon={<Building2 className="w-4 h-4" />} color="from-green-500 to-green-600" />
        <StatCard title="试用期" value={employees?.filter(e => e.status === '试用期').length || 0} icon={<Calendar className="w-4 h-4" />} color="from-yellow-500 to-orange-500" />
        <StatCard title="本月入职" value={employees?.filter(e => e.hireDate.startsWith('2024-03')).length || 0} icon={<Calendar className="w-4 h-4" />} color="from-purple-500 to-purple-600" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">员工列表</TabsTrigger>
          <TabsTrigger value="org">组织架构</TabsTrigger>
          <TabsTrigger value="onboarding">入职流程</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>员工列表 ({filteredEmployees.length})</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="搜索员工" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-64" />
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部部门</SelectItem>
                      <SelectItem value="技术部">技术部</SelectItem>
                      <SelectItem value="产品部">产品部</SelectItem>
                      <SelectItem value="市场部">市场部</SelectItem>
                      <SelectItem value="人事部">人事部</SelectItem>
                      <SelectItem value="财务部">财务部</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="正式">正式</SelectItem>
                      <SelectItem value="试用期">试用期</SelectItem>
                      <SelectItem value="离职">离职</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <VirtualScroll items={filteredEmployees} itemHeight={100} height={600} renderItem={EmployeeItem} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="org">
          <Card><CardContent className="py-12 text-center text-gray-500"><Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>组织架构功能开发中</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card><CardContent className="py-12 text-center text-gray-500"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>入职流程功能开发中</p></CardContent></Card>
        </TabsContent>
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
