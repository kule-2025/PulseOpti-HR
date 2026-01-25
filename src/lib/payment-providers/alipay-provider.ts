/**
 * 支付宝支付服务提供商
 */

import { PaymentProvider, CreateOrderOptions, PaymentOrder, PaymentRefund } from '../payment-provider';

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gatewayUrl: string;
  notifyUrl: string;
}

export class AlipayProvider implements PaymentProvider {
  name = 'Alipay';
  private config: AlipayConfig;

  constructor(config: AlipayConfig) {
    this.config = config;
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    try {
      // 构建请求参数
      const bizContent = {
        out_trade_no: options.orderId,
        total_amount: options.amount.toFixed(2),
        subject: options.subject,
        body: options.description || options.subject,
      };

      const params = {
        app_id: this.config.appId,
        method: 'alipay.trade.precreate',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        version: '1.0',
        notify_url: this.config.notifyUrl,
        biz_content: JSON.stringify(bizContent),
      };

      // 签名
      const sign = this.calculateSignature(params);

      // 发送请求
      const response = await fetch(this.config.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign,
        } as any).toString(),
      });

      const result = await response.json();
      const data = JSON.parse(result.alipay_trade_precreate_response);

      if (data.code === '10000' && data.qr_code) {
        return {
          orderId: options.orderId,
          amount: options.amount,
          status: 'pending',
          qrCode: data.qr_code,
          paymentUrl: data.qr_code,
          createdAt: new Date(),
          metadata: options.metadata,
        };
      } else {
        throw new Error(data.sub_msg || '创建订单失败');
      }
    } catch (error) {
      console.error('支付宝创建订单失败:', error);
      throw error;
    }
  }

  async queryOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      const bizContent = {
        out_trade_no: orderId,
      };

      const params = {
        app_id: this.config.appId,
        method: 'alipay.trade.query',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        version: '1.0',
        biz_content: JSON.stringify(bizContent),
      };

      const sign = this.calculateSignature(params);

      const response = await fetch(this.config.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign,
        } as any).toString(),
      });

      const result = await response.json();
      const data = JSON.parse(result.alipay_trade_query_response);

      if (data.code === '10000') {
        if (data.trade_status === 'TRADE_SUCCESS' || data.trade_status === 'TRADE_FINISHED') {
          return {
            orderId: data.out_trade_no,
            amount: parseFloat(data.total_amount),
            status: 'paid',
            transactionId: data.trade_no,
            paidAt: new Date(data.send_pay_date),
            createdAt: new Date(),
          };
        } else if (data.trade_status === 'WAIT_BUYER_PAY') {
          return {
            orderId: data.out_trade_no,
            amount: parseFloat(data.total_amount),
            status: 'pending',
            createdAt: new Date(),
          };
        }
      }

      return null;
    } catch (error) {
      console.error('支付宝查询订单失败:', error);
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

      const refundId = `RF${orderId}${Date.now()}`;

      const bizContent = {
        out_trade_no: orderId,
        trade_no: order.transactionId,
        refund_amount: amount ? amount.toFixed(2) : order.amount.toFixed(2),
        refund_reason: '用户退款',
        out_request_no: refundId,
      };

      const params = {
        app_id: this.config.appId,
        method: 'alipay.trade.refund',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        version: '1.0',
        biz_content: JSON.stringify(bizContent),
      };

      const sign = this.calculateSignature(params);

      const response = await fetch(this.config.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign,
        } as any).toString(),
      });

      const result = await response.json();
      const data = JSON.parse(result.alipay_trade_refund_response);

      if (data.code === '10000' && (data.fund_change === 'Y' || data.fund_change === 'N')) {
        return {
          refundId,
          orderId,
          amount: parseFloat(data.refund_amount),
          status: 'success',
          refundedAt: new Date(),
        };
      } else {
        throw new Error(data.sub_msg || '退款失败');
      }
    } catch (error) {
      console.error('支付宝退款失败:', error);
      throw error;
    }
  }

  async verifyNotification(notification: any): Promise<boolean> {
    try {
      const crypto = require('crypto');

      const params = notification.body;
      const sign = params.sign;

      // 构造签名字符串
      const signString = Object.keys(params)
        .filter((key) => key !== 'sign' && key !== 'sign_type')
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

      // 使用支付宝公钥验证签名
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(signString);
      const isValid = verify.verify(this.config.alipayPublicKey, sign, 'base64');

      return isValid;
    } catch (error) {
      console.error('支付宝通知验证失败:', error);
      return false;
    }
  }

  /**
   * 计算签名
   */
  private calculateSignature(params: Record<string, string>): string {
    const crypto = require('crypto');

    // 签名字符串构造
    const signString = Object.keys(params)
      .filter((key) => key !== 'sign')
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // RSA2签名
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signString)
      .sign(this.config.privateKey, 'base64');

    return signature;
  }
}
