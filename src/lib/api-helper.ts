/**
 * API 辅助工具 - 处理缓存和响应转换
 */

import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';

/**
 * 带缓存的 GET 请求 - 自动从 ApiResponse 中提取 data
 * @param url API URL
 * @param cacheKey 缓存键
 * @param ttl 缓存时间（毫秒）
 * @returns 数据
 */
export async function cachedGet<T>(
  url: string,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  return fetchWithCache<T>(
    cacheKey,
    async () => {
      const response = await get<{ data?: T }>(url);
      return response.data || ({} as T);
    },
    ttl
  );
}

/**
 * 批量缓存 GET 请求
 * @param requests 请求数组 { url, cacheKey, ttl }
 * @returns 数据数组
 */
export async function batchCachedGet<T>(
  requests: Array<{ url: string; cacheKey: string; ttl?: number }>
): Promise<T[]> {
  return Promise.all(
    requests.map((req) => cachedGet<T>(req.url, req.cacheKey, req.ttl))
  );
}

/**
 * 处理 API 响应 - 从 ApiResponse 中提取 data
 * @param response API 响应
 * @param defaultValue 默认值
 * @returns 数据
 */
export function extractData<T>(
  response: { data?: T },
  defaultValue: T
): T {
  return response.data !== undefined ? response.data : defaultValue;
}
