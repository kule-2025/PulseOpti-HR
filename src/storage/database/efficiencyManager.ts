import { getDb } from '@/lib/db';
import {
  efficiencyMetrics,
  efficiencySnapshots,
  efficiencyAlertRules,
  efficiencyAlerts,
  employees,
  jobs,
  candidates,
  interviews,
  performanceRecords,
  companies,
} from './shared/schema';
import { eq, and, sql, between, gte, lte, desc, count, avg } from 'drizzle-orm';
import { pgTable, serial, text, integer, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

type EfficiencyAlerts = InferSelectModel<typeof efficiencyAlerts>;

export interface MetricCalculationResult {
  code: string;
  name: string;
  value: number;
  unit: string;
  changeRate?: string;
  benchmark?: number;
}

export interface EfficiencyDashboardData {
  keyMetrics: MetricCalculationResult[];
  trendData: {
    period: string;
    metrics: Record<string, number>;
  }[];
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  departmentComparison: {
    departmentName: string;
    metrics: Record<string, number>;
  }[];
}

export class EfficiencyManager {
  /**
   * 初始化人效指标配置
   */
  static async initMetrics() {
    const db = await getDb();

    const defaultMetrics = [
      // 生产力指标
      {
        code: 'revenue_per_employee',
        name: '人均产值',
        category: 'productivity',
        description: '企业营业收入与员工总数的比值，衡量员工创造价值的效率',
        formula: 'total_revenue / total_employees',
        unit: '元',
        dataType: 'currency',
        isKey: true,
        benchmark: { industry: { tech: 500000, service: 300000, retail: 200000 } },
        weight: 10,
      },
      {
        code: 'profit_per_employee',
        name: '人均利润',
        category: 'productivity',
        description: '企业利润与员工总数的比值',
        formula: 'total_profit / total_employees',
        unit: '元',
        dataType: 'currency',
        isKey: true,
        weight: 8,
      },
      {
        code: 'projects_per_employee',
        name: '人均项目数',
        category: 'productivity',
        description: '平均每位员工参与的项目数量',
        formula: 'total_projects / total_employees',
        unit: '个',
        dataType: 'number',
        weight: 5,
      },
      // 成本指标
      {
        code: 'labor_cost_ratio',
        name: '人力成本占比',
        category: 'cost',
        description: '人力成本占总成本的比例',
        formula: 'total_labor_cost / total_cost',
        unit: '%',
        dataType: 'percentage',
        isKey: true,
        benchmark: { industry: { avg: 30, good: 25, excellent: 20 } },
        weight: 7,
      },
      {
        code: 'training_cost_per_employee',
        name: '人均培训成本',
        category: 'cost',
        description: '培训总成本与员工总数的比值',
        formula: 'total_training_cost / total_employees',
        unit: '元',
        dataType: 'currency',
        weight: 4,
      },
      // 留存指标
      {
        code: 'turnover_rate',
        name: '员工离职率',
        category: 'retention',
        description: '一定时期内离职员工数占员工总数的比例',
        formula: 'resigned_employees / total_employees * 100',
        unit: '%',
        dataType: 'percentage',
        isKey: true,
        benchmark: { industry: { low: 5, medium: 10, high: 15 } },
        weight: 9,
      },
      {
        code: 'new_hire_retention_rate',
        name: '新员工留存率',
        category: 'retention',
        description: '新入职员工在试用期后仍在职的比例',
        formula: 'retained_new_hires / total_new_hires * 100',
        unit: '%',
        dataType: 'percentage',
        weight: 6,
      },
      {
        code: 'avg_tenure',
        name: '平均司龄',
        category: 'retention',
        description: '员工平均在公司工作的时长',
        formula: 'sum(tenure) / total_employees',
        unit: '月',
        dataType: 'number',
        weight: 5,
      },
      // 增长指标
      {
        code: 'headcount_growth',
        name: '人员增长率',
        category: 'growth',
        description: '员工总数增长情况',
        formula: '(current_employees - previous_employees) / previous_employees * 100',
        unit: '%',
        dataType: 'percentage',
        isKey: true,
        weight: 8,
      },
      {
        code: 'revenue_growth',
        name: '收入增长率',
        category: 'growth',
        description: '营业收入增长情况',
        formula: '(current_revenue - previous_revenue) / previous_revenue * 100',
        unit: '%',
        dataType: 'percentage',
        weight: 10,
      },
    ];

    for (const metric of defaultMetrics) {
      await db.insert(efficiencyMetrics).values(metric).onConflictDoNothing();
    }
  }

  /**
   * 计算企业各项人效指标
   */
  static async calculateMetrics(companyId: string): Promise<MetricCalculationResult[]> {
    const db = await getDb();

    const results: MetricCalculationResult[] = [];

    // 获取指标配置
    const metricsConfig = await db.select().from(efficiencyMetrics).where(eq(efficiencyMetrics.isActive, true));

    for (const metric of metricsConfig) {
      try {
        const value = await this.calculateMetricValue(companyId, metric.code);
        const benchmark = metric.benchmark as any;

        results.push({
          code: metric.code,
          name: metric.name || '',
          value,
          unit: metric.unit || '',
          benchmark: benchmark?.avg || benchmark?.industry?.avg,
        });
      } catch (error) {
        console.error(`计算指标 ${metric.code} 失败:`, error);
      }
    }

    return results;
  }

  /**
   * 计算单个指标值
   */
  private static async calculateMetricValue(companyId: string, metricCode: string): Promise<number> {
    const db = await getDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (metricCode) {
      case 'revenue_per_employee': {
        // 示例：人均产值（实际应从业务系统获取收入数据）
        const totalRevenue = 8500000; // 示例数据：850万元
        const [employeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));
        return Math.round(totalRevenue / (employeeCount.count || 1));
      }

      case 'turnover_rate': {
        // 离职率（最近12个月）
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

        const [resignedCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'resigned'),
            gte(employees.updatedAt, twelveMonthsAgo)
          ));

        const [totalEmployees] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(eq(employees.companyId, companyId));

        const total = totalEmployees.count || 1;
        return Number(((resignedCount.count / total) * 100).toFixed(1));
      }

      case 'headcount_growth': {
        // 人员增长率（较上月）
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));

        const [lastMonthCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active'),
            between(employees.hireDate, startOfLastMonth, endOfLastMonth)
          ));

        const lastMonthTotal = lastMonthCount.count || 1;
        const growthRate = ((currentCount.count - lastMonthTotal) / lastMonthTotal) * 100;
        return Number(growthRate.toFixed(1));
      }

      case 'avg_tenure': {
        // 平均司龄（月）
        const employeeList = await db
          .select({
            hireDate: employees.hireDate,
          })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));

        if (employeeList.length === 0) return 0;

        const totalMonths = employeeList.reduce((sum, emp) => {
          const months = (now.getTime() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
          return sum + months;
        }, 0);

        return Number((totalMonths / employeeList.length).toFixed(1));
      }

      case 'projects_per_employee': {
        // 人均项目数（示例数据）
        const totalProjects = 45; // 示例数据
        const [employeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));

        return Number((totalProjects / (employeeCount.count || 1)).toFixed(1));
      }

      case 'labor_cost_ratio': {
        // 人力成本占比（示例）
        const totalLaborCost = 1200000; // 示例：120万
        const totalCost = 4000000; // 示例：400万
        return Number(((totalLaborCost / totalCost) * 100).toFixed(1));
      }

      case 'profit_per_employee': {
        // 人均利润
        const totalProfit = 2100000; // 示例：210万
        const [employeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));

        return Math.round(totalProfit / (employeeCount.count || 1));
      }

      case 'new_hire_retention_rate': {
        // 新员工留存率（3个月以上）
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const [newHiresCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            lte(employees.hireDate, threeMonthsAgo)
          ));

        const [retainedCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            lte(employees.hireDate, threeMonthsAgo),
            eq(employees.employmentStatus, 'active')
          ));

        const totalNewHires = newHiresCount.count || 1;
        return Number(((retainedCount.count / totalNewHires) * 100).toFixed(1));
      }

      case 'revenue_growth': {
        // 收入增长率（示例）
        return 15.3; // 示例数据
      }

      case 'training_cost_per_employee': {
        // 人均培训成本
        const totalTrainingCost = 85000; // 示例：8.5万
        const [employeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employees)
          .where(and(
            eq(employees.companyId, companyId),
            eq(employees.employmentStatus, 'active')
          ));

        return Math.round(totalTrainingCost / (employeeCount.count || 1));
      }

      default:
        return 0;
    }
  }

  /**
   * 保存人效数据快照
   */
  static async saveSnapshot(companyId: string, periodType: string, period: string, data: Record<string, number>) {
    const db = await getDb();

    await db.insert(efficiencySnapshots).values({
      companyId,
      periodType,
      period,
      data: data as any,
    });
  }

  /**
   * 获取历史趋势数据
   */
  static async getTrendData(companyId: string, metricCodes: string[], months: number = 12): Promise<{ period: string; metrics: Record<string, number> }[]> {
    const db = await getDb();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const snapshots = await db
      .select()
      .from(efficiencySnapshots)
      .where(and(
        eq(efficiencySnapshots.companyId, companyId),
        eq(efficiencySnapshots.periodType, 'monthly'),
        gte(efficiencySnapshots.createdAt, startDate)
      ))
      .orderBy(efficiencySnapshots.period)
      .limit(months);

    return snapshots.map(snap => ({
      period: snap.period,
      metrics: (snap.data as Record<string, number>) || {},
    }));
  }

  /**
   * 检查并生成预警
   */
  static async checkAlerts(companyId: string) {
    const db = await getDb();

    // 获取活跃的预警规则
    const rules = await db
      .select()
      .from(efficiencyAlertRules)
      .where(and(
        eq(efficiencyAlertRules.companyId, companyId),
        eq(efficiencyAlertRules.isActive, true)
      ));

    const newAlerts: Partial<EfficiencyAlerts>[] = [];

    for (const rule of rules) {
      try {
        const currentValue = await this.calculateMetricValue(companyId, rule.metricCode);
        let shouldAlert = false;

        switch (rule.condition) {
          case 'greater_than':
            shouldAlert = currentValue > rule.threshold;
            break;
          case 'less_than':
            shouldAlert = currentValue < rule.threshold;
            break;
          case 'equals':
            shouldAlert = currentValue === rule.threshold;
            break;
        }

        if (shouldAlert) {
          const alert = await db.insert(efficiencyAlerts).values({
            companyId: rule.companyId,
            ruleId: rule.id,
            metricCode: rule.metricCode,
            period: new Date().toISOString().slice(0, 7),
            currentValue,
            threshold: rule.threshold,
            severity: rule.severity,
            message: `指标"${rule.metricCode}"当前值为${currentValue}${rule.condition === 'greater_than' ? '超过' : '低于'}阈值${rule.threshold}`,
          }).returning();

          newAlerts.push(alert[0]);
        }
      } catch (error) {
        console.error(`检查预警规则 ${rule.id} 失败:`, error);
      }
    }

    return newAlerts;
  }

  /**
   * 获取企业人效仪表盘数据
   */
  static async getDashboardData(companyId: string): Promise<EfficiencyDashboardData> {
    // 计算关键指标
    const keyMetrics = await this.calculateMetrics(companyId);

    // 获取趋势数据（最近12个月）
    const metricCodes = keyMetrics.map(m => m.code);
    const trendData = await this.getTrendData(companyId, metricCodes, 12);

    // 获取预警统计
    const db = await getDb();
    const [alerts] = await db
      .select({
        critical: sql<number>`COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'pending')`,
        warning: sql<number>`COUNT(*) FILTER (WHERE severity = 'warning' AND status = 'pending')`,
        info: sql<number>`COUNT(*) FILTER (WHERE severity = 'info' AND status = 'pending')`,
      })
      .from(efficiencyAlerts)
      .where(eq(efficiencyAlerts.companyId, companyId));

    return {
      keyMetrics,
      trendData,
      alerts: {
        critical: alerts?.critical || 0,
        warning: alerts?.warning || 0,
        info: alerts?.info || 0,
      },
      departmentComparison: [], // 可以扩展部门对比
    };
  }

  /**
   * 获取活跃预警列表
   */
  static async getActiveAlerts(companyId: string) {
    const db = await getDb();

    return await db
      .select()
      .from(efficiencyAlerts)
      .where(and(
        eq(efficiencyAlerts.companyId, companyId),
        eq(efficiencyAlerts.status, 'pending')
      ))
      .orderBy(desc(efficiencyAlerts.createdAt))
      .limit(20);
  }
}

export default EfficiencyManager;
