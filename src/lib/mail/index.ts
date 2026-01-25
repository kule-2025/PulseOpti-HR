/**
 * 邮件服务工具
 * 支持多种邮件服务商（163、QQ、Gmail等）
 */

import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * 创建邮件传输器
 */
function createTransporter() {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';

  if (provider === 'smtp') {
    // 使用SMTP配置（支持163、QQ、Gmail等）
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;

    // 检查配置是否完整
    if (!host || !user || !password) {
      console.warn('[EMAIL] SMTP配置不完整，跳过邮件发送');
      console.warn('[EMAIL] 需要配置: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
      return null;
    }

    try {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass: password,
        },
        // 163邮箱需要额外的配置
        ...(host.includes('163.com') && {
          tls: {
            rejectUnauthorized: false,
          },
        }),
      });
    } catch (error) {
      console.error('[EMAIL] 创建邮件传输器失败:', error);
      return null;
    }
  }

  // 可以扩展其他邮件服务商（阿里云、腾讯云等）
  console.warn(`[EMAIL] 不支持的邮件服务商: ${provider}`);
  return null;
}

/**
 * 发送邮件
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // 如果传输器创建失败，返回false
    if (!transporter) {
      console.warn('[EMAIL] 邮件传输器未创建，跳过发送');
      return false;
    }

    const fromName = process.env.SMTP_NAME || 'PulseOpti HR';
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    const mailOptions = {
      from: `${fromName} <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] 邮件发送成功:', info.messageId);
    return true;
  } catch (error) {
    console.error('[EMAIL] 邮件发送失败:', error);
    return false;
  }
}

/**
 * 发送验证码邮件
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  purpose: 'login' | 'register' | 'reset'
): Promise<boolean> {
  const purposeText = {
    login: '登录',
    register: '注册',
    reset: '重置密码',
  }[purpose];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB, #7C3AED); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .code { font-size: 32px; font-weight: bold; color: #2563EB; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PulseOpti HR 脉策聚效</h1>
        </div>
        <div class="content">
          <p>您好！</p>
          <p>您正在进行<strong>${purposeText}</strong>操作，验证码如下：</p>
          <div class="code">${code}</div>
          <p>验证码有效期为<strong>5分钟</strong>，请尽快使用。</p>
          <p>如非本人操作，请忽略此邮件。</p>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>© 2024 PulseOpti HR 脉策聚效 | 广州市天河区</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    PulseOpti HR 脉策聚效

    您好！

    您正在进行${purposeText}操作，验证码如下：

    ${code}

    验证码有效期为5分钟，请尽快使用。

    如非本人操作，请忽略此邮件。

    此邮件由系统自动发送，请勿回复
    © 2024 PulseOpti HR 脉策聚效 | 广州市天河区
  `;

  return sendEmail({
    to: email,
    subject: `PulseOpti HR - ${purposeText}验证码`,
    text,
    html,
  });
}
