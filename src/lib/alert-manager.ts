import { getDb } from './db';
import { syncTasks, syncLogs, users } from '@/storage/database/shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { emailService } from './email-service';

export interface AlertRule {
  id: string;
  type: 'sync_failure' | 'sync_timeout' | 'error_threshold';
  condition: {
    taskType?: string;
    source?: string;
    errorThreshold?: number; // 错误次数阈值
    timeWindow?: number; // 时间窗口(分钟)
    timeoutMinutes?: number; // 超时阈值(分钟)
  };
  enabled: boolean;
  notificationChannels: ('email' | 'sms' | 'dashboard')[];
  recipients: string[]; // 用户ID列表
}

export interface Alert {
  id: string;
  ruleId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  taskId?: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

/**
 * 告警管理器
 * 负责监控数据同步状态，触发告警，发送通知
 */
class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultRules() {
    // 规则1: 同步任务失败告警
    const failureRule: AlertRule = {
      id: 'sync-failure',
      type: 'sync_failure',
      condition: {
        errorThreshold: 3, // 连续失败3次
        timeWindow: 30, // 30分钟内
      },
      enabled: true,
      notificationChannels: ['dashboard', 'email'],
      recipients: [],
    };
    this.rules.set(failureRule.id, failureRule);

    // 规则2: 同步超时告警
    const timeoutRule: AlertRule = {
      id: 'sync-timeout',
      type: 'sync_timeout',
      condition: {
        timeoutMinutes: 60, // 超过60分钟
      },
      enabled: true,
      notificationChannels: ['dashboard'],
      recipients: [],
    };
    this.rules.set(timeoutRule.id, timeoutRule);

    // 规则3: 错误阈值告警
    const errorThresholdRule: AlertRule = {
      id: 'error-threshold',
      type: 'error_threshold',
      condition: {
        errorThreshold: 10, // 错误日志超过10条
        timeWindow: 10, // 10分钟内
      },
      enabled: true,
      notificationChannels: ['dashboard', 'email'],
      recipients: [],
    };
    this.rules.set(errorThresholdRule.id, errorThresholdRule);
  }

