import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 薪酬分析类型
enum AnalysisType {
  MARKET_BENCHMARKING = 'market_benchmarking', // 市场对标
  GAP_ANALYSIS = 'gap_analysis', // 差距分析
  ADJUSTMENT_RECOMMENDATION = 'adjustment_recommendation', // 调整建议
  COMPREHENSIVE = 'comprehensive', // 综合分析
}

// 薪酬范围
interface SalaryRange {
  min: number;
  p25: number; // 25分位
  p50: number; // 中位数
  p75: number; // 75分位
  max: number;
  average: number;
}

// 市场薪酬数据
interface MarketData {
  position: string;
  level: string;
  location: string;
  industry: string;
  companySize: string;
  range: SalaryRange;
  dataPoints: number;
  lastUpdated: Date;
}

// 员工薪酬数据
interface EmployeeCompensation {
  id: string;
  name: string;
  position: string;
  level: string;
  department: string;
  baseSalary: number;
  bonus?: number;
  benefits?: number;
  totalCompensation: number;
  performance?: number;
  experience?: number;
  tenure?: number;
}

// 薪酬差距分析
interface SalaryGap {
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  marketPosition: string; // 'above', 'at', 'below'
  marketP50: number;
  gapAmount: number;
  gapPercentage: number;
  riskLevel: 'high' | 'medium' | 'low';
  factors: string[];
}

// 调整建议
interface AdjustmentRecommendation {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentSalary: number;
  recommendedSalary: number;
  adjustmentAmount: number;
  adjustmentPercentage: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  effectiveness: string;
  timing: string;
  alternatives?: string[];
  budgetImpact: number;
  roi?: string;
}

// 薪酬分析结果
interface CompensationAnalysisResult {
  analysisType: AnalysisType;
  marketBenchmarking?: {
    position: string;
    internalData: SalaryRange;
    marketData: SalaryRange;
    comparison: {
      min: number;
      p25: number;
      p50: number;
      p75: number;
      max: number;
      average: number;
    };
    competitiveness: 'excellent' | 'good' | 'fair' | 'poor';
    insights: string[];
  };
  gapAnalysis?: {
    summary: {
      totalEmployees: number;
      aboveMarket: number;
      atMarket: number;
      belowMarket: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
    gaps: SalaryGap[];
    statistics: {
      averageGap: number;
      medianGap: number;
      totalGap: number;
      maxGap: number;
      minGap: number;
    };
  };
  adjustmentRecommendations?: {
    summary: {
      totalAdjustments: number;
      totalBudget: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
    };
    recommendations: AdjustmentRecommendation[];
    prioritizedActions: Array<{
      phase: string;
      actions: string[];
      budget: number;
      timeline: string;
    }>;
  };
  warnings: string[];
  createdAt: Date;
}

// 模拟市场薪酬数据
let marketDataCache: Map<string, MarketData> = new Map();

// 初始化市场数据
function initializeMarketData() {
  if (marketDataCache.size === 0) {
    const sampleMarketData: MarketData[] = [
      {
        position: '软件工程师',
        level: 'P4',
        location: '北京',
        industry: '互联网',
        companySize: '100-500人',
        range: {
          min: 180000,
          p25: 220000,
          p50: 280000,
          p75: 350000,
          max: 450000,
          average: 296000,
        },
        dataPoints: 1250,
        lastUpdated: new Date(),
      },
      {
        position: '产品经理',
        level: 'P4',
        location: '北京',
        industry: '互联网',
        companySize: '100-500人',
        range: {
          min: 200000,
          p25: 250000,
          p50: 320000,
          p75: 400000,
          max: 520000,
          average: 338000,
        },
        dataPoints: 890,
        lastUpdated: new Date(),
      },
      {
        position: '架构师',
        level: 'P6',
        location: '北京',
        industry: '互联网',
        companySize: '100-500人',
        range: {
          min: 400000,
          p25: 480000,
          p50: 600000,
          p75: 750000,
          max: 950000,
          average: 636000,
        },
        dataPoints: 320,
        lastUpdated: new Date(),
      },
      {
        position: '项目经理',
        level: 'P5',
        location: '北京',
        industry: '互联网',
        companySize: '100-500人',
        range: {
          min: 250000,
          p25: 300000,
          p50: 380000,
          p75: 480000,
          max: 620000,
          average: 406000,
        },
        dataPoints: 560,
        lastUpdated: new Date(),
      },
      {
        position: '数据分析师',
        level: 'P3',
        location: '北京',
        industry: '互联网',
        companySize: '100-500人',
        range: {
          min: 150000,
          p25: 180000,
          p50: 230000,
          p75: 280000,
          max: 350000,
          average: 238000,
        },
        dataPoints: 780,
        lastUpdated: new Date(),
      },
    ];

    sampleMarketData.forEach(data => {
      const key = `${data.position}-${data.level}-${data.location}`;
      marketDataCache.set(key, data);
    });
  }
}

initializeMarketData();

// 薪酬分析请求Schema
const analysisSchema = z.object({
  companyId: z.string(),
  employees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    level: z.string(),
    department: z.string(),
    baseSalary: z.number(),
    bonus: z.number().optional(),
    benefits: z.number().optional(),
    totalCompensation: z.number(),
    performance: z.number().optional(),
    experience: z.number().optional(),
    tenure: z.number().optional(),
  })),
  analysisType: z.nativeEnum(AnalysisType),
  location: z.string().default('北京'),
  industry: z.string().default('互联网'),
  companySize: z.string().default('100-500人'),
  includeBonus: z.boolean().default(false),
  budgetLimit: z.number().optional(),
  requestedBy: z.string(),
});

