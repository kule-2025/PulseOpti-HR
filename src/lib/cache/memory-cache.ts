/**
 * 内存缓存类
 */
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒），默认 5 分钟
   */
  set(key: string, value: any, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 null
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期的缓存
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// 单例实例
const cache = new MemoryCache();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 60 * 1000); // 每分钟清理一次
}

/**
 * 带缓存的异步请求
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 缓存时间（毫秒）
 * @returns 数据
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // 尝试从缓存获取
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // 缓存未命中，执行请求
  const data = await fetcher();

  // 存入缓存
  cache.set(key, data, ttl);

  return data;
}

/**
 * 清除指定键的缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * 批量清除缓存（支持前缀匹配）
 */
export function clearCacheByPrefix(prefix: string): void {
  const keys = cache.keys();
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export default cache;
