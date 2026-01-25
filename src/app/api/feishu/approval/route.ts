import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 创建飞书审批实例
 * POST /api/feishu/approval
 * Body: { userId, approvalCode, formData }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, approvalCode, formData } = body;

    if (!userId || !approvalCode || !formData) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建审批实例
    const result = await feishuService.createApproval(userId, approvalCode, formData);

    return NextResponse.json({
      success: true,
      data: result,
      message: '审批实例创建成功',
    });
  } catch (error) {
    console.error('创建飞书审批失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建审批失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
