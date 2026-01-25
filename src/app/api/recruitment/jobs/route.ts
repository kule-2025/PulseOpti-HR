import { NextRequest, NextResponse } from 'next/server';
import { jobManager } from '@/storage/database/jobManager';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { z } from 'zod';

// 创建岗位Schema
const createJobSchema = z.object({
  companyId: z.string(),
  title: z.string().min(1, '岗位名称不能为空'),
  departmentId: z.string().optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  requirements: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'filled']).default('open'),
  hiringManagerId: z.string().optional(),
  publishDate: z.coerce.date().optional(),
});

/**
 * GET /api/recruitment/jobs
 * 获取岗位列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const targetCompanyId = companyId || user.companyId;

    const jobs = await jobManager.getJobs({
      skip: (page - 1) * limit,
      limit,
      filters: {
        companyId: targetCompanyId,
        departmentId: departmentId || undefined,
        status: status as any || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total: jobs.length,
      },
    });
  } catch (error) {
    console.error('获取岗位列表错误:', error);
    return NextResponse.json(
      { error: '获取岗位列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recruitment/jobs
 * 创建岗位
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.JOB_CREATE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createJobSchema.parse({
      ...body,
      companyId: user.companyId,
    });

    const job = await jobManager.createJob(validated);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'job',
      resourceId: job.id,
      resourceName: job.title,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '创建岗位成功',
      data: job,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建岗位错误:', error);
    return NextResponse.json(
      { error: '创建岗位失败' },
      { status: 500 }
    );
  }
}
