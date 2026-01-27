'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * 懒加载图片组件的 Props 类型
 */
export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onError?: () => void;
}

/**
 * 懒加载图片组件
 */
export function LazyImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  placeholder = 'bg-gray-200 dark:bg-gray-800',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-300 ${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: !isLoaded ? placeholder : undefined }}
      {...props}
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
  // 使用第一个尺寸的图片（简化版本）
  const primarySize = sizes[0]?.width || 1920;

  return (
    <LazyImage
      src={`${src}?w=${primarySize}`}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

/**
 * 优化的头像组件
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${className}`}
      >
        {fallback || alt.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <ResponsiveImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
