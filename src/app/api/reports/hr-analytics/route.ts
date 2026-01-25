import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 报表类型
enum ReportType {
  WORKFORCE_STRUCTURE = 'workforce_structure', // 人力结构
  EFFICIENCY = 'efficiency', // 人效
  TURNOVER = 'turnover', // 离职
  COMPENSATION = 'compensation', // 薪酬
  TRAINING = 'training', // 培训
}

// 时间维度
enum TimeDimension {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// 图表类型
enum ChartType {
  LINE = 'line', // 折线图
  BAR = 'bar', // 柱状图
  PIE = 'pie', // 饼图
  AREA = 'area', // 面积图
  SCATTER = 'scatter', // 散点图
  HEATMAP = 'heatmap', // 热力图
  TABLE = 'table', // 表格
  CARD = 'card', // 卡片
}

// 数据点
interface DataPoint {
  label: string;
  value: number;
  category?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// 图表数据
interface ChartData {
  type: ChartType;
  title: string;
  description?: string;
  xAxis?: {
    label: string;
    values: string[];
  };
  yAxis?: {
    label: string;
    unit?: string;
  };
  series?: Array<{
    name: string;
    data: DataPoint[];
    color?: string;
  }>;
  data?: DataPoint[];
  summary?: {
    total: number;
    average: number;
    max: number;
    min: number;
    growth?: number;
  };
}

// 报表数据
interface ReportData {
  reportType: ReportType;
  timeDimension: TimeDimension;
  period: string;
  generatedAt: Date;
  summary: Record<string, any>;
  charts: ChartData[];
  insights: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

// 人力结构报表数据
interface WorkforceStructureReport {
  departmentDistribution: ChartData;
  positionDistribution: ChartData;
  levelDistribution: ChartData;
  ageDistribution: ChartData;
  genderDistribution: ChartData;
  tenureDistribution: ChartData;
  educationDistribution: ChartData;
  locationDistribution: ChartData;
}

// 人效报表数据
interface EfficiencyReport {
  revenuePerEmployee: ChartData;
  productivityMetrics: ChartData;
  departmentEfficiency: ChartData;
  trendAnalysis: ChartData;
  performanceDistribution: ChartData;
}

// 离职报表数据
interface TurnoverReport {
  turnoverRate: ChartData;
  departmentTurnover: ChartData;
  reasonAnalysis: ChartData;
  tenureTurnover: ChartData;
  retentionRate: ChartData;
  riskAnalysis: ChartData;
}

// 薪酬报表数据
interface CompensationReport {
  salaryDistribution: ChartData;
  departmentCompensation: ChartData;
  marketComparison: ChartData;
  budgetAnalysis: ChartData;
  compensationTrend: ChartData;
}

// 培训报表数据
interface TrainingReport {
  trainingParticipation: ChartData;
  completionRate: ChartData;
  satisfactionScore: ChartData;
  trainingBudget: ChartData;
  skillProgress: ChartData;
  impactAnalysis: ChartData;
}

// 报表请求Schema
const reportRequestSchema = z.object({
  companyId: z.string(),
  reportType: z.nativeEnum(ReportType),
  timeDimension: z.nativeEnum(TimeDimension),
  period: z.string(), // 例如：2024-Q1, 2024-01, last-6-months
  includeCharts: z.boolean().default(true),
  chartTypes: z.array(z.nativeEnum(ChartType)).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  requestedBy: z.string(),
});

/**
 * POST /api/reports/hr-analytics - 生成HR分析报表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reportRequestSchema.parse(body);

    const reportData = await generateReport(validated);

    return NextResponse.json({
      success: true,
      message: '报表生成成功',
      data: reportData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('HR报表生成错误:', error);
    return NextResponse.json(
      { error: 'HR报表生成失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 生成报表
async function generateReport(validated: z.infer<typeof reportRequestSchema>): Promise<ReportData> {
  const { reportType, timeDimension, period } = validated;

  let charts: ChartData[] = [];
  let summary: Record<string, any> = {};
  let insights: string[] = [];
  let recommendations: string[] = [];

  switch (reportType) {
    case ReportType.WORKFORCE_STRUCTURE:
      const structureReport = generateWorkforceStructureReport();
      charts = Object.values(structureReport);
      summary = {
        totalEmployees: 156,
        totalDepartments: 8,
        averageAge: 32,
        averageTenure: 2.8,
        genderRatio: '60:40',
      };
      insights = [
        '员工总数持续增长，较上月增加5人',
        '技术部门占比最大，达到35%',
        '员工平均年龄32岁，呈现年轻化趋势',
        '女性员工占比提升至40%',
      ];
      recommendations = [
        '关注技术部门的人才发展',
        '继续优化年龄结构，保持活力',
        '提升女性员工的晋升机会',
      ];
      break;

    case ReportType.EFFICIENCY:
      const efficiencyReport = generateEfficiencyReport();
      charts = Object.values(efficiencyReport);
      summary = {
        revenuePerEmployee: 1250000,
        productivityIndex: 85.4,
        overallEfficiency: 'good',
        topDepartment: '技术部',
      };
      insights = [
        '人均营收125万，同比增长12%',
        '整体生产力指数85.4，处于良好水平',
        '技术部门人效最高，达到130万/人',
        '销售部门人效提升明显，增长18%',
      ];
      recommendations = [
        '保持技术部门的高人效优势',
        '推广销售部门的成功经验',
        '关注运营部门的人效提升',
      ];
      break;

    case ReportType.TURNOVER:
      const turnoverReport = generateTurnoverReport();
      charts = Object.values(turnoverReport);
      summary = {
        turnoverRate: 8.5,
        retentionRate: 91.5,
        totalDepartures: 13,
        mainReason: '职业发展',
        highestRiskDepartment: '销售部',
      };
      insights = [
        '整体离职率8.5%，低于行业平均水平',
        '职业发展是员工离职的主要原因',
        '销售部离职率略高，需重点关注',
        '1-3年员工离职率较高',
      ];
      recommendations = [
        '加强员工职业发展通道建设',
        '优化销售部门的激励机制',
        '为1-3年员工提供更多成长机会',
      ];
      break;

    case ReportType.COMPENSATION:
      const compensationReport = generateCompensationReport();
      charts = Object.values(compensationReport);
      summary = {
        averageSalary: 356000,
        budgetUtilization: 92,
        marketCompetitiveness: 'fair',
        highestPaidDepartment: '技术部',
      };
      insights = [
        '平均年薪35.6万，与市场基本持平',
        '薪酬预算利用率92%，控制良好',
        '技术部薪酬水平领先其他部门',
        '整体薪酬竞争力有待提升',
      ];
      recommendations = [
        '适当提升核心岗位薪酬竞争力',
        '优化薪酬结构，增加绩效激励',
        '关注市场薪酬变化，及时调整',
      ];
      break;

    case ReportType.TRAINING:
      const trainingReport = generateTrainingReport();
      charts = Object.values(trainingReport);
      summary = {
        participationRate: 85,
        completionRate: 78,
        averageSatisfaction: 4.5,
        trainingBudget: 150000,
        budgetUtilization: 80,
      };
      insights = [
        '培训参与率85%，表现良好',
        '培训完成率78%，还有提升空间',
        '学员满意度4.5分，培训质量高',
        '培训预算利用率80%，较为合理',
      ];
      recommendations = [
        '提高培训完成率，加强督促',
        '继续提升培训质量',
        '增加个性化培训内容',
      ];
      break;
  }

  return {
    reportType,
    timeDimension,
    period,
    generatedAt: new Date(),
    summary,
    charts,
    insights,
    recommendations,
  };
}

// 生成人力结构报表
function generateWorkforceStructureReport(): WorkforceStructureReport {
  return {
    departmentDistribution: {
      type: ChartType.PIE,
      title: '部门分布',
      description: '各部门员工人数占比',
      data: [
        { label: '技术部', value: 55, category: '技术' },
        { label: '销售部', value: 28, category: '销售' },
        { label: '产品部', value: 18, category: '产品' },
        { label: '运营部', value: 15, category: '运营' },
        { label: '市场部', value: 12, category: '市场' },
        { label: '人事部', value: 10, category: '人事' },
        { label: '财务部', value: 10, category: '财务' },
        { label: '行政部', value: 8, category: '行政' },
      ],
      summary: {
        total: 156,
        average: 19.5,
        max: 55,
        min: 8,
      },
    },
    positionDistribution: {
      type: ChartType.BAR,
      title: '职位分布',
      description: '各职位级别人数统计',
      xAxis: {
        label: '职位级别',
        values: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
      },
      yAxis: {
        label: '人数',
        unit: '人',
      },
      series: [{
        name: '人数',
        data: [
          { label: 'P1', value: 25 },
          { label: 'P2', value: 45 },
          { label: 'P3', value: 38 },
          { label: 'P4', value: 28 },
          { label: 'P5', value: 12 },
          { label: 'P6', value: 6 },
          { label: 'P7', value: 2 },
        ],
      }],
      summary: {
        total: 156,
        average: 22.3,
        max: 45,
        min: 2,
      },
    },
    levelDistribution: {
      type: ChartType.PIE,
      title: '职级分布',
      description: '员工职级分布情况',
      data: [
        { label: '初级', value: 70, category: 'junior' },
        { label: '中级', value: 58, category: 'middle' },
        { label: '高级', value: 22, category: 'senior' },
        { label: '专家', value: 6, category: 'expert' },
      ],
      summary: {
        total: 156,
        average: 39,
        max: 70,
        min: 6,
      },
    },
    ageDistribution: {
      type: ChartType.BAR,
      title: '年龄分布',
      description: '员工年龄结构',
      xAxis: {
        label: '年龄段',
        values: ['20-25', '26-30', '31-35', '36-40', '41-45', '46+'],
      },
      yAxis: {
        label: '人数',
        unit: '人',
      },
      series: [{
        name: '人数',
        data: [
          { label: '20-25', value: 35 },
          { label: '26-30', value: 55 },
          { label: '31-35', value: 38 },
          { label: '36-40', value: 18 },
          { label: '41-45', value: 7 },
          { label: '46+', value: 3 },
        ],
      }],
      summary: {
        total: 156,
        average: 26,
        max: 55,
        min: 3,
      },
    },
    genderDistribution: {
      type: ChartType.PIE,
      title: '性别分布',
      description: '员工性别比例',
      data: [
        { label: '男性', value: 94, category: 'male' },
        { label: '女性', value: 62, category: 'female' },
      ],
      summary: {
        total: 156,
        average: 78,
        max: 94,
        min: 62,
      },
    },
    tenureDistribution: {
      type: ChartType.BAR,
      title: '在职年限分布',
      description: '员工在职年限统计',
      xAxis: {
        label: '在职年限',
        values: ['<1年', '1-2年', '2-3年', '3-5年', '5-10年', '10年以上'],
      },
      yAxis: {
        label: '人数',
        unit: '人',
      },
      series: [{
        name: '人数',
        data: [
          { label: '<1年', value: 28 },
          { label: '1-2年', value: 42 },
          { label: '2-3年', value: 35 },
          { label: '3-5年', value: 32 },
          { label: '5-10年', value: 15 },
          { label: '10年以上', value: 4 },
        ],
      }],
      summary: {
        total: 156,
        average: 26,
        max: 42,
        min: 4,
      },
    },
    educationDistribution: {
      type: ChartType.PIE,
      title: '学历分布',
      description: '员工学历结构',
      data: [
        { label: '本科', value: 85, category: 'bachelor' },
        { label: '硕士', value: 58, category: 'master' },
        { label: '博士', value: 8, category: 'phd' },
        { label: '大专', value: 5, category: 'college' },
      ],
      summary: {
        total: 156,
        average: 39,
        max: 85,
        min: 5,
      },
    },
    locationDistribution: {
      type: ChartType.BAR,
      title: '办公地点分布',
      description: '各办公地点人数',
      xAxis: {
        label: '办公地点',
        values: ['北京总部', '上海分部', '深圳分部', '广州分部'],
      },
      yAxis: {
        label: '人数',
        unit: '人',
      },
      series: [{
        name: '人数',
        data: [
          { label: '北京总部', value: 85 },
          { label: '上海分部', value: 38 },
          { label: '深圳分部', value: 22 },
          { label: '广州分部', value: 11 },
        ],
      }],
      summary: {
        total: 156,
        average: 39,
        max: 85,
        min: 11,
      },
    },
  };
}

// 生成人效报表
function generateEfficiencyReport(): EfficiencyReport {
  return {
    revenuePerEmployee: {
      type: ChartType.CARD,
      title: '人均营收',
      description: '2024年人均营收指标',
      data: [
        { label: '人均营收', value: 1250000, category: 'revenue' },
      ],
      summary: {
        total: 1250000,
        average: 1250000,
        max: 1250000,
        min: 1250000,
        growth: 12,
      },
    },
    productivityMetrics: {
      type: ChartType.BAR,
      title: '生产力指标',
      description: '各部门生产力对比',
      xAxis: {
        label: '部门',
        values: ['技术部', '销售部', '产品部', '运营部', '市场部'],
      },
      yAxis: {
        label: '生产力指数',
        unit: '分',
      },
      series: [{
        name: '生产力指数',
        data: [
          { label: '技术部', value: 92 },
          { label: '销售部', value: 88 },
          { label: '产品部', value: 85 },
          { label: '运营部', value: 78 },
          { label: '市场部', value: 82 },
        ],
      }],
      summary: {
        total: 425,
        average: 85,
        max: 92,
        min: 78,
      },
    },
    departmentEfficiency: {
      type: ChartType.AREA,
      title: '部门人效趋势',
      description: '各部门人效变化趋势',
      xAxis: {
        label: '月份',
        values: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        label: '人效',
        unit: '万/人',
      },
      series: [
        {
          name: '技术部',
          data: [
            { label: '1月', value: 115 },
            { label: '2月', value: 118 },
            { label: '3月', value: 122 },
            { label: '4月', value: 125 },
            { label: '5月', value: 128 },
            { label: '6月', value: 130 },
          ],
          color: '#2563EB',
        },
        {
          name: '销售部',
          data: [
            { label: '1月', value: 105 },
            { label: '2月', value: 108 },
            { label: '3月', value: 110 },
            { label: '4月', value: 115 },
            { label: '5月', value: 118 },
            { label: '6月', value: 120 },
          ],
          color: '#7C3AED',
        },
      ],
    },
    trendAnalysis: {
      type: ChartType.LINE,
      title: '人效趋势分析',
      description: '整体人效变化趋势',
      xAxis: {
        label: '月份',
        values: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        label: '人效',
        unit: '万/人',
      },
      series: [{
        name: '人效',
        data: [
          { label: '1月', value: 112 },
          { label: '2月', value: 114 },
          { label: '3月', value: 116 },
          { label: '4月', value: 118 },
          { label: '5月', value: 120 },
          { label: '6月', value: 125 },
        ],
        color: '#2563EB',
      }],
      summary: {
        total: 705,
        average: 117.5,
        max: 125,
        min: 112,
        growth: 11.6,
      },
    },
    performanceDistribution: {
      type: ChartType.PIE,
      title: '绩效分布',
      description: '员工绩效等级分布',
      data: [
        { label: '优秀', value: 35, category: 'excellent' },
        { label: '良好', value: 62, category: 'good' },
        { label: '合格', value: 51, category: 'qualified' },
        { label: '待改进', value: 8, category: 'improvement' },
      ],
      summary: {
        total: 156,
        average: 39,
        max: 62,
        min: 8,
      },
    },
  };
}

// 生成离职报表
function generateTurnoverReport(): TurnoverReport {
  return {
    turnoverRate: {
      type: ChartType.CARD,
      title: '离职率',
      description: '2024年Q3离职率',
      data: [
        { label: '离职率', value: 8.5, category: 'turnover' },
      ],
      summary: {
        total: 8.5,
        average: 8.5,
        max: 8.5,
        min: 8.5,
      },
    },
    departmentTurnover: {
      type: ChartType.BAR,
      title: '部门离职率',
      description: '各部门离职率对比',
      xAxis: {
        label: '部门',
        values: ['销售部', '技术部', '市场部', '运营部', '产品部'],
      },
      yAxis: {
        label: '离职率',
        unit: '%',
      },
      series: [{
        name: '离职率',
        data: [
          { label: '销售部', value: 12.5 },
          { label: '技术部', value: 9.5 },
          { label: '市场部', value: 8.5 },
          { label: '运营部', value: 7.5 },
          { label: '产品部', value: 5.5 },
        ],
      }],
      summary: {
        total: 43.5,
        average: 8.7,
        max: 12.5,
        min: 5.5,
      },
    },
    reasonAnalysis: {
      type: ChartType.PIE,
      title: '离职原因分析',
      description: '员工离职主要原因',
      data: [
        { label: '职业发展', value: 35, category: 'career' },
        { label: '薪酬待遇', value: 28, category: 'compensation' },
        { label: '工作环境', value: 18, category: 'environment' },
        { label: '个人原因', value: 12, category: 'personal' },
        { label: '其他', value: 7, category: 'other' },
      ],
      summary: {
        total: 100,
        average: 20,
        max: 35,
        min: 7,
      },
    },
    tenureTurnover: {
      type: ChartType.BAR,
      title: '在职年限与离职率',
      description: '不同在职年限的离职率',
      xAxis: {
        label: '在职年限',
        values: ['<1年', '1-2年', '2-3年', '3-5年', '5年以上'],
      },
      yAxis: {
        label: '离职率',
        unit: '%',
      },
      series: [{
        name: '离职率',
        data: [
          { label: '<1年', value: 15 },
          { label: '1-2年', value: 12 },
          { label: '2-3年', value: 8 },
          { label: '3-5年', value: 5 },
          { label: '5年以上', value: 3 },
        ],
      }],
      summary: {
        total: 43,
        average: 8.6,
        max: 15,
        min: 3,
      },
    },
    retentionRate: {
      type: ChartType.CARD,
      title: '留存率',
      description: '2024年Q3留存率',
      data: [
        { label: '留存率', value: 91.5, category: 'retention' },
      ],
      summary: {
        total: 91.5,
        average: 91.5,
        max: 91.5,
        min: 91.5,
      },
    },
    riskAnalysis: {
      type: ChartType.HEATMAP,
      title: '离职风险分析',
      description: '各部门不同在职年限的离职风险',
      data: [
        { label: '销售部-1-2年', value: 0.75, category: 'high_risk' },
        { label: '技术部-2-3年', value: 0.65, category: 'medium_risk' },
        { label: '市场部-1-2年', value: 0.60, category: 'medium_risk' },
        { label: '运营部-<1年', value: 0.55, category: 'medium_risk' },
        { label: '产品部-3-5年', value: 0.40, category: 'low_risk' },
      ],
    },
  };
}

// 生成薪酬报表
function generateCompensationReport(): CompensationReport {
  return {
    salaryDistribution: {
      type: ChartType.BAR,
      title: '薪酬分布',
      description: '各职级薪酬分布',
      xAxis: {
        label: '职级',
        values: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
      },
      yAxis: {
        label: '平均年薪',
        unit: '万',
      },
      series: [{
        name: '平均年薪',
        data: [
          { label: 'P1', value: 15 },
          { label: 'P2', value: 22 },
          { label: 'P3', value: 32 },
          { label: 'P4', value: 42 },
          { label: 'P5', value: 55 },
          { label: 'P6', value: 75 },
          { label: 'P7', value: 95 },
        ],
      }],
      summary: {
        total: 336,
        average: 48,
        max: 95,
        min: 15,
      },
    },
    departmentCompensation: {
      type: ChartType.BAR,
      title: '部门薪酬对比',
      description: '各部门平均薪酬',
      xAxis: {
        label: '部门',
        values: ['技术部', '产品部', '销售部', '市场部', '运营部'],
      },
      yAxis: {
        label: '平均年薪',
        unit: '万',
      },
      series: [{
        name: '平均年薪',
        data: [
          { label: '技术部', value: 42 },
          { label: '产品部', value: 38 },
          { label: '销售部', value: 35 },
          { label: '市场部', value: 32 },
          { label: '运营部', value: 30 },
        ],
      }],
      summary: {
        total: 177,
        average: 35.4,
        max: 42,
        min: 30,
      },
    },
    marketComparison: {
      type: ChartType.LINE,
      title: '市场对比',
      description: '薪酬与市场对比',
      xAxis: {
        label: '职级',
        values: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      },
      yAxis: {
        label: '年薪',
        unit: '万',
      },
      series: [
        {
          name: '内部薪酬',
          data: [
            { label: 'P1', value: 15 },
            { label: 'P2', value: 22 },
            { label: 'P3', value: 32 },
            { label: 'P4', value: 42 },
            { label: 'P5', value: 55 },
            { label: 'P6', value: 75 },
          ],
          color: '#2563EB',
        },
        {
          name: '市场P50',
          data: [
            { label: 'P1', value: 16 },
            { label: 'P2', value: 24 },
            { label: 'P3', value: 35 },
            { label: 'P4', value: 45 },
            { label: 'P5', value: 58 },
            { label: 'P6', value: 78 },
          ],
          color: '#7C3AED',
        },
      ],
    },
    budgetAnalysis: {
      type: ChartType.PIE,
      title: '预算分析',
      description: '薪酬预算使用情况',
      data: [
        { label: '已使用', value: 92, category: 'used' },
        { label: '未使用', value: 8, category: 'unused' },
      ],
      summary: {
        total: 100,
        average: 50,
        max: 92,
        min: 8,
      },
    },
    compensationTrend: {
      type: ChartType.LINE,
      title: '薪酬趋势',
      description: '薪酬变化趋势',
      xAxis: {
        label: '季度',
        values: ['Q1', 'Q2', 'Q3', 'Q4'],
      },
      yAxis: {
        label: '平均年薪',
        unit: '万',
      },
      series: [{
        name: '平均年薪',
        data: [
          { label: 'Q1', value: 34 },
          { label: 'Q2', value: 35 },
          { label: 'Q3', value: 35.6 },
          { label: 'Q4', value: 36 },
        ],
        color: '#2563EB',
      }],
      summary: {
        total: 140.6,
        average: 35.15,
        max: 36,
        min: 34,
        growth: 5.9,
      },
    },
  };
}

// 生成培训报表
function generateTrainingReport(): TrainingReport {
  return {
    trainingParticipation: {
      type: ChartType.BAR,
      title: '培训参与率',
      description: '各部门培训参与率',
      xAxis: {
        label: '部门',
        values: ['技术部', '销售部', '产品部', '运营部', '市场部'],
      },
      yAxis: {
        label: '参与率',
        unit: '%',
      },
      series: [{
        name: '参与率',
        data: [
          { label: '技术部', value: 88 },
          { label: '销售部', value: 82 },
          { label: '产品部', value: 85 },
          { label: '运营部', value: 80 },
          { label: '市场部', value: 78 },
        ],
      }],
      summary: {
        total: 413,
        average: 82.6,
        max: 88,
        min: 78,
      },
    },
    completionRate: {
      type: ChartType.BAR,
      title: '完成率',
      description: '各部门培训完成率',
      xAxis: {
        label: '部门',
        values: ['技术部', '销售部', '产品部', '运营部', '市场部'],
      },
      yAxis: {
        label: '完成率',
        unit: '%',
      },
      series: [{
        name: '完成率',
        data: [
          { label: '技术部', value: 82 },
          { label: '销售部', value: 75 },
          { label: '产品部', value: 80 },
          { label: '运营部', value: 76 },
          { label: '市场部', value: 74 },
        ],
      }],
      summary: {
        total: 387,
        average: 77.4,
        max: 82,
        min: 74,
      },
    },
    satisfactionScore: {
      type: ChartType.CARD,
      title: '满意度评分',
      description: '培训满意度评分',
      data: [
        { label: '满意度', value: 4.5, category: 'satisfaction' },
      ],
      summary: {
        total: 4.5,
        average: 4.5,
        max: 4.5,
        min: 4.5,
      },
    },
    trainingBudget: {
      type: ChartType.PIE,
      title: '预算使用',
      description: '培训预算使用情况',
      data: [
        { label: '已使用', value: 80, category: 'used' },
        { label: '未使用', value: 20, category: 'unused' },
      ],
      summary: {
        total: 100,
        average: 50,
        max: 80,
        min: 20,
      },
    },
    skillProgress: {
      type: ChartType.BAR,
      title: '技能提升',
      description: '培训后技能提升情况',
      xAxis: {
        label: '技能类型',
        values: ['技术能力', '沟通能力', '管理能力', '业务能力'],
      },
      yAxis: {
        label: '提升幅度',
        unit: '%',
      },
      series: [{
        name: '提升幅度',
        data: [
          { label: '技术能力', value: 25 },
          { label: '沟通能力', value: 20 },
          { label: '管理能力', value: 22 },
          { label: '业务能力', value: 18 },
        ],
      }],
      summary: {
        total: 85,
        average: 21.25,
        max: 25,
        min: 18,
      },
    },
    impactAnalysis: {
      type: ChartType.LINE,
      title: '培训效果趋势',
      description: '培训效果变化趋势',
      xAxis: {
        label: '月份',
        values: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        label: '效果指数',
        unit: '分',
      },
      series: [{
        name: '效果指数',
        data: [
          { label: '1月', value: 72 },
          { label: '2月', value: 75 },
          { label: '3月', value: 78 },
          { label: '4月', value: 80 },
          { label: '5月', value: 82 },
          { label: '6月', value: 85 },
        ],
        color: '#2563EB',
      }],
      summary: {
        total: 472,
        average: 78.67,
        max: 85,
        min: 72,
        growth: 18.1,
      },
    },
  };
}

/**
 * GET /api/reports/hr-analytics - 获取报表模板列表
 */
export async function GET(request: NextRequest) {
  try {
    const reportTemplates = [
      {
        type: ReportType.WORKFORCE_STRUCTURE,
        name: '人力结构分析',
        description: '分析组织的人力资源结构，包括部门、职位、年龄、性别等分布',
        charts: ['部门分布', '职位分布', '职级分布', '年龄分布', '性别分布'],
      },
      {
        type: ReportType.EFFICIENCY,
        name: '人效分析',
        description: '分析组织的整体人效和各部门人效，包括人均营收、生产力等指标',
        charts: ['人均营收', '生产力指标', '部门人效', '趋势分析'],
      },
      {
        type: ReportType.TURNOVER,
        name: '离职分析',
        description: '分析员工离职情况，包括离职率、离职原因、风险分析等',
        charts: ['离职率', '部门离职率', '离职原因', '风险分析'],
      },
      {
        type: ReportType.COMPENSATION,
        name: '薪酬分析',
        description: '分析薪酬结构、薪酬水平和市场对比',
        charts: ['薪酬分布', '部门薪酬', '市场对比', '预算分析'],
      },
      {
        type: ReportType.TRAINING,
        name: '培训分析',
        description: '分析培训参与、完成情况和培训效果',
        charts: ['参与率', '完成率', '满意度', '技能提升'],
      },
    ];

    return NextResponse.json({
      success: true,
      data: reportTemplates,
    });
  } catch (error) {
    console.error('获取报表模板列表错误:', error);
    return NextResponse.json(
      { error: '获取报表模板列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
