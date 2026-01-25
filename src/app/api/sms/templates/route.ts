/**
 * 短信模板管理API
 * 路径: /api/sms/templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsTemplates } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// 创建短信模板的Schema验证
const createSmsTemplateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空'),
  code: z.string().min(1, '模板代码不能为空').regex(/^[a-zA-Z0-9_-]+$/, '模板代码只能包含字母、数字、下划线和连字符'),
  category: z.enum(['verification', 'notification', 'marketing', 'system']),
  templateId: z.string().optional(), // 服务商模板ID
  content: z.string().min(1, '模板内容不能为空'),
  variables: z.array(z.string()).optional(),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// 更新短信模板的Schema验证
const updateSmsTemplateSchema = createSmsTemplateSchema.partial();

/**
 * GET - 获取短信模板列表
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
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const isSystem = searchParams.get('isSystem');

    const db = await getDb();

    // 构建查询条件
    const conditions: any[] = [];

    // 查询系统模板或企业模板
    const companyId = payload.companyId || 'PLATFORM';
    conditions.push(
      sql`${smsTemplates.companyId} IS NULL OR ${smsTemplates.companyId} = ${companyId}`
    );

    if (category) {
      conditions.push(eq(smsTemplates.category, category));
    }

    if (isActive !== null) {
      conditions.push(eq(smsTemplates.isActive, isActive === 'true'));
    }

    if (isSystem !== null) {
      conditions.push(eq(smsTemplates.isSystem, isSystem === 'true'));
    }

    // 查询总数
    const [{ count }] = await db
      .select({ count: sql`COUNT(*)` })
      .from(smsTemplates)
      .where(and(...conditions));

    // 查询模板列表
    const templates = await db
      .select()
      .from(smsTemplates)
      .where(and(...conditions))
      .orderBy(desc(smsTemplates.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total: typeof count === 'number' ? count : parseInt(count as string),
        totalPages: Math.ceil((typeof count === 'number' ? count : parseInt(count as string)) / limit),
      },
    });
  } catch (error) {
    console.error('[SMS_TEMPLATES] 获取模板列表失败:', error);
    return NextResponse.json(
      {
        error: '获取模板列表失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建短信模板
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
    const validatedData = createSmsTemplateSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 检查模板代码是否已存在
    const existingTemplate = await db
      .select()
      .from(smsTemplates)
      .where(eq(smsTemplates.code, validatedData.code))
      .limit(1);

    if (existingTemplate) {
      return NextResponse.json(
        { error: '模板代码已存在' },
        { status: 400 }
      );
    }

    // 创建模板
    const [newTemplate] = await db
      .insert(smsTemplates)
      .values({
        companyId,
        ...validatedData,
        createdBy: payload.userId,
      })
      .returning();

    // 记录审计日志
    // TODO: 添加审计日志记录

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: '短信模板创建成功',
    });
  } catch (error) {
    console.error('[SMS_TEMPLATES] 创建模板失败:', error);

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
        error: '创建模板失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// 导入sql函数
import { sql } from 'drizzle-orm';
