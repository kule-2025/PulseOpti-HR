/**
 * 个人发展计划（IDP）API
 */

import { NextRequest, NextResponse } from 'next/server';
import { talentMapService } from '@/lib/talent/talent-map-service';

/**
 * POST /api/talent/idp
 * 生成个人发展计划
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, targetPosition } = body;
    
    if (!employeeId || !targetPosition) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // TODO: 从数据库获取员工数据
    // 简化处理，使用模拟数据
    const employee: any = {};
    const allEmployees: any[] = [];
    
    const idp = talentMapService.generateIDP(employee, targetPosition, allEmployees);
    
    return NextResponse.json({
      success: true,
      data: idp,
      message: '个人发展计划生成成功',
    });
  } catch (error) {
    console.error('生成个人发展计划失败:', error);
    return NextResponse.json(
      { error: '生成失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/talent/idp
 * 更新个人发展计划
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { idpId, developmentPlan, reviewDate, mentorId } = body;
    
    if (!idpId) {
      return NextResponse.json(
        { error: '缺少IDP ID' },
        { status: 400 }
      );
    }
    
    // TODO: 更新数据库
    
    return NextResponse.json({
      success: true,
      message: '个人发展计划更新成功',
    });
  } catch (error) {
    console.error('更新个人发展计划失败:', error);
    return NextResponse.json(
      { error: '更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
