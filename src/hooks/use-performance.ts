'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流 Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return func(...args);
      }
    },
    [func, delay]
  ) as T;
}

/**
 * 本地存储 Hook - 避免水合错误
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 使用 mounted 状态确保客户端已挂载
  const [mounted, setMounted] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 客户端挂载后读取 localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * 会话存储 Hook - 避免水合错误
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 使用 mounted 状态确保客户端已挂载
  const [mounted, setMounted] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 客户端挂载后读取 sessionStorage
  useEffect(() => {
    setMounted(true);
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * 异步操作状态 Hook
 */
export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction();
        setData(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * 无限滚动 Hook
 */
export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<T[]>,
  initialPage: number = 1
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchMore(page);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setLoading(false);
  }, [initialPage]);

  return { items, loading, hasMore, loadMore, reset };
}

/**
 * 数据获取 Hook
 */
export function useFetch<T>(
  url: string,
  options: {
    fallback?: T;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: HeadersInit;
  } = {}
) {
  const [data, setData] = useState<T | null>(options.fallback ?? null);
  const [loading, setLoading] = useState(!options.fallback);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.fallback) {
      setLoading(false);
      setData(options.fallback);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        setError(err as Error);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

/**
 * 多数据获取 Hook
 */
export function useFetchMultiple<T extends Record<string, any>>(
  requests: Record<keyof T, string>
) {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<keyof T, Error | null>>({} as any);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results: Partial<T> = {};
      const errorResults: Record<keyof T, Error | null> = {} as any;

      await Promise.all(
        Object.entries(requests).map(async ([key, url]) => {
          try {
            const response = await fetch(url);
            const result = await response.json();
            results[key as keyof T] = result.data || result;
            errorResults[key as keyof T] = null;
          } catch (err) {
            errorResults[key as keyof T] = err as Error;
          }
        })
      );

      setData(results);
      setErrors(errorResults);
      setLoading(false);
    };

    fetchAll();
  }, [requests]);

  return { data, loading, errors };
}

/**
 * 带依赖的数据获取 Hook
 */
export function useFetchWithDeps<T>(
  url: string,
  deps: any[],
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        const result = await response.json();
        const responseData = result.data || result;
        setData(responseData);
        options?.onSuccess?.(responseData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, loading, error };
}

/**
 * 轮询 Hook
 */
export function usePolling<T>(
  url: string,
  interval: number,
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.enabled === false) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        const result = await response.json();
        const responseData = result.data || result;
        setData(responseData);
        options?.onSuccess?.(responseData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [url, interval, options.enabled]);

  return { data, loading, error };
}

/**
 * 可见性 Hook
 */
export function useOnScreen(ref: React.RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}

/**
 * 窗口大小 Hook
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

/**
 * 上一值 Hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * 是否首次渲染 Hook
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return isFirst.current;
}
