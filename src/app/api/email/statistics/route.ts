import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { emailStatistics, smtpConfigs, emailTemplates, emailLogs, companies } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';
import { sql } from 'drizzle-orm';

// 验证JWT
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  try {
    const payload = await verifyJWT(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET - 获取邮件统计数据
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const periodValue = searchParams.get('periodValue') || new Date().toISOString().split('T')[0];
    const configId = searchParams.get('configId');
    const templateId = searchParams.get('templateId');

    const db = await getDb();

    let whereConditions: any[] = [];

    // 非超管只能查看自己企业的统计
    if (payload.userType !== 'super_admin') {
      whereConditions.push(eq(emailStatistics.companyId, payload.companyId || ''));
    }

    whereConditions.push(eq(emailStatistics.period, period));
    whereConditions.push(eq(emailStatistics.periodValue, periodValue));

    if (configId) {
      whereConditions.push(eq(emailStatistics.configId, configId));
    }

    if (templateId) {
      whereConditions.push(eq(emailStatistics.templateId, templateId));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 查询统计数据
    const stats = await db
      .select({
        id: emailStatistics.id,
        companyId: emailStatistics.companyId,
        configId: emailStatistics.configId,
        templateId: emailStatistics.templateId,
        period: emailStatistics.period,
        periodValue: emailStatistics.periodValue,
        totalCount: emailStatistics.totalCount,
        successCount: emailStatistics.successCount,
        failedCount: emailStatistics.failedCount,
        openedCount: emailStatistics.openedCount,
        clickedCount: emailStatistics.clickedCount,
        bouncedCount: emailStatistics.bouncedCount,
        openRate: emailStatistics.openRate,
        clickRate: emailStatistics.clickRate,
        bounceRate: emailStatistics.bounceRate,
        createdAt: emailStatistics.createdAt,
        updatedAt: emailStatistics.updatedAt,
        configName: smtpConfigs.name,
        configProvider: smtpConfigs.provider,
        templateName: emailTemplates.name,
        templateCode: emailTemplates.code,
        companyName: companies.name,
      })
      .from(emailStatistics)
      .leftJoin(smtpConfigs, eq(emailStatistics.configId, smtpConfigs.id))
      .leftJoin(emailTemplates, eq(emailStatistics.templateId, emailTemplates.id))
      .leftJoin(companies, eq(emailStatistics.companyId, companies.id))
      .where(where)
      .orderBy(desc(emailStatistics.createdAt));

    // 查询总体统计
    let overallWhereConditions: any[] = [];

    if (payload.userType !== 'super_admin') {
      overallWhereConditions.push(eq(emailLogs.companyId, payload.companyId || ''));
    }

    if (period === 'daily') {
      overallWhereConditions.push(sql`DATE(email_logs.created_at) = ${periodValue}`);
    } else if (period === 'monthly') {
      overallWhereConditions.push(
        sql`TO_CHAR(email_logs.created_at, 'YYYY-MM') = ${periodValue}`
      );
    }

    if (configId) {
      overallWhereConditions.push(eq(emailLogs.configId, configId));
    }

    if (templateId) {
      overallWhereConditions.push(eq(emailLogs.templateId, templateId));
    }

    const overallWhere = overallWhereConditions.length > 0 ? and(...overallWhereConditions) : undefined;

    const overallStats = await db
      .select({
        totalCount: sql<number>`count(*)`,
        successCount: sql<number>`count(*) FILTER (WHERE status = 'success')`,
        failedCount: sql<number>`count(*) FILTER (WHERE status = 'failed' OR status = 'bounced')`,
        openedCount: sql<number>`count(*) FILTER (WHERE opened_at IS NOT NULL)`,
        clickedCount: sql<number>`count(*) FILTER (WHERE clicked_at IS NOT NULL)`,
        bouncedCount: sql<number>`count(*) FILTER (WHERE status = 'bounced')`,
      })
      .from(emailLogs)
      .where(overallWhere);

    const overall = overallStats[0] || {
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
    };

    // 计算比率
    const successRate = overall.totalCount > 0
      ? Math.round((overall.successCount / overall.totalCount) * 100)
      : 0;
    const openRate = overall.successCount > 0
      ? Math.round((overall.openedCount / overall.successCount) * 100)
      : 0;
    const clickRate = overall.openedCount > 0
      ? Math.round((overall.clickedCount / overall.openedCount) * 100)
      : 0;
    const bounceRate = overall.totalCount > 0
      ? Math.round((overall.bouncedCount / overall.totalCount) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: stats,
      overall: {
        ...overall,
        successRate,
        openRate,
        clickRate,
        bounceRate,
      },
    });
  } catch (error) {
    console.error('获取邮件统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
