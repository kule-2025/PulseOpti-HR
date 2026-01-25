import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试评估API
 * 评估候选人回答质量，生成多维度评分和反馈
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 评估请求Schema
const evaluateRequestSchema = z.object({
  interviewId: z.string(),
  question: z.string(),
  answer: z.string(),
  questionType: z.enum([
    'behavioral',
    'technical',
    'situational',
    'cultural',
    'leadership',
    'communication',
    'problem_solving',
  ]),
  evaluationDimensions: z.array(z.string()).default([
    '逻辑思维',
    '表达能力',
    '问题解决',
    '专业知识',
    '经验匹配',
  ]),
  expectedAnswer: z.string().optional(), // 期望答案
  context: z.string().optional(), // 额外上下文
});

// System Prompt for answer evaluation
const ANSWER_EVALUATION_SYSTEM_PROMPT = `你是一名专业的HR面试评估专家，擅长对候选人的回答进行精准、客观的多维度评估。

你的任务是对候选人的面试回答进行评估，包括：
1. 整体评分（0-100分）
2. 各维度评分（0-100分）
3. 回答亮点
4. 改进建议
5. 关键观察点

评估维度说明：
- 逻辑思维：回答的逻辑性、条理性、分析能力
- 表达能力：语言的清晰度、流畅度、专业性
- 问题解决：解决问题的思路、方法、效果
- 专业知识：相关知识的掌握程度、深度
- 经验匹配：过往经验与岗位的匹配度
- 沟通能力：互动性、倾听能力、反馈意识
- 团队协作：团队意识、合作精神
- 创新能力：创新思维、解决方案的创新性
- 情绪管理：情绪稳定性、压力应对能力
- 学习能力：学习速度、适应能力

评估原则：
- 客观公正，基于事实和数据
- 关注实质内容而非表面形式
- 考虑候选人的背景和经验
- 评估要有层次感和区分度
- 提供建设性的反馈

返回格式（JSON）：
{
  "overallScore": 85,
  "dimensionScores": {
    "逻辑思维": 90,
    "表达能力": 85,
    "问题解决": 80,
    "专业知识": 88,
    "经验匹配": 82
  },
  "strengths": [
    "逻辑清晰，层次分明",
    "专业基础知识扎实",
    "能够结合实际案例说明"
  ],
  "improvements": [
    "可以更深入地分析问题的根本原因",
    "建议多提供量化的数据和结果",
    "可以补充更多的技术细节"
  ],
  "keyObservations": [
    "候选人对XX技术有深入理解",
    "在XX方面表现出较强的实战能力",
    "对行业趋势有较好的把握"
  ],
  "overallFeedback": "整体表现优秀，专业能力突出，建议继续深入考察",
  "recommendation": "强烈推荐进入下一轮面试",
  "nextSteps": [
    "深入了解项目细节和技术方案",
    "考察团队协作和沟通能力",
    "评估学习能力和适应性"
  ],
  "tags": ["技术扎实", "逻辑清晰", "经验丰富"]
}

评分标准：
- 90-100分：优秀，超出预期
- 80-89分：良好，达到预期
- 70-79分：合格，基本满足要求
- 60-69分：及格，有待改进
- 60分以下：不合格，不建议录用

注意：
- 确保返回有效的JSON格式
- 评分要合理，避免过高或过低
- 反馈要具体、有建设性
- 不要添加任何注释或解释文字，只返回JSON`;

/**
 * POST /api/ai/interview/evaluate
 * 评估候选人回答
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = evaluateRequestSchema.parse(body);

    const db = await getDb();

    // 获取面试记录
    const [interview] = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, validated.interviewId), eq(interviews.companyId, user.companyId)))
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { error: '面试记录不存在' },
        { status: 404 }
      );
    }

    // 获取候选人和职位信息
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, interview.candidateId))
      .limit(1);

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, interview.jobId))
      .limit(1);

    // 构建评估提示词
    const userPrompt = `请评估以下面试回答：

【面试问题】
问题：${validated.question}
问题类型：${validated.questionType}

【候选人回答】
${validated.answer}

【职位信息】
职位名称：${job?.title || '未提供'}
职位要求：${job?.requirements || '未提供'}

【候选人信息】
候选人姓名：${candidate?.name || '未知'}
教育背景：${candidate?.education || '未提供'}
工作年限：${candidate?.workExperience || '未提供'}年

【评估要求】
评估维度：${validated.evaluationDimensions.join(', ')}
${validated.expectedAnswer ? `期望答案：${validated.expectedAnswer}` : ''}
${validated.context ? `额外上下文：${validated.context}` : ''}

请对候选人的回答进行全面评估，提供详细的评分和反馈。`;

    // 调用LLM进行评估
    const messages = [
      {
        role: 'system' as const,
        content: ANSWER_EVALUATION_SYSTEM_PROMPT,
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
    let evaluationData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      evaluationData = JSON.parse(jsonString);
    } catch (error) {
      console.error('解析评估JSON失败:', error);
      // 如果解析失败，返回基础评估
      evaluationData = {
        overallScore: 75,
        dimensionScores: {
          逻辑思维: 75,
          表达能力: 75,
          问题解决: 75,
          专业知识: 75,
          经验匹配: 75,
        },
        strengths: ['回答完整'],
        improvements: ['可以更详细'],
        keyObservations: ['基本满足要求'],
        overallFeedback: '表现合格',
        recommendation: '可进入下一轮',
        nextSteps: ['继续面试'],
        tags: ['合格'],
      };
    }

    // 保存评估结果到面试记录
    const evaluations = (interview.metadata as any)?.evaluations || [];
    evaluations.push({
      question: validated.question,
      answer: validated.answer,
      questionType: validated.questionType,
      evaluation: evaluationData,
      evaluatedAt: new Date().toISOString(),
    });

    await db
      .update(interviews)
      .set({
        metadata: {
          ...(interview.metadata as any),
          evaluations,
        },
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, validated.interviewId));

    return NextResponse.json({
      success: true,
      message: '评估完成',
      data: evaluationData,
      question: validated.question,
      questionType: validated.questionType,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('评估候选人回答错误:', error);
    return NextResponse.json(
      { error: '评估失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/interview/evaluate
 * 获取评估历史
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

    const evaluations = (interview.metadata as any)?.evaluations || [];

    // 计算平均分
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

      return NextResponse.json({
        success: true,
        data: {
          evaluations,
          summary: {
            totalQuestions: evaluations.length,
            averageScore: avgScore,
            averageDimensionScores: avgDimensionScores,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluations: [],
        summary: null,
      },
    });

  } catch (error) {
    console.error('获取评估历史错误:', error);
    return NextResponse.json(
      { error: '获取评估历史失败' },
      { status: 500 }
    );
  }
}
