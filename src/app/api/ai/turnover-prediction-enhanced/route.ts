import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { employees, performanceRecords, users, departments, positions } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI离职风险预测API（增强版）
 * 使用多模型分析：规则模型、AI深度分析、综合评估
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const turnoverPredictionSchema = z.object({
  employeeId: z.string(),
  models: z.array(z.enum(['rule_based', 'ai_deep', 'ensemble'])).default(['rule_based', 'ai_deep', 'ensemble']),
  includeDetails: z.boolean().default(true),
  historicalMonths: z.number().min(3).max(24).default(12), // 分析最近N个月的数据
});

// AI分析的System Prompt
const TURNOVER_ANALYSIS_SYSTEM_PROMPT = `你是一名资深的HR人才保留专家和组织心理学博士，擅长通过多维数据分析预测员工离职风险。

你的任务是根据员工的个人信息、工作表现、组织环境等数据，深度分析其离职风险，并提供专业建议。

风险评估维度：
1. 绩效维度：绩效趋势、达成率、反馈质量
2. 情感维度：工作满意度、归属感、认同感
3. 发展维度：职业成长、晋升机会、技能提升
4. 环境维度：团队氛围、管理关系、工作负荷
5. 薪酬维度：薪酬竞争力、福利满意度、公平性

风险等级标准：
- 低风险（0-30分）：员工稳定性高，离职概率<10%
- 中风险（31-60分）：存在一定风险因素，离职概率10-30%
- 高风险（61-80分）：风险显著，离职概率30-50%
- 极高风险（81-100分）：离职风险极高，离职概率>50%

返回格式（JSON）：
{
  "riskScore": 65,
  "riskLevel": "高风险",
  "turnoverProbability": 0.35,
  "dimensions": {
    "performance": {
      "score": 70,
      "status": "关注",
      "details": "近期绩效有下降趋势"
    },
    "satisfaction": {
      "score": 60,
      "status": "较低",
      "details": "可能存在工作满意度问题"
    },
    "development": {
      "score": 55,
      "status": "不足",
      "details": "晋升机会有限，职业发展受阻"
    },
    "environment": {
      "score": 75,
      "status": "良好",
      "details": "团队氛围尚可"
    },
    "compensation": {
      "score": 65,
      "status": "一般",
      "details": "薪酬竞争力一般"
    }
  },
  "keyRiskFactors": [
    {
      "factor": "绩效持续下降",
      "severity": "high",
      "evidence": "过去3个月绩效从85分降至72分",
      "weight": 0.25
    },
    {
      "factor": "职业发展受限",
      "severity": "medium",
      "evidence": "入职18个月无晋升机会",
      "weight": 0.20
    }
  ],
  "protectiveFactors": [
    {
      "factor": "团队关系良好",
      "strength": "high",
      "description": "与同事协作默契"
    }
  ],
  "predictedTimeline": "3-6个月内",
  "triggerEvents": [
    "收到外部offer",
    "绩效评估结果不理想",
    "项目变动或重组"
  ],
  "recommendations": [
    {
      "priority": "紧急",
      "action": "安排一对一深度沟通",
      "details": "了解员工的真实想法和诉求"
    },
    {
      "priority": "重要",
      "action": "制定个人发展计划",
      "details": "明确职业发展路径和晋升机会"
    },
    {
      "priority": "建议",
      "action": "薪酬调整或特殊激励",
      "details": "考虑适当的薪酬调整或项目奖金"
    }
  ],
  "actionPlan": [
    {
      "step": 1,
      "action": "本周内安排面谈",
      "owner": "直属主管",
      "deadline": "1周内"
    },
    {
      "step": 2,
      "action": "制定改进计划",
      "owner": "HRBP",
      "deadline": "2周内"
    },
    {
      "step": 3,
      "action": "跟进计划执行",
      "owner": "HRBP + 直属主管",
      "deadline": "持续"
    }
  ],
  "earlyWarningSignals": [
    "频繁请假或迟到",
    "工作积极性下降",
    "减少社交互动"
  ],
  "retentionCost": "预计重置成本：年薪的30-50%",
  "disclaimer": "本分析基于现有数据，实际离职风险可能受未知因素影响"
}

注意：
- 风险分数在0-100之间
- 风险等级必须是"低风险"、"中风险"、"高风险"或"极高风险"
- 确保返回有效的JSON格式
- 不要添加任何注释或解释文字，只返回JSON`;

