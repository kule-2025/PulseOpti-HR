import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { candidates } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { storage } from '@/lib/storage';

/**
 * 提交简历（创建候选人）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userStr = request.headers.get('x-user-id');
    if (!userStr) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必填字段
    const requiredFields = ['jobId', 'name', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 检查是否已投递该职位
    const existingCandidates = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.jobId, body.jobId),
          eq(candidates.email, body.email)
        )
      )
      .limit(1);

    if (existingCandidates.length > 0) {
      return NextResponse.json(
        { error: '您已投递该职位，请勿重复投递' },
        { status: 400 }
      );
    }

    // 创建候选人记录ID（用于文件上传）
    const candidateId = randomUUID();

    // 如果有简历文件，上传到对象存储
    let resumeFileKey = null;
    if (body.resumeFile) {
      const fileKey = await storage.uploadFile({
        fileContent: Buffer.from(body.resumeFile.content, 'base64'),
        fileName: `resumes/${candidateId}/${body.resumeFile.name}`,
        contentType: body.resumeFile.type || 'application/pdf',
      });
      resumeFileKey = fileKey;
    }

    // 创建候选人记录
    await db.insert(candidates).values({
      id: candidateId,
      companyId: user.companyId,
      jobId: body.jobId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      gender: body.gender || 'unknown',
      birthDate: body.birthDate || null,
      education: body.education ? JSON.parse(body.education) : null,
      workExperience: body.workExperience ? JSON.parse(body.workExperience) : null,
      currentSalary: body.currentSalary || null,
      expectedSalary: body.expectedSalary || null,
      resumeFileKey,
      source: body.source || 'web',
      status: 'new',
      remark: body.coverLetter || '',
      skills: body.skills ? JSON.parse(body.skills) : null,
      selfIntroduction: body.selfIntroduction || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '简历提交成功',
      data: { id: candidateId },
    });

  } catch (error) {
    console.error('提交简历失败:', error);
    return NextResponse.json(
      { error: '提交简历失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取候选人列表（职位申请）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const jobId = searchParams.get('jobId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(candidates.companyId, companyId)];

    if (jobId) {
      conditions.push(eq(candidates.jobId, jobId));
    }

    if (status) {
      conditions.push(eq(candidates.status, status));
    }

    // 查询候选人列表
    const candidateList = await db
      .select()
      .from(candidates)
      .where(and(...conditions))
      .orderBy(desc(candidates.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 查询总数
    const totalCount = await db
      .select()
      .from(candidates)
      .where(and(...conditions))
      .then((results) => results.length);

    return NextResponse.json({
      success: true,
      data: candidateList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('获取候选人列表失败:', error);
    return NextResponse.json(
      { error: '获取候选人列表失败' },
      { status: 500 }
    );
  }
}
