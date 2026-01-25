import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentOrders } from "@/storage/database/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentService } from "@/lib/payment";

// GET /api/payment/orders - 获取支付订单列表
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
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
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
      ? [eq(paymentOrders.companyId, targetCompanyId)]
      : [];

    if (status) {
      conditions.push(eq(paymentOrders.status, status));
    }

    if (provider) {
      conditions.push(eq(paymentOrders.provider, provider));
    }

    const orders = await db
      .select()
      .from(paymentOrders)
      .where(and(...conditions))
      .orderBy(desc(paymentOrders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: paymentOrders.id })
      .from(paymentOrders)
      .where(and(...conditions));

    const total = totalResult.length;

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取支付订单失败:", error);
    return NextResponse.json(
      { error: "获取支付订单失败" },
      { status: 500 }
    );
  }
}

// POST /api/payment/orders - 创建支付订单
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
      orderId,
      orderNo,
      amount,
      subject,
      description,
      payType,
      returnUrl,
      notifyUrl,
      clientIp,
      extra,
    } = body;

    // 验证必需字段
    if (!companyId || !orderNo || !amount || !subject) {
      return NextResponse.json(
        { error: "缺少必需字段" },
        { status: 400 }
      );
    }

    // 验证权限
    if (payload.companyId !== companyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权操作该企业的数据" }, { status: 403 });
    }

    // 创建支付订单
    const result = await PaymentService.createPaymentOrder({
      companyId,
      userId: payload.userId,
      orderId,
      orderNo,
      amount,
      subject,
      description,
      payType,
      returnUrl,
      notifyUrl,
      clientIp,
      extra,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("创建支付订单失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建支付订单失败" },
      { status: 500 }
    );
  }
}
