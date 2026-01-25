import { NextRequest, NextResponse } from 'next/server';
import { subAccountManager } from '@/storage/database/subAccountManager';
import { requireAuth } from '@/lib/auth/middleware';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建子账号Schema
const createSubAccountSchema = z.object({
  name: z.string().min(2).max(128),
  email: z.string().email(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'manager']).default('admin'),
});

// 获取公司的所有管理员账号（包括主账号和子账号）
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    // 只有主账号和管理员可以查看子账号列表
    if (user.role !== 'super_admin' && !user.isMainAccount && user.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    const accounts = await subAccountManager.getAdminAccounts(user.companyId);

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('获取管理员账号列表失败:', error);
    return NextResponse.json(
      { error: '获取管理员账号列表失败' },
      { status: 500 }
    );
  }
}

// 创建子账号
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    // 验证是否为主账号
    if (!user.isMainAccount) {
      return NextResponse.json(
        { error: '只有主账号可以创建子账号' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createSubAccountSchema.parse(body);

    // 创建子账号
    const newSubAccount = await subAccountManager.createSubAccount({
      companyId: user.companyId,
      parentUserId: user.userId,
      ...validated,
    });

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'sub_account',
      resourceId: newSubAccount.id,
      resourceName: newSubAccount.name,
      changes: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        role: validated.role,
      },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '子账号创建成功',
      data: {
        id: newSubAccount.id,
        name: newSubAccount.name,
        email: newSubAccount.email,
        phone: newSubAccount.phone,
        role: newSubAccount.role,
        isMainAccount: newSubAccount.isMainAccount,
        createdAt: newSubAccount.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建子账号失败:', error);

    // 返回具体错误信息
    const errorMessage = error instanceof Error ? error.message : '创建子账号失败';

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
