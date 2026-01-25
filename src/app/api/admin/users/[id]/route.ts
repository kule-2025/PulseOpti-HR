import { NextRequest, NextResponse } from 'next/server';
import { getDb, users, companies, auditLogs } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/admin/users/[id] - 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
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

    // 获取用户详情
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 获取企业信息
    const company = user[0].companyId
      ? await db
          .select({ name: companies.name })
          .from(companies)
          .where(eq(companies.id, user[0].companyId))
          .limit(1)
      : null;

    const userData = user[0];

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        companyName: company?.[0]?.name || null,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: '获取用户详情失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - 更新用户信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
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

    const body = await request.json();
    const { action, ...updateData } = body;

    const db = await getDb();

    // 检查用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const user = existingUser[0];

    // 不允许修改超级管理员的基本信息
    if (user.isSuperAdmin && action !== 'toggle_status') {
      return NextResponse.json({ error: '无权修改超级管理员信息' }, { status: 403 });
    }

    // 根据操作类型执行不同的更新
    if (action === 'toggle_status') {
      // 切换用户状态
      await db
        .update(users)
        .set({
          isActive: updateData.isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // 记录审计日志
      await db.insert(auditLogs).values({
        companyId: user.companyId || 'PLATFORM',
        userId: decoded.userId,
        action: 'UPDATE_USER_STATUS',
        resourceType: 'user',
        resourceId: userId,
        resourceName: user.name,
        changes: JSON.stringify({
          targetUserId: userId,
          targetUserName: user.name,
          oldStatus: user.isActive,
          newStatus: updateData.isActive,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '用户状态已更新',
      });
    }

    if (action === 'update_profile') {
      // 更新用户基本信息
      const { name, email, phone, role } = updateData;

      // 验证邮箱是否被其他用户使用
      if (email && email !== user.email) {
        const emailExists = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), sql`${users.id} != ${userId}`))
          .limit(1);

        if (emailExists && emailExists.length > 0) {
          return NextResponse.json({ error: '邮箱已被其他用户使用' }, { status: 400 });
        }
      }

      await db
        .update(users)
        .set({
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(role && { role }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // 记录审计日志
      await db.insert(auditLogs).values({
        companyId: user.companyId || 'PLATFORM',
        userId: decoded.userId,
        action: 'UPDATE_USER',
        resourceType: 'user',
        resourceId: userId,
        resourceName: user.name,
        changes: JSON.stringify({
          targetUserId: userId,
          targetUserName: user.name,
          updateData,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '用户信息已更新',
      });
    }

    return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: '更新用户信息失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
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

    // 检查用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const user = existingUser[0];

    // 不允许删除超级管理员
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: '无权删除超级管理员' }, { status: 403 });
    }

    // 不允许删除自己
    if (user.id === decoded.userId) {
      return NextResponse.json({ error: '不能删除自己' }, { status: 400 });
    }

    // 软删除用户（设置为禁用状态）
    await db
      .update(users)
      .set({
        isActive: false,
        email: `deleted_${user.id}_${user.email}`, // 邮箱加前缀避免冲突
        phone: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      companyId: user.companyId || 'PLATFORM',
      userId: decoded.userId,
      action: 'DELETE_USER',
      resourceType: 'user',
      resourceId: userId,
      resourceName: user.name,
      changes: JSON.stringify({
        targetUserId: userId,
        targetUserName: user.name,
        targetEmail: user.email,
      }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: '删除用户失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
