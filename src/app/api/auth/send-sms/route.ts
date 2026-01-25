import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveSmsCode, checkSmsRateLimit } from '@/lib/auth/verification';

// 请求Schema
const sendSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  purpose: z.enum(['login', 'register', 'reset']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sendSmsSchema.parse(body);

    // MVP阶段：开发环境0成本方案，跳过频率限制
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      // 生产环境：检查频率限制（60秒内只能发送一次）
      const canSend = await checkSmsRateLimit(validated.phone, validated.purpose);
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
    const { code, expiresAt } = await saveSmsCode(validated.phone, validated.purpose, requestIp);

    // TODO: 生产环境集成真实的短信服务（如阿里云SMS、腾讯云SMS）
    // 这里使用模拟发送，实际调用短信服务API
    console.log(`[SMS] 发送验证码到 ${validated.phone} (用途: ${validated.purpose}): ${code}`);

    // 模拟短信发送成功
    // await sendSms(validated.phone, `您的验证码是${code}，5分钟内有效。`);

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
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

    console.error('发送短信验证码错误:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
