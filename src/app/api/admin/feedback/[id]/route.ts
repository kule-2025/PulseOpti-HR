import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// PUT /api/admin/feedback/[id] - 更新反馈状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.text();
    const data = body ? JSON.parse(body) : {};

    const { status } = data;

    // TODO: 更新数据库中的反馈状态

    const updatedFeedback = {
      id,
      status: status || 'reviewed',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
      message: '反馈状态更新成功',
    });
  } catch (error) {
    console.error('更新反馈状态失败:', error);
    return NextResponse.json(
      { error: '更新反馈状态失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/feedback/[id] - 删除反馈
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证超级管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded?.isSuperAdmin) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id } = await params;

    // TODO: 从数据库删除反馈

    return NextResponse.json({
      success: true,
      message: '反馈已删除',
    });
  } catch (error) {
    console.error('删除反馈失败:', error);
    return NextResponse.json(
      { error: '删除反馈失败' },
      { status: 500 }
    );
  }
}
