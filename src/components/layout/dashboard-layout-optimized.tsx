'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/branding/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShoppingBag,
  Clock,
  GraduationCap,
  TrendingUp,
  Trophy,
  Gift,
  Zap,
  Layers,
  User,
  Building,
  Award,
  Home,
  Download,
  Crown,
  AlertCircle,
  Star,
  CheckCircle,
  X,
  Menu,
  Shield,
  Bell,
  ArrowRight,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/theme';
import { useLocalStorage } from '@/hooks/use-performance';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// 三支柱模型导航配置
const COE_NAV = [
  { name: '绩效管理', href: '/performance', icon: Target, description: '目标设定与评估' },
  { name: '薪酬管理', href: '/compensation', icon: DollarSign, description: '工资核算与发放' },
  { name: '培训管理', href: '/training/courses', icon: GraduationCap, description: '课程与培训' },
  { name: '合规管理', href: '/compliance', icon: Shield, description: '合同与风险' },
  { name: 'HR报表', href: '/hr-reports', icon: BarChart3, description: '数据与报表' },
];

const HRBP_NAV = [
  { name: '招聘管理', href: '/recruitment/jobs', icon: Briefcase, description: '岗位与人才' },
  { name: '人才发展', href: '/talent-development', icon: Trophy, description: '梯队与培养' },
  { name: '员工关怀', href: '/employee-care', icon: Gift, description: '关怀与反馈' },
  { name: '组织诊断', href: '/organization-diagnostics', icon: Building, description: '健康与优化' },
  { name: '业务支持', href: '/business-support', icon: Zap, description: '支持与跟踪' },
  { name: 'AI助手', href: '/ai-assistant', icon: Sparkles, description: '智能助手', badge: 'AI', color: 'from-purple-600 to-pink-600' },
];

const SSC_NAV = [
  { name: '组织人事', href: '/employees', icon: Users, description: '档案与架构' },
  { name: '考勤管理', href: '/attendance', icon: Clock, description: '打卡与排班' },
  { name: '员工自助', href: '/employee-portal', icon: User, description: '个人服务' },
  { name: '薪酬发放', href: '/payroll', icon: DollarSign, description: '发放与福利' },
  { name: '积分管理', href: '/points/dashboard', icon: Gift, description: '积分与商城', badge: 'NEW', color: 'from-orange-500 to-yellow-500' },
];

const PREMIUM_NAV = [
  { name: '高级权限', href: '/dashboard/permissions/advanced', icon: Award, description: '企业权限', badge: 'PRO', color: 'from-red-600 to-pink-600' },
  { name: '数据导出', href: '/dashboard/data-export', icon: Download, description: '高级导出', badge: 'PRO', color: 'from-red-600 to-pink-600' },
  { name: '企业协作', href: '/dashboard/integration', icon: Building, description: '第三方集成', badge: 'PRO', color: 'from-red-600 to-pink-600' },
];

const SYSTEM_NAV = [
  { name: '订单管理', href: '/orders', icon: ShoppingBag, description: '订阅与订单' },
  { name: '工作流', href: '/workflows', icon: Layers, description: '流程管理', badge: 'NEW' },
  { name: '系统设置', href: '/settings', icon: Settings, description: '配置与管理' },
];

const SIDEBAR_STATE_KEY = 'sidebar-expanded';
const SIDEBAR_OPEN_KEY = 'sidebar-open';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(SIDEBAR_OPEN_KEY, false);
  const [expandedMenus, setExpandedMenus] = useLocalStorage<string[]>(SIDEBAR_STATE_KEY, []);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 自动展开当前菜单
  useEffect(() => {
    const allNav = [...COE_NAV, ...HRBP_NAV, ...SSC_NAV, ...PREMIUM_NAV, ...SYSTEM_NAV];
    const activeMenu = allNav.find(item =>
      pathname === item.href || pathname.startsWith(item.href + '/')
    );
    if (activeMenu && !expandedMenus.includes(activeMenu.name)) {
      setExpandedMenus([...expandedMenus, activeMenu.name]);
    }
  }, [pathname, expandedMenus, setExpandedMenus]);

  const toggleMenu = useCallback((menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(n => n !== menuName)
        : [...prev, menuName]
    );
  }, [setExpandedMenus]);

  const MenuItem = ({ item, isActive, category }: { item: any; isActive: boolean; category: string }) => {
    const Icon = item.icon;
    const categoryColors = {
      coe: 'purple',
      hrbp: 'blue',
      ssc: 'green',
      premium: 'red',
      system: 'gray',
    } as const;
    const color = categoryColors[category as keyof typeof categoryColors] || 'gray';

    return (
      <Link
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:shadow-sm',
          isActive
            ? `bg-gradient-to-r from-${color}-50 to-${color}-100 text-${color}-700 dark:from-${color}-950 dark:to-${color}-900 dark:text-${color}-400 shadow-sm`
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
        onClick={() => {
          if (isMobile) setSidebarOpen(false);
        }}
      >
        <Icon className={cn(
          'h-5 w-5 transition-colors flex-shrink-0',
          isActive ? `text-${color}-600 dark:text-${color}-400` : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
        )} />
        <span className="flex-1 truncate">{item.name}</span>
        {item.badge && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs shrink-0 font-normal',
              item.color ? `bg-gradient-to-r ${item.color} text-white border-0 hover:opacity-90` : 'bg-gray-100 text-gray-700'
            )}
          >
            {item.badge}
          </Badge>
        )}
        {item.description && !sidebarOpen && (
          <span className="hidden lg:block text-xs text-gray-500 ml-2">{item.description}</span>
        )}
      </Link>
    );
  };

  const NavSection = ({ title, icon: Icon, items, color, category }: any) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className={cn('h-4 w-4 text-' + color + '-600')} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((item: any) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return <MenuItem key={item.name} item={item} isActive={isActive} category={category} />;
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* 移动端遮罩 */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out',
          'flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PulseOpti HR
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                脉策聚效系统
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 工作台 */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-950 dark:to-blue-900 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <LayoutDashboard className={cn('h-5 w-5', pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400')} />
              <span>工作台</span>
            </Link>
          </div>

          {/* COE 中心 */}
          <NavSection title="COE 专家中心" icon={Award} items={COE_NAV} color="purple" category="coe" />

          {/* HRBP 中心 */}
          <NavSection title="HRBP 业务伙伴" icon={TrendingUp} items={HRBP_NAV} color="blue" category="hrbp" />

          {/* SSC 中心 */}
          <NavSection title="SSC 共享中心" icon={Shield} items={SSC_NAV} color="green" category="ssc" />

          {/* 高级功能 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2">
              <Crown className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                高级功能
              </span>
              <Badge className="ml-auto text-xs bg-gradient-to-r from-red-600 to-pink-600 text-white border-0">
                PRO
              </Badge>
            </div>
            <div className="space-y-0.5">
              {PREMIUM_NAV.map((item: any) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return <MenuItem key={item.name} item={item} isActive={isActive} category="premium" />;
              })}
            </div>
          </div>

          {/* 系统管理 */}
          <NavSection title="系统管理" icon={Settings} items={SYSTEM_NAV} color="gray" category="system" />
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                    张
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">张三</div>
                  <div className="text-xs text-gray-500">HR总监</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                个人信息
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Home className="h-4 w-4" />
                <span>/</span>
                <span>工作台</span>
                {pathname !== '/dashboard' && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pathname.split('/').pop()?.replace(/-/g, ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2"
                onClick={() => router.push('/orders')}
              >
                <Crown className="h-4 w-4 text-amber-600" />
                <span>升级PRO</span>
              </Button>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
