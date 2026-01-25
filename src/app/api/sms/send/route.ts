/**
 * 发送短信API
 * 路径: /api/sms/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smsConfigs, smsTemplates, smsLogs, smsStatistics } from '@/storage/database/shared/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { sendSms, validatePhoneNumber } from '@/lib/sms';

// 发送短信的Schema验证
const sendSmsSchema = z.object({
  phoneNumber: z.string().min(11, '手机号格式不正确').max(11, '手机号格式不正确'),
  templateCode: z.string().min(1, '模板代码不能为空'),
  variables: z.map(z.string(), z.string()).optional(),
  configId: z.string().optional(), // 指定使用的配置ID
});

/**
 * POST - 发送单条短信
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
    const validatedData = sendSmsSchema.parse(body);

    // 验证手机号格式
    if (!validatePhoneNumber(validatedData.phoneNumber)) {
      return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 });
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
      .limit(1);

    if (!template || template.length === 0) {
      return NextResponse.json({ error: '短信模板不存在或已禁用' }, { status: 404 });
    }

    // 获取短信配置
    let config;
    if (validatedData.configId) {
      // 使用指定的配置
      config = await db
        .select()
        .from(smsConfigs)
        .where(and(
          eq(smsConfigs.id, validatedData.configId),
          eq(smsConfigs.companyId, companyId),
          eq(smsConfigs.isActive, true)
        ))
        .limit(1);
    } else {
      // 使用默认配置
      config = await db
        .select()
        .from(smsConfigs)
        .where(and(
          eq(smsConfigs.companyId, companyId),
          eq(smsConfigs.isDefault, true),
          eq(smsConfigs.isActive, true)
        ))
        .limit(1);
    }

    if (!config || config.length === 0) {
      return NextResponse.json({ error: '未找到可用的短信配置' }, { status: 400 });
    }

    const smsConfig = config[0];

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

      if (Number(hourlyCount) >= smsConfig.hourlyLimit) {
        return NextResponse.json(
          { error: '已达到每小时发送限制' },
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

      if (Number(dailyCount) >= smsConfig.dailyLimit) {
        return NextResponse.json(
          { error: '已达到每日发送限制' },
          { status: 429 }
        );
      }
    }

    // 创建发送记录
    const [log] = await db
      .insert(smsLogs)
      .values({
        companyId,
        templateId: template[0].id,
        configId: smsConfig.id,
        phoneNumber: validatedData.phoneNumber,
        content: template[0].content,
        variables: validatedData.variables || {},
        status: 'sending',
      })
      .returning();

    try {
      // 发送短信
      const result = await sendSms(
        {
          phoneNumber: validatedData.phoneNumber,
          templateCode: template[0].templateId || template[0].code,
          templateParam: (validatedData.variables || {}) as Record<string, string>,
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

      if (result.messageId) {
        updateData.messageId = result.messageId;
      }

      if (result.bizId) {
        updateData.bizId = result.bizId;
      }

      if (result.error) {
        updateData.error = result.error;
      }

      await db
        .update(smsLogs)
        .set(updateData)
        .where(eq(smsLogs.id, log.id));

      // 更新统计数据
      if (result.success) {
        await db
          .insert(smsStatistics)
          .values({
            companyId,
            configId: smsConfig.id,
            period: 'daily',
            periodValue: new Date().toISOString().split('T')[0],
            totalCount: 1,
            successCount: 1,
            failedCount: 0,
          })
          .onConflictDoUpdate({
            target: [smsStatistics.companyId, smsStatistics.configId, smsStatistics.period, smsStatistics.periodValue],
            set: {
              totalCount: sql`${smsStatistics.totalCount} + 1`,
              successCount: sql`${smsStatistics.successCount} + 1`,
            },
          });
      } else {
        await db
          .insert(smsStatistics)
          .values({
            companyId,
            configId: smsConfig.id,
            period: 'daily',
            periodValue: new Date().toISOString().split('T')[0],
            totalCount: 1,
            successCount: 0,
            failedCount: 1,
          })
          .onConflictDoUpdate({
            target: [smsStatistics.companyId, smsStatistics.configId, smsStatistics.period, smsStatistics.periodValue],
            set: {
              totalCount: sql`${smsStatistics.totalCount} + 1`,
              failedCount: sql`${smsStatistics.failedCount} + 1`,
            },
          });
      }

      return NextResponse.json({
        success: result.success,
        data: {
          logId: log.id,
          messageId: result.messageId,
          bizId: result.bizId,
        },
        message: result.success ? '短信发送成功' : '短信发送失败',
      });
    } catch (error) {
      // 更新发送记录为失败
      await db
        .update(smsLogs)
        .set({
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误',
        })
        .where(eq(smsLogs.id, log.id));

      // 更新统计数据
      await db
        .insert(smsStatistics)
        .values({
          companyId,
          configId: smsConfig.id,
          period: 'daily',
          periodValue: new Date().toISOString().split('T')[0],
          totalCount: 1,
          successCount: 0,
          failedCount: 1,
        })
        .onConflictDoUpdate({
          target: [smsStatistics.companyId, smsStatistics.configId, smsStatistics.period, smsStatistics.periodValue],
          set: {
            totalCount: sql`${smsStatistics.totalCount} + 1`,
            failedCount: sql`${smsStatistics.failedCount} + 1`,
          },
        });

      throw error;
    }
  } catch (error) {
    console.error('[SMS_SEND] 发送短信失败:', error);

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
        error: '发送短信失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
