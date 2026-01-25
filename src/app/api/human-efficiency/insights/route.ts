import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { requireAuth } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { employees, departments, positions, performanceRecords } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, count, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

/**
 * 人效分析API - 基于豆包大模型的深度分析
 * 提供人效瓶颈识别、优化建议等功能
 */

// 初始化LLM客户端
const llmConfig = new Config();
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const insightRequestSchema = z.object({
  companyId: z.string().optional(),
  departmentId: z.string().optional(),
  analysisType: z.enum(['overall', 'cost', 'roi', 'skills', 'turnover', 'optimization']).default('overall'),
  period: z.enum(['month', 'quarter', 'year']).default('quarter'),
  includeRecommendations: z.boolean().default(true),
});

// AI分析的System Prompt
const EFFICIENCY_ANALYSIS_SYSTEM_PROMPT = `你是一名资深的人力资源效能专家和组织发展顾问，拥有超过15年的企业咨询经验。

你的任务是分析企业的人力资源数据，识别人效瓶颈，并提供专业的优化建议。

分析维度：
1. 成本效率：人力成本与业务产出的匹配度
2. ROI分析：人力投资回报率评估
3. 技能匹配：员工技能与业务需求的匹配程度
4. 人才流动：人才流失风险与保留策略
5. 组织效能：组织架构与流程优化空间

返回格式（JSON）：
{
  "overallScore": 75,
  "status": "良好",
  "keyInsights": [
    {
      "dimension": "成本效率",
      "score": 68,
      "trend": "下降",
      "description": "人力成本增长速度超过业务收入增长速度",
      "impact": "high"
    },
    {
      "dimension": "技能匹配",
      "score": 82,
      "trend": "稳定",
      "description": "核心技能储备充足，但新兴技能存在缺口",
      "impact": "medium"
    }
  ],
  "bottlenecks": [
    {
      "area": "研发部门",
      "issue": "AI开发人才短缺",
      "severity": "high",
      "evidence": "当前AI开发工程师仅8人，需求15人，缺口7人",
      "businessImpact": "导致AI项目进度延迟约20%"
    },
    {
      "area": "培训体系",
      "issue": "技能转换培训不足",
      "severity": "medium",
      "evidence": "传统开发人员向AI开发转换的培训覆盖率仅30%",
      "businessImpact": "内部人才利用率低"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "启动AI开发专项招聘计划",
      "expectedROI": "3.5x",
      "timeline": "3个月",
      "cost": 800000,
      "description": "招聘7名AI开发工程师，填补人才缺口"
    },
    {
      "priority": "high",
      "action": "实施内部技能转换培训",
      "expectedROI": "4.2x",
      "timeline": "2个月",
      "cost": 450000,
      "description": "对15名传统开发工程师进行AI技能培训"
    },
    {
      "priority": "medium",
      "action": "优化组织架构",
      "expectedROI": "2.8x",
      "timeline": "1个月",
      "cost": 100000,
      "description": "调整研发部门组织结构，提升协作效率"
    }
  ],
  "metrics": {
    "laborCostPerEmployee": 125000,
    "laborCostGrowthRate": 8.5,
    "revenueGrowthRate": 12.3,
    "averageROI": 3.2,
    "skillMatchRate": 78,
    "turnoverRate": 12.5,
    "productivityIndex": 85
  },
  "trends": {
    "cost": { "Q1": 2800000, "Q2": 3200000, "Q3": 3500000, "Q4": 3000000 },
    "roi": { "Q1": 2.8, "Q2": 3.2, "Q3": 3.5, "Q4": 3.2 },
    "productivity": { "Q1": 82, "Q2": 85, "Q3": 88, "Q4": 86 }
  },
  "riskFactors": [
    {
      "risk": "关键人才流失",
      "probability": "medium",
      "impact": "high",
      "mitigation": "实施关键人才保留计划，提供晋升机会和薪酬激励"
    },
    {
      "risk": "技能缺口扩大",
      "probability": "high",
      "impact": "medium",
      "mitigation": "建立技能储备池，提前识别并培训潜在人才"
    }
  ],
  "summary": "整体人效水平良好，但存在AI开发人才短缺和培训体系不足的瓶颈。建议优先实施内部技能转换培训和专项招聘，预计可提升整体人效15-20%。"
}

分析要求：
1. 数据驱动：所有结论必须基于提供的数据
2. 可操作：建议必须具体可执行，包含时间线和成本估算
3. ROI导向：优先推荐投资回报率高的措施
4. 风险意识：识别潜在风险并提供应对策略
5. 分级优先：按照高、中、低优先级排序建议`;

