import { getDb } from '@/lib/db';
import {
  predictionAnalysis,
  efficiencyMetrics,
} from './shared/schema';
import { eq, and } from 'drizzle-orm';

export interface PredictionResult {
  prediction: {
    value: number;
    changeRate: string;
    direction: 'up' | 'down' | 'stable';
  };
  drivers: Array<{
    factor: string;
    impact: string;
    explanation: string;
  }>;
  risks: Array<{
    risk: string;
    probability: number;
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    potential: string;
    action: string;
  }>;
  scenarios: Array<{
    name: string;
    value: number;
    assumptions: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: string;
    timeline: string;
  }>;
}

export class PredictionAnalysisManager {
  /**
   * 调用豆包大模型进行预测分析
   */
  static async predictWithAI(
    companyId: string,
    metricCode: string,
    predictionType: string,
    predictionPeriod: string,
    historicalData: any[],
    context: any
  ): Promise<PredictionResult> {
    const db = await getDb();
    const [metric] = await db
      .select()
      .from(efficiencyMetrics)
      .where(eq(efficiencyMetrics.code, metricCode));

    if (!metric) {
      throw new Error(`指标 ${metricCode} 不存在`);
    }

    const prompt = `你是一个资深的人力资源数据预测专家。请基于历史数据和企业现状，对未来的人效指标进行预测分析。

指标信息：
- 指标名称：${metric.name}
- 指标代码：${metric.code}
- 指标说明：${metric.description}
- 预测类型：${predictionType}（趋势预测/峰值预测/风险预测/机会识别）
- 预测周期：${predictionPeriod}

历史数据：
${JSON.stringify(historicalData, null, 2)}

企业当前情况：
${JSON.stringify(context, null, 2)}

请以JSON格式返回预测结果，包含以下字段：
{
  "prediction": {
    "value": 预测值（数值）,
    "changeRate": "相比当前值的变化率（如+15.3%）",
    "direction": "趋势方向（up/down/stable）"
  },
  "drivers": [
    {
      "factor": "驱动因素",
      "impact": "影响程度（高/中/低）",
      "explanation": "详细说明该因素如何影响预测结果"
    }
  ],
  "risks": [
    {
      "risk": "风险描述",
      "probability": 0-100的数值，表示发生概率,
      "mitigation": "缓解措施"
    }
  ],
  "opportunities": [
    {
      "opportunity": "机会描述",
      "potential": "潜力评估",
      "action": "行动建议"
    }
  ],
  "scenarios": [
    {
      "name": "情景名称（乐观/基准/悲观）",
      "value": 该情景下的预测值,
      "assumptions": ["假设1", "假设2"]
    }
  ],
  "recommendations": [
    {
      "action": "行动建议",
      "priority": "优先级（高/中/低）",
      "timeline": "建议时间线"
    }
  ]
}

要求：
1. 预测要基于数据趋势，结合行业规律
2. 驱动因素要准确，反映真实影响机制
3. 风险识别要全面，覆盖主要不确定性
4. 机会挖掘要深入，找到潜在增长点
5. 情景分析要合理，提供多维度参考
6. 建议要可操作，能够指导实际决策`;

    try {
      const response = await fetch('/api/ai/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          companyId,
          metricCode,
          predictionType,
        }),
      });

      if (!response.ok) {
        throw new Error('调用AI服务失败');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AI预测分析失败:', error);

      // 返回基于趋势的简单预测
      const latestValue = historicalData[0]?.[metricCode] || 0;
      const avgChange = this.calculateAverageChange(historicalData, metricCode);
      const predictedValue = Math.round(latestValue * (1 + avgChange / 100));

      return {
        prediction: {
          value: predictedValue,
          changeRate: `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)}%`,
          direction: avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'stable',
        },
        drivers: [
          {
            factor: '历史趋势',
            impact: '高',
            explanation: '基于历史数据的线性趋势外推',
          },
        ],
        risks: [
          {
            risk: '市场环境变化',
            probability: 40,
            mitigation: '持续监控市场动态，及时调整策略',
          },
        ],
        opportunities: [],
        scenarios: [
          {
            name: '基准情景',
            value: predictedValue,
            assumptions: ['维持当前运营模式'],
          },
        ],
        recommendations: [
          {
            action: '建议定期更新预测模型，提高准确性',
            priority: '中',
            timeline: '持续进行',
          },
        ],
      };
    }
  }

  /**
   * 计算平均变化率
   */
  private static calculateAverageChange(data: any[], metricCode: string): number {
    if (data.length < 2) return 0;

    const values = data.map(item => item[metricCode]).filter(v => v !== undefined && v !== null);
    if (values.length < 2) return 0;

    const changes = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        changes.push(((values[i] - values[i - 1]) / values[i - 1]) * 100);
      }
    }

    if (changes.length === 0) return 0;
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }

  /**
   * 创建预测分析记录
   */
  static async createPrediction(
    companyId: string,
    metricCode: string,
    predictionPeriod: string,
    predictionType: string,
    currentValue: number,
    result: PredictionResult,
    requestedBy: string
  ) {
    const db = await getDb();

    const [record] = await db
      .insert(predictionAnalysis)
      .values({
        companyId,
        metricCode,
        predictionPeriod,
        predictionType,
        currentValue,
        predictedValue: result.prediction.value,
        confidence: this.calculateConfidence(result),
        analysis: result as any,
        insights: result.recommendations as any,
        requestedBy,
      })
      .returning();

    return record;
  }

  /**
   * 计算预测置信度
   */
  private static calculateConfidence(result: PredictionResult): number {
    // 基于风险和驱动因素的评估
    const baseConfidence = 75;

    // 如果有多个风险，降低置信度
    const riskPenalty = Math.min(result.risks?.length * 5, 20);

    // 如果驱动因素多，提高置信度
    const driverBonus = Math.min(result.drivers?.length * 3, 15);

    return Math.min(100, Math.max(0, baseConfidence - riskPenalty + driverBonus));
  }

  /**
   * 获取历史预测记录
   */
  static async getHistory(companyId: string, metricCode?: string, limit: number = 20) {
    const db = await getDb();

    const conditions = [eq(predictionAnalysis.companyId, companyId)];
    if (metricCode) {
      conditions.push(eq(predictionAnalysis.metricCode, metricCode));
    }

    return await db
      .select()
      .from(predictionAnalysis)
      .where(and(...conditions))
      .orderBy(predictionAnalysis.createdAt)
      .limit(limit);
  }

  /**
   * 获取指定预测记录
   */
  static async getById(id: string) {
    const db = await getDb();

    const [record] = await db
      .select()
      .from(predictionAnalysis)
      .where(eq(predictionAnalysis.id, id));

    return record;
  }
}

export default PredictionAnalysisManager;
