import { NextRequest, NextResponse } from 'next/server';
import { enhancedInterviewService } from '@/lib/ai/enhanced-interview-service';
import { getDb } from '@/lib/db';
import { candidates, jobs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试问题生成API（增强版）
 * 支持更多问题类型、智能推荐、期望答案生成
 */

// 请求Schema
const enhancedGenerateSchema = z.object({
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
  focusAreas: z.array(z.string()).optional(),
  includeExpectedAnswer: z.boolean().default(true),
});

/**
 * POST /api/ai/interview/enhanced/generate-questions
 * 生成增强版智能面试问题
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = enhancedGenerateSchema.parse(body);

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

    // 提取候选人技能
    const candidateSkills = Array.isArray((candidate.metadata as any)?.skills)
      ? (candidate.metadata as any).skills
      : [];

    // 构建上下文
    const context = {
      candidate: {
        name: candidate.name,
        education: candidate.education as any || '未提供',
        workExperience: candidate.workExperience as any || '未提供',
        skills: candidateSkills,
        position: (candidate.metadata as any)?.position,
      },
      job: {
        title: job.title,
        description: job.description || '未提供',
        requirements: job.requirements || '未提供',
        benefits: job.benefits || '未提供',
      },
    };

    // 生成面试问题
    const result = await enhancedInterviewService.generateQuestions(context, {
      questionTypes: validated.questionTypes,
      difficulty: validated.difficulty,
      questionCount: validated.questionCount,
      focusAreas: validated.focusAreas,
      includeExpectedAnswer: validated.includeExpectedAnswer,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('生成面试问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '生成问题失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
