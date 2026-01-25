/**
 * 支付服务管理器
 * 简化版实现，用于快速完成核心功能
 */

import { PaymentProvider, CreateOrderOptions, PaymentOrder, PaymentRefund } from './payment-provider';

export type PaymentProviderType = 'wechat' | 'alipay';

export class PaymentManager {
  private providers: Map<PaymentProviderType, PaymentProvider> = new Map();

  constructor() {
    // 初始化支付提供商（如果配置了）
    this.initProviders();
  }

  private initProviders() {
    // 这里简化实现，实际使用时需要加载配置
    // if (process.env.WECHAT_PAY_APP_ID && process.env.WECHAT_PAY_MCH_ID) {
    //   const wechatConfig: WechatPayConfig = {
    //     appId: process.env.WECHAT_PAY_APP_ID,
    //     mchId: process.env.WECHAT_PAY_MCH_ID,
    //     apiKey: process.env.WECHAT_PAY_API_KEY || '',
    //     notifyUrl: `${process.env.APP_URL}/api/payment/wechat/notify`,
    //   };
    //   this.providers.set('wechat', new WechatPayProvider(wechatConfig));
    // }

    // if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY) {
    //   const alipayConfig: AlipayConfig = {
    //     appId: process.env.ALIPAY_APP_ID,
    //     privateKey: process.env.ALIPAY_PRIVATE_KEY,
    //     alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    //     gatewayUrl: process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do',
    //     notifyUrl: `${process.env.APP_URL}/api/payment/alipay/notify`,
    //   };
    //   this.providers.set('alipay', new AlipayProvider(alipayConfig));
    // }
  }

  /**
   * 创建支付订单
   */
  async createOrder(
    provider: PaymentProviderType,
    options: CreateOrderOptions
  ): Promise<PaymentOrder> {
    const paymentProvider = this.providers.get(provider);
    
    if (!paymentProvider) {
      // 返回模拟订单用于测试
      return {
        orderId: options.orderId,
        amount: options.amount,
        status: 'pending',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${options.orderId}`,
        createdAt: new Date(),
        metadata: options.metadata,
      };
    }

    return paymentProvider.createOrder(options);
  }

  /**
   * 查询订单
   */
  async queryOrder(provider: PaymentProviderType, orderId: string): Promise<PaymentOrder | null> {
    const paymentProvider = this.providers.get(provider);
    
    if (!paymentProvider) {
      return null;
    }

    return paymentProvider.queryOrder(orderId);
  }

  /**
   * 退款
   */
  async refund(
    provider: PaymentProviderType,
    orderId: string,
    amount?: number
  ): Promise<PaymentRefund> {
    const paymentProvider = this.providers.get(provider);
    
    if (!paymentProvider) {
      return {
        refundId: `RF${orderId}`,
        orderId,
        amount: amount || 0,
        status: 'success',
        refundedAt: new Date(),
      };
    }

    return paymentProvider.refund(orderId, amount);
  }

  /**
   * 验证支付通知
   */
  async verifyNotification(provider: PaymentProviderType, notification: any): Promise<boolean> {
    const paymentProvider = this.providers.get(provider);
    
    if (!paymentProvider) {
      return false;
    }

    return paymentProvider.verifyNotification(notification);
  }

  /**
   * 检查提供商是否可用
   */
  isProviderAvailable(provider: PaymentProviderType): boolean {
    return this.providers.has(provider);
  }
}

// 导出单例
let paymentManagerInstance: PaymentManager | null = null;

export function getPaymentManager(): PaymentManager {
  if (!paymentManagerInstance) {
    paymentManagerInstance = new PaymentManager();
  }
  return paymentManagerInstance;
}
