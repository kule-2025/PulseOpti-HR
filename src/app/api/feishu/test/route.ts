import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 测试飞书集成
 * POST /api/feishu/test
 * Body: { action, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'auth-url': {
        const authUrl = feishuService.getAuthUrl(params.redirectUri || 'http://localhost:3000/api/feishu/auth');
        return NextResponse.json({ success: true, data: { authUrl } });
      }

      case 'sync': {
        const result = await feishuService.syncFromFeishu(params);
        return NextResponse.json({ success: true, data: result });
      }

      case 'search': {
        const users = await feishuService.searchFeishuUsers(params.query || '');
        return NextResponse.json({ success: true, data: { users, count: users.length } });
      }

      case 'notify': {
        await feishuService.sendNotification(params.userId, params.message || '测试消息');
        return NextResponse.json({ success: true, message: '消息发送成功' });
      }

      case 'notify-card': {
        const card = params.card || {
          config: { wide_screen_mode: true },
          header: {
            template: 'blue',
            title: { content: '测试卡片消息', tag: 'plain_text' },
          },
          elements: [
            {
              tag: 'div',
              text: { tag: 'lark_md', content: '这是一条测试卡片消息' },
            },
          ],
        };
        await feishuService.sendCardNotification(params.userId, card);
        return NextResponse.json({ success: true, message: '卡片消息发送成功' });
      }

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('飞书测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
