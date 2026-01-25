/**
 * 权限精细化控制服务
 * 支持自定义角色、字段级权限、操作级权限
 */

export type PermissionScope = 'all' | 'own' | 'department' | 'company';
export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';

export interface Permission {
  resource: string;
  action: string;
  level: PermissionLevel;
  scope: PermissionScope;
  fields?: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
  isDefault?: boolean;
}

export interface FieldPermission {
  resource: string;
  field: string;
  level: 'hidden' | 'read-only' | 'writable';
}

export class PermissionService {
  private roles: Map<string, Role> = new Map();
  private fieldPermissions: Map<string, FieldPermission[]> = new Map();

  constructor() {
    this.initDefaultRoles();
  }

  /**
   * 初始化默认角色
   */
  private initDefaultRoles() {
    // 超级管理员
    const superAdminRole: Role = {
      id: 'super-admin',
      name: '超级管理员',
      description: '拥有所有权限',
      permissions: [{ resource: '*', action: '*', level: 'admin', scope: 'all' }],
      isSystem: true,
    };

    // 企业管理员
    const companyAdminRole: Role = {
      id: 'company-admin',
      name: '企业管理员',
      description: '企业管理员，拥有企业内所有权限',
      permissions: this.buildCompanyAdminPermissions(),
      isSystem: true,
    };

    // HR经理
    const hrManagerRole: Role = {
      id: 'hr-manager',
      name: 'HR经理',
      description: 'HR经理，管理员工和招聘',
      permissions: this.buildHRManagerPermissions(),
      isSystem: true,
    };

    // 普通员工
    const employeeRole: Role = {
      id: 'employee',
      name: '普通员工',
      description: '普通员工，仅可查看自己的信息',
      permissions: this.buildEmployeePermissions(),
      isSystem: true,
      isDefault: true,
    };

    this.roles.set(superAdminRole.id, superAdminRole);
    this.roles.set(companyAdminRole.id, companyAdminRole);
    this.roles.set(hrManagerRole.id, hrManagerRole);
    this.roles.set(employeeRole.id, employeeRole);

    // 初始化字段权限
    this.initFieldPermissions();
  }

  /**
   * 构建企业管理员权限
   */
  private buildCompanyAdminPermissions(): Permission[] {
    return [
      { resource: 'employees', action: '*', level: 'admin', scope: 'company' },
      { resource: 'departments', action: '*', level: 'admin', scope: 'company' },
      { resource: 'positions', action: '*', level: 'admin', scope: 'company' },
      { resource: 'recruitment', action: '*', level: 'admin', scope: 'company' },
      { resource: 'performance', action: '*', level: 'admin', scope: 'company' },
      { resource: 'compensation', action: '*', level: 'admin', scope: 'company' },
      { resource: 'attendance', action: '*', level: 'admin', scope: 'company' },
      { resource: 'workflows', action: '*', level: 'admin', scope: 'company' },
      { resource: 'reports', action: '*', level: 'read', scope: 'company' },
      { resource: 'settings', action: '*', level: 'admin', scope: 'company' },
    ];
  }

  /**
   * 构建HR经理权限
   */
  private buildHRManagerPermissions(): Permission[] {
    return [
      { resource: 'employees', action: '*', level: 'write', scope: 'company' },
      { resource: 'departments', action: 'read', level: 'read', scope: 'company' },
      { resource: 'recruitment', action: '*', level: 'admin', scope: 'company' },
      { resource: 'performance', action: '*', level: 'write', scope: 'company' },
      { resource: 'compensation', action: 'read', level: 'read', scope: 'company' },
      { resource: 'attendance', action: '*', level: 'write', scope: 'company' },
      { resource: 'workflows', action: 'read', level: 'read', scope: 'company' },
      { resource: 'reports', action: '*', level: 'read', scope: 'company' },
    ];
  }

  /**
   * 构建普通员工权限
   */
  private buildEmployeePermissions(): Permission[] {
    return [
      { resource: 'employees', action: 'read', level: 'read', scope: 'own' },
      { resource: 'performance', action: 'read', level: 'read', scope: 'own' },
      { resource: 'compensation', action: 'read', level: 'read', scope: 'own' },
      { resource: 'attendance', action: 'read', level: 'read', scope: 'own' },
      { resource: 'workflows', action: 'read', level: 'read', scope: 'own' },
    ];
  }

