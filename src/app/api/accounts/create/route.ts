import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/middleware';
import { accountManagementService, UserType } from '@/lib/services/accountManagementService';
import { PERMISSIONS, USER_TYPES } from '@/lib/auth/permissions';
import { hashPassword } from '@/lib/auth/password';

/**
 * POST /api/accounts/create
 * 创建账号
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const { userType, parentUserId, name, email, phone, username, password, role, departmentId, positionId } = body;

    // 验证必填字段
    if (!userType || !name || !role) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 权限检查：主账号才能创建子账号和员工号
    if (userType === UserType.SUB_ACCOUNT || userType === UserType.EMPLOYEE) {
      const hasPermission = await requirePermission(request, PERMISSIONS.ACCOUNT_CREATE_SUB_ACCOUNT);
      if (hasPermission instanceof NextResponse) return hasPermission;
    }

    // 创建账号
    const result = await accountManagementService.createAccount({
      companyId: user.companyId || '',
      userType,
      parentUserId: parentUserId || user.userId,
      name,
      email,
      phone,
      username,
      password: password ? await hashPassword(password) : undefined,
      role,
      departmentId,
      positionId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('创建账号失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建账号失败' },
      { status: 500 }
    );
  }
}
