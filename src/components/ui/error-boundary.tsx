'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * 全局错误边界组件
 * 捕获子组件中的错误，显示友好的错误界面
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-center">出现了一些问题</CardTitle>
              <CardDescription className="text-center">
                很抱歉，系统遇到了一个意外错误
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-lg bg-gray-100 p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-700">错误信息：</p>
                  <p className="text-xs text-gray-600">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <>
                      <p className="mb-2 mt-3 text-xs font-semibold text-gray-700">错误堆栈：</p>
                      <pre className="text-xs text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  返回首页
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

/**
 * 简化版错误展示组件
 * 用于在特定区域显示错误
 */
export function ErrorDisplay({
  title = '出错了',
  message = '系统遇到了一个错误，请稍后重试',
  onRetry,
  showDetails = false,
  error,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showDetails?: boolean;
  error?: Error;
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{message}</p>
        {showDetails && error && (
          <p className="mb-4 text-xs text-gray-500">{error.message}</p>
        )}
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * 空状态组件
 * 用于在没有数据时显示提示
 */
export function EmptyState({
  icon: Icon,
  title = '暂无数据',
  description = '当前没有可显示的内容',
  action,
  className,
}: {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[300px] items-center justify-center rounded-lg bg-gray-50 p-8 ${className || ''}`}>
      <div className="text-center">
        {Icon && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{description}</p>
        {action}
      </div>
    </div>
  );
}
