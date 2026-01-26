'use client';

import { useState, useRef, useEffect, HTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/theme';

interface LazyImageProps extends Omit<HTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  threshold?: number;
}

/**
 * 懒加载图片组件 - 使用 Intersection Observer API
 */
export function LazyImage({
  src,
  alt,
  fallback,
  placeholder = 'empty',
  blurDataURL,
  threshold = 0.1,
  className = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError) {
    return fallback ? <>{fallback}</> : <ImageFallback className={className} />;
  }

  return (
    <div className={cn('relative overflow-hidden', className)} ref={imgRef}>
      {/* 占位符 */}
      {!isLoaded && placeholder === 'blur' && blurDataURL && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}

      {/* 骨架屏 */}
      {!isLoaded && !blurDataURL && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* 实际图片 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

interface ImageFallbackProps {
  className?: string;
}

function ImageFallback({ className = '' }: ImageFallbackProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400',
        className
      )}
    >
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * 优化的头像组件 - 自动加载和缓存
 */
export function OptimizedAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
}: OptimizedAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
  };

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96,
  };

  if (!src || imageError) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
      fallback={
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium',
            sizeClasses[size]
          )}
        >
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      }
      onError={() => setImageError(true)}
    />
  );
}

/**
 * 响应式图片组件 - 根据设备选择合适的图片尺寸
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = [
    { media: '(max-width: 640px)', width: 640 },
    { media: '(max-width: 1024px)', width: 1024 },
    { width: 1920 },
  ],
  className = '',
  ...props
}: LazyImageProps & {
  sizes?: Array<{ media?: string; width: number }>;
}) {
  const srcSet = sizes
    .map((size) => `${src}?w=${size.width} ${size.width}w`)
    .join(', ');

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      srcSet={srcSet}
      sizes={sizes.map(s => s.media).join(', ')}
      {...props}
    />
  );
}
