/**
 * 账号管理服务
 * 处理主账号-子账号-员工号的多层级账号体系
 */

import { getDb } from '@/lib/db';
import { users, subscriptions, accountConnections } from '@/storage/database/shared/schema';
import type { User, Subscription } from '@/storage/database/shared/schema';
import { eq, and, count, sql } from 'drizzle-orm';

// 账号类型定义
export enum UserType {
  MAIN_ACCOUNT = 'main_account', // 主账号
  SUB_ACCOUNT = 'sub_account',   // 子账号
  EMPLOYEE = 'employee',         // 员工号
  DEVELOPER = 'developer',       // 开发者账号
}

// 连接关系类型定义
export enum ConnectionType {
  DIRECT = 'direct',       // 直接上下级
  INDIRECT = 'indirect',   // 间接关系
}

// 关系类型定义
export enum RelationshipType {
  HIERARCHY = 'hierarchy',           // 层级关系
  PEER = 'peer',                     // 同级关系
  CROSS_DEPARTMENT = 'cross_department', // 跨部门关系
}

// 连接权限定义
export enum ConnectionPermission {
  MESSAGE = 'message',           // 即时消息
  TASK_ASSIGN = 'task_assign',   // 任务指派
  STATUS_SYNC = 'status_sync',   // 状态同步
}

// 配额接口
export interface AccountQuota {
  maxMainAccounts: number;
  maxSubAccounts: number;
  maxEmployees: number;
  currentMainAccounts: number;
  currentSubAccounts: number;
  currentEmployees: number;
}

// 创建账号请求接口
export interface CreateAccountRequest {
  companyId: string;
  userType: UserType;
  parentUserId?: string;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  role: string;
  departmentId?: string;
  positionId?: string;
}

/**
 * 账号管理服务类
 */
