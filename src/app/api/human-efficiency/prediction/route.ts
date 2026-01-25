import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { requireAuth } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { employees, departments, positions } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

/**
 * 人才预测API - 基于豆包大模型的人才缺口与流失预测
 * 提供季度人才需求预测、内部调岗建议、培训需求分析等
 */

// 初始化LLM客户端
const llmConfig = new Config();
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const predictionRequestSchema = z.object({
  companyId: z.string().optional(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).default('Q2'),
  year: z.number().min(2024).max(2030).default(2025),
  includeInternalTransfer: z.boolean().default(true),
  includeTrainingNeeds: z.boolean().default(true),
  includeRecruitmentPlan: z.boolean().default(true),
});

// AI预测的System Prompt
const TALENT_PREDICTION_SYSTEM_PROMPT = `你是一名专业的人才规划专家和AI分析师，擅长通过数据分析和机器学习预测企业人才需求。

你的任务是根据企业的业务规划、历史数据、项目需求等信息，预测未来的人才缺口、流失风险，并提供专业的人才管理建议。

预测维度：
1. 人才缺口预测：基于业务增长和项目需求，预测未来季度的人才缺口
2. 流失风险预测：分析员工流失风险，识别高风险员工
3. 内部调岗建议：基于技能匹配，推荐内部人才流动方案
4. 培训需求分析：识别技能缺口，制定培训计划
5. 招聘计划建议：提供外部招聘方案和预算估算

返回格式（JSON）：
{
  "talentGap": {
    "totalGap": 8,
    "bySkill": [
      {
        "skill": "AI开发",
        "demand": 15,
        "available": 8,
        "gap": 7,
        "urgency": "high"
      },
      {
        "skill": "数据分析",
        "demand": 12,
        "available": 10,
        "gap": 2,
        "urgency": "medium"
      }
    ]
  },
  "turnoverRisk": {
    "highRisk": [
      {
        "employeeId": "EMP001",
        "name": "张三",
        "department": "研发部",
        "role": "前端开发",
        "riskScore": 85,
        "riskFactors": [
          "绩效持续下降",
          "薪酬竞争力不足",
          "职业发展受限"
        ],
        "recommendation": "提供晋升机会和薪酬调整"
      }
    ],
    "mediumRisk": [
      {
        "employeeId": "EMP002",
        "name": "李四",
        "department": "市场部",
        "role": "市场专员",
        "riskScore": 55,
        "riskFactors": [
          "工作负荷过高"
        ],
        "recommendation": "优化工作分配，提供支持"
      }
    ],
    "overallTurnoverRate": 12.5
  },
  "internalTransfer": [
    {
      "employeeId": "EMP003",
      "name": "王五",
      "currentRole": "传统开发工程师",
      "currentDepartment": "研发部",
      "suggestedRole": "AI开发工程师",
      "targetDepartment": "研发部",
      "matchScore": 85,
      "trainingNeeds": [
        "Python编程",
        "机器学习基础",
        "TensorFlow框架"
      ],
      "timeline": "2个月",
      "expectedROI": 4.2
    }
  ],
  "trainingNeeds": [
    {
      "skill": "AI开发",
      "targetEmployees": 15,
      "currentSkillLevel": "初级",
      "targetSkillLevel": "中级",
      "duration": "3个月",
      "estimatedCost": 450000,
      "expectedROI": 4.2,
      "urgency": "high"
    },
    {
      "skill": "数据分析",
      "targetEmployees": 10,
      "currentSkillLevel": "初级",
      "targetSkillLevel": "中级",
      "duration": "2个月",
      "estimatedCost": 200000,
      "expectedROI": 3.8,
      "urgency": "medium"
    }
  ],
  "recruitmentPlan": [
    {
      "role": "AI开发工程师",
      "count": 7,
      "urgency": "high",
      "budget": 800000,
      "timeline": "3个月",
      "requiredSkills": [
        "Python",
        "机器学习",
        "深度学习"
      ],
      "experience": "3年以上",
      "salaryRange": "25000-35000元/月"
    },
    {
      "role": "云计算工程师",
      "count": 4,
      "urgency": "medium",
      "budget": 400000,
      "timeline": "2个月",
      "requiredSkills": [
        "AWS/Azure",
        "Docker",
        "Kubernetes"
      ],
      "experience": "2年以上",
      "salaryRange": "20000-30000元/月"
    }
  ],
  "summary": {
    "overallGap": 8人,
    "criticalGap": 7人（AI开发）,
    "recommendedActions": [
      "优先启动AI开发专项招聘（7人）",
      "实施内部技能转换培训（15人）",
      "建立关键人才保留机制"
    ],
    "expectedImpact": "填补人才缺口后，预计项目交付效率提升25%"
  },
  "confidenceLevel": 85,
  "dataQuality": "良好"
}

分析要求：
1. 基于数据：所有预测必须基于提供的历史数据和业务规划
2. 实用性：建议必须具体可执行，包含时间线和成本
3. ROI导向：优先推荐高ROI的方案
4. 分级管理：按照紧急程度对风险和建议进行分级
5. 可信度：标注预测的置信度和数据质量`;

