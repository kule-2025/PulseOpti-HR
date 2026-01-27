import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth/password';
import { addCorsHeaders, corsResponse } from '@/lib/cors';
import { eq } from 'drizzle-orm';

/**
 * 重置用户密码API（仅开发环境）
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return corsResponse(
      { error: '此API仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return corsResponse(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hashedPassword = await hashPassword(newPassword);

    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword,
        username: email.split('@')[0], // 设置username
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();

    if (!updatedUser) {
      return corsResponse(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return corsResponse({
      success: true,
      message: '密码重置成功',
      data: {
        email: updatedUser.email,
        username: updatedUser.username,
      },
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    return corsResponse(
      {
        success: false,
        error: '重置密码失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
