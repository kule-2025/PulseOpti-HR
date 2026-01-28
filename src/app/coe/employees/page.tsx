'use client';

import { useState, useMemo } from 'react';
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
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  department: string;
  position: string;
  level: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: 'active' | 'on_leave' | 'resigned';
  education: string;
  workYears: number;
}

// 模拟员工数据
const EMPLOYEES_DATA: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: '张三',
    avatar: '张',
    gender: 'male',
    age: 32,
    department: '技术部',
    position: '高级前端工程师',
    level: 'P7',
    email: 'zhangsan@pulsetech.com',
    phone: '138-0000-0002',
    location: '北京',
    joinDate: '2023-03-15',
    status: 'active',
    education: '本科',
    workYears: 8,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: '李四',
    avatar: '李',
    gender: 'male',
    age: 28,
    department: '销售部',
    position: '销售经理',
    level: 'P6',
    email: 'lisi@pulsetech.com',
    phone: '138-0000-0003',
    location: '上海',
    joinDate: '2023-05-20',
    status: 'active',
    education: '硕士',
    workYears: 5,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: '王五',
    avatar: '王',
    gender: 'male',
    age: 30,
    department: '市场部',
    position: '市场专员',
    level: 'P5',
    email: 'wangwu@pulsetech.com',
    phone: '138-0000-0004',
    location: '深圳',
    joinDate: '2023-08-01',
    status: 'active',
    education: '本科',
    workYears: 6,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: '赵六',
    avatar: '赵',
    gender: 'male',
    age: 35,
    department: '技术部',
    position: '架构师',
    level: 'P8',
    email: 'zhaoliu@pulsetech.com',
    phone: '138-0000-0005',
    location: '北京',
    joinDate: '2022-01-01',
    status: 'active',
    education: '博士',
    workYears: 12,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: '孙七',
    avatar: '孙',
    gender: 'female',
    age: 27,
    department: '人力资源部',
    position: 'HRBP',
    level: 'P6',
    email: 'sunqi@pulsetech.com',
    phone: '138-0000-0006',
    location: '北京',
    joinDate: '2023-04-01',
    status: 'active',
    education: '硕士',
    workYears: 4,
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: '周八',
    avatar: '周',
    gender: 'male',
    age: 26,
    department: '技术部',
    position: '后端工程师',
    level: 'P5',
    email: 'zhouba@pulsetech.com',
    phone: '138-0000-0007',
    location: '北京',
    joinDate: '2024-01-10',
    status: 'active',
    education: '本科',
    workYears: 3,
  },
];

const STATUS_CONFIG = {
  active: { label: '在职', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  on_leave: { label: '休假中', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' },
  resigned: { label: '已离职', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const GENDER_CONFIG = {
  male: { label: '男', icon: '👨' },
  female: { label: '女', icon: '👩' },
};

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // 过滤员工
  const filteredEmployees = useMemo(() => {
    let employees = EMPLOYEES_DATA;

    // 按部门过滤
    if (departmentFilter !== 'all') {
      employees = employees.filter(e => e.department === departmentFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      employees = employees.filter(e => e.status === statusFilter);
    }

    // 按级别过滤
    if (levelFilter !== 'all') {
      employees = employees.filter(e => e.level === levelFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      employees = employees.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.employeeId.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.phone.toLowerCase().includes(query)
      );
    }

    return employees;
  }, [searchQuery, departmentFilter, statusFilter, levelFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: EMPLOYEES_DATA.length,
      active: EMPLOYEES_DATA.filter(e => e.status === 'active').length,
      departments: Array.from(new Set(EMPLOYEES_DATA.map(e => e.department))).length,
      avgAge: Math.round(EMPLOYEES_DATA.reduce((sum, e) => sum + e.age, 0) / EMPLOYEES_DATA.length),
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(EMPLOYEES_DATA.map(e => e.department)));
  }, []);

  // 获取所有级别
  const levels = useMemo(() => {
    return Array.from(new Set(EMPLOYEES_DATA.map(e => e.level)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            员工档案
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理员工信息和档案
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          新增员工
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>员工总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>在职员工</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>部门数量</CardDescription>
            <CardTitle className="text-3xl">{stats.departments}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均年龄</CardDescription>
            <CardTitle className="text-3xl">{stats.avgAge}岁</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>员工列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工</TableHead>
                <TableHead>工号</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>职位</TableHead>
                <TableHead>级别</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>入职时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        暂无员工
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        当前筛选条件下没有员工
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  const statusConfig = STATUS_CONFIG[employee.status];
                  const genderConfig = GENDER_CONFIG[employee.gender];

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                            {employee.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              {genderConfig.icon} {employee.age}岁 · {employee.education}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <code className="text-sm">{employee.employeeId}</code>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {employee.department}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {employee.position}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                          {employee.level}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{employee.joinDate}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
