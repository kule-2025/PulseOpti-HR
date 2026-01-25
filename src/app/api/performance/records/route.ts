import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { performanceRecords, employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 创建绩效记录
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
    const requiredFields = ['cycleId', 'employeeId', 'goals'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const recordId = randomUUID();

    await db.insert(performanceRecords).values({
      id: recordId,
      companyId: user.companyId,
      cycleId: body.cycleId,
      employeeId: body.employeeId,
      reviewerId: body.reviewerId || null,
      goals: body.goals,
      achievements: body.achievements || '',
      improvements: body.improvements || '',
      feedback: body.feedback || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '绩效记录创建成功',
      data: { id: recordId },
    });

  } catch (error) {
    console.error('创建绩效记录失败:', error);
    return NextResponse.json(
      { error: '创建绩效记录失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取绩效记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const cycleId = searchParams.get('cycleId') || '';
    const employeeId = searchParams.get('employeeId') || '';
    const status = searchParams.get('status') || '';
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
    const conditions = [eq(performanceRecords.companyId, companyId)];

    if (cycleId) {
      conditions.push(eq(performanceRecords.cycleId, cycleId));
    }

    if (employeeId) {
      conditions.push(eq(performanceRecords.employeeId, employeeId));
    }

    if (status) {
      conditions.push(eq(performanceRecords.status, status));
    }

    // 查询记录列表
    const recordList = await db
      .select({
        id: performanceRecords.id,
        cycleId: performanceRecords.cycleId,
        employeeId: performanceRecords.employeeId,
        reviewerId: performanceRecords.reviewerId,
        selfScore: performanceRecords.selfScore,
        reviewerScore: performanceRecords.reviewerScore,
        finalScore: performanceRecords.finalScore,
        goals: performanceRecords.goals,
        achievements: performanceRecords.achievements,
        improvements: performanceRecords.improvements,
        feedback: performanceRecords.feedback,
        status: performanceRecords.status,
        submittedAt: performanceRecords.submittedAt,
        reviewedAt: performanceRecords.reviewedAt,
        employeeName: employees.name,
        employeeDepartmentId: employees.departmentId,
      })
      .from(performanceRecords)
      .leftJoin(employees, eq(performanceRecords.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(performanceRecords.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(performanceRecords)
      .where(and(...conditions))
      .then((results) => results.length);

    return NextResponse.json({
      success: true,
      data: recordList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取绩效记录列表失败:', error);
    return NextResponse.json(
      { error: '获取绩效记录列表失败' },
      { status: 500 }
    );
  }
}
