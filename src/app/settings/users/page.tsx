'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Settings,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  position: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'admin' | 'manager' | 'hr' | 'employee';
  joinDate: string;
  lastLogin: string;
}

// 模拟用户数据
const USERS_DATA: User[] = [
  {
    id: '1',
    name: '管理员',
    email: 'admin@pulsetech.com',
    phone: '138-0000-0001',
    avatar: 'A',
    department: '人力资源部',
    position: '系统管理员',
    location: '北京',
    status: 'active',
    role: 'admin',
    joinDate: '2023-01-01',
    lastLogin: '2025-01-16 10:30',
  },
  {
    id: '2',
    name: '张三',
    email: 'zhangsan@pulsetech.com',
    phone: '138-0000-0002',
    avatar: '张',
    department: '技术部',
    position: '高级前端工程师',
    location: '北京',
    status: 'active',
    role: 'employee',
    joinDate: '2023-03-15',
    lastLogin: '2025-01-16 09:45',
  },
  {
    id: '3',
    name: '李四',
    email: 'lisi@pulsetech.com',
    phone: '138-0000-0003',
    avatar: '李',
    department: '销售部',
    position: '销售经理',
    location: '上海',
    status: 'active',
    role: 'manager',
    joinDate: '2023-05-20',
    lastLogin: '2025-01-16 08:30',
  },
  {
    id: '4',
    name: '王五',
    email: 'wangwu@pulsetech.com',
    phone: '138-0000-0004',
    avatar: '王',
    department: '市场部',
    position: '市场专员',
    location: '深圳',
    status: 'active',
    role: 'employee',
    joinDate: '2023-08-01',
    lastLogin: '2025-01-15 18:20',
  },
  {
    id: '5',
    name: '赵六',
    email: 'zhaoliu@pulsetech.com',
    phone: '138-0000-0005',
    avatar: '赵',
    department: '技术部',
    position: '后端工程师',
    location: '北京',
    status: 'inactive',
    role: 'employee',
    joinDate: '2023-06-15',
    lastLogin: '2024-12-20 14:15',
  },
  {
    id: '6',
    name: '孙七',
    email: 'sunqi@pulsetech.com',
    phone: '138-0000-0006',
    avatar: '孙',
    department: '人力资源部',
    position: 'HRBP',
    location: '北京',
    status: 'active',
    role: 'hr',
    joinDate: '2023-04-01',
    lastLogin: '2025-01-16 10:00',
  },
];

const ROLE_CONFIG = {
  admin: {
    label: '管理员',
    icon: Crown,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
  manager: {
    label: '经理',
    icon: Settings,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  hr: {
    label: 'HR',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  employee: {
    label: '员工',
    icon: Users,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

const STATUS_CONFIG = {
  active: { label: '活跃', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  inactive: { label: '未激活', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  suspended: { label: '已停用', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
};

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // 过滤用户
  const filteredUsers = useMemo(() => {
    let users = USERS_DATA;

    // 按角色过滤
    if (roleFilter !== 'all') {
      users = users.filter(u => u.role === roleFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      users = users.filter(u => u.status === statusFilter);
    }

    // 按部门过滤
    if (departmentFilter !== 'all') {
      users = users.filter(u => u.department === departmentFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query) ||
        u.employeeId?.toLowerCase().includes(query)
      );
    }

    return users;
  }, [searchQuery, roleFilter, statusFilter, departmentFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: USERS_DATA.length,
      active: USERS_DATA.filter(u => u.status === 'active').length,
      admin: USERS_DATA.filter(u => u.role === 'admin').length,
      manager: USERS_DATA.filter(u => u.role === 'manager').length,
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(USERS_DATA.map(user => user.department)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            用户管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理系统用户、角色和权限
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          新增用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>用户总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>活跃用户</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>管理员</CardDescription>
            <CardTitle className="text-3xl">{stats.admin}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>经理</CardDescription>
            <CardTitle className="text-3xl">{stats.manager}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>用户列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索用户..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
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

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>加入时间</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        暂无用户
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        当前筛选条件下没有用户
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const statusConfig = STATUS_CONFIG[user.status];
                  const RoleIcon = roleConfig.icon;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={roleConfig.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-gray-900 dark:text-white">
                          {user.department}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.position}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{user.location}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{user.joinDate}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.lastLogin}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
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
