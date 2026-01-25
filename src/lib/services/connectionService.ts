/**
 * 实时连接服务
 * 处理账号间即时消息、任务指派、状态同步
 *
 * 注意：此文件的实现已被暂时简化以便构建通过
 * TODO: 恢复完整的实现，将所有.db.query.调用替换为正确的Drizzle ORM语法
 */

import { getDb } from '@/lib/db';
import { users, accountConnections, instantMessages, taskAssignments } from '@/storage/database/shared/schema';
import { eq, and, or, desc, count } from 'drizzle-orm';
import { UserType, ConnectionType, RelationshipType, ConnectionPermission } from './accountManagementService';

// 消息类型
export enum MessageType {
  TEXT = 'text',
  TASK = 'task',
  SYSTEM = 'system',
}

// 任务类型
export enum TaskType {
  RECRUITMENT = 'recruitment',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
  ADMINISTRATIVE = 'administrative',
}

// 任务优先级
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 任务状态
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

// 发送消息请求
export interface SendMessageRequest {
  fromUserId: string;
  toUserId: string;
  message: string;
  messageType: MessageType;
  relatedTaskId?: string;
}

// 任务指派请求
export interface AssignTaskRequest {
  fromUserId: string;
  toUserId: string;
  taskType: TaskType;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
  relatedResourceId?: string;
  relatedResourceType?: string;
  requirements?: any;
  attachments?: any[];
}

// 状态同步请求
export interface SyncStatusRequest {
  fromUserId: string;
  toUserId: string;
  statusType: string;
  statusValue: any;
  relatedResourceId?: string;
  relatedResourceType?: string;
}

/**
 * 实时连接服务类
 */
export class ConnectionService {
  /**
   * 检查两个账号是否可以连接
   */
  async canConnect(fromUserId: string, toUserId: string): Promise<boolean> {
    const db = await getDb();
    const [fromUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, fromUserId))
      .limit(1);

