import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employees, departments, positions } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * 计算薪资
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
    const requiredFields = ['month', 'employeeIds'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const month = body.month; // 格式: 2024-01
    const employeeIds = body.employeeIds;

    // 查询员工信息
    const employeeList = await db
      .select({
        id: employees.id,
        name: employees.name,
        salary: employees.salary,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        employmentType: employees.employmentType,
        hireDate: employees.hireDate,
        departmentName: departments.name,
        positionName: positions.name,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(positions, eq(employees.positionId, positions.id))
      .where(and(
        eq(employees.companyId, user.companyId),
        eq(employees.employmentStatus, 'active')
      ))
      .limit(1000);

    // 过滤指定的员工ID
    const filteredEmployees = employeeIds.length > 0
      ? employeeList.filter(emp => employeeIds.includes(emp.id))
      : employeeList;

    // 计算每个员工的薪资
    const payrollResults = filteredEmployees.map(employee => {
      const baseSalary = employee.salary || 0;
      
      // 计算社保（个人部分，假设按基本工资的10%）
      const socialInsurance = Math.round(baseSalary * 0.1);
      
      // 计算公积金（个人部分，假设按基本工资的5%）
      const housingFund = Math.round(baseSalary * 0.05);
      
      // 计算个人所得税（简化版，不考虑起征点和税率档次）
      const taxBase = baseSalary - socialInsurance - housingFund;
      const incomeTax = Math.round(Math.max(0, taxBase * 0.05));
      
      // 计算绩效奖金（假设为基本工资的20%）
      const performanceBonus = Math.round(baseSalary * 0.2);
      
      // 计算津贴补贴（假设为基本工资的10%）
      const allowance = Math.round(baseSalary * 0.1);
      
      // 计算应发工资
      const grossSalary = baseSalary + performanceBonus + allowance;
      
      // 计算实发工资
      const netSalary = grossSalary - socialInsurance - housingFund - incomeTax;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        departmentName: employee.departmentName || '',
        positionName: employee.positionName || '',
        employmentType: employee.employmentType,
        baseSalary,
        performanceBonus,
        allowance,
        grossSalary,
        socialInsurance,
        housingFund,
        incomeTax,
        netSalary,
        month,
        status: 'unpaid',
        createdAt: new Date(),
      };
    });

    // 计算汇总数据
    const summary = {
      totalEmployees: payrollResults.length,
      totalGrossSalary: payrollResults.reduce((sum, item) => sum + item.grossSalary, 0),
      totalNetSalary: payrollResults.reduce((sum, item) => sum + item.netSalary, 0),
      totalSocialInsurance: payrollResults.reduce((sum, item) => sum + item.socialInsurance, 0),
      totalHousingFund: payrollResults.reduce((sum, item) => sum + item.housingFund, 0),
      totalIncomeTax: payrollResults.reduce((sum, item) => sum + item.incomeTax, 0),
    };

    return NextResponse.json({
      success: true,
      message: '薪资计算完成',
      data: {
        month,
        payrollResults,
        summary,
      },
    });

  } catch (error) {
    console.error('计算薪资失败:', error);
    return NextResponse.json(
      { error: '计算薪资失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取薪资明细
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(employees.companyId, companyId)];

    if (departmentId) {
      conditions.push(eq(employees.departmentId, departmentId));
    }

    // 查询员工信息
    const employeeList = await db
      .select({
        id: employees.id,
        name: employees.name,
        salary: employees.salary,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        employmentType: employees.employmentType,
        hireDate: employees.hireDate,
        departmentName: departments.name,
        positionName: positions.name,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(positions, eq(employees.positionId, positions.id))
      .where(and(...conditions))
      .orderBy(desc(employees.hireDate))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(employees)
      .where(and(...conditions))
      .then((results) => results.length);

    // 为每个员工计算薪资
    const payrollList = employeeList.map(employee => {
      const baseSalary = employee.salary || 0;
      const socialInsurance = Math.round(baseSalary * 0.1);
      const housingFund = Math.round(baseSalary * 0.05);
      const taxBase = baseSalary - socialInsurance - housingFund;
      const incomeTax = Math.round(Math.max(0, taxBase * 0.05));
      const performanceBonus = Math.round(baseSalary * 0.2);
      const allowance = Math.round(baseSalary * 0.1);
      const grossSalary = baseSalary + performanceBonus + allowance;
      const netSalary = grossSalary - socialInsurance - housingFund - incomeTax;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        departmentName: employee.departmentName || '',
        positionName: employee.positionName || '',
        employmentType: employee.employmentType,
        baseSalary,
        performanceBonus,
        allowance,
        grossSalary,
        socialInsurance,
        housingFund,
        incomeTax,
        netSalary,
      };
    });

    return NextResponse.json({
      success: true,
      data: payrollList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取薪资明细失败:', error);
    return NextResponse.json(
      { error: '获取薪资明细失败' },
      { status: 500 }
    );
  }
}
