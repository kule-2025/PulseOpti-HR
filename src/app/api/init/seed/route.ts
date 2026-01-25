import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { force = false } = body || {};

    // 验证密钥
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_INIT_KEY || 'pulseopti-init-2025';

    if (adminKey !== expectedKey) {
      return NextResponse.json({
        success: false,
        error: '未授权的请求',
      }, { status: 403 });
    }

    const results: any[] = [];

    // 1. 创建系统设置
    try {
      // 检查表是否存在
      const tableExists = await db.execute(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'system_settings'
      `);

      if (tableExists.rows.length === 0) {
        // 表不存在，创建它
        await db.execute(`
          CREATE TABLE IF NOT EXISTS system_settings (
            id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
            site_name varchar(255) NOT NULL DEFAULT 'PulseOpti HR 脉策聚效',
            site_url varchar(500),
            logo_url text,
            favicon_url text,
            enable_registration boolean NOT NULL DEFAULT true,
            enable_email_verification boolean NOT NULL DEFAULT true,
            enable_sms_verification boolean NOT NULL DEFAULT true,
            enable_audit_logs boolean NOT NULL DEFAULT true,
            enable_notifications boolean NOT NULL DEFAULT true,
            maintenance_mode boolean NOT NULL DEFAULT false,
            maintenance_message text,
            contact_email varchar(255),
            contact_phone varchar(20),
            contact_address text,
            custom_css text,
            custom_js text,
            privacy_policy_url text,
            terms_of_service_url text,
            metadata jsonb,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone
          )
        `);
      }

      // 检查是否已有数据
      const existingSettings = await db.execute(`
        SELECT id, site_name FROM system_settings LIMIT 1
      `);

      if (existingSettings.rows.length === 0 || force) {
        if (force && existingSettings.rows.length > 0) {
          await db.execute(`DELETE FROM system_settings`);
        }

        const insertResult = await db.execute(`
          INSERT INTO system_settings (
            site_name, site_url, enable_registration, enable_email_verification,
            enable_sms_verification, enable_audit_logs, enable_notifications,
            maintenance_mode, contact_email, contact_phone, contact_address
          ) VALUES (
            'PulseOpti HR 脉策聚效',
            'https://www.aizhixuan.com.cn',
            true, true, true, true, true, false,
            '208343256@qq.com', '400-888-8888', '北京市朝阳区'
          )
          RETURNING id, site_name
        `);

        results.push({
          name: '系统设置',
          action: '创建',
          data: insertResult.rows[0],
        });
      } else {
        results.push({
          name: '系统设置',
          action: '跳过',
          data: { id: existingSettings.rows[0].id, reason: '已存在' },
        });
      }
    } catch (error: any) {
      results.push({
        name: '系统设置',
        action: '失败',
        error: error.message,
      });
    }

    // 2. 创建默认公司
    let defaultCompanyId: string | null = null;
    try {
      const existingCompany = await db.execute(`
        SELECT id, name FROM companies WHERE code = 'DEFAULT' LIMIT 1
      `);

      if (existingCompany.rows.length === 0 || force) {
        if (force && existingCompany.rows.length > 0) {
          await db.execute(`DELETE FROM companies WHERE code = 'DEFAULT'`);
        }

        const companyResult = await db.execute(`
          INSERT INTO companies (
            name, code, industry, size, subscription_tier, max_employees, max_admin_accounts, is_active
          ) VALUES (
            '默认公司', 'DEFAULT', '互联网', '50-200', 'enterprise', 1000, 10, true
          )
          RETURNING id, name
        `);

        defaultCompanyId = companyResult.rows[0].id as string;
        results.push({
          name: '默认公司',
          action: '创建',
          data: companyResult.rows[0],
        });
      } else {
        defaultCompanyId = existingCompany.rows[0].id as string;
        results.push({
          name: '默认公司',
          action: '跳过',
          data: { id: existingCompany.rows[0].id as string, reason: '已存在' },
        });
      }
    } catch (error: any) {
      results.push({
        name: '默认公司',
        action: '失败',
        error: error.message,
      });
    }

    // 3. 创建超级管理员
    try {
      const adminEmail = process.env.ADMIN_EMAIL || '208343256@qq.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      const existingAdmin = await db.execute(
        `SELECT id, email, name FROM users WHERE email = '${adminEmail}' LIMIT 1`
      );

      if (existingAdmin.rows.length === 0 || force) {
        const hashedPassword = await hash(adminPassword, 10);

        if (existingAdmin.rows.length === 0) {
          const adminResult = await db.execute(`
            INSERT INTO users (
              email, username, password, name, role, is_super_admin,
              company_id, user_type, is_active, phone
            ) VALUES (
              '${adminEmail}', '${adminEmail}', '${hashedPassword}', '超级管理员', 'admin', true,
              '${defaultCompanyId}', 'developer', true, '13800138000'
            )
            RETURNING id, email, name, is_super_admin
          `);

          results.push({
            name: '超级管理员',
            action: '创建',
            data: adminResult.rows[0],
          });
        } else {
          results.push({
            name: '超级管理员',
            action: '跳过',
            data: {
              id: existingAdmin.rows[0].id,
              email: existingAdmin.rows[0].email,
              reason: '已存在',
            },
          });
        }
      } else {
        results.push({
          name: '超级管理员',
          action: '跳过',
          data: {
            id: existingAdmin.rows[0].id,
            email: existingAdmin.rows[0].email,
            reason: '已存在',
          },
        });
      }
    } catch (error: any) {
      results.push({
        name: '超级管理员',
        action: '失败',
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: '种子数据初始化完成',
      data: {
        results,
        summary: {
          total: results.length,
          success: results.filter((r: any) => r.action === '创建' || r.action === '跳过').length,
          failed: results.filter((r: any) => r.action === '失败').length,
        },
      },
    });
  } catch (error) {
    console.error('种子数据初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

// GET 请求返回种子数据状态
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

    // 检查系统设置
    const settings = await db.execute(`SELECT id FROM system_settings LIMIT 1`);
    const hasSettings = settings.rows.length > 0;

    // 检查公司
    const companies = await db.execute(`SELECT id, name FROM companies LIMIT 1`);
    const hasCompanies = companies.rows.length > 0;

    // 检查超级管理员
    const adminEmail = process.env.ADMIN_EMAIL || '208343256@qq.com';
    const admins = await db.execute(
      `SELECT id, email FROM users WHERE email = '${adminEmail}' LIMIT 1`
    );
    const hasAdmin = admins.rows.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        seeded: hasSettings && hasCompanies && hasAdmin,
        hasSettings,
        hasCompanies,
        hasAdmin,
        adminEmail,
        adminExists: hasAdmin,
        companyName: hasCompanies ? companies.rows[0].name : null,
      },
    });
  } catch (error) {
    console.error('检查种子数据状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
