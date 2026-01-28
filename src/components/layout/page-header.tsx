'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    name: string;
    href: string;
  }[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  badge?: string | { text: string; color: string };
  proBadge?: boolean;
  icon?: any;
}

const PageHeaderComponent = ({
  title,
  description,
  breadcrumbs,
  actions,
  showBackButton = false,
  backHref = '/dashboard',
  badge,
  proBadge = false,
  icon: Icon,
}: PageHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>首页</span>
        </Link>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  {crumb.name}
                </Link>
              </React.Fragment>
            ))}
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{title}</span>
          </>
        )}
      </div>

      {/* 页面标题和操作 */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {/* 徽章 */}
            {badge && typeof badge === 'string' && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {badge}
              </Badge>
            )}
            {badge && typeof badge === 'object' && (
              <Badge
                variant="secondary"
                className={`bg-gradient-to-r ${badge.color} text-white border-0`}
              >
                {badge.text}
              </Badge>
            )}
            {/* PRO徽章 */}
            {proBadge && (
              <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link href={backHref}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export const PageHeader = memo(PageHeaderComponent);

// 快捷创建组件
interface ProPageHeaderParams {
  icon?: any;
  title: string;
  description: string;
  breadcrumbs?: { name: string; href: string }[];
  extraActions?: React.ReactNode;
}

export function createProPageHeader(params: ProPageHeaderParams) {
  const { icon, title, description, breadcrumbs, extraActions } = params;
  return {
    icon,
    title,
    description,
    breadcrumbs,
    actions: extraActions,
    proBadge: true,
  };
}

interface AiPageHeaderParams {
  icon?: any;
  title: string;
  description: string;
  breadcrumbs?: { name: string; href: string }[];
  extraActions?: React.ReactNode;
}

export function createAiPageHeader(params: AiPageHeaderParams) {
  const { icon, title, description, breadcrumbs, extraActions } = params;
  return {
    icon,
    title,
    description,
    breadcrumbs,
    actions: extraActions,
    badge: { text: 'AI', color: 'from-purple-600 to-pink-600' },
  };
}

interface NewPageHeaderParams {
  icon?: any;
  title: string;
  description: string;
  breadcrumbs?: { name: string; href: string }[];
  extraActions?: React.ReactNode;
}

export function createNewPageHeader(params: NewPageHeaderParams) {
  const { icon, title, description, breadcrumbs, extraActions } = params;
  return {
    icon,
    title,
    description,
    breadcrumbs,
    actions: extraActions,
    badge: { text: 'NEW', color: 'from-blue-600 to-cyan-600' },
  };
}
