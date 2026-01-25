import { getDb } from '@/lib/db';
import {
  attributionAnalysis,
  efficiencyMetrics,
} from './shared/schema';
import { eq, and } from 'drizzle-orm';

export interface AttributionResult {
  keyFactors: Array<{
    factor: string;
    impact: string;
    description: string;
    confidence: number;
  }>;
  recommendations: Array<{
    priority: string;
    action: string;
    expectedImpact: string;
  }>;
  insights: string[];
}

export class AttributionAnalysisManager {
  /**
   * 调用豆包大模型进行归因分析
   */
  static async analyzeWithAI(
    companyId: string,
    metricCode: string,
    currentValue: number,
    previousValue: number,
    context: any
  ): Promise<AttributionResult> {
    // 获取指标信息
    const db = await getDb();
    const [metric] = await db
      .select()
      .from(efficiencyMetrics)
      .where(eq(efficiencyMetrics.code, metricCode));

    if (!metric) {
      throw new Error(`指标 ${metricCode} 不存在`);
    }

    const changeRate = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
    const isPositive = currentValue > previousValue;

    const prompt = `你是一个资深的人力资源数据分析师。请对企业人效指标的变化进行深度归因分析。

指标信息：
- 指标名称：${metric.name}
- 指标代码：${metric.code}
- 指标说明：${metric.description}
- 当前值：${currentValue}
- 对比值：${previousValue}
- 变化率：${changeRate}%
- 变化趋势：${isPositive ? '上升' : '下降'}

企业背景信息：
${JSON.stringify(context, null, 2)}

请从以下几个维度进行归因分析：
1. 外部环境因素（市场、行业、政策等）
2. 内部运营因素（组织结构、流程、管理）
3. 人员因素（能力、激励、文化）
4. 资源因素（预算、工具、培训）

请以JSON格式返回分析结果，包含以下字段：
{
  "keyFactors": [
    {
      "factor": "影响因素名称",
      "impact": "正面/负面影响程度（高/中/低）",
      "description": "详细说明该因素如何影响指标变化",
      "confidence": 80-100之间的数值，表示置信度
    }
  ],
  "recommendations": [
    {
      "priority": "优先级（高/中/低）",
      "action": "具体可行的行动建议",
      "expectedImpact": "预期改善效果"
    }
  ],
  "insights": ["关键洞察点1", "关键洞察点2"]
}

要求：
1. 分析要基于数据和事实，避免空泛
2. 归因要精准，找到最关键的影响因素
3. 建议要具体、可执行，避免套话
4. 洞察要有深度，能够指导决策`;

    try {
      // 调用豆包大模型
      const response = await fetch('/api/ai/attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          companyId,
          metricCode,
        }),
      });

      if (!response.ok) {
        throw new Error('调用AI服务失败');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AI归因分析失败:', error);

      // 返回默认分析结果
      return {
        keyFactors: [
          {
            factor: 'AI分析服务暂不可用',
            impact: '中',
            description: '当前无法进行AI智能归因分析，请稍后重试或查看历史数据',
            confidence: 0,
          },
        ],
        recommendations: [
          {
            priority: '中',
            action: '建议定期监控该指标，关注变化趋势',
            expectedImpact: '提高数据可追溯性',
          },
        ],
        insights: [
          '建议在AI服务恢复后重新进行深度分析',
          '可以结合业务数据变化进行人工归因分析',
        ],
      };
    }
  }

  /**
   * 创建归因分析记录
   */
  static async createAnalysis(
    companyId: string,
    metricCode: string,
    period: string,
    currentValue: number,
    previousValue: number,
    analysis: AttributionResult,
    requestedBy: string
  ) {
    const db = await getDb();

    const changeRate = ((currentValue - previousValue) / previousValue * 100).toFixed(1);

    const [record] = await db
      .insert(attributionAnalysis)
      .values({
        companyId,
        metricCode,
        period,
        currentValue,
        previousValue,
        changeRate,
        analysis: analysis as any,
        confidence: this.calculateConfidence(analysis),
        requestedBy,
      })
      .returning();

    return record;
  }

  /**
   * 计算置信度
   */
  private static calculateConfidence(analysis: AttributionResult): number {
    if (!analysis.keyFactors || analysis.keyFactors.length === 0) {
      return 0;
    }

    const avgFactorConfidence =
      analysis.keyFactors.reduce((sum, factor) => sum + factor.confidence, 0) /
      analysis.keyFactors.length;

    return Math.round(avgFactorConfidence);
  }

  /**
   * 获取历史归因分析
   */
  static async getHistory(companyId: string, metricCode?: string, limit: number = 20) {
    const db = await getDb();

    const conditions = [eq(attributionAnalysis.companyId, companyId)];
    if (metricCode) {
      conditions.push(eq(attributionAnalysis.metricCode, metricCode));
    }

    return await db
      .select()
      .from(attributionAnalysis)
      .where(and(...conditions))
      .orderBy(attributionAnalysis.createdAt)
      .limit(limit);
  }

  /**
   * 获取指定分析记录
   */
  static async getById(id: string) {
    const db = await getDb();

    const [record] = await db
      .select()
      .from(attributionAnalysis)
      .where(eq(attributionAnalysis.id, id));

    return record;
  }
}

export default AttributionAnalysisManager;
