import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, paymentProofs } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 上传支付凭证
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // 验证必填字段
    if (!orderId || !file) {
      return NextResponse.json(
        { error: '缺少订单号或支付凭证' },
        { status: 400 }
      );
    }

    // 获取数据库实例
    const db = await getDb();

    // 查询订单
    const orderList = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderList[0];

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 检查订单是否已支付
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: '订单已支付，无需重复上传',
      });
    }

    // 检查订单是否已过期（超过30分钟未支付）
    if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
      return NextResponse.json(
        { error: '订单已过期，请重新下单' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 检查文件大小（最大5MB）
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      );
    }

    // 检查文件类型（只允许图片）
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '只支持上传图片文件（JPG、PNG、GIF、WebP）' },
        { status: 400 }
      );
    }

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: `payment-proofs/${orderId}-${Date.now()}.${file.type.split('/')[1]}`,
      contentType: file.type,
    });

    // 生成签名URL（有效期7天）
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 7 * 24 * 3600,
    });

    // 保存支付凭证记录
    await db.insert(paymentProofs).values({
      id: fileKey,
      orderId: orderId,
      userId: userId || null,
      fileName: file.name,
      fileUrl: signedUrl,
      fileKey: fileKey, // 存储对象key以便后续使用
      fileSize: buffer.length,
      fileType: file.type,
      status: 'pending', // 待审核
      uploadedAt: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '支付凭证上传成功，请等待后台审核',
      proofId: fileKey,
      fileUrl: signedUrl,
    });

  } catch (error) {
    console.error('上传支付凭证失败:', error);
    return NextResponse.json(
      { error: '上传支付凭证失败' },
      { status: 500 }
    );
  }
}

// 获取订单的支付凭证列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const proofList = await db.select()
      .from(paymentProofs)
      .where(eq(paymentProofs.orderId, orderId));

    return NextResponse.json({
      success: true,
      data: proofList,
    });

  } catch (error) {
    console.error('获取支付凭证失败:', error);
    return NextResponse.json(
      { error: '获取支付凭证失败' },
      { status: 500 }
    );
  }
}