// 获取公司人才数据
async function getCompanyTalentData(db: any, companyId: string) {
  try {
    // 获取员工数据
    const employeeList = await db
      .select()
      .from(employees)
      .where(eq(employees.companyId, companyId));

    // 获取部门数据
    const departmentList = await db
      .select()
      .from(departments)
      .where(eq(departments.companyId, companyId));

    // 获取职位数据
    const positionList = await db
      .select()
      .from(positions)
      .where(eq(positions.companyId, companyId));

    // 统计各部门人数
    const departmentStats = departmentList.map((dept: any) => ({
      ...dept,
      employeeCount: employeeList.filter((e: any) => e.departmentId === dept.id).length,
    }));

    // 统计各职位人数
    const positionStats = positionList.map((pos: any) => ({
      ...pos,
      employeeCount: employeeList.filter((e: any) => e.positionId === pos.id).length,
    }));

    // 模拟历史数据（实际应从数据库获取）
    const historicalData = {
      employeeGrowthRate: 8.5,
      turnoverRate: 12.5,
      avgTenure: 2.3,
      skillMix: {
        'AI开发': 8,
        '数据分析': 10,
        '传统开发': 15,
        '项目管理': 9,
        '云计算': 6,
      },
    };

    return {
      employees: employeeList,
      departments: departmentStats,
      positions: positionStats,
      employeeCount: employeeList.length,
      departmentCount: departmentStats.length,
      positionCount: positionList.length,
      historicalData,
    };
  } catch (error) {
    console.error('Error fetching talent data:', error);
    throw error;
  }
}

// 构建预测提示词
function buildPredictionPrompt(talentData: any, quarter: string, year: number) {
  const prompt = `请基于以下数据预测${year}年${quarter}季度的人才需求和管理建议。

公司人才现状：
- 员工总数：${talentData.employeeCount}人
- 部门数量：${talentData.departmentCount}个
- 职位数量：${talentData.positionCount}个

部门分布：
${talentData.departments.map((dept: any) =>
  `- ${dept.name}：${dept.employeeCount}人`
).join('\n')}

技能分布：
${Object.entries(talentData.historicalData.skillMix).map(([skill, count]) =>
  `- ${skill}：${count}人`
).join('\n')}

历史趋势：
- 员工增长率：${talentData.historicalData.employeeGrowthRate}%
- 离职率：${talentData.historicalData.turnoverRate}%
- 平均在职时间：${talentData.historicalData.avgTenure}年

业务规划：
- ${quarter}季度计划启动5个AI相关项目
- 数字化转型加速，需要更多数据分析和AI人才
- 传统业务需要优化，提升人效
- 预计业务增长率15-20%

外部环境：
- AI人才市场竞争激烈
- 云计算人才需求旺盛
- 数据分析人才缺口较大
- 薪酬水平持续上涨

请基于以上信息进行全面预测，包括：
1. 人才缺口预测（按技能分类）
2. 流失风险分析
3. 内部调岗建议
4. 培训需求分析
5. 招聘计划建议
6. 综合建议`;

  return prompt;
}

// POST /api/human-efficiency/prediction
export async function POST(request: NextRequest) {
  try {
    // 认证
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult as any;

    // 解析请求
    const body = await request.json();
    const validatedData = predictionRequestSchema.parse(body);

    const companyId = validatedData.companyId || user.companyId;

    // 获取数据库
    const db = getDb();

    // 获取人才数据
    const talentData = await getCompanyTalentData(db, companyId);

    // 构建AI提示词
    const prompt = buildPredictionPrompt(talentData, validatedData.quarter, validatedData.year);

    // 调用LLM进行预测
    const messages = [
      { role: 'system' as const, content: TALENT_PREDICTION_SYSTEM_PROMPT },
      { role: 'user' as const, content: prompt },
    ];

    const llmResponse = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    // 解析AI响应
    let predictionResult;
    try {
      // 提取JSON部分
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        predictionResult = JSON.parse(jsonMatch[0]);
      } else {
        predictionResult = JSON.parse(llmResponse.content);
      }
    } catch (parseError) {
      // 如果JSON解析失败，返回原始文本
      predictionResult = {
        rawResponse: llmResponse.content,
        metrics: talentData,
      };
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      data: predictionResult,
      metadata: {
        companyId,
        quarter: validatedData.quarter,
        year: validatedData.year,
        employeeCount: talentData.employeeCount,
        predictedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in talent prediction API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate talent prediction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
