import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { syncTasks } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { syncManager } from '@/lib/sync-manager';

/**
 * 取消同步任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      );
    }

    await syncManager.cancelTask(taskId);

    return NextResponse.json({
      success: true,
      message: '任务已取消',
    });

  } catch (error) {
    console.error('取消任务失败:', error);
    return NextResponse.json(
      { error: '取消任务失败' },
      { status: 500 }
    );
  }
}

/**
 * 重试失败的同步任务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      );
    }

    // 重试任务
    await syncManager.retryTask(taskId);

    return NextResponse.json({
      success: true,
      message: '任务已重新加入队列',
    });

  } catch (error) {
    console.error('重试任务失败:', error);
    return NextResponse.json(
      { error: '重试任务失败' },
      { status: 500 }
    );
  }
}
