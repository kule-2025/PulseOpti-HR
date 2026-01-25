/**
 * 数据库连接配置
 * 使用 Drizzle ORM 连接 PostgreSQL 数据库
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/storage/database/shared/schema';

// 创建数据库连接
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 创建 PostgreSQL 客户端
const client = postgres(connectionString, {
  max: 10, // 最大连接数
  idle_timeout: 20, // 空闲超时
  connect_timeout: 10, // 连接超时
});

// 创建 Drizzle 实例
export const db = drizzle(client, { schema });

export default db;