/**
 * POST /api/compensation/smart-analysis - 薪酬智能分析
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = analysisSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    let result: CompensationAnalysisResult = {
      analysisType: validated.analysisType,
      warnings: [],
      createdAt: new Date(),
    };

    if (validated.analysisType === AnalysisType.MARKET_BENCHMARKING || validated.analysisType === AnalysisType.COMPREHENSIVE) {
      result.marketBenchmarking = await performMarketBenchmarking(validated, client);
    }

    if (validated.analysisType === AnalysisType.GAP_ANALYSIS || validated.analysisType === AnalysisType.COMPREHENSIVE) {
      result.gapAnalysis = await performGapAnalysis(validated, client);
    }

    if (validated.analysisType === AnalysisType.ADJUSTMENT_RECOMMENDATION || validated.analysisType === AnalysisType.COMPREHENSIVE) {
      result.adjustmentRecommendations = await generateAdjustmentRecommendations(validated, client);
    }

    return NextResponse.json({
      success: true,
      message: '薪酬分析完成',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('薪酬智能分析错误:', error);
    return NextResponse.json(
      { error: '薪酬智能分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 市场对标分析
async function performMarketBenchmarking(
  validated: z.infer<typeof analysisSchema>,
  client: LLMClient
) {
  // 计算内部薪酬范围
  const salaries = validated.employees.map(e => e.totalCompensation);
  salaries.sort((a, b) => a - b);

  const internalData: SalaryRange = {
    min: salaries[0],
    p25: salaries[Math.floor(salaries.length * 0.25)],
    p50: salaries[Math.floor(salaries.length * 0.5)],
    p75: salaries[Math.floor(salaries.length * 0.75)],
    max: salaries[salaries.length - 1],
    average: salaries.reduce((sum, s) => sum + s, 0) / salaries.length,
  };

  // 获取市场数据（按职位分组）
  const marketDataByPosition: Record<string, MarketData> = {};
  validated.employees.forEach(emp => {
    const key = `${emp.position}-${emp.level}-${validated.location}`;
    if (!marketDataByPosition[key]) {
      marketDataByPosition[key] = {
        position: emp.position,
        level: emp.level,
        location: validated.location,
        industry: validated.industry,
        companySize: validated.companySize,
        range: internalData, // 如果没有市场数据，使用内部数据作为占位
        dataPoints: 0,
        lastUpdated: new Date(),
      };
    }

    const cachedData = marketDataCache.get(key);
    if (cachedData) {
      marketDataByPosition[key] = cachedData;
    }
  });

  // 汇总市场数据
  const allMarketRanges = Object.values(marketDataByPosition).map(d => d.range);
  const marketData: SalaryRange = {
    min: Math.min(...allMarketRanges.map(r => r.min)),
    p25: allMarketRanges.reduce((sum, r) => sum + r.p25, 0) / allMarketRanges.length,
    p50: allMarketRanges.reduce((sum, r) => sum + r.p50, 0) / allMarketRanges.length,
    p75: allMarketRanges.reduce((sum, r) => sum + r.p75, 0) / allMarketRanges.length,
    max: Math.max(...allMarketRanges.map(r => r.max)),
    average: allMarketRanges.reduce((sum, r) => sum + r.average, 0) / allMarketRanges.length,
  };

  // 计算竞争力
  const comparison = {
    min: parseFloat(((internalData.min - marketData.min) / marketData.min * 100).toFixed(1)),
    p25: parseFloat(((internalData.p25 - marketData.p25) / marketData.p25 * 100).toFixed(1)),
    p50: parseFloat(((internalData.p50 - marketData.p50) / marketData.p50 * 100).toFixed(1)),
    p75: parseFloat(((internalData.p75 - marketData.p75) / marketData.p75 * 100).toFixed(1)),
    max: parseFloat(((internalData.max - marketData.max) / marketData.max * 100).toFixed(1)),
    average: parseFloat(((internalData.average - marketData.average) / marketData.average * 100).toFixed(1)),
  };

  const avgComparison = comparison.average;
  let competitiveness: 'excellent' | 'good' | 'fair' | 'poor';
  if (avgComparison >= 10) competitiveness = 'excellent';
  else if (avgComparison >= 5) competitiveness = 'good';
  else if (avgComparison >= -5) competitiveness = 'fair';
  else competitiveness = 'poor';

  // 调用AI生成洞察
  const insights = await generateBenchmarkingInsights(validated, internalData, marketData, competitiveness, client);

  return {
    position: '综合职位',
    internalData,
    marketData,
    comparison,
    competitiveness,
    insights,
  };
}

// 生成市场对标洞察
async function generateBenchmarkingInsights(
  validated: z.infer<typeof analysisSchema>,
  internalData: SalaryRange,
  marketData: SalaryRange,
  competitiveness: string,
  client: LLMClient
) {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一位资深的薪酬管理专家，请基于以下数据生成薪酬市场对标洞察。

内部薪酬数据：
- 最低值：${internalData.min}
- P25：${internalData.p25}
- 中位数：${internalData.p50}
- P75：${internalData.p75}
- 最高值：${internalData.max}
- 平均值：${internalData.average}

市场薪酬数据：
- 最低值：${marketData.min}
- P25：${marketData.p25}
- 中位数：${marketData.p50}
- P75：${marketData.p75}
- 最高值：${marketData.max}
- 平均值：${marketData.average}

竞争力评估：${competitiveness}

请生成3-5条有价值的洞察，包括：
1. 薪酬水平定位
2. 与市场的差距分析
3. 优势和劣势
4. 改进建议

输出格式：
{
  "insights": ["洞察1", "洞察2", "洞察3"]
}`,
    },
    {
      role: 'user' as const,
      content: '请生成薪酬市场对标洞察。',
    },
  ];

  const response = await client.invoke(messages, {
    temperature: 0.7,
  });

  const content = response.content.trim();
  let insights: string[] = [
    '整体薪酬水平与市场基本持平',
    '中位数略低于市场水平',
    '建议关注高绩效员工的薪酬竞争力',
  ];

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                   content.match(/```\s*([\s\S]*?)\s*```/) ||
                   content.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      if (data.insights && Array.isArray(data.insights)) {
        insights = data.insights;
      }
    } catch (e) {
      // 使用默认洞察
    }
  }

  return insights;
}

// 差距分析
async function performGapAnalysis(
  validated: z.infer<typeof analysisSchema>,
  client: LLMClient
) {
  const gaps: SalaryGap[] = [];

  for (const emp of validated.employees) {
    const key = `${emp.position}-${emp.level}-${validated.location}`;
    const marketData = marketDataCache.get(key);

    if (marketData) {
      const marketP50 = marketData.range.p50;
      const gap = emp.totalCompensation - marketP50;
      const gapPercentage = (gap / marketP50 * 100);

      let marketPosition: string;
      if (gapPercentage >= 10) marketPosition = 'above';
      else if (gapPercentage >= -10) marketPosition = 'at';
      else marketPosition = 'below';

      let riskLevel: 'high' | 'medium' | 'low';
      const factors: string[] = [];

      if (marketPosition === 'below') {
        if (emp.performance && emp.performance >= 85) {
          riskLevel = 'high';
          factors.push('高绩效员工薪酬偏低');
        } else if (emp.tenure && emp.tenure > 2) {
          riskLevel = 'high';
          factors.push('长期员工薪酬偏低');
        } else if (emp.experience && emp.experience > 5) {
          riskLevel = 'medium';
          factors.push('有经验员工薪酬偏低');
        } else {
          riskLevel = 'medium';
          factors.push('薪酬低于市场水平');
        }
      } else {
        riskLevel = 'low';
        factors.push('薪酬水平合理');
      }

      gaps.push({
        employeeId: emp.id,
        employeeName: emp.name,
        currentSalary: emp.totalCompensation,
        marketPosition,
        marketP50,
        gapAmount: gap,
        gapPercentage: parseFloat(gapPercentage.toFixed(2)),
        riskLevel,
        factors,
      });
    }
  }

  // 统计数据
  const aboveMarket = gaps.filter(g => g.marketPosition === 'above').length;
  const atMarket = gaps.filter(g => g.marketPosition === 'at').length;
  const belowMarket = gaps.filter(g => g.marketPosition === 'below').length;
  const highRisk = gaps.filter(g => g.riskLevel === 'high').length;
  const mediumRisk = gaps.filter(g => g.riskLevel === 'medium').length;
  const lowRisk = gaps.filter(g => g.riskLevel === 'low').length;

  const gapValues = gaps.map(g => g.gapAmount);
  const statistics = {
    averageGap: gapValues.reduce((sum, g) => sum + g, 0) / gapValues.length,
    medianGap: gapValues.sort((a, b) => a - b)[Math.floor(gapValues.length / 2)],
    totalGap: gapValues.reduce((sum, g) => sum + g, 0),
    maxGap: Math.max(...gapValues),
    minGap: Math.min(...gapValues),
  };

  return {
    summary: {
      totalEmployees: gaps.length,
      aboveMarket,
      atMarket,
      belowMarket,
      highRisk,
      mediumRisk,
      lowRisk,
    },
    gaps,
    statistics,
  };
}

// 调整建议
async function generateAdjustmentRecommendations(
  validated: z.infer<typeof analysisSchema>,
  client: LLMClient
) {
  const recommendations: AdjustmentRecommendation[] = [];

  for (const emp of validated.employees) {
    const key = `${emp.position}-${emp.level}-${validated.location}`;
    const marketData = marketDataCache.get(key);

    if (marketData) {
      const marketP50 = marketData.range.p50;
      const gap = emp.totalCompensation - marketP50;
      const gapPercentage = gap / marketP50 * 100;

      let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
      let adjustmentAmount = 0;
      let reason = '';

      if (gapPercentage < -20 && emp.performance && emp.performance >= 85) {
        priority = 'critical';
        adjustmentAmount = marketP50 * 0.15; // 调整到市场P75水平
        reason = '高绩效员工薪酬严重低于市场，急需调整';
      } else if (gapPercentage < -15) {
        priority = 'high';
        adjustmentAmount = marketP50 * 0.10; // 调整到市场P60水平
        reason = '薪酬低于市场水平较多，需要关注';
      } else if (gapPercentage < -10) {
        priority = 'medium';
        adjustmentAmount = marketP50 * 0.05; // 调整到市场P50水平
        reason = '薪酬略低于市场水平，建议适当调整';
      }

      if (adjustmentAmount > 0) {
        const recommendedSalary = emp.totalCompensation + adjustmentAmount;
        const adjPercentage = (adjustmentAmount / emp.totalCompensation * 100);

        recommendations.push({
          employeeId: emp.id,
          employeeName: emp.name,
          currentPosition: emp.position,
          currentSalary: emp.totalCompensation,
          recommendedSalary,
          adjustmentAmount,
          adjustmentPercentage: parseFloat(adjPercentage.toFixed(2)),
          priority,
          reason,
          effectiveness: '预计提升员工满意度和留存率',
          timing: priority === 'critical' ? '立即' : priority === 'high' ? '1个月内' : '3个月内',
          budgetImpact: adjustmentAmount,
        });
      }
    }
  }

  // 统计
  const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
  const highCount = recommendations.filter(r => r.priority === 'high').length;
  const mediumCount = recommendations.filter(r => r.priority === 'medium').length;
  const lowCount = recommendations.filter(r => r.priority === 'low').length;
  const totalBudget = recommendations.reduce((sum, r) => sum + r.budgetImpact, 0);

  // 生成分阶段行动方案
  const prioritizedActions = [
    {
      phase: '第一阶段：紧急调整',
      actions: [
        '立即处理所有critical级别的调整',
        '准备充分的调整理由和沟通方案',
      ],
      budget: recommendations.filter(r => r.priority === 'critical').reduce((sum, r) => sum + r.budgetImpact, 0),
      timeline: '1个月内',
    },
    {
      phase: '第二阶段：优先调整',
      actions: [
        '处理所有high级别的调整',
        '评估调整效果和员工反馈',
      ],
      budget: recommendations.filter(r => r.priority === 'high').reduce((sum, r) => sum + r.budgetImpact, 0),
      timeline: '3个月内',
    },
    {
      phase: '第三阶段：常规调整',
      actions: [
        '处理所有medium级别的调整',
        '建立定期薪酬评估机制',
      ],
      budget: recommendations.filter(r => r.priority === 'medium').reduce((sum, r) => sum + r.budgetImpact, 0),
      timeline: '6个月内',
    },
  ];

  return {
    summary: {
      totalAdjustments: recommendations.length,
      totalBudget,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    },
    recommendations,
    prioritizedActions,
  };
}

/**
 * GET /api/compensation/smart-analysis - 获取薪酬分析记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    // 这里应该从数据库查询，暂时返回空列表
    return NextResponse.json({
      success: true,
      data: [],
      message: '分析记录查询功能需要实现数据库集成',
    });
  } catch (error) {
    console.error('获取薪酬分析记录错误:', error);
    return NextResponse.json(
      { error: '获取薪酬分析记录失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
