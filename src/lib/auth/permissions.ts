/**
 * 权限管理系统
 * 实现多租户、多层级权限控制
 */

import { cookies } from 'next/headers';

// ==================== 权限定义 ====================

export enum Role {
  SUPER_ADMIN = 'super_admin',     // 超级管理员（系统级）
  ADMIN = 'admin',                 // 管理员（企业级）
  MANAGER = 'manager',             // 经理（部门级）
  EMPLOYEE = 'employee',           // 员工（个人级）
}

export enum UserType {
  MAIN_ACCOUNT = 'main_account',   // 主账号（企业负责人）
  SUB_ACCOUNT = 'sub_account',     // 子账号（企业管理员）
  EMPLOYEE = 'employee',           // 普通员工账号
  DEVELOPER = 'developer',         // 开发运维账号（系统级）
}

export enum Permission {
  // 企业管理权限
  MANAGE_COMPANY = 'manage_company',
  MANAGE_SUBSCRIPTION = 'manage_subscription',
  MANAGE_SETTINGS = 'manage_settings',

  // 用户管理权限
  MANAGE_USERS = 'manage_users',
  MANAGE_SUB_ACCOUNTS = 'manage_sub_accounts',
  MANAGE_EMPLOYEES = 'manage_employees',

  // 组织架构权限
  MANAGE_DEPARTMENTS = 'manage_departments',
  MANAGE_POSITIONS = 'manage_positions',

  // 人事管理权限
  MANAGE_RECRUITMENT = 'manage_recruitment',
  MANAGE_TRAINING = 'manage_training',
  MANAGE_PERFORMANCE = 'manage_performance',
  MANAGE_ATTENDANCE = 'manage_attendance',
  MANAGE_SALARY = 'manage_salary',

  // 查看权限
  VIEW_ALL_DATA = 'view_all_data',
  VIEW_DEPARTMENT_DATA = 'view_department_data',
  VIEW_SELF_DATA = 'view_self_data',

  // 系统管理权限
  SYSTEM_ADMIN = 'system_admin',
  SYSTEM_MONITORING = 'system_monitoring',

  // 账号管理
  ACCOUNT_CREATE_SUB_ACCOUNT = 'account.create_sub_account',
  ACCOUNT_VIEW_QUOTA = 'account.view_quota',

  // 工作流
  WORKFLOW_MANAGE = 'workflow.manage',

  // 其他兼容性权限（从旧的权限系统迁移）
  EMPLOYEE_EDIT = 'employee.edit',
  EMPLOYEE_READ = 'employee.read',
  RECRUITMENT_EDIT = 'recruitment.edit',
  RECRUITMENT_APPROVE = 'recruitment.approve',
  PAYROLL_MANAGE = 'payroll.manage',
  CONTRACT_MANAGE = 'contract.manage',
  OVERTIME_APPROVE = 'overtime.approve',
  RESIGNATION_MANAGE = 'resignation.manage',
  TRAINING_MANAGE = 'training.manage',
  CANDIDATE_CREATE = 'candidate.create',
  INTERVIEW_SCHEDULE = 'interview.schedule',
  JOB_CREATE = 'job.create',
  OFFER_CREATE = 'offer.create',
  OFFER_MANAGE = 'offer.manage',
  SCHEDULE_MANAGE = 'schedule.manage',
}

// ==================== PERMISSIONS 对象导出（用于向后兼容） ====================

