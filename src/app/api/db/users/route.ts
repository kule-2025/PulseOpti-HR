import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';
import { addCorsHeaders, corsResponse } from '@/lib/cors';

/**
 * 检查现有用户API（仅开发环境）
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return corsResponse(
      { error: '此API仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    const db = await getDb();
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      name: users.name,
      role: users.role,
      userType: users.userType,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).limit(10);

    return corsResponse({
      success: true,
      data: allUsers,
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return corsResponse(
      {
        success: false,
        error: '获取用户列表失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
