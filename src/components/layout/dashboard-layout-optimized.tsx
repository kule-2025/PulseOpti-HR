'use client';

import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/branding/Logo';
import { OptimizedAvatar } from '@/components/performance/optimized-image';
import { cn } from '@/lib/theme';
import { useLocalStorage, useDebounce } from '@/hooks/use-performance';

// 懒加载重型组件
const FeedbackWidget = lazy(() => import('@/components/feedback/feedback-widget'));

// 图标导入 - 按需导入以减少包大小
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard: () => null, // 将动态导入
  BarChart3: () => null,
  Trophy: () => null,
  Users: () => null,
  Briefcase: () => null,
  Target: () => null,
  DollarSign: () => null,
  Clock: () => null,
  GraduationCap: () => null,
  FileText: () => null,
  User: () => null,
  Settings: () => null,
  Sparkles: () => null,
  TrendingUp: () => null,
  ShoppingBag: () => null,
  Bell: () => null,
  Layers: () => null,
  Home: () => null,
  ChevronDown: () => null,
  Menu: () => null,
  X: () => null,
  Search: () => null,
  LogOut: () => null,
  Building: () => null,
  Award: () => null,
};

// 动态导入图标
const loadIcon = async (name: string) => {
  const icons = await import('lucide-react');
  return icons[name as keyof typeof icons];
};

// 导航配置 - 使用Memo缓存
export const navigationConfig = [
  {
    name: '工作台',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: '数据概览与快捷操作',
  },
  {
    name: '人效监测',
    href: '/dashboard/human-efficiency',
    icon: 'BarChart3',
    description: '实时监测、归因分析、预测干预',
    badge: 'NEW',
    color: 'from-blue-600 to-blue-500',
  },
  {
    name: '积分管理',
    href: '/dashboard/points',
    icon: 'Trophy',
    description: '积分系统、规则配置、兑换商城',
    badge: 'NEW',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    name: '组织人事',
    href: '/dashboard/employees',
    icon: 'Users',
    description: '员工档案、组织架构',
  },
  {
    name: '招聘管理',
    href: '/dashboard/recruiting',
    icon: 'Briefcase',
    description: '岗位发布、简历筛选、面试安排',
  },
  {
    name: '绩效管理',
    href: '/dashboard/performance',
    icon: 'Target',
    description: '目标设定、绩效评估',
  },
  {
    name: '薪酬管理',
    href: '/dashboard/compensation',
    icon: 'DollarSign',
    description: '工资核算、福利管理',
  },
  {
    name: '考勤管理',
    href: '/dashboard/attendance',
    icon: 'Clock',
    description: '打卡管理、排班、请假',
  },
  {
    name: '培训管理',
    href: '/dashboard/training',
    icon: 'GraduationCap',
    description: '培训计划、课程管理',
  },
  {
    name: '离职管理',
    href: '/dashboard/offboarding',
    icon: 'FileText',
    description: '离职申请、交接、访谈、分析',
  },
  {
    name: '统计分析',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
    description: '数据统计与AI智能分析',
    badge: 'NEW',
  },
  {
    name: '告警监控',
    href: '/dashboard/alerts/monitor',
    icon: 'Bell',
    description: '系统告警与异常监控',
    badge: 'NEW',
  },
  {
    name: '数据同步',
    href: '/dashboard/sync/manager',
    icon: 'Layers',
    description: '数据同步任务管理',
    badge: 'NEW',
  },
];

// 侧边栏状态持久化键
const SIDEBAR_STATE_KEY = 'sidebar-expanded';
const SIDEBAR_OPEN_KEY = 'sidebar-open';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// 优化的侧边栏组件
const OptimizedSidebar = memo(function OptimizedSidebar({
  isOpen,
  pathname,
  expandedMenus,
  onToggleMenu,
  onClose,
  isMobile,
}: {
  isOpen: boolean;
  pathname: string;
  expandedMenus: string[];
  onToggleMenu: (name: string, hasSubItems: boolean) => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  // 使用防抖处理菜单点击
  const debouncedToggle = useDebounce(onToggleMenu, 100);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen w-64 transform border-r bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={() => isMobile && onClose()}
        >
          <Logo variant="icon" size="md" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
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
          onClick={onClose}
          aria-label="关闭侧边栏"
        >
          <MenuIcon name="X" />
        </Button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="主导航">
        <NavigationItems
          pathname={pathname}
          expandedMenus={expandedMenus}
          onToggle={debouncedToggle}
          isMobile={isMobile}
          onClose={onClose}
        />
      </nav>

      {/* 底部信息 */}
      <div className="border-t p-4">
        <UpgradePrompt />
      </div>
    </aside>
  );
});

// 导航项组件
const NavigationItems = memo(function NavigationItems({
  pathname,
  expandedMenus,
  onToggle,
  isMobile,
  onClose,
}: {
  pathname: string;
  expandedMenus: string[];
  onToggle: (name: string, hasSubItems: boolean) => void;
  isMobile: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {navigationConfig.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const isExpanded = expandedMenus.includes(item.name);

        return (
          <NavigationItem
            key={item.name}
            item={item}
            isActive={isActive}
            isExpanded={isExpanded}
            pathname={pathname}
            onToggle={onToggle}
            isMobile={isMobile}
            onClose={onClose}
          />
        );
      })}
    </>
  );
});