// 获取公司HR数据
async function getCompanyHRData(db: any, companyId: string, departmentId?: string) {
  try {
    // 获取员工数据
    let employeeQuery = db.select().from(employees);
    const conditions = [];

    if (departmentId) {
      conditions.push(eq(employees.departmentId, departmentId));
    } else {
      conditions.push(eq(employees.companyId, companyId));
    }

    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      employeeQuery = employeeQuery.where(whereCondition);
    }

    const employeeList = await employeeQuery;

    // 获取部门数据
    let departmentQuery = db.select().from(departments);
    if (companyId) {
      departmentQuery = departmentQuery.where(eq(departments.companyId, companyId));
    }
    const departmentList = await departmentQuery;

    // 获取绩效数据（最近3个月）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const performanceList = await db
      .select()
      .from(performanceRecords)
      .where(
        gte(performanceRecords.reviewedAt, threeMonthsAgo)
      );

    return {
      employees: employeeList,
      departments: departmentList,
      performanceRecords: performanceList,
      employeeCount: employeeList.length,
      departmentCount: departmentList.length,
      avgPerformanceScore: performanceList.length > 0
        ? performanceList.reduce((sum: any, p: any) => sum + (p.score || 0), 0) / performanceList.length
        : 0,
    };
  } catch (error) {
    console.error('Error fetching HR data:', error);
    throw error;
  }
}

// 构建分析提示词
function buildAnalysisPrompt(hrData: any, analysisType: string, period: string) {
  const prompt = `请分析以下人力资源数据，提供人效洞察和优化建议。

分析类型：${analysisType}
统计周期：${period}

公司数据：
- 员工总数：${hrData.employeeCount}人
- 部门数量：${hrData.departmentCount}个
- 平均绩效分数：${hrData.avgPerformanceScore.toFixed(2)}分

部门详情：
${hrData.departments.map((dept: any) => 
  `- ${dept.name}：${hrData.employees.filter((e: any) => e.departmentId === dept.id).length}人`
).join('\n')}

员工分布：
- 入职时间分布（示例数据）
- 职位分布（示例数据）
- 绩效分布（示例数据）

最近3个月绩效趋势：
${hrData.performanceRecords.slice(0, 5).map((p: any) =>
  `- ${p.employeeId}: ${p.score}分 (${p.reviewDate})`
).join('\n')}

业务背景：
- 公司正处于快速增长期
- AI项目需求激增
- 传统业务面临转型压力

请基于以上数据进行全面分析，并提供具体可执行的优化建议。`;

  return prompt;
}

// POST /api/human-efficiency/insights
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
    const validatedData = insightRequestSchema.parse(body);

    const companyId = validatedData.companyId || user.companyId;
    const departmentId = validatedData.departmentId;

    // 获取数据库
    const db = getDb();

    // 获取HR数据
    const hrData = await getCompanyHRData(db, companyId, departmentId);

    // 构建AI提示词
    const prompt = buildAnalysisPrompt(hrData, validatedData.analysisType, validatedData.period);

    // 调用LLM进行分析
    const messages = [
      { role: 'system' as const, content: EFFICIENCY_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user' as const, content: prompt },
    ];

    const llmResponse = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    // 解析AI响应
    let analysisResult;
    try {
      // 提取JSON部分（如果AI返回了额外的说明文字）
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(llmResponse.content);
      }
    } catch (parseError) {
      // 如果JSON解析失败，返回原始文本
      analysisResult = {
        rawResponse: llmResponse.content,
        metrics: hrData,
      };
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      data: analysisResult,
      metadata: {
        companyId,
        departmentId,
        analysisType: validatedData.analysisType,
        period: validatedData.period,
        employeeCount: hrData.employeeCount,
        analyzedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in human efficiency insights API:', error);

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
        error: 'Failed to generate efficiency insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/human-efficiency/insights - 获取历史分析记录
export async function GET(request: NextRequest) {
  try {
    // 认证
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult as any;

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get('type') || 'overall';

    // TODO: 实现从数据库获取历史分析记录
    // 目前返回示例数据
    return NextResponse.json({
      success: true,
      data: {
        records: [],
        total: 0,
      },
      metadata: {
        analysisType,
        companyId: user.companyId,
      },
    });

  } catch (error) {
    console.error('Error fetching human efficiency insights:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch efficiency insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
