import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employees, departments, positions, users } from '@/storage/database/shared/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 创建员工档案
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userStr = request.headers.get('x-user-id');
    if (!userStr) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必填字段
    const requiredFields = ['name', 'email', 'phone', 'departmentId', 'positionId', 'hireDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证邮箱唯一性
    const db = await getDb();
    const existingEmployees = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.companyId, user.companyId),
          eq(employees.email, body.email)
        )
      )
      .limit(1);

    if (existingEmployees.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被使用' },
        { status: 400 }
      );
    }

    // 生成员工ID
    const employeeId = randomUUID();

    // 插入员工数据
    await db.insert(employees).values({
      id: employeeId,
      companyId: user.companyId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender || 'unknown',
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      idCardNumber: body.idNumber || null,
      departmentId: body.departmentId,
      positionId: body.positionId,
      employmentType: body.employmentType || 'fulltime',
      hireDate: new Date(body.hireDate),
      probationEndDate: body.probationEndDate ? new Date(body.probationEndDate) : null,
      employmentStatus: 'active',
      salary: body.salary || null,
      managerId: body.managerId || null,
      address: body.address || '',
      education: body.education ? JSON.parse(body.education) : null,
      workExperience: body.workExperience ? JSON.parse(body.workExperience) : null,
      emergencyContact: body.emergencyContact ? JSON.parse(body.emergencyContact) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '员工档案创建成功',
      data: { id: employeeId },
    });

  } catch (error) {
    console.error('创建员工失败:', error);
    return NextResponse.json(
      { error: '创建员工失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取员工列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const employmentStatus = searchParams.get('employmentStatus') || '';

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(employees.companyId, companyId)];

    if (search) {
      const searchCondition = or(
        like(employees.name, `%${search}%`),
        like(employees.email, `%${search}%`),
        like(employees.phone, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (departmentId) {
      conditions.push(eq(employees.departmentId, departmentId));
    }

    if (employmentStatus) {
      conditions.push(eq(employees.employmentStatus, employmentStatus));
    }

    // 查询员工列表
    const employeeList = await db
      .select({
        id: employees.id,
        name: employees.name,
        email: employees.email,
        phone: employees.phone,
        gender: employees.gender,
        avatarUrl: employees.avatarUrl,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        employmentType: employees.employmentType,
        employmentStatus: employees.employmentStatus,
        hireDate: employees.hireDate,
        probationEndDate: employees.probationEndDate,
        createdAt: employees.createdAt,
        departmentName: departments.name,
        positionName: positions.name,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(positions, eq(employees.positionId, positions.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(employees.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(employees)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .then((results) => results.length);

    return NextResponse.json({
      success: true,
      data: employeeList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取员工列表失败:', error);
    return NextResponse.json(
      { error: '获取员工列表失败' },
      { status: 500 }
    );
  }
}
