import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employees, jobs, candidates, interviews, performanceRecords, departments, positions } from '@/storage/database/shared/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

/**
 * 获取统计分析仪表盘数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. 员工统计
    const employeeStats = await db
      .select({
        total: sql<number>`count(*)`.as('total'),
        active: sql<number>`count(*) filter (where ${employees.employmentStatus} = 'active')`.as('active'),
        probation: sql<number>`count(*) filter (where ${employees.employmentStatus} = 'probation')`.as('probation'),
        resigned: sql<number>`count(*) filter (where ${employees.employmentStatus} = 'resigned')`.as('resigned'),
        terminated: sql<number>`count(*) filter (where ${employees.employmentStatus} = 'terminated')`.as('terminated'),
        avgSalary: sql<number>`avg(${employees.salary})`.as('avgSalary'),
      })
      .from(employees)
      .where(eq(employees.companyId, companyId))
      .then(results => results[0]);

    // 2. 招聘统计
    const recruitmentStats = await db
      .select({
        totalJobs: sql<number>`count(*)`.as('totalJobs'),
        openJobs: sql<number>`count(*) filter (where ${jobs.status} = 'open')`.as('openJobs'),
        closedJobs: sql<number>`count(*) filter (where ${jobs.status} = 'closed')`.as('closedJobs'),
        totalCandidates: sql<number>`(select count(*) from ${candidates} where ${candidates.companyId} = ${companyId})`.as('totalCandidates'),
        totalInterviews: sql<number>`(select count(*) from ${interviews} where ${interviews.companyId} = ${companyId})`.as('totalInterviews'),
      })
      .from(jobs)
      .where(eq(jobs.companyId, companyId))
      .then(results => results[0]);

    // 3. 绩效统计
    const performanceStats = await db
      .select({
        totalCycles: sql<number>`(select count(*) from ${performanceRecords} where ${performanceRecords.companyId} = ${companyId})`.as('totalCycles'),
        completedRecords: sql<number>`count(*) filter (where ${performanceRecords.status} = 'completed')`.as('completedRecords'),
        pendingRecords: sql<number>`count(*) filter (where ${performanceRecords.status} = 'pending')`.as('pendingRecords'),
        avgScore: sql<number>`avg(${performanceRecords.finalScore})`.as('avgScore'),
        maxScore: sql<number>`max(${performanceRecords.finalScore})`.as('maxScore'),
        minScore: sql<number>`min(${performanceRecords.finalScore})`.as('minScore'),
      })
      .from(performanceRecords)
      .where(eq(performanceRecords.companyId, companyId))
      .then(results => results[0]);

    // 4. 部门统计
    const departmentStats = await db
      .select({
        departmentId: departments.id,
        departmentName: departments.name,
        employeeCount: sql<number>`count(*)`.as('employeeCount'),
        avgSalary: sql<number>`avg(${employees.salary})`.as('avgSalary'),
      })
      .from(departments)
      .leftJoin(employees, and(
        eq(employees.departmentId, departments.id),
        eq(employees.employmentStatus, 'active')
      ))
      .where(eq(departments.companyId, companyId))
      .groupBy(departments.id, departments.name)
      .orderBy(sql<number>`count(*) desc`);

    // 5. 职位分布统计
    const positionStats = await db
      .select({
        positionId: positions.id,
        positionName: positions.name,
        employeeCount: sql<number>`count(*)`.as('employeeCount'),
      })
      .from(positions)
      .leftJoin(employees, and(
        eq(employees.positionId, positions.id),
        eq(employees.employmentStatus, 'active')
      ))
      .where(eq(positions.companyId, companyId))
      .groupBy(positions.id, positions.name)
      .orderBy(sql<number>`count(*) desc`);

    // 6. 员工入职趋势（最近12个月）
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const hireTrend = await db
      .select({
        month: sql<string>`to_char(${employees.hireDate}, 'YYYY-MM')`.as('month'),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(employees)
      .where(and(
        eq(employees.companyId, companyId),
        gte(employees.hireDate, twelveMonthsAgo)
      ))
      .groupBy(sql<string>`to_char(${employees.hireDate}, 'YYYY-MM')`)
      .orderBy(sql<string>`to_char(${employees.hireDate}, 'YYYY-MM')`);

    // 7. 汇总数据
    const summary = {
      totalEmployees: employeeStats?.total || 0,
      activeEmployees: employeeStats?.active || 0,
      probationEmployees: employeeStats?.probation || 0,
      resignedEmployees: employeeStats?.resigned || 0,
      terminatedEmployees: employeeStats?.terminated || 0,
      totalJobs: recruitmentStats?.totalJobs || 0,
      openJobs: recruitmentStats?.openJobs || 0,
      totalCandidates: recruitmentStats?.totalCandidates || 0,
      totalInterviews: recruitmentStats?.totalInterviews || 0,
      completedPerformanceRecords: performanceStats?.completedRecords || 0,
      pendingPerformanceRecords: performanceStats?.pendingRecords || 0,
      avgPerformanceScore: performanceStats?.avgScore || 0,
      avgSalary: employeeStats?.avgSalary || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        employeeStats,
        recruitmentStats,
        performanceStats,
        departmentStats,
        positionStats,
        hireTrend,
      },
    });

  } catch (error) {
    console.error('获取统计分析数据失败:', error);
    return NextResponse.json(
      { error: '获取统计分析数据失败' },
      { status: 500 }
    );
  }
}