  /**
   * 初始化字段权限
   */
  private initFieldPermissions() {
    // 员工字段权限
    this.fieldPermissions.set('employees', [
      { resource: 'employees', field: 'idCard', level: 'hidden' },
      { resource: 'employees', field: 'bankAccount', level: 'hidden' },
      { resource: 'employees', field: 'phone', level: 'read-only' },
      { resource: 'employees', field: 'email', level: 'read-only' },
      { resource: 'employees', field: 'salary', level: 'hidden' },
    ]);

    // 薪酬字段权限
    this.fieldPermissions.set('compensation', [
      { resource: 'compensation', field: 'basicSalary', level: 'hidden' },
      { resource: 'compensation', field: 'bonus', level: 'hidden' },
      { resource: 'compensation', field: 'deductions', level: 'hidden' },
    ]);
  }

  /**
   * 创建自定义角色
   */
  createRole(role: Omit<Role, 'id'>): Role {
    const id = `role-${Date.now()}`;
    const newRole: Role = {
      ...role,
      id,
      isSystem: false,
    };
    this.roles.set(id, newRole);
    return newRole;
  }

  /**
   * 更新角色
   */
  updateRole(id: string, updates: Partial<Role>): Role | null {
    const role = this.roles.get(id);
    if (!role) return null;

    // 系统角色不允许修改
    if (role.isSystem) {
      throw new Error('系统角色不允许修改');
    }

    const updatedRole = { ...role, ...updates };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  /**
   * 删除角色
   */
  deleteRole(id: string): boolean {
    const role = this.roles.get(id);
    if (!role) return false;

    // 系统角色不允许删除
    if (role.isSystem) {
      throw new Error('系统角色不允许删除');
    }

    return this.roles.delete(id);
  }

  /**
   * 获取所有角色
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * 获取角色
   */
  getRole(id: string): Role | null {
    return this.roles.get(id) || null;
  }

  /**
   * 检查权限
   */
  hasPermission(
    roleIds: string[],
    resource: string,
    action: string,
    level: PermissionLevel = 'read'
  ): boolean {
    for (const roleId of roleIds) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // 检查通配符权限
      const wildcardPermission = role.permissions.find(
        (p) => p.resource === '*' && p.action === '*'
      );
      if (wildcardPermission) {
        return this.checkLevel(wildcardPermission.level, level);
      }

      // 检查具体权限
      const permission = role.permissions.find(
        (p) =>
          (p.resource === '*' || p.resource === resource) &&
          (p.action === '*' || p.action === action)
      );

      if (permission) {
        return this.checkLevel(permission.level, level);
      }
    }

    return false;
  }

  /**
   * 检查权限级别
   */
  private checkLevel(required: PermissionLevel, requested: PermissionLevel): boolean {
    const levels: PermissionLevel[] = ['read', 'write', 'delete', 'admin'];
    const requiredIndex = levels.indexOf(required);
    const requestedIndex = levels.indexOf(requested);
    return requiredIndex >= requestedIndex;
  }

  /**
   * 检查字段权限
   */
  hasFieldPermission(
    roleIds: string[],
    resource: string,
    field: string,
    requestedLevel: 'read' | 'write' = 'read'
  ): boolean {
    const fieldPerms = this.fieldPermissions.get(resource) || [];
    const fieldPerm = fieldPerms.find((p) => p.field === field);

    if (!fieldPerm) return true;

    switch (fieldPerm.level) {
      case 'hidden':
        return false;
      case 'read-only':
        return requestedLevel === 'read';
      case 'writable':
        return true;
      default:
        return true;
    }
  }

  /**
   * 过滤字段（基于权限）
   */
  filterFields(roleIds: string[], resource: string, data: any): any {
    const fieldPerms = this.fieldPermissions.get(resource) || [];
    const result: any = {};

    for (const [key, value] of Object.entries(data)) {
      const fieldPerm = fieldPerms.find((p) => p.field === key);

      if (!fieldPerm || fieldPerm.level !== 'hidden') {
        result[key] = value;
      }
      if (fieldPerm.level === 'read-only') {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 添加字段权限
   */
  addFieldPermission(permission: FieldPermission): void {
    const fieldPerms = this.fieldPermissions.get(permission.resource) || [];
    fieldPerms.push(permission);
    this.fieldPermissions.set(permission.resource, fieldPerms);
  }

  /**
   * 删除字段权限
   */
  removeFieldPermission(resource: string, field: string): void {
    const fieldPerms = this.fieldPermissions.get(resource) || [];
    const filtered = fieldPerms.filter((p) => p.field !== field);
    this.fieldPermissions.set(resource, filtered);
  }
}

// 导出单例
export const permissionService = new PermissionService();
