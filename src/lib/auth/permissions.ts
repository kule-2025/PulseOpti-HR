import { permissionManager } from '@/storage/database/permissionManager';
import { NextResponse } from 'next/server';
import type { JWTPayload } from './jwt';
import { UserType } from '@/lib/services/accountManagementService';

/**
 * 角色定义
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  HR_ADMIN: 'hr_admin',
  HR_SPECIALIST: 'hr_specialist',
  EMPLOYEE: 'employee',
} as const;

/**
 * 账号类型定义
 */
export const USER_TYPES = {
  MAIN_ACCOUNT: 'main_account', // 主账号
  SUB_ACCOUNT: 'sub_account',   // 子账号
  EMPLOYEE: 'employee',         // 员工号
  DEVELOPER: 'developer',       // 开发者账号
} as const;

/**
 * 权限代码定义
 */
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',

  // 账号管理（主账号专用）
  ACCOUNT_CREATE_SUB_ACCOUNT: 'account.create_sub_account',
  ACCOUNT_CREATE_EMPLOYEE: 'account.create_employee',
  ACCOUNT_DELETE_SUB_ACCOUNT: 'account.delete_sub_account',
  ACCOUNT_DELETE_EMPLOYEE: 'account.delete_employee',
  ACCOUNT_VIEW_QUOTA: 'account.view_quota',

  // 员工管理
  EMPLOYEE_VIEW: 'employee.view',
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_EDIT: 'employee.edit',
  EMPLOYEE_DELETE: 'employee.delete',
  EMPLOYEE_VIEW_SELF: 'employee.view_self',

  // 部门管理
  DEPARTMENT_VIEW: 'department.view',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_EDIT: 'department.edit',
  DEPARTMENT_DELETE: 'department.delete',

  // 职位管理
  POSITION_VIEW: 'position.view',
  POSITION_CREATE: 'position.create',
  POSITION_EDIT: 'position.edit',
  POSITION_DELETE: 'position.delete',

  // 招聘管理
  RECRUITMENT_VIEW: 'recruitment.view',
  RECRUITMENT_CREATE: 'recruitment.create',
  RECRUITMENT_EDIT: 'recruitment.edit',
  RECRUITMENT_DELETE: 'recruitment.delete',
  RECRUITMENT_APPROVE: 'recruitment.approve',
  JOB_CREATE: 'job.create',
  CANDIDATE_CREATE: 'candidate.create',
  INTERVIEW_SCHEDULE: 'interview.schedule',
  OFFER_CREATE: 'offer.create',
  OFFER_MANAGE: 'offer.manage',

  // 绩效管理
  PERFORMANCE_VIEW: 'performance.view',
  PERFORMANCE_CREATE: 'performance.create',
  PERFORMANCE_EDIT: 'performance.edit',
  PERFORMANCE_DELETE: 'performance.delete',
  PERFORMANCE_REVIEW: 'performance.review',
  PERFORMANCE_APPROVE: 'performance.approve',
  PERFORMANCE_MANAGE: 'performance.manage',

  // 培训管理
  TRAINING_MANAGE: 'training.manage',

  // 离职管理
  RESIGNATION_MANAGE: 'resignation.manage',

  // 合规管理
  CONTRACT_MANAGE: 'contract.manage',

  // 订阅管理
  SUBSCRIPTION_VIEW: 'subscription.view',
  SUBSCRIPTION_MANAGE: 'subscription.manage',

  // 考勤管理
  ATTENDANCE_VIEW: 'attendance.view',
  LEAVE_MANAGE: 'leave.manage',
  LEAVE_APPROVE: 'leave.approve',
  OVERTIME_MANAGE: 'overtime.manage',
  OVERTIME_APPROVE: 'overtime.approve',
  SCHEDULE_MANAGE: 'schedule.manage',

  // 薪酬管理
  COMPENSATION_VIEW: 'compensation.view',
  PAYROLL_MANAGE: 'payroll.manage',

  // 报表查看
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  // 系统设置
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  // 工作流管理
  WORKFLOW_VIEW: 'workflow.view',
  WORKFLOW_MANAGE: 'workflow.manage',
  WORKFLOW_APPROVE: 'workflow.approve',

  // 实时连接
  CONNECTION_SEND_MESSAGE: 'connection.send_message',
  CONNECTION_ASSIGN_TASK: 'connection.assign_task',
  CONNECTION_SYNC_STATUS: 'connection.sync_status',

  // 运维监控（开发者专用）
  DEVELOPER_VIEW_ORDERS: 'developer.view_orders',
  DEVELOPER_MANAGE_ORDERS: 'developer.manage_orders',
  DEVELOPER_EXECUTE_MAINTENANCE: 'developer.execute_maintenance',
  DEVELOPER_VIEW_LOGS: 'developer.view_logs',
  DEVELOPER_PROCESS_REFUND: 'developer.process_refund',
} as const;

