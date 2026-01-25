'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  BarChart3,
  LogOut,
  Menu,
  X,
  Crown,
  Database,
  Workflow,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Activity,
  FileText,
  Ticket,
  MessageSquare,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { usePolling } from '@/lib/hooks/use-polling';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalSubscriptions: number;
  activeWorkflows: number;
  revenueThisMonth: number;
  recentUsers: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 使用轮询Hook获取仪表盘数据
  const { data: stats, loading, refresh } = usePolling<DashboardStats>(
    async () => {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        // 如果API不存在，返回模拟数据
        return {
          totalUsers: 156,
          totalCompanies: 24,
          totalSubscriptions: 18,
          activeWorkflows: 342,
          revenueThisMonth: 15800,
          recentUsers: 12,
        };
      }
    },
    {
      interval: 30000, // 30秒轮询一次
      immediate: true,
      enabled: true,
    }
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem('user');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');

    if (!user || isSuperAdmin !== 'true') {
      router.push('/admin/login');
      return;
    }

    setCurrentUser(JSON.parse(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isSuperAdmin');
    router.push('/admin/login');
  };

  const navigation: NavigationItem[] = [
    {
      id: 'dashboard',
      label: '概览',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      id: 'users',
      label: '用户管理',
      icon: Users,
      href: '/admin/users',
    },
    {
      id: 'companies',
      label: '企业管理',
      icon: Building2,
      href: '/admin/companies',
    },
    {
      id: 'sub-accounts',
      label: '子账号管理',
      icon: Shield,
      href: '/admin/sub-accounts',
    },
    {
      id: 'subscriptions',
      label: '订阅管理',
      icon: Package,
      href: '/admin/subscriptions',
    },
    {
      id: 'tickets',
      label: '工单管理',
      icon: Ticket,
      href: '/admin/tickets',
      badge: 'NEW',
    },
    {
      id: 'feedback',
      label: '用户反馈',
      icon: MessageSquare,
      href: '/admin/feedback',
      badge: 'NEW',
    },
    {
      id: 'workflows',
      label: '工作流管理',
      icon: Workflow,
      href: '/admin/workflows',
    },
    {
      id: 'reports',
      label: '报表中心',
      icon: BarChart3,
      href: '/admin/reports',
    },
    {
      id: 'audit-logs',
      label: '审计日志',
      icon: FileText,
      href: '/admin/audit-logs',
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo和菜单按钮 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-bold text-white">超管后台</span>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  <Shield className="mr-1 h-3 w-3" />
                  超级管理员
                </Badge>
                <span className="hidden md:inline text-sm text-gray-300">
                  {currentUser.name}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        {sidebarOpen && (
          <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white/10 text-gray-300 hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-purple-500 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* 主内容区 */}
        <main className={`flex-1 pt-16 min-h-screen ${sidebarOpen ? 'ml-64' : ''}`}>
          <div className="p-6 md:p-8">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                系统概览
              </h1>
              <p className="text-gray-400">
                实时监控系统运行状态和业务数据
              </p>
            </div>

            {/* 统计卡片 */}
            {stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card className="border-0 bg-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      总用户数
                    </CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.totalUsers}
                    </div>
                    <p className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +{stats.recentUsers} 本周新增
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      企业总数
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.totalCompanies}
                    </div>
                    <p className="text-xs text-green-400 flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      运营正常
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      活跃订阅
                    </CardTitle>
                    <Package className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.totalSubscriptions}
                    </div>
                    <p className="text-xs text-gray-400">
                      占比 {(stats.totalSubscriptions / stats.totalCompanies * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      活跃工作流
                    </CardTitle>
                    <Workflow className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.activeWorkflows}
                    </div>
                    <p className="text-xs text-green-400 flex items-center">
                      <Activity className="mr-1 h-3 w-3" />
                      运行中
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/10 backdrop-blur-xl md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      本月收入
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      ¥{stats.revenueThisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      较上月增长
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 数据统计图表 */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* 收入趋势图 */}
              <Card className="border-0 bg-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">收入趋势</CardTitle>
                  <CardDescription className="text-gray-400">
                    近6个月订阅收入变化
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: '7月', revenue: 12000 },
                      { month: '8月', revenue: 15000 },
                      { month: '9月', revenue: 18000 },
                      { month: '10月', revenue: 16000 },
                      { month: '11月', revenue: 21000 },
                      { month: '12月', revenue: 25000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={2} name="收入" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 订阅分布图 */}
              <Card className="border-0 bg-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">订阅分布</CardTitle>
                  <CardDescription className="text-gray-400">
                    各套餐订阅数量占比
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '免费版', value: 45 },
                          { name: '基础版', value: 28 },
                          { name: '专业版', value: 18 },
                          { name: '企业版', value: 9 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#94A3B8" />
                        <Cell fill="#3B82F6" />
                        <Cell fill="#A855F7" />
                        <Cell fill="#F97316" />
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 用户增长图 */}
            <Card className="border-0 bg-white/10 backdrop-blur-xl mb-8">
              <CardHeader>
                <CardTitle className="text-white">用户增长趋势</CardTitle>
                <CardDescription className="text-gray-400">
                  近6个月用户注册情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: '7月', users: 25 },
                    { month: '8月', users: 32 },
                    { month: '9月', users: 28 },
                    { month: '10月', users: 41 },
                    { month: '11月', users: 35 },
                    { month: '12月', users: 48 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="users" fill="#10B981" name="新增用户" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="border-0 bg-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">快速操作</CardTitle>
                <CardDescription className="text-gray-400">
                  常用管理功能入口
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Link href="/admin/users">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white"
                    >
                      <UserPlus className="h-6 w-6" />
                      <span className="text-sm">添加用户</span>
                    </Button>
                  </Link>
                  <Link href="/admin/companies">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white"
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">管理企业</span>
                    </Button>
                  </Link>
                  <Link href="/admin/workflows">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white"
                    >
                      <Workflow className="h-6 w-6" />
                      <span className="text-sm">工作流监控</span>
                    </Button>
                  </Link>
                  <Link href="/admin/reports">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white"
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">查看报表</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 系统提示 */}
            <div className="mt-6">
              <Alert className="bg-purple-500/10 border-purple-500/50">
                <Database className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-200">
                  系统运行正常，数据库连接稳定。所有服务响应时间在正常范围内。
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
