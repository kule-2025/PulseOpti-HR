import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { smtpConfigs, emailTemplates, emailLogs } from '@/storage/database/shared/schema';
import { eq, and, desc, gt, sql } from 'drizzle-orm';
import { verifyJWT } from '@/lib/auth/jwt';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';

// 验证JWT
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  try {
    const payload = verifyJWT(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// 发送邮件Schema
const sendEmailSchema = z.object({
  toAddress: z.string().email('收件人地址格式不正确'),
  toName: z.string().max(100).optional(),
  ccAddresses: z.array(z.string().email()).optional(),
  bccAddresses: z.array(z.string().email()).optional(),
  subject: z.string().min(1, '邮件主题不能为空').max(500, '邮件主题不能超过500个字符'),
  htmlContent: z.string().min(1, 'HTML内容不能为空'),
  textContent: z.string().optional(),
  templateId: z.string().optional(),
  configId: z.string().optional(),
  variables: z.map(z.string(), z.string()).optional(),
});

// POST - 发送邮件
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = sendEmailSchema.parse(body);

    const db = await getDb();

    // 获取SMTP配置
    let config;
    if (validated.configId) {
      config = await db
        .select()
        .from(smtpConfigs)
        .where(
          and(
            eq(smtpConfigs.id, validated.configId),
            eq(smtpConfigs.isActive, true)
          )
        )
        .limit(1);
    } else {
      // 使用默认配置
      config = await db
        .select()
        .from(smtpConfigs)
        .where(
          and(
            eq(smtpConfigs.companyId, payload.companyId || ''),
            eq(smtpConfigs.isDefault, true),
            eq(smtpConfigs.isActive, true)
          )
        )
        .limit(1);
    }

    if (config.length === 0) {
      return NextResponse.json(
        { error: '未找到可用的SMTP配置' },
        { status: 400 }
      );
    }

    const smtpConfig = config[0];

    // 检查频率限制
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourCount = await db
      .select({ count: sql`count(*)` })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.configId, smtpConfig.id),
          gt(emailLogs.createdAt, hourAgo)
        )
      );

    const dayCount = await db
      .select({ count: sql`count(*)` })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.configId, smtpConfig.id),
          gt(emailLogs.createdAt, dayAgo)
        )
      );

    if (Number(hourCount[0]?.count || 0) >= smtpConfig.hourlyLimit) {
      return NextResponse.json(
        { error: '已达到每小时发送限制' },
        { status: 429 }
      );
    }

    if (Number(dayCount[0]?.count || 0) >= smtpConfig.dailyLimit) {
      return NextResponse.json(
        { error: '已达到每日发送限制' },
        { status: 429 }
      );
    }

    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      ...(smtpConfig.host.includes('163.com') && {
        tls: {
          rejectUnauthorized: false,
        },
      }),
    });

    // 准备邮件内容
    let htmlContent = validated.htmlContent;
    let textContent = validated.textContent;
    let subject = validated.subject;

    // 如果提供了模板和变量，进行变量替换
    if (validated.templateId && validated.variables) {
      const template = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, validated.templateId))
        .limit(1);

      if (template.length > 0) {
        const t = template[0];
        htmlContent = t.htmlContent;
        textContent = t.textContent || undefined;
        subject = t.subject;

        // 替换变量
        Object.entries(validated.variables || {}).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value as string);
          textContent = textContent?.replace(new RegExp(placeholder, 'g'), value as string);
          subject = subject.replace(new RegExp(placeholder, 'g'), value as string);
        });
      }
    }

    // 创建发送记录
    const logId = randomUUID();
    await db.insert(emailLogs).values({
      id: logId,
      companyId: payload.companyId,
      templateId: validated.templateId,
      configId: smtpConfig.id,
      toAddress: validated.toAddress,
      toName: validated.toName || null,
      ccAddresses: validated.ccAddresses || [],
      bccAddresses: validated.bccAddresses || [],
      subject,
      htmlContent,
      textContent,
      variables: validated.variables || {},
      status: 'sending',
    });

    // 发送邮件
    try {
      const info = await transporter.sendMail({
        from: `${smtpConfig.fromName || 'PulseOpti HR'} <${smtpConfig.fromAddress}>`,
        to: validated.toAddress,
        cc: validated.ccAddresses?.join(','),
        bcc: validated.bccAddresses?.join(','),
        subject,
        text: textContent,
        html: htmlContent,
      });

      // 更新发送记录
      await db
        .update(emailLogs)
        .set({
          status: 'success',
          messageId: info.messageId,
          sentAt: new Date(),
        })
        .where(eq(emailLogs.id, logId));

      // 更新模板使用次数
      if (validated.templateId) {
        await db
          .update(emailTemplates)
          .set({
            usageCount: sql`${emailTemplates.usageCount} + 1`,
            lastUsedAt: new Date(),
          })
          .where(eq(emailTemplates.id, validated.templateId));
      }

      return NextResponse.json({
        success: true,
        message: '邮件发送成功',
        data: {
          id: logId,
          messageId: info.messageId,
          toAddress: validated.toAddress,
          subject,
        },
      });
    } catch (emailError) {
      // 更新发送记录为失败
      await db
        .update(emailLogs)
        .set({
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : '发送失败',
        })
        .where(eq(emailLogs.id, logId));

      return NextResponse.json(
        { error: '邮件发送失败', details: emailError instanceof Error ? emailError.message : '发送失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('发送邮件失败:', error);
    return NextResponse.json(
      { error: '发送邮件失败' },
      { status: 500 }
    );
  }
}
