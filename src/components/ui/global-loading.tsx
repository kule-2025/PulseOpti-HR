'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  minDuration?: number; // 最小显示时间（毫秒）
}

/**
 * 全局加载组件
 * 用于在页面加载或数据请求时显示加载状态
 */
export function GlobalLoading({ minDuration = 800 }: GlobalLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    // 模拟进度动画
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 100);

    // 最小显示时间后隐藏
    timeoutId = setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    };
  }, [minDuration]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-100" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-gray-700">加载中...</p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 页面级加载组件
 * 用于在页面内部显示加载状态
 */
export function PageLoading({
  message = '加载中...',
  size = 'default',
}: {
  message?: string;
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

/**
 * 内联加载组件
 * 用于在卡片或其他容器内显示加载状态
 */
export function InlineLoading({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}
