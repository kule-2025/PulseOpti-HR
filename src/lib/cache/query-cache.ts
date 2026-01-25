/**
 * 查询缓存系统
 * 用于缓存数据库查询结果，减少重复查询
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000;
  private defaultTTL: number = 60000; // 默认 60 秒

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 数据
   * @param ttl 过期时间（毫秒），默认 60 秒
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    // 增加命中次数
    entry.hits++;

    return entry.data as T;
  }

  /**
   * 删除指定键的缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 根据模式使缓存失效
   * @param pattern 正则表达式模式
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hits: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp,
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: totalHits,
      entries: entries.sort((a, b) => b.hits - a.hits).slice(0, 10),
    };
  }

  /**
   * 设置最大缓存大小
   * @param size 最大条目数
   */
  setMaxSize(size: number): void {
    this.maxSize = size;

    // 如果当前缓存超过新大小，删除最旧的条目
    while (this.cache.size > this.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 预热缓存
   * @param items 要预热的条目
   */
  async warmup<T>(items: Array<{ key: string; fn: () => Promise<T>; ttl?: number }>): Promise<void> {
    const promises = items.map(async ({ key, fn, ttl }) => {
      try {
        const data = await fn();
        this.set(key, data, ttl);
      } catch (error) {
        console.error(`[Cache Warmup] Failed to warm up key: ${key}`, error);
      }
    });

    await Promise.all(promises);
  }
}

// 导出单例
export const queryCache = new QueryCache();

/**
 * 带缓存的查询包装器
 * @param key 缓存键
 * @param fn 查询函数
 * @param ttl 过期时间（毫秒）
 * @returns 查询结果
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  // 尝试从缓存获取
  const cached = queryCache.get<T>(key);

  if (cached !== null) {
    console.log(`[Cache Hit] ${key}`);
    return cached;
  }

  console.log(`[Cache Miss] ${key}`);

  // 执行查询
  const result = await fn();

  // 存入缓存
  queryCache.set(key, result, ttl);

  return result;
}

/**
 * 使指定模式的所有缓存失效
 * @param pattern 正则表达式模式
 */
export function invalidateCache(pattern: string): void {
  queryCache.invalidate(pattern);
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  queryCache.clear();
}
