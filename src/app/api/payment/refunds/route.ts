import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { refundRecords } from "@/storage/database/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentService } from "@/lib/payment";

// GET /api/payment/refunds - 获取退款记录列表
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
      ? [eq(refundRecords.companyId, targetCompanyId)]
      : [];

    if (status) {
      conditions.push(eq(refundRecords.status, status));
    }

    const refunds = await db
      .select()
      .from(refundRecords)
      .where(and(...conditions))
      .orderBy(desc(refundRecords.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const totalResult = await db
      .select({ count: refundRecords.id })
      .from(refundRecords)
      .where(and(...conditions));

    const total = totalResult.length;

    return NextResponse.json({
      data: refunds,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取退款记录失败:", error);
    return NextResponse.json(
      { error: "获取退款记录失败" },
      { status: 500 }
    );
  }
}

// POST /api/payment/refunds - 创建退款
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
      paymentOrderId,
      amount,
      reason,
      refundType,
    } = body;

    // 验证必需字段
    if (!companyId || !paymentOrderId || !amount) {
      return NextResponse.json(
        { error: "缺少必需字段" },
        { status: 400 }
      );
    }

    // 验证权限
    if (payload.companyId !== companyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权操作该企业的数据" }, { status: 403 });
    }

    // 创建退款
    const result = await PaymentService.createRefund({
      companyId,
      userId: payload.userId,
      paymentOrderId,
      amount,
      reason,
      refundType,
      requestedBy: payload.userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("创建退款失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建退款失败" },
      { status: 500 }
    );
  }
}
