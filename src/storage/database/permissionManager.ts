import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { permissions, rolePermissions, insertPermissionSchema, insertRolePermissionSchema } from "./shared/schema";
import type { Permission, InsertPermission, RolePermission, InsertRolePermission } from "./shared/schema";

export class PermissionManager {
  // ========== 权限管理 ==========
  async createPermission(data: InsertPermission): Promise<Permission> {
    const db = await getDb();
    const validated = insertPermissionSchema.parse(data);
    const [permission] = await db.insert(permissions).values(validated).returning();
    return permission;
  }

  async getPermissions(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Permission, 'id' | 'code' | 'module' | 'isActive'>>;
  } = {}): Promise<Permission[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(permissions.id, filters.id));
    }
    if (filters.code !== undefined) {
      conditions.push(eq(permissions.code, filters.code));
    }
    if (filters.module !== undefined) {
      conditions.push(eq(permissions.module, filters.module));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(permissions.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db.select().from(permissions).where(and(...conditions)).limit(limit).offset(skip);
    }

    return db.select().from(permissions).limit(limit).offset(skip);
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    const db = await getDb();
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission || null;
  }

  async getPermissionByCode(code: string): Promise<Permission | null> {
    const db = await getDb();
    const [permission] = await db.select().from(permissions).where(eq(permissions.code, code));
    return permission || null;
  }

  async getActivePermissions(): Promise<Permission[]> {
    const db = await getDb();
    return db.select().from(permissions).where(eq(permissions.isActive, true));
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    const db = await getDb();
    return db
      .select()
      .from(permissions)
      .where(and(eq(permissions.module, module), eq(permissions.isActive, true)));
  }

  async updatePermission(id: string, data: Partial<InsertPermission>): Promise<Permission | null> {
    const db = await getDb();
    const [permission] = await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.id, id))
      .returning();
    return permission || null;
  }

  async deletePermission(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(permissions).where(eq(permissions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== 角色权限管理 ==========
  async assignPermissionToRole(role: string, permissionId: string): Promise<RolePermission> {
    const db = await getDb();
    const validated = insertRolePermissionSchema.parse({ roleId: role, permissionId, grantedBy: "system" });
    const [rolePermission] = await db.insert(rolePermissions).values(validated).returning();
    return rolePermission;
  }

  async removePermissionFromRole(role: string, permissionId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, role), eq(rolePermissions.permissionId, permissionId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getRolePermissions(role: string): Promise<Permission[]> {
    const db = await getDb();
    const result = await db
      .select({
        permission: permissions,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(eq(rolePermissions.roleId, role), eq(permissions.isActive, true)));

    return result.map(r => r.permission);
  }

  async hasPermission(role: string, permissionCode: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(rolePermissions.roleId, role),
          eq(permissions.code, permissionCode),
          eq(permissions.isActive, true)
        )
      );

    return result.length > 0;
  }

  async batchAssignPermissionsToRole(role: string, permissionIds: string[]): Promise<void> {
    const db = await getDb();
    const values = permissionIds.map(permissionId => ({ roleId: role, permissionId, grantedBy: "system" }));
    await db.insert(rolePermissions).values(values).onConflictDoNothing();
  }

  async batchRemovePermissionsFromRole(role: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(rolePermissions).where(eq(rolePermissions.roleId, role));
    return (result.rowCount ?? 0) > 0;
  }
}

export const permissionManager = new PermissionManager();
