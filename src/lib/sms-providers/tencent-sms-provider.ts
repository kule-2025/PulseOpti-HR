/**
 * 腾讯云短信服务提供商
 */

import { SMSProvider, SMSOptions, SMSStats } from '../sms-provider';

export interface TencentSMSConfig {
  secretId: string;
  secretKey: string;
  appId: string;
  signName: string;
  region?: string;
}

export class TencentSMSProvider implements SMSProvider {
  name = 'Tencent SMS';
  private config: TencentSMSConfig;
  private stats: SMSStats = {
    provider: this.name,
    sent: 0,
    failed: 0,
    lastSentAt: null,
  };

  constructor(config: TencentSMSConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      // 腾讯云没有直接测试连接的API，我们通过查询短信发送状态来测试
      const endpoint = 'https://sms.tencentcloudapi.com';
      const payload = {
        Action: 'PullSmsSendStatus',
        Version: '2021-01-11',
        Region: this.config.region || 'ap-guangzhou',
        Limit: 1,
      };

      const response = await this.sendRequest(endpoint, payload);
      const result = await response.json();

      // 即使没有记录，只要返回了正确的JSON结构，就认为连接成功
      return result.Response !== undefined;
    } catch (error) {
      console.error('腾讯云短信连接测试失败:', error);
      return false;
    }
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      const endpoint = 'https://sms.tencentcloudapi.com';
      const payload: Record<string, any> = {
        Action: 'SendSms',
        Version: '2021-01-11',
        Region: this.config.region || 'ap-guangzhou',
        PhoneNumberSet: [`+86${options.phone}`],
        TemplateId: options.templateCode,
        TemplateParamSet: options.templateParams ? Object.values(options.templateParams) : [],
      };

      const response = await this.sendRequest(endpoint, payload);
      const result = await response.json();

      if (result.Response.Error) {
        console.error('腾讯云短信发送失败:', result.Response.Error.Message);
        this.stats.failed++;
        return false;
      }

      console.log('腾讯云短信发送成功:', result.Response.SendStatusSet);
      this.stats.sent++;
      this.stats.lastSentAt = new Date();
      return true;
    } catch (error) {
      console.error('腾讯云短信发送异常:', error);
      this.stats.failed++;
      return false;
    }
  }

  /**
   * 计算腾讯云 API 签名
   */
  private calculateSignature(params: Record<string, string>, method: string, endpoint: string): string {
    const crypto = require('crypto');

    // 按字典序排序参数
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // 构造签名字符串
    const stringToSign = `${method.toUpperCase()}${endpoint}/?${sortedParams}`;

    // HMAC-SHA1 签名
    const signature = crypto
      .createHmac('sha1', this.config.secretKey)
      .update(stringToSign)
      .digest('base64');

    return signature;
  }

  /**
   * 发送腾讯云 API 请求
   */
  private async sendRequest(endpoint: string, payload: Record<string, any>): Promise<Response> {
    const crypto = require('crypto');

    // 生成时间戳和随机字符串
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(2, 16);

    // 准备请求参数
    const params: Record<string, string> = {
      ...payload as Record<string, string>,
      Timestamp: timestamp.toString(),
      Nonce: nonce,
      SecretId: this.config.secretId,
    };

    // 计算签名
    const signature = this.calculateSignature(params, 'POST', endpoint);
    params.Signature = signature;

    // 发送请求
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-TC-Action': payload.Action,
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Region': this.config.region || 'ap-guangzhou',
        'X-TC-Version': payload.Version,
      },
      body: new URLSearchParams(params).toString(),
    });
  }

  getStats(): SMSStats {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      provider: this.name,
      sent: 0,
      failed: 0,
      lastSentAt: null,
    };
  }
}