export const PERMISSIONS = {
  // 企业管理
  MANAGE_COMPANY: Permission.MANAGE_COMPANY,
  MANAGE_SUBSCRIPTION: Permission.MANAGE_SUBSCRIPTION,
  MANAGE_SETTINGS: Permission.MANAGE_SETTINGS,

  // 用户管理
  MANAGE_USERS: Permission.MANAGE_USERS,
  MANAGE_SUB_ACCOUNTS: Permission.MANAGE_SUB_ACCOUNTS,
  MANAGE_EMPLOYEES: Permission.MANAGE_EMPLOYEES,

  // 组织架构
  MANAGE_DEPARTMENTS: Permission.MANAGE_DEPARTMENTS,
  MANAGE_POSITIONS: Permission.MANAGE_POSITIONS,

  // 人事管理
  MANAGE_RECRUITMENT: Permission.MANAGE_RECRUITMENT,
  MANAGE_TRAINING: Permission.MANAGE_TRAINING,
  MANAGE_PERFORMANCE: Permission.MANAGE_PERFORMANCE,
  MANAGE_ATTENDANCE: Permission.MANAGE_ATTENDANCE,
  MANAGE_SALARY: Permission.MANAGE_SALARY,

  // 查看权限
  VIEW_ALL_DATA: Permission.VIEW_ALL_DATA,
  VIEW_DEPARTMENT_DATA: Permission.VIEW_DEPARTMENT_DATA,
  VIEW_SELF_DATA: Permission.VIEW_SELF_DATA,

  // 系统管理
  SYSTEM_ADMIN: Permission.SYSTEM_ADMIN,
  SYSTEM_MONITORING: Permission.SYSTEM_MONITORING,

  // 账号管理
  ACCOUNT_CREATE_SUB_ACCOUNT: Permission.ACCOUNT_CREATE_SUB_ACCOUNT,
  ACCOUNT_VIEW_QUOTA: Permission.ACCOUNT_VIEW_QUOTA,

  // 工作流
  WORKFLOW_MANAGE: Permission.WORKFLOW_MANAGE,

  // 其他兼容性权限
  EMPLOYEE_EDIT: Permission.EMPLOYEE_EDIT,
  EMPLOYEE_READ: Permission.EMPLOYEE_READ,
  RECRUITMENT_EDIT: Permission.RECRUITMENT_EDIT,
  RECRUITMENT_APPROVE: Permission.RECRUITMENT_APPROVE,
  PAYROLL_MANAGE: Permission.PAYROLL_MANAGE,
  CONTRACT_MANAGE: Permission.CONTRACT_MANAGE,
  OVERTIME_APPROVE: Permission.OVERTIME_APPROVE,
  RESIGNATION_MANAGE: Permission.RESIGNATION_MANAGE,
  TRAINING_MANAGE: Permission.TRAINING_MANAGE,
  CANDIDATE_CREATE: Permission.CANDIDATE_CREATE,
  INTERVIEW_SCHEDULE: Permission.INTERVIEW_SCHEDULE,
  JOB_CREATE: Permission.JOB_CREATE,
  OFFER_CREATE: Permission.OFFER_CREATE,
  OFFER_MANAGE: Permission.OFFER_MANAGE,
  SCHEDULE_MANAGE: Permission.SCHEDULE_MANAGE,
};

// ==================== USER_TYPES 对象导出（用于向后兼容） ====================

export const USER_TYPES = {
  MAIN_ACCOUNT: UserType.MAIN_ACCOUNT,
  SUB_ACCOUNT: UserType.SUB_ACCOUNT,
  EMPLOYEE: UserType.EMPLOYEE,
  DEVELOPER: UserType.DEVELOPER,
};

// ==================== 角色权限映射 ====================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // 超级管理员拥有所有权限
  [Role.ADMIN]: [
    // 企业管理
    Permission.MANAGE_COMPANY,
    Permission.MANAGE_SUBSCRIPTION,
    Permission.MANAGE_SETTINGS,
    // 用户管理
    Permission.MANAGE_USERS,
    Permission.MANAGE_SUB_ACCOUNTS,
    Permission.MANAGE_EMPLOYEES,
    // 组织架构
    Permission.MANAGE_DEPARTMENTS,
    Permission.MANAGE_POSITIONS,
    // 人事管理
    Permission.MANAGE_RECRUITMENT,
    Permission.MANAGE_TRAINING,
    Permission.MANAGE_PERFORMANCE,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_SALARY,
    // 查看权限
    Permission.VIEW_ALL_DATA,
  ],
  [Role.MANAGER]: [
    // 组织架构
    Permission.MANAGE_DEPARTMENTS,
    // 人事管理
    Permission.MANAGE_RECRUITMENT,
    Permission.MANAGE_TRAINING,
    Permission.MANAGE_PERFORMANCE,
    Permission.MANAGE_ATTENDANCE,
    // 查看权限
    Permission.VIEW_DEPARTMENT_DATA,
  ],
  [Role.EMPLOYEE]: [
    // 查看权限
    Permission.VIEW_SELF_DATA,
  ],
};

// ==================== 用户类型权限映射 ====================

