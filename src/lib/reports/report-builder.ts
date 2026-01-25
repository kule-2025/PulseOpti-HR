/**
 * 自定义报表生成器
 * 提供报表设计、数据查询、渲染、导出等功能
 */

import { db } from '@/lib/db';
import { sql, eq, and, desc, asc, gte, lte, like } from 'drizzle-orm';
import { users, employees, attendanceRecords, performanceRecords, candidates, interviews } from '@/storage/database/shared/schema';

export interface ReportDataSource {
  id: string;
  name: string;
  table: string;
  fields: ReportField[];
  filters?: ReportFilter[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

export interface ReportField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  aggregate?: 'count' | 'sum' | 'avg' | 'max' | 'min' | 'none';
  format?: string;
  visible?: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  xAxis?: string;
  yAxis?: string[];
  series?: string;
  aggregation?: 'sum' | 'avg' | 'count';
}

export interface ReportLayout {
  columns: number;
  widgets: ReportWidget[];
}

export interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

export interface ReportDefinition {
  id?: string;
  name: string;
  description?: string;
  dataSource: ReportDataSource;
  charts: ReportChart[];
  layout?: ReportLayout;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    recipients?: string[];
  };
  permissions?: {
    view: string[];
    edit: string[];
  };
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  summary?: Record<string, any>;
  metadata?: {
    totalRows: number;
    executionTime: number;
  };
}

export interface ReportExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'html';
  includeCharts?: boolean;
  includeSummary?: boolean;
  filename?: string;
}

export class ReportBuilder {
  /**
   * 查询报表数据
   */
  async queryData(dataSource: ReportDataSource): Promise<ReportData> {
    const startTime = Date.now();

    // 构建查询
    let query: any;
    let table: any;

    // 根据表名选择对应的表
    switch (dataSource.table) {
      case 'users':
        table = users;
        break;
      case 'employees':
        table = employees;
        break;
      case 'attendance':
        table = attendance;
        break;
      case 'performance':
        table = performance;
        break;
      case 'recruitment':
        table = recruitment;
        break;
      case 'interviews':
        table = interviews;
        break;
      default:
        throw new Error(`不支持的数据表: ${dataSource.table}`);
    }

    // 基础查询
    const fields = dataSource.fields
      .filter(f => f.visible !== false)
      .map(f => {
        if (f.aggregate && f.aggregate !== 'none') {
          return sql`${sql.raw(f.aggregate)}(${sql.identifier(f.name)}) as ${sql.identifier(f.name)}`;
        }
        return sql.identifier(f.name);
      });

    query = db.select({ fields: fields }).from(table);

    // 应用过滤器
    if (dataSource.filters && dataSource.filters.length > 0) {
      for (const filter of dataSource.filters) {
        const condition = this.buildFilterCondition(filter);
        query = query.where(condition);
      }
    }

    // 分组
    if (dataSource.groupBy && dataSource.groupBy.length > 0) {
      query = query.groupBy(...dataSource.groupBy.map(g => sql.identifier(g)));
    }

    // 排序
    if (dataSource.orderBy && dataSource.orderBy.length > 0) {
      for (const order of dataSource.orderBy) {
        const column = sql.identifier(order.field);
        query = order.direction === 'asc'
          ? query.orderBy(asc(column))
          : query.orderBy(desc(column));
      }
    }

    // 限制
    if (dataSource.limit) {
      query = query.limit(dataSource.limit);
    }

    // 执行查询
    const result = await query;

    // 处理结果
    const headers = dataSource.fields
      .filter(f => f.visible !== false)
      .map(f => f.label);

    const rows = result.map((row: any) =>
      dataSource.fields
        .filter(f => f.visible !== false)
        .map(f => this.formatValue(row[f.name], f))
    );

    // 计算汇总
    const summary = this.calculateSummary(rows, dataSource.fields);

    return {
      headers,
      rows,
      summary,
      metadata: {
        totalRows: rows.length,
        executionTime: Date.now() - startTime,
      },
    };
  }

