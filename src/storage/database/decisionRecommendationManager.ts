import { getDb } from '@/lib/db';
import {
  decisionRecommendations,
  actionPlans,
} from './shared/schema';
import { eq, and } from 'drizzle-orm';

export interface RecommendationInput {
  companyId: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  relatedMetricCode?: string;
  requestedBy: string;
}

export interface RecommendationResult {
  recommendation: string;
  actionSteps: Array<{
    step: number;
    title: string;
    description: string;
    estimatedTime: string;
    responsible: string;
  }>;
  expectedImpact: {
    metric: string;
    improvement: string;
    timeline: string;
  };
  resourceNeeds: {
    budget?: number;
    time: string;
    people: number;
    skills: string[];
  };
  risks: Array<{
    risk: string;
    mitigation: string;
  }>;
  successMetrics: Array<{
    metric: string;
    target: string;
  }>;
}

export class DecisionRecommendationManager {
  /**
   * 调用豆包大模型生成决策建议
   */
  static async generateWithAI(
    metricCode: string,
    metricValue: number,
    context: {
      metricName: string;
      metricDescription: string;
      currentValue: number;
      benchmark?: number;
      trend: 'up' | 'down' | 'stable';
      alerts?: any[];
      attributionAnalysis?: any;
      predictionAnalysis?: any;
    }
  ): Promise<RecommendationResult> {
    const isPositive = context.trend === 'up';
    const hasAlert = context.alerts && context.alerts.length > 0;

    const prompt = `你是一个资深的人力资源管理专家和战略顾问。请基于企业的人效数据，生成具体的、可执行的决策建议。

指标信息：
- 指标名称：${context.metricName}
- 指标代码：${metricCode}
- 指标说明：${context.metricDescription}
- 当前值：${context.currentValue}
- 行业基准：${context.benchmark || '暂无'}
- 变化趋势：${context.trend === 'up' ? '上升' : context.trend === 'down' ? '下降' : '稳定'}

预警信息：
${hasAlert ? `有 ${context.alerts?.length} 条预警` : '当前无预警'}

归因分析：
${context.attributionAnalysis ? JSON.stringify(context.attributionAnalysis, null, 2) : '暂无'}

预测分析：
${context.predictionAnalysis ? JSON.stringify(context.predictionAnalysis, null, 2) : '暂无'}

企业背景：
${JSON.stringify(context, null, 2)}

请以JSON格式返回决策建议，包含以下字段：
{
  "recommendation": "核心建议内容（简洁有力，3-5句话）",
  "actionSteps": [
    {
      "step": 步骤序号,
      "title": "步骤标题",
      "description": "详细说明",
      "estimatedTime": "预计时间（如：1周、2周、1个月）",
      "responsible": "建议负责人角色"
    }
  ],
  "expectedImpact": {
    "metric": "影响的指标名称",
    "improvement": "预期改善幅度",
    "timeline": "见效周期"
  },
  "resourceNeeds": {
    "budget": 预算金额（元）,
    "time": "所需时间",
    "people": 需要的人数,
    "skills": ["所需技能1", "所需技能2"]
  },
  "risks": [
    {
      "risk": "潜在风险",
      "mitigation": "缓解措施"
    }
  ],
  "successMetrics": [
    {
      "metric": "成功指标",
      "target": "目标值"
    }
  ]
}

要求：
1. 建议要具体可操作，避免空泛
2. 行动步骤要有逻辑顺序，循序渐进
3. 资源评估要合理，考虑企业实际承受能力
4. 风险识别要全面，缓解措施要可行
5. 成功指标要可衡量，能够跟踪执行效果
6. 考虑优先级和紧急程度，给出合理的时间安排`;

    try {
      const response = await fetch('/api/ai/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          metricCode,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('调用AI服务失败');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AI决策建议生成失败:', error);

      // 返回默认建议
      return {
        recommendation: `建议定期监控${context.metricName}指标，关注变化趋势，及时采取相应措施。建立数据驱动的决策机制，结合业务实际情况进行调整和优化。`,
        actionSteps: [
          {
            step: 1,
            title: '建立监控机制',
            description: '建立该指标的定期监控机制，设置合理的预警阈值',
            estimatedTime: '1周',
            responsible: 'HR管理者',
          },
          {
            step: 2,
            title: '分析根本原因',
            description: '深入分析指标变化的根本原因，确定关键影响因素',
            estimatedTime: '2周',
            responsible: 'HR分析师',
          },
          {
            step: 3,
            title: '制定改进计划',
            description: '基于分析结果，制定具体的改进计划和行动方案',
            estimatedTime: '1个月',
            responsible: 'HR管理者+业务部门',
          },
          {
            step: 4,
            title: '执行与跟踪',
            description: '执行改进计划，持续跟踪效果，及时调整策略',
            estimatedTime: '持续进行',
            responsible: 'HR管理者',
          },
        ],
        expectedImpact: {
          metric: context.metricName,
          improvement: '持续改善',
          timeline: '3-6个月',
        },
        resourceNeeds: {
          budget: 50000,
          time: '3个月',
          people: 2,
          skills: ['数据分析', '项目管理'],
        },
        risks: [
          {
            risk: '执行力度不足',
            mitigation: '建立定期检查机制，确保计划落实',
          },
          {
            risk: '外部环境变化',
            mitigation: '保持灵活性，及时调整策略',
          },
        ],
        successMetrics: [
          {
            metric: context.metricName,
            target: '达到或超过目标值',
          },
        ],
      };
    }
  }

