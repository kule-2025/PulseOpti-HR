import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

// 获取订单列表
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

    // 查询用户订单列表
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, payload.userId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      orders: userOrders,
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { error: '获取订单列表失败' },
      { status: 500 }
    );
  }
}
