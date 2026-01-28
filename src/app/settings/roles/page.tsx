'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  X,
  Crown,
  Zap,
  Shield,
  BarChart3,
  Users,
  Database,
  Globe,
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  level: number;
  userCount: number;
  permissions: string[];
  isDefault: boolean;
}

// 权限列表
const PERMISSIONS: Permission[] = [
  // 用户管理
  { id: 'user.view', name: '查看用户', description: '查看用户列表和详情', category: '用户管理' },
  { id: 'user.create', name: '创建用户', description: '创建新用户账号', category: '用户管理' },
  { id: 'user.edit', name: '编辑用户', description: '修改用户信息', category: '用户管理' },
  { id: 'user.delete', name: '删除用户', description: '删除用户账号', category: '用户管理' },
  { id: 'user.assign_role', name: '分配角色', description: '分配用户角色', category: '用户管理' },

  // 组织管理
  { id: 'org.view', name: '查看组织', description: '查看组织架构', category: '组织管理' },
  { id: 'org.edit', name: '编辑组织', description: '修改组织架构', category: '组织管理' },
  { id: 'org.view_department', name: '查看部门', description: '查看部门信息', category: '组织管理' },
  { id: 'org.manage_department', name: '管理部门', description: '管理部门设置', category: '组织管理' },

  // 招聘管理
  { id: 'recruit.view', name: '查看招聘', description: '查看招聘信息', category: '招聘管理' },
  { id: 'recruit.create', name: '发布岗位', description: '发布招聘岗位', category: '招聘管理' },
  { id: 'recruit.manage_resume', name: '管理简历', description: '管理简历和候选人', category: '招聘管理' },
  { id: 'recruit.interview', name: '面试管理', description: '安排面试和反馈', category: '招聘管理' },

  // 绩效管理
  { id: 'perf.view', name: '查看绩效', description: '查看绩效数据', category: '绩效管理' },
  { id: 'perf.create', name: '创建考核', description: '创建绩效考核', category: '绩效管理' },
  { id: 'perf.evaluate', name: '绩效评估', description: '进行绩效评估', category: '绩效管理' },
  { id: 'perf.manage_goal', name: '管理目标', description: '管理绩效目标', category: '绩效管理' },

  // 薪酬管理
  { id: 'comp.view', name: '查看薪酬', description: '查看薪酬信息', category: '薪酬管理' },
  { id: 'comp.calculate', name: '薪酬计算', description: '计算工资和奖金', category: '薪酬管理' },
  { id: 'comp.approve', name: '薪酬审批', description: '审批薪酬发放', category: '薪酬管理' },
  { id: 'comp.view_salary', name: '查看工资', description: '查看工资详情', category: '薪酬管理' },

  // 考勤管理
  { id: 'att.view', name: '查看考勤', description: '查看考勤记录', category: '考勤管理' },
  { id: 'att.manage', name: '管理考勤', description: '管理考勤规则', category: '考勤管理' },
  { id: 'att.approve', name: '考勤审批', description: '审批请假和加班', category: '考勤管理' },

  // 培训管理
  { id: 'train.view', name: '查看培训', description: '查看培训信息', category: '培训管理' },
  { id: 'train.create', name: '创建培训', description: '创建培训计划', category: '培训管理' },
  { id: 'train.manage_course', name: '管理课程', description: '管理培训课程', category: '培训管理' },

  // 高级功能（PRO）
  { id: 'pro.export_data', name: '数据导出', description: '导出各类业务数据', category: '高级功能' },
  { id: 'pro.custom_report', name: '自定义报表', description: '创建自定义数据报表', category: '高级功能' },
  { id: 'pro.api_access', name: 'API访问', description: '访问API接口', category: '高级功能' },
  { id: 'pro.dashboard', name: '数据大屏', description: '访问企业数据大屏', category: '高级功能' },
  { id: 'pro.advanced_analytics', name: '高级分析', description: '使用高级数据分析功能', category: '高级功能' },
  { id: 'pro.workflow', name: '工作流', description: '使用高级工作流功能', category: '高级功能' },

  // 系统管理
  { id: 'sys.view_settings', name: '查看设置', description: '查看系统设置', category: '系统管理' },
  { id: 'sys.edit_settings', name: '修改设置', description: '修改系统配置', category: '系统管理' },
  { id: 'sys.manage_integration', name: '管理集成', description: '管理第三方集成', category: '系统管理' },
];

