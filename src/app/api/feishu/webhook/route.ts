import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 飞书事件回调接口
 * POST /api/feishu/webhook
 * Headers: X-Lark-Request-Timestamp, X-Lark-Request-Nonce, X-Lark-Signature
 * Body: { encrypt, token, ... }
 */
export async function POST(request: NextRequest) {
  try {
    // 获取验证信息
    const timestamp = request.headers.get('X-Lark-Request-Timestamp');
    const nonce = request.headers.get('X-Lark-Request-Nonce');
    const signature = request.headers.get('X-Lark-Signature');

    if (!timestamp || !nonce || !signature) {
      return NextResponse.json(
        { error: '缺少验证信息' },
        { status: 400 }
      );
    }

    // 读取请求体
    const body = await request.text();

    // 验证请求签名
    const isValid = feishuService.verifyEventRequest(signature, timestamp, nonce, body);
    if (!isValid) {
      return NextResponse.json(
        { error: '签名验证失败' },
        { status: 403 }
      );
    }

    // 解析请求体
    const payload = JSON.parse(body);

    // 验证token
    if (payload.token !== process.env.FEISHU_VERIFICATION_TOKEN) {
      return NextResponse.json(
        { error: 'Token验证失败' },
        { status: 403 }
      );
    }

    // 解密事件数据
    const eventData = feishuService.decryptEvent(payload.encrypt);

    console.log('收到飞书事件:', eventData);

    // 处理不同类型的事件
    switch (eventData.type) {
      case 'url_verification':
        // URL验证事件
        return NextResponse.json({
          challenge: eventData.challenge,
        });

      case 'user_updated':
        // 用户信息更新事件
        await handleUserUpdated(eventData);
        break;

      case 'contact.user.updated_v3':
        // 用户信息更新事件（V3）
        await handleUserUpdatedV3(eventData);
        break;

      case 'approval_instance':
        // 审批实例事件
        await handleApprovalInstance(eventData);
        break;

      case 'im.message.receive_v1':
        // 接收消息事件
        await handleReceiveMessage(eventData);
        break;

      default:
        console.log('未处理的事件类型:', eventData.type);
    }

    // 返回成功响应
    return NextResponse.json({
      code: 0,
      msg: 'success',
    });
  } catch (error) {
    console.error('处理飞书事件失败:', error);
    return NextResponse.json(
      {
        code: 1,
        msg: error instanceof Error ? error.message : '处理失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 处理用户更新事件
 */
async function handleUserUpdated(eventData: any) {
  // TODO: 实现用户信息更新逻辑
  console.log('处理用户更新事件:', eventData);
}

/**
 * 处理用户更新事件（V3）
 */
async function handleUserUpdatedV3(eventData: any) {
  // TODO: 实现用户信息更新逻辑
  console.log('处理用户更新事件V3:', eventData);
}

/**
 * 处理审批实例事件
 */
async function handleApprovalInstance(eventData: any) {
  // TODO: 实现审批状态更新逻辑
  console.log('处理审批实例事件:', eventData);
}

/**
 * 处理接收消息事件
 */
async function handleReceiveMessage(eventData: any) {
  // TODO: 实现消息处理逻辑
  console.log('处理接收消息事件:', eventData);
}
