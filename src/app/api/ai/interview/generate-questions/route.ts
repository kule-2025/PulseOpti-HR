import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试问题生成API
 * 根据职位JD和候选人简历，生成个性化面试问题
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 生成问题Schema
const generateQuestionsSchema = z.object({
  interviewId: z.string().optional(),
  candidateId: z.string(),
  jobId: z.string(),
  questionTypes: z.array(z.string()).default(['behavioral', 'technical', 'situational', 'cultural']),
  difficulty: z.enum(['junior', 'middle', 'senior', 'expert']).default('middle'),
  questionCount: z.number().min(3).max(20).default(10),
  focusAreas: z.array(z.string()).optional(), // 重点考察领域
});

// System Prompt for question generation
const QUESTION_GENERATION_SYSTEM_PROMPT = `你是一名专业的HR面试专家，擅长设计精准、有针对性的面试问题。

你的任务是根据职位描述（JD）和候选人简历，生成个性化的面试问题。

问题类型说明：
1. behavioral（行为面试）：通过过往行为预测未来表现，使用STAR法则
2. technical（技术面试）：考察专业技能和技术深度
3. situational（情景面试）：通过假设情景考察应变能力
4. cultural（文化契合）：考察价值观和文化匹配度
5. leadership（领导力）：考察领导和管理能力
6. communication（沟通能力）：考察表达和沟通技巧

问题设计原则：
- 问题要具体、开放、有针对性
- 避免引导性问题和是非题
- 每个问题都要有明确的评估维度
- 根据候选人的经历定制问题
- 难度要与职位等级匹配

返回格式（JSON）：
{
  "questions": [
    {
      "id": "q-001",
      "question": "问题内容",
      "type": "问题类型",
      "category": "问题分类",
      "difficulty": "难度级别",
      "dimension": "考察维度",
      "timeLimit": 5,
      "evaluationCriteria": "评估标准",
      "followUpQuestions": ["追问1", "追问2"],
      "rationale": "设计理由"
    }
  ],
  "summary": {
    "totalQuestions": 10,
    "typeDistribution": {
      "behavioral": 3,
      "technical": 4,
      "situational": 2,
      "cultural": 1
    },
    "focusAreas": ["重点考察领域"],
    "estimatedTime": "预计用时"
  }
}

注意：
- 确保返回有效的JSON格式
- 问题数量符合要求
- 问题类型和难度要匹配
- 不要添加任何注释或解释文字，只返回JSON`;

/**
 * POST /api/ai/interview/generate-questions
 * 生成智能面试问题
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = generateQuestionsSchema.parse(body);

    const db = await getDb();

    // 获取候选人信息
    const [candidate] = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        phone: candidates.phone,
        email: candidates.email,
        education: candidates.education,
        workExperience: candidates.workExperience,
        resumeUrl: candidates.resumeUrl,
        metadata: candidates.metadata,
      })
      .from(candidates)
      .where(and(eq(candidates.id, validated.candidateId), eq(candidates.companyId, user.companyId)))
      .limit(1);

    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 获取职位信息
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requirements: jobs.requirements,
        benefits: jobs.benefits,
        metadata: jobs.metadata,
      })
      .from(jobs)
      .where(and(eq(jobs.id, validated.jobId), eq(jobs.companyId, user.companyId)))
      .limit(1);

    if (!job) {
      return NextResponse.json(
        { error: '职位不存在' },
        { status: 404 }
      );
    }

    // 构建提示词
    const userPrompt = `请为以下候选人设计面试问题：

【候选人信息】
姓名：${candidate.name}
教育背景：${candidate.education || '未提供'}
工作年限：${candidate.workExperience || '未提供'}年

【职位信息】
职位名称：${job.title}
职位描述：${job.description || '未提供'}
任职要求：${job.requirements || '未提供'}
福利待遇：${job.benefits || '未提供'}

【面试要求】
问题类型：${validated.questionTypes.join(', ')}
难度级别：${validated.difficulty}
问题数量：${validated.questionCount}
重点考察领域：${validated.focusAreas?.join(', ') || '全面考察'}

请根据候选人背景和职位要求，生成${validated.questionCount}个有针对性的面试问题。`;

    // 调用LLM生成问题
    const messages = [
      {
        role: 'system' as const,
        content: QUESTION_GENERATION_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
      thinking: 'disabled',
    });

    // 解析JSON响应
    let questionsData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      questionsData = JSON.parse(jsonString);
    } catch (error) {
      console.error('解析问题JSON失败:', error);
      // 如果解析失败，返回基础问题
      questionsData = {
        questions: [
          {
            id: 'q-001',
            question: '请做一个自我介绍，重点介绍你的技术背景和项目经验。',
            type: 'behavioral',
            category: '自我介绍',
            difficulty: validated.difficulty,
            dimension: '表达能力',
            timeLimit: 5,
            evaluationCriteria: '考察候选人的表达能力和自我总结能力',
            followUpQuestions: ['你最大的优势是什么？'],
            rationale: '开场必备问题，了解候选人基本情况',
          },
        ],
        summary: {
          totalQuestions: 1,
          typeDistribution: { behavioral: 1 },
          focusAreas: ['基本能力'],
          estimatedTime: '5分钟',
        },
      };
    }

    // 如果提供了interviewId，更新interview的metadata
    if (validated.interviewId) {
      const [interview] = await db
        .select()
        .from(interviews)
        .where(and(
          eq(interviews.id, validated.interviewId),
          eq(interviews.companyId, user.companyId)
        ))
        .limit(1);

      if (interview) {
        await db
          .update(interviews)
          .set({
            metadata: {
              ...(interview.metadata as any),
              aiQuestions: questionsData,
              questionGeneratedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(interviews.id, validated.interviewId));
      }
    }

    return NextResponse.json({
      success: true,
      message: '面试问题生成成功',
      data: questionsData,
      candidateInfo: {
        id: candidate.id,
        name: candidate.name,
      },
      jobInfo: {
        id: job.id,
        title: job.title,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成面试问题错误:', error);
    return NextResponse.json(
      { error: '生成面试问题失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/interview/generate-questions
 * 获取已生成的面试问题
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
      .where(and(
        eq(interviews.id, interviewId),
        eq(interviews.companyId, user.companyId)
      ))
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { error: '面试记录不存在' },
        { status: 404 }
      );
    }

    const questionsData = (interview.metadata as any)?.aiQuestions || null;

    return NextResponse.json({
      success: true,
      data: questionsData,
      hasGenerated: !!questionsData,
    });

  } catch (error) {
    console.error('获取面试问题错误:', error);
    return NextResponse.json(
      { error: '获取面试问题失败' },
      { status: 500 }
    );
  }
}