    const [toUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, toUserId))
      .limit(1);

    if (!fromUser || !toUser) {
      return false;
    }

    // 开发者账号之间可以连接
    if (fromUser.userType === UserType.DEVELOPER && toUser.userType === UserType.DEVELOPER) {
      return true;
    }

    // 企业账号之间可以连接
    if (fromUser.companyId && toUser.companyId && fromUser.companyId !== toUser.companyId) {
      return false;
    }

    // 开发者账号与企业账号之间不能连接
    if (fromUser.userType === UserType.DEVELOPER || toUser.userType === UserType.DEVELOPER) {
      return false;
    }

    // 员工号不能连接其他员工号
    if (fromUser.userType === UserType.EMPLOYEE && toUser.userType === UserType.EMPLOYEE) {
      return false;
    }

    // 主账号可以连接子账号和员工号
    // 子账号可以连接主账号、员工号和其他子账号
    // 员工号可以连接主账号和子账号
    return true;
  }

  /**
   * 检查是否具有指定连接权限
   */
  async hasConnectionPermission(
    fromUserId: string,
    toUserId: string,
    permission: ConnectionPermission
  ): Promise<boolean> {
    const db = await getDb();
    const [connection] = await db
      .select()
      .from(accountConnections)
      .where(
        and(
          eq(accountConnections.fromUserId, fromUserId),
          eq(accountConnections.toUserId, toUserId),
          eq(accountConnections.status, 'active')
        )
      )
      .limit(1);

    if (!connection) {
      return false;
    }

    const permissions = connection.permissions as string[];
    return permissions.includes(permission);
  }

  /**
   * 发送即时消息
   */
  async sendMessage(request: SendMessageRequest): Promise<{ id: string }> {
    const db = await getDb();
    // 检查是否可以连接
    const canConnect = await this.canConnect(request.fromUserId, request.toUserId);
    if (!canConnect) {
      throw new Error('无法向该账号发送消息');
    }

    // 检查是否具有消息权限
    const hasPermission = await this.hasConnectionPermission(
      request.fromUserId,
      request.toUserId,
      ConnectionPermission.MESSAGE
    );
    if (!hasPermission) {
      throw new Error('没有发送消息的权限');
    }

    // 获取用户信息
    const [fromUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.fromUserId))
      .limit(1);

    const [newMessage] = await db
      .insert(instantMessages)
      .values({
        companyId: fromUser?.companyId || null,
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        message: request.message,
        messageType: request.messageType,
        relatedTaskId: request.relatedTaskId || null,
        isRead: false,
      })
      .returning();

    if (!newMessage) {
      throw new Error('发送消息失败');
    }

    // 更新连接关系的最后消息时间
    await db
      .update(accountConnections)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(accountConnections.fromUserId, request.fromUserId),
          eq(accountConnections.toUserId, request.toUserId)
        )
      );

    return { id: newMessage.id };
  }

  /**
   * 获取消息列表
   */
  async getMessages(userId: string, page: number = 1, pageSize: number = 20): Promise<any[]> {
    const db = await getDb();
    const messages = await db
      .select()
      .from(instantMessages)
      .where(
        or(
          eq(instantMessages.fromUserId, userId),
          eq(instantMessages.toUserId, userId)
        )
      )
      .orderBy(desc(instantMessages.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return messages;
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    const db = await getDb();
    const [result] = await db
      .select({ count: count() })
      .from(instantMessages)
      .where(
        and(
          eq(instantMessages.toUserId, userId),
          eq(instantMessages.isRead, false)
        )
      );

    return result?.count || 0;
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const db = await getDb();
    const [message] = await db
      .select()
      .from(instantMessages)
      .where(eq(instantMessages.id, messageId))
      .limit(1);

    if (!message) {
      throw new Error('消息不存在');
    }

    if (message.toUserId !== userId) {
      throw new Error('只能标记自己收到的消息为已读');
    }

    await db
      .update(instantMessages)
      .set({ isRead: true })
      .where(eq(instantMessages.id, messageId));
  }

  /**
   * 指派任务
   */
  async assignTask(request: AssignTaskRequest): Promise<{ id: string }> {
    const db = await getDb();
    // 检查是否可以连接
    const canConnect = await this.canConnect(request.fromUserId, request.toUserId);
    if (!canConnect) {
      throw new Error('无法向该账号指派任务');
    }

    // 检查是否具有任务指派权限
    const hasPermission = await this.hasConnectionPermission(
      request.fromUserId,
      request.toUserId,
      ConnectionPermission.TASK_ASSIGN
    );
    if (!hasPermission) {
      throw new Error('没有指派任务的权限');
    }

    // 获取用户信息
    const [fromUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.fromUserId))
      .limit(1);

    const [newTask] = await db
      .insert(taskAssignments)
      .values({
        companyId: fromUser?.companyId || 'PLATFORM',
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        taskType: request.taskType,
        title: request.title,
        description: request.description || null,
        priority: request.priority,
        dueDate: request.dueDate || null,
        relatedResourceId: request.relatedResourceId || null,
        relatedResourceType: request.relatedResourceType || null,
        requirements: request.requirements || null,
        attachments: request.attachments || null,
        status: TaskStatus.PENDING,
      })
      .returning();

    if (!newTask) {
      throw new Error('指派任务失败');
    }

    return { id: newTask.id };
  }

  /**
   * 获取任务列表
   */
  async getTasks(userId: string, status?: TaskStatus): Promise<any[]> {
    const db = await getDb();
    const whereCondition = status
      ? and(
          eq(taskAssignments.toUserId, userId),
          eq(taskAssignments.status, status)
        )
      : eq(taskAssignments.toUserId, userId);

    const tasks = await db
      .select()
      .from(taskAssignments)
      .where(whereCondition)
      .orderBy(desc(taskAssignments.createdAt));

    return tasks;
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: string, userId: string, status: TaskStatus, feedback?: string): Promise<void> {
    const db = await getDb();
    const [task] = await db
      .select()
      .from(taskAssignments)
      .where(eq(taskAssignments.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.toUserId !== userId) {
      throw new Error('只能更新指派给自己的任务状态');
    }

    await db
      .update(taskAssignments)
      .set({
        status,
        feedback: feedback || null,
        updatedAt: new Date(),
      })
      .where(eq(taskAssignments.id, taskId));
  }

  /**
   * 同步状态
   */
  async syncStatus(request: SyncStatusRequest): Promise<void> {
    // TODO: 实现状态同步逻辑
    throw new Error('状态同步功能待实现');
  }

  /**
   * 获取连接关系列表
   */
  async getConnections(userId: string, companyId?: string): Promise<any[]> {
    const db = await getDb();
    const whereCondition = companyId
      ? and(
          eq(accountConnections.fromUserId, userId),
          eq(accountConnections.companyId, companyId)
        )
      : eq(accountConnections.fromUserId, userId);

    const connections = await db
      .select()
      .from(accountConnections)
      .where(whereCondition);

    return connections;
  }

  /**
   * 获取可连接的账号列表
   */
  async getConnectableAccounts(userId: string): Promise<any[]> {
    const db = await getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return [];
    }

    // 开发者账号可以连接所有开发者账号
    if (user.userType === UserType.DEVELOPER) {
      const developers = await db
        .select()
        .from(users)
        .where(eq(users.userType, UserType.DEVELOPER))
        .limit(100);

      return developers.filter((u: any) => u.id !== userId);
    }

    // 企业账号只能连接同一公司的账号
    if (user.companyId) {
      const companyAccounts = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.companyId, user.companyId),
            eq(users.id, userId)  // 排除自己
          )
        )
        .limit(100);

      return companyAccounts.filter((u: any) => u.id !== userId);
    }

    return [];
  }
}

// 导出单例实例
export const connectionService = new ConnectionService();
