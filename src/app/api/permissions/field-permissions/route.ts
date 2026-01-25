import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { fieldPermissions, customRoles } from "@/storage/database/shared/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
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

// 创建字段权限Schema
const createFieldPermissionSchema = z.object({
  roleId: z.string().optional(),
  module: z.string().min(1, "模块名称不能为空"),
  tableName: z.string().min(1, "表名不能为空"),
  fieldName: z.string().min(1, "字段名不能为空"),
  permission: z.enum(["view", "edit", "hide"]),
  condition: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/permissions/field-permissions - 获取字段权限列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const roleId = searchParams.get("roleId");
    const module = searchParams.get("module");
    const tableName = searchParams.get("tableName");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    if (!companyId && payload.userType !== "super_admin") {
      return NextResponse.json({ error: "缺少企业ID" }, { status: 400 });
    }

    const targetCompanyId = companyId || payload.companyId;
    if (targetCompanyId && payload.companyId !== targetCompanyId && !payload.isSuperAdmin) {
      return NextResponse.json({ error: "无权访问该企业的数据" }, { status: 403 });
    }

    const db = await getDb();
    const conditions = [eq(fieldPermissions.companyId, targetCompanyId)];

    if (roleId) {
      conditions.push(eq(fieldPermissions.roleId, roleId));
    }

    if (module) {
      conditions.push(eq(fieldPermissions.module, module));
    }

    if (tableName) {
      conditions.push(eq(fieldPermissions.tableName, tableName));
    }

    const [permissions, [{ count }]] = await Promise.all([
      db
        .select()
        .from(fieldPermissions)
        .where(and(...conditions))
        .orderBy(desc(fieldPermissions.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(fieldPermissions)
        .where(and(...conditions)),
    ]);

    // 获取角色信息
    const roleIds = permissions.map(p => p.roleId).filter(Boolean);
    const roles = roleIds.length > 0
      ? await db.select().from(customRoles).where(sql`id = ANY(${roleIds})`)
      : [];

    const roleMap = new Map(roles.map(r => [r.id, r]));

    const result = permissions.map(p => ({
      ...p,
      roleName: p.roleId ? roleMap.get(p.roleId)?.name : "全局配置",
    }));

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    console.error("获取字段权限列表失败:", error);
    return NextResponse.json({ error: "获取字段权限列表失败" }, { status: 500 });
  }
}

// POST /api/permissions/field-permissions - 创建字段权限
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createFieldPermissionSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";

    // 如果指定了角色，检查角色是否存在
    if (validated.roleId) {
      const role = await db.select().from(customRoles).where(eq(customRoles.id, validated.roleId)).limit(1);
      if (role.length === 0) {
        return NextResponse.json({ error: "角色不存在" }, { status: 404 });
      }
    }

    // 检查是否已存在相同的配置
    const existing = await db
      .select()
      .from(fieldPermissions)
      .where(
        and(
          eq(fieldPermissions.companyId, companyId),
          eq(fieldPermissions.module, validated.module),
          eq(fieldPermissions.tableName, validated.tableName),
          eq(fieldPermissions.fieldName, validated.fieldName),
          validated.roleId ? eq(fieldPermissions.roleId, validated.roleId!) : sql`${fieldPermissions.roleId} IS NULL`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "该字段权限已存在" }, { status: 400 });
    }

    // 创建字段权限
    const [permission] = await db
      .insert(fieldPermissions)
      .values({
        companyId,
        roleId: validated.roleId || null,
        module: validated.module,
        tableName: validated.tableName,
        fieldName: validated.fieldName,
        permission: validated.permission,
        condition: validated.condition,
        metadata: validated.metadata || {},
        createdBy: payload.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "字段权限创建成功",
      data: permission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("创建字段权限失败:", error);
    return NextResponse.json({ error: "创建字段权限失败" }, { status: 500 });
  }
}
