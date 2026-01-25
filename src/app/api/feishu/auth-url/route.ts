import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 获取飞书OAuth授权URL
 * POST /api/feishu/auth-url
 * Body: { redirectUri, state }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { redirectUri, state } = body;

    if (!redirectUri) {
      return NextResponse.json(
        { error: '缺少回调地址' },
        { status: 400 }
      );
    }

    const authUrl = feishuService.getAuthUrl(redirectUri, state);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('获取飞书授权URL失败:', error);
    return NextResponse.json(
      {
        error: '获取授权URL失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
