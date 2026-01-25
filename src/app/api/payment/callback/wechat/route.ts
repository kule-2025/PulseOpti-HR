import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment";
import { PaymentProvider } from "@/lib/payment";

// POST /api/payment/callback/wechat - 微信支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { return_code, result_code, ...rest } = body;

    // 验证签名
    const isValid = await PaymentService.verifyCallbackSignature(
      PaymentProvider.WECHAT_PAY,
      body
    );

    if (!isValid) {
      return NextResponse.json(
        { return_code: "FAIL", return_msg: "签名失败" },
        { status: 200 }
      );
    }

    // 处理支付回调
    const result = await PaymentService.handlePaymentCallback(
      PaymentProvider.WECHAT_PAY,
      body
    );

    if (!result.success) {
      return NextResponse.json(
        { return_code: "FAIL", return_msg: "处理失败" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { return_code: "SUCCESS", return_msg: "OK" },
      { status: 200 }
    );
  } catch (error) {
    console.error("处理微信支付回调失败:", error);
    return NextResponse.json(
      { return_code: "FAIL", return_msg: "服务器错误" },
      { status: 200 }
    );
  }
}
