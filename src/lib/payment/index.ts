import { paymentConfigs, paymentOrders, refundRecords, reconciliationRecords } from "@/storage/database/shared/schema";
import { getDb } from "@/lib/db";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";
import { createHash } from "crypto";

// ============ 支付方式枚举 ============
export enum PaymentProvider {
  ALIPAY = "alipay",
  WECHAT_PAY = "wechat_pay",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
}

// ============ 支付状态枚举 ============
export enum PaymentStatus {
  PENDING = "pending", // 待支付
  PROCESSING = "processing", // 支付处理中
  PAID = "paid", // 已支付
  FAILED = "failed", // 支付失败
  CANCELLED = "cancelled", // 已取消
  REFUNDING = "refunding", // 退款中
  REFUNDED = "refunded", // 已退款
}

// ============ 退款状态枚举 ============
export enum RefundStatus {
  PENDING = "pending", // 待退款
  PROCESSING = "processing", // 退款处理中
  SUCCESS = "success", // 退款成功
  FAILED = "failed", // 退款失败
  CANCELLED = "cancelled", // 已取消
}

// ============ 支付订单创建参数 ============
export interface CreatePaymentOrderParams {
  companyId: string;
  userId: string;
  orderId?: string; // 关联的业务订单ID
  orderNo: string; // 业务订单号
  amount: number; // 支付金额（分）
  subject: string; // 支付标题
  description?: string; // 支付描述
  payType?: string; // 支付方式
  returnUrl?: string; // 同步返回地址
  notifyUrl?: string; // 异步通知地址
  clientIp?: string; // 客户端IP
  extra?: Record<string, any>; // 扩展信息
}

// ============ 退款参数 ============
export interface CreateRefundParams {
  companyId: string;
  userId: string;
  paymentOrderId: string;
  amount: number; // 退款金额（分）
  reason?: string; // 退款原因
  refundType?: "full" | "partial"; // 退款类型
  requestedBy: string; // 申请人ID
}

// ============ 支付配置类型 ============
export interface PaymentConfigType {
  appId: string;
  appSecret: string;
  merchantId?: string;
  publicKey?: string;
  privateKey?: string;
  apiKey?: string;
  apiSecret?: string;
  mchId?: string;
  certPath?: string;
  keyPath?: string;
}

// ============ 支付服务类 ============
export class PaymentService {
  /**
   * 获取支付配置
   */
  static async getPaymentConfig(
    companyId: string,
    provider: PaymentProvider
  ): Promise<PaymentConfigType | null> {
    const db = await getDb();
    const config = await db
      .select()
      .from(paymentConfigs)
      .where(
        and(
          eq(paymentConfigs.companyId, companyId),
          eq(paymentConfigs.provider, provider),
          eq(paymentConfigs.isActive, true)
        )
      )
      .limit(1);

    if (config.length === 0) {
      return null;
    }

    return config[0].config as PaymentConfigType;
  }

  /**
   * 获取默认支付配置
   */
  static async getDefaultPaymentConfig(
    companyId: string
  ): Promise<{ provider: PaymentProvider; config: PaymentConfigType } | null> {
    const db = await getDb();
    const config = await db
      .select()
      .from(paymentConfigs)
      .where(
        and(
          eq(paymentConfigs.companyId, companyId),
          eq(paymentConfigs.isDefault, true),
          eq(paymentConfigs.isActive, true)
        )
      )
      .limit(1);

    if (config.length === 0) {
      // 如果没有默认配置，返回第一个可用的配置
      const firstConfig = await db
        .select()
        .from(paymentConfigs)
        .where(
          and(
            eq(paymentConfigs.companyId, companyId),
            eq(paymentConfigs.isActive, true)
          )
        )
        .limit(1);

      if (firstConfig.length === 0) {
        return null;
      }

      return {
        provider: firstConfig[0].provider as PaymentProvider,
        config: firstConfig[0].config as PaymentConfigType,
      };
    }

    return {
      provider: config[0].provider as PaymentProvider,
      config: config[0].config as PaymentConfigType,
    };
  }

