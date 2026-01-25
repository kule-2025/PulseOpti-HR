import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { securityEvents } from "@/storage/database/shared/schema";
import { eq, and, desc, or, sql, gte, lte } from "drizzle-orm";
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

// 创建安全事件Schema
const createSecurityEventSchema = z.object({
  userId: z.string().optional(),
  eventType: z.enum(["login_failed", "suspicious_activity", "data_access", "privilege_escalation", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "事件标题不能为空").max(255, "事件标题不能超过255个字符"),
  description: z.string().optional(),
  sourceIp: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/security/events - 获取安全事件列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const userId = searchParams.get("userId");
    const eventType = searchParams.get("eventType");
    const severity = searchParams.get("severity");
    const isResolved = searchParams.get("isResolved");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
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
    const conditions = [eq(securityEvents.companyId, targetCompanyId)];

    if (userId) {
      conditions.push(eq(securityEvents.userId, userId));
    }

    if (eventType) {
      conditions.push(eq(securityEvents.eventType, eventType));
    }

    if (severity) {
      conditions.push(eq(securityEvents.severity, severity));
    }

    if (isResolved !== null) {
      conditions.push(eq(securityEvents.isResolved, isResolved === "true"));
    }

    if (startDate) {
      conditions.push(gte(securityEvents.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(securityEvents.createdAt, new Date(endDate)));
    }

    const [events, [{ count }]] = await Promise.all([
      db
        .select()
        .from(securityEvents)
        .where(and(...conditions))
        .orderBy(desc(securityEvents.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(securityEvents)
        .where(and(...conditions)),
    ]);

    return NextResponse.json({
      data: events,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    console.error("获取安全事件列表失败:", error);
    return NextResponse.json({ error: "获取安全事件列表失败" }, { status: 500 });
  }
}

// POST /api/security/events - 创建安全事件
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSecurityEventSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";

    // 创建安全事件
    const [event] = await db
      .insert(securityEvents)
      .values({
        companyId,
        userId: validated.userId || null,
        eventType: validated.eventType,
        severity: validated.severity,
        title: validated.title,
        description: validated.description,
        sourceIp: validated.sourceIp,
        userAgent: validated.userAgent,
        location: validated.location || {},
        metadata: validated.metadata || {},
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "安全事件创建成功",
      data: event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("创建安全事件失败:", error);
    return NextResponse.json({ error: "创建安全事件失败" }, { status: 500 });
  }
}
