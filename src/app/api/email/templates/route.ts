import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { emailTemplates, companies } from '@/storage/database/shared/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
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

// 创建邮件模板Schema
const createEmailTemplateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(255, '模板名称不能超过255个字符'),
  code: z.string().min(1, '模板代码不能为空').max(50, '模板代码不能超过50个字符'),
  category: z.enum(['verification', 'notification', 'marketing', 'system']),
  subject: z.string().min(1, '邮件主题不能为空').max(500, '邮件主题不能超过500个字符'),
  htmlContent: z.string().min(1, 'HTML内容不能为空'),
  textContent: z.string().optional(),
  variables: z.array(z.string()).default([]),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// GET - 获取邮件模板列表
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
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const isSystem = searchParams.get('isSystem');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();

    let whereConditions: any[] = [];

    // 非超管只能查看自己企业和系统模板
    if (payload.userType !== 'super_admin') {
      whereConditions.push(
        or(
          eq(emailTemplates.companyId, payload.companyId || ''),
          eq(emailTemplates.isSystem, true)
        )
      );
    }

    if (category) {
      whereConditions.push(eq(emailTemplates.category, category));
    }

    if (keyword) {
      whereConditions.push(
        or(
          like(emailTemplates.name, `%${keyword}%`),
          like(emailTemplates.code, `%${keyword}%`)
        )
      );
    }

    if (isSystem !== null && isSystem !== '') {
      whereConditions.push(eq(emailTemplates.isSystem, isSystem === 'true'));
    }

    if (isActive !== null && isActive !== '') {
      whereConditions.push(eq(emailTemplates.isActive, isActive === 'true'));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 查询总数
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(emailTemplates)
      .where(where);

    const total = Number(countResult[0]?.count || 0);

    // 查询数据
    const templates = await db
      .select({
        id: emailTemplates.id,
        companyId: emailTemplates.companyId,
        name: emailTemplates.name,
        code: emailTemplates.code,
        category: emailTemplates.category,
        subject: emailTemplates.subject,
        description: emailTemplates.description,
        isSystem: emailTemplates.isSystem,
        isActive: emailTemplates.isActive,
        usageCount: emailTemplates.usageCount,
        lastUsedAt: emailTemplates.lastUsedAt,
        createdAt: emailTemplates.createdAt,
        updatedAt: emailTemplates.updatedAt,
        companyName: companies.name,
      })
      .from(emailTemplates)
      .leftJoin(companies, eq(emailTemplates.companyId, companies.id))
      .where(where)
      .orderBy(desc(emailTemplates.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取邮件模板列表失败:', error);
    return NextResponse.json(
      { error: '获取模板列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建邮件模板
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
    const validated = createEmailTemplateSchema.parse(body);

    const db = await getDb();

    // 检查模板代码是否已存在
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.code, validated.code))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: '模板代码已存在' },
        { status: 400 }
      );
    }

    // 创建模板
    const newTemplate = {
      id: nanoid(),
      companyId: validated.isSystem ? null : (payload.companyId),
      ...validated,
      createdBy: payload.userId,
    };

    await db.insert(emailTemplates).values(newTemplate);

    return NextResponse.json({
      success: true,
      message: '模板创建成功',
      data: {
        id: newTemplate.id,
        name: newTemplate.name,
        code: newTemplate.code,
        category: newTemplate.category,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建邮件模板失败:', error);
    return NextResponse.json(
      { error: '创建模板失败' },
      { status: 500 }
    );
  }
}
