'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/branding/Logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Clock,
  GraduationCap,
  TrendingUp,
  Trophy,
  Gift,
  Layers,
  User,
  Building,
  Home,
  Download,
  Crown,
  FileText,
  Shield,
  Zap,
  BookOpen,
  Calendar,
  MessageSquare,
  Phone,
  CreditCard,
  MoreHorizontal,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/theme';
import { useLocalStorage } from '@/hooks/use-performance';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  description?: string;
  category?: 'workbench' | 'coe' | 'hrbp' | 'ssc' | 'premium' | 'system';
  priority?: number;
  color?: string;
  badge?: string | { text: string; color: string };
  subItems?: NavigationItem[];
  shortcuts?: string[];
}

// 基于企业真实用户场景重新设计的导航结构
const navigation: NavigationItem[] = [
  // ==================== 工作台 ====================
  {
    name: '工作台',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '数据概览与快捷操作',
    category: 'workbench',
    priority: 1,
    subItems: [
      {
        name: '数据概览',
        href: '/dashboard/overview',
        icon: BarChart3,
        description: '关键指标实时监控',
      },
      {
        name: '待办事项',
        href: '/dashboard/tasks',
        icon: Clock,
        description: '审批、通知、提醒',
        shortcuts: ['待审批', '已逾期'],
      },
      {
        name: '快捷操作',
        href: '/dashboard/quick-actions',
        icon: Zap,
        description: '常用功能快速入口',
        shortcuts: ['发起流程', '数据导出', '发送通知'],
      },
    ],
  },

  // ==================== COE 专家中心（紫色） ====================
  {
    name: 'COE中心',
    href: '/coe',
    icon: BookOpen,
    description: '战略性人力资源管理',
    category: 'coe',
    priority: 2,
    color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
    subItems: [
      {
        name: '绩效管理',
        href: '/performance',
        icon: Target,
        description: 'OKR/KPI、360度评估、绩效分析',
        subItems: [
          { name: '目标设定', href: '/performance/goal-setting', description: '制定OKR/KPI目标' },
          { name: '绩效评估', href: '/performance/assessment', description: '360度评估' },
          { name: '绩效改进', href: '/performance/pip', description: '绩效改进计划' },
          { name: '绩效分析', href: '/performance/result-analysis', description: '数据统计分析' },
        ],
      },
      {
        name: '薪酬管理',
        href: '/compensation',
        icon: DollarSign,
        description: '薪资核算、薪酬体系、社保个税',
        subItems: [
          { name: '薪资核算', href: '/compensation/salary-calculation', description: '月薪计算发放' },
          { name: '薪酬结构', href: '/compensation/salary-structure', description: '薪酬体系设计' },
          { name: '社保公积金', href: '/compensation/social-insurance', description: '社保公积金管理' },
          { name: '个税管理', href: '/compensation/tax', description: '个人所得税' },
          { name: '奖金发放', href: '/compensation/bonus', description: '绩效奖金' },
        ],
      },
      {
        name: '培训管理',
        href: '/training',
        icon: GraduationCap,
        description: '培训计划、课程管理、效果评估',
        subItems: [
          { name: '培训计划', href: '/training/plans', description: '年度培训规划' },
          { name: '课程管理', href: '/training/courses', description: '课程创建管理' },
          { name: '学习记录', href: '/training/records', description: '学习进度跟踪' },
          { name: '培训效果', href: '/training/effectiveness', description: '培训效果评估' },
        ],
      },
      {
        name: '合规管理',
        href: '/compliance',
        icon: Shield,
        description: '劳动合同、用工风险、法律知识',
        subItems: [
          { name: '劳动合同', href: '/compliance/contracts', description: '合同签署管理' },
          { name: '试用期', href: '/compliance/probation', description: '试用期跟踪' },
          { name: '风险控制', href: '/compliance/risk', description: '用工风险识别' },
          { name: '法律知识', href: '/compliance/legal', description: '劳动法规查询' },
        ],
      },
    ],
  },

  // ==================== HRBP 业务伙伴（蓝色） ====================
  {
    name: 'HRBP中心',
    href: '/hrbp',
    icon: TrendingUp,
    description: '深度业务支持，赋能业务增长',
    category: 'hrbp',
    priority: 3,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    subItems: [
      {
        name: '智能招聘',
        href: '/recruitment',
        icon: Briefcase,
        description: '岗位发布、简历筛选、AI面试',
        badge: { text: 'AI', color: 'from-purple-600 to-pink-600' },
        subItems: [
          { name: '岗位发布', href: '/recruitment/jobs', description: '职位发布推广' },
          { name: '简历管理', href: '/recruitment/resumes', description: '简历筛选管理' },
          { name: '面试安排', href: '/recruitment/interviews', description: '面试流程管理' },
          { name: '人才库', href: '/recruitment/talent-pool', description: '人才储备库' },
          { name: 'AI面试', href: '/recruitment/ai-interview', description: 'AI辅助面试', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
          { name: 'AI简历解析', href: '/recruitment/ai-resume-parser', description: '智能简历分析', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
        ],
      },
      {
        name: '人才发展',
        href: '/talent',
        icon: Trophy,
        description: '人才梯队、九宫格、继任计划',
        subItems: [
          { name: '发展计划', href: '/talent-development/plans', description: '个人发展规划' },
          { name: '人才评估', href: '/talent/review', description: '人才能力评估' },
          { name: '九宫格', href: '/talent/grid', description: '人才九宫格分析' },
          { name: '继任计划', href: '/talent/succession', description: '关键岗位继任' },
          { name: '人才地图', href: '/talent-map', description: '人才分布地图' },
        ],
      },
      {
        name: '员工关怀',
        href: '/employee-care',
        icon: MessageSquare,
        description: '关怀记录、员工反馈、满意度',
        subItems: [
          { name: '关怀记录', href: '/employee-care/records', description: '员工关怀跟踪' },
          { name: '员工反馈', href: '/employee-care/feedback', description: '意见建议收集' },
          { name: '满意度调查', href: '/employee-care/survey', description: '满意度调研' },
          { name: '关怀日历', href: '/employee-care/calendar', description: '关怀提醒' },
        ],
      },
      {
        name: '业务支持',
        href: '/business-support',
        icon: Layers,
        description: 'HR支持项目、业务目标、会议',
        subItems: [
          { name: '支持项目', href: '/business-support/projects', description: 'HR支持项目' },
          { name: '业务目标', href: '/business-support/goals', description: '业务目标跟踪' },
          { name: '会议记录', href: '/business-support/meetings', description: '会议记录' },
        ],
      },
      {
        name: 'AI助手',
        href: '/ai-assistant',
        icon: Sparkles,
        description: '岗位画像、人才推荐、离职预测',
        badge: { text: 'AI', color: 'from-purple-600 to-pink-600' },
        subItems: [
          { name: '岗位画像', href: '/dashboard/ai-assistant/job-profile', description: '智能岗位画像', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
          { name: '人才推荐', href: '/dashboard/ai-assistant/recommendation', description: '智能人才推荐', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
          { name: '离职预测', href: '/dashboard/ai-assistant/turnover-prediction', description: '离职风险预警', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
          { name: '智能盘点', href: '/dashboard/ai-assistant/talent-review', description: 'AI人才盘点', badge: { text: 'AI', color: 'from-purple-600 to-pink-600' } },
        ],
      },
    ],
  },

  // ==================== SSC 共享中心（绿色） ====================
  {
    name: 'SSC中心',
    href: '/ssc',
    icon: Users,
    description: '高效事务处理，降低运营成本',
    category: 'ssc',
    priority: 4,
    color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    subItems: [
      {
        name: '组织人事',
        href: '/employees',
        icon: Users,
        description: '员工档案、组织架构、人员异动',
        subItems: [
          { name: '员工管理', href: '/dashboard/employees', description: '员工档案管理' },
          { name: '组织架构', href: '/dashboard/organization', description: '组织结构图' },
          { name: '职位体系', href: '/dashboard/job-hierarchy', description: '职位职级体系' },
          { name: '人员异动', href: '/dashboard/employees/movement', description: '入职晋升转岗离职' },
        ],
      },
      {
        name: '考勤管理',
        href: '/attendance',
        icon: Clock,
        description: '打卡记录、排班管理、请假审批',
        subItems: [
          { name: '考勤记录', href: '/attendance', description: '打卡记录查询' },
          { name: '排班管理', href: '/attendance/scheduling', description: '排班规则设置' },
          { name: '请假审批', href: '/attendance/leave-approval', description: '请假申请审批' },
          { name: '加班管理', href: '/attendance/overtime', description: '加班申请管理' },
          { name: '移动打卡', href: '/attendance/clock-in', description: '手机打卡' },
        ],
      },
      {
        name: '员工自助',
        href: '/employee-portal',
        icon: User,
        description: '个人信息、请假申请、工资条',
        subItems: [
          { name: '个人中心', href: '/dashboard/employee-portal', description: '个人档案维护' },
          { name: '请假申请', href: '/dashboard/employee/self-service', description: '请假申请提交' },
          { name: '报销管理', href: '/dashboard/reimbursement', description: '费用报销申请' },
          { name: '工资条', href: '/dashboard/payslip', description: '电子工资条' },
        ],
      },
      {
        name: '薪酬发放',
        href: '/payroll',
        icon: CreditCard,
        description: '薪资发放、福利管理',
        subItems: [
          { name: '薪资发放', href: '/dashboard/payroll', description: '月薪批量发放' },
          { name: '福利管理', href: '/dashboard/benefits', description: '员工福利配置' },
          { name: '发放历史', href: '/dashboard/payroll/history', description: '历史发放记录' },
        ],
      },
      {
        name: '积分管理',
        href: '/points',
        icon: Gift,
        description: '积分系统、规则配置、兑换商城',
        badge: { text: 'NEW', color: 'from-blue-600 to-cyan-600' },
        subItems: [
          { name: '积分总览', href: '/dashboard/points', description: '积分仪表盘' },
          { name: '积分规则', href: '/dashboard/points/rules', description: '积分规则设置' },
          { name: '积分明细', href: '/dashboard/points/records', description: '积分获取明细' },
          { name: '兑换商城', href: '/dashboard/points/exchange', description: '积分兑换礼品' },
        ],
      },
    ],
  },

  // ==================== 高级功能 PRO ====================
  {
    name: '高级功能',
    href: '/premium',
    icon: Crown,
    description: '企业级功能，提升管理效率',
    category: 'premium',
    priority: 5,
    color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
    subItems: [
      {
        name: '数据大屏',
        href: '/admin/data-dashboard',
        icon: BarChart3,
        description: '实时数据可视化大屏',
        badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
      },
      {
        name: '自定义报表',
        href: '/admin/custom-reports',
        icon: FileText,
        description: '拖拽式报表设计器',
        badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
      },
      {
        name: 'API开放平台',
        href: '/admin/api-platform',
        icon: Zap,
        description: 'REST API接口文档',
        badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
      },
      {
        name: '高级权限',
        href: '/settings/roles',
        icon: Shield,
        description: '企业级权限控制',
        badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
      },
      {
        name: '数据导出',
        href: '/dashboard/data-export',
        icon: Download,
        description: '多格式数据导出',
        badge: { text: 'PRO', color: 'from-red-600 to-pink-600' },
      },
      {
        name: '企业协作',
        href: '/integration',
        icon: Building,
        description: '钉钉/飞书/企业微信',
        subItems: [
          { name: '飞书集成', href: '/dashboard/integration/feishu' },
          { name: '钉钉集成', href: '/dashboard/integration/dingtalk' },
          { name: '企业微信', href: '/dashboard/integration/wecom' },
        ],
      },
    ],
  },

  // ==================== 系统管理 ====================
  {
    name: '系统管理',
    href: '/settings',
    icon: Settings,
    description: '订单、工作流、系统设置',
    category: 'system',
    priority: 6,
    color: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
    subItems: [
      {
        name: '订单管理',
        href: '/orders',
        icon: CreditCard,
        description: '会员订阅、订单查询',
        subItems: [
          { name: '订阅管理', href: '/admin/subscriptions', description: '套餐订阅' },
          { name: '订单查询', href: '/orders/list', description: '订单列表' },
        ],
      },
      {
        name: '工作流',
        href: '/workflows',
        icon: Layers,
        description: '流程自动化配置',
        subItems: [
          { name: '流程定义', href: '/dashboard/workflow/definitions', description: '流程模板' },
          { name: '流程实例', href: '/dashboard/workflow/instances', description: '流程执行' },
          { name: '流程监控', href: '/dashboard/workflow/monitor', description: '流程监控' },
        ],
      },
      {
        name: '系统设置',
        href: '/settings',
        icon: Settings,
        description: '企业设置、通知、安全',
        subItems: [
          { name: '企业设置', href: '/dashboard/settings/company', description: '企业信息' },
          { name: '通知设置', href: '/dashboard/settings/notifications', description: '消息通知' },
          { name: '安全设置', href: '/dashboard/settings/security', description: '账户安全' },
        ],
      },
    ],
  },
];

// 侧边栏状态持久化键
const SIDEBAR_STATE_KEY = 'sidebar-expanded-v2';
const SIDEBAR_OPEN_KEY = 'sidebar-open-v2';

export default function DashboardLayoutOptimized({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // 使用 localStorage 持久化侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(SIDEBAR_OPEN_KEY, false);
  const [expandedMenus, setExpandedMenus] = useLocalStorage<string[]>(SIDEBAR_STATE_KEY, []);

  // 自动展开当前活动菜单
  useEffect(() => {
    const activeMenu = navigation.find(item =>
      pathname === item.href || pathname.startsWith(item.href + '/')
    );

    if (activeMenu && activeMenu.subItems && activeMenu.subItems.length > 0) {
      if (!expandedMenus.includes(activeMenu.name)) {
        setExpandedMenus([...expandedMenus, activeMenu.name]);
      }
    }
  }, [pathname, expandedMenus, setExpandedMenus]);

  const toggleMenu = useCallback((menuName: string, hasSubItems: boolean) => {
    if (!hasSubItems) {
      // 移动端关闭侧边栏
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

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-72 transform border-r bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
            }}
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
            onClick={() => setSidebarOpen(false)}
            aria-label="关闭侧边栏"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 导航菜单 */}
        <ScrollArea className="flex-1 p-4">
          <TooltipProvider delayDuration={500}>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.name);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.name} className="mb-4">
                  {/* 主菜单项 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => toggleMenu(item.name, hasSubItems || false)}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none',
                          'hover:shadow-sm',
                          isActive && item.color
                            ? item.color
                            : isActive
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 dark:from-purple-950 dark:to-pink-950 dark:text-purple-400 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-haspopup={hasSubItems}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 transition-colors flex-shrink-0',
                            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                          )}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs shrink-0 font-normal border-0',
                              typeof item.badge === 'string'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                : `bg-gradient-to-r ${item.badge.color} text-white hover:opacity-90`
                            )}
                          >
                            {typeof item.badge === 'string' ? item.badge : item.badge.text}
                          </Badge>
                        )}
                        {hasSubItems && (
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform flex-shrink-0',
                              isExpanded && 'rotate-90'
                            )}
                          />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                    </TooltipContent>
                  </Tooltip>

                  {/* 子菜单 */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-6 mt-1.5 space-y-1" role="group">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                        const SubIcon = subItem.icon;
                        const hasSubSubItems = subItem.subItems && subItem.subItems.length > 0;
                        const isSubExpanded = expandedMenus.includes(subItem.name);

                        return (
                          <div key={subItem.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={subItem.href}
                                  onClick={(e) => {
                                    if (hasSubSubItems) {
                                      e.preventDefault();
                                      toggleMenu(subItem.name, true);
                                    }
                                    if (isMobile) setSidebarOpen(false);
                                  }}
                                  className={cn(
                                    'group/sub relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                    isSubActive && item.color
                                      ? item.color.replace('bg-', 'bg-').replace('text-', 'text-')
                                      : isSubActive
                                      ? 'text-purple-600 bg-purple-50/50 dark:bg-purple-950/30 dark:text-purple-400'
                                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                                  )}
                                >
                                  <SubIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="flex-1 truncate">{subItem.name}</span>
                                  {subItem.badge && (
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'text-xs shrink-0 font-normal border-0',
                                        typeof subItem.badge === 'string'
                                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                          : `bg-gradient-to-r ${subItem.badge.color} text-white hover:opacity-90`
                                      )}
                                    >
                                      {typeof subItem.badge === 'string' ? subItem.badge : subItem.badge.text}
                                    </Badge>
                                  )}
                                  {hasSubSubItems && (
                                    <ChevronRight
                                      className={cn(
                                        'h-3 w-3 transition-transform flex-shrink-0',
                                        isSubExpanded && 'rotate-90'
                                      )}
                                    />
                                  )}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="font-medium">{subItem.name}</p>
                                {subItem.description && <p className="text-xs text-gray-500 mt-1">{subItem.description}</p>}
                              </TooltipContent>
                            </Tooltip>

                            {/* 三级子菜单 */}
                            {hasSubSubItems && isSubExpanded && (
                              <div className="ml-6 mt-1 space-y-0.5">
                                {subItem.subItems!.map((subSubItem) => {
                                  const isSubSubActive = pathname === subSubItem.href;
                                  const SubSubIcon = subSubItem.icon;

                                  return (
                                    <Tooltip key={subSubItem.name}>
                                      <TooltipTrigger asChild>
                                        <Link
                                          href={subSubItem.href}
                                          onClick={() => {
                                            if (isMobile) setSidebarOpen(false);
                                          }}
                                          className={cn(
                                            'group/subsub relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200',
                                            isSubSubActive && item.color
                                              ? item.color
                                              : isSubSubActive
                                              ? 'text-purple-600 bg-purple-50/30 dark:bg-purple-950/20'
                                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/30'
                                          )}
                                        >
                                          <SubSubIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                                          <span className="truncate">{subSubItem.name}</span>
                                          {subSubItem.badge && (
                                            <Badge
                                              variant="secondary"
                                              className={cn(
                                                'text-[10px] shrink-0 font-normal border-0',
                                                typeof subSubItem.badge === 'string'
                                                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                  : `bg-gradient-to-r ${subSubItem.badge.color} text-white hover:opacity-90`
                                              )}
                                            >
                                              {typeof subSubItem.badge === 'string' ? subSubItem.badge : subSubItem.badge.text}
                                            </Badge>
                                          )}
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent side="right">
                                        <p className="font-medium">{subSubItem.name}</p>
                                        {subSubItem.description && <p className="text-xs text-gray-500 mt-1">{subSubItem.description}</p>}
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        </ScrollArea>

        {/* 底部用户信息 */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                    HR
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">HR管理员</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">admin@company.com</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                系统设置
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                消息通知
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={cn('lg:pl-72', sidebarOpen && 'lg:pl-72')}>
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开侧边栏"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索功能、员工、数据..."
                className="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              升级PRO
            </Button>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
