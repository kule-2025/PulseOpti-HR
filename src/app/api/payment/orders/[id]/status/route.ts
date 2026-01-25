import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentOrders } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentService } from "@/lib/payment";

// GET /api/payment/orders/[id]/status - 查询支付订单状态
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

    // 查询支付状态
    const status = await PaymentService.queryPaymentStatus(
      order.paymentNo,
      order.provider as any
    );

    return NextResponse.json({ status });
  } catch (error) {
    console.error("查询支付状态失败:", error);
    return NextResponse.json(
      { error: "查询支付状态失败" },
      { status: 500 }
    );
  }
}
