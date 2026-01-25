import { NextRequest, NextResponse } from 'next/server';
import { getDb, users, companies } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc, like, or, sql } from 'drizzle-orm';

// GET /api/admin/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const db = await getDb();

    // 获取所有用户，包含所属企业信息
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isSuperAdmin: users.isSuperAdmin,
        isActive: users.isActive,
        companyId: users.companyId,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // 获取企业信息
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
      })
      .from(companies);

    // 创建企业ID到名称的映射
    const companyMap = new Map(
      companiesList.map(c => [c.id, c.name])
    );

    // 添加企业名称到用户数据
    const usersWithCompany = allUsers.map(user => ({
      ...user,
      companyName: user.companyId ? companyMap.get(user.companyId) || '未知企业' : null,
    }));

    return NextResponse.json({
      success: true,
      users: usersWithCompany,
      total: usersWithCompany.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: '获取用户列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
