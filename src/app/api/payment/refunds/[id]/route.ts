import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { refundRecords } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentService } from "@/lib/payment";

// GET /api/payment/refunds/[id] - 获取退款记录详情
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
    const records = await db
      .select()
      .from(refundRecords)
      .where(eq(refundRecords.id, id));

    if (records.length === 0) {
      return NextResponse.json({ error: "退款记录不存在" }, { status: 404 });
    }

    const record = records[0];

    // 验证权限
    if (
      payload.companyId !== record.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权访问该退款记录" }, { status: 403 });
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("获取退款记录失败:", error);
    return NextResponse.json(
      { error: "获取退款记录失败" },
      { status: 500 }
    );
  }
}
