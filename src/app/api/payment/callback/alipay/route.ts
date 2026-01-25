import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment";
import { PaymentProvider } from "@/lib/payment";

// POST /api/payment/callback/alipay - 支付宝支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trade_status, ...rest } = body;

    // 验证回调签名
    const isValid = await PaymentService.verifyCallbackSignature(
      PaymentProvider.ALIPAY,
      body
    );

    if (!isValid) {
      return NextResponse.json({ error: "签名验证失败" }, { status: 400 });
    }

    // 处理支付回调
    const result = await PaymentService.handlePaymentCallback(
      PaymentProvider.ALIPAY,
      body
    );

    if (!result.success) {
      return NextResponse.json({ error: "处理失败" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("处理支付宝回调失败:", error);
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }
}

// GET /api/payment/callback/alipay - 支付宝同步返回
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = Object.fromEntries(searchParams.entries());

    const { trade_status } = body;

    // 验证签名
    const isValid = await PaymentService.verifyCallbackSignature(
      PaymentProvider.ALIPAY,
      body
    );

    if (!isValid) {
      return NextResponse.redirect(
        new URL("/payment/failed?reason=sign_error", request.url)
      );
    }

    // 处理支付回调
    const result = await PaymentService.handlePaymentCallback(
      PaymentProvider.ALIPAY,
      body
    );

    if (!result.success) {
      return NextResponse.redirect(
        new URL("/payment/failed?reason=callback_error", request.url)
      );
    }

    // 重定向到成功页面
    return NextResponse.redirect(
      new URL("/payment/success?order_no=" + body.out_trade_no, request.url)
    );
  } catch (error) {
    console.error("处理支付宝同步返回失败:", error);
    return NextResponse.redirect(
      new URL("/payment/failed?reason=server_error", request.url)
    );
  }
}