  /**
   * 创建支付订单
   */
  static async createPaymentOrder(
    params: CreatePaymentOrderParams
  ): Promise<{ paymentOrder: any; paymentData?: any }> {
    const db = await getDb();

    // 生成支付流水号
    const paymentNo = this.generatePaymentNo();

    // 获取支付配置
    const defaultConfig = await this.getDefaultPaymentConfig(params.companyId);
    if (!defaultConfig) {
      throw new Error("未找到可用的支付配置");
    }

    // 创建支付订单记录
    const paymentOrder = await db
      .insert(paymentOrders)
      .values({
        companyId: params.companyId,
        userId: params.userId,
        orderId: params.orderId,
        orderNo: params.orderNo,
        paymentNo,
        provider: defaultConfig.provider,
        amount: params.amount,
        subject: params.subject,
        description: params.description,
        status: PaymentStatus.PENDING,
        payType: params.payType,
        clientIp: params.clientIp,
        returnUrl: params.returnUrl,
        notifyUrl: params.notifyUrl,
        expiredAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
        extra: params.extra,
      })
      .returning();

    // 根据支付方式生成支付数据
    let paymentData: any = null;

    if (defaultConfig.provider === PaymentProvider.ALIPAY) {
      paymentData = await this.createAlipayPayment(
        paymentOrder[0],
        defaultConfig.config,
        params
      );
    } else if (defaultConfig.provider === PaymentProvider.WECHAT_PAY) {
      paymentData = await this.createWechatPayment(
        paymentOrder[0],
        defaultConfig.config,
        params
      );
    }

    return {
      paymentOrder: paymentOrder[0],
      paymentData,
    };
  }

