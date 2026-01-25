import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { customRoles, rolePermissions, customPermissions } from "@/storage/database/shared/schema";
import { eq, and } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";

// 验证JWT
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }
  try {
    const payload = await verifyJWT(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// 分配权限Schema
const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string()).min(1, "至少选择一个权限"),
});

// GET /api/permissions/roles/[id]/permissions - 获取角色的权限列表
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const db = await getDb();
    const { id: roleId } = await params;

    // 获取角色
    const role = await db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1);
    if (role.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 获取角色的所有权限
    const permissions = await db
      .select({
        id: customPermissions.id,
        code: customPermissions.code,
        name: customPermissions.name,
        description: customPermissions.description,
        module: customPermissions.module,
        resource: customPermissions.resource,
        action: customPermissions.action,
        isSystem: customPermissions.isSystem,
        isActive: customPermissions.isActive,
      })
      .from(rolePermissions)
      .innerJoin(customPermissions, eq(rolePermissions.permissionId, customPermissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    // 获取所有可用权限
    const allPermissions = await db
      .select({
        id: customPermissions.id,
        code: customPermissions.code,
        name: customPermissions.name,
        description: customPermissions.description,
        module: customPermissions.module,
        resource: customPermissions.resource,
        action: customPermissions.action,
        isSystem: customPermissions.isSystem,
        isActive: customPermissions.isActive,
      })
      .from(customPermissions)
      .where(and(eq(customPermissions.isActive, true)));

    const assignedPermissionIds = permissions.map(p => p.id);

    return NextResponse.json({
      data: {
        assigned: permissions,
        available: allPermissions.map(p => ({
          ...p,
          assigned: assignedPermissionIds.includes(p.id),
        })),
      },
    });
  } catch (error) {
    console.error("获取角色权限失败:", error);
    return NextResponse.json({ error: "获取角色权限失败" }, { status: 500 });
  }
}

// POST /api/permissions/roles/[id]/permissions - 为角色分配权限
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = assignPermissionsSchema.parse(body);

    const db = await getDb();
    const { id: roleId } = await params;

    // 检查角色是否存在
    const role = await db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1);
    if (role.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 验证所有权限是否存在
    const permissions = await db
      .select()
      .from(customPermissions)
      .where(eq(customPermissions.isActive, true));

    const permissionSet = new Set(permissions.map(p => p.id));
    const invalidPermissions = validated.permissionIds.filter(id => !permissionSet.has(id));

    if (invalidPermissions.length > 0) {
      return NextResponse.json({ error: "部分权限不存在或已禁用" }, { status: 400 });
    }

    // 删除原有权限
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // 批量插入新权限
    if (validated.permissionIds.length > 0) {
      const rolePermissionData = validated.permissionIds.map(permissionId => ({
        roleId,
        permissionId,
        grantedBy: payload.userId,
      }));
      await db.insert(rolePermissions).values(rolePermissionData);
    }

    return NextResponse.json({
      success: true,
      message: "权限分配成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("分配权限失败:", error);
    return NextResponse.json({ error: "分配权限失败" }, { status: 500 });
  }
}

// DELETE /api/permissions/roles/[id]/permissions - 移除角色所有权限
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const db = await getDb();
    const { id: roleId } = await params;

    // 检查角色是否存在
    const role = await db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1);
    if (role.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 删除所有权限
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    return NextResponse.json({
      success: true,
      message: "权限移除成功",
    });
  } catch (error) {
    console.error("移除权限失败:", error);
    return NextResponse.json({ error: "移除权限失败" }, { status: 500 });
  }
}
