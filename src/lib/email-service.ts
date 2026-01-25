/**
 * 邮件通知服务
 * 支持通过SMTP和阿里云邮件推送发送邮件通知
 * 使用邮件管理器实现自动切换和负载均衡
 */

import { getEmailManager } from './email-manager';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * 邮件服务类
 * 使用单例模式的邮件管理器
 */
class EmailService {
  constructor() {
    // 邮件管理器会自动从环境变量初始化
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const emailManager = getEmailManager();

    if (!emailManager) {
      console.error('邮件服务未配置，无法发送邮件');
      return false;
    }

    const result = await emailManager.sendEmail(options);

    if (!result.success) {
      console.error('邮件发送失败:', result.error);
    }

    return result.success;
  }

  /**
   * 发送告警邮件
   */
  async sendAlertEmail(options: {
    to: string | string[];
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    const severityColors = {
      low: '#3b82f6',
      medium: '#eab308',
      high: '#f97316',
      critical: '#ef4444',
    };

    const severityLabels = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '严重',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: ${severityColors[options.severity]};
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .severity-badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            margin-top: 8px;
            font-size: 12px;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .alert-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 16px;
          }
          .alert-message {
            background-color: white;
            padding: 16px;
            border-left: 4px solid ${severityColors[options.severity]};
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .metadata {
            background-color: white;
            padding: 16px;
            border-radius: 4px;
            font-size: 14px;
            color: #6b7280;
          }
          .metadata-item {
            display: flex;
            margin-bottom: 8px;
          }
          .metadata-label {
            font-weight: bold;
            min-width: 120px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 系统告警通知</h1>
          <span class="severity-badge">${severityLabels[options.severity]}级告警</span>
        </div>
        <div class="content">
          <div class="alert-title">${options.title}</div>
          <div class="alert-message">
            ${options.message}
          </div>
          ${options.metadata && Object.keys(options.metadata).length > 0 ? `
            <div class="metadata">
              <h3>详细信息</h3>
              ${Object.entries(options.metadata).map(([key, value]) => `
                <div class="metadata-item">
                  <div class="metadata-label">${key}:</div>
                  <div class="metadata-value">${String(value)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <div class="footer">
            <p>此邮件由 PulseOpti HR 系统自动发送，请勿回复</p>
            <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: options.to,
      subject: `[告警] ${options.title}`,
      html,
    });
  }

  /**
   * 发送通知邮件
   */
  async sendNotificationEmail(options: {
    to: string | string[];
    title: string;
    content: string;
    actionUrl?: string;
    actionLabel?: string;
  }): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .notification-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .notification-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
          }
          .action-button:hover {
            opacity: 0.9;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📬 通知</h1>
        </div>
        <div class="content">
          <div class="notification-title">${options.title}</div>
          <div class="notification-content">
            ${options.content}
          </div>
          ${options.actionUrl ? `
            <div style="text-align: center;">
              <a href="${options.actionUrl}" class="action-button">${options.actionLabel || '查看详情'}</a>
            </div>
          ` : ''}
          <div class="footer">
            <p>此邮件由 PulseOpti HR 系统发送</p>
            <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: options.to,
      subject: `[通知] ${options.title}`,
      html,
    });
  }

  /**
   * 测试邮件服务连接
   */
  async testConnection(): Promise<{ available: boolean; providers: Record<string, boolean> }> {
    const emailManager = getEmailManager();

    if (!emailManager) {
      return {
        available: false,
        providers: {},
      };
    }

    const connections = await emailManager.testAllConnections();

    return {
      available: Object.values(connections).some((v) => v),
      providers: connections,
    };
  }

  /**
   * 获取邮件服务统计信息
   */
  getStats() {
    const emailManager = getEmailManager();

    if (!emailManager) {
      return null;
    }

    return emailManager.getAllStats();
  }
}

// 导出单例
export const emailService = new EmailService();
