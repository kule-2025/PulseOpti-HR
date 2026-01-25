import { eq, and, SQL, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, companies, employees } from "./shared/schema";
import type { User, InsertUser, Company } from "./shared/schema";

interface SubAccountQuota {
  currentAccounts: number; // 当前管理员账号数
  maxAccounts: number; // 最大管理员账号数
  availableAccounts: number; // 可用管理员账号数
  canAdd: boolean; // 是否可以添加子账号
}

interface CreateSubAccountOptions {
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'admin' | 'manager';
  parentUserId: string; // 主账号ID
}

export class SubAccountManager {
  /**
   * 获取公司的子账号配额信息
   * 根据套餐计算可用的管理员账号数量
   * 免费版：1个主账号
   * 基础版：1主+每15人1子
   * 专业版：1主+每12人1子
   * 企业版：1主+每10人1子
   */
  async getSubAccountQuota(companyId: string): Promise<SubAccountQuota> {
    const db = await getDb();

    // 获取公司信息
    const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
    if (!company) {
      throw new Error('公司不存在');
    }

    // 获取当前的管理员账号数（包括主账号和子账号）
    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.companyId, companyId),
        eq(users.isActive, true)
      ));

    const currentAccounts = Number(adminCount.count);

    // 根据套餐计算最大管理员账号数
    let maxAccounts = 1; // 默认1个主账号（免费版）

    if (company.subscriptionTier === 'basic') {
      // 基础版：1主 + 每15人1子
      const employeesPerAccount = 15;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    } else if (company.subscriptionTier === 'professional') {
      // 专业版：1主 + 每12人1子
      const employeesPerAccount = 12;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    } else if (company.subscriptionTier === 'enterprise') {
      // 企业版：1主 + 每10人1子
      const employeesPerAccount = 10;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    }

    // 确保至少有1个主账号
    maxAccounts = Math.max(1, maxAccounts);

    return {
      currentAccounts,
      maxAccounts,
      availableAccounts: Math.max(0, maxAccounts - currentAccounts),
      canAdd: currentAccounts < maxAccounts,
    };
  }

  /**
   * 创建子账号
   */
  async createSubAccount(options: CreateSubAccountOptions): Promise<User> {
    const db = await getDb();

    // 验证主账号存在
    const [parentUser] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, options.parentUserId),
        eq(users.companyId, options.companyId),
        eq(users.isMainAccount, true),
        eq(users.isActive, true)
      ));

    if (!parentUser) {
      throw new Error('主账号不存在或权限不足');
    }

    // 检查子账号配额
    const quota = await this.getSubAccountQuota(options.companyId);
    if (!quota.canAdd) {
      throw new Error(`子账号数量已达上限（${quota.maxAccounts}个），请升级套餐`);
    }

    // 验证邮箱和手机号唯一性
    if (options.email) {
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, options.email));

      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }
    }

    if (options.phone) {
      const [existingPhone] = await db
        .select()
        .from(users)
        .where(eq(users.phone, options.phone));

      if (existingPhone) {
        throw new Error('手机号已被使用');
      }
    }

    // 创建子账号
    const userData: InsertUser = {
      companyId: options.companyId,
      name: options.name,
      email: options.email,
      phone: options.phone,
      password: options.password,
      role: options.role || 'admin',
      isMainAccount: false,
      parentUserId: options.parentUserId,
      isActive: true,
    };

    const [newUser] = await db.insert(users).values(userData).returning();

    return newUser;
  }

  /**
   * 获取公司的所有管理员账号（包括主账号和子账号）
   */
  async getAdminAccounts(companyId: string): Promise<User[]> {
    const db = await getDb();

    const accounts = await db
      .select()
      .from(users)
      .where(and(
        eq(users.companyId, companyId),
        eq(users.isActive, true)
      ))
      .orderBy(users.createdAt);

    return accounts;
  }

  /**
   * 获取主账号的所有子账号
   */
  async getSubAccountsByParent(parentUserId: string): Promise<User[]> {
    const db = await getDb();

    const subAccounts = await db
      .select()
      .from(users)
      .where(and(
        eq(users.parentUserId, parentUserId),
        eq(users.isActive, true)
      ))
      .orderBy(users.createdAt);

    return subAccounts;
  }

  /**
   * 停用子账号
   */
  async deactivateSubAccount(subAccountId: string, operatorId: string): Promise<User | null> {
    const db = await getDb();

    // 验证是否为子账号
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, subAccountId));

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.isMainAccount) {
      throw new Error('不能停用主账号');
    }

    // 停用账号
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, subAccountId))
      .returning();

    return updatedUser;
  }

  /**
   * 激活子账号
   */
  async activateSubAccount(subAccountId: string): Promise<User | null> {
    const db = await getDb();

    // 获取用户信息
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, subAccountId));

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.isMainAccount) {
      throw new Error('主账号状态不能修改');
    }

    // 检查配额
    if (user.isActive === false) {
      if (!user.companyId) {
        throw new Error('开发者账号不能激活');
      }
      const quota = await this.getSubAccountQuota(user.companyId);
      if (!quota.canAdd) {
        throw new Error(`子账号数量已达上限（${quota.maxAccounts}个），请升级套餐`);
      }
    }

    // 激活账号
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, subAccountId))
      .returning();

    return updatedUser;
  }

  /**
   * 重置子账号密码
   */
  async resetSubAccountPassword(
    subAccountId: string,
    newPassword: string
  ): Promise<User | null> {
    const db = await getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, subAccountId));

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.isMainAccount) {
      throw new Error('不能修改主账号密码');
    }

    const [updatedUser] = await db
      .update(users)
      .set({ password: newPassword, updatedAt: new Date() })
      .where(eq(users.id, subAccountId))
      .returning();

    return updatedUser;
  }

  /**
   * 根据套餐自动更新公司账号配额
   * 当套餐升级或员工数量变化时调用
   */
  async updateCompanyAccountQuota(companyId: string): Promise<SubAccountQuota> {
    const db = await getDb();

    // 获取公司信息
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) {
      throw new Error('公司不存在');
    }

    // 计算新的最大管理员账号数
    let maxAccounts = 1;

    if (company.subscriptionTier === 'basic') {
      const employeesPerAccount = 15;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    } else if (company.subscriptionTier === 'professional') {
      const employeesPerAccount = 12;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    } else if (company.subscriptionTier === 'enterprise') {
      const employeesPerAccount = 10;
      const additionalAccounts = Math.floor(company.maxEmployees / employeesPerAccount);
      maxAccounts = 1 + additionalAccounts;
    }

    maxAccounts = Math.max(1, maxAccounts);

    // 更新公司的最大管理员账号数
    await db
      .update(companies)
      .set({ maxAdminAccounts: maxAccounts, updatedAt: new Date() })
      .where(eq(companies.id, companyId));

    return this.getSubAccountQuota(companyId);
  }

  /**
   * 检查用户是否可以创建子账号
   */
  async canCreateSubAccount(userId: string): Promise<boolean> {
    const db = await getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return false;
    }

    if (!user.isMainAccount) {
      return false; // 只有主账号可以创建子账号
    }

    if (!user.companyId) {
      return false; // 开发者账号不能创建子账号
    }

    const quota = await this.getSubAccountQuota(user.companyId);
    return quota.canAdd;
  }
}

export const subAccountManager = new SubAccountManager();
