/**
 * 邮件服务提供商接口
 */

export interface EmailProvider {
  name: string;
  sendEmail(options: EmailOptions): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailStats {
  provider: string;
  sent: number;
  failed: number;
  lastSentAt: Date | null;
}
