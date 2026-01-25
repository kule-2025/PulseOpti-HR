import { permissionManager } from '@/storage/database/permissionManager';
import { NextResponse } from 'next/server';
import type { JWTPayload } from './jwt';

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
 * 权限代码定义
 */
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',

  // 员工管理
  EMPLOYEE_VIEW: 'employee.view',
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_EDIT: 'employee.edit',
  EMPLOYEE_DELETE: 'employee.delete',

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
} as const;

/**
 * 角色权限映射（默认权限配置）
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // 超级管理员拥有所有权限
  [ROLES.OWNER]: [
    // 企业主拥有大部分权限，除了删除
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_CREATE,
    PERMISSIONS.DEPARTMENT_EDIT,
    PERMISSIONS.POSITION_VIEW,
    PERMISSIONS.POSITION_CREATE,
    PERMISSIONS.POSITION_EDIT,
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_APPROVE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_REVIEW,
    PERMISSIONS.PERFORMANCE_APPROVE,
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_MANAGE,
    PERMISSIONS.WORKFLOW_APPROVE,
  ],
  [ROLES.HR_ADMIN]: [
    // HR管理员拥有人事和招聘相关权限
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_CREATE,
    PERMISSIONS.DEPARTMENT_EDIT,
    PERMISSIONS.POSITION_VIEW,
    PERMISSIONS.POSITION_CREATE,
    PERMISSIONS.POSITION_EDIT,
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_APPROVE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_REVIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_MANAGE,
  ],
  [ROLES.HR_SPECIALIST]: [
    // HR专员拥有基础查看和编辑权限
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
  [ROLES.EMPLOYEE]: [
    // 员工只能查看自己的信息
    PERMISSIONS.REPORT_VIEW,
  ],
};

/**
 * 检查用户是否具有指定权限
 */
export async function hasPermission(role: string, permissionCode: string): Promise<boolean> {
  // 超级管理员拥有所有权限
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }

  // 从数据库查询权限
  return await permissionManager.hasPermission(role, permissionCode);
}

/**
 * 检查用户是否具有任意一个权限
 */
export async function hasAnyPermission(role: string, permissionCodes: string[]): Promise<boolean> {
  // 超级管理员拥有所有权限
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }

  for (const code of permissionCodes) {
    if (await hasPermission(role, code)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查用户是否具有所有权限
 */
export async function hasAllPermissions(role: string, permissionCodes: string[]): Promise<boolean> {
  // 超级管理员拥有所有权限
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }

  for (const code of permissionCodes) {
    if (!(await hasPermission(role, code))) {
      return false;
    }
  }
  return true;
}

/**
 * 返回权限不足错误
 */
export function permissionDenied() {
  return NextResponse.json(
    { error: '权限不足', code: 'PERMISSION_DENIED' },
    { status: 403 }
  );
}

/**
 * 返回未认证错误
 */
export function unauthorized() {
  return NextResponse.json(
    { error: '未认证', code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}
