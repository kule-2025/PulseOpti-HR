/**
 * 微信支付服务提供商（微信支付 V3 API）
 */

import { PaymentProvider, CreateOrderOptions, PaymentOrder, PaymentRefund } from '../payment-provider';

export interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  certPath?: string;
  keyPath?: string;
  notifyUrl: string;
}

export class WechatPayProvider implements PaymentProvider {
  name = 'WeChat Pay';
  private config: WechatPayConfig;

  constructor(config: WechatPayConfig) {
    this.config = config;
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    try {
      // 调用微信支付统一下单接口（Native支付）
      const endpoint = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';

      const payload = {
        mchid: this.config.mchId,
        out_trade_no: options.orderId,
        appid: this.config.appId,
        description: options.subject,
        notify_url: this.config.notifyUrl,
        amount: {
          total: Math.round(options.amount * 100), // 转换为分
          currency: 'CNY',
        },
        scene_info: {
          payer_client_ip: '127.0.0.1',
        },
      };

      // 签名
      const signature = this.calculateSignature('POST', endpoint, payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `WECHATPAY2-SHA256-RSA2048 ${signature}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.code_url) {
        return {
          orderId: options.orderId,
          amount: options.amount,
          status: 'pending',
          qrCode: result.code_url,
          paymentUrl: result.code_url,
          createdAt: new Date(),
          metadata: options.metadata,
        };
      } else {
        throw new Error(result.message || '创建订单失败');
      }
    } catch (error) {
      console.error('微信支付创建订单失败:', error);
      throw error;
    }
  }

  async queryOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      const endpoint = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${orderId}`;

      const signature = this.calculateSignature('GET', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `WECHATPAY2-SHA256-RSA2048 ${signature}`,
        },
      });

      const result = await response.json();

      if (result.trade_state === 'SUCCESS') {
        return {
          orderId: result.out_trade_no,
          amount: result.amount.total / 100,
          status: 'paid',
          transactionId: result.transaction_id,
          paidAt: new Date(result.success_time),
          createdAt: new Date(result.time_end),
        };
      } else if (result.trade_state === 'NOTPAY') {
        return {
          orderId: result.out_trade_no,
          amount: result.amount.total / 100,
          status: 'pending',
          createdAt: new Date(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('微信支付查询订单失败:', error);
      return null;
    }
  }

  async refund(orderId: string, amount?: number): Promise<PaymentRefund> {
    try {
      // 首先查询订单获取交易ID
      const order = await this.queryOrder(orderId);
      if (!order || !order.transactionId) {
        throw new Error('订单不存在或未支付');
      }

      const endpoint = 'https://api.mch.weixin.qq.com/v3/refund/domestic/refunds';
      const refundId = `RF${orderId}${Date.now()}`;

      const payload = {
        out_trade_no: orderId,
        out_refund_no: refundId,
        transaction_id: order.transactionId,
        amount: {
          refund: amount ? Math.round(amount * 100) : Math.round(order.amount * 100),
          total: Math.round(order.amount * 100),
          currency: 'CNY',
        },
      };

      const signature = this.calculateSignature('POST', endpoint, payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `WECHATPAY2-SHA256-RSA2048 ${signature}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'SUCCESS') {
        return {
          refundId,
          orderId,
          amount: result.amount.refund / 100,
          status: 'success',
          refundedAt: new Date(result.success_time),
        };
      } else {
        throw new Error(result.message || '退款失败');
      }
    } catch (error) {
      console.error('微信支付退款失败:', error);
      throw error;
    }
  }

  async verifyNotification(notification: any): Promise<boolean> {
    try {
      // 验证微信支付回调签名
      // 实际实现需要使用微信支付公钥验证签名
      const crypto = require('crypto');

      const signature = notification.headers['wechatpay-signature'];
      const timestamp = notification.headers['wechatpay-timestamp'];
      const nonce = notification.headers['wechatpay-nonce'];
      const body = notification.body;

      // 构造签名原文
      const message = `${timestamp}\n${nonce}\n${body}\n`;

      // 验证签名（需要加载微信支付公钥）
      // 这里简化处理，实际需要加载证书公钥
      const publicKey = this.loadPublicKey();
      const verify = crypto.createVerify('SHA256');
      verify.update(message);
      const isValid = verify.verify(publicKey, signature, 'base64');

      return isValid;
    } catch (error) {
      console.error('微信支付通知验证失败:', error);
      return false;
    }
  }

  /**
   * 计算签名
   */
  private calculateSignature(method: string, url: string, body?: any): string {
    const crypto = require('crypto');

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(2, 16);

    let message = `${method}\n${url}\n`;
    if (body) {
      message += JSON.stringify(body);
    }
    message += `\n${timestamp}\n${nonce}\n`;

    // 使用API私钥签名
    const privateKey = this.loadPrivateKey();
    const signature = crypto
      .createSign('SHA256')
      .update(message)
      .sign(privateKey, 'base64');

    return `mchid="${this.config.mchId}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="",signature="${signature}"`;
  }

  private loadPrivateKey(): string {
    // 实际实现需要从证书文件加载私钥
    // 这里返回空字符串，实际使用时需要加载证书
    return '';
  }

  private loadPublicKey(): string {
    // 实际实现需要从微信支付平台下载公钥
    // 这里返回空字符串，实际使用时需要加载公钥
    return '';
  }
}
