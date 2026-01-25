import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { performanceRecords, employees, users } from '@/storage/database/shared/schema';
import { eq, and, desc, avg, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI绩效预测API（多模型融合）
 * 支持多种预测模型：统计趋势、特征规则、AI大模型、综合融合
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const performancePredictionSchema = z.object({
  employeeId: z.string(),
  predictionPeriod: z.enum(['next_month', 'next_quarter', 'next_year']).default('next_quarter'),
  models: z.array(z.enum(['statistical', 'rule_based', 'ai_model', 'ensemble'])).default(['statistical', 'rule_based', 'ai_model', 'ensemble']),
  includeDetails: z.boolean().default(true),
  historicalCycles: z.number().min(1).max(12).default(6), // 使用最近N个周期的数据
});

// AI预测的System Prompt
const PERFORMANCE_PREDICTION_SYSTEM_PROMPT = `你是一名资深的人力资源绩效分析师和AI专家，擅长通过多维度数据分析预测员工未来的绩效表现。

你的任务是根据员工的个人信息、历史绩效、工作特征等数据，预测其未来一个周期的绩效表现。

预测维度：
1. 绩效得分预测（0-100分）
2. 绩效趋势判断（上升/稳定/下降）
3. 关键优势识别
4. 潜在风险预警
5. 提升建议

预测依据：
- 历史绩效数据：过往绩效评分、趋势变化
- 工作经验：入职时长、职级、部门
- 个人特征：教育背景、工作经历
- 行为模式：请假记录、加班情况等

返回格式（JSON）：
{
  "predictedScore": 85,
  "trend": "上升",
  "confidence": 0.85,
  "dimensions": {
    "workQuality": 87,
    "efficiency": 83,
    "collaboration": 88,
    "innovation": 80
  },
  "strengths": [
    "技术能力突出，能快速解决复杂问题",
    "团队协作能力强，积极参与知识分享"
  ],
  "risks": [
    "可能存在工作倦怠风险，建议适当调整工作节奏"
  ],
  "recommendations": [
    "建议提供更多技术挑战项目以保持工作积极性",
    "可考虑参与跨部门项目，拓宽视野"
  ],
  "keyFactors": [
    {
      "factor": "历史绩效趋势",
      "value": "持续上升",
      "impact": "positive",
      "weight": 0.3
    },
    {
      "factor": "工作年限",
      "value": "3年",
      "impact": "positive",
      "weight": 0.2
    }
  ],
  "disclaimer": "本预测仅供参考，实际绩效可能受多种因素影响"
}

注意：
- 预测分数应在0-100之间
- 趋势只能是"上升"、"稳定"或"下降"
- 确保返回有效的JSON格式
- 不要添加任何注释或解释文字，只返回JSON`;

/**
 * 统计趋势模型
 * 基于历史绩效数据的趋势分析
 */
async function statisticalTrendModel(
  historicalScores: number[],
  predictionPeriod: string
) {
  if (historicalScores.length === 0) {
    return {
      predictedScore: 75,
      trend: 'stable',
      confidence: 0.3,
      details: {
        method: 'statistical_trend',
        reason: '无历史数据，使用平均值'
      }
    };
  }

  // 计算平均分
  const avgScore = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
  
  // 计算趋势（线性回归）
  const n = historicalScores.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += historicalScores[i];
    sumXY += i * historicalScores[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 预测下一个周期的分数
  const nextIndex = n;
  const predictedScore = Math.max(0, Math.min(100, slope * nextIndex + intercept));
  
  // 判断趋势
  let trend: '上升' | '稳定' | '下降';
  if (slope > 2) {
    trend = '上升';
  } else if (slope < -2) {
    trend = '下降';
  } else {
    trend = '稳定';
  }
  
  // 计算置信度（基于历史数据量和一致性）
  const confidence = Math.min(0.95, 0.5 + (n / 20) * 0.4);
  
  return {
    predictedScore: Math.round(predictedScore),
    trend,
    confidence: Math.round(confidence * 100) / 100,
    details: {
      method: 'statistical_trend',
      avgScore: Math.round(avgScore),
      slope: Math.round(slope * 100) / 100,
      dataPoints: n
    }
  };
}

/**
 * 特征规则模型
 * 基于员工特征的规则预测
 */
async function ruleBasedModel(employee: any, position: any, historicalScores: number[]) {
  let baseScore = 75;
  let adjustments: { factor: string; value: string; adjustment: number }[] = [];
  
  // 入职时长调整
  const hireDate = new Date(employee.hireDate);
  const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
  
  if (tenureMonths < 3) {
    baseScore -= 5;
    adjustments.push({ factor: '入职时长', value: '<3个月', adjustment: -5 });
  } else if (tenureMonths > 12 && tenureMonths < 24) {
    baseScore += 3;
    adjustments.push({ factor: '入职时长', value: '1-2年', adjustment: 3 });
  } else if (tenureMonths > 36) {
    baseScore += 5;
    adjustments.push({ factor: '入职时长', value: '>3年', adjustment: 5 });
  }
  
  // 职级调整
  if (position && position.level) {
    const level = position.level.toLowerCase();
    if (level.includes('senior') || level.includes('高级')) {
      baseScore += 5;
      adjustments.push({ factor: '职级', value: '高级', adjustment: 5 });
    } else if (level.includes('junior') || level.includes('初级')) {
      baseScore -= 3;
      adjustments.push({ factor: '职级', value: '初级', adjustment: -3 });
    }
  }
  
  // 历史绩效一致性调整
  if (historicalScores.length >= 3) {
    const lastThree = historicalScores.slice(0, 3);
    const variance = lastThree.reduce((sum, score) => {
      const mean = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
      return sum + Math.pow(score - mean, 2);
    }, 0) / lastThree.length;
    
    if (variance < 20) {
      baseScore += 3;
      adjustments.push({ factor: '绩效稳定性', value: '高', adjustment: 3 });
    } else if (variance > 100) {
      baseScore -= 5;
      adjustments.push({ factor: '绩效稳定性', value: '低', adjustment: -5 });
    }
  }
  
  const predictedScore = Math.max(0, Math.min(100, baseScore));
  
  let trend: '上升' | '稳定' | '下降';
  if (historicalScores.length >= 2) {
    const recent = historicalScores[0];
    const previous = historicalScores[1];
    if (recent > previous + 5) {
      trend = '上升';
    } else if (recent < previous - 5) {
      trend = '下降';
    } else {
      trend = '稳定';
    }
  } else {
    trend = '稳定';
  }
  
  return {
    predictedScore,
    trend,
    confidence: 0.7,
    details: {
      method: 'rule_based',
      adjustments,
      tenureMonths,
      baseScore: 75
    }
  };
}

/**
 * AI大模型预测
 * 使用豆包大模型进行深度预测
 */
async function aiModelPrediction(
  employee: any,
  position: any,
  department: any,
  historicalScores: number[],
  historicalRecords: any[]
) {
  try {
    // 构建用户提示词
    const userPrompt = `请预测该员工未来一个周期的绩效表现：

【员工基本信息】
姓名：${employee.name}
性别：${employee.gender || '未知'}
入职日期：${employee.hireDate}
工作年限：${Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (365 * 24 * 60 * 60 * 1000))}年
职级：${position?.level || '未知'}
部门：${department?.name || '未知'}
职位：${position?.name || '未知'}

【历史绩效数据】
最近${historicalRecords.length}个周期的绩效分数：${historicalScores.join(', ')}
详细记录：
${historicalRecords.map((record, i) => 
  `- 第${historicalRecords.length - i}周期：${record.finalScore}分 (${record.feedback?.substring(0, 50) || '无反馈'}...)`
).join('\n')}

【其他信息】
学历背景：${employee.education ? JSON.stringify(employee.education).substring(0, 100) : '未提供'}
工作经历：${employee.workExperience ? JSON.stringify(employee.workExperience).substring(0, 100) : '未提供'}

请基于以上信息，预测该员工未来一个季度的绩效表现，包括预测分数、趋势、优势、风险和建议。`;

    // 调用LLM
    const messages = [
      {
        role: 'system' as const,
        content: PERFORMANCE_PREDICTION_SYSTEM_PROMPT,
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
      console.error('解析AI预测JSON失败:', error);
      // 如果解析失败，返回基础预测
      aiResult = {
        predictedScore: 75,
        trend: '稳定',
        confidence: 0.5,
        dimensions: {
          workQuality: 75,
          efficiency: 75,
          collaboration: 75,
          innovation: 75
        },
        strengths: ['数据不足，无法准确预测'],
        risks: [],
        recommendations: ['建议收集更多历史数据'],
        keyFactors: [],
        disclaimer: 'AI解析失败，使用默认值'
      };
    }

    return {
      ...aiResult,
      details: {
        method: 'ai_model',
        model: 'doubao-seed-1-6-thinking-250715',
        thinkingEnabled: true
      }
    };
  } catch (error) {
    console.error('AI预测失败:', error);
    // 返回默认值
    return {
      predictedScore: 75,
      trend: '稳定',
      confidence: 0.3,
      dimensions: {
        workQuality: 75,
        efficiency: 75,
        collaboration: 75,
        innovation: 75
      },
      strengths: [],
      risks: ['AI预测失败'],
      recommendations: ['请联系系统管理员'],
      keyFactors: [],
      details: {
        method: 'ai_model',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * 综合融合模型
 * 加权融合多个模型的结果
 */
async function ensembleModel(
  statisticalResult: any,
  ruleBasedResult: any,
  aiResult: any
) {
  // 根据置信度确定权重
  const totalConfidence = statisticalResult.confidence + ruleBasedResult.confidence + (aiResult.confidence || 0.5);
  
  const statWeight = statisticalResult.confidence / totalConfidence;
  const ruleWeight = ruleBasedResult.confidence / totalConfidence;
  const aiWeight = (aiResult.confidence || 0.5) / totalConfidence;
  
  // 加权平均预测分数
  const predictedScore = Math.round(
    statisticalResult.predictedScore * statWeight +
    ruleBasedResult.predictedScore * ruleWeight +
    aiResult.predictedScore * aiWeight
  );
  
  // 融合趋势判断（取置信度最高的模型）
  const maxConfidenceModel = [
    { name: 'statistical', confidence: statisticalResult.confidence, trend: statisticalResult.trend },
    { name: 'rule_based', confidence: ruleBasedResult.confidence, trend: ruleBasedResult.trend },
    { name: 'ai', confidence: aiResult.confidence || 0.5, trend: aiResult.trend }
  ].sort((a, b) => b.confidence - a.confidence)[0];
  
  // 综合置信度
  const confidence = Math.round(
    (statisticalResult.confidence * 0.3 +
     ruleBasedResult.confidence * 0.3 +
     (aiResult.confidence || 0.5) * 0.4) * 100
  ) / 100;
  
  return {
    predictedScore,
    trend: maxConfidenceModel.trend,
    confidence,
    details: {
      method: 'ensemble',
      weights: {
        statistical: Math.round(statWeight * 100) / 100,
        rule_based: Math.round(ruleWeight * 100) / 100,
        ai: Math.round(aiWeight * 100) / 100
      },
      modelVotes: {
        statistical: statisticalResult.trend,
        rule_based: ruleBasedResult.trend,
        ai: aiResult.trend
      }
    },
    aiDetails: aiResult // 保留AI的详细分析
  };
}

/**
 * POST /api/ai/performance-prediction
 * AI绩效预测
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = performancePredictionSchema.parse(body);

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
    let position = null;
    if (employee.positionId) {
      const [posData] = await db
        .select()
        .from(sql`${sql.identifier('positions')}`)
        .where(eq(sql`${sql.identifier('positions')}.id`, employee.positionId))
        .limit(1);
      position = posData;
    }

    // 获取部门信息
    let department = null;
    if (employee.departmentId) {
      const [deptData] = await db
        .select()
        .from(sql`${sql.identifier('departments')}`)
        .where(eq(sql`${sql.identifier('departments')}.id`, employee.departmentId))
        .limit(1);
      department = deptData;
    }

    // 获取历史绩效数据
    const historicalRecords = await db
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
      .limit(validated.historicalCycles);

    const historicalScores = historicalRecords
      .map(r => r.finalScore)
      .filter((s): s is number => s !== null && s !== undefined);

    // 运行各个模型
    const results: any = {};

    // 1. 统计趋势模型
    if (validated.models.includes('statistical')) {
      results.statistical = await statisticalTrendModel(historicalScores, validated.predictionPeriod);
    }

    // 2. 特征规则模型
    if (validated.models.includes('rule_based')) {
      results.rule_based = await ruleBasedModel(employee, position, historicalScores);
    }

    // 3. AI大模型
    if (validated.models.includes('ai_model')) {
      results.ai_model = await aiModelPrediction(employee, position, department, historicalScores, historicalRecords);
    }

    // 4. 综合融合模型
    let finalPrediction: any;
    if (validated.models.includes('ensemble') || validated.models.length === 0) {
      // 确保所有基础模型都有结果
      const statRes = results.statistical || await statisticalTrendModel(historicalScores, validated.predictionPeriod);
      const ruleRes = results.rule_based || await ruleBasedModel(employee, position, historicalScores);
      const aiRes = results.ai_model || await aiModelPrediction(employee, position, department, historicalScores, historicalRecords);
      
      results.ensemble = await ensembleModel(statRes, ruleRes, aiRes);
      finalPrediction = results.ensemble;
    } else {
      // 使用用户指定的模型
      finalPrediction = results[validated.models[0]];
    }

    // 预测周期说明
    const periodMap = {
      next_month: '下一个月',
      next_quarter: '下一个季度',
      next_year: '下一年'
    };

    return NextResponse.json({
      success: true,
      data: {
        employeeId: validated.employeeId,
        employeeName: employee.name,
        predictionPeriod: periodMap[validated.predictionPeriod],
        predictionDate: new Date().toISOString(),
        historicalData: {
          scores: historicalScores,
          cycles: historicalRecords.length,
          avgScore: historicalScores.length > 0 
            ? Math.round(historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length)
            : null
        },
        finalPrediction,
        models: validated.includeDetails ? results : undefined,
        modelVersion: '2.0.0'
      }
    });

  } catch (error) {
    console.error('AI绩效预测错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'AI绩效预测失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
