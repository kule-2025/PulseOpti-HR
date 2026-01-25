/**
 * 部门管理API
 * 提供部门的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 部门数据结构
export interface Department {
  id: string;
  departmentId: string;
  name: string;
  parentId?: string;
  managerId?: string;
  level: number;
  description?: string;
  employeeCount: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

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
 * GET /api/departments
 * 获取部门列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const parentId = searchParams.get('parentId');
    const keyword = searchParams.get('keyword');

    // TODO: 从数据库获取部门列表
    // 简化处理，返回模拟数据（树形结构）
    const mockDepartments: Department[] = [
      {
        id: '1',
        departmentId: 'DEPT001',
        name: '研发中心',
        level: 1,
        employeeCount: 120,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        departmentId: 'DEPT002',
        name: '产品部',
        level: 1,
        employeeCount: 35,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        departmentId: 'DEPT003',
        name: '销售部',
        level: 1,
        employeeCount: 80,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        departmentId: 'DEPT001-1',
        name: '前端开发组',
        parentId: '1',
        level: 2,
        employeeCount: 30,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        departmentId: 'DEPT001-2',
        name: '后端开发组',
        parentId: '1',
        level: 2,
        employeeCount: 40,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 过滤
    let filteredDepartments = mockDepartments;
    if (parentId) {
      filteredDepartments = filteredDepartments.filter(dept => dept.parentId === parentId);
    }
    if (keyword) {
      filteredDepartments = filteredDepartments.filter(dept =>
        dept.name.includes(keyword) ||
        dept.departmentId.includes(keyword)
      );
    }

    // 构建树形结构
    const buildTree = (depts: Department[], parentId?: string): Department[] => {
      return depts
        .filter(dept => dept.parentId === parentId)
        .map(dept => ({
          ...dept,
          children: buildTree(depts, dept.id),
        }));
    };

    const tree = buildTree(filteredDepartments);

    return NextResponse.json({
      success: true,
      data: tree,
      total: filteredDepartments.length,
    });
  } catch (error) {
    console.error('获取部门列表失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/departments
 * 创建部门
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证数据
    const validated = departmentSchema.parse(body);

    // TODO: 保存到数据库
    const newDepartment: Department = {
      id: crypto.randomUUID(),
      ...validated,
      employeeCount: 0,
      companyId: body.companyId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newDepartment,
      message: '部门创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建部门失败:', error);

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
 * PUT /api/departments
 * 批量更新部门
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentIds, updates } = body;

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要更新的部门' },
        { status: 400 }
      );
    }

    // TODO: 批量更新数据库
    const updatedDepartments = departmentIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: updatedDepartments,
      message: `成功更新 ${departmentIds.length} 个部门信息`,
    });
  } catch (error) {
    console.error('批量更新部门失败:', error);
    return NextResponse.json(
      { error: '批量更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/departments
 * 批量删除部门
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentIds } = body;

    if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的部门' },
        { status: 400 }
      );
    }

    // TODO: 从数据库批量删除
    return NextResponse.json({
      success: true,
      message: `成功删除 ${departmentIds.length} 个部门`,
    });
  } catch (error) {
    console.error('批量删除部门失败:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
