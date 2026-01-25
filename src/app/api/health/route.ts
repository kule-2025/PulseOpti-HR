import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

/**
 * 健康检查API
 * 用于监控应用状态和数据库连接
 */
export async function GET() {
  try {
    // 检查数据库连接
    const dbHealth = await checkDatabaseHealth();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
