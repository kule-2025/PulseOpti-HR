import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 飞书单点登录回调
 * GET /api/feishu/auth?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: '缺少授权码' },
        { status: 400 }
      );
    }

    // 通过授权码获取用户信息
    const user = await feishuService.ssoLogin(code);

    // 生成会话令牌（这里简化处理，实际应该使用JWT或session）
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      timestamp: Date.now(),
    })).toString('base64');

    // 重定向到前端，携带token和用户信息
    const redirectUrl = state
      ? `${state}?token=${token}&userId=${user.id}`
      : `/dashboard?token=${token}&userId=${user.id}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('飞书单点登录失败:', error);
    return NextResponse.json(
      {
        error: '单点登录失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
