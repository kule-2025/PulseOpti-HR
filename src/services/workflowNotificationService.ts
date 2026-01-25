import { getDb } from '@/lib/db';
import { workflowInstances, notifications } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface NotificationPayload {
  companyId: string;
  userId: string;
  type: 'workflow_approve' | 'workflow_reject' | 'workflow_complete' | 'workflow_cancel' | 'workflow_assign';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class WorkflowNotificationService {
  /**
   * 发送工作流通知
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    const db = await getDb();
    
    try {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        companyId: payload.companyId,
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        metadata: payload.metadata || {},
        priority: payload.priority || 'medium',
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('发送工作流通知失败:', error);
      // 通知发送失败不应该阻塞主流程
    }
  }

  /**
   * 当工作流到达审批节点时通知审批人
   */
  async notifyApprover(instanceId: string, stepName: string, assigneeId: string): Promise<void> {
    const db = await getDb();
    
    try {
      const [instance] = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, instanceId))
        .limit(1);

      if (!instance) return;

      const title = `待审批：${instance.name}`;
      const message = `您有一个${instance.type}工作流需要审批，当前步骤：${stepName}。请及时处理。`;

      await this.sendNotification({
        companyId: instance.companyId,
        userId: assigneeId,
        type: 'workflow_approve',
        title,
        message,
        metadata: {
          instanceId,
          workflowType: instance.type,
          stepName,
          initiatorName: instance.initiatorName,
        },
        priority: 'high',
      });
    } catch (error) {
      console.error('通知审批人失败:', error);
    }
  }

  /**
   * 工作流被拒绝时通知发起人
   */
  async notifyInitiatorRejected(instanceId: string, reason: string): Promise<void> {
    const db = await getDb();
    
    try {
      const [instance] = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, instanceId))
        .limit(1);

      if (!instance) return;

      const title = `审批拒绝：${instance.name}`;
      const message = `您的${instance.type}申请已被拒绝。${reason ? `拒绝原因：${reason}` : ''}`;

      await this.sendNotification({
        companyId: instance.companyId,
        userId: instance.initiatorId,
        type: 'workflow_reject',
        title,
        message,
        metadata: {
          instanceId,
          workflowType: instance.type,
          reason,
        },
        priority: 'high',
      });
    } catch (error) {
      console.error('通知发起人失败:', error);
    }
  }

  /**
   * 工作流完成时通知发起人
   */
  async notifyInitiatorCompleted(instanceId: string): Promise<void> {
    const db = await getDb();
    
    try {
      const [instance] = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, instanceId))
        .limit(1);

      if (!instance) return;

      const title = `审批通过：${instance.name}`;
      const message = `您的${instance.type}申请已审批通过，流程已完成。`;

      await this.sendNotification({
        companyId: instance.companyId,
        userId: instance.initiatorId,
        type: 'workflow_complete',
        title,
        message,
        metadata: {
          instanceId,
          workflowType: instance.type,
          endDate: instance.endDate,
        },
        priority: 'medium',
      });
    } catch (error) {
      console.error('通知发起人失败:', error);
    }
  }

  /**
   * 工作流被取消时通知相关方
   */
  async notifyCancelled(instanceId: string, reason: string): Promise<void> {
    const db = await getDb();
    
    try {
      const [instance] = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, instanceId))
        .limit(1);

      if (!instance) return;

      const title = `流程取消：${instance.name}`;
      const message = `您的${instance.type}申请已被取消。${reason ? `取消原因：${reason}` : ''}`;

      await this.sendNotification({
        companyId: instance.companyId,
        userId: instance.initiatorId,
        type: 'workflow_cancel',
        title,
        message,
        metadata: {
          instanceId,
          workflowType: instance.type,
          reason,
        },
        priority: 'medium',
      });
    } catch (error) {
      console.error('通知取消失败:', error);
    }
  }

  /**
   * 批量通知（如工作流转派）
   */
  async notifyBatch(users: string[], title: string, message: string, metadata?: Record<string, any>): Promise<void> {
    const db = await getDb();
    
    try {
      const notificationItems = users.map(userId => ({
        id: crypto.randomUUID(),
        companyId: metadata?.companyId || '',
        userId,
        type: 'workflow_assign' as const,
        title,
        message,
        metadata: metadata || {},
        priority: 'medium' as const,
        isRead: false,
        createdAt: new Date(),
      }));

      await db.insert(notifications).values(notificationItems);
    } catch (error) {
      console.error('批量通知失败:', error);
    }
  }

  /**
   * 获取用户的工作流相关通知
   */
  async getUserWorkflowNotifications(userId: string, limit = 20): Promise<any[]> {
    const db = await getDb();
    
    const workflowTypes = [
      'workflow_approve',
      'workflow_reject',
      'workflow_complete',
      'workflow_cancel',
      'workflow_assign',
    ];

    const notificationList = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`type IN (${workflowTypes.join(',')})`
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return notificationList;
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string): Promise<void> {
    const db = await getDb();
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * 批量标记为已读
   */
  async markBatchAsRead(notificationIds: string[]): Promise<void> {
    const db = await getDb();
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(sql`id IN (${notificationIds.join(',')})`);
  }
}

export const workflowNotificationService = new WorkflowNotificationService();
