import { NextRequest, NextResponse } from 'next/server';
import { subAccountManager } from '@/storage/database/subAccountManager';
import { requireAuth } from '@/lib/auth/middleware';

// 获取子账号配额信息
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    // 只有主账号和管理员可以查看配额
    if (!user.isMainAccount && user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    const quota = await subAccountManager.getSubAccountQuota(user.companyId);

    return NextResponse.json({
      success: true,
      data: quota,
    });
  } catch (error) {
    console.error('获取子账号配额失败:', error);
    return NextResponse.json(
      { error: '获取子账号配额失败' },
      { status: 500 }
    );
  }
}
