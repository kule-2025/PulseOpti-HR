import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试报告生成API
 * 基于所有问答和评估，生成详细的面试报告
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 生成报告请求Schema
const generateReportSchema = z.object({
  interviewId: z.string(),
  reportType: z.enum(['summary', 'detailed', 'executive']).default('detailed'),
  includeRecommendations: z.boolean().default(true),
  includeComparison: z.boolean().default(true), // 与职位要求对比
  language: z.enum(['zh', 'en']).default('zh'),
});

// System Prompt for report generation
const REPORT_GENERATION_SYSTEM_PROMPT = `你是一名专业的HR报告撰写专家，擅长将面试信息转化为清晰、专业、有洞察力的面试报告。

你的任务是基于面试的所有问答和评估结果，生成一份详细的面试报告。

报告结构：
1. 报告概述（Executive Summary）
   - 候选人基本信息
   - 面试总体评价
   - 核心优势和不足
   - 最终推荐意见

2. 能力评估（Competency Assessment）
   - 各维度得分雷达图数据
   - 技术能力评估
   - 软技能评估
   - 潜力分析

3. 详细问答分析（Q&A Analysis）
   - 重要问答回顾
   - 关键回答分析
   - 突出表现和问题

4. 与职位匹配度分析（Job Fit Analysis）
   - 技能匹配度
   - 经验匹配度
   - 文化匹配度

5. 综合评价（Overall Evaluation）
   - 优势总结
   - 风险提示
   - 改进建议

6. 推荐意见（Recommendation）
   - 是否推荐录用
   - 推荐等级（强烈推荐/推荐/谨慎推荐/不推荐）
   - 后续建议

报告特点：
- 语言专业、客观、准确
- 数据驱动，有理有据
- 结构清晰，层次分明
- 重点突出，结论明确
- 可读性强，便于决策

返回格式（JSON）：
{
  "report": {
    "title": "面试评估报告 - [候选人姓名] - [职位名称]",
    "generatedAt": "2025-01-15T10:00:00Z",
    "metadata": {
      "candidateId": "xxx",
      "candidateName": "张三",
      "interviewId": "xxx",
      "interviewerId": "xxx",
      "interviewDate": "2025-01-15",
      "duration": "45分钟",
      "position": "高级前端工程师"
    },
    "executiveSummary": {
      "overallScore": 85,
      "overallRating": "良好",
      "coreStrengths": [
        "技术基础扎实",
        "项目经验丰富",
        "沟通能力强"
      ],
      "keyWeaknesses": [
        "缺少大型项目经验",
        "对新技术的敏感度有待提升"
      ],
      "finalRecommendation": "推荐",
      "recommendationLevel": "strong_recommend"
    },
    "competencyAssessment": {
      "overallScore": 85,
      "dimensionScores": {
        "技术能力": 88,
        "沟通能力": 85,
        "问题解决": 82,
        "团队协作": 88,
        "学习能力": 80,
        "领导力": 75
      },
      "radarData": [
        {"dimension": "技术能力", "score": 88},
        {"dimension": "沟通能力", "score": 85},
        {"dimension": "问题解决", "score": 82},
        {"dimension": "团队协作", "score": 88},
        {"dimension": "学习能力", "score": 80},
        {"dimension": "领导力", "score": 75}
      ],
      "technicalCompetencies": {
        "frontend": {
          "score": 90,
          "skills": ["React", "Vue", "TypeScript", "Webpack"],
          "proficiency": "熟练"
        },
        "backend": {
          "score": 75,
          "skills": ["Node.js", "Express"],
          "proficiency": "了解"
        }
      },
      "softSkills": {
        "communication": 85,
        "teamwork": 88,
        "problemSolving": 82,
        "adaptability": 80
      },
      "potential": {
        "growthPotential": 80,
        "leadershipPotential": 75,
        "innovation": 78
      }
    },
    "qaAnalysis": {
      "totalQuestions": 10,
      "keyQuestions": [
        {
          "question": "请介绍一个你主导的技术项目",
          "answer": "...",
          "score": 88,
          "highlights": [
            "项目架构设计合理",
            "技术选型有深度思考"
          ]
        }
      ],
      "overallPerformance": "候选人能够清晰阐述项目经验，技术方案设计思路清晰"
    },
    "jobFitAnalysis": {
      "skillsFit": {
        "score": 85,
        "matchedSkills": ["React", "TypeScript", "Node.js"],
        "missingSkills": ["GraphQL", "Docker"]
      },
      "experienceFit": {
        "score": 82,
        "relevantYears": 5,
        "requiredYears": 3,
        "assessment": "经验略高于要求"
      },
      "culturalFit": {
        "score": 88,
        "alignment": [
          "价值观一致",
          "团队协作意识强",
          "学习态度积极"
        ]
      }
    },
    "overallEvaluation": {
      "strengths": [
        "技术基础扎实，框架理解深入",
        "项目实战经验丰富",
        "沟通表达能力强",
        "团队协作意识好"
      ],
      "risks": [
        "缺少大规模高并发项目经验",
        "对新技术的跟进速度有待提升"
      ],
      "suggestions": [
        "建议在试用期重点关注大型项目参与",
        "提供新技术学习资源"
      ]
    },
    "recommendations": {
      "hiringDecision": "推荐录用",
      "recommendationLevel": "strong_recommend",
      "offerSuggestion": {
        "baseSalary": "25-30K",
        "position": "高级前端工程师"
      },
      "nextSteps": [
        "安排技术负责人二面",
        "进行代码评估",
        "确认薪资期望"
      ],
      "riskMitigation": [
        "入职后安排导师指导",
        "提供大型项目参与机会"
      ]
    },
    "appendix": {
      "interviewNotes": "...",
      "additionalComments": "..."
    }
  }
}

推荐等级说明：
- strong_recommend：强烈推荐，能力突出，完全符合要求
- recommend：推荐，能力良好，基本符合要求
- cautious_recommend：谨慎推荐，存在一定风险，需要重点关注
- not_recommend：不推荐，能力不足或不符合要求

注意：
- 确保返回有效的JSON格式
- 报告要专业、客观、有洞察力
- 数据要真实可信，避免夸大
- 不要添加任何注释或解释文字，只返回JSON`;

