/**
 * 短信统计数据API
 * 路径: /api/sms/statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsStatistics, smsLogs } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

/**
 * GET - 获取短信统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly, yearly
    const configId = searchParams.get('configId');
    const templateId = searchParams.get('templateId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 构建查询条件
    const conditions = [eq(smsStatistics.companyId, companyId)];

    if (period) {
      conditions.push(eq(smsStatistics.period, period));
    }

    if (configId) {
      conditions.push(eq(smsStatistics.configId, configId));
    }

    if (templateId) {
      conditions.push(eq(smsStatistics.templateId, templateId));
    }

    // 查询统计数据
    const stats = await db
      .select()
      .from(smsStatistics)
      .where(and(...conditions))
      .orderBy(desc(smsStatistics.periodValue));

    // 如果指定了日期范围，进一步过滤
    let filteredStats = stats;
    if (startDate || endDate) {
      filteredStats = stats.filter(stat => {
        if (startDate && stat.periodValue < startDate) return false;
        if (endDate && stat.periodValue > endDate) return false;
        return true;
      });
    }

    // 汇总统计数据
    const summary = {
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      totalCost: 0,
      averageSuccessRate: 0,
    };

    filteredStats.forEach(stat => {
      summary.totalCount += stat.totalCount || 0;
      summary.successCount += stat.successCount || 0;
      summary.failedCount += stat.failedCount || 0;
      summary.totalCost += stat.totalCost || 0;
    });

    if (summary.totalCount > 0) {
      summary.averageSuccessRate = Math.round((summary.successCount / summary.totalCount) * 100);
    }

    // 获取最近30天的发送趋势
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendStats = await db
      .select()
      .from(smsStatistics)
      .where(and(
        eq(smsStatistics.companyId, companyId),
        eq(smsStatistics.period, 'daily'),
        gte(smsStatistics.periodValue, thirtyDaysAgo.toISOString().split('T')[0])
      ))
      .orderBy(desc(smsStatistics.periodValue));

    // 获取今日统计数据
    const today = new Date().toISOString().split('T')[0];
    const [todayStat] = await db
      .select()
      .from(smsStatistics)
      .where(and(
        eq(smsStatistics.companyId, companyId),
        eq(smsStatistics.period, 'daily'),
        eq(smsStatistics.periodValue, today)
      ));

    // 获取本月统计数据
    const currentMonth = new Date().toISOString().slice(0, 7); // 2024-01
    const [monthStat] = await db
      .select()
      .from(smsStatistics)
      .where(and(
        eq(smsStatistics.companyId, companyId),
        eq(smsStatistics.period, 'monthly'),
        eq(smsStatistics.periodValue, currentMonth)
      ));

    return NextResponse.json({
      success: true,
      data: {
        stats: filteredStats,
        summary,
        trend: trendStats,
        today: todayStat || {
          totalCount: 0,
          successCount: 0,
          failedCount: 0,
          totalCost: 0,
          successRate: 0,
        },
        month: monthStat || {
          totalCount: 0,
          successCount: 0,
          failedCount: 0,
          totalCost: 0,
          successRate: 0,
        },
      },
    });
  } catch (error) {
    console.error('[SMS_STATISTICS] 获取统计数据失败:', error);
    return NextResponse.json(
      {
        error: '获取统计数据失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
