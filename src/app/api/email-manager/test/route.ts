import { NextRequest, NextResponse } from 'next/server';
import { getEmailManager } from '@/lib/email-manager';

/**
 * 测试邮件管理器连接
 */
export async function GET() {
  try {
    const emailManager = getEmailManager();

    if (!emailManager) {
      return NextResponse.json({
        success: false,
        error: '邮件管理器未配置',
      });
    }

    const results = await emailManager.testAllConnections();

    return NextResponse.json({
      success: true,
      data: {
        connections: results,
        stats: emailManager.getAllStats(),
      },
    });
  } catch (error) {
    console.error('测试邮件连接失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试失败',
    });
  }
}

/**
 * 发送测试邮件
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数: to, subject',
      });
    }

    const emailManager = getEmailManager();

    if (!emailManager) {
      return NextResponse.json({
        success: false,
        error: '邮件管理器未配置',
      });
    }

    const result = await emailManager.sendEmail({
      to,
      subject: `[测试] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>📧 测试邮件</h2>
          <p>${message || '这是一封来自 PulseOpti HR 的测试邮件。'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            发送时间: ${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      error: result.error,
      stats: emailManager.getAllStats(),
    });
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '发送失败',
    });
  }
}
