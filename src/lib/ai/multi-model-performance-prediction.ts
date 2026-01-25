/**
 * AI绩效预测多模型服务
 * 集成多个预测模型，提供准确的绩效预测
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { db } from '@/lib/db';
import { employees, performance } from '@/storage/database/shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface PerformancePrediction {
  employeeId: string;
  employeeName: string;
  currentScore: number;
  predictedScore: number;
  confidence: number;
  modelScores: {
    model1: number;
    model2: number;
    model3: number;
  };
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  improvementSuggestion: string[];
  factors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
}

export class MultiModelPerformancePredictionService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
    this.llmClient = new LLMClient(config);
  }

  /**
   * 多模型预测员工绩效
   */
  async predict(employeeId: string, companyId: string): Promise<PerformancePrediction> {
    // 获取员工历史数据
    const history = await this.getPerformanceHistory(employeeId);

    // 模型1：基于历史趋势的预测
    const model1Score = this.trendBasedPrediction(history);

    // 模型2：基于机器学习（LLM模拟）的预测
    const model2Score = await this.mlBasedPrediction(employeeId, companyId);

    // 模型3：基于同类员工的预测
    const model3Score = await this.peerBasedPrediction(employeeId, companyId);

    // 模型集成
    const predictedScore = Math.round(
      (model1Score * 0.3 + model2Score * 0.4 + model3Score * 0.3)
    );

    // 计算置信度
    const confidence = this.calculateConfidence(model1Score, model2Score, model3Score);

    // 确定趋势
    const trend = this.determineTrend(history.currentScore, predictedScore);

    // 确定风险等级
    const riskLevel = this.getRiskLevel(predictedScore, trend);

    // 生成改进建议
    const improvementSuggestion = await this.generateImprovementSuggestion(
      history,
      predictedScore,
      riskLevel
    );

    // 识别影响因素
    const factors = this.identifyFactors(history);

    return {
      employeeId,
      employeeName: history.employeeName,
      currentScore: history.currentScore,
      predictedScore,
      confidence,
      modelScores: {
        model1: model1Score,
        model2: model2Score,
        model3: model3Score,
      },
      trend,
      riskLevel,
      improvementSuggestion,
      factors,
    };
  }

  /**
   * 批量预测
   */
  async batchPredict(companyId: string): Promise<PerformancePrediction[]> {
    const results: PerformancePrediction[] = [];

    const allEmployees = await db
      .select()
      .from(employees)
      .where(and(eq(employees.companyId, companyId), eq(employees.status, 'active')));

    for (const employee of allEmployees) {
      try {
        const prediction = await this.predict(employee.id, companyId);
        results.push(prediction);
      } catch (error) {
        console.error(`预测员工 ${employee.id} 绩效失败:`, error);
      }
    }

    return results;
  }

  // ==================== 私有方法 ====================

  private async getPerformanceHistory(employeeId: string): Promise<any> {
    const results = await db
      .select()
      .from(performance)
      .where(eq(performance.employeeId, employeeId))
      .orderBy(performance.assessmentDate);

    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    const scores = results.map(r => r.score);
    const currentScore = scores.length > 0 ? scores[scores.length - 1] : 0;

    return {
      employeeName: employee?.name || '',
      currentScore,
      scores,
      trend: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0,
      variance: scores.length > 0 
        ? scores.reduce((sum, score) => sum + Math.pow(score - currentScore, 2), 0) / scores.length
        : 0,
    };
  }

  private trendBasedPrediction(history: any): number {
    const { currentScore, trend } = history;

    // 如果是上升趋势，继续上升但放缓
    if (trend > 5) {
      return Math.min(100, currentScore + trend * 0.5);
    }
    // 如果是下降趋势，继续下降
    if (trend < -5) {
      return Math.max(0, currentScore + trend * 0.7);
    }
    // 稳定
    return currentScore;
  }

  private async mlBasedPrediction(employeeId: string, companyId: string): Promise<number> {
    const history = await this.getPerformanceHistory(employeeId);
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    const systemPrompt = `你是一名HR分析专家，擅长预测员工绩效。

基于以下信息，预测员工未来绩效分数（0-100）：
- 员工姓名：${history.employeeName}
- 当前绩效：${history.currentScore}分
- 绩效趋势：${history.trend > 0 ? '上升' : history.trend < 0 ? '下降' : '稳定'}
- 绩效波动：${history.variance.toFixed(2)}
- 部门：${employee?.department || '未知'}
- 职位：${employee?.position || '未知'}

返回格式（JSON）：
{
  "predictedScore": 85,
  "confidence": 0.8,
  "reasoning": "预测说明"
}`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请预测该员工的未来绩效分数。' },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return history.currentScore;
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.predictedScore || history.currentScore;
  }

  private async peerBasedPrediction(employeeId: string, companyId: string): Promise<number> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) return 0;

    // 获取同部门同职位的员工
    const peers = await db
      .select()
      .from(performance)
      .innerJoin(employees, eq(performance.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          sql`${employees.department} = ${employee.department}`,
          sql`${employees.position} = ${employee.position}`,
          eq(employees.status, 'active')
        )
      )
      .limit(10);

    if (peers.length === 0) return 0;

    // 计算同职位员工的平均绩效
    const avgPeerScore = peers.reduce((sum, p) => sum + p.performance.score, 0) / peers.length;

    return Math.round(avgPeerScore);
  }

  private calculateConfidence(s1: number, s2: number, s3: number): number {
    // 计算三个模型预测的一致性
    const avg = (s1 + s2 + s3) / 3;
    const variance = (Math.pow(s1 - avg, 2) + Math.pow(s2 - avg, 2) + Math.pow(s3 - avg, 2)) / 3;
    
    // 方差越小，置信度越高
    const confidence = 1 - Math.min(variance / 100, 1);
    return Math.round(confidence * 100) / 100;
  }

  private determineTrend(current: number, predicted: number): 'up' | 'down' | 'stable' {
    const diff = predicted - current;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  }

  private getRiskLevel(predicted: number, trend: string): 'low' | 'medium' | 'high' {
    if (trend === 'down' && predicted < 60) return 'high';
    if (trend === 'down' || predicted < 70) return 'medium';
    return 'low';
  }

  private async generateImprovementSuggestion(
    history: any,
    predicted: number,
    riskLevel: string
  ): Promise<string[]> {
    const systemPrompt = `你是一名HR发展专家，擅长提供绩效改进建议。

以下员工情况：
- 当前绩效：${history.currentScore}分
- 预测绩效：${predicted}分
- 绩效趋势：${history.trend > 0 ? '上升' : history.trend < 0 ? '下降' : '稳定'}
- 风险等级：${riskLevel}

请提供3-5条具体的改进建议。

返回格式（JSON）：
["建议1", "建议2", "建议3"]`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请提供改进建议。' },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.6,
    });

    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ['持续学习提升技能', '加强团队协作', '设定明确目标'];
    }

    return JSON.parse(jsonMatch[0]);
  }

  private identifyFactors(history: any): Array<{ factor: string; impact: number; direction: 'positive' | 'negative' }> {
    const factors: Array<{ factor: string; impact: number; direction: 'positive' | 'negative' }> = [];

    if (history.trend > 0) {
      factors.push({ factor: '历史上升趋势', impact: Math.abs(history.trend), direction: 'positive' });
    } else if (history.trend < 0) {
      factors.push({ factor: '历史下降趋势', impact: Math.abs(history.trend), direction: 'negative' });
    }

    if (history.variance > 20) {
      factors.push({ factor: '绩效波动较大', impact: history.variance, direction: 'negative' });
    }

    return factors;
  }
}

// 导出单例
export const multiModelPerformancePredictionService = new MultiModelPerformancePredictionService();
