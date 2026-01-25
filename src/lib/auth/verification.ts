/**
 * 验证码管理工具
 *
 * 功能：
 * - 邮箱验证码生成、存储、验证
 * - 短信验证码生成、存储、验证
 * - 支持多种用途（登录、注册、重置密码）
 *
 * 注意：
 * - 使用PostgreSQL数据库存储验证码
 * - 支持无服务器环境（Vercel）
 */

import { getDb } from '@/lib/db';
import { verificationCodes } from '@/storage/database/shared/schema';
import { eq, and, gt, lt, isNull } from 'drizzle-orm';

/**
 * 生成验证码
 *
 * @returns 6位数字验证码
 */
function generateCode(): string {
  const isDev = process.env.NODE_ENV === 'development';
  // MVP阶段：开发环境使用固定验证码"123456"实现0成本
  return isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 保存邮箱验证码
 *
 * @param email 邮箱
 * @param purpose 用途
 * @param ipAddress IP地址
 * @returns 验证码和过期时间
 */
export async function saveEmailCode(
  email: string,
  purpose: string,
  ipAddress?: string
): Promise<{ code: string; expiresAt: number }> {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后过期

  const db = await getDb();

  // 删除该邮箱的旧验证码（防止重复）
  await db
    .delete(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, email),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'email')
      )
    );

  // 插入新验证码
  await db.insert(verificationCodes).values({
    identifier: email,
    code,
    purpose,
    type: 'email',
    expiresAt,
    ipAddress,
    createdAt: now,
  });

  return {
    code,
    expiresAt: expiresAt.getTime(),
  };
}

/**
 * 保存短信验证码
 *
 * @param phone 手机号
 * @param purpose 用途
 * @param ipAddress IP地址
 * @returns 验证码和过期时间
 */
export async function saveSmsCode(
  phone: string,
  purpose: string,
  ipAddress?: string
): Promise<{ code: string; expiresAt: number }> {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后过期

  const db = await getDb();

  // 删除该手机号的旧验证码（防止重复）
  await db
    .delete(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, phone),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'sms')
      )
    );

  // 插入新验证码
  await db.insert(verificationCodes).values({
    identifier: phone,
    code,
    purpose,
    type: 'sms',
    expiresAt,
    ipAddress,
    createdAt: now,
  });

  return {
    code,
    expiresAt: expiresAt.getTime(),
  };
}

/**
 * 验证邮箱验证码
 *
 * @param email 邮箱
 * @param code 验证码
 * @param purpose 用途
 * @returns 验证是否成功
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  purpose: string
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  // 查找未使用的有效验证码
  const results = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, email),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'email'),
        gt(verificationCodes.expiresAt, now), // 未过期
        isNull(verificationCodes.usedAt) // 未使用
      )
    )
    .orderBy(verificationCodes.createdAt)
    .limit(1);

  if (results.length === 0) {
    return false;
  }

  const stored = results[0];

  // 检查验证码是否匹配
  if (stored.code !== code) {
    return false;
  }

  // 验证成功后标记为已使用
  await db
    .update(verificationCodes)
    .set({ usedAt: now })
    .where(eq(verificationCodes.id, stored.id));

  return true;
}

/**
 * 验证短信验证码
 *
 * @param phone 手机号
 * @param code 验证码
 * @param purpose 用途
 * @returns 验证是否成功
 */
export async function verifySmsCode(
  phone: string,
  code: string,
  purpose: string
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  // 查找未使用的有效验证码
  const results = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, phone),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'sms'),
        gt(verificationCodes.expiresAt, now), // 未过期
        isNull(verificationCodes.usedAt) // 未使用
      )
    )
    .orderBy(verificationCodes.createdAt)
    .limit(1);

  if (results.length === 0) {
    return false;
  }

  const stored = results[0];

  // 检查验证码是否匹配
  if (stored.code !== code) {
    return false;
  }

  // 验证成功后标记为已使用
  await db
    .update(verificationCodes)
    .set({ usedAt: now })
    .where(eq(verificationCodes.id, stored.id));

  return true;
}

/**
 * 检查邮箱验证码发送频率
 *
 * @param email 邮箱
 * @param purpose 用途
 * @returns 是否可以发送（false表示过于频繁）
 */
export async function checkEmailRateLimit(
  email: string,
  purpose: string
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1分钟前

  // 查找1分钟内是否已发送过验证码
  const results = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, email),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'email'),
        gt(verificationCodes.createdAt, oneMinuteAgo) // 1分钟内创建的
      )
    )
    .limit(1);

  return results.length === 0;
}

/**
 * 检查短信验证码发送频率
 *
 * @param phone 手机号
 * @param purpose 用途
 * @returns 是否可以发送（false表示过于频繁）
 */
export async function checkSmsRateLimit(
  phone: string,
  purpose: string
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1分钟前

  // 查找1分钟内是否已发送过验证码
  const results = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.identifier, phone),
        eq(verificationCodes.purpose, purpose),
        eq(verificationCodes.type, 'sms'),
        gt(verificationCodes.createdAt, oneMinuteAgo) // 1分钟内创建的
      )
    )
    .limit(1);

  return results.length === 0;
}

/**
 * 清理过期验证码（定时任务调用）
 *
 * @returns 清理的记录数
 */
export async function cleanExpiredCodes(): Promise<number> {
  const db = await getDb();
  const now = new Date();

  // 删除所有过期的验证码
  const result = await db
    .delete(verificationCodes)
    .where(lt(verificationCodes.expiresAt, now))
    .returning({ id: verificationCodes.id });

  return result.length;
}
