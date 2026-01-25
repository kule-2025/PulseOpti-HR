import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth/password';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { verifySmsCode, verifyEmailCode } from '@/lib/auth/verification';

// 请求Schema
const resetPasswordSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  code: z.string().min(6, '验证码格式不正确'),
  newPassword: z.string().min(8, '密码至少8位').regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码必须包含字母和数字'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // 验证至少提供了手机号或邮箱
    if (!validated.phone && !validated.email) {
      return NextResponse.json(
        { error: '请提供手机号或邮箱' },
        { status: 400 }
      );
    }

    // 验证验证码
    let isValid = false;

    if (validated.phone) {
      isValid = await verifySmsCode(validated.phone, validated.code, 'reset');
    } else if (validated.email) {
      isValid = await verifyEmailCode(validated.email, validated.code, 'reset');
    }

    if (!isValid) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await userManager.getUserByAnyAccount(validated.phone || validated.email!);

    if (!user) {
      return NextResponse.json(
        { error: '账号不存在' },
        { status: 404 }
      );
    }

    // 加密新密码
    const hashedPassword = await hashPassword(validated.newPassword);

    // 更新密码
    await userManager.updateUser(user.id, {
      password: hashedPassword,
    });

    // 记录密码重置日志
    if (user.companyId) {
      auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.id,
        userName: user.name,
        action: 'reset_password',
        resourceType: 'user',
        resourceId: user.id,
        status: 'success',
      }).catch(() => {}); // 异步执行，不阻塞
    }

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('重置密码错误:', error);
    return NextResponse.json(
      { error: '重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
