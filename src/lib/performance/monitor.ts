/**
 * 性能监控工具
 * 用于跟踪 API 请求、缓存命中率、渲染性能等指标
 */

export interface PerformanceMetric {
  timestamp: number;
  type: 'api' | 'cache' | 'render' | 'interaction';
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface CacheMetric {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private cacheMetrics: Map<string, CacheMetric> = new Map();
  private errorLog: Array<{ timestamp: number; type: string; message: string }> = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled =
      typeof window !== 'undefined' &&
      (process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR === 'true' ||
        process.env.NODE_ENV === 'development');

    if (this.isEnabled) {
      console.log('[PerformanceMonitor] Monitoring enabled');
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetric = {
      timestamp: Date.now(),
      ...metric,
    };

    this.metrics.push(fullMetric);

    // 保持最近 1000 条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // 在开发环境打印
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[PerformanceMonitor] ${metric.type.toUpperCase()} - ${metric.name}: ${metric.duration}ms`,
        metric.metadata
      );
    }
  }

  /**
   * 记录 API 请求性能
   */
  async trackApiRequest<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: 'api',
        name,
        duration,
        metadata: {
          success: true,
          ...metadata,
        },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: 'api',
        name,
        duration,
        metadata: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          ...metadata,
        },
      });

      throw error;
    }
  }

  /**
   * 记录缓存操作
   */
  recordCacheOperation(
    name: string,
    hit: boolean,
    duration: number = 0
  ): void {
    if (!this.isEnabled) return;

    const metric = this.cacheMetrics.get(name) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
    };

    if (hit) {
      metric.hits++;
    } else {
      metric.misses++;
    }

    metric.totalRequests++;
    metric.hitRate = metric.hits / metric.totalRequests;

    this.cacheMetrics.set(name, metric);

    this.recordMetric({
      type: 'cache',
      name,
      duration,
      metadata: {
        hit,
        hitRate: metric.hitRate,
      },
    });
  }

  /**
   * 记录渲染性能
   */
  recordRender(name: string, duration: number): void {
    if (!this.isEnabled) return;

    this.recordMetric({
      type: 'render',
      name,
      duration,
    });
  }

  /**
   * 记录交互性能
   */
  recordInteraction(name: string, duration: number): void {
    if (!this.isEnabled) return;

    this.recordMetric({
      type: 'interaction',
      name,
      duration,
    });
  }

  /**
   * 记录错误
   */
  trackError(type: string, error: Error): void {
    if (!this.isEnabled) return;

    this.errorLog.push({
      timestamp: Date.now(),
      type,
      message: error.message,
    });

    // 保持最近 100 条错误
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    console.error(`[PerformanceMonitor] Error - ${type}:`, error.message);
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取缓存指标
   */
  getCacheMetrics(): Map<string, CacheMetric> {
    return new Map(this.cacheMetrics);
  }

  /**
   * 获取所有指标（用于仪表盘）
   */
  getAllMetrics(): {
    apiRequests: {
      total: number;
      avgDuration: number;
      successRate: number;
      errors: number;
    };
    cache: {
      totalCacheKeys: number;
      avgHitRate: number;
    };
    renders: {
      avgDuration: number;
      totalUpdates: number;
    };
  } {
    const apiMetrics = this.getMetricsByType('api');
    const renderMetrics = this.getMetricsByType('render');
    const cacheHitRates = Array.from(this.cacheMetrics.values()).map((m) => m.hitRate);
    const apiDurations = apiMetrics.map((m) => m.duration);

    const successApi = apiMetrics.filter((m) => m.metadata?.success).length;
    const failedApi = apiMetrics.filter((m) => !m.metadata?.success).length;

    return {
      apiRequests: {
        total: apiMetrics.length,
        avgDuration:
          apiDurations.length > 0
            ? apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length
            : 0,
        successRate:
          apiMetrics.length > 0 ? (successApi / apiMetrics.length) * 100 : 100,
        errors: failedApi,
      },
      cache: {
        totalCacheKeys: this.cacheMetrics.size,
        avgHitRate:
          cacheHitRates.length > 0
            ? cacheHitRates.reduce((a, b) => a + b, 0) / cacheHitRates.length
            : 0,
      },
      renders: {
        avgDuration:
          renderMetrics.length > 0
            ? renderMetrics
                .map((m) => m.duration)
                .reduce((a, b) => a + b, 0) / renderMetrics.length
            : 0,
        totalUpdates: renderMetrics.length,
      },
    };
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(limit: number = 10): Array<{ timestamp: number; type: string; message: string }> {
    return this.errorLog.slice(-limit);
  }

  /**
   * 清除所有指标
   */
  clearMetrics(): void {
    this.metrics = [];
    this.cacheMetrics.clear();
    this.errorLog = [];
  }

  /**
   * 获取特定类型的指标
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter((m) => m.type === type);
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    api: {
      total: number;
      success: number;
      failed: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
    };
    cache: {
      total: number;
      avgHitRate: number;
    };
    render: {
      total: number;
      avgDuration: number;
    };
    interaction: {
      total: number;
      avgDuration: number;
    };
  } {
    const apiMetrics = this.getMetricsByType('api');
    const cacheMetrics = this.getMetricsByType('cache');
    const renderMetrics = this.getMetricsByType('render');
    const interactionMetrics = this.getMetricsByType('interaction');

    const successApi = apiMetrics.filter((m) => m.metadata?.success);
    const failedApi = apiMetrics.filter((m) => !m.metadata?.success);

    const apiDurations = apiMetrics.map((m) => m.duration);
    const renderDurations = renderMetrics.map((m) => m.duration);
    const interactionDurations = interactionMetrics.map((m) => m.duration);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const cacheHitRates = cacheMetrics.map((m) => m.metadata?.hitRate || 0);

    return {
      api: {
        total: apiMetrics.length,
        success: successApi.length,
        failed: failedApi.length,
        avgDuration: avg(apiDurations),
        maxDuration: Math.max(...apiDurations, 0),
        minDuration: Math.min(...apiDurations, 0),
      },
      cache: {
        total: cacheMetrics.length,
        avgHitRate: avg(cacheHitRates),
      },
      render: {
        total: renderMetrics.length,
        avgDuration: avg(renderDurations),
      },
      interaction: {
        total: interactionMetrics.length,
        avgDuration: avg(interactionDurations),
      },
    };
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const stats = this.getStats();

    return `
Performance Report
==================

API Requests:
  Total: ${stats.api.total}
  Success: ${stats.api.success}
  Failed: ${stats.api.failed}
  Avg Duration: ${stats.api.avgDuration.toFixed(2)}ms
  Max Duration: ${stats.api.maxDuration.toFixed(2)}ms
  Min Duration: ${stats.api.minDuration.toFixed(2)}ms

Cache:
  Total Operations: ${stats.cache.total}
  Avg Hit Rate: ${(stats.cache.avgHitRate * 100).toFixed(2)}%

Render:
  Total Renders: ${stats.render.total}
  Avg Duration: ${stats.render.avgDuration.toFixed(2)}ms

Interaction:
  Total Interactions: ${stats.interaction.total}
  Avg Duration: ${stats.interaction.avgDuration.toFixed(2)}ms

Cache Details:
${Array.from(this.cacheMetrics.entries())
  .map(
    ([name, metric]) =>
      `  ${name}: ${metric.hits} hits, ${metric.misses} misses, ${(metric.hitRate * 100).toFixed(2)}% hit rate`
  )
  .join('\n')}
    `.trim();
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = [];
    this.cacheMetrics.clear();
  }

  /**
   * 导出指标为 JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      cacheMetrics: Object.fromEntries(this.cacheMetrics),
      stats: this.getStats(),
    });
  }
}

// 单例实例
const monitor = new PerformanceMonitor();

// 导出到浏览器控制台（开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__performanceMonitor = monitor;
  console.log('[PerformanceMonitor] Available at window.__performanceMonitor');
}

export default monitor;

/**
 * 性能测量装饰器
 */
export function measurePerformance(
  name: string,
  type: PerformanceMetric['type'] = 'interaction'
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;

        monitor.recordMetric({
          type,
          name: `${target.constructor.name}.${propertyKey}`,
          duration,
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        monitor.recordMetric({
          type,
          name: `${target.constructor.name}.${propertyKey}`,
          duration,
          metadata: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * React Hook 用于性能监控
 */
export function usePerformanceMonitor() {
  return monitor;
}
