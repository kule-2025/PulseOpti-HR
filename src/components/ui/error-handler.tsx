'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  timestamp: Date;
  retryable?: boolean;
  context?: Record<string, any>;
}

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying]);

  const severityColors = {
    low: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
    medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
    high: 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950',
    critical: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
  };

  const severityIcons = {
    low: AlertCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: AlertCircle,
  };

  const Icon = severityIcons[error.severity];

  return (
    <Card
      className={cn(
        'border-2',
        severityColors[error.severity],
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{error.message}</div>
            {error.details && (
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                {error.details}
              </p>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {error.timestamp.toLocaleString()}
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {onRetry && error.retryable && (
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')}
              />
              {isRetrying ? '重试中...' : '重试'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 记录到控制台
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-md w-full border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  发生错误
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  应用遇到了一些问题，请稍后重试
                </p>
                {this.state.error && (
                  <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                      错误详情
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                >
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 加载状态和错误状态 Hook
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  retry: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: {
    immediate?: boolean;
    retryable?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): AsyncState<T> & {
  execute: () => Promise<void>;
  reset: () => void;
  retryCount: number;
} {
  const {
    immediate = true,
    retryable = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setRetryCount(0);
    } catch (err) {
      const appError: AppError = {
        id: `error-${Date.now()}`,
        message: err instanceof Error ? err.message : '未知错误',
        severity: 'high',
        timestamp: new Date(),
        retryable,
        context: { retryCount },
      };

      setError(appError);

      // 自动重试
      if (retryable && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          execute();
        }, retryDelay * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [fetcher, retryable, maxRetries, retryDelay, retryCount]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(async () => {
    setRetryCount(0);
    await execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    retry,
    execute,
    reset,
    retryCount,
  };
}

// 错误提示 Toast 组件
interface ErrorToastProps {
  error: AppError;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ErrorToast({
  error,
  onClose,
  autoClose = true,
  duration = 5000,
}: ErrorToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <Card
        className={cn(
          'border-2 shadow-lg',
          error.severity === 'critical' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
          error.severity === 'high' && 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950',
          error.severity === 'medium' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
          error.severity === 'low' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
        )}
      >
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{error.message}</p>
              {error.details && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {error.details}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 全局错误管理器
class ErrorManager {
  private errors: AppError[] = [];
  private listeners: Set<(errors: AppError[]) => void> = new Set();

  addError(error: AppError) {
    this.errors.push(error);
    this.notify();
  }

  removeError(id: string) {
    this.errors = this.errors.filter((e) => e.id !== id);
    this.notify();
  }

  clearErrors() {
    this.errors = [];
    this.notify();
  }

  getErrors(): AppError[] {
    return this.errors;
  }

  subscribe(listener: (errors: AppError[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.errors));
  }
}

export const errorManager = new ErrorManager();

// 错误管理 Hook
export function useErrors() {
  const [errors, setErrors] = useState<AppError[]>(errorManager.getErrors());

  useEffect(() => {
    const unsubscribe = errorManager.subscribe(setErrors);
    return unsubscribe;
  }, []);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    errorManager.addError({
      ...error,
      id: `error-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    });
  }, []);

  const removeError = useCallback((id: string) => {
    errorManager.removeError(id);
  }, []);

  const clearErrors = useCallback(() => {
    errorManager.clearErrors();
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  };
}
