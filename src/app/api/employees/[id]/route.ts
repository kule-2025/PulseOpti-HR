/**
 * 单个员工管理API
 * 提供单个员工的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Employee } from '../route';

// 数据验证schema
const employeeSchema = z.object({
  employeeId: z.string().min(1, '员工编号不能为空'),
  name: z.string().min(1, '员工姓名不能为空'),
  department: z.string().min(1, '部门不能为空'),
  position: z.string().min(1, '职位不能为空'),
  level: z.string().min(1, '职级不能为空'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().min(11, '手机号格式不正确'),
  hireDate: z.string().min(1, '入职日期不能为空'),
  status: z.enum(['active', 'probation', 'resigned']),
  managerId: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(z.string()).default([]),
  salary: z.number().min(0, '薪资必须是非负数'),
  performanceScore: z.number().min(0).max(100).default(0),
  potentialScore: z.number().min(0).max(100).default(0),
});

/**
 * GET /api/employees/[id]
 * 获取单个员工
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;

    // TODO: 从数据库获取员工
    // 简化处理，返回模拟数据
    const mockEmployee: Employee = {
      id: employeeId,
      employeeId: 'EMP001',
      name: '张三',
      department: '研发部',
      position: '高级工程师',
      level: 'P6',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      hireDate: '2023-01-15',
      status: 'active',
      managerId: 'M001',
      skills: ['Java', 'Python', 'React'],
      salary: 25000,
      performanceScore: 85,
      potentialScore: 80,
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockEmployee,
    });
  } catch (error) {
    console.error('获取员工失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees/[id]
 * 更新单个员工
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const body = await request.json();

    // 验证数据
    const validated = employeeSchema.parse(body);

    // TODO: 更新数据库
    const updatedEmployee: Employee = {
      id: employeeId,
      ...validated,
      companyId: body.companyId || 'default',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: '员工信息更新成功',
    });
  } catch (error) {
    console.error('更新员工失败:', error);

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
 * DELETE /api/employees/[id]
 * 删除单个员工
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;

    // TODO: 从数据库删除（软删除，只更新状态）
    return NextResponse.json({
      success: true,
      message: '员工删除成功',
    });
  } catch (error) {
    console.error('删除员工失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
