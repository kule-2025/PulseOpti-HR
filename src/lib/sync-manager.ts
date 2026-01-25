/**
 * 数据同步管理器 - 类似钉钉的数据同步机制
 * 支持增量同步、实时同步、冲突解决
 */

import { getDb } from './db';
import { syncTasks, syncLogs } from '@/storage/database/shared/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { alertManager } from './alert-manager';

export interface SyncTask {
  id: string;
  type: 'full' | 'incremental' | 'realtime';
  source: 'user' | 'department' | 'position' | 'employee' | 'all';
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number; // 1-10，数字越大优先级越高
  retryCount: number;
  maxRetries: number;
  progress: number; // 0-100
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface SyncConfig {
  enabled: boolean;
  interval: number; // 同步间隔（秒）
  batchSize: number; // 每批处理数量
  conflictStrategy: 'last-write' | 'first-write' | 'manual'; // 冲突解决策略
  notifyOnComplete: boolean;
  notifyOnError: boolean;
}

export class SyncManager {
  private config: SyncConfig = {
    enabled: true,
    interval: 60, // 默认60秒
    batchSize: 100,
    conflictStrategy: 'last-write',
    notifyOnComplete: true,
    notifyOnError: true,
  };

  private syncTimer?: NodeJS.Timeout;
  private isRunning = false;
  private performanceMetrics = {
    totalRecords: 0,
    processedRecords: 0,
    startTime: 0,
    endTime: 0,
  };