/**
 * 账号类型权限映射
 */
export const USER_TYPE_PERMISSIONS: Record<string, string[]> = {
  [USER_TYPES.MAIN_ACCOUNT]: [
    // 企业设置
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.SUBSCRIPTION_MANAGE,

    // 账号管理
    PERMISSIONS.ACCOUNT_CREATE_SUB_ACCOUNT,
    PERMISSIONS.ACCOUNT_CREATE_EMPLOYEE,
    PERMISSIONS.ACCOUNT_DELETE_SUB_ACCOUNT,
    PERMISSIONS.ACCOUNT_DELETE_EMPLOYEE,
    PERMISSIONS.ACCOUNT_VIEW_QUOTA,

    // 员工管理
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.EMPLOYEE_DELETE,

    // 部门管理
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_CREATE,
    PERMISSIONS.DEPARTMENT_EDIT,
    PERMISSIONS.DEPARTMENT_DELETE,

    // 职位管理
    PERMISSIONS.POSITION_VIEW,
    PERMISSIONS.POSITION_CREATE,
    PERMISSIONS.POSITION_EDIT,
    PERMISSIONS.POSITION_DELETE,

    // 招聘管理
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_DELETE,
    PERMISSIONS.RECRUITMENT_APPROVE,

    // 绩效管理
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_REVIEW,
    PERMISSIONS.PERFORMANCE_APPROVE,

    // 考勤管理
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.OVERTIME_MANAGE,
    PERMISSIONS.OVERTIME_APPROVE,

    // 薪酬管理
    PERMISSIONS.COMPENSATION_VIEW,
    PERMISSIONS.PAYROLL_MANAGE,

    // 报表查看
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,

    // 工作流管理
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_MANAGE,
    PERMISSIONS.WORKFLOW_APPROVE,

    // 实时连接
    PERMISSIONS.CONNECTION_SEND_MESSAGE,
    PERMISSIONS.CONNECTION_ASSIGN_TASK,
    PERMISSIONS.CONNECTION_SYNC_STATUS,
  ],

  [USER_TYPES.SUB_ACCOUNT]: [
    // 员工管理（仅部门）
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,

    // 部门管理（仅部门）
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_CREATE,
    PERMISSIONS.DEPARTMENT_EDIT,

    // 职位管理
    PERMISSIONS.POSITION_VIEW,
    PERMISSIONS.POSITION_CREATE,
    PERMISSIONS.POSITION_EDIT,

    // 招聘管理
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_APPROVE,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.CANDIDATE_CREATE,
    PERMISSIONS.INTERVIEW_SCHEDULE,
    PERMISSIONS.OFFER_CREATE,
    PERMISSIONS.OFFER_MANAGE,

    // 绩效管理
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_REVIEW,
    PERMISSIONS.PERFORMANCE_MANAGE,

    // 考勤管理
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.OVERTIME_MANAGE,
    PERMISSIONS.OVERTIME_APPROVE,

    // 报表查看
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,

    // 工作流管理
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_MANAGE,

    // 实时连接
    PERMISSIONS.CONNECTION_SEND_MESSAGE,
    PERMISSIONS.CONNECTION_ASSIGN_TASK,
    PERMISSIONS.CONNECTION_SYNC_STATUS,
  ],

  [USER_TYPES.EMPLOYEE]: [
    // 查看自己的信息
    PERMISSIONS.EMPLOYEE_VIEW_SELF,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.CONNECTION_SEND_MESSAGE,
  ],

  [USER_TYPES.DEVELOPER]: [
    // 运维监控权限
    PERMISSIONS.DEVELOPER_VIEW_ORDERS,
    PERMISSIONS.DEVELOPER_MANAGE_ORDERS,
    PERMISSIONS.DEVELOPER_EXECUTE_MAINTENANCE,
    PERMISSIONS.DEVELOPER_VIEW_LOGS,
    PERMISSIONS.DEVELOPER_PROCESS_REFUND,
  ],
};

/**
 * 角色权限映射（默认权限配置，用于向后兼容）
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // 超级管理员拥有所有权限
  [ROLES.OWNER]: USER_TYPE_PERMISSIONS[USER_TYPES.MAIN_ACCOUNT],
  [ROLES.HR_ADMIN]: USER_TYPE_PERMISSIONS[USER_TYPES.SUB_ACCOUNT],
  [ROLES.HR_SPECIALIST]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.POSITION_VIEW,
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.REPORT_VIEW,
  ],
  [ROLES.EMPLOYEE]: USER_TYPE_PERMISSIONS[USER_TYPES.EMPLOYEE],
};

/**
 * 数据访问边界定义
 */
