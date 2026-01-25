/**
 * 绩效管理API
 * 提供绩效的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 绩效数据结构
export interface Performance {
  id: string;
  employeeId: string;
  employeeName: string;
  cycle: string;
  cycleName: string;
  year: number;
  month?: number;
  quarter?: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  kpiScore: number;
  competenceScore: number;
  attitudeScore: number;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    actual: number;
    weight: number;
    score: number;
  }>;
  comments: string;
  reviewerId?: string;
  reviewerName?: string;
  status: 'draft' | 'pending_review' | 'reviewed' | 'confirmed';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// 数据验证schema
const performanceSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  cycle: z.string().min(1, '考核周期不能为空'),
  cycleName: z.string().min(1, '周期名称不能为空'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  kpiScore: z.number().min(0).max(100).default(0),
  competenceScore: z.number().min(0).max(100).default(0),
  attitudeScore: z.number().min(0).max(100).default(0),
  comments: z.string().optional(),
  reviewerId: z.string().optional(),
});

/**
 * GET /api/performances
 * 获取绩效列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const cycle = searchParams.get('cycle');
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 从数据库获取绩效列表
    // 简化处理，返回模拟数据
    const mockPerformances: Performance[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: '张三',
        cycle: '2024-Q4',
        cycleName: '2024年第四季度',
        year: 2024,
        quarter: 4,
        score: 88,
        grade: 'B',
        kpiScore: 90,
        competenceScore: 85,
        attitudeScore: 90,
        goals: [
          {
            id: 'g1',
            name: '完成项目开发',
            target: 100,
            actual: 95,
            weight: 40,
            score: 38,
          },
          {
            id: 'g2',
            name: '代码质量',
            target: 90,
            actual: 92,
            weight: 30,
            score: 28,
          },
        ],
        comments: '表现良好，继续保持',
        reviewerId: 'M001',
        reviewerName: '技术总监',
        status: 'confirmed',
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: '李四',
        cycle: '2024-Q4',
        cycleName: '2024年第四季度',
        year: 2024,
        quarter: 4,
        score: 92,
        grade: 'A',
        kpiScore: 95,
        competenceScore: 90,
        attitudeScore: 92,
        goals: [
          {
            id: 'g3',
            name: '产品交付',
            target: 100,
            actual: 98,
            weight: 50,
            score: 49,
          },
        ],
        comments: '优秀，超出预期',
        reviewerId: 'M002',
        reviewerName: '产品总监',
        status: 'confirmed',
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 过滤
    let filteredPerformances = mockPerformances;
    if (employeeId) {
      filteredPerformances = filteredPerformances.filter(perf => perf.employeeId === employeeId);
    }
    if (cycle) {
      filteredPerformances = filteredPerformances.filter(perf => perf.cycle === cycle);
    }
    if (year) {
      filteredPerformances = filteredPerformances.filter(perf => perf.year === parseInt(year));
    }
    if (status) {
      filteredPerformances = filteredPerformances.filter(perf => perf.status === status);
    }

    // 分页
    const total = filteredPerformances.length;
    const start = (page - 1) * limit;
    const data = filteredPerformances.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取绩效列表失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/performances
 * 创建绩效
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证数据
    const validated = performanceSchema.parse(body);

    // TODO: 保存到数据库
    const mockEmployeeName = `员工${validated.employeeId}`;
    const kpiScore = validated.kpiScore;
    const competenceScore = validated.competenceScore;
    const attitudeScore = validated.attitudeScore;
    const score = Math.round((kpiScore + competenceScore + attitudeScore) / 3);

    // 计算等级
    let grade: 'A' | 'B' | 'C' | 'D' = 'C';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    const newPerformance: Performance = {
      id: crypto.randomUUID(),
      ...validated,
      employeeName: mockEmployeeName,
      score,
      grade,
      goals: body.goals || [],
      status: 'draft',
      companyId: body.companyId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newPerformance,
      message: '绩效创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建绩效失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/performances
 * 批量更新绩效
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceIds, updates } = body;

    if (!Array.isArray(performanceIds) || performanceIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要更新的绩效' },
        { status: 400 }
      );
    }

    // TODO: 批量更新数据库
    const updatedPerformances = performanceIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: updatedPerformances,
      message: `成功更新 ${performanceIds.length} 条绩效记录`,
    });
  } catch (error) {
    console.error('批量更新绩效失败:', error);
    return NextResponse.json(
      { error: '批量更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/performances
 * 批量删除绩效
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { performanceIds } = body;

    if (!Array.isArray(performanceIds) || performanceIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的绩效' },
        { status: 400 }
      );
    }

    // TODO: 从数据库批量删除
    return NextResponse.json({
      success: true,
      message: `成功删除 ${performanceIds.length} 条绩效记录`,
    });
  } catch (error) {
    console.error('批量删除绩效失败:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
