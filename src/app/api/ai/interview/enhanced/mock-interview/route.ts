import { NextRequest, NextResponse } from 'next/server';
import { enhancedInterviewService } from '@/lib/ai/enhanced-interview-service';
import { getDb } from '@/lib/db';
import { candidates, jobs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI模拟面试API
 * 提供完整的模拟面试流程，包括问题生成、答案评估、综合评分
 */

// 创建模拟面试Schema
const createMockInterviewSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  questionTypes: z.array(z.enum([
    'behavioral',
    'technical',
    'situational',
    'cultural',
    'leadership',
    'communication',
    'problem_solving',
    'teamwork',
    'innovation',
    'adaptability',
  ])).default(['behavioral', 'technical', 'situational']),
  difficulty: z.enum(['junior', 'middle', 'senior', 'expert']).default('middle'),
  questionCount: z.number().min(3).max(20).default(10),
});

// 提交答案Schema
const submitAnswerSchema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  answer: z.string().min(10),
});

// 完成面试Schema
const completeInterviewSchema = z.object({
  sessionId: z.string(),
});

/**
 * POST /api/ai/interview/enhanced/mock-interview
 * 创建模拟面试会话
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      return await createMockInterview(body, user);
    } else if (action === 'submit') {
      return await submitAnswer(body, user);
    } else if (action === 'complete') {
      return await completeInterview(body, user);
    } else {
      return NextResponse.json(
        { error: '不支持的操作' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('模拟面试操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 创建模拟面试会话
 */
async function createMockInterview(body: any, user: any) {
  const validated = createMockInterviewSchema.parse(body);

  const db = await getDb();

  // 获取候选人信息
  const [candidate] = await db
    .select()
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
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, validated.jobId), eq(jobs.companyId, user.companyId)))
    .limit(1);

  if (!job) {
    return NextResponse.json(
      { error: '职位不存在' },
      { status: 404 }
    );
  }

  // 提取候选人技能
  const candidateSkills = Array.isArray(candidate.metadata?.skills)
    ? candidate.metadata.skills
    : [];

  // 构建上下文
  const context = {
    candidate: {
      name: candidate.name,
      education: candidate.education as any || '未提供',
      workExperience: candidate.workExperience as any || '未提供',
      skills: candidateSkills,
    },
    job: {
      title: job.title,
      description: job.description || '未提供',
      requirements: job.requirements || '未提供',
    },
  };

  // 创建模拟面试会话
  const session = await enhancedInterviewService.createMockInterview(
    validated.candidateId,
    validated.jobId,
    context,
    {
      questionTypes: validated.questionTypes,
      difficulty: validated.difficulty,
      questionCount: validated.questionCount,
    }
  );

  // 在实际应用中，应该将会话保存到数据库
  // 这里简化处理，直接返回会话信息

  return NextResponse.json({
    success: true,
    data: {
      session,
      questions: session.questions,
      message: '模拟面试创建成功',
    },
  });
}

/**
 * 提交答案
 */
async function submitAnswer(body: any, user: any) {
  const validated = submitAnswerSchema.parse(body);

  // 在实际应用中，应该从数据库获取会话信息
  // 这里简化处理，假设会话信息在请求中传递
  const session = body.session;

  if (!session) {
    return NextResponse.json(
      { error: '会话信息不存在' },
      { status: 404 }
    );
  }

  // 提交答案并评估
  const evaluation = await enhancedInterviewService.submitAnswer(
    session,
    validated.questionId,
    validated.answer
  );

  return NextResponse.json({
    success: true,
    data: {
      evaluation,
      questionId: validated.questionId,
      completed: session.answers.length,
      total: session.questions.length,
    },
  });
}

/**
 * 完成面试
 */
async function completeInterview(body: any, user: any) {
  const validated = completeInterviewSchema.parse(body);

  // 在实际应用中，应该从数据库获取会话信息
  const session = body.session;

  if (!session) {
    return NextResponse.json(
      { error: '会话信息不存在' },
      { status: 404 }
    );
  }

  // 完成模拟面试
  const result = await enhancedInterviewService.completeMockInterview(session);

  return NextResponse.json({
    success: true,
    data: result,
    message: '模拟面试完成',
  });
}
