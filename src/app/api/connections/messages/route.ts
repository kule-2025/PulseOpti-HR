import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { connectionService, MessageType } from '@/lib/services/connectionService';
import { PERMISSIONS, USER_TYPES } from '@/lib/auth/permissions';

/**
 * POST /api/connections/messages
 * 发送即时消息
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const { toUserId, message, messageType = MessageType.TEXT, relatedTaskId } = body;

    // 验证必填字段
    if (!toUserId || !message) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 发送消息
    const result = await connectionService.sendMessage({
      fromUserId: user.userId,
      toUserId,
      message,
      messageType,
      relatedTaskId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('发送消息失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '发送消息失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connections/messages
 * 获取消息列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const messages = await connectionService.getMessages(user.userId, page, pageSize);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('获取消息列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取消息列表失败' },
      { status: 500 }
    );
  }
}
