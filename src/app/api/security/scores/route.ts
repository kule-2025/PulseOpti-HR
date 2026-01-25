import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { securityScores } from "@/storage/database/shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
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

// 创建安全评分Schema
const createSecurityScoreSchema = z.object({
  userId: z.string().optional(),
  entityType: z.enum(["company", "user"]),
  totalScore: z.number().int().min(0, "总分不能为负数").max(100, "总分不能超过100"),
  scoreDetails: z.record(z.any()).optional(),
  riskFactors: z.array(z.any()).optional(),
  recommendations: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/security/scores - 获取安全评分列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || payload.companyId;
    const userId = searchParams.get("userId");
    const entityType = searchParams.get("entityType");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
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
    const conditions = [eq(securityScores.companyId, targetCompanyId)];

    if (userId) {
      conditions.push(eq(securityScores.userId, userId));
    }

    if (entityType) {
      conditions.push(eq(securityScores.entityType, entityType));
    }

    if (minScore) {
      conditions.push(gte(securityScores.totalScore, parseInt(minScore)));
    }

    if (maxScore) {
      conditions.push(lte(securityScores.totalScore, parseInt(maxScore)));
    }

    const [scores, [{ count }]] = await Promise.all([
      db
        .select()
        .from(securityScores)
        .where(and(...conditions))
        .orderBy(desc(securityScores.lastUpdated))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql`COUNT(*)` })
        .from(securityScores)
        .where(and(...conditions)),
    ]);

    return NextResponse.json({
      data: scores,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    });
  } catch (error) {
    console.error("获取安全评分列表失败:", error);
    return NextResponse.json({ error: "获取安全评分列表失败" }, { status: 500 });
  }
}

// POST /api/security/scores - 创建安全评分
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSecurityScoreSchema.parse(body);

    const db = await getDb();
    const companyId = payload.companyId || "PLATFORM";

    // 创建安全评分
    const [score] = await db
      .insert(securityScores)
      .values({
        companyId,
        userId: validated.userId || null,
        entityType: validated.entityType,
        totalScore: validated.totalScore,
        scoreDetails: validated.scoreDetails || {},
        riskFactors: validated.riskFactors || [],
        recommendations: validated.recommendations || [],
        metadata: validated.metadata || {},
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "安全评分创建成功",
      data: score,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "参数验证失败", details: error.issues }, { status: 400 });
    }

    console.error("创建安全评分失败:", error);
    return NextResponse.json({ error: "创建安全评分失败" }, { status: 500 });
  }
}
