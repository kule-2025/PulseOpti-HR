import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { syncTasks, syncLogs } from '@/storage/database/shared/schema';
import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { syncManager } from '@/lib/sync-manager';
import { randomUUID } from 'crypto';

/**
 * 创建同步任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, source, priority, scheduledFor } = body;

    // 验证必填字段
    if (!type || !source) {
      return NextResponse.json(
        { error: '缺少必填字段: type, source' },
        { status: 400 }
      );
    }

    // 创建同步任务
    const taskId = await syncManager.createTask({
      type: type as 'full' | 'incremental' | 'realtime',
      source: source as 'user' | 'department' | 'position' | 'employee' | 'all',
      priority: priority || 5,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    // 如果是立即执行，触发任务执行
    if (!scheduledFor) {
      // 异步执行，不等待结果
      syncManager.executeTask(taskId).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: '同步任务创建成功',
      data: { taskId },
    });

  } catch (error) {
    console.error('创建同步任务失败:', error);
    return NextResponse.json(
      { error: '创建同步任务失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取同步任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();

    // 构建查询条件
    const conditions = [];

    if (status) {
      conditions.push(eq(syncTasks.status, status));
    } else {
      // 默认只查询待执行和执行中的任务
      conditions.push(
        and(
          or(eq(syncTasks.status, 'pending'), eq(syncTasks.status, 'running')),
          isNull(syncTasks.scheduledFor)
        )
      );
    }

    // 查询任务列表
    const taskList = await db
      .select()
      .from(syncTasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(syncTasks.priority), desc(syncTasks.createdAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: taskList,
    });

  } catch (error) {
    console.error('获取同步任务失败:', error);
    return NextResponse.json(
      { error: '获取同步任务失败' },
      { status: 500 }
    );
  }
}
