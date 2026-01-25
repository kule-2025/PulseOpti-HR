import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/workflow-engine';

/**
 * 创建工作流实例
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
    const requiredFields = ['workflowDefinitionId', 'businessType', 'businessId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 创建工作流实例
    const instanceId = await workflowEngine.createInstance({
      workflowDefinitionId: body.workflowDefinitionId,
      companyId: user.companyId,
      businessType: body.businessType,
      businessId: body.businessId,
      initiatorId: user.id,
      variables: body.variables || {},
    });

    return NextResponse.json({
      success: true,
      message: '工作流实例创建成功',
      data: { instanceId },
    });

  } catch (error) {
    console.error('创建工作流实例失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建工作流实例失败' },
      { status: 500 }
    );
  }
}

/**
 * 审批操作
 */
export async function PUT(request: NextRequest) {
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
    const requiredFields = ['instanceId', 'nodeId', 'action'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 执行审批操作
    await workflowEngine.approve({
      instanceId: body.instanceId,
      nodeId: body.nodeId,
      approverId: user.id,
      action: body.action as 'approve' | 'reject',
      comment: body.comment || '',
    });

    return NextResponse.json({
      success: true,
      message: '审批操作成功',
    });

  } catch (error) {
    console.error('审批操作失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '审批操作失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取工作流实例详情
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        { error: '缺少实例ID' },
        { status: 400 }
      );
    }

    // 获取实例详情
    const instance = await workflowEngine.getInstance(instanceId);

    if (!instance) {
      return NextResponse.json(
        { error: '工作流实例不存在' },
        { status: 404 }
      );
    }

    // 获取审批记录
    const approvalRecords = await workflowEngine.getApprovalRecords(instanceId);

    return NextResponse.json({
      success: true,
      data: {
        instance,
        approvalRecords,
      },
    });

  } catch (error) {
    console.error('获取工作流实例失败:', error);
    return NextResponse.json(
      { error: '获取工作流实例失败' },
      { status: 500 }
    );
  }
}
