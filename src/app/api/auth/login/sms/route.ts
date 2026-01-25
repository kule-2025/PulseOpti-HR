import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { subscriptionManager } from '@/storage/database';
import { verifySmsCode } from '@/lib/auth/verification';
import { generateToken } from '@/lib/auth/jwt';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 短信验证码登录Schema
const smsLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  code: z.string().length(6, '验证码格式不正确'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = smsLoginSchema.parse(body);

    // 验证验证码
    const isCodeValid = await verifySmsCode(validated.phone, validated.code, 'login');
    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, message: '验证码错误或已过期' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await userManager.getUserByPhone(validated.phone);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '手机号未注册' },
        { status: 404 }
      );
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: '账号已被禁用' },
        { status: 403 }
      );
    }

    // 并行执行：更新最后登录时间、检查订阅状态（性能优化）
    // 仅对有companyId的账号检查订阅状态（开发者账号companyId为null，不检查）
    const subscriptionPromise = user.companyId
      ? subscriptionManager.checkSubscriptionStatus(user.companyId)
      : Promise.resolve(null);
    const [subscriptionStatus] = await Promise.all([
      subscriptionPromise,
      userManager.updateLastLogin(user.id).catch(() => {}),
    ]);

    // 生成JWT token
    // 开发者账号（companyId为null）使用"PLATFORM"作为特殊标识
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId || 'PLATFORM',
      role: user.role,
      userType: user.userType || 'main_account',
      isSuperAdmin: user.isSuperAdmin,
      name: user.name,
    });

    // 记录登录日志（不阻塞响应）
    auditLogManager.logAction({
      companyId: user.companyId || 'PLATFORM',
      userId: user.id,
      userName: user.name,
      action: 'login_sms',
      resourceType: 'user',
      resourceId: user.id,
      status: 'success',
    }).catch(() => {});

    // 创建响应并设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
        },
        companyId: user.companyId,
        token,
        subscription: subscriptionStatus,
      }
    });

    // 设置cookie（7天有效期）
    response.cookies.set('auth_token', token, {
      httpOnly: false, // 允许客户端访问（用于调试）
      secure: process.env.NODE_ENV === 'production', // 生产环境使用HTTPS
      sameSite: 'lax', // 防止CSRF
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('短信验证码登录错误:', error);
    return NextResponse.json(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
