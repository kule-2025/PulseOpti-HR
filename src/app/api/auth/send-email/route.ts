import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveEmailCode, checkEmailRateLimit } from '@/lib/auth/verification';
import { sendVerificationEmail } from '@/lib/mail';

// 请求Schema
const sendEmailSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  purpose: z.enum(['login', 'register', 'reset']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sendEmailSchema.parse(body);

    // MVP阶段：开发环境0成本方案，跳过频率限制
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      // 生产环境：检查频率限制（60秒内只能发送一次）
      const canSend = await checkEmailRateLimit(validated.email, validated.purpose);
      if (!canSend) {
        return NextResponse.json(
          { error: '验证码发送过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }

    // 生成并保存验证码
    const requestIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const { code, expiresAt } = await saveEmailCode(validated.email, validated.purpose, requestIp);

    // 检查是否启用邮件服务
    const emailEnabled = process.env.ENABLE_EMAIL_SERVICE === 'true';

    try {
      if (emailEnabled) {
        // 发送真实邮件
        const sent = await sendVerificationEmail(validated.email, code, validated.purpose);

        if (!sent) {
          console.warn('[EMAIL] 邮件发送失败，但验证码已保存');
          // 开发环境返回验证码，生产环境不返回
          if (isDev) {
            console.log(`[EMAIL] 开发模式：验证码已生成 - ${code}`);
          }
        }
      } else {
        // 开发环境：控制台输出
        console.log(`[EMAIL] 发送验证码到 ${validated.email} (用途: ${validated.purpose}): ${code}`);
      }
    } catch (emailError) {
      // 邮件发送失败不影响验证码生成
      console.error('[EMAIL] 邮件发送异常:', emailError);
      console.log('[EMAIL] 验证码已保存，可以继续使用');
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      data: {
        // 开发环境返回验证码，生产环境应删除
        ...(isDev && { code, tip: 'MVP模式：使用验证码 123456' }),
        expiresAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('发送邮件验证码错误:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
