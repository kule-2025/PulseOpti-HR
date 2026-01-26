'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { GlobalLoading } from '@/components/ui/global-loading';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * 应用布局组件
 * 提供全局的加载状态和错误处理
 */
export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Next.js 13+ 使用不同的加载状态管理方式
  // 这里使用简单的 pathname 变化检测
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  // 不在登录页面显示加载动画
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  const shouldShowLoading = isLoading && !isAuthPage;

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen">
        {shouldShowLoading && <GlobalLoading />}
        <div className={shouldShowLoading ? 'opacity-50' : ''}>{children}</div>
      </div>
    </ErrorBoundary>
  );
}

/**
 * 页面包装组件
 * 用于页面级别的错误处理和加载状态
 */
export function PageWrapper({
  children,
  title,
  description,
  breadcrumbs,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      {(title || breadcrumbs) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {breadcrumbs && (
              <nav className="flex text-sm text-gray-500 mb-2">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.href} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    <a
                      href={crumb.href}
                      className={
                        index === breadcrumbs.length - 1
                          ? 'font-medium text-gray-900'
                          : 'hover:text-gray-700'
                      }
                    >
                      {crumb.label}
                    </a>
                  </span>
                ))}
              </nav>
            )}
            {title && (
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* 页面内容 */}
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}

/**
 * 卡片包装组件
 * 用于卡片级别的错误处理
 */
export function CardWrapper({
  children,
  title,
  description,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
