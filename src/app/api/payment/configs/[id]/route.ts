import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paymentConfigs } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { PaymentProvider } from "@/lib/payment";

// GET /api/payment/configs/[id] - 获取单个支付配置
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
    const configs = await db
      .select()
      .from(paymentConfigs)
      .where(eq(paymentConfigs.id, id));

    if (configs.length === 0) {
      return NextResponse.json({ error: "支付配置不存在" }, { status: 404 });
    }

    const config = configs[0];

    // 验证权限
    if (
      payload.companyId !== config.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权访问该配置" }, { status: 403 });
    }

    // 不返回敏感配置信息
    const safeConfig = {
      ...config,
      config: {
        appId: (config.config as any).appId,
        merchantId: (config.config as any).merchantId,
        mchId: (config.config as any).mchId,
        // 不返回敏感信息
      },
    };

    return NextResponse.json({ data: safeConfig });
  } catch (error) {
    console.error("获取支付配置失败:", error);
    return NextResponse.json(
      { error: "获取支付配置失败" },
      { status: 500 }
    );
  }
}

// PUT /api/payment/configs/[id] - 更新支付配置
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

    const {
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

    const db = await getDb();
    const configs = await db
      .select()
      .from(paymentConfigs)
      .where(eq(paymentConfigs.id, id));

    if (configs.length === 0) {
      return NextResponse.json({ error: "支付配置不存在" }, { status: 404 });
    }

    const existingConfig = configs[0];

    // 验证权限
    if (
      payload.companyId !== existingConfig.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权修改该配置" }, { status: 403 });
    }

    // 如果设置为默认配置，需要取消其他配置的默认状态
    if (isDefault) {
      await db
        .update(paymentConfigs)
        .set({ isDefault: false })
        .where(eq(paymentConfigs.companyId, existingConfig.companyId));
    }

    // 更新支付配置
    const updated = await db
      .update(paymentConfigs)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(paymentConfigs.id, id))
      .returning();

    return NextResponse.json({ data: updated[0] });
  } catch (error) {
    console.error("更新支付配置失败:", error);
    return NextResponse.json(
      { error: "更新支付配置失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/payment/configs/[id] - 删除支付配置
export async function DELETE(
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
    const configs = await db
      .select()
      .from(paymentConfigs)
      .where(eq(paymentConfigs.id, id));

    if (configs.length === 0) {
      return NextResponse.json({ error: "支付配置不存在" }, { status: 404 });
    }

    const config = configs[0];

    // 验证权限
    if (
      payload.companyId !== config.companyId &&
      !payload.isSuperAdmin
    ) {
      return NextResponse.json({ error: "无权删除该配置" }, { status: 403 });
    }

    // 删除支付配置
    await db.delete(paymentConfigs).where(eq(paymentConfigs.id, id));

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除支付配置失败:", error);
    return NextResponse.json(
      { error: "删除支付配置失败" },
      { status: 500 }
    );
  }
}
