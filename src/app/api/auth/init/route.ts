import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth/password';
import { addCorsHeaders, corsResponse } from '@/lib/cors';

/**
 * 初始化开发环境的默认用户
 * 注意：此API仅用于开发环境，生产环境应禁用
 */
export async function GET(request: NextRequest) {
  // 仅允许在开发环境使用
  if (process.env.NODE_ENV === 'production') {
    return corsResponse(
      { error: '此API仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    // 检查是否已存在admin用户
    let adminUser = await userManager.getUserByUsername('admin');

    if (!adminUser) {
      // 创建默认admin用户
      const hashedPassword = await hashPassword('admin123');

      adminUser = await userManager.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理员',
        role: 'admin',
        userType: 'main_account',
        isActive: true,
      });

      console.log('✅ 创建默认admin用户成功');
    } else {
      console.log('✅ admin用户已存在');
    }

    // 检查是否已存在测试用户
    let testUser = await userManager.getUserByUsername('test');

    if (!testUser) {
      const hashedPassword = await hashPassword('test123');

      testUser = await userManager.createUser({
        username: 'test',
        email: 'test@example.com',
        password: hashedPassword,
        name: '测试用户',
        role: 'user',
        userType: 'main_account',
        isActive: true,
      });

      console.log('✅ 创建默认test用户成功');
    } else {
      console.log('✅ test用户已存在');
    }

    const response = NextResponse.json({
      success: true,
      message: '初始化成功',
      data: {
        admin: {
          username: 'admin',
          password: 'admin123',
          email: 'admin@example.com',
        },
        test: {
          username: 'test',
          password: 'test123',
          email: 'test@example.com',
        },
      }
    });

    addCorsHeaders(response);
    return response;

  } catch (error) {
    console.error('初始化失败:', error);
    return corsResponse(
      { error: '初始化失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
