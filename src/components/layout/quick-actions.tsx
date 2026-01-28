'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  ChevronRight,
  LayoutDashboard,
  ArrowLeft,
  RefreshCw,
  Download,
  Plus,
  Bell,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: any;
  href?: string;
  onClick?: () => void;
  color?: string;
  badge?: string;
}

interface QuickActionsProps {
  title?: string;
  actions?: QuickAction[];
  showBackToHome?: boolean;
  showActions?: boolean;
  isProPage?: boolean;
  customActions?: QuickAction[];
  showBackButton?: boolean;
  backHref?: string;
}

const defaultActions: QuickAction[] = [
  {
    label: '返回首页',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: '工作台',
    icon: LayoutDashboard,
    href: '/dashboard/overview',
  },
];

const proActions: QuickAction[] = [
  {
    label: '数据大屏',
    icon: LayoutDashboard,
    href: '/admin/data-dashboard',
    badge: 'PRO',
  },
  {
    label: '自定义报表',
    icon: RefreshCw,
    href: '/dashboard/reports/custom',
    badge: 'PRO',
  },
  {
    label: '数据导出',
    icon: Download,
    href: '/dashboard/data-export',
    badge: 'PRO',
  },
  {
    label: 'API平台',
    icon: Settings,
    href: '/admin/api-platform',
    badge: 'PRO',
  },
];

const QuickActionsComponent = ({
  title = '快捷操作',
  actions = defaultActions,
  showBackToHome = true,
  showActions = false,
  isProPage = false,
  customActions,
  showBackButton = false,
  backHref = '/dashboard',
}: QuickActionsProps) => {
  // 使用useMemo优化displayActions的计算
  const displayActions = useMemo(() => {
    let result = [...actions];

    // 如果是PRO页面且需要显示快捷操作
    if (isProPage && showActions) {
      result = [...proActions];
    }

    // 如果有自定义操作
    if (customActions && customActions.length > 0) {
      result = [...customActions];
    }

    // 如果显示返回首页按钮
    if (showBackToHome) {
      result = [
        ...result,
        {
          label: '返回首页',
          icon: Home,
          href: '/dashboard',
        },
      ];
    }

    return result;
  }, [actions, showBackToHome, showActions, isProPage, customActions]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 标题 */}
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
              {showBackButton && (
                <Link href={backHref}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* 快捷操作按钮 */}
          <div className="grid grid-cols-2 gap-2">
            {displayActions.map((action, index) => {
              const ActionIcon = action.icon;
              const key = `${action.label}-${index}`;

              return (
                <React.Fragment key={key}>
                  {action.href ? (
                    <Link
                      href={action.href}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className={`w-full justify-start h-auto py-3 gap-2 ${
                          action.color ? `bg-gradient-to-r ${action.color} text-white border-0 hover:opacity-90` : ''
                        }`}
                      >
                        <ActionIcon className="h-4 w-4" />
                        <span className="flex-1 text-left">{action.label}</span>
                        {action.badge && (
                          <span className="text-xs">{action.badge}</span>
                        )}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-auto py-3 gap-2 ${
                        action.color ? `bg-gradient-to-r ${action.color} text-white border-0 hover:opacity-90` : ''
                      }`}
                      onClick={action.onClick}
                    >
                      <ActionIcon className="h-4 w-4" />
                      <span className="flex-1 text-left">{action.label}</span>
                      {action.badge && (
                        <span className="text-xs">{action.badge}</span>
                      )}
                    </Button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActions = memo(QuickActionsComponent);

// 快速创建不同场景的快捷操作
export const createProQuickActions = memo(() => (
  <QuickActions
    title="快捷操作"
    actions={proActions}
  />
));

export const createRecruitmentQuickActions = memo(() => (
  <QuickActions
    title="招聘快捷操作"
    actions={[
      {
        label: '发布岗位',
        icon: Plus,
        href: '/recruitment/jobs/create',
      },
      {
        label: '简历筛选',
        icon: RefreshCw,
        href: '/recruitment/resumes',
      },
      {
        label: '面试安排',
        icon: Bell,
        href: '/recruitment/interviews',
      },
      {
        label: '人才库',
        icon: LayoutDashboard,
        href: '/recruitment/talent-pool',
      },
    ]}
  />
));

export const createEmployeeQuickActions = memo(() => (
  <QuickActions
    title="员工管理快捷操作"
    actions={[
      {
        label: '添加员工',
        icon: Plus,
        href: '/dashboard/employees/create',
      },
      {
        label: '组织架构',
        icon: LayoutDashboard,
        href: '/dashboard/organization',
      },
      {
        label: '职位管理',
        icon: Settings,
        href: '/dashboard/job-hierarchy',
      },
      {
        label: '人员异动',
        icon: RefreshCw,
        href: '/dashboard/employees/movement',
      },
    ]}
  />
));
