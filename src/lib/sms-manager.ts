/**
 * 短信服务管理器
 * 支持多个短信提供商，自动切换，负载均衡
 */

import { SMSProvider, SMSOptions, SMSStats } from './sms-provider';
import { AliyunSMSProvider, AliyunSMSConfig } from './sms-providers/aliyun-sms-provider';
import { TencentSMSProvider, TencentSMSConfig } from './sms-providers/tencent-sms-provider';

export type SMSProviderType = 'aliyun' | 'tencent';

export interface SMSManagerConfig {
  providers: {
    type: SMSProviderType;
    config: AliyunSMSConfig | TencentSMSConfig;
    enabled: boolean;
    priority: number;
  }[];
  fallbackStrategy: 'round-robin' | 'priority' | 'random';
  retryAttempts: number;
}

export class SMSManager {
  private providers: SMSProvider[] = [];
  private fallbackStrategy: SMSManagerConfig['fallbackStrategy'];
  private retryAttempts: number;

  constructor(config: SMSManagerConfig) {
    this.fallbackStrategy = config.fallbackStrategy || 'priority';
    this.retryAttempts = config.retryAttempts || 3;

    // 初始化所有启用的提供商
    config.providers
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority)
      .forEach((p) => {
        this.addProvider(p.type, p.config);
      });
  }

  private addProvider(type: SMSProviderType, config: any) {
    let provider: SMSProvider;

    switch (type) {
      case 'aliyun':
        provider = new AliyunSMSProvider(config as AliyunSMSConfig);
        break;
      case 'tencent':
        provider = new TencentSMSProvider(config as TencentSMSConfig);
        break;
      default:
        throw new Error(`不支持的短信提供商类型: ${type}`);
    }

    this.providers.push(provider);
  }

  /**
   * 发送短信（自动切换提供商）
   */
  async sendSMS(options: SMSOptions): Promise<{ success: boolean; provider?: string; error?: string }> {
    const providerOrder = this.getProviderOrder();

    for (let i = 0; i < providerOrder.length; i++) {
      const provider = providerOrder[i];

      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        const success = await provider.sendSMS(options);

        if (success) {
          return {
            success: true,
            provider: provider.name,
          };
        }

        console.warn(`短信发送失败 (提供商: ${provider.name}, 尝试: ${attempt + 1}/${this.retryAttempts})`);

        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < this.retryAttempts - 1) {
          await this.sleep(1000 * (attempt + 1));
        }
      }

      console.error(`提供商 ${provider.name} 所有尝试都失败，切换到下一个提供商`);
    }

    return {
      success: false,
      error: '所有短信提供商都发送失败',
    };
  }

  /**
   * 发送验证码短信
   */
  async sendVerificationCode(phone: string, code: string, templateCode: string): Promise<boolean> {
    const result = await this.sendSMS({
      phone,
      templateCode,
      templateParams: {
        code,
      },
    });

    return result.success;
  }

  /**
   * 获取提供商顺序
   */
  private getProviderOrder(): SMSProvider[] {
    switch (this.fallbackStrategy) {
      case 'priority':
        return [...this.providers];

      case 'round-robin':
        const shuffled = [...this.providers].sort(() => Math.random() - 0.5);
        return shuffled;

      case 'random':
        return [...this.providers].sort(() => Math.random() - 0.5);

      default:
        return this.providers;
    }
  }

  /**
   * 测试所有提供商的连接
   */
  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const provider of this.providers) {
      results[provider.name] = await provider.testConnection();
    }

    return results;
  }

  /**
   * 获取所有提供商的统计信息
   */
  getAllStats(): SMSStats[] {
    return this.providers.map((provider) => {
      if (provider instanceof AliyunSMSProvider || provider instanceof TencentSMSProvider) {
        return provider.getStats();
      }
      return {
        provider: provider.name,
        sent: 0,
        failed: 0,
        lastSentAt: null,
      };
    });
  }

  /**
   * 睡眠工具函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 创建默认短信管理器
 */
export function createDefaultSMSManager(): SMSManager | null {
  const config: SMSManagerConfig = {
    providers: [],
    fallbackStrategy: 'priority',
    retryAttempts: 3,
  };

  // 添加阿里云提供商（如果配置了）
  if (
    process.env.ALIYUN_ACCESS_KEY_ID &&
    process.env.ALIYUN_ACCESS_KEY_SECRET &&
    process.env.ALIYUN_SMS_SIGN_NAME
  ) {
    config.providers.push({
      type: 'aliyun',
      config: {
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        regionId: process.env.ALIYUN_SMS_REGION_ID || 'cn-hangzhou',
        signName: process.env.ALIYUN_SMS_SIGN_NAME,
      },
      enabled: true,
      priority: 1,
    });
  }

  // 添加腾讯云提供商（如果配置了）
  if (
    process.env.TENCENT_SECRET_ID &&
    process.env.TENCENT_SECRET_KEY &&
    process.env.TENCENT_SMS_APP_ID &&
    process.env.TENCENT_SMS_SIGN_NAME
  ) {
    config.providers.push({
      type: 'tencent',
      config: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
        appId: process.env.TENCENT_SMS_APP_ID,
        signName: process.env.TENCENT_SMS_SIGN_NAME,
        region: process.env.TENCENT_SMS_REGION || 'ap-guangzhou',
      },
      enabled: true,
      priority: 2,
    });
  }

  // 如果没有配置任何提供商，返回 null
  if (config.providers.length === 0) {
    console.warn('未配置任何短信提供商');
    return null;
  }

  return new SMSManager(config);
}

// 导出单例
let smsManagerInstance: SMSManager | null = null;

export function getSMSManager(): SMSManager | null {
  if (!smsManagerInstance) {
    smsManagerInstance = createDefaultSMSManager();
  }
  return smsManagerInstance;
}
