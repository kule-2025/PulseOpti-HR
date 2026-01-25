import { NextRequest, NextResponse } from 'next/server';
import { enhancedInterviewService } from '@/lib/ai/enhanced-interview-service';
import { getDb } from '@/lib/db';
import { candidates, jobs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试问题推荐API
 * 根据候选人背景和职位要求，推荐最合适的面试问题
 */

// 请求Schema
const recommendSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  questionCount: z.number().min(1).max(10).default(5),
});

/**
 * POST /api/ai/interview/enhanced/recommend
 * 推荐面试问题
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = recommendSchema.parse(body);

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

    // 推荐面试问题
    const questions = await enhancedInterviewService.recommendQuestions(
      context,
      validated.questionCount
    );

    return NextResponse.json({
      success: true,
      data: {
        questions,
        count: questions.length,
      },
    });
  } catch (error) {
    console.error('推荐面试问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '推荐失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
