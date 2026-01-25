import { NextRequest, NextResponse } from 'next/server';
import { getDb, users, departments } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

// POST /api/integrations/feishu/sync - 飞书组织架构同步
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const body = await request.json();
    const { appAccessToken, tenantAccessToken } = body;

    // 验证飞书访问令牌
    if (!appAccessToken && !tenantAccessToken) {
      return NextResponse.json({ error: '缺少飞书访问令牌' }, { status: 400 });
    }

    const db = await getDb();

    // 模拟飞书API调用
    // 实际应该调用飞书的API获取组织架构数据
    const mockFeishuData = {
      departments: [
        { id: 'feishu_dept_1', name: '技术部', parent_id: '0' },
        { id: 'feishu_dept_2', name: '产品部', parent_id: '0' },
        { id: 'feishu_dept_3', name: '人事部', parent_id: '0' },
      ],
      users: [
        {
          user_id: 'feishu_user_1',
          name: '张三',
          email: 'zhangsan@example.com',
          mobile: '13800138001',
          department_ids: ['feishu_dept_1'],
          position: '前端工程师',
        },
        {
          user_id: 'feishu_user_2',
          name: '李四',
          email: 'lisi@example.com',
          mobile: '13800138002',
          department_ids: ['feishu_dept_2'],
          position: '产品经理',
        },
      ],
    };

    // 同步部门数据
    let syncedDepartments = 0;
    for (const dept of mockFeishuData.departments) {
      await db.insert(departments).values({
        id: dept.id,
        name: dept.name,
        companyId: decoded.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
      syncedDepartments++;
    }

    // 同步用户数据
    let syncedUsers = 0;
    for (const user of mockFeishuData.users) {
      await db.insert(users).values({
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.mobile,
        companyId: decoded.companyId,
        role: 'employee',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
      syncedUsers++;
    }

    return NextResponse.json({
      success: true,
      message: '飞书组织架构同步成功',
      data: {
        syncedDepartments,
        syncedUsers,
        totalDepartments: mockFeishuData.departments.length,
        totalUsers: mockFeishuData.users.length,
      },
    });
  } catch (error) {
    console.error('Error syncing Feishu:', error);
    return NextResponse.json(
      { error: '飞书同步失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/integrations/feishu/auth - 飞书SSO认证
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: '缺少授权码' }, { status: 400 });
    }

    // 使用授权码换取访问令牌
    // 实际应该调用飞书的OAuth API
    const mockToken = {
      access_token: 'mock_access_token_' + Date.now(),
      expires_in: 7200,
      refresh_token: 'mock_refresh_token',
      user_info: {
        user_id: 'feishu_user_1',
        name: '张三',
        email: 'zhangsan@example.com',
      },
    };

    // 创建或更新用户会话
    // ... 这里应该实现用户登录逻辑

    return NextResponse.json({
      success: true,
      message: '飞书登录成功',
      data: mockToken,
    });
  } catch (error) {
    console.error('Error in Feishu SSO:', error);
    return NextResponse.json(
      { error: '飞书SSO失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
