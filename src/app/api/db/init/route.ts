import { NextRequest, NextResponse } from 'next/server';
import { getDb, checkDatabaseHealth } from '@/lib/db';
import { users, companies } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth/password';
import { addCorsHeaders, corsResponse } from '@/lib/cors';

/**
 * 数据库初始化API
 * - 检查数据库连接
 * - 创建测试数据（仅开发环境）
 */
export async function GET(request: NextRequest) {
  try {
    // 检查数据库健康状态
    const health = await checkDatabaseHealth();

    if (health.status !== 'healthy') {
      return corsResponse(
        {
          success: false,
          error: '数据库连接失败',
          details: health
        },
        { status: 500 }
      );
    }

    // 仅在开发环境创建测试数据
    if (process.env.NODE_ENV !== 'production') {
      const db = await getDb();

      // 检查是否已存在admin用户
      const existingUsers = await db.select().from(users).limit(1);

      if (existingUsers.length === 0) {
        console.log('🔄 正在初始化开发环境数据...');

        // 创建默认admin用户
        const hashedPassword = await hashPassword('admin123');

        const [adminUser] = await db.insert(users).values({
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理员',
          role: 'admin',
          userType: 'main_account',
          isSuperAdmin: false,
          isMainAccount: true,
          isActive: true,
        }).returning();

        console.log('✅ 创建admin用户成功:', adminUser.username);

        // 创建测试用户
        const testHashedPassword = await hashPassword('test123');

        const [testUser] = await db.insert(users).values({
          username: 'test',
          email: 'test@example.com',
          password: testHashedPassword,
          name: '测试用户',
          role: 'user',
          userType: 'main_account',
          isSuperAdmin: false,
          isMainAccount: true,
          isActive: true,
        }).returning();

        console.log('✅ 创建test用户成功:', testUser.username);

        return corsResponse({
          success: true,
          message: '数据库初始化成功',
          data: {
            health,
            users: [
              {
                username: adminUser.username,
                password: 'admin123',
                email: adminUser.email,
              },
              {
                username: testUser.username,
                password: 'test123',
                email: testUser.email,
              },
            ],
          },
        });
      } else {
        return corsResponse({
          success: true,
          message: '数据库已初始化',
          data: {
            health,
            existingUsers: existingUsers.length,
          },
        });
      }
    }

    return corsResponse({
      success: true,
      message: '数据库连接正常',
      data: { health },
    });

  } catch (error) {
    console.error('数据库初始化失败:', error);
    return corsResponse(
      {
        success: false,
        error: '数据库初始化失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