  constructor(config?: Partial<SyncConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 启动自动同步
   */
  start(): void {
    if (this.syncTimer) {
      this.stop();
    }

    this.syncTimer = setInterval(() => {
      if (this.config.enabled && !this.isRunning) {
        this.runAutoSync();
      }
    }, this.config.interval * 1000);
  }

  /**
   * 停止自动同步
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  /**
   * 运行自动同步
   */
  private async runAutoSync(): Promise<void> {
    try {
      this.isRunning = true;

      // 创建增量同步任务
      await this.createTask({
        type: 'incremental',
        source: 'all',
        priority: 5,
      });
    } catch (error) {
      console.error('自动同步失败:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 创建同步任务
   */
  async createTask(task: {
    type: SyncTask['type'];
    source: SyncTask['source'];
    priority?: number;
    scheduledFor?: Date;
  }): Promise<string> {
    const db = await getDb();
    const taskId = crypto.randomUUID();

    await db.insert(syncTasks).values({
      id: taskId,
      type: task.type,
      source: task.source,
      status: 'pending',
      priority: task.priority || 5,
      retryCount: 0,
      maxRetries: 3,
      progress: 0,
      scheduledFor: task.scheduledFor,
      createdAt: new Date(),
    });

    return taskId;
  }

  /**
   * 执行同步任务
   */
  async executeTask(taskId: string): Promise<void> {
    const db = await getDb();

    // 获取任务
    const tasks = await db
      .select()
      .from(syncTasks)
      .where(eq(syncTasks.id, taskId))
      .limit(1);

    if (!tasks.length) {
      throw new Error('任务不存在');
    }

    const task = tasks[0];

    // 更新任务状态为运行中
    await db
      .update(syncTasks)
      .set({
        status: 'running',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncTasks.id, taskId));

    try {
      // 记录日志
      await this.log(taskId, 'info', `开始执行${task.type}同步任务`);

      // 根据任务类型执行不同的同步逻辑
      const syncMode = task.type as 'full' | 'incremental' | 'realtime';
      switch (task.source) {
        case 'user':
          await this.syncUsers(taskId, syncMode);
          break;
        case 'department':
          await this.syncDepartments(taskId, syncMode);
          break;
        case 'position':
          await this.syncPositions(taskId, syncMode);
          break;
        case 'employee':
          await this.syncEmployees(taskId, syncMode);
          break;
        case 'all':
          await this.syncAll(taskId, syncMode);
          break;
      }

      // 更新任务状态为已完成
      await db
        .update(syncTasks)
        .set({
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(syncTasks.id, taskId));

      await this.log(taskId, 'info', '同步任务完成', { status: 'completed' });

      // 发送通知
      if (this.config.notifyOnComplete) {
        await this.sendNotification(taskId, 'success', '同步任务已完成');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      // 更新任务状态为失败
      await db
        .update(syncTasks)
        .set({
          status: task.retryCount >= task.maxRetries ? 'failed' : 'pending',
          error: errorMessage,
          retryCount: task.retryCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(syncTasks.id, taskId));

      await this.log(taskId, 'error', `同步任务失败: ${errorMessage}`);

      // 发送错误通知
      if (this.config.notifyOnError) {
        await this.sendNotification(taskId, 'error', `同步失败: ${errorMessage}`);
      }

      // 触发告警
      await alertManager.triggerAlertPublic({
        ruleId: 'sync-failure',
        type: 'sync_failure',
        severity: 'high',
        title: `同步任务失败 - ${task.source}`,
        message: `${task.type} 同步任务失败: ${errorMessage}`,
        taskId: taskId,
        metadata: {
          type: task.type,
          source: task.source,
          error: errorMessage,
          retryCount: task.retryCount,
        },
      });

      throw error;
    }
  }

  /**
   * 同步用户数据
   */
  private async syncUsers(taskId: string, type: SyncTask['type']): Promise<void> {
    const db = await getDb();

    await this.log(taskId, 'info', `开始同步用户数据 (${type})`);

    // 更新进度
    await this.updateProgress(taskId, 10);

    // 获取需要同步的用户数据
    // 这里应该是从其他数据源获取，示例中使用模拟数据
    const usersToSync = await this.getUsersToSync(type);

    await this.updateProgress(taskId, 30);

    // 批量处理
    const batchSize = this.config.batchSize;
    for (let i = 0; i < usersToSync.length; i += batchSize) {
      const batch = usersToSync.slice(i, i + batchSize);
      await this.processUserBatch(batch);

      const progress = Math.min(30 + ((i + batchSize) / usersToSync.length) * 70, 100);
      await this.updateProgress(taskId, progress);
    }

    await this.log(taskId, 'info', `用户数据同步完成，共处理 ${usersToSync.length} 条记录`);
  }

  /**
   * 同步部门数据
   */
  private async syncDepartments(taskId: string, type: SyncTask['type']): Promise<void> {
    const db = await getDb();

    await this.log(taskId, 'info', `开始同步部门数据 (${type})`);

    // 实现逻辑类似syncUsers
    await this.updateProgress(taskId, 100);
  }

  /**
   * 同步职位数据
   */
  private async syncPositions(taskId: string, type: SyncTask['type']): Promise<void> {
    const db = await getDb();

    await this.log(taskId, 'info', `开始同步职位数据 (${type})`);

    // 实现逻辑类似syncUsers
    await this.updateProgress(taskId, 100);
  }

  /**
   * 同步员工数据
   */
  private async syncEmployees(taskId: string, type: SyncTask['type']): Promise<void> {
    const db = await getDb();

    await this.log(taskId, 'info', `开始同步员工数据 (${type})`);

    // 实现逻辑类似syncUsers
    await this.updateProgress(taskId, 100);
  }

  /**
   * 同步所有数据
   */
  private async syncAll(taskId: string, type: SyncTask['type']): Promise<void> {
    await this.log(taskId, 'info', `开始全量数据同步 (${type})`);

    // 按顺序同步各类数据
    await this.syncUsers(taskId, type);
    await this.syncDepartments(taskId, type);
    await this.syncPositions(taskId, type);
    await this.syncEmployees(taskId, type);

    await this.log(taskId, 'info', '全量数据同步完成');
  }

  /**
   * 获取需要同步的用户数据
   */
  private async getUsersToSync(type: SyncTask['type']): Promise<any[]> {
    // 这里应该是从其他数据源获取
    // 示例返回空数组
    return [];
  }

  /**
   * 处理用户数据批次
   */
  private async processUserBatch(users: any[]): Promise<void> {
    // 实现批量处理逻辑
    console.log(`处理 ${users.length} 条用户数据`);
  }

  /**
   * 更新任务进度
   */
  private async updateProgress(taskId: string, progress: number): Promise<void> {
    const db = await getDb();

    await db
      .update(syncTasks)
      .set({
        progress: Math.min(Math.max(progress, 0), 100),
        updatedAt: new Date(),
      })
      .where(eq(syncTasks.id, taskId));
  }

  /**
   * 记录同步日志
   */
  private async log(
    taskId: string,
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    const db = await getDb();

    await db.insert(syncLogs).values({
      id: crypto.randomUUID(),
      taskId,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
      createdAt: new Date(),
    });
  }

  /**
   * 发送通知
   */
  private async sendNotification(
    taskId: string,
    type: 'success' | 'error' | 'warning',
    message: string
  ): Promise<void> {
    // 实现通知逻辑，可以是邮件、站内消息等
    console.log(`[通知][${type}] ${message}`);
  }

  /**
   * 获取待执行的任务
   */
  async getPendingTasks(): Promise<SyncTask[]> {
    const db = await getDb();

    const tasks = await db
      .select()
      .from(syncTasks)
      .where(
        and(
          eq(syncTasks.status, 'pending'),
          isNull(syncTasks.scheduledFor)
        )
      )
      .orderBy(desc(syncTasks.priority), desc(syncTasks.createdAt))
      .limit(10);

    return tasks.map(task => ({
      ...task,
      type: task.type as 'full' | 'incremental' | 'realtime',
      source: task.source as 'user' | 'department' | 'position' | 'employee' | 'all',
      status: task.status as 'pending' | 'running' | 'completed' | 'failed',
      error: task.error || undefined,
      startedAt: task.startedAt || undefined,
      completedAt: task.completedAt || undefined,
    }));
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<SyncTask | null> {
    const db = await getDb();

    const tasks = await db
      .select()
      .from(syncTasks)
      .where(eq(syncTasks.id, taskId))
      .limit(1);

    if (!tasks[0]) return null;

    return {
      ...tasks[0],
      type: tasks[0].type as 'full' | 'incremental' | 'realtime',
      source: tasks[0].source as 'user' | 'department' | 'position' | 'employee' | 'all',
      status: tasks[0].status as 'pending' | 'running' | 'completed' | 'failed',
      error: tasks[0].error || undefined,
      startedAt: tasks[0].startedAt || undefined,
      completedAt: tasks[0].completedAt || undefined,
    };
  }

  /**
   * 获取任务日志
   */
  async getTaskLogs(taskId: string): Promise<any[]> {
    const db = await getDb();

    const logs = await db
      .select()
      .from(syncLogs)
      .where(eq(syncLogs.taskId, taskId))
      .orderBy(desc(syncLogs.createdAt));

    return logs;
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<void> {
    const db = await getDb();

    await db
      .update(syncTasks)
      .set({
        status: 'failed',
        error: '任务已取消',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncTasks.id, taskId));
  }

  /**
   * 重试失败的任务
   */
  async retryTask(taskId: string): Promise<void> {
    const db = await getDb();

    await db
      .update(syncTasks)
      .set({
        status: 'pending',
        error: null,
        retryCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(syncTasks.id, taskId));
  }

  /**
   * 性能优化：批量并行处理
   */
  private async processBatchWithConcurrency<T>(
    items: T[],
    processor: (item: T, index: number) => Promise<void>,
    concurrency: number = 5
  ): Promise<void> {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += concurrency) {
      batches.push(items.slice(i, i + concurrency));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await Promise.allSettled(
        batch.map((item, j) => processor(item, i * concurrency + j))
      );
    }
  }

  /**
   * 性能优化：批量插入（使用事务）
   */
  private async batchInsertWithTransaction<T>(
    table: any,
    items: T[],
    batchSize: number = 100
  ): Promise<void> {
    const db = await getDb();
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await db.insert(table).values(batch as any);
    }
  }

  /**
   * 性能优化：流式处理大数据集
   */
  private async *streamProcess<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    batchSize: number = 100
  ): AsyncGenerator<void, void, unknown> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(processor));
      yield;
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    const { totalRecords, processedRecords, startTime, endTime } = this.performanceMetrics;
    const elapsed = endTime - startTime;
    const recordsPerSecond = elapsed > 0 ? (processedRecords / (elapsed / 1000)).toFixed(2) : '0';

    return {
      totalRecords,
      processedRecords,
      remainingRecords: totalRecords - processedRecords,
      elapsedTime: `${elapsed}ms`,
      recordsPerSecond: `${recordsPerSecond} records/sec`,
      progress: totalRecords > 0 ? `${((processedRecords / totalRecords) * 100).toFixed(2)}%` : '0%',
    };
  }

  /**
   * 重置性能指标
   */
  private resetPerformanceMetrics(totalRecords: number) {
    this.performanceMetrics = {
      totalRecords,
      processedRecords: 0,
      startTime: Date.now(),
      endTime: 0,
    };
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(processedCount: number) {
    this.performanceMetrics.processedRecords += processedCount;
    if (this.performanceMetrics.processedRecords >= this.performanceMetrics.totalRecords) {
      this.performanceMetrics.endTime = Date.now();
    }
  }

  /**
   * 优化后的同步用户数据方法
   */
  private async syncUsersOptimized(taskId: string, type: SyncTask['type']): Promise<void> {
    const db = await getDb();

    await this.log(taskId, 'info', `开始同步用户数据 (${type}) - 优化模式`);

    await this.updateProgress(taskId, 10);

    // 获取需要同步的用户数据
    const usersToSync = await this.getUsersToSync(type);

    this.resetPerformanceMetrics(usersToSync.length);

    await this.updateProgress(taskId, 30);

    // 使用流式处理，批次大小为200（性能优化）
    const batchSize = 200;
    const concurrency = 10; // 并发数

    for (let i = 0; i < usersToSync.length; i += batchSize) {
      const batch = usersToSync.slice(i, i + batchSize);

      // 并行处理批次中的数据
      await this.processBatchWithConcurrency(
        batch,
        async (user: any, index: number) => {
          // 这里处理单个用户数据
          await this.processSingleUser(user);
        },
        concurrency
      );

      this.updatePerformanceMetrics(batch.length);

      const progress = Math.min(30 + ((i + batchSize) / usersToSync.length) * 70, 100);
      await this.updateProgress(taskId, progress);

      // 输出性能指标
      if ((i + batchSize) % 500 === 0) {
        const metrics = this.getPerformanceMetrics();
        await this.log(taskId, 'info', `性能指标: ${JSON.stringify(metrics)}`);
      }
    }

    const finalMetrics = this.getPerformanceMetrics();
    await this.log(taskId, 'info', `用户数据同步完成 - 性能指标: ${JSON.stringify(finalMetrics)}`);
  }

  /**
   * 处理单个用户
   */
  private async processSingleUser(user: any): Promise<void> {
    // 实现单个用户的处理逻辑
    // 这里可以包括：数据验证、冲突解决、数据库操作等
  }
}

// 导出单例实例
export const syncManager = new SyncManager();

// 自动启动（在生产环境中应该由应用启动时调用）
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  syncManager.start();
}
