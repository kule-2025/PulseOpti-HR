/**
 * 阿里云邮件推送服务提供商
 * 阿里云 DirectMail API
 */

import { EmailProvider, EmailOptions, EmailStats } from '../email-provider';

export interface AliyunConfig {
  accessKeyId: string;
  accessKeySecret: string;
  regionId: string;
  accountName: string; // 发件人邮箱地址
  replyToAddress?: string;
  addressType?: number; // 0: 为随机账号，1: 为发信地址
}

export class AliyunProvider implements EmailProvider {
  name = 'Aliyun DirectMail';
  private config: AliyunConfig;
  private stats: EmailStats = {
    provider: this.name,
    sent: 0,
    failed: 0,
    lastSentAt: null,
  };

  constructor(config: AliyunConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      // 阿里云没有直接测试连接的API，我们通过调用一个简单的请求来测试
      const result = await this.sendEmail({
        to: this.config.accountName,
        subject: '阿里云邮件推送连接测试',
        text: '这是一封测试邮件，用于验证阿里云邮件推送服务配置是否正确。',
      });
      return result;
    } catch (error) {
      console.error('阿里云邮件推送连接测试失败:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // 阿里云 DirectMail API 签名方法
      const endpoint = `https://dm.${this.config.regionId}.aliyuncs.com`;
      const version = '2015-11-23';
      const action = 'SingleSendMail';

      // 准备请求参数
      const params = {
        Action: action,
        Version: version,
        Format: 'JSON',
        AccessKeyId: this.config.accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        SignatureNonce: Math.random().toString(),
        Timestamp: new Date().toISOString(),
        AccountName: this.config.accountName,
        ReplyToAddress: this.config.replyToAddress ? 'true' : 'false',
        AddressType: this.config.addressType?.toString() || '1',
        ToAddress: Array.isArray(options.to) ? options.to.join(',') : options.to,
        FromAlias: 'PulseOpti HR',
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text,
      };

      // 计算签名
      const signature = this.calculateSignature(params, 'POST');
      params.Signature = signature;

      // 发送请求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params as any).toString(),
      });

      const result = await response.json();

      if (result.Code === 'OK') {
        console.log('阿里云邮件发送成功:', result.RequestId);
        this.stats.sent++;
        this.stats.lastSentAt = new Date();
        return true;
      } else {
        console.error('阿里云邮件发送失败:', result.Message);
        this.stats.failed++;
        return false;
      }
    } catch (error) {
      console.error('阿里云邮件发送异常:', error);
      this.stats.failed++;
      return false;
    }
  }

  /**
   * 计算阿里云 API 签名
   */
  private calculateSignature(params: Record<string, string>, method: string): string {
    const crypto = require('crypto');

    // 按字典序排序参数
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // 构造签名字符串
    const stringToSign = `${method.toUpperCase()}&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;

    // HMAC-SHA1 签名
    const signature = crypto
      .createHmac('sha1', `${this.config.accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    return signature;
  }

  getStats(): EmailStats {
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
