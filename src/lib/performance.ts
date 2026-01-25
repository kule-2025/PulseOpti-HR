/**
 * 性能优化工具库
 * 用于优化API请求、缓存、懒加载等
 */

import React from 'react';

// API请求缓存
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 带缓存的API请求
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheDuration: number = CACHE_DURATION
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  // 检查缓存
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.data as T;
  }

  // 发起请求
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // 检查响应体是否为空
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Empty response from ${url}`);
  }

  const data = JSON.parse(text);

  // 缓存响应
  apiCache.set(cacheKey, { data, timestamp: Date.now() });

  return data as T;
}

/**
 * 清除缓存
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 批量请求
 */
export async function batchFetch<T>(
  requests: Array<{ url: string; options?: RequestInit }>
): Promise<T[]> {
  const promises = requests.map(({ url, options }) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }).then((res) => res.json())
  );

  return Promise.all(promises) as Promise<T[]>;
}

/**
 * 延迟加载组件
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  loadFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    return new Promise<any>((resolve) => {
      // 延迟执行，避免阻塞主线程
      setTimeout(() => {
        loadFn().then(resolve);
      }, 100);
    });
  });
}

/**
 * 图片预加载
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

/**
 * 批量预加载图片
 */
export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(srcs.map(preloadImage)).then();
}

/**
 * 获取网络性能指标
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // 页面加载时间
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    pageLoad: navigation.loadEventEnd - navigation.loadEventStart,

    // 首次渲染时间
    firstPaint: paint.find((entry) => entry.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime,

    // 资源加载时间
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    tls: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
  };
}

/**
 * 上报性能指标
 */
export function reportPerformanceMetrics(metrics: ReturnType<typeof getPerformanceMetrics>) {
  if (!metrics) return;

  // TODO: 上报到监控系统
  console.log('Performance Metrics:', metrics);
}

/**
 * Web Worker 管理器
 */
export class WorkerManager {
  private workers: Map<string, Worker> = new Map();

  create(name: string, script: string | Blob): Worker {
    const blob = typeof script === 'string' ? new Blob([script], { type: 'application/javascript' }) : script;
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    this.workers.set(name, worker);
    return worker;
  }

  get(name: string): Worker | undefined {
    return this.workers.get(name);
  }

  terminate(name: string) {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  terminateAll() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers.clear();
  }
}

/**
 * 请求队列管理器
 */
export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxConcurrent: number;
  private currentRequests = 0;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.currentRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      this.currentRequests++;
      const request = this.queue.shift();

      if (request) {
        request()
          .finally(() => {
            this.currentRequests--;
            this.process();
          });
      }
    }

    this.isProcessing = false;
  }
}

// 导出全局实例
export const requestQueue = new RequestQueue(3);
