/**
 * 短信服务
 * 提供便捷的短信发送API
 */

import { getSMSManager } from './sms-manager';

export class SMSService {
  /**
   * 发送验证码短信
   */
  async sendVerificationCode(phone: string, code: string, templateCode: string): Promise<boolean> {
    const smsManager = getSMSManager();

    if (!smsManager) {
      console.error('短信服务未配置，无法发送短信');
      return false;
    }

    const result = await smsManager.sendSMS({
      phone,
      templateCode,
      templateParams: { code },
    });

    return result.success;
  }

  /**
   * 发送通知短信
   */
  async sendNotificationSMS(
    phone: string,
    message: string,
    templateCode: string
  ): Promise<boolean> {
    const smsManager = getSMSManager();

    if (!smsManager) {
      console.error('短信服务未配置，无法发送短信');
      return false;
    }

    const result = await smsManager.sendSMS({
      phone,
      templateCode,
      templateParams: { message },
    });

    return result.success;
  }

  /**
   * 发送通用短信
   */
  async sendSMS(
    phone: string,
    templateCode: string,
    params?: Record<string, string>
  ): Promise<boolean> {
    const smsManager = getSMSManager();

    if (!smsManager) {
      console.error('短信服务未配置，无法发送短信');
      return false;
    }

    const result = await smsManager.sendSMS({
      phone,
      templateCode,
      templateParams: params,
    });

    return result.success;
  }

  /**
   * 测试短信服务连接
   */
  async testConnection(): Promise<{ available: boolean; providers: Record<string, boolean> }> {
    const smsManager = getSMSManager();

    if (!smsManager) {
      return {
        available: false,
        providers: {},
      };
    }

    const connections = await smsManager.testAllConnections();

    return {
      available: Object.values(connections).some((v) => v),
      providers: connections,
    };
  }

  /**
   * 获取短信服务统计信息
   */
  getStats() {
    const smsManager = getSMSManager();

    if (!smsManager) {
      return null;
    }

    return smsManager.getAllStats();
  }
}

// 导出单例
export const smsService = new SMSService();