  /**
   * 创建决策建议
   */
  static async createRecommendation(input: RecommendationInput, result: RecommendationResult) {
    const db = await getDb();

    const [record] = await db
      .insert(decisionRecommendations)
      .values({
        companyId: input.companyId,
        type: input.type,
        priority: input.priority,
        title: input.title,
        description: input.description,
        recommendation: result.recommendation,
        expectedImpact: result.expectedImpact as any,
        actionSteps: result.actionSteps as any,
        resourceNeeds: result.resourceNeeds as any,
        relatedMetricCode: input.relatedMetricCode,
        status: 'pending',
        aiGenerated: true,
        requestedBy: input.requestedBy,
      })
      .returning();

    return record;
  }

  /**
   * 创建行动计划
   */
  static async createActionPlan(
    recommendationId: string,
    input: {
      companyId: string;
      name: string;
      description: string;
      targetMetricCode?: string;
      targetValue?: number;
      startAt: Date;
      endAt: Date;
      tasks: any[];
      budget?: number;
      responsibleUserId: string;
      createdBy: string;
    }
  ) {
    const db = await getDb();

    const [record] = await db
      .insert(actionPlans)
      .values({
        recommendationId,
        companyId: input.companyId,
        name: input.name,
        description: input.description,
        targetMetricCode: input.targetMetricCode,
        targetValue: input.targetValue,
        startAt: input.startAt,
        endAt: input.endAt,
        tasks: input.tasks,
        budget: input.budget,
        responsibleUserId: input.responsibleUserId,
        status: 'planning',
        progress: 0,
        createdBy: input.createdBy,
      })
      .returning();

    return record;
  }

  /**
   * 更新建议状态
   */
  static async updateStatus(
    id: string,
    status: string,
    feedback?: string,
    effectiveness?: number,
    assignedTo?: string
  ) {
    const db = await getDb();

    const [record] = await db
      .update(decisionRecommendations)
      .set({
        status,
        feedback,
        effectiveness,
        assignedTo,
        updatedAt: new Date(),
      })
      .where(eq(decisionRecommendations.id, id))
      .returning();

    return record;
  }

  /**
   * 获取建议列表
   */
  static async getList(
    companyId: string,
    filters?: {
      type?: string;
      status?: string;
      priority?: string;
    }
  ) {
    const db = await getDb();

    const conditions = [eq(decisionRecommendations.companyId, companyId)];
    if (filters?.type) {
      conditions.push(eq(decisionRecommendations.type, filters.type));
    }
    if (filters?.status) {
      conditions.push(eq(decisionRecommendations.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(decisionRecommendations.priority, filters.priority));
    }

    return await db
      .select()
      .from(decisionRecommendations)
      .where(and(...conditions))
      .orderBy(decisionRecommendations.createdAt)
      .limit(50);
  }

  /**
   * 获取待处理的高优先级建议
   */
  static async getHighPriorityPending(companyId: string) {
    const db = await getDb();

    return await db
      .select()
      .from(decisionRecommendations)
      .where(eq(decisionRecommendations.companyId, companyId))
      .orderBy(decisionRecommendations.priority)
      .limit(10);
  }

  /**
   * 获取建议详情
   */
  static async getById(id: string) {
    const db = await getDb();

    const [record] = await db
      .select()
      .from(decisionRecommendations)
      .where(eq(decisionRecommendations.id, id));

    return record;
  }

  /**
   * 获取相关行动计划
   */
  static async getActionPlans(recommendationId: string) {
    const db = await getDb();

    return await db
      .select()
      .from(actionPlans)
      .where(eq(actionPlans.recommendationId, recommendationId))
      .orderBy(actionPlans.createdAt);
  }
}

export default DecisionRecommendationManager;