const USER_TYPE_PERMISSIONS: Record<UserType, Permission[]> = {
  [UserType.MAIN_ACCOUNT]: [
    Permission.MANAGE_COMPANY,
    Permission.MANAGE_SUBSCRIPTION,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SUB_ACCOUNTS,
    Permission.MANAGE_EMPLOYEES,
  ],
  [UserType.SUB_ACCOUNT]: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_EMPLOYEES,
  ],
  [UserType.EMPLOYEE]: [
    Permission.VIEW_SELF_DATA,
  ],
  [UserType.DEVELOPER]: [
    Permission.SYSTEM_ADMIN,
    Permission.SYSTEM_MONITORING,
    Permission.MANAGE_COMPANY,
  ],
};

// ==================== 用户信息接口 ====================

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  userType: UserType;
  isSuperAdmin: boolean;
  companyId?: string;
  parentUserId?: string;
  permissions: Permission[];
  metadata?: any;
}

// ==================== 权限验证函数 ====================

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * 检查用户是否有任意一个权限
 */
export function hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.every(p => user.permissions.includes(p));
}

/**
 * 检查用户是否可以访问指定公司的数据
 */
export function canAccessCompany(user: AuthUser, companyId: string): boolean {
  // 超级管理员可以访问所有公司
  if (user.isSuperAdmin) {
    return true;
  }

  // 开发运维账号可以访问所有公司（用于调试）
  if (user.userType === UserType.DEVELOPER) {
    return true;
  }

  // 其他用户只能访问自己的公司
  return user.companyId === companyId;
}

/**
 * 获取用户的数据访问范围
 */
export function getDataAccessScope(user: AuthUser): 'all' | 'company' | 'department' | 'self' {
  if (user.isSuperAdmin || user.userType === UserType.DEVELOPER) {
    return 'all';
  }

  if (user.role === Role.ADMIN || user.userType === UserType.MAIN_ACCOUNT) {
    return 'company';
  }

  if (user.role === Role.MANAGER) {
    return 'department';
  }

  return 'self';
}

// ==================== 从请求中获取用户信息 ====================

/**
 * 从 Cookie 中解析 JWT token 并返回用户信息
 */
export async function getAuthUserFromRequest(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    // 简单解析 JWT（实际应该使用 jwt-verify）
    const payload = JSON.parse(atob(token.split('.')[1]));

    // 构建用户权限
    const role = payload.role as Role;
    const userType = payload.userType as UserType;

    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    const userTypePermissions = USER_TYPE_PERMISSIONS[userType] || [];

    const permissions = [...new Set([...rolePermissions, ...userTypePermissions])];

    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role,
      userType,
      isSuperAdmin: payload.isSuperAdmin || false,
      companyId: payload.companyId,
      parentUserId: payload.parentUserId,
      permissions,
      metadata: payload.metadata,
    };
  } catch (error) {
    console.error('[Auth] 解析 token 失败:', error);
    return null;
  }
}

/**
 * 验证用户是否已登录
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUserFromRequest();

  if (!user) {
    throw new Error('Unauthorized: 用户未登录');
  }

  return user;
}

/**
 * 验证用户是否有指定权限
 */
export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth();

  if (!hasPermission(user, permission)) {
    throw new Error('Forbidden: 权限不足');
  }

  return user;
}

/**
 * 验证用户是否可以访问指定公司
 */
export async function requireCompanyAccess(companyId: string): Promise<AuthUser> {
  const user = await requireAuth();

  if (!canAccessCompany(user, companyId)) {
    throw new Error('Forbidden: 无权访问该企业数据');
  }

  return user;
}

// ==================== API 辅助函数 ====================

/**
 * 获取数据查询条件（基于用户权限）
 */
export function getDataQueryCondition(user: AuthUser, companyColumn: string = 'company_id') {
  const scope = getDataAccessScope(user);

  switch (scope) {
    case 'all':
      return {}; // 超级管理员可以查询所有数据
    case 'company':
      return { [companyColumn]: user.companyId };
    case 'department':
      return {
        [companyColumn]: user.companyId,
        // TODO: 添加部门过滤逻辑
      };
    case 'self':
      return {
        [companyColumn]: user.companyId,
        userId: user.id,
      };
    default:
      return {};
  }
}
