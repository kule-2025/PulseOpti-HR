import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { subscriptionManager } from '@/storage/database';
import { companies, insertCompanySchema } from '@/storage/database/shared/schema';
import { getDb } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';
import { addCorsHeaders, corsResponse, handleCorsOptions } from '@/lib/cors';

// 注册请求Schema
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
  password: z.string().min(8, '密码至少8位').regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码需包含字母和数字'),
  name: z.string().min(2, '姓名至少2位'),
  companyName: z.string().min(2, '企业名称至少2位'),
  industry: z.string().optional(),
  companySize: z.string().optional(),
});

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const db = await getDb();

    // 检查邮箱是否已存在
    const existingUser = await userManager.getUserByEmail(validated.email);
    if (existingUser) {
      return corsResponse(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 检查手机号是否已存在（如果提供了）
    if (validated.phone) {
      const existingPhone = await userManager.getUserByPhone(validated.phone);
      if (existingPhone) {
        return corsResponse(
          { error: '该手机号已被注册' },
          { status: 400 }
        );
      }
    }

    // 加密密码
    const hashedPassword = await hashPassword(validated.password);

    // 创建企业
    const companyData = {
      name: validated.companyName,
      industry: validated.industry,
      size: validated.companySize,
      subscriptionTier: 'free',
      maxEmployees: 30,
    };
    const validatedCompany = insertCompanySchema.parse(companyData);
    const [company] = await db.insert(companies).values(validatedCompany).returning();

    // 创建用户（设置为企业主）
    const userData = {
      companyId: company.id,
      email: validated.email,
      phone: validated.phone,
      name: validated.name,
      password: hashedPassword,
      role: 'owner',
      isSuperAdmin: false,
    };
    const user = await userManager.createUser(userData);

    // 创建免费订阅记录
    const subscriptionData = {
      companyId: company.id,
      tier: 'free',
      amount: 0,
      currency: 'CNY',
      period: 'yearly',
      maxEmployees: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
      status: 'active',
    };
    await subscriptionManager.createSubscription(subscriptionData);

    // 生成JWT token
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId!, // 注册时创建的用户必定有companyId
      role: user.role,
      userType: user.userType || 'main_account',
      isSuperAdmin: user.isSuperAdmin,
      name: user.name,
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
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
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
