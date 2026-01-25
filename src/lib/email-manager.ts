/**
 * 邮件服务管理器
 * 支持多个邮件提供商，自动切换，负载均衡
 */

import { EmailProvider, EmailOptions, EmailStats } from './email-provider';
import { SMTPProvider, SMTPConfig } from './email-providers/smtp-provider';
import { AliyunProvider, AliyunConfig } from './email-providers/aliyun-provider';

export type EmailProviderType = 'smtp' | 'aliyun';

export interface EmailManagerConfig {
  providers: {
    type: EmailProviderType;
    config: SMTPConfig | AliyunConfig;
    enabled: boolean;
    priority: number;
  }[];
  fallbackStrategy: 'round-robin' | 'priority' | 'random';
  retryAttempts: number;
}

export class EmailManager {
  private providers: EmailProvider[] = [];
  private fallbackStrategy: EmailManagerConfig['fallbackStrategy'];
  private retryAttempts: number;

  constructor(config: EmailManagerConfig) {
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

  private addProvider(type: EmailProviderType, config: any) {
    let provider: EmailProvider;

    switch (type) {
      case 'smtp':
        provider = new SMTPProvider(config as SMTPConfig);
        break;
      case 'aliyun':
        provider = new AliyunProvider(config as AliyunConfig);
        break;
      default:
        throw new Error(`不支持的邮件提供商类型: ${type}`);
    }

    this.providers.push(provider);
  }

  /**
   * 发送邮件（自动切换提供商）
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; provider?: string; error?: string }> {
    const providerOrder = this.getProviderOrder();

    for (let i = 0; i < providerOrder.length; i++) {
      const provider = providerOrder[i];

      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        const success = await provider.sendEmail(options);

        if (success) {
          return {
            success: true,
            provider: provider.name,
          };
        }

        console.warn(`邮件发送失败 (提供商: ${provider.name}, 尝试: ${attempt + 1}/${this.retryAttempts})`);

        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < this.retryAttempts - 1) {
          await this.sleep(1000 * (attempt + 1));
        }
      }

      console.error(`提供商 ${provider.name} 所有尝试都失败，切换到下一个提供商`);
    }

    return {
      success: false,
      error: '所有邮件提供商都发送失败',
    };
  }

  /**
   * 获取提供商顺序
   */
  private getProviderOrder(): EmailProvider[] {
    switch (this.fallbackStrategy) {
      case 'priority':
        return [...this.providers];

      case 'round-robin':
        // 简单的轮询实现（实际应用中应该维护一个索引）
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
  getAllStats(): EmailStats[] {
    return this.providers.map((provider) => {
      if (provider instanceof SMTPProvider || provider instanceof AliyunProvider) {
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
 * 创建默认邮件管理器
 */
export function createDefaultEmailManager(): EmailManager | null {
  const config: EmailManagerConfig = {
    providers: [],
    fallbackStrategy: 'priority',
    retryAttempts: 3,
  };

  // 添加 SMTP 提供商（如果配置了）
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    config.providers.push({
      type: 'smtp',
      config: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        from: process.env.SMTP_FROM || 'noreply@pulseoptihr.com',
      },
      enabled: true,
      priority: 1,
    });
  }

  // 添加阿里云提供商（如果配置了）
  if (
    process.env.ALIYUN_ACCESS_KEY_ID &&
    process.env.ALIYUN_ACCESS_KEY_SECRET &&
    process.env.ALIYUN_DM_ACCOUNT_NAME
  ) {
    config.providers.push({
      type: 'aliyun',
      config: {
        accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        regionId: process.env.ALIYUN_DM_REGION_ID || 'cn-hangzhou',
        accountName: process.env.ALIYUN_DM_ACCOUNT_NAME,
        replyToAddress: process.env.ALIYUN_DM_REPLY_TO_ADDRESS,
        addressType: process.env.ALIYUN_DM_ADDRESS_TYPE ? parseInt(process.env.ALIYUN_DM_ADDRESS_TYPE) : 1,
      },
      enabled: true,
      priority: 2,
    });
  }

  // 如果没有配置任何提供商，返回 null
  if (config.providers.length === 0) {
    console.warn('未配置任何邮件提供商');
    return null;
  }

  return new EmailManager(config);
}

// 导出单例
let emailManagerInstance: EmailManager | null = null;

export function getEmailManager(): EmailManager | null {
  if (!emailManagerInstance) {
    emailManagerInstance = createDefaultEmailManager();
  }
  return emailManagerInstance;
}
