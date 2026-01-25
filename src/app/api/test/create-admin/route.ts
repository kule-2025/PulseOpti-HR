import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const db = await getDb();

    // 检查是否已存在
    const existing = await db
      .select()
      .from(users)
      .where(require('drizzle-orm').eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: '该用户已存在',
      }, { status: 400 });
    }

    // 创建超级管理员
    const hashedPassword = await hashPassword(password);

    const [admin] = await db
      .insert(users)
      .values({
        email,
        username: email,
        password: hashedPassword,
        name: name || '超级管理员',
        role: 'admin',
        isSuperAdmin: true,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '超级管理员创建成功',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('创建管理员失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
