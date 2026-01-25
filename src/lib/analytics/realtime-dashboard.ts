/**
 * 实时数据看板服务
 * 提供关键业务指标的实时监控和预警
 */

import { db } from '@/lib/db';
import { users, employees, attendanceRecords, performanceRecords, candidates, interviews, trainingRecords } from '@/storage/database/shared/schema';
import { sql, and, gte, lte, eq, desc } from 'drizzle-orm';

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // 变化率
  trend: 'up' | 'down' | 'stable';
  threshold?: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

export interface DashboardAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metricId: string;
  timestamp: Date;
  resolved?: boolean;
}

export interface RealtimeDashboard {
  id: string;
  name: string;
  metrics: Metric[];
  widgets: DashboardWidget[];
  alerts: DashboardAlert[];
  lastUpdated: Date;
}

export class RealtimeDashboardService {
  /**
   * 获取实时数据看板
   */
  async getDashboard(companyId: string): Promise<RealtimeDashboard> {
    const metrics = await this.calculateMetrics(companyId);
    const widgets = this.getWidgets(metrics);
    const alerts = this.generateAlerts(metrics);

    return {
      id: 'dashboard-main',
      name: '实时数据看板',
      metrics,
      widgets,
      alerts,
      lastUpdated: new Date(),
    };
  }

  /**
   * 计算关键指标
   */
  async calculateMetrics(companyId: string): Promise<Metric[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const metrics: Metric[] = [];

    // 1. 总员工数
    const totalEmployees = await this.calculateTotalEmployees(companyId, lastMonth, now);
    metrics.push(totalEmployees);

    // 2. 在职员工数
    const activeEmployees = await this.calculateActiveEmployees(companyId);
    metrics.push(activeEmployees);

    // 3. 今日出勤率
    const attendanceRate = await this.calculateAttendanceRate(companyId, today);
    metrics.push(attendanceRate);

    // 4. 平均绩效分数
    const avgPerformance = await this.calculateAvgPerformance(companyId, lastMonth);
    metrics.push(avgPerformance);

    // 5. 招聘中职位数
    const openPositions = await this.calculateOpenPositions(companyId);
    metrics.push(openPositions);

    // 6. 本月入职人数
    const newHires = await this.calculateNewHires(companyId, lastMonth, now);
    metrics.push(newHires);

    // 7. 本月离职人数
    const departures = await this.calculateDepartures(companyId, lastMonth, now);
    metrics.push(departures);

    // 8. 离职率
    const turnoverRate = await this.calculateTurnoverRate(companyId, lastMonth);
    metrics.push(turnoverRate);

    // 9. 待面试人数
    const pendingInterviews = await this.calculatePendingInterviews(companyId);
    metrics.push(pendingInterviews);

    // 10. 本月培训人数
    const trainedCount = await this.calculateTrainedCount(companyId, lastMonth, now);
    metrics.push(trainedCount);

    return metrics;
  }

