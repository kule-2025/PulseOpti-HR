import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export const runtime = 'nodejs';

/**
 * POST /api/test-email
 * 发送测试邮件
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, message } = body;

    // 验证参数
    if (!to) {
      return NextResponse.json(
        { success: false, error: '请提供收件人邮箱地址' },
        { status: 400 }
      );
    }

    // 检查邮件服务是否已配置
    if (!emailService.isReady()) {
      return NextResponse.json(
        {
          success: false,
          error: '邮件服务未配置',
          details: '请在环境变量中配置: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
        },
        { status: 503 }
      );
    }

    // 发送测试邮件
    const success = await emailService.sendEmail({
      to,
      subject: subject || 'PulseOpti HR 测试邮件',
      text: message || '这是一封测试邮件，如果您收到此邮件，说明邮件配置成功！',
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: '测试邮件发送成功',
      });
    } else {
      return NextResponse.json(
        { success: false, error: '测试邮件发送失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    return NextResponse.json(
      { success: false, error: '发送测试邮件失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-email
 * 检查邮件服务配置状态
 */
export async function GET() {
  try {
    const isReady = emailService.isReady();

    return NextResponse.json({
      success: true,
      data: {
        configured: isReady,
        message: isReady
          ? '邮件服务已配置'
          : '邮件服务未配置，请在环境变量中配置 SMTP 相关参数',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '检查邮件服务状态失败' },
      { status: 500 }
    );
  }
}
