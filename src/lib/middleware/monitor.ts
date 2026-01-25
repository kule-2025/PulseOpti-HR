/**
 * 性能监控工具
 * 用于监控 API 性能和发现性能瓶颈
 */

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000;

  /**
   * 记录性能指标
   * @param name 操作名称
   * @param duration 持续时间（毫秒）
   * @param success 是否成功
   * @param error 错误信息
   */
  record(name: string, duration: number, success: boolean, error?: string): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      success,
      error,
    });

    // 如果指标过多，删除最旧的
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 获取指定操作的性能统计
   * @param name 操作名称
   * @returns 性能统计信息
   */
  getStats(name: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const filtered = this.metrics.filter(m => m.name === name);

    if (filtered.length === 0) return null;

    const durations = filtered.map(m => m.duration);
    const successCount = filtered.filter(m => m.success).length;

    durations.sort((a, b) => a - b);

    return {
      count: filtered.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      successRate: (successCount / filtered.length) * 100,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * 获取所有操作的统计摘要
   * @returns 统计摘要
   */
  getSummary(): Array<{
    name: string;
    count: number;
    avgDuration: number;
    successRate: number;
  }> {
    const summary = new Map<string, {
      name: string;
      count: number;
      totalDuration: number;
      successCount: number;
    }>();

    for (const metric of this.metrics) {
      const existing = summary.get(metric.name);

      if (existing) {
        existing.count++;
        existing.totalDuration += metric.duration;
        if (metric.success) existing.successCount++;
      } else {
        summary.set(metric.name, {
          name: metric.name,
          count: 1,
          totalDuration: metric.duration,
          successCount: metric.success ? 1 : 0,
        });
      }
    }

    return Array.from(summary.values()).map(s => ({
      name: s.name,
      count: s.count,
      avgDuration: s.totalDuration / s.count,
      successRate: (s.successCount / s.count) * 100,
    })).sort((a, b) => b.count - a.count);
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = [];
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 带性能监控的函数包装器
 * @param name 操作名称
 * @param fn 要执行的函数
 * @returns 函数结果
 */
export async function withPerformanceTracking<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    performanceMonitor.record(name, duration, true);

    console.log(`[Performance] ${name}: ${duration}ms`);

    // 如果超过阈值，记录警告
    if (duration > 3000) {
      console.warn(`[Performance Warning] ${name} took ${duration}ms (> 3000ms)`);
    } else if (duration > 1000) {
      console.log(`[Performance Info] ${name} took ${duration}ms (> 1000ms)`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);

    performanceMonitor.record(name, duration, false, errorMessage);

    console.error(`[Performance Error] ${name} failed after ${duration}ms:`, error);

    throw error;
  }
}

/**
 * 获取性能统计
 * @param name 操作名称
 * @returns 性能统计
 */
export function getPerformanceStats(name: string) {
  return performanceMonitor.getStats(name);
}

/**
 * 获取性能摘要
 * @returns 性能摘要
 */
export function getPerformanceSummary() {
  return performanceMonitor.getSummary();
}

/**
 * 记录自定义指标
 * @param name 指标名称
 * @param value 指标值
 * @param unit 单位
 */
export function recordCustomMetric(name: string, value: number, unit: string = 'ms'): void {
  console.log(`[Custom Metric] ${name}: ${value}${unit}`);
}

/**
 * 创建性能追踪器
 */
export class PerformanceTracker {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor(private name: string) {
    this.startTime = Date.now();
    console.log(`[Tracker] Started: ${this.name}`);
  }

  /**
   * 添加检查点
   * @param checkpointName 检查点名称
   */
  checkpoint(checkpointName: string): void {
    const now = Date.now();
    this.checkpoints.set(checkpointName, now);

    const duration = now - this.startTime;
    console.log(`[Tracker] ${this.name} - ${checkpointName}: ${duration}ms`);
  }

  /**
   * 结束追踪
   */
  end(): number {
    const duration = Date.now() - this.startTime;
    console.log(`[Tracker] Ended: ${this.name} (${duration}ms)`);

    performanceMonitor.record(this.name, duration, true);

    return duration;
  }

  /**
   * 获取检查点之间的时间
   * @param checkpoint1 检查点 1
   * @param checkpoint2 检查点 2
   * @returns 时间差（毫秒）
   */
  getDurationBetween(checkpoint1: string, checkpoint2: string): number {
    const time1 = this.checkpoints.get(checkpoint1);
    const time2 = this.checkpoints.get(checkpoint2);

    if (time1 === undefined || time2 === undefined) {
      throw new Error('Checkpoint not found');
    }

    return Math.abs(time2 - time1);
  }
}

/**
 * 创建性能追踪器
 * @param name 追踪器名称
 * @returns 性能追踪器
 */
export function createTracker(name: string): PerformanceTracker {
  return new PerformanceTracker(name);
}

/**
 * 定期清理旧指标
 */
export function startPerformanceCleanup(intervalMs: number = 60000): void {
  setInterval(() => {
    const summary = performanceMonitor.getSummary();
    console.log('[Performance Cleanup] Summary:', summary);

    // 清除超过 1 小时的指标
    const oneHourAgo = Date.now() - 3600000;
    const metrics = (performanceMonitor as any).metrics;

    if (metrics) {
      (performanceMonitor as any).metrics = metrics.filter(
        (m: PerformanceMetrics) => m.timestamp > oneHourAgo
      );
    }
  }, intervalMs);
}
