import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 模拟登录API的响应格式
    return NextResponse.json({
      success: true,
      message: '测试成功',
      data: {
        user: {
          id: 'test-id',
          name: '测试用户',
          email: body.account || 'test@example.com',
          phone: '13800138000',
          avatarUrl: null,
          role: 'admin',
          isSuperAdmin: true,
        },
        companyId: 'PLATFORM',
        token: 'test-token-123456',
        subscription: null,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '测试失败',
    }, { status: 500 });
  }
}
