import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { performanceRecords } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 提交绩效自评
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
    const requiredFields = ['recordId', 'selfScore', 'achievements', 'improvements'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 检查记录是否存在且属于该员工
    const record = await db
      .select()
      .from(performanceRecords)
      .where(
        and(
          eq(performanceRecords.id, body.recordId),
          eq(performanceRecords.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!record.length) {
      return NextResponse.json(
        { error: '绩效记录不存在' },
        { status: 404 }
      );
    }

    // 更新记录
    await db
      .update(performanceRecords)
      .set({
        selfScore: body.selfScore,
        achievements: body.achievements,
        improvements: body.improvements,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(performanceRecords.id, body.recordId));

    return NextResponse.json({
      success: true,
      message: '自评提交成功',
    });

  } catch (error) {
    console.error('提交自评失败:', error);
    return NextResponse.json(
      { error: '提交自评失败' },
      { status: 500 }
    );
  }
}

/**
 * 上级评分
 */
export async function PUT(request: NextRequest) {
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
    const requiredFields = ['recordId', 'reviewerScore', 'feedback'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 检查记录是否存在
    const record = await db
      .select()
      .from(performanceRecords)
      .where(
        and(
          eq(performanceRecords.id, body.recordId),
          eq(performanceRecords.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!record.length) {
      return NextResponse.json(
        { error: '绩效记录不存在' },
        { status: 404 }
      );
    }

    // 计算最终分数（自评占30%，上级评分占70%）
    const finalScore = Math.round(
      (record[0].selfScore || 0) * 0.3 + body.reviewerScore * 0.7
    );

    // 更新记录
    await db
      .update(performanceRecords)
      .set({
        reviewerId: user.id,
        reviewerScore: body.reviewerScore,
        finalScore,
        feedback: body.feedback,
        status: 'completed',
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(performanceRecords.id, body.recordId));

    return NextResponse.json({
      success: true,
      message: '评分完成',
      data: { finalScore },
    });

  } catch (error) {
    console.error('评分失败:', error);
    return NextResponse.json(
      { error: '评分失败' },
      { status: 500 }
    );
  }
}
