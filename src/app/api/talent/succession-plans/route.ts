/**
 * 继任计划管理API
 */

import { NextRequest, NextResponse } from 'next/server';
import { talentMapService } from '@/lib/talent/talent-map-service';

/**
 * GET /api/talent/succession-plans
 * 获取所有继任计划
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取员工数据
    // 简化处理，使用模拟数据
    const employees: any[] = [];
    
    const successionPlans = talentMapService.generateSuccessionPlan(employees);
    
    return NextResponse.json({
      success: true,
      data: successionPlans,
    });
  } catch (error) {
    console.error('获取继任计划失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent/succession-plans
 * 创建继任计划
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyPosition, incumbent, successors } = body;
    
    if (!keyPosition || !incumbent) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // TODO: 保存到数据库
    
    return NextResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        keyPosition,
        incumbent,
        successors: successors || [],
        createdAt: new Date(),
      },
      message: '继任计划创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建继任计划失败:', error);
    return NextResponse.json(
      { error: '创建失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
