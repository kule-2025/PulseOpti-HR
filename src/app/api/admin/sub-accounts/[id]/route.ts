import { NextRequest, NextResponse } from 'next/server';
import { subAccountManager } from '@/storage/database/subAccountManager';
import { requireAuth } from '@/lib/auth/middleware';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 重置密码Schema
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(100),
});

// 停用子账号
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id: subAccountId } = await params;

  try {
    // 只有主账号可以停用子账号
    if (!user.isMainAccount) {
      return NextResponse.json(
        { error: '只有主账号可以停用子账号' },
        { status: 403 }
      );
    }

    const deactivatedUser = await subAccountManager.deactivateSubAccount(
      subAccountId,
      user.userId
    );

    if (!deactivatedUser) {
      return NextResponse.json(
        { error: '子账号不存在' },
        { status: 404 }
      );
    }

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'sub_account',
      resourceId: subAccountId,
      resourceName: deactivatedUser.name,
      changes: { isActive: false },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '子账号已停用',
      data: deactivatedUser,
    });
  } catch (error) {
    console.error('停用子账号失败:', error);

    const errorMessage = error instanceof Error ? error.message : '停用子账号失败';

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

// 激活子账号
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;
  const { id: subAccountId } = await params;

  try {
    const body = await request.json();
    const action = body.action;

    // 只有主账号可以操作子账号
    if (!user.isMainAccount) {
      return NextResponse.json(
        { error: '只有主账号可以操作子账号' },
        { status: 403 }
      );
    }

    if (action === 'activate') {
      // 激活子账号
      const activatedUser = await subAccountManager.activateSubAccount(subAccountId);

      if (!activatedUser) {
        return NextResponse.json(
          { error: '子账号不存在' },
          { status: 404 }
        );
      }

      // 记录审计日志
      await auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.userId,
        userName: user.name,
        action: 'update',
        resourceType: 'sub_account',
        resourceId: subAccountId,
        resourceName: activatedUser.name,
        changes: { isActive: true },
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '子账号已激活',
        data: activatedUser,
      });
    } else if (action === 'reset_password') {
      // 重置密码
      const validated = resetPasswordSchema.parse(body);

      const updatedUser = await subAccountManager.resetSubAccountPassword(
        subAccountId,
        validated.newPassword
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: '子账号不存在' },
          { status: 404 }
        );
      }

      // 记录审计日志（不记录密码）
      await auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.userId,
        userName: user.name,
        action: 'update',
        resourceType: 'sub_account',
        resourceId: subAccountId,
        resourceName: updatedUser.name,
        changes: { password: '[REDACTED]' },
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '密码重置成功',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } else {
      return NextResponse.json(
        { error: '不支持的操作' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('操作子账号失败:', error);

    const errorMessage = error instanceof Error ? error.message : '操作子账号失败';

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
