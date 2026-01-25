import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 测试数据库连接 - 使用简单的SELECT
    const result = await db.execute('SELECT 1 as test');

    return NextResponse.json({
      success: true,
      message: '数据库连接正常',
      data: {
        testResult: result,
      },
    });
  } catch (error) {
    console.error('数据库检查失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
