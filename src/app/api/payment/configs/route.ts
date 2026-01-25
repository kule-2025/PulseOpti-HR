import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentConfigs } from "@/storage/database/shared/schema";
import { eq, desc } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentProvider } from "@/lib/payment";

// GET /api/payment/configs - 获取支付配置列表
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

    if (!companyId && payload.userType === "main_account") {
      // 主账号必须有companyId
      return NextResponse.json({ error: "缺少企业ID" }, { status: 400 });
    }

    const targetCompanyId = companyId || payload.companyId;
    if (targetCompanyId && payload.companyId !== targetCompanyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权访问该企业的数据" }, { status: 403 });
    }

    const db = await getDb();
    const configs = await db
      .select()
      .from(paymentConfigs)
      .where(
        targetCompanyId
          ? eq(paymentConfigs.companyId, targetCompanyId)
          : undefined
      )
      .orderBy(desc(paymentConfigs.createdAt));

    return NextResponse.json({ data: configs });
  } catch (error) {
    console.error("获取支付配置失败:", error);
    return NextResponse.json(
      { error: "获取支付配置失败" },
      { status: 500 }
    );
  }
}

// POST /api/payment/configs - 创建支付配置
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
      providerName,
      config,
      environment,
      isActive,
      isDefault,
      supportCurrencies,
      minAmount,
      maxAmount,
      feeRate,
      description,
    } = body;

    // 验证必需字段
    if (!companyId || !provider || !providerName || !config) {
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

    // 如果设置为默认配置，需要取消其他配置的默认状态
    const db = await getDb();
    if (isDefault) {
      await db
        .update(paymentConfigs)
        .set({ isDefault: false })
        .where(eq(paymentConfigs.companyId, companyId));
    }

    // 创建支付配置
    const newConfig = await db
      .insert(paymentConfigs)
      .values({
        companyId,
        provider,
        providerName,
        config,
        environment: environment || "sandbox",
        isActive: isActive ?? false,
        isDefault: isDefault ?? false,
        supportCurrencies: supportCurrencies || ["CNY"],
        minAmount: minAmount || 100,
        maxAmount: maxAmount || 1000000,
        feeRate: feeRate || 0.006,
        description,
        createdBy: payload.userId,
      })
      .returning();

    return NextResponse.json({ data: newConfig[0] }, { status: 201 });
  } catch (error) {
    console.error("创建支付配置失败:", error);
    return NextResponse.json(
      { error: "创建支付配置失败" },
      { status: 500 }
    );
  }
}
