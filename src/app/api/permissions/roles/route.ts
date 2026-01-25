import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { customRoles, rolePermissions, customPermissions, userRoles } from "@/storage/database/shared/schema";
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

// 创建角色Schema
const createRoleSchema = z.object({
  name: z.string().min(1, "角色名称不能为空").max(100, "角色名称不能超过100个字符"),
  code: z.string().min(1, "角色代码不能为空").max(50, "角色代码不能超过50个字符"),
  description: z.string().optional(),
  level: z.number().int().min(0, "角色级别不能为负数").default(0),
  metadata: z.record(z.any()).optional(),
});

// GET /api/permissions/roles - 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const isActive = searchParams.get("isActive");
    const keyword = searchParams.get("keyword");
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
    const conditions = targetCompanyId ? [eq(customRoles.companyId, targetCompanyId)] : [];

    if (isActive !== null) {
      conditions.push(eq(customRoles.isActive, isActive === "true"));
    }

    if (keyword) {
      conditions.push(
        or(
          sql`${customRoles.name} ILIKE ${`%${keyword}%`}`,
          sql`${customRoles.code} ILIKE ${`%${keyword}%`}`
        )!
      );
    }

    const [roles, [{ count }]] = await Promise.all([
      db
        .select()
        .from(customRoles)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(customRoles.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(customRoles)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    return NextResponse.json({
      data: roles,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return NextResponse.json({ error: "获取角色列表失败" }, { status: 500 });
  }
}

// POST /api/permissions/roles - 创建角色
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createRoleSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";

    // 检查角色代码是否已存在
    const existingRole = await db
      .select()
      .from(customRoles)
      .where(and(eq(customRoles.companyId, companyId), eq(customRoles.code, validated.code)))
      .limit(1);

    if (existingRole.length > 0) {
      return NextResponse.json({ error: "角色代码已存在" }, { status: 400 });
    }

    // 创建角色
    const [role] = await db
      .insert(customRoles)
      .values({
        companyId,
        name: validated.name,
        code: validated.code,
        description: validated.description,
        level: validated.level,
        isSystem: false,
        isActive: true,
        metadata: validated.metadata || {},
        createdBy: payload.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "角色创建成功",
      data: role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("创建角色失败:", error);
    return NextResponse.json({ error: "创建角色失败" }, { status: 500 });
  }
}
