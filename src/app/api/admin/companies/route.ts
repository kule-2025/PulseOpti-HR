import { NextRequest, NextResponse } from 'next/server';
import { getDb, companies, subscriptions, users } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc, count, sql } from 'drizzle-orm';

// GET /api/admin/companies - 获取企业列表
export async function GET(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const db = await getDb();

    // 获取所有企业
    const allCompanies = await db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));

    // 计算每个企业的员工数
    const companiesWithEmployeeCount = await Promise.all(
      allCompanies.map(async (company) => {
        const employeeCount = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.companyId, company.id));

        return {
          ...company,
          employeeCount: employeeCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      companies: companiesWithEmployeeCount,
      total: companiesWithEmployeeCount.length,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: '获取企业列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
