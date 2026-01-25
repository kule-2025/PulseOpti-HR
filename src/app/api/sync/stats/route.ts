import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { syncTasks, syncLogs } from '@/storage/database/shared/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

/**
 * 获取同步统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '24'); // 默认24小时

    const db = await getDb();
    const startTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);

    // 统计任务状态
    const taskStats = await db
      .select({
        status: syncTasks.status,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(syncTasks)
      .where(gte(syncTasks.createdAt, startTime))
      .groupBy(syncTasks.status);

    // 统计日志级别
    const logStats = await db
      .select({
        level: syncLogs.level,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(syncLogs)
      .where(and(
        gte(syncLogs.createdAt, startTime),
        eq(syncLogs.level, 'error')
      ))
      .groupBy(syncLogs.level);

    // 统计各类型同步成功率
    const typeStats = await db
      .select({
        type: syncTasks.type,
        source: syncTasks.source,
        total: sql<number>`count(*)`.as('total'),
        success: sql<number>`count(*) filter (where ${syncTasks.status} = 'completed')`.as('success'),
        failed: sql<number>`count(*) filter (where ${syncTasks.status} = 'failed')`.as('failed'),
      })
      .from(syncTasks)
      .where(gte(syncTasks.createdAt, startTime))
      .groupBy(syncTasks.type, syncTasks.source);

    // 汇总统计
    const summary = {
      totalTasks: taskStats.reduce((sum, stat) => sum + Number(stat.count), 0),
      completedTasks: taskStats.find(s => s.status === 'completed')?.count || 0,
      failedTasks: taskStats.find(s => s.status === 'failed')?.count || 0,
      runningTasks: taskStats.find(s => s.status === 'running')?.count || 0,
      errorLogs: logStats.reduce((sum, stat) => sum + Number(stat.count), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        taskStats,
        logStats,
        typeStats,
      },
    });

  } catch (error) {
    console.error('获取同步统计失败:', error);
    return NextResponse.json(
      { error: '获取同步统计失败' },
      { status: 500 }
    );
  }
}
