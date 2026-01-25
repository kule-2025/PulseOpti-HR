/**
 * API响应助手类
 * 统一处理API响应格式和错误处理
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

/**
 * 错误响应
 */
export function errorResponse(
  error: string | Error,
  status: number = 500,
  code?: string
): NextResponse {
  const message = error instanceof Error ? error.message : error;
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    } as ApiResponse,
    { status }
  );
}

/**
 * 分页响应
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse {
  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages,
    } as PaginatedResponse<T>,
  });
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return {
        valid: false,
        error: `缺少必填字段: ${field}`,
      };
    }
  }
  return { valid: true };
}

/**
 * 解析分页参数
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10))
  );
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  return { page, pageSize, sortBy, sortOrder };
}

/**
 * 处理API错误
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}失败:`, error);

  if (error instanceof Error) {
    // 已知错误
    return errorResponse(error.message, 500, 'API_ERROR');
  } else if (typeof error === 'string') {
    // 字符串错误
    return errorResponse(error, 500, 'API_ERROR');
  } else {
    // 未知错误
    return errorResponse(
      `${context}失败，请稍后重试`,
      500,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * 异步操作包装器 - 用于处理异步API操作
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  errorHandler?: (error: unknown) => NextResponse
): Promise<NextResponse> {
  try {
    const result = await operation();
    return successResponse(result);
  } catch (error) {
    if (errorHandler) {
      return errorHandler(error);
    }
    return handleApiError(error, context);
  }
}

/**
 * 缓存键生成器
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await delay(delayMs * (i + 1)); // 指数退避
      }
    }
  }

  throw lastError;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'date' | 'datetime' | 'time' = 'date'
): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: format === 'time' ? undefined : '2-digit',
    minute: format === 'time' ? undefined : '2-digit',
    second: format === 'time' ? undefined : '2-digit',
    hour12: false,
  };

  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: format === 'time' ? undefined : '2-digit',
    minute: format === 'time' ? undefined : '2-digit',
    second: format === 'time' ? undefined : '2-digit',
  });
}

/**
 * 解析用户信息
 */
export function parseUserInfo(
  userStr: string | null
): { valid: boolean; user?: any; error?: string } {
  if (!userStr) {
    return {
      valid: false,
      error: '未授权访问',
    };
  }

  try {
    const user = JSON.parse(userStr);
    if (!user.id || !user.companyId) {
      return {
        valid: false,
        error: '用户信息不完整',
      };
    }
    return { valid: true, user };
  } catch (error) {
    return {
      valid: false,
      error: '用户信息解析失败',
    };
  }
}

/**
 * 性能监控包装器
 */
export function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();

  return operation().finally(() => {
    const duration = Date.now() - startTime;
    console.log(`[Performance] ${operationName} 耗时: ${duration}ms`);

    if (duration > 1000) {
      console.warn(`[Performance Warning] ${operationName} 耗时过长: ${duration}ms`);
    }
  });
}
