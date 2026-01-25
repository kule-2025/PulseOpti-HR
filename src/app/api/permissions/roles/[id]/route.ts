import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { customRoles, rolePermissions, customPermissions, userRoles } from "@/storage/database/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyJWT } from "@/lib/auth/jwt";
import { sql } from "drizzle-orm";

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

// 更新角色Schema
const updateRoleSchema = z.object({
  name: z.string().min(1, "角色名称不能为空").max(100, "角色名称不能超过100个字符").optional(),
  description: z.string().optional(),
  level: z.number().int().min(0, "角色级别不能为负数").optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/permissions/roles/[id] - 获取角色详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const db = await getDb();
    const { id: roleId } = await params;

    const [role, permissions, users] = await Promise.all([
      db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1),
      db
        .select({
          permissionId: customPermissions.id,
          code: customPermissions.code,
          name: customPermissions.name,
          module: customPermissions.module,
          resource: customPermissions.resource,
          action: customPermissions.action,
        })
        .from(rolePermissions)
        .innerJoin(customPermissions, eq(rolePermissions.permissionId, customPermissions.id))
        .where(eq(rolePermissions.roleId, roleId)),
      db
        .select()
        .from(userRoles)
        .where(eq(userRoles.roleId, roleId)),
    ]);

    if (role.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...role[0],
        permissions,
        users,
      },
    });
  } catch (error) {
    console.error("获取角色详情失败:", error);
    return NextResponse.json({ error: "获取角色详情失败" }, { status: 500 });
  }
}

// PUT /api/permissions/roles/[id] - 更新角色
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateRoleSchema.parse(body);

    const db = await getDb();
    const { id: roleId } = await params;

    // 检查角色是否存在
    const existingRole = await db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1);
    if (existingRole.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 系统预置角色不能修改
    if (existingRole[0].isSystem) {
      return NextResponse.json({ error: "系统预置角色不能修改" }, { status: 403 });
    }

    // 更新角色
    const [updatedRole] = await db
      .update(customRoles)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(customRoles.id, roleId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "角色更新成功",
      data: updatedRole,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("更新角色失败:", error);
    return NextResponse.json({ error: "更新角色失败" }, { status: 500 });
  }
}

// DELETE /api/permissions/roles/[id] - 删除角色
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const db = await getDb();
    const { id: roleId } = await params;

    // 检查角色是否存在
    const existingRole = await db.select().from(customRoles).where(eq(customRoles.id, roleId)).limit(1);
    if (existingRole.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 系统预置角色不能删除
    if (existingRole[0].isSystem) {
      return NextResponse.json({ error: "系统预置角色不能删除" }, { status: 403 });
    }

    // 检查是否有用户使用该角色
    const userCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));

    if (Number(userCount[0]?.count || 0) > 0) {
      return NextResponse.json({ error: "该角色正在使用中，无法删除" }, { status: 400 });
    }

    // 删除角色权限关联
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // 删除角色
    await db.delete(customRoles).where(eq(customRoles.id, roleId));

    return NextResponse.json({
      success: true,
      message: "角色删除成功",
    });
  } catch (error) {
    console.error("删除角色失败:", error);
    return NextResponse.json({ error: "删除角色失败" }, { status: 500 });
  }
}
