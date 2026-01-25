/**
 * AI离职预测增强服务
 * 提供多维度特征工程和早期预警系统
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { db } from '@/lib/db';
import { employees, performanceRecords, attendanceRecords, interviews } from '@/storage/database/shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface EmployeeFeature {
  employeeId: string;
  // 基础特征
  tenure: number;           // 在职时长（月）
  age: number;              // 年龄
  positionLevel: number;    // 职位等级
  department: string;       // 部门
  
  // 绩效特征
  avgPerformanceScore: number;   // 平均绩效分数
  performanceTrend: number;      // 绩效趋势（正数上升，负数下降）
  performanceVariance: number;   // 绩效波动
  recentPerformanceScore: number; // 最近绩效分数
  
  // 考勤特征
  attendanceRate: number;        // 出勤率
  lateCount: number;             // 迟到次数
  earlyLeaveCount: number;       // 早退次数
  leaveCount: number;            // 请假次数
  overtimeHours: number;         // 加班时长
  
  // 行为特征
  interviewCount: number;        // 参加面试次数（可能在外求职）
  trainingCompletionRate: number;// 培训完成率
  
  // 综合特征
  engagementScore: number;       // 敬业度评分
  satisfactionScore: number;     // 满意度评分
  stressLevel: number;           // 压力水平
}

export interface TurnoverRisk {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;      // 0-100
  probability: number;    // 0-1
  keyFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
  }>;
  topReasons: string[];
  recommendations: string[];
  warningTime?: Date;     // 预计离职时间
}

export class EnhancedTurnoverPredictionService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
    this.llmClient = new LLMClient(config);
  }

  /**
   * 提取员工多维度特征
   */
  async extractFeatures(employeeId: string, companyId: string): Promise<EmployeeFeature> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.companyId, companyId)))
      .limit(1);

    if (!employee) {
      throw new Error('员工不存在');
    }

    // 计算在职时长
    const joinedAt = employee.joinedAt ? new Date(employee.joinedAt) : new Date();
    const tenure = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // 获取绩效数据
    const performanceData = await this.getPerformanceData(employeeId);
    
    // 获取考勤数据
    const attendanceData = await this.getAttendanceData(employeeId);
    
    // 获取行为数据
    const behavioralData = await this.getBehavioralData(employeeId);

    // 计算综合特征
    const engagementScore = this.calculateEngagementScore(performanceData, attendanceData);
    const stressLevel = this.calculateStressLevel(performanceData, attendanceData);
    const satisfactionScore = this.calculateSatisfactionScore(performanceData, behavioralData);

    return {
      employeeId,
      tenure,
      age: this.calculateAge(employee.dateOfBirth),
      positionLevel: this.getPositionLevel(employee.position),
      department: employee.department || '',
      avgPerformanceScore: performanceData.avgScore,
      performanceTrend: performanceData.trend,
      performanceVariance: performanceData.variance,
      recentPerformanceScore: performanceData.recentScore,
      attendanceRate: attendanceData.rate,
      lateCount: attendanceData.lateCount,
      earlyLeaveCount: attendanceData.earlyLeaveCount,
      leaveCount: attendanceData.leaveCount,
      overtimeHours: attendanceData.overtimeHours,
      interviewCount: behavioralData.interviewCount,
      trainingCompletionRate: behavioralData.trainingCompletionRate,
      engagementScore,
      stressLevel,
      satisfactionScore,
    };
  }

  /**
   * 预测离职风险（使用多模型集成）
   */
  async predictTurnoverRisk(features: EmployeeFeature): Promise<TurnoverRisk> {
    // 模型1：基于规则的风险评估
    const ruleBasedRisk = this.calculateRuleBasedRisk(features);
    
    // 模型2：基于机器学习的预测（这里用LLM模拟）
    const mlBasedRisk = await this.calculateMLBasedRisk(features);
    
    // 模型3：基于行为模式的预测
    const behaviorBasedRisk = this.calculateBehaviorBasedRisk(features);
    
    // 模型集成（加权平均）
    const weights = { ruleBased: 0.3, mlBased: 0.4, behaviorBased: 0.3 };
    const riskScore = Math.round(
      ruleBasedRisk.riskScore * weights.ruleBased +
      mlBasedRisk.riskScore * weights.mlBased +
      behaviorBasedRisk.riskScore * weights.behaviorBased
    );

    // 确定风险等级
    const riskLevel = this.getRiskLevel(riskScore);
    
    // 生成关键因素
    const keyFactors = this.identifyKeyFactors(features);
    
    // 生成离职原因
    const topReasons = this.identifyTopReasons(features, riskScore);
    
    // 生成建议
    const recommendations = this.generateRecommendations(features, riskLevel);

    return {
      employeeId: features.employeeId,
      employeeName: '', // 需要从数据库获取
      department: features.department,
      position: '',
      riskLevel,
      riskScore,
      probability: riskScore / 100,
      keyFactors,
      topReasons,
      recommendations,
      warningTime: this.estimateDepartureTime(features, riskLevel),
    };
  }

  /**
   * 批量预测离职风险
   */
  async batchPredict(companyId: string): Promise<TurnoverRisk[]> {
    const allEmployees = await db
      .select()
      .from(employees)
      .where(eq(employees.companyId, companyId));

    const results: TurnoverRisk[] = [];

    for (const employee of allEmployees) {
      if (employee.status !== 'active') continue;

      try {
        const features = await this.extractFeatures(employee.id, companyId);
        const risk = await this.predictTurnoverRisk(features);
        
        risk.employeeName = employee.name;
        risk.position = employee.position || '';
        
        results.push(risk);
      } catch (error) {
        console.error(`预测员工 ${employee.id} 离职风险失败:`, error);
      }
    }

    // 按风险分数排序
    results.sort((a, b) => b.riskScore - a.riskScore);

    return results;
  }

  /**
   * 早期预警检测
   */
  async detectEarlyWarnings(companyId: string): Promise<TurnoverRisk[]> {
    const risks = await this.batchPredict(companyId);
    
    // 筛选出中高风险员工
    return risks.filter(risk => 
      risk.riskLevel === 'high' || risk.riskLevel === 'critical'
    );
  }

  // ==================== 私有方法 ====================

  private async getPerformanceData(employeeId: string) {
    const results = await db
      .select({ score: performance.score })
      .from(performance)
      .where(eq(performance.employeeId, employeeId));

    if (results.length === 0) {
      return { avgScore: 0, trend: 0, variance: 0, recentScore: 0 };
    }

    const scores = results.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

    return {
      avgScore: Math.round(avgScore),
      trend,
      variance,
      recentScore: scores[scores.length - 1],
    };
  }

  private async getAttendanceData(employeeId: string) {
    const results = await db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId));

    if (results.length === 0) {
      return { rate: 100, lateCount: 0, earlyLeaveCount: 0, leaveCount: 0, overtimeHours: 0 };
    }

    const presentCount = results.filter(r => r.status === 'present').length;
    const lateCount = results.filter(r => r.status === 'late').length;
    const earlyLeaveCount = results.filter(r => r.status === 'early_leave').length;
    const leaveCount = results.filter(r => r.status === 'leave').length;

    return {
      rate: Math.round((presentCount / results.length) * 100),
      lateCount,
      earlyLeaveCount,
      leaveCount,
      overtimeHours: 0, // 需要从加班记录中获取
    };
  }

  private async getBehavioralData(employeeId: string) {
    const [interviewCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviews)
      .where(eq(interviews.interviewerId, employeeId));

    return {
      interviewCount: Number(interviewCountResult.count),
      trainingCompletionRate: 80, // 需要从培训记录中计算
    };
  }

  private calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 30; // 默认年龄
    const birth = new Date(dateOfBirth);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  }

  private getPositionLevel(position?: string): number {
    if (!position) return 1;
    
    if (position.includes('总监') || position.includes('VP')) return 4;
    if (position.includes('经理')) return 3;
    if (position.includes('主管') || position.includes('组长')) return 2;
    return 1;
  }

  private calculateEngagementScore(performance: any, attendance: any): number {
    return Math.round((performance.avgScore * 0.6 + attendance.rate * 0.4));
  }

  private calculateStressLevel(performance: any, attendance: any): number {
    const stressFactors = [
      (100 - performance.avgScore) * 0.3,
      performance.variance * 0.2,
      (100 - attendance.rate) * 0.3,
      attendance.lateCount * 5,
      attendance.leaveCount * 3,
    ];
    return Math.min(100, Math.round(stressFactors.reduce((a, b) => a + b, 0)));
  }

  private calculateSatisfactionScore(performance: any, behavioral: any): number {
    return Math.round((performance.avgScore * 0.7 + behavioral.trainingCompletionRate * 0.3));
  }

  private calculateRuleBasedRisk(features: EmployeeFeature): { riskScore: number; factors: string[] } {
    let riskScore = 0;
    const factors: string[] = [];

    // 绩效下降
    if (features.performanceTrend < -10) {
      riskScore += 20;
      factors.push('绩效持续下降');
    }

    // 出勤率低
    if (features.attendanceRate < 85) {
      riskScore += 15;
      factors.push('出勤率偏低');
    }

    // 绩效波动大
    if (features.performanceVariance > 20) {
      riskScore += 10;
      factors.push('绩效波动较大');
    }

    // 高压力水平
    if (features.stressLevel > 70) {
      riskScore += 15;
      factors.push('工作压力大');
    }

    // 满意度低
    if (features.satisfactionScore < 60) {
      riskScore += 20;
      factors.push('满意度偏低');
    }

    // 参加面试频繁
    if (features.interviewCount > 3) {
      riskScore += 25;
      factors.push('频繁参与面试（可能在外求职）');
    }

    return { riskScore: Math.min(100, riskScore), factors };
  }

  private async calculateMLBasedRisk(features: EmployeeFeature): Promise<{ riskScore: number }> {
    const systemPrompt = `你是一名HR分析专家，擅长预测员工离职风险。

基于以下员工特征，预测离职风险分数（0-100）：
- 在职时长：${features.tenure}个月
- 平均绩效：${features.avgPerformanceScore}分
- 绩效趋势：${features.performanceTrend > 0 ? '上升' : features.performanceTrend < 0 ? '下降' : '稳定'}
- 出勤率：${features.attendanceRate}%
- 敬业度：${features.engagementScore}分
- 压力水平：${features.stressLevel}分
- 满意度：${features.satisfactionScore}分

返回格式（JSON）：
{
  "riskScore": 65,
  "reasoning": "风险分析说明"
}`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请预测该员工的离职风险分数。' },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { riskScore: 50 }; // 默认中等风险
    }

    const result = JSON.parse(jsonMatch[0]);
    return { riskScore: result.riskScore || 50 };
  }

  private calculateBehaviorBasedRisk(features: EmployeeFeature): { riskScore: number } {
    let riskScore = 0;

    // 行为风险指标
    if (features.interviewCount >= 3) riskScore += 30;
    if (features.trainingCompletionRate < 50) riskScore += 20;
    if (features.overtimeHours > 20) riskScore += 15;

    return { riskScore: Math.min(100, riskScore) };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 30) return 'low';
    if (score < 50) return 'medium';
    if (score < 70) return 'high';
    return 'critical';
  }

  private identifyKeyFactors(features: EmployeeFeature): Array<{ factor: string; impact: 'positive' | 'negative'; weight: number }> {
    const factors: Array<{ factor: string; impact: 'positive' | 'negative'; weight: number }> = [];

    if (features.performanceTrend < -10) {
      factors.push({ factor: '绩效下降趋势', impact: 'negative', weight: 20 });
    }
    if (features.attendanceRate < 85) {
      factors.push({ factor: '出勤率偏低', impact: 'negative', weight: 15 });
    }
    if (features.stressLevel > 70) {
      factors.push({ factor: '工作压力大', impact: 'negative', weight: 15 });
    }
    if (features.satisfactionScore < 60) {
      factors.push({ factor: '满意度偏低', impact: 'negative', weight: 20 });
    }
    if (features.interviewCount > 3) {
      factors.push({ factor: '频繁参与面试', impact: 'negative', weight: 25 });
    }
    if (features.avgPerformanceScore > 80) {
      factors.push({ factor: '优秀绩效', impact: 'positive', weight: -15 });
    }
    if (features.engagementScore > 80) {
      factors.push({ factor: '高敬业度', impact: 'positive', weight: -10 });
    }

    return factors;
  }

  private identifyTopReasons(features: EmployeeFeature, riskScore: number): string[] {
    const reasons: string[] = [];

    if (features.stressLevel > 70) reasons.push('工作压力过大');
    if (features.satisfactionScore < 60) reasons.push('工作满意度低');
    if (features.performanceTrend < -10) reasons.push('绩效下滑导致挫败感');
    if (features.attendanceRate < 85) reasons.push('工作积极性下降');
    if (features.interviewCount > 3) reasons.push('正在寻找新机会');
    if (features.overtimeHours > 20) reasons.push('长期加班导致职业倦怠');

    return reasons.length > 0 ? reasons : ['综合因素'];
  }

  private generateRecommendations(features: EmployeeFeature, riskLevel: string): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('立即安排一对一谈话了解情况');
        recommendations.push('提供压力疏导和心理支持');
        recommendations.push('考虑调整工作负荷或岗位职责');
        recommendations.push('制定个性化的留人方案');
        break;
      case 'high':
        recommendations.push('安排部门主管进行沟通');
        recommendations.push('提供职业发展机会');
        recommendations.push('改善工作环境和条件');
        recommendations.push('关注员工情绪变化');
        break;
      case 'medium':
        recommendations.push('定期跟进员工状态');
        recommendations.push('提供必要的培训和支持');
        recommendations.push('建立良好的沟通机制');
        break;
      case 'low':
        recommendations.push('保持正常的关注和支持');
        break;
    }

    return recommendations;
  }

  private estimateDepartureTime(features: EmployeeFeature, riskLevel: string): Date | undefined {
    if (riskLevel === 'critical') {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天内
    } else if (riskLevel === 'high') {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90天内
    }
    return undefined;
  }
}

// 导出单例
export const enhancedTurnoverPredictionService = new EnhancedTurnoverPredictionService();
