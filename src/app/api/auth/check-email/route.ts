import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return corsResponse(
        { error: '邮箱不能为空' },
        { status: 400 }
      );
    }

    const user = await userManager.getUserByEmail(email);
    const exists = !!user;

    return corsResponse({
      exists,
      message: exists ? '该邮箱已被注册' : '该邮箱可用'
    });

  } catch (error) {
    console.error('检查邮箱错误:', error);
    return corsResponse(
      { error: '检查失败，请稍后重试' },
      { status: 500 }
    );
  }
}
