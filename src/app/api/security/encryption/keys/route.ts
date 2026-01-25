import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { encryptionKeys, companies } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';
import { generateKey, wrapKey, unwrapKey, generateKeyFingerprint, generateId } from '@/lib/encryption';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';

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

// 创建密钥Schema
const createKeySchema = z.object({
  name: z.string().min(1, '密钥名称不能为空').max(100, '密钥名称不能超过100个字符'),
  isMaster: z.boolean().default(false),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET - 获取加密密钥列表
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
    const isActive = searchParams.get('isActive');
    const isMaster = searchParams.get('isMaster');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();

    let whereConditions: any[] = [];

    // 非超管只能查看自己企业的密钥
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(encryptionKeys.companyId, payload.companyId || ''));
    }

    if (isActive !== null && isActive !== '') {
      whereConditions.push(eq(encryptionKeys.isActive, isActive === 'true'));
    }

    if (isMaster !== null && isMaster !== '') {
      whereConditions.push(eq(encryptionKeys.isMaster, isMaster === 'true'));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 查询总数
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(encryptionKeys)
      .where(where);

    const total = Number(countResult[0]?.count || 0);

    // 查询数据（不返回密钥数据）
    const keys = await db
      .select({
        id: encryptionKeys.id,
        companyId: encryptionKeys.companyId,
        name: encryptionKeys.name,
        keyFingerprint: encryptionKeys.keyFingerprint,
        version: encryptionKeys.version,
        isActive: encryptionKeys.isActive,
        isMaster: encryptionKeys.isMaster,
        description: encryptionKeys.description,
        expiresAt: encryptionKeys.expiresAt,
        lastUsedAt: encryptionKeys.lastUsedAt,
        createdAt: encryptionKeys.createdAt,
        updatedAt: encryptionKeys.updatedAt,
        companyName: companies.name,
      })
      .from(encryptionKeys)
      .leftJoin(companies, eq(encryptionKeys.companyId, companies.id))
      .where(where)
      .orderBy(desc(encryptionKeys.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: keys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取加密密钥列表失败:', error);
    return NextResponse.json(
      { error: '获取密钥列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建加密密钥
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
    const validated = createKeySchema.parse(body);

    const db = await getDb();

    // 检查是否已有主密钥
    if (validated.isMaster) {
      const existingMasterKey = await db
        .select()
        .from(encryptionKeys)
        .where(
          and(
            eq(encryptionKeys.companyId, payload.companyId || ''),
            eq(encryptionKeys.isMaster, true)
          )
        )
        .limit(1);

      if (existingMasterKey.length > 0) {
        return NextResponse.json(
          { error: '该企业已有主密钥，无法创建多个主密钥' },
          { status: 400 }
        );
      }
    }

    // 生成新的数据密钥
    const dataKey = generateKey();
    const keyFingerprint = generateKeyFingerprint(dataKey);

    // 使用环境变量中的主密钥包装数据密钥
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      return NextResponse.json(
        { error: '未配置主密钥，无法创建加密密钥' },
        { status: 500 }
      );
    }

    const masterKeyBuffer = Buffer.from(masterKey, 'base64');
    const wrappedKey = wrapKey(dataKey, masterKeyBuffer);

    // 创建密钥记录
    const newKey = {
      id: nanoid(),
      companyId: payload.companyId,
      name: validated.name,
      keyData: wrappedKey,
      keyFingerprint,
      version: 1,
      isActive: false, // 默认不激活，需要手动激活
      isMaster: validated.isMaster,
      description: validated.description,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      createdBy: payload.userId,
    };

    await db.insert(encryptionKeys).values(newKey);

    return NextResponse.json({
      success: true,
      message: '密钥创建成功',
      data: {
        id: newKey.id,
        name: newKey.name,
        keyFingerprint: newKey.keyFingerprint,
        version: newKey.version,
        isMaster: newKey.isMaster,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建加密密钥失败:', error);
    return NextResponse.json(
      { error: '创建密钥失败' },
      { status: 500 }
    );
  }
}
