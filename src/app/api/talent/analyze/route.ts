/**
 * 人才地图和继任计划API
 * 提供人才盘点、继任计划、个人发展计划等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { talentMapService } from '@/lib/talent/talent-map-service';

/**
 * POST /api/talent/analyze
 * 分析人才九宫格
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employees } = body;
    
    if (!Array.isArray(employees)) {
      return NextResponse.json(
        { error: '员工数据必须是数组' },
        { status: 400 }
      );
    }
    
    const grid = talentMapService.analyzeTalentGrid(employees);
    
    return NextResponse.json({
      success: true,
      data: grid,
    });
  } catch (error) {
    console.error('分析人才九宫格失败:', error);
    return NextResponse.json(
      { error: '分析失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/talent/succession
 * 获取继任计划
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeIds = searchParams.get('employees');
    
    if (!employeeIds) {
      return NextResponse.json(
        { error: '缺少员工ID参数' },
        { status: 400 }
      );
    }
    
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
