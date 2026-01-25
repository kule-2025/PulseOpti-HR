/**
 * 增强版 API 请求工具
 * 集成性能监控和错误追踪
 */

import { get as baseGet, post as basePost, put as basePut, del as baseDel, patch as basePatch } from './request';
import monitor from '../performance/monitor';

interface EnhancedRequestConfig extends RequestInit {
  timeout?: number;
  enableMetrics?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 增强版 GET 请求
 */
export async function get<T>(
  url: string,
  config?: EnhancedRequestConfig
): Promise<ApiResponse<T>> {
  const enableMetrics = config?.enableMetrics ?? true;

  if (enableMetrics) {
    return monitor.trackApiRequest(
      `GET ${url}`,
      () => baseGet<T>(url, config),
      { method: 'GET', url }
    );
  }

  return baseGet<T>(url, config);
}

/**
 * 增强版 POST 请求
 */
export async function post<T>(
  url: string,
  data?: any,
  config?: EnhancedRequestConfig
): Promise<ApiResponse<T>> {
  const enableMetrics = config?.enableMetrics ?? true;

  if (enableMetrics) {
    return monitor.trackApiRequest(
      `POST ${url}`,
      () => basePost(url, data, config),
      { method: 'POST', url }
    );
  }

  return basePost(url, data, config);
}

/**
 * 增强版 PUT 请求
 */
export async function put<T>(
  url: string,
  data?: any,
  config?: EnhancedRequestConfig
): Promise<ApiResponse<T>> {
  const enableMetrics = config?.enableMetrics ?? true;

  if (enableMetrics) {
    return monitor.trackApiRequest(
      `PUT ${url}`,
      () => basePut(url, data, config),
      { method: 'PUT', url }
    );
  }

  return basePut(url, data, config);
}

/**
 * 增强版 DELETE 请求
 */
export async function deleteRequest<T>(
  url: string,
  config?: EnhancedRequestConfig
): Promise<ApiResponse<T>> {
  const enableMetrics = config?.enableMetrics ?? true;

  if (enableMetrics) {
    return monitor.trackApiRequest(
      `DELETE ${url}`,
      () => baseDel<T>(url, config),
      { method: 'DELETE', url }
    );
  }

  return baseDel<T>(url, config);
}

/**
 * 增强版 PATCH 请求
 */
export async function patch<T>(
  url: string,
  data?: any,
  config?: EnhancedRequestConfig
): Promise<ApiResponse<T>> {
  const enableMetrics = config?.enableMetrics ?? true;

  if (enableMetrics) {
    return monitor.trackApiRequest(
      `PATCH ${url}`,
      () => basePatch(url, data, config),
      { method: 'PATCH', url }
    );
  }

  return basePatch(url, data, config);
}

/**
 * 批量请求
 */
export async function batchRequest<T>(
  requests: Array<{ url: string; config?: EnhancedRequestConfig }>
): Promise<ApiResponse<any>[]> {
  return monitor.trackApiRequest(
    'BATCH_REQUEST',
    () =>
      Promise.all(
        requests.map((req) => {
          if (req.config?.method === 'POST') {
            return post(req.url, req.config?.body, req.config);
          }
          return get(req.url, req.config);
        })
      ),
    { count: requests.length }
  );
}

/**
 * 并发请求限制器
 */
class RequestLimiter {
  private queue: Array<() => Promise<any>> = [];
  private activeCount = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.process();
        }
      });

      this.process();
    });
  }

  private process() {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      this.activeCount++;
      const fn = this.queue.shift()!;
      fn();
    }
  }
}

// 默认请求限制器
const defaultLimiter = new RequestLimiter(5);

/**
 * 使用限制器的请求
 */
export async function limitedRequest<T>(
  fn: () => Promise<T>
): Promise<T> {
  return defaultLimiter.add(fn);
}

/**
 * 重试机制
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
