/**
 * 优化的数据库连接配置
 * 针对 Neon PostgreSQL 进行优化，提升跨平台性能
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';

/**
 * 优化的数据库连接池配置
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,

  // SSL 配置（Neon 要求）
  ssl: process.env.NODE_ENV === 'production'
    ? {
        rejectUnauthorized: false, // Neon 需要这样配置
      }
    : false,

  // 连接池大小优化
  max: 20, // 最大连接数 - 增加以处理更多并发请求
  min: 5, // 最小连接数 - 保持一定数量的连接池化

  // 超时配置
  idleTimeoutMillis: 10000, // 空闲连接超时 10 秒
  connectionTimeoutMillis: 2000, // 连接超时 2 秒 - 快速失败

  // 查询超时
  statement_timeout: 10000, // 语句超时 10 秒
  query_timeout: 10000, // 查询超时 10 秒

  // 启用 TCP Keep-Alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// 创建连接池
export const pool = new Pool(poolConfig);

// 导出数据库实例
export const db = drizzle(pool);

/**
 * 健康检查
 * 测试数据库连接是否正常
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as health_check');
    client.release();

    return result.rows[0].health_check === 1;
  } catch (error) {
    console.error('[Database Health Check] Failed:', error);
    return false;
  }
}

/**
 * 获取连接池统计信息
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    maxCount: pool.options.max,
  };
}

/**
 * 优雅关闭连接池
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('[Database] Connection pool closed gracefully');
  } catch (error) {
    console.error('[Database] Error closing pool:', error);
  }
}

/**
 * 带连接检查的查询执行器
 */
export async function withConnectionCheck<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  // 检查连接池状态
  const stats = getPoolStats();

  if (stats.waitingCount > 10) {
    console.warn('[Database] High waiting count:', stats.waitingCount);
  }

  // 执行查询
  return queryFn();
}

/**
 * 带重试的查询执行器
 * 专门针对 Neon 的连接问题进行优化
 */
export async function withRetryOnConnectionError<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;

      // 检查是否是连接错误
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes('connection') ||
         error.message.includes('timeout') ||
         error.message.includes('ECONN'));

      if (!isConnectionError || i === maxRetries - 1) {
        throw error;
      }

      console.warn(`[Database] Connection error on attempt ${i + 1}/${maxRetries}, retrying...`);

      // 等待一小段时间后重试
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

/**
 * 监控连接池健康状态
 */
export function startPoolMonitoring(intervalMs: number = 30000): void {
  setInterval(() => {
    const stats = getPoolStats();

    console.log('[Database Pool Stats]', {
      total: stats.totalCount,
      idle: stats.idleCount,
      waiting: stats.waitingCount,
      utilization: `${Math.round((stats.totalCount / stats.maxCount) * 100)}%`,
    });

    // 如果等待队列过长，记录警告
    if (stats.waitingCount > 5) {
      console.warn('[Database] High wait queue size:', stats.waitingCount);
    }
  }, intervalMs);
}

// 开发环境下启动监控
if (process.env.NODE_ENV === 'development') {
  startPoolMonitoring();
}

// 优雅关闭
if (typeof window === 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('[Database] SIGTERM received, closing pool...');
    await closePool();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Database] SIGINT received, closing pool...');
    await closePool();
    process.exit(0);
  });
}

// 导出默认配置供其他模块使用
export default db;