// 模拟角色数据
const ROLES_DATA: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有所有权限，可管理整个系统',
    color: 'from-red-500 to-orange-600',
    icon: '👑',
    level: 5,
    userCount: 1,
    permissions: PERMISSIONS.map(p => p.id),
    isDefault: true,
  },
  {
    id: '2',
    name: 'HR经理',
    description: '负责人力资源全流程管理',
    color: 'from-purple-500 to-pink-600',
    icon: '👥',
    level: 4,
    userCount: 3,
    permissions: [
      'user.view', 'user.create', 'user.edit', 'org.view', 'org.edit',
      'recruit.view', 'recruit.create', 'recruit.manage_resume', 'recruit.interview',
      'perf.view', 'perf.create', 'perf.evaluate', 'perf.manage_goal',
      'comp.view', 'comp.calculate', 'comp.approve',
      'att.view', 'att.manage', 'att.approve',
      'train.view', 'train.create', 'train.manage_course',
      'pro.export_data', 'pro.custom_report', 'pro.dashboard',
      'sys.view_settings', 'sys.edit_settings',
    ],
    isDefault: false,
  },
  {
    id: '3',
    name: '部门经理',
    description: '管理部门员工和绩效',
    color: 'from-blue-500 to-cyan-600',
    icon: '📊',
    level: 3,
    userCount: 8,
    permissions: [
      'user.view', 'org.view', 'org.view_department',
      'recruit.view', 'recruit.interview',
      'perf.view', 'perf.evaluate', 'perf.manage_goal',
      'comp.view',
      'att.view', 'att.approve',
      'train.view',
      'sys.view_settings',
    ],
    isDefault: false,
  },
  {
    id: '4',
    name: 'HR专员',
    description: '协助HR经理处理日常事务',
    color: 'from-green-500 to-teal-600',
    icon: '📋',
    level: 2,
    userCount: 5,
    permissions: [
      'user.view', 'org.view', 'org.view_department',
      'recruit.view', 'recruit.create', 'recruit.manage_resume',
      'perf.view',
      'att.view',
      'train.view', 'train.manage_course',
      'sys.view_settings',
    ],
    isDefault: false,
  },
  {
    id: '5',
    name: '普通员工',
    description: '查看个人信息和进行自助服务',
    color: 'from-gray-500 to-slate-600',
    icon: '👤',
    level: 1,
    userCount: 95,
    permissions: [
      'user.view', 'org.view',
      'recruit.view',
      'perf.view',
      'att.view',
      'train.view',
      'comp.view_salary',
    ],
    isDefault: true,
  },
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<string>('1');

  const currentRole = useMemo(() => {
    return ROLES_DATA.find(r => r.id === selectedRole);
  }, [selectedRole]);

  const groupedPermissions = useMemo(() => {
    if (!currentRole) return {};
    const rolePermissionIds = new Set(currentRole.permissions);
    const grouped: Record<string, Permission[]> = {};

    PERMISSIONS.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push({
        ...perm,
        hasPermission: rolePermissionIds.has(perm.id),
      });
    });

    return grouped;
  }, [currentRole]);

  const stats = useMemo(() => {
    return {
      totalRoles: ROLES_DATA.length,
      totalPermissions: PERMISSIONS.length,
      totalUsers: ROLES_DATA.reduce((sum, role) => sum + role.userCount, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            角色管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理系统角色和权限配置
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          新增角色
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>角色总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalRoles}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>权限总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalPermissions}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>用户总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 角色列表和权限配置 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 角色列表 */}
        <Card>
          <CardHeader>
            <CardTitle>角色列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ROLES_DATA.map((role) => {
                const isSelected = role.id === selectedRole;
                const hasProFeatures = role.permissions.some(p => p.startsWith('pro_'));

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl bg-gradient-to-br ${role.color} bg-clip-text text-transparent`}>
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {role.name}
                          </h3>
                          {role.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              默认
                            </Badge>
                          )}
                          {hasProFeatures && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              PRO
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                          <span>{role.userCount} 用户</span>
                          <Shield className="h-3 w-3 ml-2" />
                          <span>{role.permissions.length} 权限</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 权限配置 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-4xl bg-gradient-to-br ${currentRole?.color} bg-clip-text text-transparent`}>
                  {currentRole?.icon}
                </div>
                <div>
                  <CardTitle>{currentRole?.name}</CardTitle>
                  <CardDescription>{currentRole?.description}</CardDescription>
                </div>
              </div>
              <Button size="sm">保存配置</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const categoryIcons: Record<string, any> = {
                  '用户管理': Users,
                  '组织管理': Database,
                  '招聘管理': Crown,
                  '绩效管理': BarChart3,
                  '薪酬管理': Shield,
                  '考勤管理': Globe,
                  '培训管理': Zap,
                  '高级功能': Crown,
                  '系统管理': Settings,
                };
                const CategoryIcon = categoryIcons[category] || Shield;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {category}
                      </h4>
                      {category === '高级功能' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => {
                        const isPro = permission.id.startsWith('pro_');

                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              (permission as any).hasPermission
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {permission.name}
                                </span>
                                {isPro && (
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    PRO
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              (permission as any).hasPermission
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-white'
                            }`}>
                              {(permission as any).hasPermission ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
