/**
 * 企业数据隔离系统
 * 确保多租户数据安全隔离
 */

import { sql, and, eq, SQL } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { AuthUser, requireAuth, getDataAccessScope } from './permissions';

// ==================== 数据隔离辅助函数 ====================

/**
 * 添加数据隔离条件到查询中
 */
export function addDataIsolationCondition(
  user: AuthUser,
  table: any,
  companyColumn: string = 'company_id'
) {
  const scope = getDataAccessScope(user);

  switch (scope) {
    case 'all':
      // 超级管理员可以查询所有数据
      return undefined;
    case 'company':
      // 管理员只能查询自己公司的数据
      return eq(table[companyColumn], user.companyId!);
    case 'department':
      // 经理只能查询自己部门的数据
      return and(
        eq(table[companyColumn], user.companyId!),
        // TODO: 添加部门过滤逻辑
      );
    case 'self':
      // 员工只能查询自己的数据
      return and(
        eq(table[companyColumn], user.companyId!),
        eq(table.user_id, user.id),
      );
    default:
      return undefined;
  }
}

/**
 * 添加数据隔离条件到 SQL 查询中
 */
export function addDataIsolationConditionSQL(
  user: AuthUser,
  tableAlias: string = 't',
  companyColumn: string = 'company_id'
): SQL | undefined {
  const scope = getDataAccessScope(user);

  switch (scope) {
    case 'all':
      return undefined;
    case 'company':
      return sql`${sql.raw(tableAlias)}.${sql.raw(companyColumn)} = ${user.companyId}`;
    case 'department':
      return sql`${sql.raw(tableAlias)}.${sql.raw(companyColumn)} = ${user.companyId}`;
    case 'self':
      return sql`${sql.raw(tableAlias)}.${sql.raw(companyColumn)} = ${user.companyId} AND ${sql.raw(tableAlias)}.user_id = ${user.id}`;
    default:
      return undefined;
  }
}

// ==================== 数据操作辅助类 ====================

export class IsolatedDataAccess {
  private user: AuthUser;

  constructor(user: AuthUser) {
    this.user = user;
  }

  /**
   * 执行查询（自动添加数据隔离条件）
   */
  async query<T>(
    queryFn: (condition?: SQL) => Promise<T>
  ): Promise<T> {
    const db = getDb();

    // TODO: 自动添加数据隔离条件
    return queryFn();
  }

  /**
   * 执行插入（自动添加 companyId）
   */
  async insert(
    table: any,
    data: any
  ): Promise<any> {
    const db = getDb();

    // 自动添加 companyId
    if (this.user.companyId && !data.company_id) {
      data.company_id = this.user.companyId;
    }

    // 自动添加 created_by
    if (!data.created_by) {
      data.created_by = this.user.id;
    }

    return db.insert(table).values(data);
  }

  /**
   * 执行更新（自动添加数据隔离条件）
   */
  async update(
    table: any,
    data: any,
    condition: any
  ): Promise<any> {
    const db = getDb();

    // 自动添加数据隔离条件
    const isolationCondition = addDataIsolationCondition(this.user, table);
    const finalCondition = isolationCondition
      ? and(condition, isolationCondition)
      : condition;

    return db.update(table).set(data).where(finalCondition);
  }

  /**
   * 执行删除（自动添加数据隔离条件）
   */
  async delete(
    table: any,
    condition: any
  ): Promise<any> {
    const db = getDb();

    // 自动添加数据隔离条件
    const isolationCondition = addDataIsolationCondition(this.user, table);
    const finalCondition = isolationCondition
      ? and(condition, isolationCondition)
      : condition;

    return db.delete(table).where(finalCondition);
  }
}

/**
 * 创建数据访问实例
 */
export async function createIsolatedDataAccess(user?: AuthUser): Promise<IsolatedDataAccess> {
  const authUser = user || await requireAuth();
  return new IsolatedDataAccess(authUser);
}

// ==================== API 辅助函数 ====================

/**
 * 验证数据所有权
 */
export async function verifyDataOwnership(
  userId: string,
  companyId: string
): Promise<boolean> {
  const user = await requireAuth();

  // 超级管理员可以访问所有数据
  if (user.isSuperAdmin || user.userType === 'developer') {
    return true;
  }

  // 检查公司 ID 是否匹配
  if (user.companyId !== companyId) {
    return false;
  }

  // TODO: 根据角色检查用户是否有权访问该数据
  return true;
}

/**
 * 验证用户是否属于指定公司
 */
export async function verifyUserInCompany(companyId: string): Promise<boolean> {
  const user = await requireAuth();

  // 超级管理员可以访问所有公司
  if (user.isSuperAdmin || user.userType === 'developer') {
    return true;
  }

  return user.companyId === companyId;
}