export class AccountManagementService {
  /**
   * 检查账号配额
   */
  async checkQuota(companyId: string): Promise<AccountQuota> {
    // 获取企业的订阅套餐信息
    const db = await getDb();
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.companyId, companyId))
      .orderBy(sql`${subscriptions.createdAt} DESC`)
      .limit(1);

    if (!subscription) {
      throw new Error('未找到订阅信息');
    }

    const maxMainAccounts = 1; // 主账号永远只能有1个
    const maxSubAccounts = subscription.maxSubAccounts || 0;
    const maxEmployees = subscription.maxEmployees || 0;

    // 统计当前各类账号数量
    const [mainAccountCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.userType, UserType.MAIN_ACCOUNT)
        )
      );

    const [subAccountCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.userType, UserType.SUB_ACCOUNT)
        )
      );

    const [employeeCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.userType, UserType.EMPLOYEE)
        )
      );

    return {
      maxMainAccounts,
      maxSubAccounts,
      maxEmployees,
      currentMainAccounts: mainAccountCount.count,
      currentSubAccounts: subAccountCount.count,
      currentEmployees: employeeCount.count,
    };
  }

  /**
   * 检查是否可以创建指定类型的账号
   */
  async canCreateAccount(companyId: string, userType: UserType): Promise<boolean> {
    const quota = await this.checkQuota(companyId);

    switch (userType) {
      case UserType.MAIN_ACCOUNT:
        return quota.currentMainAccounts < quota.maxMainAccounts;
      case UserType.SUB_ACCOUNT:
        return quota.currentSubAccounts < quota.maxSubAccounts;
      case UserType.EMPLOYEE:
        return quota.currentEmployees < quota.maxEmployees;
      case UserType.DEVELOPER:
        // 开发者账号不受企业套餐限制
        return true;
      default:
        throw new Error(`未知的账号类型: ${userType}`);
    }
  }

  /**
   * 创建账号
   */
  async createAccount(request: CreateAccountRequest): Promise<{ id: string; userType: string }> {
    // 验证账号类型
    const validUserTypes = Object.values(UserType);
    if (!validUserTypes.includes(request.userType)) {
      throw new Error(`无效的账号类型: ${request.userType}`);
    }

    // 检查是否可以创建账号
    if (request.userType !== UserType.DEVELOPER && request.userType !== UserType.MAIN_ACCOUNT) {
      const canCreate = await this.canCreateAccount(request.companyId, request.userType);
      if (!canCreate) {
        const quota = await this.checkQuota(request.companyId);
        const limit = request.userType === UserType.SUB_ACCOUNT
          ? quota.maxSubAccounts
          : quota.maxEmployees;
        throw new Error(`已达到${request.userType === UserType.SUB_ACCOUNT ? '子账号' : '员工号'}数量上限（${limit}个）`);
      }
    }

    // 创建账号
    const db = await getDb();
    const [newUser] = await db
      .insert(users)
      .values({
        companyId: request.companyId,
        userType: request.userType,
        parentUserId: request.parentUserId || null,
        name: request.name,
        email: request.email || null,
        phone: request.phone || null,
        username: request.username || null,
        password: request.password || null,
        role: request.role,
        isActive: true,
      })
      .returning();

    if (!newUser) {
      throw new Error('创建账号失败');
    }

    // 如果是子账号或员工号，创建连接关系
    if (
      request.parentUserId &&
      (request.userType === UserType.SUB_ACCOUNT || request.userType === UserType.EMPLOYEE)
    ) {
      await this.createConnection(
        request.companyId,
        request.parentUserId,
        newUser.id,
        request.userType === UserType.SUB_ACCOUNT ? ConnectionType.DIRECT : ConnectionType.DIRECT,
        [ConnectionPermission.MESSAGE, ConnectionPermission.TASK_ASSIGN, ConnectionPermission.STATUS_SYNC]
      );
    }

    return {
      id: newUser.id,
      userType: newUser.userType,
    };
  }

  /**
   * 创建账号连接关系
   */
  async createConnection(
    companyId: string | null,
    fromUserId: string,
    toUserId: string,
    connectionType: ConnectionType,
    permissions: ConnectionPermission[]
  ): Promise<void> {
    // 检查连接是否已存在
    const db = await getDb();
    const [existing] = await db
      .select()
      .from(accountConnections)
      .where(
        and(
          eq(accountConnections.fromUserId, fromUserId),
          eq(accountConnections.toUserId, toUserId)
        )
      )
      .limit(1);

    if (existing) {
      // 更新现有连接
      await db
        .update(accountConnections)
        .set({
          permissions,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(accountConnections.id, existing.id));
    } else {
      // 创建新连接
      await db.insert(accountConnections).values({
        companyId,
        fromUserId,
        toUserId,
        connectionType,
        relationshipType: RelationshipType.HIERARCHY,
        permissions,
        status: 'active',
      });
    }
  }

  /**
   * 获取账号的子账号列表
   */
  async getSubAccounts(parentUserId: string): Promise<any[]> {
    const db = await getDb();
    const subAccounts = await db
      .select()
      .from(users)
      .where(eq(users.parentUserId, parentUserId));

    return subAccounts;
  }

  /**
   * 获取账号的员工号列表
   */
  async getEmployees(parentUserId: string): Promise<any[]> {
    const db = await getDb();
    const employees = await db
      .select()
      .from(users)
      .where(eq(users.parentUserId, parentUserId));

    return employees;
  }

  /**
   * 获取账号的连接关系
   */
  async getConnections(userId: string, companyId?: string): Promise<any[]> {
    const db = await getDb();
    let connections;
    if (companyId) {
      connections = await db
        .select()
        .from(accountConnections)
        .where(eq(accountConnections.companyId, companyId));
    } else {
      connections = await db
        .select()
        .from(accountConnections)
        .where(sql`${accountConnections.companyId} IS NULL`);
    }

    return connections;
  }

  /**
   * 删除账号
   */
  async deleteAccount(userId: string): Promise<void> {
    // 检查是否为主账号
    const db = await getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('账号不存在');
    }

    if (user.userType === UserType.MAIN_ACCOUNT) {
      throw new Error('主账号不能删除');
    }

    // 检查是否有子账号或员工号
    const [childCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.parentUserId, userId));

    if (childCount.count > 0) {
      throw new Error('请先删除该账号下的所有子账号或员工号');
    }

    // 删除账号
    await db.delete(users).where(eq(users.id, userId));
  }

  /**
   * 迁移现有账号数据
   * 将isMainAccount转换为userType
   */
  async migrateExistingAccounts(): Promise<void> {
    // 将isMainAccount=true的用户设置为main_account
    const db = await getDb();
    await db
      .update(users)
      .set({
        userType: UserType.MAIN_ACCOUNT,
      })
      .where(sql`${users.isMainAccount} = true`);

    // 将parentUserId非空的用户根据role判断是sub_account还是employee
    await db
      .update(users)
      .set({
        userType: UserType.SUB_ACCOUNT,
      })
      .where(
        and(
          sql`${users.parentUserId} IS NOT NULL`,
          sql`${users.role} IN ('admin', 'manager')`
        )
      );

    // 剩余的parentUserId非空的用户设置为employee
    await db
      .update(users)
      .set({
        userType: UserType.EMPLOYEE,
      })
      .where(
        and(
          sql`${users.parentUserId} IS NOT NULL`,
          sql`${users.userType} = 'employee'`
        )
      );

    // 将isMainAccount=false且parentUserId为空的用户设置为main_account
    await db
      .update(users)
      .set({
        userType: UserType.MAIN_ACCOUNT,
      })
      .where(
        and(
          sql`${users.isMainAccount} = false`,
          sql`${users.parentUserId} IS NULL`,
          sql`${users.companyId} IS NOT NULL`
        )
      );
  }
}

// 导出单例
export const accountManagementService = new AccountManagementService();
