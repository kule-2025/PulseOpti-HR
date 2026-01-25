/**
 * 短信配置管理API
 * 路径: /api/sms/configs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsConfigs } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

// 创建短信配置的Schema验证
const createSmsConfigSchema = z.object({
  name: z.string().min(1, '配置名称不能为空'),
  provider: z.enum(['aliyun', 'tencent', 'custom']),
  accessKeyId: z.string().min(1, 'AccessKey ID不能为空'),
  accessKeySecret: z.string().min(1, 'AccessKey Secret不能为空'),
  endpoint: z.string().optional(),
  signName: z.string().min(1, '签名不能为空'),
  region: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  dailyLimit: z.number().int().min(0).optional(),
  hourlyLimit: z.number().int().min(0).optional(),
  metadata: z.map(z.string(), z.any()).optional(),
});

// 更新短信配置的Schema验证
const updateSmsConfigSchema = createSmsConfigSchema.partial();

/**
 * GET - 获取短信配置列表
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive');

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(smsConfigs.companyId, payload.companyId || 'PLATFORM')];

    if (isActive !== null) {
      conditions.push(eq(smsConfigs.isActive, isActive === 'true'));
    }

    // 查询总数
    const [{ count }] = await db
      .select({ count: crypto.createHash('md5').update('COUNT(*)').digest('hex') as any })
      .from(smsConfigs)
      .where(and(...conditions));

    // 查询配置列表
    const configs = await db
      .select()
      .from(smsConfigs)
      .where(and(...conditions))
      .orderBy(desc(smsConfigs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 过滤敏感信息
    const sanitizedConfigs = configs.map((config) => ({
      ...config,
      accessKeySecret: '******', // 不返回密钥
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedConfigs,
      pagination: {
        page,
        limit,
        total: typeof count === 'number' ? count : parseInt(count as string),
        totalPages: Math.ceil((typeof count === 'number' ? count : parseInt(count as string)) / limit),
      },
    });
  } catch (error) {
    console.error('[SMS_CONFIGS] 获取配置列表失败:', error);
    return NextResponse.json(
      {
        error: '获取配置列表失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建短信配置
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();

    // 验证数据格式
    const validatedData = createSmsConfigSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 如果设置为默认配置，需要取消其他默认配置
    if (validatedData.isDefault) {
      await db
        .update(smsConfigs)
        .set({ isDefault: false })
        .where(and(eq(smsConfigs.companyId, companyId), eq(smsConfigs.isDefault, true)));
    }

    // 加密AccessKey Secret
    const encryptedSecret = crypto
      .createHash('sha256')
      .update(validatedData.accessKeySecret)
      .digest('hex');

    // 创建配置
    const [newConfig] = await db
      .insert(smsConfigs)
      .values({
        companyId,
        ...validatedData,
        accessKeySecret: encryptedSecret,
      })
      .returning();

    // 记录审计日志
    // TODO: 添加审计日志记录

    return NextResponse.json({
      success: true,
      data: {
        ...newConfig,
        accessKeySecret: '******',
      },
      message: '短信配置创建成功',
    });
  } catch (error) {
    console.error('[SMS_CONFIGS] 创建配置失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '数据验证失败',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '创建配置失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
