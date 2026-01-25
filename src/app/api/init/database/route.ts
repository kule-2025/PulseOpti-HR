import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { force } = body || {};

    // 验证密钥（防止恶意调用）
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_INIT_KEY || 'pulseopti-init-2025';

    if (adminKey !== expectedKey) {
      return NextResponse.json({
        success: false,
        error: '未授权的请求',
      }, { status: 403 });
    }

    // 检查是否已经初始化
    try {
      const tablesResult = await db.execute(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      `);
      const hasTables = Number(tablesResult.rows[0].count) > 0;

      if (hasTables && !force) {
        return NextResponse.json({
          success: true,
          message: '数据库表已存在，无需初始化',
          data: { initialized: true },
        });
      }
    } catch (error) {
      // 表不存在，继续初始化
    }

    // 读取并执行 SQL 迁移文件
    try {
      const sqlPath = join(process.cwd(), 'drizzle', '0000_salty_phalanx.sql');
      const sqlContent = readFileSync(sqlPath, 'utf-8');

      // 分割 SQL 语句并执行
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await db.execute(statement);
        } catch (error: any) {
          // 忽略已存在的表错误
          if (!error.message.includes('already exists')) {
            console.warn('SQL 执行警告:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('读取 SQL 文件失败:', error);
    }

    // 读取并执行第二个 SQL 迁移文件（如果有）
    try {
      const sqlPath2 = join(process.cwd(), 'drizzle', '0001_add_max_sub_accounts.sql');
      const sqlContent2 = readFileSync(sqlPath2, 'utf-8');
      const statements2 = sqlContent2
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements2) {
        try {
          await db.execute(statement);
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            console.warn('SQL 执行警告:', error.message);
          }
        }
      }
    } catch (error) {
      // 文件不存在，忽略
    }

    // 验证表是否创建成功
    const tablesResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);

    return NextResponse.json({
      success: true,
      message: '数据库表结构初始化成功',
      data: {
        tables,
        count: tables.length,
        initialized: true,
      },
    });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

// GET 请求返回初始化状态
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

    const db = await getDb();

    // 检查表是否存在
    const tablesResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);
    const initialized = tables.length > 10; // 至少有10个表才算初始化完成

    return NextResponse.json({
      success: true,
      data: {
        initialized,
        tables,
        count: tables.length,
      },
    });
  } catch (error) {
    console.error('检查数据库状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
