import { NextRequest, NextResponse } from 'next/server';
import { getDb, systemSettings, auditLogs } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/settings - 获取系统设置
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const db = await getDb();

    // 获取系统设置（如果不存在则返回默认值）
    const settings = await db
      .select()
      .from(systemSettings)
      .orderBy(desc(systemSettings.createdAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      settings: settings.length > 0 ? settings[0] : null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: '获取系统设置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - 更新系统设置
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const db = await getDb();

    // 检查是否已存在设置
    const existingSettings = await db
      .select()
      .from(systemSettings)
      .orderBy(desc(systemSettings.createdAt))
      .limit(1);

    if (existingSettings && existingSettings.length > 0) {
      // 更新现有设置
      await db
        .update(systemSettings)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existingSettings[0].id));
    } else {
      // 创建新设置
      await db.insert(systemSettings).values({
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 记录审计日志
    if (body.enableAuditLogs !== false) {
      await db.insert(auditLogs).values({
        companyId: 'system',
        userId: decoded.userId,
        action: 'UPDATE_SYSTEM_SETTINGS',
        resourceType: 'system_settings',
        resourceId: 'global',
        resourceName: 'System Settings',
        changes: JSON.stringify({ updatedFields: Object.keys(body) }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'success',
      });
    }

    return NextResponse.json({
      success: true,
      message: '系统设置已更新',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: '更新系统设置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
