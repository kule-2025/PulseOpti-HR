import { NextRequest, NextResponse } from 'next/server';
import { feishuService } from '@/lib/feishu/feishu-service';

/**
 * 同步飞书用户和部门
 * POST /api/feishu/sync
 * Body: { syncDepartments?, syncUsers?, departmentId?, forceSync? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      syncDepartments = true,
      syncUsers = true,
      departmentId,
      forceSync = false,
    } = body;

    // 执行同步
    const result = await feishuService.syncFromFeishu({
      syncDepartments,
      syncUsers,
      departmentId,
      forceSync,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `同步完成：部门 ${result.departments.created}/${result.departments.updated}/${result.departments.skipped}，用户 ${result.users.created}/${result.users.updated}/${result.users.skipped}`,
    });
  } catch (error) {
    console.error('飞书同步失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '同步失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
