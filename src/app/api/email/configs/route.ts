import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { smtpConfigs, companies } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';
import { insertSmtpConfigSchema } from '@/storage/database/shared/schema';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// 生成唯一ID
const nanoid = () => randomUUID();

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

// 创建SMTP配置Schema
const createSmtpConfigSchema = z.object({
  name: z.string().min(1, '配置名称不能为空').max(100, '配置名称不能超过100个字符'),
  provider: z.enum(['smtp', 'sendgrid', 'aliyun', 'tencent']),
  host: z.string().min(1, 'SMTP服务器地址不能为空'),
  port: z.number().int().min(1).max(65535).default(587),
  secure: z.boolean().default(false),
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  fromName: z.string().max(100, '发件人名称不能超过100个字符').optional(),
  fromAddress: z.string().email('发件人地址格式不正确'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  dailyLimit: z.number().int().min(0).default(1000),
  hourlyLimit: z.number().int().min(0).default(100),
  metadata: z.object({}).optional(),
});

// GET - 获取SMTP配置列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();

    let whereConditions: any[] = [];

    // 超管可以查看所有企业的配置
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(smtpConfigs.companyId, payload.companyId || ''));
    }

    if (provider) {
      whereConditions.push(eq(smtpConfigs.provider, provider));
    }

    if (isActive !== null && isActive !== '') {
      whereConditions.push(eq(smtpConfigs.isActive, isActive === 'true'));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 查询总数
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(smtpConfigs)
      .where(where);

    const total = Number(countResult[0]?.count || 0);

    // 查询数据
    const configs = await db
      .select({
        id: smtpConfigs.id,
        companyId: smtpConfigs.companyId,
        name: smtpConfigs.name,
        provider: smtpConfigs.provider,
        host: smtpConfigs.host,
        port: smtpConfigs.port,
        secure: smtpConfigs.secure,
        username: smtpConfigs.username,
        fromName: smtpConfigs.fromName,
        fromAddress: smtpConfigs.fromAddress,
        isDefault: smtpConfigs.isDefault,
        isActive: smtpConfigs.isActive,
        dailyLimit: smtpConfigs.dailyLimit,
        hourlyLimit: smtpConfigs.hourlyLimit,
        createdAt: smtpConfigs.createdAt,
        updatedAt: smtpConfigs.updatedAt,
        companyName: companies.name,
      })
      .from(smtpConfigs)
      .leftJoin(companies, eq(smtpConfigs.companyId, companies.id))
      .where(where)
      .orderBy(desc(smtpConfigs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 隐藏密码
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      password: '******',
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedConfigs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取SMTP配置列表失败:', error);
    return NextResponse.json(
      { error: '获取配置列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建SMTP配置
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createSmtpConfigSchema.parse(body);

    const db = await getDb();

    // 如果设置为默认配置，先取消其他默认配置
    if (validated.isDefault) {
      const companyId = payload.companyId;
      await db
        .update(smtpConfigs)
        .set({ isDefault: false })
        .where(and(
          eq(smtpConfigs.companyId, companyId),
          eq(smtpConfigs.isDefault, true)
        ));
    }

    // 创建配置
    const newConfig = {
      id: nanoid(),
      companyId: payload.companyId,
      ...validated,
      createdBy: payload.userId,
    };

    await db.insert(smtpConfigs).values(newConfig);

    return NextResponse.json({
      success: true,
      message: '配置创建成功',
      data: {
        id: newConfig.id,
        name: newConfig.name,
        provider: newConfig.provider,
        host: newConfig.host,
        port: newConfig.port,
        fromAddress: newConfig.fromAddress,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建SMTP配置失败:', error);
    return NextResponse.json(
      { error: '创建配置失败' },
      { status: 500 }
    );
  }
}
