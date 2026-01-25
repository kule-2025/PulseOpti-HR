'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Users,
  Crown,
  UserPlus,
  Settings,
  Lock,
  Unlock,
  ChevronRight,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function AdvancedPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('accounts');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // 新建账号表单
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'employee',
    role: '',
    departmentId: '',
  });

  // 新建角色表单
  const [roleForm, setRoleForm] = useState({
    name: '',
    code: '',
    description: '',
    level: '3',
    permissions: [] as string[],
  });

  // 权限模块定义
  const permissionModules = [
    {
      id: 'organization',
      name: '组织人事',
      permissions: [
        { id: 'org.view', name: '查看组织架构' },
        { id: 'org.create', name: '创建部门/职位' },
        { id: 'org.edit', name: '编辑部门/职位' },
        { id: 'org.delete', name: '删除部门/职位' },
        { id: 'employee.view', name: '查看员工信息' },
        { id: 'employee.create', name: '新增员工' },
        { id: 'employee.edit', name: '编辑员工信息' },
        { id: 'employee.delete', name: '删除员工' },
        { id: 'employee.export', name: '导出员工数据' },
      ],
    },
    {
      id: 'recruitment',
      name: '招聘管理',
      permissions: [
        { id: 'recruit.view', name: '查看招聘信息' },
        { id: 'recruit.create', name: '发布职位' },
        { id: 'recruit.edit', name: '编辑职位' },
        { id: 'recruit.delete', name: '删除职位' },
        { id: 'resume.view', name: '查看简历' },
        { id: 'resume.screen', name: '筛选简历' },
        { id: 'interview.view', name: '查看面试安排' },
        { id: 'interview.manage', name: '管理面试' },
        { id: 'offer.view', name: '查看Offer' },
        { id: 'offer.send', name: '发送Offer' },
      ],
    },
    {
      id: 'performance',
      name: '绩效管理',
      permissions: [
        { id: 'perf.view', name: '查看绩效数据' },
        { id: 'perf.goal.create', name: '设定目标' },
        { id: 'perf.goal.edit', name: '编辑目标' },
        { id: 'perf.assess', name: '进行评估' },
        { id: 'perf.review', name: '审核评估' },
        { id: 'perf.analyze', name: '绩效分析' },
      ],
    },
    {
      id: 'compensation',
      name: '薪酬管理',
      permissions: [
        { id: 'salary.view', name: '查看薪资数据' },
        { id: 'salary.calc', name: '计算工资' },
        { id: 'salary.edit', name: '编辑工资' },
        { id: 'salary.approve', name: '审核工资' },
        { id: 'salary.export', name: '导出工资表' },
      ],
    },
    {
      id: 'attendance',
      name: '考勤管理',
      permissions: [
        { id: 'att.view', name: '查看考勤记录' },
        { id: 'att.checkin', name: '打卡签到' },
        { id: 'att.schedule', name: '排班管理' },
        { id: 'att.leave', name: '请假审批' },
        { id: 'att.overtime', name: '加班审批' },
        { id: 'att.export', name: '导出考勤数据' },
      ],
    },
    {
      id: 'ai',
      name: 'AI功能',
      permissions: [
        { id: 'ai.view', name: '查看AI分析' },
        { id: 'ai.job_profile', name: '岗位画像生成' },
        { id: 'ai.resume', name: 'AI简历筛选' },
        { id: 'ai.interview', name: 'AI面试官' },
        { id: 'ai.talent', name: '人才盘点' },
        { id: 'ai.turnover', name: '离职分析' },
        { id: 'ai.prediction', name: '绩效预测' },
      ],
    },
    {
      id: 'workflow',
      name: '工作流',
      permissions: [
        { id: 'wf.view', name: '查看工作流' },
        { id: 'wf.create', name: '创建工作流' },
        { id: 'wf.edit', name: '编辑工作流' },
        { id: 'wf.execute', name: '执行工作流' },
        { id: 'wf.approve', name: '审批流程' },
      ],
    },
    {
      id: 'system',
      name: '系统管理',
      permissions: [
        { id: 'sys.users', name: '用户管理' },
        { id: 'sys.roles', name: '角色管理' },
        { id: 'sys.permissions', name: '权限管理' },
        { id: 'sys.settings', name: '系统设置' },
        { id: 'sys.logs', name: '查看日志' },
        { id: 'sys.exports', name: '数据导出' },
      ],
    },
  ];

  // 账号类型配置
  const accountTypes = {
    main_account: {
      label: '主账号',
      description: '拥有完整权限，可管理所有子账号和员工',
      icon: Crown,
      color: 'bg-amber-100 text-amber-700',
    },
    sub_account: {
      label: '子账号',
      description: '拥有部分管理权限，可管理特定部门或功能',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700',
    },
    employee: {
      label: '普通员工',
      description: '普通员工账号，仅限个人相关功能',
      icon: Users,
      color: 'bg-gray-100 text-gray-700',
    },
  };

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users/list'),
        fetch('/api/roles/list'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.data || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建账号
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建失败');
      }

      alert('账号创建成功！');
      setCreateDialogOpen(false);
      setAccountForm({ name: '', email: '', phone: '', userType: 'employee', role: '', departmentId: '' });
      loadData();
    } catch (error: any) {
      alert(error.message || '创建失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  // 创建角色
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/roles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建失败');
      }

      alert('角色创建成功！');
      setRoleDialogOpen(false);
      setRoleForm({ name: '', code: '', description: '', level: '3', permissions: [] });
      loadData();
    } catch (error: any) {
      alert(error.message || '创建失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  // 切换权限选择
  const togglePermission = (permissionId: string) => {
    if (roleForm.permissions.includes(permissionId)) {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter(p => p !== permissionId),
      });
    } else {
      setRoleForm({
        ...roleForm,
        permissions: [...roleForm.permissions, permissionId],
      });
    }
  };

  // 获取账号类型统计
  const getAccountStats = () => {
    const stats = {
      main_account: users.filter(u => u.userType === 'main_account').length,
      sub_account: users.filter(u => u.userType === 'sub_account').length,
      employee: users.filter(u => u.userType === 'employee').length,
    };
    return stats;
  };

  const stats = getAccountStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* 顶部导航 */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回仪表盘
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">深度权限管理</h1>
          <p className="text-gray-600 mt-2">
            主账号-子账号-普通员工账号三级权限体系，支持精细化权限自定义
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(accountTypes).map(([type, config]) => {
            const Icon = config.icon;
            const count = stats[type as keyof typeof stats];

            return (
              <Card key={type} className="border-2 hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{count}</div>
                  <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 主内容区 */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">权限管理中心</CardTitle>
                <CardDescription>管理账号、角色和权限配置</CardDescription>
              </div>
              <div className="flex gap-3">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      新建账号
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>新建账号</DialogTitle>
                      <DialogDescription>创建子账号或员工账号</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">姓名 *</Label>
                          <Input
                            id="name"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">邮箱 *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={accountForm.email}
                            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">手机号</Label>
                          <Input
                            id="phone"
                            value={accountForm.phone}
                            onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userType">账号类型 *</Label>
                          <Select
                            value={accountForm.userType}
                            onValueChange={(value) => setAccountForm({ ...accountForm, userType: value })}
                          >
                            <SelectTrigger id="userType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sub_account">子账号</SelectItem>
                              <SelectItem value="employee">普通员工</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">分配角色</Label>
                        <Select
                          value={accountForm.role}
                          onValueChange={(value) => setAccountForm({ ...accountForm, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name} ({role.level}级)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          取消
                        </Button>
                        <Button type="submit" disabled={creating}>
                          {creating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              创建中...
                            </>
                          ) : (
                            '创建账号'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      新建角色
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>新建角色</DialogTitle>
                      <DialogDescription>创建自定义角色并分配权限</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRole} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="roleName">角色名称 *</Label>
                          <Input
                            id="roleName"
                            value={roleForm.name}
                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roleCode">角色代码 *</Label>
                          <Input
                            id="roleCode"
                            value={roleForm.code}
                            onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleDescription">角色描述</Label>
                        <Input
                          id="roleDescription"
                          value={roleForm.description}
                          onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleLevel">角色级别 (1-5，数字越小权限越大)</Label>
                        <Select
                          value={roleForm.level}
                          onValueChange={(value) => setRoleForm({ ...roleForm, level: value })}
                        >
                          <SelectTrigger id="roleLevel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <SelectItem key={level} value={level.toString()}>
                                {level}级
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>权限配置</Label>
                        <Alert className="bg-blue-50 border-blue-200">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            已选择 {roleForm.permissions.length} 个权限
                          </AlertDescription>
                        </Alert>

                        {permissionModules.map((module) => (
                          <Card key={module.id} className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{module.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {module.permissions.map((perm) => (
                                  <div
                                    key={perm.id}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => togglePermission(perm.id)}
                                  >
                                    <Switch
                                      checked={roleForm.permissions.includes(perm.id)}
                                      onCheckedChange={() => togglePermission(perm.id)}
                                    />
                                    <span className="text-sm">{perm.name}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
                          取消
                        </Button>
                        <Button type="submit" disabled={creating}>
                          {creating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              创建中...
                            </>
                          ) : (
                            '创建角色'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="accounts">账号管理</TabsTrigger>
                <TabsTrigger value="roles">角色管理</TabsTrigger>
              </TabsList>

              <TabsContent value="accounts" className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    主账号拥有完整权限，子账号和普通员工权限由角色定义
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {users.map((user) => {
                    const typeConfig = accountTypes[user.userType as keyof typeof accountTypes];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                                <TypeIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                              {user.role && (
                                <Badge variant="outline">{user.role}</Badge>
                              )}
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <div className="space-y-3">
                  {roles.map((role) => (
                    <Card key={role.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{role.name}</h3>
                              <p className="text-sm text-gray-600">
                                {role.description || '暂无描述'} · {role.level}级权限
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{role.permissions?.length || 0} 个权限</Badge>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
