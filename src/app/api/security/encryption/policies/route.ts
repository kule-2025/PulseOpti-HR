import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { encryptionPolicies, encryptionKeys, companies } from '@/storage/database/shared/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';
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

// 创建加密策略Schema
const createPolicySchema = z.object({
  name: z.string().min(1, '策略名称不能为空').max(100, '策略名称不能超过100个字符'),
  tableName: z.string().min(1, '表名不能为空').max(100, '表名不能超过100个字符'),
  columnName: z.string().min(1, '列名不能为空').max(100, '列名不能超过100个字符'),
  keyId: z.string().min(1, '密钥ID不能为空'),
  encryptionType: z.enum(['field', 'row', 'column']),
  description: z.string().optional(),
});

// GET - 获取加密策略列表
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
    const tableName = searchParams.get('tableName');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();

    let whereConditions: any[] = [];

    // 非超管只能查看自己企业的策略
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(encryptionPolicies.companyId, payload.companyId || ''));
    }

    if (tableName) {
      whereConditions.push(eq(encryptionPolicies.tableName, tableName));
    }

    if (isActive !== null && isActive !== '') {
      whereConditions.push(eq(encryptionPolicies.isActive, isActive === 'true'));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 查询总数
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(encryptionPolicies)
      .where(where);

    const total = Number(countResult[0]?.count || 0);

    // 查询数据
    const policies = await db
      .select({
        id: encryptionPolicies.id,
        companyId: encryptionPolicies.companyId,
        name: encryptionPolicies.name,
        tableName: encryptionPolicies.tableName,
        columnName: encryptionPolicies.columnName,
        keyId: encryptionPolicies.keyId,
        encryptionType: encryptionPolicies.encryptionType,
        isActive: encryptionPolicies.isActive,
        description: encryptionPolicies.description,
        createdAt: encryptionPolicies.createdAt,
        updatedAt: encryptionPolicies.updatedAt,
        keyName: encryptionKeys.name,
        keyFingerprint: encryptionKeys.keyFingerprint,
        companyName: companies.name,
      })
      .from(encryptionPolicies)
      .leftJoin(encryptionKeys, eq(encryptionPolicies.keyId, encryptionKeys.id))
      .leftJoin(companies, eq(encryptionPolicies.companyId, companies.id))
      .where(where)
      .orderBy(desc(encryptionPolicies.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取加密策略列表失败:', error);
    return NextResponse.json(
      { error: '获取策略列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建加密策略
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
    const validated = createPolicySchema.parse(body);

    const db = await getDb();

    // 检查密钥是否存在
    const key = await db
      .select()
      .from(encryptionKeys)
      .where(eq(encryptionKeys.id, validated.keyId))
      .limit(1);

    if (key.length === 0) {
      return NextResponse.json(
        { error: '密钥不存在' },
        { status: 400 }
      );
    }

    if (!key[0].isActive) {
      return NextResponse.json(
        { error: '密钥未激活，无法使用' },
        { status: 400 }
      );
    }

    // 检查是否已有相同表和列的策略
    const existingPolicy = await db
      .select()
      .from(encryptionPolicies)
      .where(
        and(
          eq(encryptionPolicies.companyId, payload.companyId || ''),
          eq(encryptionPolicies.tableName, validated.tableName),
          eq(encryptionPolicies.columnName, validated.columnName),
          eq(encryptionPolicies.isActive, true)
        )
      )
      .limit(1);

    if (existingPolicy.length > 0) {
      return NextResponse.json(
        { error: '该表和列已有生效的加密策略' },
        { status: 400 }
      );
    }

    // 创建策略
    const newPolicy = {
      id: nanoid(),
      companyId: payload.companyId,
      ...validated,
      createdBy: payload.userId,
    };

    await db.insert(encryptionPolicies).values(newPolicy);

    return NextResponse.json({
      success: true,
      message: '策略创建成功',
      data: {
        id: newPolicy.id,
        name: newPolicy.name,
        tableName: newPolicy.tableName,
        columnName: newPolicy.columnName,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建加密策略失败:', error);
    return NextResponse.json(
      { error: '创建策略失败' },
      { status: 500 }
    );
  }
}
