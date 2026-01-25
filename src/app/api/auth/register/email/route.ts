import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { subscriptionManager } from '@/storage/database';
import { companies, insertCompanySchema } from '@/storage/database/shared/schema';
import { getDb } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { verifyEmailCode } from '@/lib/auth/verification';
import { z } from 'zod';

// 邮箱注册请求Schema
const emailRegisterSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  code: z.string().length(6, '验证码必须是6位'),
  password: z.string().min(8, '密码至少8位').regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码需包含字母和数字'),
  companyName: z.string().min(2, '企业名称至少2位'),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(), // 可选
  name: z.string().min(2, '姓名至少2位'), // 必填
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = emailRegisterSchema.parse(body);

    // MVP阶段：开发环境允许使用验证码"123456"进行测试
    const isDev = process.env.NODE_ENV === 'development';

    // 验证邮箱验证码
    let codeValid: boolean;
    if (isDev) {
      // 开发环境固定验证码
      codeValid = validated.code === '123456';
    } else {
      // 生产环境验证数据库中的验证码
      codeValid = await verifyEmailCode(validated.email, validated.code, 'register');
    }

    if (!codeValid) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查邮箱是否已存在
    const existingUser = await userManager.getUserByEmail(validated.email);
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 如果提供了手机号，检查手机号是否已存在
    if (validated.phone) {
      const existingPhone = await userManager.getUserByPhone(validated.phone);
      if (existingPhone) {
        return NextResponse.json(
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

    return NextResponse.json({
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
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('邮箱注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
