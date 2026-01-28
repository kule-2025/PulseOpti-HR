import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { companies } from '@/storage/database/shared/schema';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { addCorsHeaders, corsResponse } from '@/lib/cors';
import { eq } from 'drizzle-orm';

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
    const db = await getDb();

    // 检查或创建开发者企业
    let [devCompany] = await db.select().from(companies).where(eq(companies.code, 'DEV-PLATFORM'));
    
    if (!devCompany) {
      const [newCompany] = await db.insert(companies).values({
        name: '开发者平台',
        code: 'DEV-PLATFORM',
        industry: 'Technology',
        size: '1-10',
        subscriptionTier: 'enterprise',
        maxEmployees: 99999,
        isActive: true,
      }).returning();
      devCompany = newCompany;
      console.log('✅ 创建开发者企业成功');
    }

    const devCompanyId = devCompany.id;

    // 检查是否已存在admin用户
    let adminUser = await userManager.getUserByUsername('admin');

    if (!adminUser) {
      // 创建默认admin用户
      const hashedPassword = await hashPassword('admin123');

      try {
        adminUser = await userManager.createUser({
          username: 'admin',
          email: 'admin@pulseopti-dev.com',
          password: hashedPassword,
          name: '管理员',
          companyId: devCompanyId,
          role: 'admin',
          userType: 'developer',
          isSuperAdmin: true,
          isActive: true,
        });
        console.log('✅ 创建默认admin用户成功');
      } catch (createError: any) {
        // 如果创建失败（可能是并发导致），再次检查是否已存在
        adminUser = await userManager.getUserByUsername('admin');
        if (!adminUser) {
          throw createError;
        }
        console.log('✅ admin用户创建失败但已存在，继续执行');
      }
    } else {
      console.log('✅ admin用户已存在');
    }

    // 检查是否已存在测试用户
    let testUser = await userManager.getUserByUsername('test');

    if (!testUser) {
      const hashedPassword = await hashPassword('test123');

      try {
        testUser = await userManager.createUser({
          username: 'test',
          email: 'test@pulseopti-dev.com',
          password: hashedPassword,
          name: '测试用户',
          companyId: devCompanyId,
          role: 'admin',
          userType: 'developer',
          isSuperAdmin: true,
          isActive: true,
        });
        console.log('✅ 创建默认test用户成功');
      } catch (createError: any) {
        // 如果创建失败（可能是并发导致），再次检查是否已存在
        testUser = await userManager.getUserByUsername('test');
        if (!testUser) {
          throw createError;
        }
        console.log('✅ test用户创建失败但已存在，继续执行');
      }
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
          email: 'admin@pulseopti-dev.com',
        },
        test: {
          username: 'test',
          password: 'test123',
          email: 'test@pulseopti-dev.com',
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
