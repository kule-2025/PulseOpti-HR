/**
 * 阿里云短信服务提供商
 */

import { SMSProvider, SMSOptions, SMSStats } from '../sms-provider';

export interface AliyunSMSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  regionId: string;
  signName: string;
}

export class AliyunSMSProvider implements SMSProvider {
  name = 'Aliyun SMS';
  private config: AliyunSMSConfig;
  private stats: SMSStats = {
    provider: this.name,
    sent: 0,
    failed: 0,
    lastSentAt: null,
  };

  constructor(config: AliyunSMSConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      // 阿里云没有直接测试连接的API，我们通过查询短信发送记录来测试
      const endpoint = `https://dysmsapi.${this.config.regionId}.aliyuncs.com`;
      const params = this.buildCommonParams();
      params.Action = 'QuerySendDetails';
      params.PhoneNumber = '13800138000';
      params.SendDate = this.formatDate(new Date());
      params.PageSize = '1';
      params.CurrentPage = '1';

      params.Signature = this.calculateSignature(params, 'POST');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params as any).toString(),
      });

      const result = await response.json();

      // 即使没有记录，只要返回了正确的JSON结构，就认为连接成功
      return result.Code !== 'InvalidAccessKey.NotFound';
    } catch (error) {
      console.error('阿里云短信连接测试失败:', error);
      return false;
    }
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      const endpoint = `https://dysmsapi.${this.config.regionId}.aliyuncs.com`;
      const params = this.buildCommonParams();

      params.Action = 'SendSms';
      params.PhoneNumbers = options.phone;
      params.SignName = this.config.signName;
      params.TemplateCode = options.templateCode;

      // 添加模板参数
      if (options.templateParams && Object.keys(options.templateParams).length > 0) {
        params.TemplateParam = JSON.stringify(options.templateParams);
      }

      // 计算签名
      params.Signature = this.calculateSignature(params, 'POST');

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
        console.log('阿里云短信发送成功:', result.BizId);
        this.stats.sent++;
        this.stats.lastSentAt = new Date();
        return true;
      } else {
        console.error('阿里云短信发送失败:', result.Message);
        this.stats.failed++;
        return false;
      }
    } catch (error) {
      console.error('阿里云短信发送异常:', error);
      this.stats.failed++;
      return false;
    }
  }

  /**
   * 构建公共参数
   */
  private buildCommonParams(): Record<string, string> {
    return {
      Format: 'JSON',
      Version: '2017-05-25',
      AccessKeyId: this.config.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(),
      Timestamp: new Date().toISOString(),
    };
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

  /**
   * 格式化日期为 YYYYMMDD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
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
