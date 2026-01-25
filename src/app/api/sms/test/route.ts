import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/sms-service';

/**
 * 测试短信服务连接
 */
export async function GET() {
  try {
    const result = await smsService.testConnection();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('测试短信连接失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试失败',
    });
  }
}

/**
 * 发送测试短信
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, templateCode, code, message } = await request.json();

    if (!phone || !templateCode) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数: phone, templateCode',
      });
    }

    let success: boolean;

    if (code) {
      // 发送验证码
      success = await smsService.sendVerificationCode(phone, code, templateCode);
    } else if (message) {
      // 发送通知消息
      success = await smsService.sendNotificationSMS(phone, message, templateCode);
    } else {
      return NextResponse.json({
        success: false,
        error: '请提供 code 或 message 参数',
      });
    }

    const stats = smsService.getStats();

    return NextResponse.json({
      success,
      stats,
    });
  } catch (error) {
    console.error('发送测试短信失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '发送失败',
    });
  }
}
