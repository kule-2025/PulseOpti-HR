import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { dataScopePermissions, customRoles } from "@/storage/database/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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

// 创建数据范围权限Schema
const createDataScopeSchema = z.object({
  roleId: z.string().min(1, "角色ID不能为空"),
  module: z.string().min(1, "模块名称不能为空"),
  scopeType: z.enum(["all", "department", "self", "custom"]),
  scopeValue: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/permissions/data-scopes - 获取数据范围权限列表
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
    const scopeType = searchParams.get("scopeType");
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
    const conditions = [eq(dataScopePermissions.companyId, targetCompanyId)];

    if (roleId) {
      conditions.push(eq(dataScopePermissions.roleId, roleId));
    }

    if (module) {
      conditions.push(eq(dataScopePermissions.module, module));
    }

    if (scopeType) {
      conditions.push(eq(dataScopePermissions.scopeType, scopeType));
    }

    const [scopes, [{ count }]] = await Promise.all([
      db
        .select()
        .from(dataScopePermissions)
        .where(and(...conditions))
        .orderBy(desc(dataScopePermissions.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(dataScopePermissions)
        .where(and(...conditions)),
    ]);

    // 获取角色信息
    const roleIds = scopes.map(s => s.roleId);
    const roles = await db.select().from(customRoles).where(sql`id = ANY(${roleIds})`);
    const roleMap = new Map(roles.map(r => [r.id, r]));

    const result = scopes.map(s => ({
      ...s,
      roleName: roleMap.get(s.roleId)?.name || "未知角色",
      scopeTypeName: getScopeTypeName(s.scopeType),
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
    console.error("获取数据范围权限列表失败:", error);
    return NextResponse.json({ error: "获取数据范围权限列表失败" }, { status: 500 });
  }
}

// POST /api/permissions/data-scopes - 创建数据范围权限
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createDataScopeSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";

    // 检查角色是否存在
    const role = await db.select().from(customRoles).where(eq(customRoles.id, validated.roleId)).limit(1);
    if (role.length === 0) {
      return NextResponse.json({ error: "角色不存在" }, { status: 404 });
    }

    // 检查是否已存在相同的配置
    const existing = await db
      .select()
      .from(dataScopePermissions)
      .where(
        and(
          eq(dataScopePermissions.companyId, companyId),
          eq(dataScopePermissions.roleId, validated.roleId),
          eq(dataScopePermissions.module, validated.module)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // 更新现有配置
      const [updated] = await db
        .update(dataScopePermissions)
        .set({
          scopeType: validated.scopeType,
          scopeValue: validated.scopeValue || {},
          metadata: validated.metadata,
          updatedAt: new Date(),
        })
        .where(eq(dataScopePermissions.id, existing[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "数据范围权限更新成功",
        data: updated,
      });
    }

    // 创建数据范围权限
    const [scope] = await db
      .insert(dataScopePermissions)
      .values({
        companyId,
        roleId: validated.roleId,
        module: validated.module,
        scopeType: validated.scopeType,
        scopeValue: validated.scopeValue || {},
        metadata: validated.metadata || {},
        createdBy: payload.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "数据范围权限创建成功",
      data: scope,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("创建数据范围权限失败:", error);
    return NextResponse.json({ error: "创建数据范围权限失败" }, { status: 500 });
  }
}

// 辅助函数：获取范围类型名称
function getScopeTypeName(scopeType: string): string {
  const typeMap: Record<string, string> = {
    all: "全部数据",
    department: "本部门数据",
    self: "本人数据",
    custom: "自定义范围",
  };
  return typeMap[scopeType] || scopeType;
}
