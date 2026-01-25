import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { interviews, candidates, users } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 安排面试
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userStr = request.headers.get('x-user-id');
    if (!userStr) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必填字段
    const requiredFields = ['candidateId', 'interviewerId', 'scheduledAt', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 检查候选人是否存在
    const candidate = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, body.candidateId))
      .limit(1);

    if (!candidate.length) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 检查面试官是否存在
    const interviewer = await db
      .select()
      .from(users)
      .where(eq(users.id, body.interviewerId))
      .limit(1);

    if (!interviewer.length) {
      return NextResponse.json(
        { error: '面试官不存在' },
        { status: 404 }
      );
    }

    const interviewId = randomUUID();

    await db.insert(interviews).values({
      companyId: user.companyId,
      candidateId: body.candidateId,
      jobId: candidate[0].jobId || '',  // 确保不为null
      interviewerId: body.interviewerId,
      round: body.round || 1,
      scheduledAt: new Date(body.scheduledAt),
      location: body.location || '',
      type: body.type as 'online' | 'offline' | 'phone',
      status: 'scheduled',
      nextRoundScheduled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 更新候选人状态为面试中
    await db
      .update(candidates)
      .set({
        status: 'interview',
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, body.candidateId));

    return NextResponse.json({
      success: true,
      message: '面试安排成功',
      data: { id: interviewId },
    });

  } catch (error) {
    console.error('安排面试失败:', error);
    return NextResponse.json(
      { error: '安排面试失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取面试列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status') || '';
    const interviewerId = searchParams.get('interviewerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(interviews.companyId, companyId)];

    if (status) {
      conditions.push(eq(interviews.status, status));
    }

    if (interviewerId) {
      conditions.push(eq(interviews.interviewerId, interviewerId));
    }

    // 查询面试列表
    const interviewList = await db
      .select()
      .from(interviews)
      .where(and(...conditions))
      .orderBy(desc(interviews.scheduledAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(interviews)
      .where(and(...conditions))
      .then((results) => results.length);

    return NextResponse.json({
      success: true,
      data: interviewList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取面试列表失败:', error);
    return NextResponse.json(
      { error: '获取面试列表失败' },
      { status: 500 }
    );
  }
}
