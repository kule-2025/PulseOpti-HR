import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { subscriptionManager } from '@/storage/database';
import { companies, insertCompanySchema } from '@/storage/database/shared/schema';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';
import { addCorsHeaders, corsResponse, handleCorsOptions } from '@/lib/cors';

// 注册请求Schema
const registerSchema = z.object({
  // 支持三种注册方式：邮箱注册、手机注册、用户名注册
  // 至少提供一种注册方式
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  username: z.string()
    .min(4, '用户名至少4位')
    .max(20, '用户名最多20位')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .optional(),
  password: z.string().min(8, '密码至少8位').regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码需包含字母和数字'),
  name: z.string().min(2, '姓名至少2位'),
  companyName: z.string().min(2, '企业名称至少2位'),
  industry: z.string().optional(),
  companySize: z.string().optional(),
}).refine((data) => {
  // 至少需要提供一种注册方式（邮箱、手机或用户名）
  const hasEmail = !!data.email;
  const hasPhone = !!data.phone;
  const hasUsername = !!data.username;
  return hasEmail || hasPhone || hasUsername;
}, {
  message: '请至少提供一种注册方式（邮箱、手机号或用户名）',
  path: ['email'],
}).refine((data) => {
  // 用户名不能是邮箱格式
  if (data.username && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username)) {
    return false;
  }
  return true;
}, {
  message: '用户名不能是邮箱格式',
  path: ['username'],
}).refine((data) => {
  // 用户名不能是手机号格式
  if (data.username && /^1[3-9]\d{9}$/.test(data.username)) {
    return false;
  }
  return true;
}, {
  message: '用户名不能是手机号',
  path: ['username'],
});

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const { email, phone, username, password, name, companyName, industry, companySize } = validated;

    const db = await getDb();

    // 检查邮箱是否已被注册
    if (email) {
      const existingEmailUser = await userManager.getUserByEmail(email);
      if (existingEmailUser) {
        return corsResponse(
          { error: '该邮箱已被注册' },
          { status: 409 }
        );
      }
    }

    // 检查手机号是否已被注册
    if (phone) {
      const existingPhoneUser = await userManager.getUserByPhone(phone);
      if (existingPhoneUser) {
        return corsResponse(
          { error: '该手机号已被注册' },
          { status: 409 }
        );
      }
    }

    // 检查用户名是否已被注册
    if (username) {
      const existingUsernameUser = await userManager.getUserByUsername(username);
      if (existingUsernameUser) {
        return corsResponse(
          { error: '该用户名已被注册' },
          { status: 409 }
        );
      }
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建企业
    const companyData = {
      name: companyName,
      industry: industry,
      size: companySize,
      subscriptionTier: 'free',
      maxEmployees: 30,
    };
    const validatedCompany = insertCompanySchema.parse(companyData);
    const [company] = await db.insert(companies).values(validatedCompany).returning();

    // 创建用户（设置为企业主）
    const user = await userManager.createUser({
      companyId: company.id,
      email: email || null,
      phone: phone || null,
      username: username || null,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      userType: 'main_account',
      isSuperAdmin: false,
    });

    if (!user) {
      return corsResponse(
        { error: '用户创建失败' },
        { status: 500 }
      );
    }

    // 创建免费订阅记录
    const subscriptionData = {
      companyId: company.id,
      tier: 'free',
      amount: 0,
      currency: 'CNY',
      period: 'yearly',
      maxEmployees: 30,
      maxSubAccounts: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
      status: 'active',
    };
    await subscriptionManager.createSubscription(subscriptionData);

    // 生成JWT token
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId!,
      role: user.role,
      userType: user.userType || 'main_account',
      isSuperAdmin: user.isSuperAdmin,
      name: user.name,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: company.id,
      userId: user.id,
      userName: user.name,
      action: 'register',
      resourceType: 'user',
      resourceId: user.id,
      resourceName: user.name,
      status: 'success',
    });

    return corsResponse({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: user.role,
          userType: user.userType || 'main_account',
          isSuperAdmin: user.isSuperAdmin,
          companyId: company.id,
        },
        companyId: company.id,
        token,
        subscription: subscriptionData,
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return corsResponse(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('注册错误:', error);
    return corsResponse(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
