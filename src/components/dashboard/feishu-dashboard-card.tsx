'use client';

import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  RefreshCw, 
  Maximize2, 
  Download,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FeishuDashboardCardProps {
  title: string;
  description?: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  onMaximize?: () => void;
  customActions?: ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
}

export function FeishuDashboardCard({
  title,
  description,
  value,
  previousValue,
  trend = 'neutral',
  trendValue,
  icon,
  children,
  loading = false,
  onRefresh,
  onExport,
  onMaximize,
  customActions,
  badge,
  size = 'md',
  gradient = true,
}: FeishuDashboardCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const bgGradient = gradient
    ? 'from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'
    : 'bg-white dark:bg-slate-900';

  return (
    <Card className={`${bgGradient} hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 group relative overflow-hidden`}>
      {/* 背景装饰 */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full" />
      )}

      <CardHeader className={sizeClasses[size] + ' pb-2'}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {title}
                </CardTitle>
                {badge && (
                  <Badge variant={badge.variant || 'default'} className="text-xs">
                    {badge.text}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>卡片操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onRefresh && (
                  <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    刷新数据
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    导出数据
                  </DropdownMenuItem>
                )}
                {onMaximize && (
                  <DropdownMenuItem onClick={onMaximize}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    全屏查看
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  自定义设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className={sizeClasses[size] + ' pt-2'}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className={`font-bold ${valueSizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  {value}
                </span>

                {trend !== 'neutral' && trendValue && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {trendValue}
                  </div>
                )}
              </div>

              {previousValue && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  上期：{previousValue}
                </div>
              )}

              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>

            {customActions && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {customActions}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* 悬浮效果边框 */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-xl transition-colors pointer-events-none" />
    </Card>
  );
}