  /**
   * 启动告警监控
   */
  async start() {
    if (this.isRunning) {
      console.log('告警监控已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('启动告警监控...');

    // 每60秒检查一次
    this.checkInterval = setInterval(() => {
      this.checkAlerts().catch(console.error);
    }, 60000);

    // 立即执行一次检查
    await this.checkAlerts();
  }

  /**
   * 停止告警监控
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('告警监控已停止');
  }

  /**
   * 检查告警规则
   */
  private async checkAlerts() {
    try {
      const db = await getDb();

      for (const [ruleId, rule] of this.rules) {
        if (!rule.enabled) continue;

        switch (rule.type) {
          case 'sync_failure':
            await this.checkSyncFailure(db, rule);
            break;
          case 'sync_timeout':
            await this.checkSyncTimeout(db, rule);
            break;
          case 'error_threshold':
            await this.checkErrorThreshold(db, rule);
            break;
        }
      }
    } catch (error) {
      console.error('检查告警失败:', error);
    }
  }

  /**
   * 检查同步失败
   */
  private async checkSyncFailure(db: any, rule: AlertRule) {
    const timeWindow = rule.condition.timeWindow || 30;
    const threshold = rule.condition.errorThreshold || 3;
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    // 查询连续失败的任务
    const failedTasks = await db
      .select()
      .from(syncTasks)
      .where(and(
        eq(syncTasks.status, 'failed'),
        gte(syncTasks.updatedAt, startTime)
      ))
      .limit(threshold);

    // 检查同一任务是否失败超过阈值
    const taskFailures = new Map<string, number>();
    failedTasks.forEach((task: { type: string; source: string }) => {
      const key = task.type + '-' + task.source;
      taskFailures.set(key, (taskFailures.get(key) || 0) + 1);
    });

    for (const [key, count] of taskFailures) {
      if (count >= threshold) {
        const [type, source] = key.split('-');
        await this.triggerAlert({
          ruleId: rule.id,
          type: 'sync_failure',
          severity: 'high',
          title: `${type} - ${source} 同步频繁失败`,
          message: `在最近 ${timeWindow} 分钟内，${type} - ${source} 同步任务已失败 ${count} 次，请及时处理。`,
          metadata: { type, source, failureCount: count },
        });
      }
    }
  }

  /**
   * 检查同步超时
   */
  private async checkSyncTimeout(db: any, rule: AlertRule) {
    const timeoutMinutes = rule.condition.timeoutMinutes || 60;
    const timeoutTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // 查询超时的任务
    const timeoutTasks = await db
      .select()
      .from(syncTasks)
      .where(and(
        eq(syncTasks.status, 'running'),
        gte(syncTasks.startedAt, timeoutTime)
      ));

    for (const task of timeoutTasks) {
      await this.triggerAlert({
        ruleId: rule.id,
        type: 'sync_timeout',
        severity: 'critical',
        title: `同步任务超时`,
        message: `任务 ${task.id} (${task.type} - ${task.source}) 已运行超过 ${timeoutMinutes} 分钟，可能已卡死。`,
        taskId: task.id,
        metadata: { task },
      });
    }
  }

  /**
   * 检查错误阈值
   */
  private async checkErrorThreshold(db: any, rule: AlertRule) {
    const timeWindow = rule.condition.timeWindow || 10;
    const threshold = rule.condition.errorThreshold || 10;
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    // 查询错误日志数量
    const errorCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(syncLogs)
      .where(and(
        eq(syncLogs.level, 'error'),
        gte(syncLogs.createdAt, startTime)
      ))
      .then((results: any[]) => results[0]);

    const errorCount = Number(errorCountResult?.count || 0);

    if (errorCount >= threshold) {
      await this.triggerAlert({
        ruleId: rule.id,
        type: 'error_threshold',
        severity: 'medium',
        title: `错误日志数量超过阈值`,
        message: `在最近 ${timeWindow} 分钟内，已产生 ${errorCount} 条错误日志，超过阈值 ${threshold}。`,
        metadata: { errorCount, threshold },
      });
    }
  }

  /**
   * 触发告警（公共方法）
   */
  async triggerAlertPublic(alertData: Omit<Alert, 'id' | 'acknowledged' | 'createdAt'>) {
    await this.triggerAlert(alertData);
  }

  /**
   * 触发告警
   */
  private async triggerAlert(alertData: Omit<Alert, 'id' | 'acknowledged' | 'createdAt'>) {
    // 防止重复告警
    const alertKey = `${alertData.ruleId}-${alertData.taskId || 'general'}`;
    if (this.alerts.has(alertKey)) {
      const existing = this.alerts.get(alertKey)!;
      if (!existing.acknowledged) {
        return; // 未确认的告警不重复触发
      }
    }

    const alert: Alert = {
      id: alertKey,
      ...alertData,
      acknowledged: false,
      createdAt: new Date(),
    };

    this.alerts.set(alertKey, alert);

    console.log(`触发告警: [${alert.severity.toUpperCase()}] ${alert.title}`);
    console.log(alert.message);

    // 发送通知
    await this.sendNotification(alert);
  }

  /**
   * 发送通知
   */
  private async sendNotification(alert: Alert) {
    const rule = this.rules.get(alert.ruleId);
    if (!rule) return;

    for (const channel of rule.notificationChannels) {
      try {
        switch (channel) {
          case 'dashboard':
            // 存储到数据库，供前端显示
            await this.saveAlertToDatabase(alert);
            break;
          case 'email':
            // 发送邮件通知
            if (emailService.isReady()) {
              // 获取接收人邮箱
              const recipientEmails = await this.getRecipientEmails(rule.recipients);
              if (recipientEmails.length > 0) {
                await emailService.sendAlertEmail({
                  to: recipientEmails,
                  title: alert.title,
                  message: alert.message,
                  severity: alert.severity,
                  metadata: alert.metadata,
                });
              } else {
                console.warn('没有配置接收人邮箱，跳过邮件通知');
              }
            } else {
              console.warn('邮件服务未配置，跳过邮件通知');
            }
            break;
          case 'sms':
            // 发送短信通知（可集成短信服务）
            console.log(`[短信告警] ${alert.title}: ${alert.message}`);
            break;
        }
      } catch (error) {
        console.error(`发送${channel}通知失败:`, error);
      }
    }
  }

  /**
   * 获取接收人邮箱列表
   */
  private async getRecipientEmails(recipientIds: string[]): Promise<string[]> {
    if (recipientIds.length === 0) return [];

    try {
      const db = await getDb();
      const usersList = await db
        .select({ email: users.email })
        .from(users)
        .where(sql`${users.id} = ANY(${recipientIds})`);

      return usersList.map((u: any) => u.email).filter(Boolean);
    } catch (error) {
      console.error('获取接收人邮箱失败:', error);
      return [];
    }
  }

  /**
   * 保存告警到数据库
   */
  private async saveAlertToDatabase(alert: Alert) {
    // 这里可以创建一个 alerts 表来持久化告警
    // 当前仅控制台记录
    console.log(`[告警记录] ${JSON.stringify(alert)}`);
  }

  /**
   * 确认告警
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * 获取活跃告警列表
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule);
  }

  /**
   * 移除告警规则
   */
  removeRule(ruleId: string) {
    this.rules.delete(ruleId);
  }

  /**
   * 更新告警规则
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  /**
   * 获取所有告警规则
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }
}

// 导出单例
export const alertManager = new AlertManager();
