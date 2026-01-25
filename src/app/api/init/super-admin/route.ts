import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, companies } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 检查users表是否存在
    try {
      await db.execute('SELECT 1 FROM users LIMIT 1');
    } catch (error) {
      // 表不存在，需要创建
      return NextResponse.json({
        success: false,
        error: 'users表不存在，请运行数据库迁移',
      }, { status: 500 });
    }

    // 检查是否已有超级管理员
    const existingAdmin = await db
      .select()
      .from(users)
      .where(require('drizzle-orm').eq(users.email, '208343256@qq.com'));

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: true,
        message: '超级管理员已存在',
        data: {
          email: existingAdmin[0].email,
          name: existingAdmin[0].name,
        },
      });
    }

    // 创建超级管理员
    const hashedPassword = await hashPassword('admin123');

    const [admin] = await db
      .insert(users)
      .values({
        email: '208343256@qq.com',
        username: '208343256@qq.com',
        password: hashedPassword,
        name: '超级管理员',
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
    console.error('初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
