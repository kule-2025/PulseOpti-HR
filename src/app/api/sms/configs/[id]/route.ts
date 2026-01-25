/**
 * 短信配置详情API
 * 路径: /api/sms/configs/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsConfigs } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

// 更新短信配置的Schema验证
const updateSmsConfigSchema = z.object({
  name: z.string().min(1).optional(),
  provider: z.enum(['aliyun', 'tencent', 'custom']).optional(),
  accessKeyId: z.string().min(1).optional(),
  accessKeySecret: z.string().min(1).optional(),
  endpoint: z.string().optional(),
  signName: z.string().min(1).optional(),
  region: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  dailyLimit: z.number().int().min(0).optional(),
  hourlyLimit: z.number().int().min(0).optional(),
  metadata: z.map(z.string(), z.any()).optional(),
});

/**
 * GET - 获取短信配置详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 查询配置
    const config = await db
      .select()
      .from(smsConfigs)
      .where(and(
        eq(smsConfigs.id, id),
        eq(smsConfigs.companyId, companyId)
      ))
      .limit(1);

    if (!config) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }

    // 过滤敏感信息
    return NextResponse.json({
      success: true,
      data: {
        ...config,
        accessKeySecret: '******',
      },
    });
  } catch (error) {
    console.error('[SMS_CONFIG_DETAIL] 获取配置详情失败:', error);
    return NextResponse.json(
      {
        error: '获取配置详情失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新短信配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const validatedData = updateSmsConfigSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 检查配置是否存在
    const existingConfig = await db
      .select()
      .from(smsConfigs)
      .where(and(
        eq(smsConfigs.id, id),
        eq(smsConfigs.companyId, companyId)
      ))
      .limit(1)

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }

    // 如果设置为默认配置，需要取消其他默认配置
    if (validatedData.isDefault === true) {
      await db
        .update(smsConfigs)
        .set({ isDefault: false })
        .where(
          and(
            eq(smsConfigs.companyId, companyId),
            eq(smsConfigs.isDefault, true)
          )
        );
    }

    // 准备更新数据
    const updateData: any = { ...validatedData };

    // 如果更新了密钥，需要加密
    if (validatedData.accessKeySecret) {
      updateData.accessKeySecret = crypto
        .createHash('sha256')
        .update(validatedData.accessKeySecret)
        .digest('hex');
    }

    // 更新配置
    const [updatedConfig] = await db
      .update(smsConfigs)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(smsConfigs.id, id),
          eq(smsConfigs.companyId, companyId)
        )
      )
      .returning();

    // 记录审计日志
    // TODO: 添加审计日志记录

    return NextResponse.json({
      success: true,
      data: {
        ...updatedConfig,
        accessKeySecret: '******',
      },
      message: '短信配置更新成功',
    });
  } catch (error) {
    console.error('[SMS_CONFIG_DETAIL] 更新配置失败:', error);

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
        error: '更新配置失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除短信配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 检查配置是否存在
    const existingConfig = await db
      .select()
      .from(smsConfigs)
      .where(and(
        eq(smsConfigs.id, id),
        eq(smsConfigs.companyId, companyId)
      ))
      .limit(1)

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }

    // 删除配置
    await db
      .delete(smsConfigs)
      .where(
        and(
          eq(smsConfigs.id, id),
          eq(smsConfigs.companyId, companyId)
        )
      );

    // 记录审计日志
    // TODO: 添加审计日志记录

    return NextResponse.json({
      success: true,
      message: '短信配置删除成功',
    });
  } catch (error) {
    console.error('[SMS_CONFIG_DETAIL] 删除配置失败:', error);
    return NextResponse.json(
      {
        error: '删除配置失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
