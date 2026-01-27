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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  ChevronRight,
  Filter,
  MoreVertical,
  User,
  Building2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePageData } from '@/hooks/use-page';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'onboarding';
  joinDate: string;
  location: string;
}

interface EmployeeDetailProps {
  employee: Employee;
  onClose: () => void;
}

function EmployeeDetail({ employee, onClose }: EmployeeDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">基本信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">姓名</p>
            <p className="font-medium">{employee.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">部门</p>
            <p className="font-medium">{employee.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">职位</p>
            <p className="font-medium">{employee.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">状态</p>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
              {employee.status}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">联系方式</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-500" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-500" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span>{employee.location}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">工作经历</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          暂无工作经历记录
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">教育背景</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          暂无教育背景记录
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      department: '技术部',
      position: '前端工程师',
      status: 'active',
      joinDate: '2023-01-15',
      location: '北京',
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138001',
      department: '产品部',
      position: '产品经理',
      status: 'active',
      joinDate: '2023-02-20',
      location: '上海',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((e: any) => e.department)));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (debouncedSearch) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          emp.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          emp.department.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Employee];
      const bValue = b[sortBy as keyof Employee];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  }, [employees, debouncedSearch, departmentFilter, statusFilter, sortBy, sortOrder]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e: any) => e.status === 'active').length,
    onboarding: employees.filter((e: any) => e.status === 'onboarding').length,
  }), [employees]);

  if (!employees) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Employee management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Employee</DialogTitle>
                <DialogDescription>Add a new employee to the organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Enter name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onboarding}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Employee List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {departments.map((d: any) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {employee.position} · {employee.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeDetail employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