/**
 * POST /api/ai/interview/generate-report
 * 生成面试报告
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = generateReportSchema.parse(body);

    const db = await getDb();

    // 获取面试记录
    const [interview] = await db
      .select({
        id: interviews.id,
        candidateId: interviews.candidateId,
        jobId: interviews.jobId,
        interviewerId: interviews.interviewerId,
        round: interviews.round,
        scheduledAt: interviews.scheduledAt,
        status: interviews.status,
        score: interviews.score,
        feedback: interviews.feedback,
        metadata: interviews.metadata,
      })
      .from(interviews)
      .where(and(eq(interviews.id, validated.interviewId), eq(interviews.companyId, user.companyId)))
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { error: '面试记录不存在' },
        { status: 404 }
      );
    }

    // 获取候选人信息
    const [candidate] = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        phone: candidates.phone,
        email: candidates.email,
        education: candidates.education,
        workExperience: candidates.workExperience,
        currentSalary: candidates.currentSalary,
        expectedSalary: candidates.expectedSalary,
        resumeUrl: candidates.resumeUrl,
        metadata: candidates.metadata,
      })
      .from(candidates)
      .where(eq(candidates.id, interview.candidateId))
      .limit(1);

    // 获取职位信息
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requirements: jobs.requirements,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        location: jobs.location,
        metadata: jobs.metadata,
      })
      .from(jobs)
      .where(eq(jobs.id, interview.jobId))
      .limit(1);

    // 获取面试官信息
    const [interviewer] = await db
      .select({
        name: employees.name,
        positionId: employees.positionId,
      })
      .from(employees)
      .where(eq(employees.id, interview.interviewerId))
      .limit(1);

    // 获取评估历史
    const evaluations = (interview.metadata as any)?.evaluations || [];

    // 获取对话历史
    const chatHistory = (interview.metadata as any)?.chatHistory || [];

    // 计算评估数据
    let evaluationSummary = '';
    if (evaluations.length > 0) {
      const totalScore = evaluations.reduce((sum: number, evalItem: any) => sum + (evalItem.evaluation?.overallScore || 0), 0);
      const avgScore = Math.round(totalScore / evaluations.length);

      // 聚合维度得分
      const dimensionAggregates: Record<string, number[]> = {};
      evaluations.forEach((evalItem: any) => {
        const scores = evalItem.evaluation?.dimensionScores || {};
        Object.entries(scores).forEach(([dimension, score]) => {
          if (!dimensionAggregates[dimension]) {
            dimensionAggregates[dimension] = [];
          }
          dimensionAggregates[dimension].push(score as number);
        });
      });

      const avgDimensionScores: Record<string, number> = {};
      Object.entries(dimensionAggregates).forEach(([dimension, scores]) => {
        avgDimensionScores[dimension] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });

      evaluationSummary = `
【评估概要】
总评分：${avgScore}/100
维度得分：${JSON.stringify(avgDimensionScores, null, 2)}

【详细评估】
${evaluations.map((evalItem: any, index: number) => `
${index + 1}. 问题：${evalItem.question}
   答案：${evalItem.answer.substring(0, 200)}${evalItem.answer.length > 200 ? '...' : ''}
   评分：${evalItem.evaluation?.overallScore}
   亮点：${evalItem.evaluation?.strengths?.join(', ') || '无'}
   建议：${evalItem.evaluation?.improvements?.join(', ') || '无'}
`).join('\n')}
`;
    }

    // 构建报告生成提示词
    const userPrompt = `请基于以下面试信息，生成详细的面试报告：

【面试基本信息】
面试ID：${interview.id}
面试轮次：第${interview.round}轮
面试时间：${interview.scheduledAt}
面试时长：约${chatHistory.length > 0 ? Math.round(chatHistory.length / 2) : 5}分钟

【候选人信息】
姓名：${candidate?.name}
教育背景：${candidate?.education || '未提供'}
工作年限：${candidate?.workExperience || '未提供'}年
当前薪资：${candidate?.currentSalary ? `${candidate.currentSalary}元` : '未提供'}
期望薪资：${candidate?.expectedSalary ? `${candidate.expectedSalary}元` : '未提供'}

【职位信息】
职位名称：${job?.title}
职位描述：${job?.description || '未提供'}
任职要求：${job?.requirements || '未提供'}
薪资范围：${job?.salaryMin && job?.salaryMax ? `${job.salaryMin}-${job.salaryMax}元` : '未提供'}
工作地点：${job?.location || '未提供'}

【评估数据】
${evaluationSummary}

【对话记录】
${chatHistory.length > 0 ? `
${chatHistory.map((msg: any, index: number) => `
${msg.role === 'user' ? '候选人' : '面试官'}：${msg.content}
`).join('\n')}
` : '暂无对话记录'}

【人工评分】
面试官评分：${interview.score || '未评分'}
面试官反馈：${interview.feedback || '未填写'}

【报告要求】
报告类型：${validated.reportType}
包含推荐意见：${validated.includeRecommendations}
包含职位对比：${validated.includeComparison}
报告语言：${validated.language}

请生成一份专业、详细、有洞察力的面试报告。`;

    // 调用LLM生成报告
    const messages = [
      {
        role: 'system' as const,
        content: REPORT_GENERATION_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
      thinking: 'disabled',
    });

    // 解析JSON响应
    let reportData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      reportData = JSON.parse(jsonString);
    } catch (error) {
      console.error('解析报告JSON失败:', error);
      // 如果解析失败，返回基础报告
      reportData = {
        report: {
          title: `面试评估报告 - ${candidate?.name} - ${job?.title}`,
          generatedAt: new Date().toISOString(),
          metadata: {
            candidateId: candidate?.id,
            candidateName: candidate?.name,
            interviewId: interview.id,
            interviewerId: interview.interviewerId,
            interviewDate: interview.scheduledAt,
            position: job?.title,
          },
          executiveSummary: {
            overallScore: interview.score || 75,
            overallRating: interview.score && interview.score >= 80 ? '良好' : '合格',
            coreStrengths: ['基本满足要求'],
            keyWeaknesses: ['有待进一步考察'],
            finalRecommendation: interview.score && interview.score >= 80 ? '推荐' : '谨慎推荐',
            recommendationLevel: interview.score && interview.score >= 80 ? 'recommend' : 'cautious_recommend',
          },
          competencyAssessment: {
            overallScore: interview.score || 75,
            dimensionScores: {
              技术能力: interview.score || 75,
              沟通能力: interview.score || 75,
            },
          },
          qaAnalysis: {
            totalQuestions: evaluations.length,
          },
          overallEvaluation: {
            strengths: ['基本能力具备'],
            risks: [],
            suggestions: ['建议进一步考察'],
          },
          recommendations: {
            hiringDecision: interview.score && interview.score >= 80 ? '推荐录用' : '谨慎推荐',
            recommendationLevel: interview.score && interview.score >= 80 ? 'recommend' : 'cautious_recommend',
            nextSteps: ['继续面试流程'],
          },
        },
      };
    }

    // 保存报告到面试记录
    await db
      .update(interviews)
      .set({
        metadata: {
          ...(interview.metadata as any),
          report: reportData.report,
          reportGeneratedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, validated.interviewId));

    return NextResponse.json({
      success: true,
      message: '面试报告生成成功',
      data: reportData.report,
      interviewId: validated.interviewId,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成面试报告错误:', error);
    return NextResponse.json(
      { error: '生成面试报告失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/interview/generate-report
 * 获取已生成的面试报告
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: '缺少面试ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [interview] = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, interviewId), eq(interviews.companyId, user.companyId)))
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { error: '面试记录不存在' },
        { status: 404 }
      );
    }

    const report = (interview.metadata as any)?.report || null;
    const reportGeneratedAt = (interview.metadata as any)?.reportGeneratedAt || null;

    return NextResponse.json({
      success: true,
      data: report,
      hasReport: !!report,
      reportGeneratedAt,
    });

  } catch (error) {
    console.error('获取面试报告错误:', error);
    return NextResponse.json(
      { error: '获取面试报告失败' },
      { status: 500 }
    );
  }
}
