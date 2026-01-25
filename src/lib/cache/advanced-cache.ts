/**
 * 增强版缓存工具
 * 整合缓存配置和性能监控
 */

import { fetchWithCache, clearCache as baseClearCache } from './memory-cache';
import { getCacheConfig, buildCacheKey, getCacheTTL } from './config';
import monitor from '../performance/monitor';

/**
 * 带配置的缓存请求
 */
export async function fetchWithConfig<T>(
  dataType: keyof typeof import('./config').CACHE_CONFIG,
  params: Record<string, any>,
  fetcher: () => Promise<T>
): Promise<T> {
  const config = getCacheConfig(dataType);

  if (!config.enabled) {
    return monitor.trackApiRequest(
      `${config.keyPrefix}:no-cache`,
      fetcher,
      params
    );
  }

  const cacheKey = buildCacheKey(config.keyPrefix, params);

  return fetchWithCache(
    cacheKey,
    async () => {
      const startTime = performance.now();

      try {
        const result = await monitor.trackApiRequest(
          config.keyPrefix,
          fetcher,
          params
        );

        const duration = performance.now() - startTime;

        monitor.recordCacheOperation(config.keyPrefix, false, duration);

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        monitor.recordCacheOperation(config.keyPrefix, false, duration);

        throw error;
      }
    },
    config.ttl
  ).then((result) => {
    const duration = 0; // 从缓存获取的时间可以忽略
    monitor.recordCacheOperation(config.keyPrefix, true, duration);

    return result;
  });
}

/**
 * 清除指定数据类型的缓存
 */
export function clearCacheByType(
  dataType: keyof typeof import('./config').CACHE_CONFIG
): void {
  const config = getCacheConfig(dataType);
  baseClearCache(config.keyPrefix);
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  baseClearCache();
}

/**
 * 获取缓存统计
 */
export function getCacheStats(): {
  byType: Record<string, import('./memory-cache').CacheMetric>;
  summary: {
    totalCacheKeys: number;
    avgHitRate: number;
  };
} {
  const cacheMetrics = (monitor as any).cacheMetrics || new Map();
  const summary = {
    totalCacheKeys: cacheMetrics.size,
    avgHitRate: 0,
  };

  if (cacheMetrics.size > 0) {
    const hitRates = Array.from(cacheMetrics.values()).map((m: any) => m.hitRate);
    summary.avgHitRate =
      hitRates.reduce((a: number, b: number) => a + b, 0) / hitRates.length;
  }

  return {
    byType: Object.fromEntries(cacheMetrics),
    summary,
  };
}

/**
 * 批量预加载数据
 */
export async function prefetchData<T>(
  requests: Array<{
    dataType: keyof typeof import('./config').CACHE_CONFIG;
    params: Record<string, any>;
    fetcher: () => Promise<T>;
  }>
): Promise<void> {
  await Promise.allSettled(
    requests.map((req) => fetchWithConfig(req.dataType, req.params, req.fetcher))
  );
}

/**
 * 智能缓存刷新
 * 在后台更新缓存，同时返回旧数据
 */
export async function refreshCacheInBackground<T>(
  dataType: keyof typeof import('./config').CACHE_CONFIG,
  params: Record<string, any>,
  fetcher: () => Promise<T>
): Promise<T> {
  const config = getCacheConfig(dataType);
  const cacheKey = buildCacheKey(config.keyPrefix, params);

  // 先尝试获取旧缓存数据
  const cache = await import('./memory-cache');
  const cachedData = (cache.default as any).get(cacheKey);

  // 在后台更新缓存
  if (cachedData) {
    fetchWithConfig(dataType, params, fetcher).catch((error) => {
      console.error('Background cache refresh failed:', error);
    });

    return cachedData;
  }

  // 没有缓存，直接获取
  return fetchWithConfig(dataType, params, fetcher);
}

export { fetchWithCache, clearCache as baseClearCache };
export default {
  fetchWithConfig,
  clearCacheByType,
  clearAllCache,
  getCacheStats,
  prefetchData,
  refreshCacheInBackground,
};
