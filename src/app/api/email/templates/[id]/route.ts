import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { emailTemplates } from '@/storage/database/shared/schema';
import { eq, and, or } from 'drizzle-orm';
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

// 更新邮件模板Schema
const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().min(1).max(50).optional(),
  category: z.enum(['verification', 'notification', 'marketing', 'system']).optional(),
  subject: z.string().min(1).max(500).optional(),
  htmlContent: z.string().min(1).optional(),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - 获取单个邮件模板详情
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

    let whereConditions = [
      eq(emailTemplates.id, id)
    ];

    // 非超管只能查看自己企业和系统模板
    if (payload.userType !== 'super_admin' && payload.companyId) {
      whereConditions.push(
        or(
          eq(emailTemplates.companyId, payload.companyId),
          eq(emailTemplates.isSystem, true)
        )!
      );
    }

    const template = await db
      .select()
      .from(emailTemplates)
      .where(and(...whereConditions))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { error: '模板不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template[0],
    });
  } catch (error) {
    console.error('获取邮件模板详情失败:', error);
    return NextResponse.json(
      { error: '获取模板详情失败' },
      { status: 500 }
    );
  }
}

// PATCH - 更新邮件模板
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
    const validated = updateEmailTemplateSchema.parse(body);

    const db = await getDb();

    let whereConditions = [
      eq(emailTemplates.id, id)
    ];

    // 非超管只能修改自己企业的模板，不能修改系统模板
    if (payload.userType !== 'super_admin' && payload.companyId) {
      whereConditions.push(
        and(
          eq(emailTemplates.companyId, payload.companyId),
          eq(emailTemplates.isSystem, false)
        )!
      );
    }

    // 更新模板
    await db
      .update(emailTemplates)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      message: '模板更新成功',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新邮件模板失败:', error);
    return NextResponse.json(
      { error: '更新模板失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除邮件模板
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

    let whereConditions = [
      eq(emailTemplates.id, id)
    ];

    // 非超管只能删除自己企业的模板，不能删除系统模板
    if (payload.userType !== 'super_admin' && payload.companyId) {
      whereConditions.push(
        and(
          eq(emailTemplates.companyId, payload.companyId),
          eq(emailTemplates.isSystem, false)
        )!
      );
    }

    // 删除模板
    await db.delete(emailTemplates).where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      message: '模板删除成功',
    });
  } catch (error) {
    console.error('删除邮件模板失败:', error);
    return NextResponse.json(
      { error: '删除模板失败' },
      { status: 500 }
    );
  }
}
