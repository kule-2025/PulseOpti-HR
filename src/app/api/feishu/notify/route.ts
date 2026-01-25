import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 发送飞书消息通知
 * POST /api/feishu/notify
 * Body: { userId, type, message?, card? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'text', message, card } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'text':
        if (!message) {
          return NextResponse.json(
            { error: '文本消息内容不能为空' },
            { status: 400 }
          );
        }
        await feishuService.sendNotification(userId, message);
        break;

      case 'card':
        if (!card) {
          return NextResponse.json(
            { error: '卡片内容不能为空' },
            { status: 400 }
          );
        }
        await feishuService.sendCardNotification(userId, card);
        break;

      default:
        return NextResponse.json(
          { error: '不支持的消息类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: '消息发送成功',
    });
  } catch (error) {
    console.error('发送飞书消息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '发送失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
