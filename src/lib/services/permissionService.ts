/**
 * 权限精细化控制服务
 * 支持角色级、字段级、操作级、数据范围级权限检查
 */

import { getDb } from "@/lib/db";
import {
  customRoles,
  rolePermissions,
  customPermissions,
  userRoles,
  fieldPermissions,
  operationPermissions,
  dataScopePermissions,
} from "@/storage/database/shared/schema";
import { eq, and, or, sql, inArray } from "drizzle-orm";
import type { JWTPayload } from "@/lib/auth/jwt";

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

/**
 * 数据范围类型
 */
export enum DataScopeType {
  ALL = "all", // 全部数据
  DEPARTMENT = "department", // 本部门数据
  SELF = "self", // 本人数据
  CUSTOM = "custom", // 自定义范围
}

/**
 * 字段权限类型
 */
export enum FieldPermissionType {
  VIEW = "view", // 可查看
  EDIT = "edit", // 可编辑
  HIDE = "hide", // 隐藏
}

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 检查用户是否有指定权限
   */
  static async hasPermission(
    userId: string,
    companyId: string,
    permissionCode: string
  ): Promise<boolean> {
    try {
      const db = await getDb();

      // 获取用户的角色
      const userRoleList = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.companyId, companyId)));

      if (userRoleList.length === 0) {
        return false;
      }

      const roleIds = userRoleList.map(ur => ur.roleId);

      // 检查角色是否有该权限
      const permissions = await db
        .select()
        .from(rolePermissions)
        .innerJoin(customPermissions, eq(rolePermissions.permissionId, customPermissions.id))
        .where(
          and(
            inArray(rolePermissions.roleId, roleIds),
            eq(customPermissions.code, permissionCode),
            eq(customPermissions.isActive, true)
          )
        );

      return permissions.length > 0;
    } catch (error) {
      console.error("检查权限失败:", error);
      return false;
    }
  }

  /**
   * 检查用户是否有指定操作权限
   */
  static async hasOperationPermission(
    userId: string,
    companyId: string,
    module: string,
    operation: string
  ): Promise<PermissionCheckResult> {
    try {
      const db = await getDb();

      // 获取用户的角色
      const userRoleList = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.companyId, companyId)));

      if (userRoleList.length === 0) {
        return { hasPermission: false, reason: "用户未分配角色" };
      }

      const roleIds = userRoleList.map(ur => ur.roleId);

      // 检查操作权限
      const opPermissions = await db
        .select()
        .from(operationPermissions)
        .where(
          and(
            eq(operationPermissions.companyId, companyId),
            inArray(operationPermissions.roleId, roleIds),
            eq(operationPermissions.module, module),
            eq(operationPermissions.operation, operation)
          )
        );

      // 如果没有配置操作权限，默认允许
      if (opPermissions.length === 0) {
        return { hasPermission: true };
      }

      // 检查是否有允许的权限
      const allowed = opPermissions.some(p => p.allowed);
      return {
        hasPermission: allowed,
        reason: allowed ? undefined : "操作权限被禁止",
      };
    } catch (error) {
      console.error("检查操作权限失败:", error);
      return { hasPermission: false, reason: "权限检查失败" };
    }
  }

  /**
   * 检查用户是否有字段权限
   */
  static async hasFieldPermission(
    userId: string,
    companyId: string,
    module: string,
    tableName: string,
    fieldName: string,
    permissionType: FieldPermissionType
  ): Promise<boolean> {
    try {
      const db = await getDb();

      // 获取用户的角色
      const userRoleList = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.companyId, companyId)));

      if (userRoleList.length === 0) {
        return false;
      }

      const roleIds = userRoleList.map(ur => ur.roleId);

      // 检查字段权限（先检查角色级别的权限）
      const roleFieldPermissions = await db
        .select()
        .from(fieldPermissions)
        .where(
          and(
            eq(fieldPermissions.companyId, companyId),
            inArray(fieldPermissions.roleId, roleIds),
            eq(fieldPermissions.module, module),
            eq(fieldPermissions.tableName, tableName),
            eq(fieldPermissions.fieldName, fieldName)
          )
        );

      // 如果有角色级别的权限配置
      if (roleFieldPermissions.length > 0) {
        const permission = roleFieldPermissions[0];
        if (permission.permission === "hide") {
          return false;
        }
        if (permission.permission === "view" && permissionType === FieldPermissionType.EDIT) {
          return false;
        }
        return true;
      }

      // 检查全局级别的字段权限
      const globalFieldPermissions = await db
        .select()
        .from(fieldPermissions)
        .where(
          and(
            eq(fieldPermissions.companyId, companyId),
            sql`${fieldPermissions.roleId} IS NULL`,
            eq(fieldPermissions.module, module),
            eq(fieldPermissions.tableName, tableName),
            eq(fieldPermissions.fieldName, fieldName)
          )
        );

      // 如果有全局级别的权限配置
      if (globalFieldPermissions.length > 0) {
        const permission = globalFieldPermissions[0];
        if (permission.permission === "hide") {
          return false;
        }
        if (permission.permission === "view" && permissionType === FieldPermissionType.EDIT) {
          return false;
        }
        return true;
      }

      // 默认允许
      return true;
    } catch (error) {
      console.error("检查字段权限失败:", error);
      return true; // 默认允许
    }
  }

  /**
   * 获取用户的数据范围
   */
  static async getDataScope(
    userId: string,
    companyId: string,
    module: string
  ): Promise<{ scopeType: DataScopeType; scopeValue: any }> {
    try {
      const db = await getDb();

      // 获取用户的角色
      const userRoleList = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.companyId, companyId)));

      if (userRoleList.length === 0) {
        return { scopeType: DataScopeType.SELF, scopeValue: {} };
      }

      const roleIds = userRoleList.map(ur => ur.roleId);

      // 检查数据范围权限
      const dataScopes = await db
        .select()
        .from(dataScopePermissions)
        .where(
          and(
            eq(dataScopePermissions.companyId, companyId),
            inArray(dataScopePermissions.roleId, roleIds),
            eq(dataScopePermissions.module, module)
          )
        );

      // 如果有配置数据范围
      if (dataScopes.length > 0) {
        const scope = dataScopes[0];
        return {
          scopeType: scope.scopeType as DataScopeType,
          scopeValue: scope.scopeValue || {},
        };
      }

      // 默认返回本人数据
      return { scopeType: DataScopeType.SELF, scopeValue: {} };
    } catch (error) {
      console.error("获取数据范围失败:", error);
      return { scopeType: DataScopeType.SELF, scopeValue: {} };
    }
  }

  /**
   * 获取用户的所有角色
   */
  static async getUserRoles(userId: string, companyId: string) {
    try {
      const db = await getDb();

      const roles = await db
        .select({
          id: customRoles.id,
          name: customRoles.name,
          code: customRoles.code,
          level: customRoles.level,
          isPrimary: userRoles.isPrimary,
        })
        .from(userRoles)
        .innerJoin(customRoles, eq(userRoles.roleId, customRoles.id))
        .where(and(eq(userRoles.userId, userId), eq(userRoles.companyId, companyId)));

      return roles;
    } catch (error) {
      console.error("获取用户角色失败:", error);
      return [];
    }
  }

  /**
   * 检查用户是否有任意一个角色
   */
  static async hasAnyRole(userId: string, companyId: string, roleCodes: string[]): Promise<boolean> {
    try {
      const db = await getDb();

      const roles = await db
        .select()
        .from(userRoles)
        .innerJoin(customRoles, eq(userRoles.roleId, customRoles.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.companyId, companyId),
            inArray(customRoles.code, roleCodes)
          )
        );

      return roles.length > 0;
    } catch (error) {
      console.error("检查角色失败:", error);
      return false;
    }
  }

  /**
   * 检查用户是否有全部角色（AND条件）
   */
  static async hasAllRoles(userId: string, companyId: string, roleCodes: string[]): Promise<boolean> {
    try {
      const db = await getDb();

      const roles = await db
        .select()
        .from(userRoles)
        .innerJoin(customRoles, eq(userRoles.roleId, customRoles.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.companyId, companyId),
            inArray(customRoles.code, roleCodes)
          )
        );

      return roles.length === roleCodes.length;
    } catch (error) {
      console.error("检查角色失败:", error);
      return false;
    }
  }
}

/**
 * 权限装饰器（用于API路由）
 */
export function requirePermission(permissionCode: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (request: Request, ...args: any[]) {
      // 这里需要从request中获取用户信息
      // 具体实现需要根据实际情况调整
      console.warn("权限装饰器尚未完全实现，请使用PermissionService.hasPermission()手动检查");
      return originalMethod.apply(this, [request, ...args]);
    };

    return descriptor;
  };
}
