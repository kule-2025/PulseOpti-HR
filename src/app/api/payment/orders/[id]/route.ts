import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentOrders } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentService, PaymentStatus } from "@/lib/payment";

// GET /api/payment/orders/[id] - 获取支付订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const db = await getDb();
    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, id));

    if (orders.length === 0) {
      return NextResponse.json({ error: "支付订单不存在" }, { status: 404 });
    }

    const order = orders[0];

    // 验证权限
    if (
      payload.companyId !== order.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权访问该订单" }, { status: 403 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("获取支付订单失败:", error);
    return NextResponse.json(
      { error: "获取支付订单失败" },
      { status: 500 }
    );
  }
}

// PUT /api/payment/orders/[id] - 取消支付订单
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
    }

    const db = await getDb();
    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, id));

    if (orders.length === 0) {
      return NextResponse.json({ error: "支付订单不存在" }, { status: 404 });
    }

    const order = orders[0];

    // 验证权限
    if (
      payload.companyId !== order.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权操作该订单" }, { status: 403 });
    }

    // 取消订单
    const success = await PaymentService.cancelPaymentOrder(order.paymentNo);

    if (!success) {
      return NextResponse.json({ error: "取消订单失败" }, { status: 400 });
    }

    return NextResponse.json({ message: "取消成功" });
  } catch (error) {
    console.error("取消支付订单失败:", error);
    return NextResponse.json(
      { error: "取消支付订单失败" },
      { status: 500 }
    );
  }
}