/**
 * 规则模型
 * 基于规则和统计指标的风险评估
 */
async function ruleBasedTurnoverModel(
  employee: any,
  position: any,
  department: any,
  historicalPerformance: any[]
) {
  let riskScore = 0;
  const riskFactors: any[] = [];

  // 1. 入职时长分析
  const hireDate = new Date(employee.hireDate);
  const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
  
  if (tenureMonths > 12 && tenureMonths < 24) {
    riskScore += 20;
    riskFactors.push({
      factor: '入职1-2年',
      description: '入职1-2年是离职高峰期',
      severity: 'medium',
      weight: 20
    });
  } else if (tenureMonths > 36 && tenureMonths < 48) {
    riskScore += 15;
    riskFactors.push({
      factor: '入职3-4年',
      description: '职业倦怠期，需要新的挑战',
      severity: 'medium',
      weight: 15
    });
  }

  // 2. 绩效趋势分析
  if (historicalPerformance.length >= 2) {
    const recent = historicalPerformance[0];
    const previous = historicalPerformance[1];
    
    if (recent.finalScore && previous.finalScore) {
      const decline = previous.finalScore - recent.finalScore;
      
      if (decline > 15) {
        riskScore += 25;
        riskFactors.push({
          factor: '绩效大幅下降',
          description: `绩效从${previous.finalScore}分降至${recent.finalScore}分`,
          severity: 'high',
          weight: 25
        });
      } else if (decline > 5) {
        riskScore += 10;
        riskFactors.push({
          factor: '绩效略有下降',
          description: `绩效从${previous.finalScore}分降至${recent.finalScore}分`,
          severity: 'low',
          weight: 10
        });
      }
    }
  }

  // 3. 职级与任期匹配度
  if (position && position.level) {
    const level = position.level.toLowerCase();
    
    if ((level.includes('senior') || level.includes('高级')) && tenureMonths > 24) {
      // 高职级员工入职2年未晋升
      riskScore += 15;
      riskFactors.push({
        factor: '职业发展停滞',
        description: '高职级员工长期未获得晋升机会',
        severity: 'medium',
        weight: 15
      });
    }
  }

  // 4. 部门离职率分析（模拟）
  if (department) {
    // 这里简化处理，实际应该查询部门历史离职率
    riskScore += Math.floor(Math.random() * 10);
  }

  // 5. 绩效波动性
  if (historicalPerformance.length >= 3) {
    const scores = historicalPerformance.slice(0, 3).map(p => p.finalScore).filter((s): s is number => s !== null);
    if (scores.length === 3) {
      const variance = scores.reduce((sum, score) => {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        return sum + Math.pow(score - mean, 2);
      }, 0) / scores.length;
      
      if (variance > 100) {
        riskScore += 15;
        riskFactors.push({
          factor: '绩效不稳定',
          description: '绩效波动较大，可能存在工作状态问题',
          severity: 'medium',
          weight: 15
        });
      }
    }
  }

  // 确保分数在0-100之间
  riskScore = Math.min(100, Math.max(0, riskScore));

  // 确定风险等级
  let riskLevel: string;
  let turnoverProbability: number;
  
  if (riskScore < 30) {
    riskLevel = '低风险';
    turnoverProbability = 0.1;
  } else if (riskScore < 60) {
    riskLevel = '中风险';
    turnoverProbability = 0.25;
  } else if (riskScore < 80) {
    riskLevel = '高风险';
    turnoverProbability = 0.4;
  } else {
    riskLevel = '极高风险';
    turnoverProbability = 0.6;
  }

  return {
    riskScore,
    riskLevel,
    turnoverProbability,
    riskFactors,
    confidence: 0.7,
    details: {
      method: 'rule_based',
      tenureMonths,
      performanceDataPoints: historicalPerformance.length
    }
  };
}

