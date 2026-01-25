import { NextRequest, NextResponse } from 'next/server';
import { getDb, companies, subscriptions, users, orders, auditLogs } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq, desc, count, sql, sum } from 'drizzle-orm';

// GET /api/admin/companies/[id] - 获取企业详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: companyId } = await params;
    const db = await getDb();

    // 获取企业详情
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company || company.length === 0) {
      return NextResponse.json({ error: '企业不存在' }, { status: 404 });
    }

    // 获取订阅信息
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.companyId, companyId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    // 计算统计数据
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.companyId, companyId));

    const activeUserCount = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.companyId} = ${companyId} AND ${users.isActive} = true`);

    const orderCount = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.companyId, companyId));

    const totalAmountResult = await db
      .select({ total: sum(orders.amount) })
      .from(orders)
      .where(eq(orders.companyId, companyId));

    const companyData = company[0];

    const companyDetails = {
      ...companyData,
      employeeCount: userCount[0]?.count || 0,
      subscriptionEndAt: subscription[0]?.endDate || null,
      maxEmployees: subscription[0]?.maxEmployees || 0,
      maxSubAccounts: subscription[0]?.maxSubAccounts || 0,
      subAccountCount: userCount[0]?.count || 0, // 简化处理，实际应计算子账号
    };

    const stats = {
      totalUsers: userCount[0]?.count || 0,
      activeUsers: activeUserCount[0]?.count || 0,
      totalOrders: orderCount[0]?.count || 0,
      totalAmount: totalAmountResult[0]?.total || 0,
    };

    return NextResponse.json({
      success: true,
      company: companyDetails,
      stats,
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { error: '获取企业详情失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/companies/[id] - 更新企业信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: companyId } = await params;
    const body = await request.json();

    const db = await getDb();

    // 检查企业是否存在
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!existingCompany || existingCompany.length === 0) {
      return NextResponse.json({ error: '企业不存在' }, { status: 404 });
    }

    const {
      name,
      industry,
      scale,
      contactPerson,
      contactPhone,
      contactEmail,
      address,
      subscriptionTier,
      isActive,
      maxEmployees,
      maxSubAccounts,
    } = body;

    // 更新企业信息
    await db
      .update(companies)
      .set({
        ...(name && { name }),
        ...(industry !== undefined && { industry }),
        ...(scale && { scale }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));

    // 如果更新了订阅套餐，更新订阅信息
    if (subscriptionTier || maxEmployees || maxSubAccounts) {
      const currentSubscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.companyId, companyId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      const updateData: any = {};
      if (subscriptionTier) updateData.tier = subscriptionTier;
      if (maxEmployees !== undefined) updateData.maxEmployees = maxEmployees;
      if (maxSubAccounts !== undefined) updateData.maxSubAccounts = maxSubAccounts;

      if (currentSubscription && currentSubscription.length > 0) {
        await db
          .update(subscriptions)
          .set(updateData)
          .where(eq(subscriptions.id, currentSubscription[0].id));
      }
    }

    // 记录审计日志
    await db.insert(auditLogs).values({
      companyId,
      userId: decoded.userId,
      action: 'UPDATE_COMPANY',
      resourceType: 'company',
      resourceId: companyId,
      resourceName: existingCompany[0]?.name || 'Unknown Company',
      changes: JSON.stringify({
        updateData: body,
      }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '企业信息已更新',
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: '更新企业信息失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