// 单个导航项组件
const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  isExpanded,
  pathname,
  onToggle,
  isMobile,
  onClose,
}: {
  item: any;
  isActive: boolean;
  isExpanded: boolean;
  pathname: string;
  onToggle: (name: string, hasSubItems: boolean) => void;
  isMobile: boolean;
  onClose: () => void;
}) {
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div>
      <div
        onClick={() => onToggle(item.name, hasSubItems || false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none',
          'hover:shadow-sm',
          isActive
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 dark:from-blue-950 dark:to-purple-950 dark:text-blue-400 shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-haspopup={hasSubItems}
      >
        <MenuIcon name={item.icon} isActive={isActive} />
        <span className="flex-1 truncate">{item.name}</span>
        {item.badge && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs shrink-0 font-normal',
              item.badge === 'AI'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:opacity-90'
                : item.badge === 'NEW'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 hover:opacity-90'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            {item.badge}
          </Badge>
        )}
        {hasSubItems && (
          <ChevronDownIcon isExpanded={isExpanded} />
        )}
      </div>
    </div>
  );
});

// 图标组件 - 使用动态导入
function MenuIcon({ name, isActive = false }: { name: string; isActive?: boolean }) {
  const [Icon, setIcon] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    loadIcon(name).then((icon) => {
      setIcon(() => icon as React.ComponentType<any>);
    });
  }, [name]);

  if (!Icon) return <div className="h-5 w-5" />;

  return (
    <Icon
      className={cn(
        'h-5 w-5 transition-colors flex-shrink-0',
        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
      )}
    />
  );
}

// Chevron Down 图标
function ChevronDownIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={cn(
        'h-4 w-4 transition-transform flex-shrink-0',
        isExpanded && 'rotate-180'
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// 升级提示组件
const UpgradePrompt = memo(function UpgradePrompt() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950 dark:to-purple-950">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            免费版
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            升级解锁全部功能
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs"
        >
          升级
        </Button>
      </div>
    </div>
  );
});

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 使用 localStorage 持久化侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(SIDEBAR_OPEN_KEY, false);
  const [expandedMenus, setExpandedMenus] = useLocalStorage<string[]>(SIDEBAR_STATE_KEY, []);

  // 防抖处理菜单切换
  const debouncedToggleMenu = useCallback((menuName: string, hasSubItems: boolean) => {
    if (!hasSubItems) {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      return;
    }

    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  }, [setExpandedMenus, setSidebarOpen]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 优化的侧边栏 */}
      <OptimizedSidebar
        isOpen={sidebarOpen}
        pathname={pathname}
        expandedMenus={expandedMenus}
        onToggleMenu={debouncedToggleMenu}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* 主内容区 */}
      <div className="lg:pl-64 transition-all duration-300">
        <Header
          onMenuOpen={() => setSidebarOpen(true)}
          pathname={pathname}
          isMobile={isMobile}
        />

        {/* 页面内容 - 使用 Suspense 优化加载 */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </main>

        {/* 懒加载反馈组件 */}
        <Suspense fallback={null}>
          <FeedbackWidget />
        </Suspense>
      </div>
    </div>
  );
}

// 头部组件
const Header = memo(function Header({
  onMenuOpen,
  pathname,
  isMobile,
}: {
  onMenuOpen: () => void;
  pathname: string;
  isMobile: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={onMenuOpen}
            aria-label="打开侧边栏"
          >
            <MenuIcon name="Menu" />
          </Button>
          <Breadcrumbs pathname={pathname} />
        </div>

        <HeaderActions />
      </div>
    </header>
  );
});

// 面包屑导航
const Breadcrumbs = memo(function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ name: '工作台', href: '/dashboard' }];

    return segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + segments.slice(0, index + 1).join('/'),
    }));
  }, [pathname]);

  return (
    <nav className="hidden md:flex items-center gap-2 text-sm" aria-label="面包屑">
      {crumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-400">/</span>}
          <Link
            href={crumb.href}
            className={cn(
              'hover:text-blue-600 transition-colors',
              index === crumbs.length - 1
                ? 'text-gray-900 font-medium dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {crumb.name}
          </Link>
        </div>
      ))}
    </nav>
  );
});

// 头部操作区
const HeaderActions = memo(function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <SearchBox />
      <UserMenu />
    </div>
  );
});

// 搜索框
const SearchBox = memo(function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 使用 debouncedQuery 执行搜索
    console.log('Searching:', debouncedQuery);
  };

  return (
    <div className="relative hidden sm:block">
      <MenuIcon name="Search" />
      <input
        type="text"
        placeholder="搜索..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="ml-8 pl-3 pr-4 py-2 w-64 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
});

// 用户菜单
const UserMenu = memo(function UserMenu() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon">
        <MenuIcon name="Bell" />
      </Button>
      <DropdownMenu />
    </div>
  );
});

// 下拉菜单
const DropdownMenu = memo(function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <OptimizedAvatar
          src="/avatar.png"
          alt="用户头像"
          fallback="李"
          size="md"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 py-1 z-50">
          <div className="px-4 py-2 border-b dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">李明</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">HR经理</p>
          </div>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            设置
          </Link>
          <Link
            href="/logout"
            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            退出登录
          </Link>
        </div>
      )}
    </div>
  );
});

// 页面骨架屏
function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
