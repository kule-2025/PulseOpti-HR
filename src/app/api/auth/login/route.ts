import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { subscriptionManager } from '@/storage/database';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';
import { addCorsHeaders, corsResponse, handleCorsOptions } from '@/lib/cors';

// 登录请求Schema
const loginSchema = z.object({
  account: z.string().min(1, '账号不能为空'), // 可以是邮箱、手机号或用户名
  password: z.string().min(1, '密码不能为空'),
});

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // 一次性获取用户（支持邮箱、手机号、用户名）
    const user = await userManager.getUserByAnyAccount(validated.account);

    if (!user) {
      return corsResponse(
        { error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(validated.password, user.password || '');
    if (!isPasswordValid) {
      // 记录失败的登录尝试
      if (user.companyId) {
        await auditLogManager.logAction({
          companyId: user.companyId,
          userId: user.id,
          userName: user.name,
          action: 'login',
          resourceType: 'user',
          resourceId: user.id,
          status: 'failed',
          errorMessage: '密码错误',
        });
      }

      return corsResponse(
        { error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return corsResponse(
        { error: '账号已被禁用' },
        { status: 403 }
      );
    }

    // 并行执行：更新最后登录时间、检查订阅状态（性能优化）
    // 仅对有companyId的账号检查订阅状态（开发者账号companyId为null，不检查）
    let subscriptionStatus = null;
    try {
      const subscriptionPromise = user.companyId
        ? subscriptionManager.checkSubscriptionStatus(user.companyId)
        : Promise.resolve(null);
      const [status] = await Promise.all([
        subscriptionPromise,
        userManager.updateLastLogin(user.id).catch(() => {}), // 不阻塞主流程
      ]);
      subscriptionStatus = status;
    } catch (error) {
      // 订阅检查失败不影响登录（可能是数据库表结构问题）
      console.warn('订阅检查失败，跳过订阅验证:', error);
      subscriptionStatus = {
        isValid: true,
        tier: 'free',
        maxEmployees: 999,
        expiresAt: null,
      };
    }

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
      action: 'login',
      resourceType: 'user',
      resourceId: user.id,
      status: 'success',
    }).catch(() => {}); // 异步执行，不阻塞

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
    }, { status: 200 });

    // 添加CORS头
    addCorsHeaders(response);

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
      return corsResponse(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('登录错误:', error);
    return corsResponse(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
