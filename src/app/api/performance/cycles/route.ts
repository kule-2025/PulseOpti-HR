import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { performanceCycles, performanceRecords } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 创建绩效周期
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
    const requiredFields = ['name', 'type', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const cycleId = randomUUID();

    await db.insert(performanceCycles).values({
      id: cycleId,
      companyId: user.companyId,
      name: body.name,
      type: body.type as 'quarterly' | 'annual' | 'custom',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: 'draft',
      description: body.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '绩效周期创建成功',
      data: { id: cycleId },
    });

  } catch (error) {
    console.error('创建绩效周期失败:', error);
    return NextResponse.json(
      { error: '创建绩效周期失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取绩效周期列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
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
    const conditions = [eq(performanceCycles.companyId, companyId)];

    if (status) {
      conditions.push(eq(performanceCycles.status, status));
    }

    // 查询周期列表
    const cycleList = await db
      .select()
      .from(performanceCycles)
      .where(and(...conditions))
      .orderBy(desc(performanceCycles.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(performanceCycles)
      .where(and(...conditions))
      .then((results) => results.length);

    // 为每个周期添加统计信息
    const cycleListWithStats = await Promise.all(
      cycleList.map(async (cycle) => {
        const totalRecords = await db
          .select()
          .from(performanceRecords)
          .where(eq(performanceRecords.cycleId, cycle.id))
          .then((results) => results.length);

        const completedRecords = await db
          .select()
          .from(performanceRecords)
          .where(
            and(
              eq(performanceRecords.cycleId, cycle.id),
              eq(performanceRecords.status, 'completed')
            )
          )
          .then((results) => results.length);

        return {
          ...cycle,
          totalRecords,
          completedRecords,
          progress: totalRecords > 0 ? ((completedRecords / totalRecords) * 100).toFixed(2) + '%' : '0%',
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: cycleListWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取绩效周期列表失败:', error);
    return NextResponse.json(
      { error: '获取绩效周期列表失败' },
      { status: 500 }
    );
  }
}
