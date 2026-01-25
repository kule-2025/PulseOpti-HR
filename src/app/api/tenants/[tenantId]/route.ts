/**
 * 租户详情管理API
 * 提供租户详情、配置、配额、计费等管理功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { tenantService, TenantPlan, TenantConfig } from '@/lib/tenant/tenant-service';
import { withTenantAuth } from '@/lib/tenant/tenant-middleware';
import { z } from 'zod';

/**
 * GET /api/tenants/[tenantId]
 * 获取租户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    const tenant = await tenantService.getTenantById(tenantId);
    
    if (!tenant) {
      return NextResponse.json(
        { error: '租户不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error('获取租户详情失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tenants/[tenantId]
 * 更新租户信息
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();
    
    // 允许更新的字段
    const allowedFields = [
      'name', 'logo', 'contactName', 'contactEmail', 
      'contactPhone', 'address', 'timezone', 'locale', 'currency'
    ];
    
    // 过滤字段
    const updates: Partial<Tenant> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // @ts-ignore
        updates[field] = body[field];
      }
    }
    
    const tenant = await tenantService.updateTenant(tenantId, updates);
    
    return NextResponse.json({
      success: true,
      data: tenant,
      message: '租户信息更新成功',
    });
  } catch (error) {
    console.error('更新租户失败:', error);
    return NextResponse.json(
      { error: '更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[tenantId]
 * 取消租户（仅限管理员）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    // TODO: 验证管理员权限
    
    const tenant = await tenantService.cancelTenant(tenantId);
    
    return NextResponse.json({
      success: true,
      data: tenant,
      message: '租户已取消',
    });
  } catch (error) {
    console.error('取消租户失败:', error);
    return NextResponse.json(
      { error: '取消失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
