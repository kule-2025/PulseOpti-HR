import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// GET /api/admin/tickets/[id] - 获取工单详情
export async function GET(
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

    // TODO: 从数据库获取工单详情
    const ticket = {
      id,
      subject: '无法登录系统',
      description: '输入账号密码后点击登录无响应',
      type: 'bug',
      priority: 'high',
      status: 'in_progress',
      userId: 'user-1',
      userName: '张三',
      userEmail: 'zhangsan@example.com',
      companyId: 'company-1',
      companyName: '示例企业',
      createdAt: new Date().toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      replies: [
        {
          id: 'reply-1',
          content: '您好，请尝试清除浏览器缓存后重新登录',
          authorId: 'admin-1',
          authorName: '客服',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'reply-2',
          content: '已尝试清除缓存，还是无法登录',
          authorId: 'user-1',
          authorName: '张三',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('获取工单详情失败:', error);
    return NextResponse.json(
      { error: '获取工单详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tickets/[id] - 更新工单
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

    const { status, content, adminId } = data;

    // TODO: 更新数据库中的工单
    // 如果是回复内容，添加到replies数组
    // 如果是状态更新，更新status字段

    const updatedTicket = {
      id,
      subject: '无法登录系统',
      description: '输入账号密码后点击登录无响应',
      type: 'bug',
      priority: 'high',
      status: status || 'in_progress',
      userId: 'user-1',
      userName: '张三',
      companyId: 'company-1',
      companyName: '示例企业',
      updatedAt: new Date().toISOString(),
      replies: [
        {
          id: 'reply-1',
          content: '您好，请尝试清除浏览器缓存后重新登录',
          authorId: 'admin-1',
          authorName: '客服',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      ...(content && {
        replies: [
          {
            id: `reply-${Date.now()}`,
            content,
            authorId: adminId || 'admin-1',
            authorName: '客服',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    };

    // TODO: 如果工单关闭，发送通知给用户

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: '工单更新成功',
    });
  } catch (error) {
    console.error('更新工单失败:', error);
    return NextResponse.json(
      { error: '更新工单失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tickets/[id] - 删除工单
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

    // TODO: 从数据库删除工单

    return NextResponse.json({
      success: true,
      message: '工单已删除',
    });
  } catch (error) {
    console.error('删除工单失败:', error);
    return NextResponse.json(
      { error: '删除工单失败' },
      { status: 500 }
    );
  }
}
