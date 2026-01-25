/**
 * SMTP 邮件服务提供商
 */

import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions, EmailStats } from '../email-provider';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

export class SMTPProvider implements EmailProvider {
  name = 'SMTP';
  private transporter: nodemailer.Transporter | null = null;
  private config: SMTPConfig;
  private stats: EmailStats = {
    provider: this.name,
    sent: 0,
    failed: 0,
    lastSentAt: null,
  };

  constructor(config: SMTPConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      // 验证配置
      this.transporter.verify((error) => {
        if (error) {
          console.error('SMTP配置验证失败:', error);
        } else {
          console.log('SMTP配置验证成功');
        }
      });
    } catch (error) {
      console.error('SMTP初始化失败:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP连接测试失败:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('SMTP传输器未初始化');
      this.stats.failed++;
      return false;
    }

    try {
      const mailOptions = {
        from: this.config.from,
        replyTo: this.config.replyTo || this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('SMTP邮件发送成功:', info.messageId);
      
      this.stats.sent++;
      this.stats.lastSentAt = new Date();
      
      return true;
    } catch (error) {
      console.error('SMTP邮件发送失败:', error);
      this.stats.failed++;
      return false;
    }
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