  /**
   * 获取看板组件
   */
  getWidgets(metrics: Metric[]): DashboardWidget[] {
    return [
      // 员工统计卡片
      {
        id: 'widget-employees',
        type: 'metric',
        title: '员工统计',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metrics: ['total-employees', 'active-employees', 'new-hires', 'departures'],
        },
      },
      // 出勤率趋势图
      {
        id: 'widget-attendance',
        type: 'chart',
        title: '出勤率趋势',
        position: { x: 3, y: 0, w: 4, h: 2 },
        config: {
          chartType: 'line',
          metricId: 'attendance-rate',
          timeRange: '30d',
        },
      },
      // 绩效分布图
      {
        id: 'widget-performance',
        type: 'chart',
        title: '绩效分布',
        position: { x: 7, y: 0, w: 5, h: 2 },
        config: {
          chartType: 'bar',
          metricId: 'avg-performance',
        },
      },
      // 招聘漏斗
      {
        id: 'widget-recruitment',
        type: 'chart',
        title: '招聘漏斗',
        position: { x: 0, y: 2, w: 6, h: 2 },
        config: {
          chartType: 'funnel',
          stages: ['简历', '初筛', '面试', 'Offer', '入职'],
        },
      },
      // 离职预警列表
      {
        id: 'widget-turnover-alert',
        type: 'table',
        title: '离职预警',
        position: { x: 6, y: 2, w: 6, h: 2 },
        config: {
          columns: ['姓名', '部门', '离职风险', '原因'],
        },
      },
      // 今日待办
      {
        id: 'widget-todo',
        type: 'table',
        title: '今日待办',
        position: { x: 0, y: 4, w: 4, h: 2 },
        config: {
          columns: ['事项', '优先级', '状态'],
        },
      },
      // 待审批列表
      {
        id: 'widget-approvals',
        type: 'table',
        title: '待审批',
        position: { x: 4, y: 4, w: 4, h: 2 },
        config: {
          columns: ['类型', '申请人', '时间', '状态'],
        },
      },
      // 系统公告
      {
        id: 'widget-notifications',
        type: 'alert',
        title: '系统公告',
        position: { x: 8, y: 4, w: 4, h: 2 },
        config: {
          showLatest: 5,
        },
      },
    ];
  }

  /**
   * 生成预警
   */
  generateAlerts(metrics: Metric[]): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    for (const metric of metrics) {
      if (metric.status === 'warning') {
        alerts.push({
          id: `alert-${metric.id}-${Date.now()}`,
          level: 'warning',
          title: `${metric.name} 警告`,
          message: `${metric.name} 为 ${metric.value}${metric.unit}，已达到警告阈值`,
          metricId: metric.id,
          timestamp: new Date(),
        });
      } else if (metric.status === 'critical') {
        alerts.push({
          id: `alert-${metric.id}-${Date.now()}`,
          level: 'critical',
          title: `${metric.name} 严重警告`,
          message: `${metric.name} 为 ${metric.value}${metric.unit}，已达到严重阈值`,
          metricId: metric.id,
          timestamp: new Date(),
        });
      }
    }

    return alerts;
  }

  // ==================== 指标计算方法 ====================

  private async calculateTotalEmployees(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, companyId),
          gte(employees.joinedAt, startDate),
          lte(employees.joinedAt, endDate)
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'total-employees',
      name: '总员工数',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateActiveEmployees(companyId: string): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(and(eq(employees.companyId, companyId), eq(employees.status, 'active')));

    const value = Number(result.count);
    const metric: Metric = {
      id: 'active-employees',
      name: '在职员工数',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateAttendanceRate(companyId: string, date: Date): Promise<Metric> {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(
        and(
          sql`DATE(${attendance.date}) = DATE(${date})`
        )
      );

    const presentResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(
        and(
          sql`DATE(${attendance.date}) = DATE(${date})`,
          eq(attendance.status, 'present')
        )
      );

    const total = Number(totalResult[0]?.count || 0);
    const present = Number(presentResult[0]?.count || 0);
    const value = total > 0 ? Math.round((present / total) * 100) : 0;

    const metric: Metric = {
      id: 'attendance-rate',
      name: '今日出勤率',
      value,
      unit: '%',
      change: 0,
      trend: 'stable',
      threshold: { warning: 90, critical: 80 },
      status: value < 80 ? 'critical' : value < 90 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateAvgPerformance(companyId: string, since: Date): Promise<Metric> {
    const [result] = await db
      .select({ avg: sql<number>`AVG(score)` })
      .from(performance)
      .where(
        and(
          eq(performance.companyId, companyId),
          gte(performance.assessmentDate, since)
        )
      );

    const value = Math.round(Number(result.avg) || 0);

    const metric: Metric = {
      id: 'avg-performance',
      name: '平均绩效',
      value,
      unit: '分',
      change: 0,
      trend: 'stable',
      threshold: { warning: 70, critical: 60 },
      status: value < 60 ? 'critical' : value < 70 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateOpenPositions(companyId: string): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recruitment)
      .where(
        and(
          eq(recruitment.companyId, companyId),
          eq(recruitment.status, 'open')
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'open-positions',
      name: '招聘中职位',
      value,
      unit: '个',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateNewHires(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, companyId),
          gte(employees.joinedAt, startDate),
          lte(employees.joinedAt, endDate)
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'new-hires',
      name: '本月入职',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateDepartures(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, companyId),
          gte(employees.leftAt, startDate),
          lte(employees.leftAt, endDate)
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'departures',
      name: '本月离职',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      threshold: { warning: 5, critical: 10 },
      status: value > 10 ? 'critical' : value > 5 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateTurnoverRate(companyId: string, since: Date): Promise<Metric> {
    const [departuresResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, companyId),
          gte(employees.leftAt, since)
        )
      );

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(eq(employees.companyId, companyId));

    const departures = Number(departuresResult.count);
    const total = Number(totalResult.count);
    const value = total > 0 ? Math.round((departures / total) * 100) : 0;

    const metric: Metric = {
      id: 'turnover-rate',
      name: '离职率',
      value,
      unit: '%',
      change: 0,
      trend: 'stable',
      threshold: { warning: 10, critical: 20 },
      status: value > 20 ? 'critical' : value > 10 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculatePendingInterviews(companyId: string): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviews)
      .where(
        and(
          eq(interviews.companyId, companyId),
          eq(interviews.status, 'scheduled')
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'pending-interviews',
      name: '待面试',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }

  private async calculateTrainedCount(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Metric> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(training)
      .where(
        and(
          eq(training.companyId, companyId),
          gte(training.completedAt, startDate),
          lte(training.completedAt, endDate)
        )
      );

    const value = Number(result.count);
    const metric: Metric = {
      id: 'trained-count',
      name: '本月培训',
      value,
      unit: '人',
      change: 0,
      trend: 'stable',
      status: 'normal',
      lastUpdated: new Date(),
    };

    return metric;
  }
}

// 导出单例
export const realtimeDashboardService = new RealtimeDashboardService();
