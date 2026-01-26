'use client';

import { useState, useEffect, useCallback, useRef, DependencyList } from 'react';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
};

type UseFetchOptions = {
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
};

/**
 * 优化的数据获取 Hook - 支持缓存、重试、刷新等功能
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000, // 5分钟
    staleTime = 0,
    retry = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: enabled,
    error: null,
    refreshing: false,
  });

  const retryCountRef = useRef(0);
  const cacheRef = useRef<{ data: T | null; timestamp: number }>({
    data: null,
    timestamp: 0,
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    // 检查缓存
    if (!isRefresh && cacheRef.current.data) {
      const age = Date.now() - cacheRef.current.timestamp;
      if (age < staleTime) {
        setState((prev) => ({
          ...prev,
          data: cacheRef.current.data,
          loading: false,
        }));
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      loading: !isRefresh,
      refreshing: isRefresh,
      error: null,
    }));

    try {
      const data = await fetcher();
      
      cacheRef.current = {
        data,
        timestamp: Date.now(),
      };

      setState({
        data,
        loading: false,
        error: null,
        refreshing: false,
      });
      
      retryCountRef.current = 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => fetchData(isRefresh), retryDelay);
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: err,
        }));
        retryCountRef.current = 0;
      }
    }
  }, [fetcher, staleTime, retry, retryDelay]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const mutate = useCallback(async (newFetcher: () => Promise<T>) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await newFetcher();
      cacheRef.current = {
        data,
        timestamp: Date.now(),
      };
      setState({
        data,
        loading: false,
        error: null,
        refreshing: false,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // 清理过期缓存
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (cacheRef.current.data) {
        const age = Date.now() - cacheRef.current.timestamp;
        if (age > cacheTime) {
          cacheRef.current = { data: null, timestamp: 0 };
        }
      }
    }, cacheTime);

    return () => clearInterval(cleanup);
  }, [cacheTime]);

  return {
    ...state,
    refresh,
    mutate,
  };
}

/**
 * 并发请求 Hook - 并行执行多个请求
 */
export function useFetchMultiple<T>(
  fetchers: Array<() => Promise<T>>,
  options: UseFetchOptions = {}
) {
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    error: Error | null;
  }>({
    data: [],
    loading: true,
    error: null,
  });

  const { retry = 3, retryDelay = 1000 } = options;
  const retryCountRef = useRef(0);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await Promise.all(fetchers.map((fetcher) => fetcher()));
      setState({
        data,
        loading: false,
        error: null,
      });
      retryCountRef.current = 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => fetchAll(), retryDelay);
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
        retryCountRef.current = 0;
      }
    }
  }, [fetchers, retry, retryDelay]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return state;
}

/**
 * 依赖式请求 Hook - 当依赖变化时重新请求
 */
export function useFetchWithDeps<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  options: UseFetchOptions = {}
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
    refreshing: false,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const data = await fetcher();
      setState({
        data,
        loading: false,
        error: null,
        refreshing: false,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refresh };
}

/**
 * 轮询 Hook - 定时刷新数据
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number,
  options: UseFetchOptions = {}
) {
  const { data, loading, error, refresh } = useFetch(fetcher, options);

  useEffect(() => {
    if (!loading && !error) {
      const timer = setInterval(() => {
        refresh();
      }, interval);

      return () => clearInterval(timer);
    }
  }, [interval, loading, error, refresh]);

  return { data, loading, error, refresh };
}
