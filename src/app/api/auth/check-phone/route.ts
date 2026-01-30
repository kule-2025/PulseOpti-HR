import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return corsResponse(
        { error: '手机号不能为空' },
        { status: 400 }
      );
    }

    const user = await userManager.getUserByPhone(phone);
    const exists = !!user;

    return corsResponse({
      exists,
      message: exists ? '该手机号已被注册' : '该手机号可用'
    });

  } catch (error) {
    console.error('检查手机号错误:', error);
    return corsResponse(
      { error: '检查失败，请稍后重试' },
      { status: 500 }
    );
  }
}
