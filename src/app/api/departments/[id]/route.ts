/**
 * 单个部门管理API
 * 提供单个部门的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Department } from '../route';

// 数据验证schema
const departmentSchema = z.object({
  departmentId: z.string().min(1, '部门编号不能为空'),
  name: z.string().min(1, '部门名称不能为空'),
  parentId: z.string().optional(),
  managerId: z.string().optional(),
  level: z.number().int().min(1).default(1),
  description: z.string().optional(),
});

/**
 * GET /api/departments/[id]
 * 获取单个部门
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;

    // TODO: 从数据库获取部门
    // 简化处理，返回模拟数据
    const mockDepartment: Department = {
      id: departmentId,
      departmentId: 'DEPT001',
      name: '研发中心',
      level: 1,
      employeeCount: 120,
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockDepartment,
    });
  } catch (error) {
    console.error('获取部门失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/departments/[id]
 * 更新单个部门
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;
    const body = await request.json();

    // 验证数据
    const validated = departmentSchema.parse(body);

    // TODO: 更新数据库
    const updatedDepartment: Department = {
      id: departmentId,
      ...validated,
      employeeCount: body.employeeCount || 0,
      companyId: body.companyId || 'default',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedDepartment,
      message: '部门信息更新成功',
    });
  } catch (error) {
    console.error('更新部门失败:', error);

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
 * DELETE /api/departments/[id]
 * 删除单个部门
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: departmentId } = await params;

    // TODO: 检查是否有子部门或员工，如有则禁止删除
    // TODO: 从数据库删除
    return NextResponse.json({
      success: true,
      message: '部门删除成功',
    });
  } catch (error) {
    console.error('删除部门失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
