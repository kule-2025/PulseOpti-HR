import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    // 优先从header获取token，其次从cookie获取
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth_token')?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 验证token
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: '无效的token' },
        { status: 401 }
      );
    }

    // 获取数据库实例
    const db = await getDb();

    // 查询用户信息
    const userList = await db.select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      email: users.email,
      phone: users.phone,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: users.role,
      isActive: users.isActive,
    }).from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    const user = userList[0];

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
