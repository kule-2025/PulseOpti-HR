import { NextRequest, NextResponse } from 'next/server';
import { getDb, auditLogs } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/audit-logs - 获取审计日志
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

    // 获取审计日志，包含用户信息
    // 注意：这是占位符实现，真实环境需要使用实际数据库
    const logs: any[] = [];

    return NextResponse.json({ logs });

    // 数据中已包含 userName，直接返回
    return NextResponse.json({
      success: true,
      logs: logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: '获取审计日志失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
