import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/middleware';
import { accountManagementService } from '@/lib/services/accountManagementService';
import { PERMISSIONS } from '@/lib/auth/permissions';

/**
 * GET /api/accounts/quota
 * 获取账号配额信息
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const hasPermission = await requirePermission(request, PERMISSIONS.ACCOUNT_VIEW_QUOTA);
    if (hasPermission instanceof NextResponse) return hasPermission;

    if (!user.companyId) {
      return NextResponse.json(
        { success: false, error: '未找到企业信息' },
        { status: 400 }
      );
    }

    const quota = await accountManagementService.checkQuota(user.companyId);

    return NextResponse.json({
      success: true,
      data: quota,
    });
  } catch (error: any) {
    console.error('获取配额信息失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取配额信息失败' },
      { status: 500 }
    );
  }
}
