'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// 浏览器扩展相关错误的关键词
const BROWSER_EXTENSION_ERRORS = [
  'runtime.lastError',
  'message channel closed',
  'async response',
  'chrome-extension://',
  'moz-extension://',
];

// 判断是否是浏览器扩展相关的错误
function isBrowserExtensionError(error: Error): boolean {
  const errorMessage = error.message || '';
  return BROWSER_EXTENSION_ERRORS.some(keyword =>
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 如果是浏览器扩展错误，不显示错误页面
    if (isBrowserExtensionError(error)) {
      console.warn('忽略浏览器扩展错误:', error.message);
      return { hasError: false, error: null, errorInfo: null };
    }
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 如果是浏览器扩展错误，仅输出警告
    if (isBrowserExtensionError(error)) {
      console.warn('忽略浏览器扩展错误:', error.message);
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                出错了
              </h1>
              <p className="text-gray-600">
                抱歉，页面加载时遇到了一些问题。请刷新页面重试。
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                  错误详情（开发环境）
                </summary>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                重试
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
