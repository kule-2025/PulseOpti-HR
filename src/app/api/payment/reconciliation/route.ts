import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { reconciliationRecords, paymentOrders } from "@/storage/database/shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentProvider, PaymentService } from "@/lib/payment";
import { startOfDay, endOfDay } from "date-fns";

// GET /api/payment/reconciliation - 获取对账记录列表
export async function GET(request: NextRequest) {
  try {
    // 验证JWT
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const provider = searchParams.get("provider");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    if (!companyId && payload.userType === "main_account") {
      return NextResponse.json({ error: "缺少企业ID" }, { status: 400 });
    }

    const targetCompanyId = companyId || payload.companyId;
    if (targetCompanyId && payload.companyId !== targetCompanyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权访问该企业的数据" }, { status: 403 });
    }

    const db = await getDb();
    const conditions = targetCompanyId
      ? [eq(reconciliationRecords.companyId, targetCompanyId)]
      : [];

    if (provider) {
      conditions.push(eq(reconciliationRecords.provider, provider));
    }

    if (status) {
      conditions.push(eq(reconciliationRecords.status, status));
    }

    const records = await db
      .select()
      .from(reconciliationRecords)
      .where(and(...conditions))
      .orderBy(reconciliationRecords.createdAt)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: reconciliationRecords.id })
      .from(reconciliationRecords)
      .where(and(...conditions));

    const total = totalResult.length;

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取对账记录失败:", error);
    return NextResponse.json(
      { error: "获取对账记录失败" },
      { status: 500 }
    );
  }
}

// POST /api/payment/reconciliation - 创建对账任务
export async function POST(request: NextRequest) {
  try {
    // 验证JWT
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyId,
      provider,
      reconcileDate,
      reconcileType = "daily",
    } = body;

    // 验证必需字段
    if (!companyId || !provider || !reconcileDate) {
      return NextResponse.json(
        { error: "缺少必需字段" },
        { status: 400 }
      );
    }

    // 验证权限
    if (payload.companyId !== companyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权操作该企业的数据" }, { status: 403 });
    }

    // 验证支付方式
    if (!Object.values(PaymentProvider).includes(provider as PaymentProvider)) {
      return NextResponse.json({ error: "无效的支付方式" }, { status: 400 });
    }

    const db = await getDb();

    // 查询指定日期的支付订单
    const startDate = startOfDay(new Date(reconcileDate));
    const endDate = endOfDay(new Date(reconcileDate));

    const orders = await db
      .select()
      .from(paymentOrders)
      .where(
        and(
          eq(paymentOrders.companyId, companyId),
          eq(paymentOrders.provider, provider),
          gte(paymentOrders.createdAt, startDate),
          lte(paymentOrders.createdAt, endDate)
        )
      );

    // 统计数据
    const totalOrders = orders.length;
    const successOrders = orders.filter(
      (order: any) => order.status === "paid"
    ).length;
    const failedOrders = orders.filter(
      (order: any) => order.status === "failed"
    ).length;

    const totalAmount = orders.reduce(
      (sum: number, order: any) => sum + (order.amount || 0),
      0
    );
    const successAmount = orders
      .filter((order: any) => order.status === "paid")
      .reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
    const failedAmount = orders
      .filter((order: any) => order.status === "failed")
      .reduce((sum: number, order: any) => sum + (order.amount || 0), 0);

    const totalFee = orders.reduce(
      (sum: number, order: any) => sum + (order.totalFee || 0),
      0
    );

    // 创建对账记录
    const record = await db
      .insert(reconciliationRecords)
      .values({
        companyId,
        provider,
        reconcileDate: new Date(reconcileDate),
        reconcileType,
        totalOrders,
        successOrders,
        failedOrders,
        totalAmount,
        successAmount,
        failedAmount,
        totalFee,
        status: "success",
        operatedBy: payload.userId,
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ data: record[0] }, { status: 201 });
  } catch (error) {
    console.error("创建对账任务失败:", error);
    return NextResponse.json(
      { error: "创建对账任务失败" },
      { status: 500 }
    );
  }
}
