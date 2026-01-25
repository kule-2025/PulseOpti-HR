/**
 * 轮询Hook - 用于实现实时数据更新
 */

import { useEffect, useRef, useState } from 'react';

interface UsePollingOptions<T> {
  // 轮询间隔（毫秒）
  interval?: number;
  // 是否立即执行第一次请求
  immediate?: boolean;
  // 是否启用轮询
  enabled?: boolean;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions<T> = {}
) {
  const {
    interval = 30000, // 默认30秒
    immediate = true,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const executeFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('轮询请求失败:', err);
      setError(err instanceof Error ? err : new Error('请求失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      // 如果禁用轮询，清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 立即执行第一次请求
    if (immediate) {
      executeFetch();
    }

    // 设置定时器
    timerRef.current = setInterval(executeFetch, interval);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchFn, interval, immediate, enabled]);

  // 手动刷新
  const refresh = () => {
    executeFetch();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
