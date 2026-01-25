/**
 * 租户管理API
 * 提供租户CRUD、配额管理、计费管理等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  tenantService, 
  Tenant, 
  TenantPlan,
  TenantQuotas
} from '@/lib/tenant/tenant-service';
import { withTenantAuth } from '@/lib/tenant/tenant-middleware';
import { z } from 'zod';

/**
 * POST /api/tenants
 * 创建新租户（仅限管理员）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const schema = z.object({
      name: z.string().min(2, '租户名称至少2个字符'),
      slug: z.string().min(2, '租户标识至少2个字符').regex(/^[a-z0-9-]+$/, '只能包含小写字母、数字和连字符'),
      contactName: z.string().min(2, '联系人姓名至少2个字符'),
      contactEmail: z.string().email('邮箱格式不正确'),
      plan: z.enum(['free', 'basic', 'professional', 'enterprise']),
      industry: z.string(),
      size: z.string(),
    });
    
    const validated = schema.parse(body);
    
    // 检查slug是否已存在
    // TODO: 检查数据库
    
    // 创建租户
    const tenant = await tenantService.createTenant(validated);
    
    return NextResponse.json({
      success: true,
      data: tenant,
      message: '租户创建成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建租户失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '创建失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tenants
 * 获取租户列表（仅限管理员）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');
    
    // TODO: 从数据库查询租户列表
    // 简化处理，返回空列表
    const tenants: Tenant[] = [];
    const total = 0;
    
    return NextResponse.json({
      success: true,
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取租户列表失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
