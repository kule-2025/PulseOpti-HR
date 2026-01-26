import { ComponentType, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * 懒加载包装器 - 延迟加载组件以提升首屏性能
 */
export function LazyLoadWrapper({
  children,
  fallback,
  delay = 300,
}: LazyLoadWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isMounted) {
    return fallback ? <>{fallback}</> : <LazyLoadSkeleton />;
  }

  return <>{children}</>;
}

interface LazyLoadSkeletonProps {
  count?: number;
}

function LazyLoadSkeleton({ count = 3 }: LazyLoadSkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

interface IntersectionLazyLoadProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  fallback?: React.ReactNode;
}

/**
 * 视口懒加载 - 当元素进入视口时才加载内容
 */
export function IntersectionLazyLoad({
  children,
  rootMargin = '50px',
  threshold = 0.1,
  fallback,
}: IntersectionLazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(elementRef);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(elementRef);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, rootMargin, threshold]);

  return (
    <div ref={setElementRef}>
      {isVisible ? children : fallback || <LazyLoadSkeleton />}
    </div>
  );
}

interface WithLazyLoadProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
}

/**
 * 高阶组件 - 为组件添加懒加载功能
 */
export function withLazyLoad<P extends object>({
  component: Component,
  fallback,
}: WithLazyLoadProps) {
  return function LazyLoadComponent(props: P) {
    return (
      <LazyLoadWrapper fallback={fallback}>
        <Component {...props} />
      </LazyLoadWrapper>
    );
  };
}
