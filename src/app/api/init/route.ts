import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * 一键初始化 API
 * 用于在生产环境中初始化数据库和种子数据
 *
 * 使用方法：
 * POST /api/init
 * Headers: {
 *   "Content-Type": "application/json",
 *   "x-admin-key": "pulseopti-init-2025"
 * }
 * Body: {
 *   "force": false  // 是否强制重新初始化
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false } = body || {};

    // 验证密钥
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_INIT_KEY || 'pulseopti-init-2025';

    if (adminKey !== expectedKey) {
      return NextResponse.json({
        success: false,
        error: '未授权的请求',
        hint: '请提供正确的 x-admin-key 请求头',
      }, { status: 403 });
    }

    const steps: any[] = [];
    let hasError = false;

    // 步骤1: 初始化数据库表结构
    try {
      const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/init/database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ force }),
      });

      const dbText = await dbResponse.text();
      const dbData = dbText ? JSON.parse(dbText) : {};

      if (dbResponse.ok) {
        steps.push({
          step: 1,
          name: '数据库表结构',
          status: 'success',
          data: dbData.data,
        });
      } else {
        steps.push({
          step: 1,
          name: '数据库表结构',
          status: 'failed',
          error: dbData.error,
        });
        hasError = true;
      }
    } catch (error: any) {
      steps.push({
        step: 1,
        name: '数据库表结构',
        status: 'failed',
        error: error.message,
      });
      hasError = true;
    }

    // 步骤2: 初始化种子数据
    try {
      const seedResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/init/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ force }),
      });

      const seedText = await seedResponse.text();
      const seedData = seedText ? JSON.parse(seedText) : {};

      if (seedResponse.ok) {
        steps.push({
          step: 2,
          name: '种子数据',
          status: 'success',
          data: seedData.data,
        });
      } else {
        steps.push({
          step: 2,
          name: '种子数据',
          status: 'failed',
          error: seedData.error,
        });
        hasError = true;
      }
    } catch (error: any) {
      steps.push({
        step: 2,
        name: '种子数据',
        status: 'failed',
        error: error.message,
      });
      hasError = true;
    }

    // 步骤3: 验证超级管理员账号
    try {
      const adminEmail = process.env.ADMIN_EMAIL || '208343256@qq.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: adminEmail,
          password: adminPassword,
        }),
      });

      const loginText = await loginResponse.text();
      const loginData = loginText ? JSON.parse(loginText) : {};

      if (loginData.success) {
        steps.push({
          step: 3,
          name: '超级管理员登录验证',
          status: 'success',
          data: {
            email: loginData.data.user.email,
            name: loginData.data.user.name,
            isSuperAdmin: loginData.data.user.isSuperAdmin,
          },
        });
      } else {
        steps.push({
          step: 3,
          name: '超级管理员登录验证',
          status: 'failed',
          error: loginData.error || '登录失败',
        });
        hasError = true;
      }
    } catch (error: any) {
      steps.push({
        step: 3,
        name: '超级管理员登录验证',
        status: 'failed',
        error: error.message,
      });
      hasError = true;
    }

    return NextResponse.json({
      success: !hasError,
      message: hasError ? '初始化完成，但部分步骤失败' : '初始化成功',
      data: {
        steps,
        summary: {
          total: steps.length,
          success: steps.filter((s: any) => s.status === 'success').length,
          failed: steps.filter((s: any) => s.status === 'failed').length,
        },
      },
      adminInfo: {
        email: process.env.ADMIN_EMAIL || '208343256@qq.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        hint: '请妥善保管此信息，并在初始化后立即修改密码',
      },
    }, { status: hasError ? 500 : 200 });
  } catch (error) {
    console.error('一键初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET 请求返回初始化状态
 */
export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_INIT_KEY || 'pulseopti-init-2025';

    if (adminKey !== expectedKey) {
      return NextResponse.json({
        success: false,
        error: '未授权的请求',
      }, { status: 403 });
    }

    // 获取数据库状态
    const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/init/database`, {
      method: 'GET',
      headers: {
        'x-admin-key': adminKey,
      },
    });

    const dbText = await dbResponse.text();
    const dbData = dbText ? JSON.parse(dbText) : {};

    // 获取种子数据状态
    const seedResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/init/seed`, {
      method: 'GET',
      headers: {
        'x-admin-key': adminKey,
      },
    });

    const seedText = await seedResponse.text();
    const seedData = seedText ? JSON.parse(seedText) : {};

    return NextResponse.json({
      success: true,
      data: {
        database: dbData.success ? dbData.data : null,
        seed: seedData.success ? seedData.data : null,
        fullyInitialized: dbData.success && seedData.success &&
                           dbData.data.initialized && seedData.data.seeded,
      },
    });
  } catch (error) {
    console.error('获取初始化状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
