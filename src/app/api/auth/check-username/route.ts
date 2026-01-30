import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return corsResponse(
        { error: '用户名不能为空' },
        { status: 400 }
      );
    }

    const user = await userManager.getUserByUsername(username);
    const exists = !!user;

    return corsResponse({
      exists,
      message: exists ? '该用户名已被注册' : '该用户名可用'
    });

  } catch (error) {
    console.error('检查用户名错误:', error);
    return corsResponse(
      { error: '检查失败，请稍后重试' },
      { status: 500 }
    );
  }
}
