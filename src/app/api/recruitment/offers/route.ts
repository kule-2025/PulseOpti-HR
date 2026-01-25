import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { offers, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建Offer Schema
const createOfferSchema = z.object({
  companyId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  salary: z.number().positive(),
  salaryType: z.enum(['monthly', 'yearly', 'hourly']).default('monthly'),
  startDate: z.coerce.date(),
  probationPeriod: z.number().default(3),
  benefits: z.string().optional(),
  conditions: z.string().optional(),
  expiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/recruitment/offers
 * 获取Offer列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || user.companyId;
    const candidateId = searchParams.get('candidateId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [eq(offers.companyId, companyId)];

    if (candidateId) {
      conditions.push(eq(offers.candidateId, candidateId));
    }

    if (jobId) {
      conditions.push(eq(offers.jobId, jobId));
    }

    if (status) {
      conditions.push(eq(offers.status, status));
    }

    const offset = (page - 1) * limit;

    const offersData = await db
      .select({
        id: offers.id,
        companyId: offers.companyId,
        candidateId: offers.candidateId,
        jobId: offers.jobId,
        offerNumber: offers.offerNumber,
        salary: offers.salary,
        salaryType: offers.salaryType,
        startDate: offers.startDate,
        probationPeriod: offers.probationPeriod,
        benefits: offers.benefits,
        conditions: offers.conditions,
        expiryDate: offers.expiryDate,
        status: offers.status,
        createdBy: offers.createdBy,
        approvedBy: offers.approvedBy,
        approvedAt: offers.approvedAt,
        notes: offers.notes,
        createdAt: offers.createdAt,
        updatedAt: offers.updatedAt,
        candidateName: candidates.name,
        candidatePhone: candidates.phone,
        candidateEmail: candidates.email,
        jobTitle: jobs.title,
        createdByName: employees.name,
        approvedByName: employees.name,
      })
      .from(offers)
      .leftJoin(candidates, eq(offers.candidateId, candidates.id))
      .leftJoin(jobs, eq(offers.jobId, jobs.id))
      .leftJoin(employees, eq(offers.createdBy, employees.id))
      .where(and(...conditions))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: offersData,
      pagination: {
        page,
        limit,
        total: Number(count),
      },
    });
  } catch (error) {
    console.error('获取Offer列表错误:', error);
    return NextResponse.json(
      { error: '获取Offer列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recruitment/offers
 * 创建Offer
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.OFFER_CREATE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = createOfferSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    // 生成Offer编号
    const offerNumber = `OFF${Date.now()}`;

    const [result] = await db.insert(offers).values({
      ...validated,
      id: crypto.randomUUID(),
      offerNumber,
      status: 'draft',
      createdBy: user.userId,
      createdAt: new Date(),
    }).returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'offer',
      resourceId: result.id,
      resourceName: `Offer ${offerNumber}`,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '创建Offer成功',
      data: result,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建Offer错误:', error);
    return NextResponse.json(
      { error: '创建Offer失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/offers
 * 更新Offer
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.OFFER_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID不能为空' },
        { status: 400 }
      );
    }

    const [result] = await db
      .update(offers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'offer',
      resourceId: id,
      resourceName: 'Offer',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '更新Offer成功',
      data: result,
    });
  } catch (error) {
    console.error('更新Offer错误:', error);
    return NextResponse.json(
      { error: '更新Offer失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/offers/[id]/send
 * 发送Offer
 */
export async function sendOffer(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.OFFER_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { expiryDate } = body;

    const [result] = await db
      .update(offers)
      .set({
        status: 'sent',
        sentAt: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, params.id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'send',
      resourceType: 'offer',
      resourceId: params.id,
      resourceName: '发送Offer',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '发送Offer成功',
      data: result,
    });
  } catch (error) {
    console.error('发送Offer错误:', error);
    return NextResponse.json(
      { error: '发送Offer失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/offers/[id]/respond
 * 候选人响应Offer
 */
export async function respondOffer(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const { accepted, notes } = body;

    const [result] = await db
      .update(offers)
      .set({
        status: accepted ? 'accepted' : 'rejected',
        respondedAt: new Date(),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, params.id))
      .returning();

    // 如果接受Offer，更新候选人状态
    if (accepted) {
      const offer = await db.select().from(offers).where(eq(offers.id, params.id)).limit(1);
      if (offer.length > 0) {
        await db
          .update(candidates)
          .set({ status: 'hired' })
          .where(eq(candidates.id, offer[0].candidateId));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Offer已${accepted ? '接受' : '拒绝'}`,
      data: result,
    });
  } catch (error) {
    console.error('响应Offer错误:', error);
    return NextResponse.json(
      { error: '响应Offer失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recruitment/offers
 * 撤销Offer
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.OFFER_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID不能为空' },
        { status: 400 }
      );
    }

    const [result] = await db
      .update(offers)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(offers.id, id))
      .returning();

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'offer',
      resourceId: id,
      resourceName: '撤销Offer',
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '撤销Offer成功',
      data: result,
    });
  } catch (error) {
    console.error('撤销Offer错误:', error);
    return NextResponse.json(
      { error: '撤销Offer失败' },
      { status: 500 }
    );
  }
}