export interface DataAccessBoundary {
  canAccessAllCompanyData: boolean;    // 是否可访问公司所有数据
  canAccessDepartmentData: boolean;   // 是否可访问部门数据
  canAccessOwnDataOnly: boolean;      // 是否只能访问自己的数据
  canAccessSystemData: boolean;       // 是否可访问系统级数据（运维）
  allowedDepartments?: string[];      // 允许访问的部门ID列表
}

/**
 * 根据账号类型获取数据访问边界
 */
export function getDataAccessBoundary(userType: string, role: string): DataAccessBoundary {
  switch (userType) {
    case USER_TYPES.MAIN_ACCOUNT:
      return {
        canAccessAllCompanyData: true,
        canAccessDepartmentData: true,
        canAccessOwnDataOnly: false,
        canAccessSystemData: false,
      };

    case USER_TYPES.SUB_ACCOUNT:
      return {
        canAccessAllCompanyData: false,
        canAccessDepartmentData: true,
        canAccessOwnDataOnly: false,
        canAccessSystemData: false,
      };

    case USER_TYPES.EMPLOYEE:
      return {
        canAccessAllCompanyData: false,
        canAccessDepartmentData: false,
        canAccessOwnDataOnly: true,
        canAccessSystemData: false,
      };

    case USER_TYPES.DEVELOPER:
      return {
        canAccessAllCompanyData: false,
        canAccessDepartmentData: false,
        canAccessOwnDataOnly: false,
        canAccessSystemData: true,
      };

    default:
      throw new Error(`未知的账号类型: ${userType}`);
  }
}

/**
 * 检查用户是否具有指定权限（基于账号类型和角色）
 */
export async function hasPermission(user: JWTPayload, permissionCode: string): Promise<boolean> {
  // 超级管理员拥有所有权限
  if (user.isSuperAdmin || user.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  // 开发者账号只检查运维相关权限
  if (user.userType === USER_TYPES.DEVELOPER) {
    const developerPermissions = USER_TYPE_PERMISSIONS[USER_TYPES.DEVELOPER];
    return developerPermissions.includes(permissionCode);
  }

  // 企业账号检查账号类型权限
  if (user.userType && USER_TYPE_PERMISSIONS[user.userType]) {
    const typePermissions = USER_TYPE_PERMISSIONS[user.userType];
    return typePermissions.includes(permissionCode);
  }

  // 角色权限（向后兼容）
  if (user.role && ROLE_PERMISSIONS[user.role]) {
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions.includes(permissionCode);
  }

  // 从数据库查询权限
  return await permissionManager.hasPermission(user.role, permissionCode);
}

/**
 * 检查用户是否具有任意一个权限
 */
export async function hasAnyPermission(user: JWTPayload, permissionCodes: string[]): Promise<boolean> {
  for (const code of permissionCodes) {
    if (await hasPermission(user, code)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查用户是否具有所有权限
 */
export async function hasAllPermissions(user: JWTPayload, permissionCodes: string[]): Promise<boolean> {
  for (const code of permissionCodes) {
    if (!(await hasPermission(user, code))) {
      return false;
    }
  }
  return true;
}

/**
 * 检查用户是否可以访问指定数据
 * @param user 用户信息
 * @param resourceCompanyId 资源所属企业ID
 * @param resourceOwnerId 资源所有者ID（可选）
 * @param resourceDepartmentId 资源所属部门ID（可选）
 */
export function canAccessData(
  user: JWTPayload,
  resourceCompanyId: string,
  resourceOwnerId?: string,
  resourceDepartmentId?: string
): boolean {
  // 开发者账号不能访问企业数据
  if (user.userType === USER_TYPES.DEVELOPER) {
    return false;
  }

  // 主账号可以访问公司内所有数据
  if (user.userType === USER_TYPES.MAIN_ACCOUNT) {
    return user.companyId === resourceCompanyId;
  }

  // 员工号只能访问自己的数据
  if (user.userType === USER_TYPES.EMPLOYEE) {
    return user.companyId === resourceCompanyId && user.userId === resourceOwnerId;
  }

  // 子账号可以访问部门内数据
  if (user.userType === USER_TYPES.SUB_ACCOUNT) {
    if (user.companyId !== resourceCompanyId) {
      return false;
    }
    // 如果资源属于该账号，可以访问
    if (resourceOwnerId === user.userId) {
      return true;
    }
    // 如果资源属于该账号管理的部门，可以访问
    // 这里需要根据实际情况实现部门关系判断
    return true;
  }

  return false;
}

/**
 * 未授权响应
 */
export function unauthorized(message: string = '未授权，请先登录'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

/**
 * 权限不足响应
 */
export function permissionDenied(message: string = '权限不足'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}
