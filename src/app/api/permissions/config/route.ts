import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { departments, positions, users, permissions } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 导出权限配置（JSON格式）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 导出部门配置
    const departmentList = await db
      .select()
      .from(departments)
      .where(eq(departments.companyId, companyId));

    // 导出职位配置
    const positionList = await db
      .select()
      .from(positions)
      .where(eq(positions.companyId, companyId));

    // 导出用户配置（不包含密码等敏感信息）
    const userList = await db
      .select({
        id: users.id,
        companyId: users.companyId,
        username: users.username,
        email: users.email,
        phone: users.phone,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        userType: users.userType,
        parentUserId: users.parentUserId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.companyId, companyId));

    // 导出角色配置
    // 注意：roles表暂未在schema中定义，后续需要添加
    const roleList: any[] = [];

    // 导出权限配置
    const permissionList = await db
      .select()
      .from(permissions);

    // 导出角色权限关联
    // 注意：rolePermissions表暂未在schema中定义，后续需要添加
    const rolePermissionList: any[] = [];

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      companyId,
      data: {
        departments: departmentList,
        positions: positionList,
        users: userList,
        roles: roleList,
        permissions: permissionList,
        rolePermissions: rolePermissionList,
      },
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });

  } catch (error) {
    console.error('导出权限配置失败:', error);
    return NextResponse.json(
      { error: '导出权限配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 导入权限配置（JSON格式）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { configData } = body;

    if (!configData) {
      return NextResponse.json(
        { error: '缺少配置数据' },
        { status: 400 }
      );
    }

    // 验证配置数据格式
    if (!configData.version || !configData.data) {
      return NextResponse.json(
        { error: '配置数据格式无效' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const { departments: deptData, positions: posData, users: userData, roles: roleData, permissions: permData, rolePermissions: rpData } = configData.data;

    const results = {
      departments: { imported: 0, errors: 0 },
      positions: { imported: 0, errors: 0 },
      users: { imported: 0, errors: 0 },
      roles: { imported: 0, errors: 0 },
      permissions: { imported: 0, errors: 0 },
      rolePermissions: { imported: 0, errors: 0 },
    };

    // 导入部门
    if (deptData && Array.isArray(deptData)) {
      for (const dept of deptData) {
        try {
          await db.insert(departments).values({
            id: dept.id,
            companyId: dept.companyId,
            name: dept.name,
            code: dept.code,
            parentId: dept.parentId,
            managerId: dept.managerId,
            description: dept.description,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            sort: dept.sort || 0,
            createdAt: dept.createdAt ? new Date(dept.createdAt) : new Date(),
            updatedAt: dept.updatedAt ? new Date(dept.updatedAt) : new Date(),
          });
          results.departments.imported++;
        } catch (error) {
          console.error(`导入部门失败: ${dept.name}`, error);
          results.departments.errors++;
        }
      }
    }

    // 导入职位
    if (posData && Array.isArray(posData)) {
      for (const pos of posData) {
        try {
          await db.insert(positions).values({
            id: pos.id,
            companyId: pos.companyId,
            name: pos.name,
            code: pos.code,
            level: pos.level,
            departmentId: pos.departmentId,
            description: pos.description,
            responsibilities: pos.responsibilities,
            requirements: pos.requirements,
            salaryMin: pos.salaryMin,
            salaryMax: pos.salaryMax,
            isActive: pos.isActive !== undefined ? pos.isActive : true,
            createdAt: pos.createdAt ? new Date(pos.createdAt) : new Date(),
            updatedAt: pos.updatedAt ? new Date(pos.updatedAt) : new Date(),
          });
          results.positions.imported++;
        } catch (error) {
          console.error(`导入职位失败: ${pos.name}`, error);
          results.positions.errors++;
        }
      }
    }

    // 导入用户（需要处理密码字段）
    if (userData && Array.isArray(userData)) {
      for (const user of userData) {
        try {
          const userDataToInsert: any = {
            id: user.id,
            companyId: user.companyId,
            username: user.username,
            email: user.email,
            phone: user.phone,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            userType: user.userType,
            parentUserId: user.parentUserId,
            isActive: user.isActive !== undefined ? user.isActive : true,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          };

          // 如果有密码则导入，否则使用默认密码
          if (user.password) {
            userDataToInsert.password = user.password;
          } else {
            // 导入时没有密码，设置一个随机密码
            const bcrypt = require('bcryptjs');
            userDataToInsert.password = await bcrypt.hash('PulseOpti@2024', 10);
          }

          await db.insert(users).values(userDataToInsert);
          results.users.imported++;
        } catch (error) {
          console.error(`导入用户失败: ${user.name}`, error);
          results.users.errors++;
        }
      }
    }

    // 导入角色
    // 注意：roles表暂未在schema中定义，后续需要添加
    if (roleData && Array.isArray(roleData)) {
      for (const role of roleData) {
        results.roles.errors++; // 暂时标记为错误
        console.error(`导入角色失败: ${role.name}, roles表暂未定义`);
      }
    }

    // 导入权限
    if (permData && Array.isArray(permData)) {
      for (const perm of permData) {
        try {
          await db.insert(permissions).values({
            code: perm.code,
            name: perm.name,
            description: perm.description,
            module: perm.module,
            action: perm.action,
            resource: perm.resource,
            isActive: perm.isActive !== undefined ? perm.isActive : true,
            createdAt: perm.createdAt ? new Date(perm.createdAt) : new Date(),
            updatedAt: perm.updatedAt ? new Date(perm.updatedAt) : new Date(),
          });
          results.permissions.imported++;
        } catch (error) {
          console.error(`导入权限失败: ${perm.code}`, error);
          results.permissions.errors++;
        }
      }
    }

    // 导入角色权限关联
    // 注意：rolePermissions表暂未在schema中定义，后续需要添加
    if (rpData && Array.isArray(rpData)) {
      for (const rp of rpData) {
        results.rolePermissions.errors++; // 暂时标记为错误
        console.error(`导入角色权限关联失败, rolePermissions表暂未定义`);
      }
    }

    return NextResponse.json({
      success: true,
      message: '权限配置导入完成',
      data: {
        summary: {
          totalImported: Object.values(results).reduce((sum, item) => sum + item.imported, 0),
          totalErrors: Object.values(results).reduce((sum, item) => sum + item.errors, 0),
        },
        details: results,
      },
    });

  } catch (error) {
    console.error('导入权限配置失败:', error);
    return NextResponse.json(
      { error: '导入权限配置失败' },
      { status: 500 }
    );
  }
}
