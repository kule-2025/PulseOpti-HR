'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Shield,
  Building2,
  Users,
  Check,
  X,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Key,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

// 会员套餐类型
type MembershipPlan = 'free' | 'basic' | 'professional' | 'enterprise';

// 子账号角色
type SubAccountRole = 'admin' | 'hr' | 'manager' | 'viewer';

// 会员套餐配置
interface MembershipConfig {
  id: MembershipPlan;
  name: string;
  description: string;
  price: number;
  duration: 'month' | 'year';
  maxUsers: number;
  maxSubAccounts: number;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

// 子账号信息
interface SubAccount {
  id: string;
  name: string;
  email: string;
  role: SubAccountRole;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  department?: string;
}

// 使用情况统计
interface UsageStats {
  currentUsers: number;
  currentSubAccounts: number;
  storageUsed: number;
  storageLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

const MembershipPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<MembershipPlan>('basic');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [showAddSubAccount, setShowAddSubAccount] = useState(false);
  const [newSubAccount, setNewSubAccount] = useState({
    name: '',
    email: '',
    role: 'viewer' as SubAccountRole,
    department: ''
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    currentUsers: 8,
    currentSubAccounts: 3,
    storageUsed: 45,
    storageLimit: 100,
    apiCallsUsed: 7500,
    apiCallsLimit: 10000
  });

  // 会员套餐配置（价格单位：元，年付）
  const membershipPlans: MembershipConfig[] = [
    {
      id: 'free',
      name: '免费版',
      description: '适合初创团队体验',
      price: 0,
      duration: 'month',
      maxUsers: 5,
      maxSubAccounts: 0,
      features: [
        '基础人事管理',
        '考勤打卡',
        '0个子账号',
        '5GB存储空间',
        '基础报表',
        '社区支持'
      ],
      color: 'from-gray-500 to-gray-600',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'basic',
      name: '基础版',
      description: '适合10-50人小团队',
      price: 599,
      duration: 'month',
      maxUsers: 50,
      maxSubAccounts: 3,
      features: [
        '包含免费版所有功能',
        '招聘流程管理',
        '3个子账号',
        '50GB存储空间',
        '薪酬管理',
        '培训管理',
        '邮件支持',
        '月付¥50/月'
      ],
      color: 'from-blue-500 to-blue-600',
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 'professional',
      name: '专业版',
      description: '适合50-100人中型团队',
      price: 1499,
      duration: 'month',
      maxUsers: 100,
      maxSubAccounts: 9,
      features: [
        '包含基础版所有功能',
        'AI智能分析',
        '9个子账号',
        '100GB存储空间',
        '工作流引擎',
        '智能面试系统',
        '绩效预测',
        '优先支持',
        '月付¥125/月'
      ],
      color: 'from-purple-500 to-purple-600',
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: 'enterprise',
      name: '企业版',
      description: '适合100-500人大型企业',
      price: 2999,
      duration: 'month',
      maxUsers: 500,
      maxSubAccounts: 50,
      features: [
        '包含专业版所有功能',
        '50个子账号',
        '500GB存储空间',
        '定制化开发',
        '专属客户经理',
        'API集成',
        'SLA保障',
        '24/7技术支持',
        '月付¥259/月'
      ],
      color: 'from-amber-500 to-amber-600',
      icon: <Crown className="h-6 w-6" />
    }
  ];

  // 模拟子账号数据
  useEffect(() => {
    setSubAccounts([
      {
        id: '1',
        name: '张三',
        email: 'zhangsan@example.com',
        role: 'hr',
        status: 'active',
        lastLogin: '2024-01-15 10:30',
        createdAt: '2023-06-10',
        department: '人力资源部'
      },
      {
        id: '2',
        name: '李四',
        email: 'lisi@example.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-14 16:45',
        createdAt: '2023-08-22',
        department: '技术部'
      },
      {
        id: '3',
        name: '王五',
        email: 'wangwu@example.com',
        role: 'viewer',
        status: 'inactive',
        lastLogin: '2024-01-10 09:20',
        createdAt: '2023-11-05',
        department: '市场部'
      }
    ]);
  }, []);

  // 获取当前套餐配置
  const getCurrentPlanConfig = () => {
    return membershipPlans.find(plan => plan.id === currentPlan);
  };

  // 计算使用百分比
  const calculateUsage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  // 添加子账号
  const handleAddSubAccount = () => {
    const plan = getCurrentPlanConfig();
    if (!plan || usageStats.currentSubAccounts >= plan.maxSubAccounts) {
      return;
    }

    const newAccount: SubAccount = {
      id: Date.now().toString(),
      name: newSubAccount.name,
      email: newSubAccount.email,
      role: newSubAccount.role,
      status: 'active',
      lastLogin: '-',
      createdAt: new Date().toISOString().split('T')[0],
      department: newSubAccount.department
    };

    setSubAccounts([...subAccounts, newAccount]);
    setUsageStats({
      ...usageStats,
      currentSubAccounts: usageStats.currentSubAccounts + 1
    });
    setShowAddSubAccount(false);
    setNewSubAccount({ name: '', email: '', role: 'viewer', department: '' });
  };