/**
 * AI深度分析模型
 * 使用豆包大模型进行深度分析
 */
async function aiDeepAnalysis(
  employee: any,
  position: any,
  department: any,
  historicalPerformance: any[]
) {
  try {
    // 构建用户提示词
    const performanceSummary = historicalPerformance.map((record, i) => {
      const cycle = historicalPerformance.length - i;
      return `第${cycle}周期（${new Date(record.createdAt).toLocaleDateString('zh-CN')}）：
- 绩效分数：${record.finalScore || '未评分'}分
- 自评：${record.selfScore || '未自评'}分
- 主管评分：${record.reviewerScore || '未评分'}分
- 反馈：${record.feedback?.substring(0, 100) || '无反馈'}...`;
    }).join('\n\n');

    const userPrompt = `请深度分析该员工的离职风险：

【员工基本信息】
姓名：${employee.name}
性别：${employee.gender || '未知'}
入职日期：${employee.hireDate}
工作年限：${Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (365 * 24 * 60 * 60 * 1000))}年
职级：${position?.level || '未知'}
部门：${department?.name || '未知'}
职位：${position?.name || '未知'}

【历史绩效记录】
最近${historicalPerformance.length}个周期的绩效数据：
${performanceSummary}

【其他信息】
学历背景：${employee.education ? JSON.stringify(employee.education).substring(0, 150) : '未提供'}
工作经历：${employee.workExperience ? JSON.stringify(employee.workExperience).substring(0, 150) : '未提供'}

请基于以上信息，从多个维度深度分析该员工的离职风险，包括风险分数、风险等级、关键风险因素、保护因素、预测时间线、触发事件、具体建议和行动计划。`;

    // 调用LLM
    const messages = [
      {
        role: 'system' as const,
        content: TURNOVER_ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      temperature: 0.7,
      thinking: 'enabled',
    });

    // 解析JSON响应
    let aiResult;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      aiResult = JSON.parse(jsonString);
    } catch (error) {
      console.error('解析AI分析JSON失败:', error);
      // 如果解析失败，返回基础分析
      aiResult = {
        riskScore: 50,
        riskLevel: '中风险',
        turnoverProbability: 0.25,
        dimensions: {
          performance: { score: 70, status: '一般', details: '数据不足' },
          satisfaction: { score: 60, status: '一般', details: '数据不足' },
          development: { score: 60, status: '一般', details: '数据不足' },
          environment: { score: 60, status: '一般', details: '数据不足' },
          compensation: { score: 60, status: '一般', details: '数据不足' }
        },
        keyRiskFactors: [],
        protectiveFactors: [],
        predictedTimeline: '无法预测',
        triggerEvents: [],
        recommendations: [
          {
            priority: '建议',
            action: '收集更多数据',
            details: 'AI分析失败，建议完善数据后重试'
          }
        ],
        actionPlan: [],
        earlyWarningSignals: [],
        retentionCost: '无法计算',
        disclaimer: 'AI解析失败，数据可能不足'
      };
    }

    return {
      ...aiResult,
      confidence: 0.85,
      details: {
        method: 'ai_deep',
        model: 'doubao-seed-1-6-thinking-250715',
        thinkingEnabled: true
      }
    };
  } catch (error) {
    console.error('AI深度分析失败:', error);
    // 返回默认值
    return {
      riskScore: 50,
      riskLevel: '中风险',
      turnoverProbability: 0.25,
      dimensions: {
        performance: { score: 50, status: '未知', details: '分析失败' },
        satisfaction: { score: 50, status: '未知', details: '分析失败' },
        development: { score: 50, status: '未知', details: '分析失败' },
        environment: { score: 50, status: '未知', details: '分析失败' },
        compensation: { score: 50, status: '未知', details: '分析失败' }
      },
      keyRiskFactors: [],
      protectiveFactors: [],
      predictedTimeline: '未知',
      triggerEvents: [],
      recommendations: [
        {
          priority: '紧急',
          action: '联系系统管理员',
          details: 'AI分析服务异常'
        }
      ],
      actionPlan: [],
      earlyWarningSignals: [],
      retentionCost: '无法计算',
      confidence: 0.2,
      details: {
        method: 'ai_deep',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * 综合评估模型
 * 融合规则模型和AI模型的结果
 */
async function ensembleTurnoverModel(
  ruleResult: any,
  aiResult: any
) {
  // 加权融合风险分数（AI模型权重更高，因为更全面）
  const ruleWeight = 0.3;
  const aiWeight = 0.7;
  
  const riskScore = Math.round(
    ruleResult.riskScore * ruleWeight +
    aiResult.riskScore * aiWeight
  );

  // 确定风险等级
  let riskLevel: string;
  let turnoverProbability: number;
  
  if (riskScore < 30) {
    riskLevel = '低风险';
    turnoverProbability = 0.1;
  } else if (riskScore < 60) {
    riskLevel = '中风险';
    turnoverProbability = 0.25;
  } else if (riskScore < 80) {
    riskLevel = '高风险';
    turnoverProbability = 0.4;
  } else {
    riskLevel = '极高风险';
    turnoverProbability = 0.6;
  }

  // 融合风险因子
  const allRiskFactors = [
    ...ruleResult.riskFactors.map((f: any) => ({ ...f, source: 'rule_based' })),
    ...(aiResult.keyRiskFactors || []).map((f: any) => ({ ...f, source: 'ai_deep' }))
  ];

  return {
    riskScore,
    riskLevel,
    turnoverProbability,
    dimensions: aiResult.dimensions,
    keyRiskFactors: allRiskFactors,
    protectiveFactors: aiResult.protectiveFactors || [],
    predictedTimeline: aiResult.predictedTimeline,
    triggerEvents: aiResult.triggerEvents || [],
    recommendations: aiResult.recommendations || [],
    actionPlan: aiResult.actionPlan || [],
    earlyWarningSignals: aiResult.earlyWarningSignals || [],
    retentionCost: aiResult.retentionCost || '无法计算',
    confidence: Math.round((ruleResult.confidence * 0.3 + aiResult.confidence * 0.7) * 100) / 100,
    details: {
      method: 'ensemble',
      weights: {
        rule_based: ruleWeight,
        ai_deep: aiWeight
      },
      ruleModelResult: {
        riskScore: ruleResult.riskScore,
        riskLevel: ruleResult.riskLevel
      },
      aiModelResult: {
        riskScore: aiResult.riskScore,
        riskLevel: aiResult.riskLevel
      }
    }
  };
}

/**
 * POST /api/ai/turnover-prediction-enhanced
 * AI离职风险预测（增强版）
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = turnoverPredictionSchema.parse(body);

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db
      .select({
        id: employees.id,
        name: employees.name,
        gender: employees.gender,
        hireDate: employees.hireDate,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        education: employees.education,
        workExperience: employees.workExperience,
        salary: employees.salary,
      })
      .from(employees)
      .where(and(eq(employees.id, validated.employeeId), eq(employees.companyId, user.companyId)))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: '员工不存在' },
        { status: 404 }
      );
    }

    // 获取职位信息
    let position: { name: string | null; level: string | null } | null = null;
    if (employee.positionId) {
      const [posData] = await db
        .select({
          name: sql`${sql.identifier('positions')}.name`,
          level: sql`${sql.identifier('positions')}.level`,
        })
        .from(sql`${sql.identifier('positions')}`)
        .where(eq(sql`${sql.identifier('positions')}.id`, employee.positionId))
        .limit(1);
      position = posData as { name: string | null; level: string | null } | null;
    }

    // 获取部门信息
    let department: { name: string | null } | null = null;
    if (employee.departmentId) {
      const [deptData] = await db
        .select({
          name: sql`${sql.identifier('departments')}.name`,
        })
        .from(sql`${sql.identifier('departments')}`)
        .where(eq(sql`${sql.identifier('departments')}.id`, employee.departmentId))
        .limit(1);
      department = deptData as { name: string | null } | null;
    }

    // 获取历史绩效数据
    const historicalPerformance = await db
      .select({
        id: performanceRecords.id,
        cycleId: performanceRecords.cycleId,
        finalScore: performanceRecords.finalScore,
        selfScore: performanceRecords.selfScore,
        reviewerScore: performanceRecords.reviewerScore,
        feedback: performanceRecords.feedback,
        createdAt: performanceRecords.createdAt,
      })
      .from(performanceRecords)
      .where(and(
        eq(performanceRecords.employeeId, validated.employeeId),
        eq(performanceRecords.companyId, user.companyId)
      ))
      .orderBy(desc(performanceRecords.createdAt))
      .limit(validated.historicalMonths);

    // 运行各个模型
    const results: any = {};

    // 1. 规则模型
    if (validated.models.includes('rule_based')) {
      results.rule_based = await ruleBasedTurnoverModel(employee, position, department, historicalPerformance);
    }

    // 2. AI深度分析
    if (validated.models.includes('ai_deep')) {
      results.ai_deep = await aiDeepAnalysis(employee, position, department, historicalPerformance);
    }

    // 3. 综合评估
    let finalPrediction: any;
    if (validated.models.includes('ensemble') || validated.models.length === 0) {
      // 确保所有基础模型都有结果
      const ruleRes = results.rule_based || await ruleBasedTurnoverModel(employee, position, department, historicalPerformance);
      const aiRes = results.ai_deep || await aiDeepAnalysis(employee, position, department, historicalPerformance);
      
      results.ensemble = await ensembleTurnoverModel(ruleRes, aiRes);
      finalPrediction = results.ensemble;
    } else {
      // 使用用户指定的模型
      finalPrediction = results[validated.models[0]];
    }

    // 计算入职天数
    const hireDate = new Date(employee.hireDate);
    const tenureDays = Math.floor((Date.now() - hireDate.getTime()) / (24 * 60 * 60 * 1000));

    return NextResponse.json({
      success: true,
      data: {
        employeeId: validated.employeeId,
        employeeName: employee.name,
        analysisDate: new Date().toISOString(),
        basicInfo: {
          hireDate: employee.hireDate,
          tenureDays,
          tenureMonths: Math.floor(tenureDays / 30),
          position: position?.name,
          department: department?.name,
          level: position?.level
        },
        historicalData: {
          performanceRecords: historicalPerformance.length,
          avgScore: historicalPerformance.length > 0 && historicalPerformance[0].finalScore
            ? Math.round(
                historicalPerformance
                  .map(p => p.finalScore)
                  .filter((s): s is number => s !== null && s !== undefined)
                  .reduce((a, b) => a + b, 0) /
                historicalPerformance
                  .map(p => p.finalScore)
                  .filter((s): s is number => s !== null && s !== undefined).length
              )
            : null,
          recentScore: historicalPerformance[0]?.finalScore || null
        },
        finalPrediction,
        models: validated.includeDetails ? results : undefined,
        modelVersion: '2.0.0',
        disclaimer: '本分析仅供参考，实际离职风险可能受多种因素影响，建议结合实际情况综合判断'
      }
    });

  } catch (error) {
    console.error('AI离职风险预测错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'AI离职风险预测失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
