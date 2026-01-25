import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// 支持GET和POST方法（兼容不同的调用方式）
async function handleVerify(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供令牌' },
        { status: 401 }
      );
    }

    // 验证JWT令牌
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '令牌无效或已过期' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: decoded.userId,
          companyId: decoded.companyId,
          role: decoded.role,
          isSuperAdmin: decoded.isSuperAdmin,
          name: decoded.name,
        },
      },
    });
  } catch (error) {
    console.error('Token验证失败:', error);
    return NextResponse.json(
      { success: false, message: '令牌验证失败' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleVerify(request);
}

export async function POST(request: NextRequest) {
  return handleVerify(request);
}
