/**
 * 单个积分规则管理API
 * 提供单个积分规则的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PointsRule } from '../rules-batch/route';

// 数据验证schema
const ruleSchema = z.object({
  name: z.string().min(1, '规则名称不能为空'),
  description: z.string().min(1, '规则描述不能为空'),
  type: z.enum(['earn', 'redeem', 'deduct']),
  category: z.enum(['attendance', 'performance', 'training', 'recommendation', 'other']),
  points: z.number().int().min(0, '积分必须是非负整数'),
  maxPoints: z.number().int().min(0).optional(),
  condition: z.string().min(1, '触发条件不能为空'),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(50),
});

/**
 * GET /api/points/rules/[id]
 * 获取单个积分规则
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ruleId } = await params;

    // TODO: 从数据库获取积分规则
    // 简化处理，返回模拟数据
    const mockRule: PointsRule = {
      id: ruleId,
      name: '每日签到',
      description: '用户每日签到可获得的积分',
      type: 'earn',
      category: 'attendance',
      points: 5,
      maxPoints: 5,
      condition: '每日首次登录',
      isActive: true,
      priority: 80,
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockRule,
    });
  } catch (error) {
    console.error('获取积分规则失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/points/rules/[id]
 * 更新单个积分规则
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ruleId } = await params;
    const body = await request.json();

    // 验证数据
    const validated = ruleSchema.parse(body);

    // TODO: 更新数据库
    const updatedRule: PointsRule = {
      id: ruleId,
      ...validated,
      companyId: body.companyId || 'default',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedRule,
      message: '积分规则更新成功',
    });
  } catch (error) {
    console.error('更新积分规则失败:', error);

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
 * DELETE /api/points/rules/[id]
 * 删除单个积分规则
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ruleId } = await params;

    // TODO: 从数据库删除
    return NextResponse.json({
      success: true,
      message: '积分规则删除成功',
    });
  } catch (error) {
    console.error('删除积分规则失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