  /**
   * 生成报表
   */
  async generateReport(definition: ReportDefinition): Promise<{
    data: ReportData;
    charts: any[];
    summary: string;
  }> {
    // 查询数据
    const data = await this.queryData(definition.dataSource);

    // 生成图表数据
    const charts = this.generateCharts(data, definition.charts);

    // 生成汇总
    const summary = this.generateSummary(data, definition);

    return {
      data,
      charts,
      summary,
    };
  }

  /**
   * 导出报表
   */
  async exportReport(
    definition: ReportDefinition,
    options: ReportExportOptions
  ): Promise<Blob> {
    const { data, charts, summary } = await this.generateReport(definition);

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'html':
        return this.exportToHTML(data, charts, summary, options);
      case 'xlsx':
      case 'pdf':
        // TODO: 实现更多导出格式
        throw new Error(`暂不支持导出格式: ${options.format}`);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 保存报表定义
   */
  async saveReport(definition: ReportDefinition, userId: string): Promise<ReportDefinition> {
    // TODO: 实现报表保存到数据库
    const now = new Date();
    return {
      ...definition,
      id: definition.id || `report-${Date.now()}`,
      createdBy: userId,
      createdAt: definition.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * 获取报表模板
   */
  getReportTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    definition: ReportDefinition;
  }> {
    return [
      {
        id: 'template-employee-stats',
        name: '员工统计报表',
        description: '员工数量、部门分布、入职趋势等',
        category: '人力资源',
        definition: {
          name: '员工统计报表',
          dataSource: {
            id: 'ds-employees',
            name: '员工数据',
            table: 'employees',
            fields: [
              { name: 'id', label: '员工ID', type: 'number', aggregate: 'count' },
              { name: 'department', label: '部门', type: 'string' },
              { name: 'position', label: '职位', type: 'string' },
              { name: 'status', label: '状态', type: 'enum' },
            ],
            groupBy: ['department'],
            orderBy: [{ field: 'id', direction: 'desc' }],
          },
          charts: [
            {
              type: 'bar',
              title: '各部门员工数量',
              xAxis: 'department',
              yAxis: ['id'],
              aggregation: 'count',
            },
          ],
        },
      },
      {
        id: 'template-performance-stats',
        name: '绩效分析报表',
        description: '员工绩效分布、部门对比等',
        category: '绩效管理',
        definition: {
          name: '绩效分析报表',
          dataSource: {
            id: 'ds-performance',
            name: '绩效数据',
            table: 'performance',
            fields: [
              { name: 'score', label: '绩效分数', type: 'number', aggregate: 'avg' },
              { name: 'department', label: '部门', type: 'string' },
              { name: 'period', label: '考核周期', type: 'string' },
            ],
            groupBy: ['department'],
            orderBy: [{ field: 'score', direction: 'desc' }],
          },
          charts: [
            {
              type: 'bar',
              title: '各部门平均绩效',
              xAxis: 'department',
              yAxis: ['score'],
              aggregation: 'avg',
            },
          ],
        },
      },
      {
        id: 'template-recruitment-stats',
        name: '招聘漏斗报表',
        description: '招聘各阶段转化率分析',
        category: '招聘管理',
        definition: {
          name: '招聘漏斗报表',
          dataSource: {
            id: 'ds-recruitment',
            name: '招聘数据',
            table: 'recruitment',
            fields: [
              { name: 'id', label: '数量', type: 'number', aggregate: 'count' },
              { name: 'status', label: '状态', type: 'enum' },
              { name: 'position', label: '职位', type: 'string' },
            ],
            groupBy: ['status'],
            orderBy: [{ field: 'status', direction: 'asc' }],
          },
          charts: [
            {
              type: 'funnel',
              title: '招聘转化漏斗',
              xAxis: 'status',
              yAxis: ['id'],
              aggregation: 'count',
            },
          ],
        },
      },
      {
        id: 'template-attendance-stats',
        name: '考勤统计报表',
        description: '出勤率、迟到早退统计等',
        category: '考勤管理',
        definition: {
          name: '考勤统计报表',
          dataSource: {
            id: 'ds-attendance',
            name: '考勤数据',
            table: 'attendance',
            fields: [
              { name: 'status', label: '考勤状态', type: 'enum' },
              { name: 'date', label: '日期', type: 'date' },
              { name: 'employeeId', label: '员工ID', type: 'number', aggregate: 'count' },
            ],
            groupBy: ['status'],
            orderBy: [{ field: 'status', direction: 'asc' }],
          },
          charts: [
            {
              type: 'pie',
              title: '考勤状态分布',
              xAxis: 'status',
              yAxis: ['employeeId'],
              aggregation: 'count',
            },
          ],
        },
      },
    ];
  }

  // ==================== 私有方法 ====================

  private buildFilterCondition(filter: ReportFilter): any {
    const column = sql.identifier(filter.field);

    switch (filter.operator) {
      case 'eq':
        return eq(column, filter.value);
      case 'neq':
        return sql`${column} != ${filter.value}`;
      case 'gt':
        return sql`${column} > ${filter.value}`;
      case 'gte':
        return sql`${column} >= ${filter.value}`;
      case 'lt':
        return sql`${column} < ${filter.value}`;
      case 'lte':
        return sql`${column} <= ${filter.value}`;
      case 'like':
        return like(column, filter.value);
      case 'in':
        return sql`${column} = ANY(${filter.value})`;
      case 'between':
        return and(
          gte(column, filter.value[0]),
          lte(column, filter.value[1])
        );
      default:
        throw new Error(`不支持的操作符: ${filter.operator}`);
    }
  }

  private formatValue(value: any, field: ReportField): any {
    if (value === null || value === undefined) {
      return '';
    }

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString('zh-CN');
      case 'number':
        return field.format ? parseFloat(value).toFixed(parseInt(field.format)) : value;
      default:
        return value;
    }
  }

  private calculateSummary(rows: any[][], fields: ReportField[]): Record<string, any> {
    const summary: Record<string, any> = {};

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.type !== 'number') continue;

      const values = rows.map(row => parseFloat(row[i]) || 0).filter(v => !isNaN(v));

      if (values.length === 0) continue;

      summary[`${field.name}_sum`] = values.reduce((a, b) => a + b, 0);
      summary[`${field.name}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
      summary[`${field.name}_max`] = Math.max(...values);
      summary[`${field.name}_min`] = Math.min(...values);
      summary[`${field.name}_count`] = values.length;
    }

    return summary;
  }

  private generateCharts(data: ReportData, chartDefinitions: ReportChart[]): any[] {
    return chartDefinitions.map(chart => {
      const chartData = {
        type: chart.type,
        title: chart.title,
        data: {
          labels: data.rows.map(row => row[0]),
          datasets: chart.yAxis?.map((y, index) => ({
            label: y,
            data: data.rows.map(row => row[index + 1]),
            backgroundColor: this.getChartColor(index),
            borderColor: this.getChartColor(index, true),
          })) || [],
        },
      };

      return chartData;
    });
  }

  private generateSummary(data: ReportData, definition: ReportDefinition): string {
    const { summary, metadata } = data;

    let text = `报表生成时间：${new Date().toLocaleString('zh-CN')}\n`;
    text += `数据总行数：${metadata.totalRows}\n`;
    text += `查询耗时：${metadata.executionTime}ms\n\n`;

    if (summary && Object.keys(summary).length > 0) {
      text += '数据汇总：\n';
      for (const [key, value] of Object.entries(summary)) {
        text += `  ${key}: ${value}\n`;
      }
    }

    return text;
  }

  private exportToCSV(data: ReportData, options: ReportExportOptions): Blob {
    const { headers, rows } = data;

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  private exportToHTML(
    data: ReportData,
    charts: any[],
    summary: string,
    options: ReportExportOptions
  ): Blob {
    const { headers, rows } = data;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>报表导出</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .summary { background: #f9f9f9; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>报表导出</h1>
  <div class="summary">
    <pre>${summary}</pre>
  </div>
  <h2>数据表格</h2>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

    return new Blob([html], { type: 'text/html;charset=utf-8;' });
  }

  private getChartColor(index: number, isBorder: boolean = false): string {
    const colors = [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ];

    const color = colors[index % colors.length];
    return isBorder ? color.replace('1)', '1)') : color.replace('1)', '0.6)');
  }
}

// 导出单例
export const reportBuilder = new ReportBuilder();
