/**
 * 短信服务提供商接口
 */

export interface SMSProvider {
  name: string;
  sendSMS(options: SMSOptions): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface SMSOptions {
  phone: string;
  templateCode: string;
  templateParams?: Record<string, string>;
}

export interface SMSStats {
  provider: string;
  sent: number;
  failed: number;
  lastSentAt: Date | null;
}
