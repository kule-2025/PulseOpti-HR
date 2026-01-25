/**
 * 员工管理API
 * 提供员工的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 员工数据结构
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  level: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'probation' | 'resigned';
  managerId?: string;
  avatar?: string;
  skills: string[];
  salary: number;
  performanceScore: number;
  potentialScore: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

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
 * GET /api/employees
 * 获取员工列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 从数据库获取员工列表
    // 简化处理，返回模拟数据
    const mockEmployees: Employee[] = [
      {
        id: '1',
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
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        employeeId: 'EMP002',
        name: '李四',
        department: '产品部',
        position: '产品经理',
        level: 'P6',
        email: 'lisi@example.com',
        phone: '13800138002',
        hireDate: '2023-03-20',
        status: 'active',
        managerId: 'M002',
        skills: ['产品规划', '数据分析', '用户研究'],
        salary: 22000,
        performanceScore: 90,
        potentialScore: 85,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        employeeId: 'EMP003',
        name: '王五',
        department: '销售部',
        position: '销售专员',
        level: 'M1',
        email: 'wangwu@example.com',
        phone: '13800138003',
        hireDate: '2024-01-10',
        status: 'probation',
        managerId: 'M003',
        skills: ['销售技巧', '客户关系'],
        salary: 8000,
        performanceScore: 75,
        potentialScore: 70,
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 过滤
    let filteredEmployees = mockEmployees;
    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
    }
    if (status) {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
    }
    if (keyword) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.name.includes(keyword) ||
        emp.employeeId.includes(keyword) ||
        emp.email.includes(keyword)
      );
    }

    // 分页
    const total = filteredEmployees.length;
    const start = (page - 1) * limit;
    const data = filteredEmployees.slice(start, start + limit);

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
    console.error('获取员工列表失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 * 创建员工
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证数据
    const validated = employeeSchema.parse(body);

    // TODO: 保存到数据库
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      ...validated,
      companyId: body.companyId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: '员工创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建员工失败:', error);

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
 * PUT /api/employees
 * 批量更新员工
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeIds, updates } = body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要更新的员工' },
        { status: 400 }
      );
    }

    // TODO: 批量更新数据库
    const updatedEmployees = employeeIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: updatedEmployees,
      message: `成功更新 ${employeeIds.length} 名员工信息`,
    });
  } catch (error) {
    console.error('批量更新员工失败:', error);
    return NextResponse.json(
      { error: '批量更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employees
 * 批量删除员工
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeIds } = body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的员工' },
        { status: 400 }
      );
    }

    // TODO: 从数据库批量删除（软删除，只更新状态）
    return NextResponse.json({
      success: true,
      message: `成功删除 ${employeeIds.length} 名员工`,
    });
  } catch (error) {
    console.error('批量删除员工失败:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
