import { NextResponse } from 'next/server';

/**
 * API 超时处理工具
 * 用于处理跨平台部署中的超时和失败请求
 */

/**
 * 带超时的 Promise 包装器
 * @param promise 要执行的 Promise
 * @param timeoutMs 超时时间（毫秒），默认 50 秒
 * @param errorMessage 超时错误消息
 * @returns Promise 结果
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 50000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

/**
 * 带重试机制的 Promise 包装器
 * @param fn 要执行的函数
 * @param maxRetries 最大重试次数，默认 3 次
 * @param delayMs 重试延迟（毫秒），默认 1000 毫秒
 * @returns Promise 结果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`[Retry] Attempt ${i + 1}/${maxRetries} failed:`, error);

      if (i < maxRetries - 1) {
        // 指数退避
        const delay = delayMs * Math.pow(2, i);
        console.log(`[Retry] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

/**
 * 处理 API 错误并返回适当的响应
 * @param error 错误对象
 * @returns NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof Error) {
    // 超时错误
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return NextResponse.json(
        {
          error: '请求超时，请稍后重试',
          code: 'REQUEST_TIMEOUT',
          retryable: true,
        },
        { status: 504 }
      );
    }

    // 连接被拒绝
    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error: '数据库连接失败，请稍后重试',
          code: 'CONNECTION_FAILED',
          retryable: true,
        },
        { status: 503 }
      );
    }

    // 网络错误
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNRESET')) {
      return NextResponse.json(
        {
          error: '网络连接失败，请检查网络设置',
          code: 'NETWORK_ERROR',
          retryable: true,
        },
        { status: 503 }
      );
    }
  }

  // 默认错误
  return NextResponse.json(
    {
      error: '服务器内部错误，请稍后重试',
      code: 'INTERNAL_ERROR',
      retryable: true,
    },
    { status: 500 }
  );
}

/**
 * 创建一个带超时和重试的数据库查询包装器
 * @param queryFn 查询函数
 * @param timeoutMs 超时时间
 * @param maxRetries 最大重试次数
 * @returns 查询结果
 */
export async function withDatabaseRetry<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 45000,
  maxRetries: number = 2
): Promise<T> {
  return withTimeout(
    withRetry(queryFn, maxRetries, 500),
    timeoutMs,
    'Database query timeout'
  );
}

/**
 * 包装 API 路由处理函数
 * @param handler API 处理函数
 * @param options 配置选项
 * @returns 包装后的处理函数
 */
export function withApiHandler(
  handler: (request: Request) => Promise<NextResponse>,
  options: {
    timeout?: number;
    maxRetries?: number;
  } = {}
) {
  return async (request: Request): Promise<NextResponse> => {
    const { timeout = 50000, maxRetries = 2 } = options;

    try {
      return await withTimeout(
        handler(request),
        timeout,
        'API request timeout'
      );
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * OPTIONS 预检请求处理
 * 用于 CORS
 */
export function handleOptionsRequest(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}
