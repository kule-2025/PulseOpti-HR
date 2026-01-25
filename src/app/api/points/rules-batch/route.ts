/**
 * 积分规则管理API
 * 提供积分规则的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 积分规则数据结构
export interface PointsRule {
  id: string;
  name: string;
  description: string;
  type: 'earn' | 'redeem' | 'deduct';
  category: 'attendance' | 'performance' | 'training' | 'recommendation' | 'other';
  points: number;
  maxPoints?: number;
  condition: string;
  isActive: boolean;
  priority: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

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
 * GET /api/points/rules
 * 获取积分规则列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 从数据库获取积分规则列表
    // 简化处理，返回模拟数据
    const mockRules: PointsRule[] = [
      {
        id: '1',
        name: '每日签到',
        description: '用户每日签到可获得的积分',
        type: 'earn',
        category: 'attendance',
        points: 5,
        maxPoints: 5,
        condition: '每日首次登录',
        isActive: true,
        priority: 80,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: '完成绩效目标',
        description: '完成月度绩效目标可获得的积分',
        type: 'earn',
        category: 'performance',
        points: 100,
        condition: '月度绩效评估达到A级',
        isActive: true,
        priority: 70,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: '培训课程完成',
        description: '完成培训课程可获得的积分',
        type: 'earn',
        category: 'training',
        points: 50,
        condition: '完成一门培训课程并通过考核',
        isActive: true,
        priority: 60,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 过滤
    let filteredRules = mockRules;
    if (type) {
      filteredRules = filteredRules.filter(rule => rule.type === type);
    }
    if (category) {
      filteredRules = filteredRules.filter(rule => rule.category === category);
    }
    if (isActive !== null) {
      filteredRules = filteredRules.filter(rule => rule.isActive === (isActive === 'true'));
    }

    // 分页
    const total = filteredRules.length;
    const start = (page - 1) * limit;
    const data = filteredRules.slice(start, start + limit);

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
    console.error('获取积分规则失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/points/rules
 * 创建积分规则
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证数据
    const validated = ruleSchema.parse(body);

    // TODO: 保存到数据库
    const newRule: PointsRule = {
      id: crypto.randomUUID(),
      ...validated,
      companyId: body.companyId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newRule,
      message: '积分规则创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建积分规则失败:', error);

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
 * PUT /api/points/rules
 * 批量更新积分规则
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleIds, updates } = body;

    if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要更新的规则' },
        { status: 400 }
      );
    }

    // TODO: 批量更新数据库
    const updatedRules = ruleIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: updatedRules,
      message: `成功更新 ${ruleIds.length} 条积分规则`,
    });
  } catch (error) {
    console.error('批量更新积分规则失败:', error);
    return NextResponse.json(
      { error: '批量更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/points/rules
 * 批量删除积分规则
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleIds } = body;

    if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的规则' },
        { status: 400 }
      );
    }

    // TODO: 从数据库批量删除
    return NextResponse.json({
      success: true,
      message: `成功删除 ${ruleIds.length} 条积分规则`,
    });
  } catch (error) {
    console.error('批量删除积分规则失败:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
