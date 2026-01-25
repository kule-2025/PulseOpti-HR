/**
 * 单个绩效管理API
 * 提供单个绩效的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Performance } from '../route';

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
 * GET /api/performances/[id]
 * 获取单个绩效
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: performanceId } = await params;

    // TODO: 从数据库获取绩效
    // 简化处理，返回模拟数据
    const mockPerformance: Performance = {
      id: performanceId,
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
      ],
      comments: '表现良好，继续保持',
      reviewerId: 'M001',
      reviewerName: '技术总监',
      status: 'confirmed',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockPerformance,
    });
  } catch (error) {
    console.error('获取绩效失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/performances/[id]
 * 更新单个绩效
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: performanceId } = await params;
    const body = await request.json();

    // 验证数据
    const validated = performanceSchema.parse(body);

    // TODO: 更新数据库
    const mockEmployeeName = body.employeeName || `员工${validated.employeeId}`;
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

    const updatedPerformance: Performance = {
      id: performanceId,
      ...validated,
      employeeName: mockEmployeeName,
      score,
      grade,
      goals: body.goals || [],
      status: body.status || 'draft',
      companyId: body.companyId || 'default',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedPerformance,
      message: '绩效信息更新成功',
    });
  } catch (error) {
    console.error('更新绩效失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/performances/[id]
 * 删除单个绩效
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: performanceId } = await params;

    // TODO: 从数据库删除
    return NextResponse.json({
      success: true,
      message: '绩效删除成功',
    });
  } catch (error) {
    console.error('删除绩效失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
