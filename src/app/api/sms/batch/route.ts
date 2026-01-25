/**
 * 批量发送短信API
 * 路径: /api/sms/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsConfigs, smsTemplates, smsLogs, smsStatistics } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { sendSms, validatePhoneNumber } from '@/lib/sms';

// 批量发送短信的Schema验证
const batchSendSmsSchema = z.object({
  recipients: z.array(z.object({
    phoneNumber: z.string().min(11).max(11),
    variables: z.map(z.string(), z.string()).optional(),
  })).min(1, '接收者列表不能为空').max(100, '单次批量发送最多支持100条'),
  templateCode: z.string().min(1, '模板代码不能为空'),
  configId: z.string().optional(),
});

/**
 * POST - 批量发送短信
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();

    // 验证数据格式
    const validatedData = batchSendSmsSchema.parse(body);

    // 验证所有手机号格式
    const invalidPhones = validatedData.recipients.filter(
      r => !validatePhoneNumber(r.phoneNumber)
    );
    if (invalidPhones.length > 0) {
      return NextResponse.json(
        {
          error: '存在无效的手机号',
          invalidPhones: invalidPhones.map(r => r.phoneNumber),
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const companyId = payload.companyId || 'PLATFORM';

    // 获取短信模板
    const template = await db
      .select()
      .from(smsTemplates)
      .where(and(
        eq(smsTemplates.code, validatedData.templateCode),
        sql`${smsTemplates.companyId} IS NULL OR ${smsTemplates.companyId} = ${companyId}`,
        eq(smsTemplates.isActive, true)
      ))
      .limit(1)

    if (template.length === 0) {
      return NextResponse.json({ error: '短信模板不存在或已禁用' }, { status: 404 });
    }

    // 获取短信配置
    let config;
    if (validatedData.configId) {
      config = await db
      .select()
      .from(smsConfigs)
      .where(and(
          eq(smsConfigs.id, validatedData.configId),
          eq(smsConfigs.companyId, companyId),
          eq(smsConfigs.isActive, true)
        ))
      .limit(1)
    } else {
      config = await db
      .select()
      .from(smsConfigs)
      .where(and(
          eq(smsConfigs.companyId, companyId),
          eq(smsConfigs.isDefault, true),
          eq(smsConfigs.isActive, true)
        ))
      .limit(1)
    }

    if (config.length === 0) {
      return NextResponse.json({ error: '未找到可用的短信配置' }, { status: 400 });
    }

    const smsConfig = config[0];
    const smsTemplate = template[0];

    // 检查发送限制
    if (smsConfig.hourlyLimit) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [{ count: hourlyCount }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(smsLogs)
        .where(
          and(
            eq(smsLogs.companyId, companyId),
            eq(smsLogs.configId, smsConfig.id),
            sql`${smsLogs.createdAt} >= ${oneHourAgo}`,
            eq(smsLogs.status, 'success')
          )
        );

      if (Number(hourlyCount) + validatedData.recipients.length > smsConfig.hourlyLimit) {
        return NextResponse.json(
          { error: `已达到每小时发送限制，剩余可用: ${smsConfig.hourlyLimit - Number(hourlyCount)}` },
          { status: 429 }
        );
      }
    }

    if (smsConfig.dailyLimit) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [{ count: dailyCount }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(smsLogs)
        .where(
          and(
            eq(smsLogs.companyId, companyId),
            eq(smsLogs.configId, smsConfig.id),
            sql`${smsLogs.createdAt} >= ${oneDayAgo}`,
            eq(smsLogs.status, 'success')
          )
        );

      if (Number(dailyCount) + validatedData.recipients.length > smsConfig.dailyLimit) {
        return NextResponse.json(
          { error: `已达到每日发送限制，剩余可用: ${smsConfig.dailyLimit - Number(dailyCount)}` },
          { status: 429 }
        );
      }
    }

    // 批量创建发送记录
    const logs = await db
      .insert(smsLogs)
      .values(
        validatedData.recipients.map(r => ({
          companyId,
          templateId: smsTemplate.id,
          configId: smsConfig.id,
          phoneNumber: r.phoneNumber,
          content: smsTemplate.content,
          variables: r.variables || {},
          status: 'sending',
        }))
      )
      .returning();

    // 批量发送短信（使用Promise.all进行并行发送）
    const results = await Promise.all(
      logs.map(async (log, index) => {
        const recipient = validatedData.recipients[index];
        try {
          const result = await sendSms(
            {
              phoneNumber: recipient.phoneNumber,
              templateCode: smsTemplate.templateId || smsTemplate.code,
              templateParam: Object.fromEntries(recipient.variables || new Map()) as Record<string, string>,
              signName: smsConfig.signName,
            },
            {
              provider: smsConfig.provider as any,
              accessKeyId: smsConfig.accessKeyId,
              accessKeySecret: smsConfig.accessKeySecret,
              endpoint: smsConfig.endpoint || undefined,
              signName: smsConfig.signName,
              region: smsConfig.region || undefined,
            }
          );

          // 更新发送记录
          const updateData: any = {
            status: result.success ? 'success' : 'failed',
            sentAt: new Date(),
          };

          if (result.messageId) updateData.messageId = result.messageId;
          if (result.bizId) updateData.bizId = result.bizId;
          if (result.error) updateData.error = result.error;

          await db
            .update(smsLogs)
            .set(updateData)
            .where(eq(smsLogs.id, log.id));

          return {
            logId: log.id,
            phoneNumber: recipient.phoneNumber,
            success: result.success,
            messageId: result.messageId,
            bizId: result.bizId,
            error: result.error,
          };
        } catch (error) {
          // 更新发送记录为失败
          await db
            .update(smsLogs)
            .set({
              status: 'failed',
              error: error instanceof Error ? error.message : '未知错误',
              sentAt: new Date(),
            })
            .where(eq(smsLogs.id, log.id));

          return {
            logId: log.id,
            phoneNumber: recipient.phoneNumber,
            success: false,
            error: error instanceof Error ? error.message : '未知错误',
          };
        }
      })
    );

    // 更新模板使用次数（增加批量发送的数量）
    await db
      .update(smsTemplates)
      .set({
        usageCount: sql`${smsTemplates.usageCount} + ${validatedData.recipients.length}`,
        lastUsedAt: new Date(),
      })
      .where(eq(smsTemplates.id, smsTemplate.id));

    // 更新配置最后使用时间
    const successCount = results.filter(r => r.success).length;
    await db
      .update(smsConfigs)
      .set({
        lastUsedAt: new Date(),
        testStatus: successCount > 0 ? 'success' : 'failed',
        testResult: successCount > 0 ? `成功发送 ${successCount} 条` : '发送失败',
      })
      .where(eq(smsConfigs.id, smsConfig.id));

    // 更新统计信息
    const today = new Date().toISOString().split('T')[0];
    const period = 'daily';
    const periodValue = today;

    const [existingStat] = await db
      .select()
      .from(smsStatistics)
      .where(and(
        eq(smsStatistics.companyId, companyId),
        eq(smsStatistics.configId, smsConfig.id),
        eq(smsStatistics.templateId, smsTemplate.id),
        eq(smsStatistics.period, period),
        eq(smsStatistics.periodValue, periodValue)
      ))
      .limit(1)

    if (existingStat) {
      const totalCount = (existingStat.totalCount || 0) + results.length;
      const successCountNew = (existingStat.successCount || 0) + successCount;
      const failedCountNew = (existingStat.failedCount || 0) + (results.length - successCount);

      await db
        .update(smsStatistics)
        .set({
          totalCount,
          successCount: successCountNew,
          failedCount: failedCountNew,
          successRate: totalCount > 0 ? Math.round((successCountNew / totalCount) * 100) : 0,
        })
        .where(eq(smsStatistics.id, existingStat.id));
    } else {
      await db.insert(smsStatistics).values({
        companyId,
        configId: smsConfig.id,
        templateId: smsTemplate.id,
        period,
        periodValue,
        totalCount: results.length,
        successCount,
        failedCount: results.length - successCount,
        successRate: results.length > 0 ? Math.round((successCount / results.length) * 100) : 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
        results,
      },
      message: `批量发送完成，成功 ${successCount} 条，失败 ${results.length - successCount} 条`,
    });
  } catch (error) {
    console.error('[SMS_BATCH] 批量发送短信失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '数据验证失败',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '批量发送短信失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
