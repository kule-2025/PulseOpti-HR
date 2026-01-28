'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import {
  Shield,
  Users,
  Key,
  Lock,
  Unlock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  UserCog,
  Settings,
  FileText,
  BarChart3,
  Gift,
  Zap,
} from 'lucide-react';

// 角色数据
const rolesData = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    users: 3,
    permissions: ['all'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 2,
    name: '人力资源总监',
    code: 'hr_director',
    description: 'HR部门负责人，拥有所有HR模块权限',
    users: 2,
    permissions: ['employee', 'recruitment', 'performance', 'compensation', 'training', 'compliance'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 3,
    name: 'HR经理',
    code: 'hr_manager',
    description: 'HR业务经理，负责具体业务模块',
    users: 5,
    permissions: ['employee', 'recruitment', 'performance'],
    createdAt: '2024-01-05',
    isSystem: false,
  },
  {
    id: 4,
    name: 'HR专员',
    code: 'hr_specialist',
    description: 'HR执行人员，基础操作权限',
    users: 15,
    permissions: ['employee.view', 'recruitment.view', 'attendance'],
    createdAt: '2024-01-10',
    isSystem: false,
  },
  {
    id: 5,
    name: '部门经理',
    code: 'dept_manager',
    description: '部门负责人，查看本部门数据',
    users: 20,
    permissions: ['employee.view.dept', 'performance.view.dept', 'attendance.view.dept'],
    createdAt: '2024-01-15',
    isSystem: false,
  },
];

// 权限模块
const permissionModules = [
  {
    id: 1,
    name: '员工管理',
    icon: Users,
    code: 'employee',
    permissions: [
      { id: 1, name: '查看员工', code: 'employee.view', description: '查看员工列表和详情' },
      { id: 2, name: '添加员工', code: 'employee.create', description: '新增员工信息' },
      { id: 3, name: '编辑员工', code: 'employee.edit', description: '修改员工信息' },
      { id: 4, name: '删除员工', code: 'employee.delete', description: '删除员工记录' },
      { id: 5, name: '导入员工', code: 'employee.import', description: '批量导入员工' },
    ],
  },
  {
    id: 2,
    name: '招聘管理',
    icon: UserCog,
    code: 'recruitment',
    permissions: [
      { id: 6, name: '查看职位', code: 'recruitment.view', description: '查看职位信息' },
      { id: 7, name: '发布职位', code: 'recruitment.create', description: '发布新职位' },
      { id: 8, name: '简历管理', code: 'recruitment.resume', description: '管理简历信息' },
      { id: 9, name: '面试安排', code: 'recruitment.interview', description: '安排面试流程' },
      { id: 10, name: '录用审批', code: 'recruitment.offer', description: '审批录用' },
    ],
  },
  {
    id: 3,
    name: '绩效管理',
    icon: BarChart3,
    code: 'performance',
    permissions: [
      { id: 11, name: '查看绩效', code: 'performance.view', description: '查看绩效数据' },
      { id: 12, name: '设定目标', code: 'performance.goal', description: '设定OKR/KPI目标' },
      { id: 13, name: '绩效评估', code: 'performance.assess', description: '进行绩效评估' },
      { id: 14, name: '绩效分析', code: 'performance.analysis', description: '分析绩效数据' },
    ],
  },
  {
    id: 4,
    name: '薪酬管理',
    icon: Crown,
    code: 'compensation',
    permissions: [
      { id: 15, name: '查看薪酬', code: 'compensation.view', description: '查看薪酬数据' },
      { id: 16, name: '薪资核算', code: 'compensation.calculate', description: '计算员工薪资' },
      { id: 17, name: '薪资发放', code: 'compensation.pay', description: '发放薪资' },
      { id: 18, name: '薪酬设置', code: 'compensation.settings', description: '设置薪酬规则' },
    ],
  },
  {
    id: 5,
    name: '考勤管理',
    icon: Clock,
    code: 'attendance',
    permissions: [
      { id: 19, name: '查看考勤', code: 'attendance.view', description: '查看考勤记录' },
      { id: 20, name: '排班管理', code: 'attendance.schedule', description: '管理排班' },
      { id: 21, name: '请假审批', code: 'attendance.leave', description: '审批请假申请' },
    ],
  },
  {
    id: 6,
    name: '系统管理',
    icon: Settings,
    code: 'system',
    permissions: [
      { id: 22, name: '角色管理', code: 'system.role', description: '管理系统角色' },
      { id: 23, name: '权限管理', code: 'system.permission', description: '管理系统权限' },
      { id: 24, name: '日志管理', code: 'system.log', description: '查看操作日志' },
      { id: 25, name: '系统设置', code: 'system.settings', description: '系统配置' },
    ],
  },
];

// 用户数据
const usersData = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@company.com',
    department: '人力资源部',
    position: 'HR总监',
    role: '人力资源总监',
    status: 'active',
    lastLogin: '2024-03-15 10:30',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@company.com',
    department: '人力资源部',
    position: 'HR经理',
    role: 'HR经理',
    status: 'active',
    lastLogin: '2024-03-15 09:15',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@company.com',
    department: '研发部',
    position: '研发总监',
    role: '部门经理',
    status: 'active',
    lastLogin: '2024-03-14 18:30',
  },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={Shield}
        title="高级权限"
        description="企业级权限控制，精细化角色管理"
        proBadge={true}
        breadcrumbs={[
          { name: '高级功能', href: '/premium' },
          { name: '高级权限', href: '/settings/roles' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Lock className="h-4 w-4 mr-2" />
              权限审计
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              创建角色
            </Button>
          </div>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              总角色数
            </CardDescription>
            <CardTitle className="text-3xl">{rolesData.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              系统角色 {rolesData.filter(r => r.isSystem).length} 个
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              总用户数
            </CardDescription>
            <CardTitle className="text-3xl">{usersData.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              活跃用户 {usersData.filter(u => u.status === 'active').length} 人
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              权限模块
            </CardDescription>
            <CardTitle className="text-3xl">{permissionModules.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              权限项 {permissionModules.reduce((sum, m) => sum + m.permissions.length, 0)} 个
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              权限审计
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              <CheckCircle className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              无权限风险
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="users">用户权限</TabsTrigger>
          <TabsTrigger value="permissions">权限配置</TabsTrigger>
        </TabsList>

        {/* 角色管理 */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>角色管理</CardTitle>
                  <CardDescription>
                    管理系统角色和权限分配
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索角色..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rolesData.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        role.isSystem
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                          : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                      }`}>
                        {role.isSystem ? (
                          <Crown className="h-6 w-6 text-white" />
                        ) : (
                          <UserCog className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              系统角色
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {role.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {role.users} 个用户 · 创建于 {role.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!role.isSystem && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户权限 */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>用户权限</CardTitle>
                  <CardDescription>
                    管理用户角色和权限
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  分配权限
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usersData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user.department} · {user.position}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.role}
                        </div>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              : ''
                          }
                        >
                          {user.status === 'active' ? '活跃' : '禁用'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 权限配置 */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>权限配置</CardTitle>
              <CardDescription>
                配置各模块权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissionModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <Card key={module.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{module.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {module.permissions.length} 个权限项
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {module.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {permission.code}
                                  </div>
                                </div>
                                <Unlock className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
