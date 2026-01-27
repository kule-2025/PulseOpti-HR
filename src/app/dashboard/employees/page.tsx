'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useDebounce } from '@/hooks/use-debounce';
import { usePageData } from '@/hooks/use-page';
import {
  Users,
  Plus,
  Download,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Building2,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'onboarding' | 'onleave' | 'resigned';
  hireDate: string;
  avatar: string | null;
  manager: string;
  location: string;
  skills: string[];
  performance: number;
  attendance: number;
}

const statusMap = {
  active: { label: '在职', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  onboarding: { label: '入职中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: UserPlus },
  onleave: { label: '请假中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  resigned: { label: '已离职', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: XCircle },
};

// Mock数据生成
const generateMockEmployees = (): Employee[] =>
  Array.from({ length: 200 }, (_, i) => ({
    id: `employee-${i + 1}`,
    name: `员工${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    employeeId: `EMP${String(i + 1).padStart(5, '0')}`,
    department: ['技术部', '产品部', '市场部', '人事部', '运营部'][i % 5],
    position: [
      '高级工程师', '工程师', '经理', '主管', '专员',
      '总监', '助理', '顾问', '分析师', '设计师'
    ][i % 10],
    email: `employee${i + 1}@company.com`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    status: i % 20 === 0 ? 'resigned' : i % 10 === 0 ? 'onleave' : i % 5 === 0 ? 'onboarding' : 'active',
    hireDate: `202${Math.floor(Math.random() * 5)}-0${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    avatar: null,
    manager: i % 5 === 0 ? '' : `经理${Math.floor(Math.random() * 5) + 1}`,
    location: ['北京', '上海', '深圳', '杭州', '成都'][i % 5],
    skills: ['JavaScript', 'Python', 'Java', 'React', 'Vue', 'Node.js', 'MySQL', 'Redis', 'Docker', 'Kubernetes'].slice(0, Math.floor(Math.random() * 4) + 2),
    performance: Math.floor(Math.random() * 30) + 70,
    attendance: Math.floor(Math.random() * 20) + 80,
  }));

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 模拟数据加载
  const { data: employees, loading } = usePageData(
    async () => generateMockEmployees(),
    { enabled: true }
  );

  const departments = useMemo(() => {
    if (!employees) return [];
    return Array.from(new Set(employees.map((e: any) => e.department)));
  }, [employees]);

  const stats = useMemo(() => {
    if (!employees) return null;
    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e: any) => e.status === 'active').length,
      onboardingEmployees: employees.filter((e: any) => e.status === 'onboarding').length,
      onLeaveEmployees: employees.filter((e: any) => e.status === 'onleave').length,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    let filtered = [...employees];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(query) ||
        e.employeeId.toLowerCase().includes(query) ||
        e.position.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'hireDate') {
        comparison = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
      } else if (sortBy === 'performance') {
        comparison = a.performance - b.performance;
      } else if (sortBy === 'attendance') {
        comparison = a.attendance - b.attendance;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [employees, debouncedSearch, statusFilter, departmentFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const EmployeeItem = useCallback((employee: Employee) => {
    const statusInfo = statusMap[employee.status];
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {employee.avatar ? (
              <ResponsiveImage src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{employee.name}</h4>
              <Badge variant="outline" className="text-xs">{employee.employeeId}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 size={14} />
                {employee.department}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {employee.position}
              </span>
              <span className="hidden md:inline-flex items-center gap-1">
                <MapPin size={14} />
                {employee.location}
              </span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 shrink-0 text-sm">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">绩效</p>
              <p className="font-semibold text-blue-600">{employee.performance}分</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">出勤</p>
              <p className="font-semibold text-green-600">{employee.attendance}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">入职日期</p>
              <p className="font-medium">{employee.hireDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className={statusInfo.color} variant="secondary">
            <StatusIcon size={12} className="mr-1" />
            {statusInfo.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedEmployee(employee)}
          >
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">员工管理</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">员工档案、组织架构管理</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              导出员工表
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              新增员工
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">员工总数</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">在职员工</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">入职中</CardTitle>
                <UserPlus className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onboardingEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">请假中</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onLeaveEmployees}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索姓名、工号、职位、部门..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">全部状态</option>
                  {Object.entries(statusMap).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">全部部门</option>
                  {departments.map((d: any) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="name-asc">姓名 ↑</option>
                  <option value="name-desc">姓名 ↓</option>
                  <option value="hireDate-asc">入职日期 ↑</option>
                  <option value="hireDate-desc">入职日期 ↓</option>
                  <option value="performance-asc">绩效 ↑</option>
                  <option value="performance-desc">绩效 ↓</option>
                  <option value="attendance-asc">出勤 ↑</option>
                  <option value="attendance-desc">出勤 ↓</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VirtualScroll
              items={filteredEmployees}
              itemHeight={80}
              renderItem={EmployeeItem}
              height={600}
            />
          </CardContent>
        </Card>

        {/* 员工详情对话框 */}
        {selectedEmployee && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedEmployee.name} - 员工档案</DialogTitle>
                <DialogDescription>
                  {selectedEmployee.position} · {selectedEmployee.employeeId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>基本信息</Label>
                    <div className="space-y-1 mt-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        {selectedEmployee.department}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} />
                        {selectedEmployee.position}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        {selectedEmployee.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        入职日期: {selectedEmployee.hireDate}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>联系方式</Label>
                    <div className="space-y-1 mt-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        {selectedEmployee.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        {selectedEmployee.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>技能标签</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployee.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">绩效评分</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedEmployee.performance}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">出勤率</p>
                    <p className="text-2xl font-bold text-green-600">{selectedEmployee.attendance}%</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                  关闭
                </Button>
                <Button variant="outline">
                  <Edit size={14} className="mr-2" />
                  编辑
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* 新增员工对话框 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增员工</DialogTitle>
              <DialogDescription>
                填写员工基本信息，创建员工档案
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>姓名</Label>
                  <Input placeholder="请输入姓名" />
                </div>
                <div className="space-y-2">
                  <Label>工号</Label>
                  <Input placeholder="自动生成" disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>部门</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>职位</Label>
                  <Input placeholder="请输入职位" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input type="email" placeholder="请输入邮箱" />
                </div>
                <div className="space-y-2">
                  <Label>手机号</Label>
                  <Input type="tel" placeholder="请输入手机号" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>入职日期</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>工作地点</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择地点" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beijing">北京</SelectItem>
                      <SelectItem value="shanghai">上海</SelectItem>
                      <SelectItem value="shenzhen">深圳</SelectItem>
                      <SelectItem value="hangzhou">杭州</SelectItem>
                      <SelectItem value="chengdu">成都</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button>创建员工</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