  // 删除子账号
  const handleDeleteSubAccount = (id: string) => {
    setSubAccounts(subAccounts.filter(account => account.id !== id));
    setUsageStats({
      ...usageStats,
      currentSubAccounts: usageStats.currentSubAccounts - 1
    });
  };

  // 升级套餐
  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setCurrentPlan(selectedPlan);
    setShowUpgradeDialog(false);
  };

  // 获取角色标签
  const getRoleBadge = (role: SubAccountRole) => {
    const config = {
      admin: { label: '管理员', variant: 'destructive' as const },
      hr: { label: 'HR', variant: 'default' as const },
      manager: { label: '经理', variant: 'secondary' as const },
      viewer: { label: '查看者', variant: 'outline' as const }
    };
    return config[role];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">会员中心</h1>
              <p className="text-sm text-gray-600 mt-1">管理您的会员套餐和子账号</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              当前套餐：{getCurrentPlanConfig()?.name}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="plans">套餐升级</TabsTrigger>
            <TabsTrigger value="subaccounts">子账号管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">用户数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageStats.currentUsers} / {getCurrentPlanConfig()?.maxUsers}
                  </div>
                  <Progress 
                    value={calculateUsage(usageStats.currentUsers, getCurrentPlanConfig()?.maxUsers || 1)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">子账号</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageStats.currentSubAccounts} / {getCurrentPlanConfig()?.maxSubAccounts}
                  </div>
                  <Progress 
                    value={calculateUsage(usageStats.currentSubAccounts, getCurrentPlanConfig()?.maxSubAccounts || 1)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">存储空间</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageStats.storageUsed}GB / {usageStats.storageLimit}GB
                  </div>
                  <Progress 
                    value={calculateUsage(usageStats.storageUsed, usageStats.storageLimit)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">API调用</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageStats.apiCallsUsed} / {usageStats.apiCallsLimit}
                  </div>
                  <Progress 
                    value={calculateUsage(usageStats.apiCallsUsed, usageStats.apiCallsLimit)} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>套餐信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">当前套餐：{getCurrentPlanConfig()?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">价格：¥{getCurrentPlanConfig()?.price}/{getCurrentPlanConfig()?.duration === 'month' ? '月' : '年'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">功能：{getCurrentPlanConfig()?.features.length}项</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {currentPlan === plan.id && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      当前套餐
                    </Badge>
                  )}
                  <CardHeader>
                    <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-lg mb-4`}>
                      <div className="flex items-center justify-between text-white">
                        {plan.icon}
                        <span className="text-2xl font-bold">¥{plan.price}</span>
                      </div>
                      <div className="text-white/80 text-sm mt-1">
                        /{plan.duration === 'month' ? '月' : '年'}
                      </div>
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        最多 {plan.maxUsers} 用户
                      </div>
                      <div className="text-sm text-gray-600">
                        最多 {plan.maxSubAccounts} 子账号
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {currentPlan === plan.id ? (
                      <Button disabled className="w-full">当前套餐</Button>
                    ) : (
                      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            升级套餐
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>升级到 {plan.name}</DialogTitle>
                            <DialogDescription>
                              确认要升级到 {plan.name} 吗？升级后立即生效。
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                              取消
                            </Button>
                            <Button onClick={handleUpgrade}>
                              确认升级
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subaccounts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>子账号管理</CardTitle>
                    <CardDescription>
                      管理您的子账号，最多 {getCurrentPlanConfig()?.maxSubAccounts} 个
                    </CardDescription>
                  </div>
                  <Dialog open={showAddSubAccount} onOpenChange={setShowAddSubAccount}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        添加子账号
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加子账号</DialogTitle>
                        <DialogDescription>
                          创建新的子账号并设置权限
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">姓名</Label>
                          <Input
                            id="name"
                            value={newSubAccount.name}
                            onChange={(e) => setNewSubAccount({ ...newSubAccount, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">邮箱</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newSubAccount.email}
                            onChange={(e) => setNewSubAccount({ ...newSubAccount, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">角色</Label>
                          <Select
                            value={newSubAccount.role}
                            onValueChange={(value: any) => setNewSubAccount({ ...newSubAccount, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">管理员</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="manager">经理</SelectItem>
                              <SelectItem value="viewer">查看者</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="department">部门</Label>
                          <Input
                            id="department"
                            value={newSubAccount.department}
                            onChange={(e) => setNewSubAccount({ ...newSubAccount, department: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddSubAccount(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddSubAccount}>
                          添加
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>最后登录</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>{account.department || '-'}</TableCell>
                        <TableCell>
                          <Badge {...getRoleBadge(account.role)}>
                            {getRoleBadge(account.role).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={account.status === 'active' ? 'default' : 'secondary'}
                          >
                            {account.status === 'active' ? '活跃' : 
                             account.status === 'inactive' ? '停用' : '冻结'}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.lastLogin}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSubAccounts(subAccounts.map(a => 
                                    a.id === account.id 
                                      ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
                                      : a
                                  ));
                                }}
                              >
                                {account.status === 'active' ? '停用账号' : '启用账号'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteSubAccount(account.id)}
                                className="text-red-600"
                              >
                                删除账号
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipPage;