  /**
   * 生成支付流水号
   */
  private static generatePaymentNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `PAY${timestamp}${random}`;
  }

  /**
   * 生成退款流水号
   */
  private static generateRefundNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `REF${timestamp}${random}`;
  }

  /**
   * 创建支付宝支付
   */
  private static async createAlipayPayment(
    order: any,
    config: PaymentConfigType,
    params: CreatePaymentOrderParams
  ): Promise<any> {
    // 这里需要集成支付宝SDK
    // 由于这是示例代码，这里返回模拟数据
    // 实际项目中需要使用 alipay-sdk 或类似库

    return {
      method: "alipay.trade.page.pay",
      app_id: config.appId,
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: new Date().toISOString().replace(/T/, " ").replace(/\.\d+Z/, ""),
      version: "1.0",
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
      biz_content: JSON.stringify({
        out_trade_no: order.paymentNo,
        product_code: "FAST_INSTANT_TRADE_PAY",
        total_amount: (order.amount / 100).toFixed(2),
        subject: order.subject,
        body: order.description || order.subject,
      }),
      // 实际项目中这里需要生成签名
      sign: "", // 需要使用 config.privateKey 生成签名
    };
  }

  /**
   * 创建微信支付
   */
  private static async createWechatPayment(
    order: any,
    config: PaymentConfigType,
    params: CreatePaymentOrderParams
  ): Promise<any> {
    // 这里需要集成微信支付SDK
    // 由于这是示例代码，这里返回模拟数据
    // 实际项目中需要使用 wechatpay-node-v3 或类似库

    return {
      appId: config.appId,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: crypto.randomBytes(32).toString("hex"),
      package: `prepay_id=${order.paymentNo}`,
      signType: "RSA",
      paySign: "", // 需要使用 config.privateKey 生成签名
    };
  }

  /**
   * 处理支付回调
   */
  static async handlePaymentCallback(
    provider: PaymentProvider,
    data: any
  ): Promise<{ success: boolean; paymentOrder?: any }> {
    const db = await getDb();

    // 验证签名
    const isValid = await this.verifyCallbackSignature(provider, data);
    if (!isValid) {
      return { success: false };
    }

    // 查找支付订单
    const paymentNo = this.extractPaymentNo(provider, data);
    if (!paymentNo) {
      return { success: false };
    }

    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.paymentNo, paymentNo));

    if (orders.length === 0) {
      return { success: false };
    }

    const order = orders[0];

    // 检查订单状态
    if (order.status === PaymentStatus.PAID) {
      return { success: true, paymentOrder: order };
    }

    // 更新订单状态
    const updated = await db
      .update(paymentOrders)
      .set({
        status: PaymentStatus.PAID,
        providerOrderId: this.extractProviderOrderId(provider, data),
        transactionId: this.extractTransactionId(provider, data),
        paidAt: new Date(),
        totalFee: this.extractFee(provider, data),
        buyerInfo: this.extractBuyerInfo(provider, data),
      })
      .where(eq(paymentOrders.id, order.id))
      .returning();

    return { success: true, paymentOrder: updated[0] };
  }

  /**
   * 验证回调签名
   */
  static async verifyCallbackSignature(
    provider: PaymentProvider,
    data: any
  ): Promise<boolean> {
    // 实际项目中需要根据不同的支付方式实现签名验证
    // 这里返回 true 作为示例
    return true;
  }

  /**
   * 从回调数据中提取支付流水号
   */
  private static extractPaymentNo(provider: PaymentProvider, data: any): string | null {
    if (provider === PaymentProvider.ALIPAY) {
      return data.out_trade_no || null;
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return data.out_trade_no || null;
    }
    return null;
  }

  /**
   * 从回调数据中提取第三方订单ID
   */
  private static extractProviderOrderId(
    provider: PaymentProvider,
    data: any
  ): string | null {
    if (provider === PaymentProvider.ALIPAY) {
      return data.trade_no || null;
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return data.transaction_id || null;
    }
    return null;
  }

  /**
   * 从回调数据中提取交易流水号
   */
  private static extractTransactionId(
    provider: PaymentProvider,
    data: any
  ): string | null {
    return this.extractProviderOrderId(provider, data);
  }

  /**
   * 从回调数据中提取手续费
   */
  private static extractFee(provider: PaymentProvider, data: any): number | null {
    if (provider === PaymentProvider.ALIPAY) {
      return data.total_fee ? Math.round(parseFloat(data.total_fee) * 100) : null;
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return data.total_fee ? parseInt(data.total_fee) : null;
    }
    return null;
  }

  /**
   * 从回调数据中提取买家信息
   */
  private static extractBuyerInfo(provider: PaymentProvider, data: any): any {
    if (provider === PaymentProvider.ALIPAY) {
      return {
        buyerId: data.buyer_id,
        buyerEmail: data.buyer_email,
      };
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return {
        openid: data.openid,
      };
    }
    return null;
  }

  /**
   * 查询支付订单
   */
  static async queryPaymentOrder(paymentNo: string): Promise<any | null> {
    const db = await getDb();
    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.paymentNo, paymentNo));

    return orders.length > 0 ? orders[0] : null;
  }

  /**
   * 查询支付订单状态
   */
  static async queryPaymentStatus(
    paymentNo: string,
    provider: PaymentProvider
  ): Promise<PaymentStatus> {
    const db = await getDb();
    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.paymentNo, paymentNo));

    if (orders.length === 0) {
      return PaymentStatus.FAILED;
    }

    const order = orders[0];

    // 如果订单已经是最终状态，直接返回
    if (
      [
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.CANCELLED,
        PaymentStatus.REFUNDED,
      ].includes(order.status as PaymentStatus)
    ) {
      return order.status as PaymentStatus;
    }

    // 向第三方支付平台查询支付状态
    const config = await this.getPaymentConfig(order.companyId, provider);
    if (!config) {
      return PaymentStatus.FAILED;
    }

    const status = await this.queryProviderPaymentStatus(
      provider,
      order,
      config
    );

    // 更新订单状态
    if (status !== order.status) {
      await db
        .update(paymentOrders)
        .set({ status })
        .where(eq(paymentOrders.id, order.id));
    }

    return status;
  }

  /**
   * 查询第三方支付平台支付状态
   */
  private static async queryProviderPaymentStatus(
    provider: PaymentProvider,
    order: any,
    config: PaymentConfigType
  ): Promise<PaymentStatus> {
    // 实际项目中需要调用第三方支付平台的查询接口
    // 这里返回 order.status 作为示例
    return order.status;
  }

  /**
   * 取消支付订单
   */
  static async cancelPaymentOrder(paymentNo: string): Promise<boolean> {
    const db = await getDb();
    const orders = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.paymentNo, paymentNo));

    if (orders.length === 0) {
      return false;
    }

    const order = orders[0];

    // 只有待支付状态才能取消
    if (order.status !== PaymentStatus.PENDING) {
      return false;
    }

    await db
      .update(paymentOrders)
      .set({ status: PaymentStatus.CANCELLED })
      .where(eq(paymentOrders.id, order.id));

    return true;
  }

  /**
   * 创建退款
   */
  static async createRefund(
    params: CreateRefundParams
  ): Promise<{ refundRecord: any; refundData?: any }> {
    const db = await getDb();

    // 查询原支付订单
    const paymentOrdersList = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, params.paymentOrderId));

    if (paymentOrdersList.length === 0) {
      throw new Error("支付订单不存在");
    }

    const paymentOrder = paymentOrdersList[0];

    // 检查支付订单状态
    if (paymentOrder.status !== PaymentStatus.PAID) {
      throw new Error("只有已支付的订单才能退款");
    }

    // 生成退款流水号
    const refundNo = this.generateRefundNo();

    // 创建退款记录
    const refundRecord = await db
      .insert(refundRecords)
      .values({
        companyId: params.companyId,
        userId: params.userId,
        paymentOrderId: params.paymentOrderId,
        refundNo,
        paymentNo: paymentOrder.paymentNo,
        amount: params.amount,
        refundAmount: params.amount, // 实际退款金额，可能因手续费而有差异
        refundType: params.refundType || (params.amount >= paymentOrder.amount ? "full" : "partial"),
        reason: params.reason,
        status: RefundStatus.PENDING,
        requestedBy: params.requestedBy,
      })
      .returning();

    // 向第三方支付平台发起退款
    const config = await this.getPaymentConfig(
      paymentOrder.companyId,
      paymentOrder.provider as PaymentProvider
    );

    let refundData: any = null;
    if (config) {
      refundData = await this.requestProviderRefund(
        paymentOrder.provider as PaymentProvider,
        paymentOrder,
        refundRecord[0],
        config
      );
    }

    return {
      refundRecord: refundRecord[0],
      refundData,
    };
  }

  /**
   * 向第三方支付平台发起退款
   */
  private static async requestProviderRefund(
    provider: PaymentProvider,
    paymentOrder: any,
    refundRecord: any,
    config: PaymentConfigType
  ): Promise<any> {
    // 更新退款状态为处理中
    const db = await getDb();
    await db
      .update(refundRecords)
      .set({ status: RefundStatus.PROCESSING })
      .where(eq(refundRecords.id, refundRecord.id));

    // 实际项目中需要调用第三方支付平台的退款接口
    // 这里返回模拟数据
    return {
      refundNo: refundRecord.refundNo,
      total_amount: (paymentOrder.amount / 100).toFixed(2),
      refund_amount: (refundRecord.amount / 100).toFixed(2),
    };
  }

  /**
   * 处理退款回调
   */
  static async handleRefundCallback(
    provider: PaymentProvider,
    data: any
  ): Promise<{ success: boolean; refundRecord?: any }> {
    const db = await getDb();

    // 验证签名
    const isValid = await this.verifyCallbackSignature(provider, data);
    if (!isValid) {
      return { success: false };
    }

    // 查找退款记录
    const refundNo = this.extractRefundNo(provider, data);
    if (!refundNo) {
      return { success: false };
    }

    const records = await db
      .select()
      .from(refundRecords)
      .where(eq(refundRecords.refundNo, refundNo));

    if (records.length === 0) {
      return { success: false };
    }

    const record = records[0];

    // 检查退款状态
    if (record.status === RefundStatus.SUCCESS) {
      return { success: true, refundRecord: record };
    }

    // 更新退款记录
    const status = this.extractRefundStatus(provider, data);
    const providerRefundId = this.extractProviderRefundId(provider, data);

    const updated = await db
      .update(refundRecords)
      .set({
        status,
        providerRefundId,
        refundedAt: status === RefundStatus.SUCCESS ? new Date() : null,
      })
      .where(eq(refundRecords.id, record.id))
      .returning();

    // 如果退款成功，更新原支付订单状态
    if (status === RefundStatus.SUCCESS) {
      await db
        .update(paymentOrders)
        .set({ status: PaymentStatus.REFUNDED })
        .where(eq(paymentOrders.id, record.paymentOrderId));
    }

    return { success: true, refundRecord: updated[0] };
  }

  /**
   * 从回调数据中提取退款流水号
   */
  private static extractRefundNo(provider: PaymentProvider, data: any): string | null {
    if (provider === PaymentProvider.ALIPAY) {
      return data.out_biz_no || null;
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return data.out_refund_no || null;
    }
    return null;
  }

  /**
   * 从回调数据中提取退款状态
   */
  private static extractRefundStatus(
    provider: PaymentProvider,
    data: any
  ): RefundStatus {
    if (provider === PaymentProvider.ALIPAY) {
      const fundStatus = data.fund_change || "";
      if (fundStatus === "Y") {
        return RefundStatus.SUCCESS;
      } else if (fundStatus === "N") {
        return RefundStatus.FAILED;
      }
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      const refundStatus = data.refund_status || "";
      if (refundStatus === "SUCCESS") {
        return RefundStatus.SUCCESS;
      } else if (refundStatus === "FAILED") {
        return RefundStatus.FAILED;
      }
    }
    return RefundStatus.PROCESSING;
  }

  /**
   * 从回调数据中提取第三方退款ID
   */
  private static extractProviderRefundId(
    provider: PaymentProvider,
    data: any
  ): string | null {
    if (provider === PaymentProvider.ALIPAY) {
      return data.refund_no || null;
    } else if (provider === PaymentProvider.WECHAT_PAY) {
      return data.refund_id || null;
    }
    return null;
  }

  /**
   * 查询退款记录
   */
  static async queryRefundRecord(refundNo: string): Promise<any | null> {
    const db = await getDb();
    const records = await db
      .select()
      .from(refundRecords)
      .where(eq(refundRecords.refundNo, refundNo));

    return records.length > 0 ? records[0] : null;
  }

  /**
   * 生成签名（用于支付和回调验证）
   */
  static generateSign(params: any, secret: string): string {
    // 排序参数
    const sortedKeys = Object.keys(params).sort();

    // 拼接参数
    let signStr = "";
    sortedKeys.forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        signStr += `${key}=${params[key]}&`;
      }
    });

    signStr += `key=${secret}`;

    // MD5加密并转大写
    return createHash("md5").update(signStr, "utf-8").digest("hex").toUpperCase();
  }

  /**
   * 验证签名
   */
  static verifySign(params: any, secret: string, sign: string): boolean {
    const computedSign = this.generateSign(params, secret);
    return computedSign === sign;
  }

  /**
   * 金额格式化：分转元
   */
  static fenToYuan(fen: number): string {
    return (fen / 100).toFixed(2);
  }

  /**
   * 金额格式化：元转分
   */
  static yuanToFen(yuan: number | string): number {
    const yuanNum = typeof yuan === "string" ? parseFloat(yuan) : yuan;
    return Math.round(yuanNum * 100);
  }
}
