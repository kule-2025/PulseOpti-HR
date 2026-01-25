import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { smtpConfigs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';

// 验证JWT
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  try {
    const payload = await verifyJWT(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// 更新SMTP配置Schema
const updateSmtpConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  provider: z.enum(['smtp', 'sendgrid', 'aliyun', 'tencent']).optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  fromName: z.string().max(100).optional(),
  fromAddress: z.string().email().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  dailyLimit: z.number().int().min(0).optional(),
  hourlyLimit: z.number().int().min(0).optional(),
  metadata: z.object({}).optional(),
});

// GET - 获取单个SMTP配置详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDb();

    let whereConditions = [eq(smtpConfigs.id, id)];

    // 非超管只能查看自己企业的配置
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(smtpConfigs.companyId, payload.companyId || ''));
    }

    const config = await db
      .select()
      .from(smtpConfigs)
      .where(and(...whereConditions))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    // 隐藏密码
    const sanitizedConfig = {
      ...config[0],
      password: '******',
    };

    return NextResponse.json({
      success: true,
      data: sanitizedConfig,
    });
  } catch (error) {
    console.error('获取SMTP配置详情失败:', error);
    return NextResponse.json(
      { error: '获取配置详情失败' },
      { status: 500 }
    );
  }
}

// PATCH - 更新SMTP配置
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSmtpConfigSchema.parse(body);

    const db = await getDb();

    let whereConditions = [eq(smtpConfigs.id, id)];

    // 非超管只能修改自己企业的配置
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(smtpConfigs.companyId, payload.companyId || ''));
    }

    // 如果设置为默认配置，先取消其他默认配置
    if (validated.isDefault === true) {
      const companyId = payload.companyId;
      await db
        .update(smtpConfigs)
        .set({ isDefault: false })
        .where(and(
          eq(smtpConfigs.companyId, companyId),
          eq(smtpConfigs.isDefault, true)
        ));
    }

    // 更新配置
    await db
      .update(smtpConfigs)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新SMTP配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除SMTP配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDb();

    let whereConditions = [eq(smtpConfigs.id, id)];

    // 非超管只能删除自己企业的配置
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(smtpConfigs.companyId, payload.companyId || ''));
    }

    // 检查是否为默认配置
    const config = await db
      .select()
      .from(smtpConfigs)
      .where(and(...whereConditions))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    if (config[0].isDefault) {
      return NextResponse.json(
        { error: '不能删除默认配置' },
        { status: 400 }
      );
    }

    // 删除配置
    await db.delete(smtpConfigs).where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      message: '配置删除成功',
    });
  } catch (error) {
    console.error('删除SMTP配置失败:', error);
    return NextResponse.json(
      { error: '删除配置失败' },
      { status: 500 }
    );
  }
}
