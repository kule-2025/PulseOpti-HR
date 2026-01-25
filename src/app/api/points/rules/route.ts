import { NextRequest, NextResponse } from 'next/server';
import {
  createPointRule,
  getPointRules,
  updatePointRule,
  deletePointRule,
  getPointRuleById,
} from '@/storage/database/pointsManager';
import type { InsertPointRule } from '@/storage/database/shared/schema';

/**
 * GET /api/points/rules
 * 获取积分规则列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dimensionId = searchParams.get('dimensionId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    const rules = await getPointRules(companyId, dimensionId || undefined);

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error('获取积分规则失败:', error);
    return NextResponse.json({ success: false, error: '获取积分规则失败' }, { status: 500 });
  }
}

/**
 * POST /api/points/rules
 * 创建积分规则
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, dimensionId, code, name, type, triggerType, points, description, conditions, limits, priority, isActive } = body;

    if (!companyId || !code || !name || !type || !points) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const ruleData: InsertPointRule = {
      companyId,
      dimensionId: dimensionId || null,
      code,
      name,
      type,
      triggerType,
      points: parseInt(points),
      description,
      conditions: conditions || {},
      limits: limits || {},
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
    };

    const rule = await createPointRule(ruleData);

    return NextResponse.json({
      success: true,
      data: rule,
      message: '积分规则创建成功',
    });
  } catch (error) {
    console.error('创建积分规则失败:', error);
    return NextResponse.json({ success: false, error: '创建积分规则失败' }, { status: 500 });
  }
}

/**
 * PUT /api/points/rules
 * 更新积分规则
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少规则ID' }, { status: 400 });
    }

    // 转换points为数字
    if (updateData.points !== undefined) {
      updateData.points = parseInt(updateData.points);
    }

    const rule = await updatePointRule(id, updateData);

    if (!rule) {
      return NextResponse.json({ success: false, error: '规则不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: rule,
      message: '积分规则更新成功',
    });
  } catch (error) {
    console.error('更新积分规则失败:', error);
    return NextResponse.json({ success: false, error: '更新积分规则失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/points/rules
 * 删除积分规则
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少规则ID' }, { status: 400 });
    }

    const rule = await deletePointRule(id);

    if (!rule) {
      return NextResponse.json({ success: false, error: '规则不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '积分规则删除成功',
    });
  } catch (error) {
    console.error('删除积分规则失败:', error);
    return NextResponse.json({ success: false, error: '删除积分规则失败' }, { status: 500 });
  }
}
