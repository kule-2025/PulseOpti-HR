import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { candidateManager } from '@/storage/database/candidateManager';
import { recruitmentWorkflowManager } from '@/storage/database/recruitmentWorkflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';

/**
 * GET /api/recruitment/candidates/[id]
 * 获取候选人详情（包含工作流信息）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    const candidate = await candidateManager.getCandidateById(id);
    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 获取工作流实例
    const workflow = await recruitmentWorkflowManager.getRecruitmentWorkflow(id);

    return NextResponse.json({
      success: true,
      data: {
        ...candidate,
        workflow,
      },
    });
  } catch (error) {
    console.error('获取候选人详情错误:', error);
    return NextResponse.json(
      { error: '获取候选人详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recruitment/candidates/[id]
 * 更新候选人信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { id } = await params;
    const body = await request.json();

    const candidate = await candidateManager.updateCandidate(id, body);

    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'candidate',
      resourceId: id,
      resourceName: candidate.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '更新候选人成功',
      data: candidate,
    });
  } catch (error) {
    console.error('更新候选人错误:', error);
    return NextResponse.json(
      { error: '更新候选人失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recruitment/candidates/[id]
 * 删除候选人
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { id } = await params;

    const candidate = await candidateManager.getCandidateById(id);
    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    const deleted = await candidateManager.deleteCandidate(id);

    if (!deleted) {
      return NextResponse.json(
        { error: '删除候选人失败' },
        { status: 500 }
      );
    }

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'delete',
      resourceType: 'candidate',
      resourceId: id,
      resourceName: candidate.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '删除候选人成功',
    });
  } catch (error) {
    console.error('删除候选人错误:', error);
    return NextResponse.json(
      { error: '删除候选人失败' },
      { status: 500 }
    );
  }
}
