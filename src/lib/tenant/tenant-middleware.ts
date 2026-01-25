/**
 * 租户认证中间件
 * 实现租户隔离和认证
 */

import { NextRequest, NextResponse } from 'next/server';
import { tenantService, Tenant } from './tenant-service';

export interface TenantContext {
  tenantId: string;
  tenant: Tenant;
  userId?: string;
  userRole?: string;
}

/**
 * 从请求中提取租户信息
 */
export async function extractTenantFromRequest(request: NextRequest): Promise<{
  tenantId: string | null;
  source: 'header' | 'subdomain' | 'query' | 'session';
}> {
  // 1. 从Header中获取（最优先）
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId) {
    return { tenantId: headerTenantId, source: 'header' };
  }
  
  // 2. 从子域名中获取
  const host = request.headers.get('host') || '';
  const subdomainMatch = host.match(/^([^.]+)\./);
  if (subdomainMatch) {
    const slug = subdomainMatch[1];
    // TODO: 根据slug查找tenantId
    // const tenant = await tenantService.getTenantBySlug(slug);
    // return { tenantId: tenant?.id || null, source: 'subdomain' };
  }
  
  // 3. 从查询参数中获取
  const { searchParams } = new URL(request.url);
  const queryTenantId = searchParams.get('tenantId');
  if (queryTenantId) {
    return { tenantId: queryTenantId, source: 'query' };
  }
  
  // 4. 从Session中获取
  // TODO: 从session中获取tenantId
  
  return { tenantId: null, source: 'session' };
}

/**
 * 验证租户是否存在且激活
 */
export async function validateTenant(tenantId: string): Promise<{
  valid: boolean;
  tenant?: Tenant;
  error?: string;
}> {
  if (!tenantId) {
    return { valid: false, error: '缺少租户ID' };
  }
  
  const tenant = await tenantService.getTenantById(tenantId);
  
  if (!tenant) {
    return { valid: false, error: '租户不存在' };
  }
  
  if (tenant.status !== 'active') {
    return { valid: false, error: `租户已被${tenant.status === 'suspended' ? '暂停' : '取消'}` };
  }
  
  // 检查订阅是否过期
  if (tenant.subscriptionEndDate && new Date() > tenant.subscriptionEndDate) {
    return { valid: false, error: '订阅已过期' };
  }
  
  return { valid: true, tenant };
}

/**
 * 租户认证中间件
 */
export async function withTenantAuth(
  request: NextRequest,
  handler: (context: TenantContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 提取租户信息
    const { tenantId, source } = await extractTenantFromRequest(request);
    
    if (!tenantId) {
      return NextResponse.json(
        { error: '缺少租户ID，请在请求头中提供 x-tenant-id' },
        { status: 401 }
      );
    }
    
    // 验证租户
    const validation = await validateTenant(tenantId);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }
    
    // TODO: 验证用户身份
    // 可以从session、JWT等获取用户信息
    
    const context: TenantContext = {
      tenantId,
      tenant: validation.tenant!,
    };
    
    // 调用处理函数
    return await handler(context);
  } catch (error) {
    console.error('租户认证错误:', error);
    return NextResponse.json(
      { error: '认证失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 检查租户功能是否可用
 */
export async function checkTenantFeature(
  tenantId: string,
  feature: keyof TenantContext['tenant']['quotas']['features'] | string
): Promise<{
  available: boolean;
  reason?: string;
}> {
  const tenant = await tenantService.getTenantById(tenantId);
  
  if (!tenant) {
    return { available: false, reason: '租户不存在' };
  }
  
  // 检查功能开关
  const config = await tenantService.getTenantConfig(tenantId);
  
  // 映射功能名称到配置key
  const featureMap: Record<string, keyof TenantContext['tenant']['quotas']['features']> = {
    'ai-interview': 'aiInterview',
    'turnover-prediction': 'turnoverPrediction',
    'performance-prediction': 'performancePrediction',
    'custom-reports': 'customReports',
    'realtime-dashboard': 'realTimeDashboard',
    'industry-comparison': 'industryComparison',
    'salary-management': 'salaryManagement',
    'talent-map': 'talentMap',
    'knowledge-base': 'knowledgeBase',
  };
  
  const configKey = featureMap[feature];
  
  if (configKey) {
    const enabled = config.features[configKey];
    if (!enabled) {
      return { available: false, reason: '当前订阅计划不支持此功能' };
    }
  }
  
  // 检查配额
  const quotaMap: Record<string, keyof TenantContext['tenant']['quotas']> = {
    'ai-interview': 'maxAiQueriesPerMonth',
    'custom-reports': 'maxReportsPerMonth',
    'industry-comparison': 'maxReportsPerMonth',
  };
  
  const quotaKey = quotaMap[feature];
  
  if (quotaKey) {
    const quota = await tenantService.checkQuota(tenantId, quotaKey);
    if (quota.exceeded) {
      return { available: false, reason: `已达到配额限制 (${quota.current}/${quota.max})` };
    }
  }
  
  return { available: true };
}

/**
 * 带功能检查的中间件
 */
export async function withFeatureCheck(
  request: NextRequest,
  feature: string,
  handler: (context: TenantContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return withTenantAuth(request, async (context) => {
    const featureCheck = await checkTenantFeature(context.tenantId, feature);
    
    if (!featureCheck.available) {
      return NextResponse.json(
        { error: '功能不可用', reason: featureCheck.reason },
        { status: 403 }
      );
    }
    
    return await handler(context);
  });
}

/**
 * 创建租户上下文助手（用于Server Components）
 */
export async function createTenantContext(tenantId: string): Promise<TenantContext | null> {
  const validation = await validateTenant(tenantId);
  
  if (!validation.valid) {
    return null;
  }
  
  return {
    tenantId,
    tenant: validation.tenant!,
  };
}

/**
 * 在数据库查询中应用租户过滤
 */
export function applyTenantFilter<T extends Record<string, any>>(
  query: any,
  tenantId: string
): any {
  return query.where(eq(query._.schema.tenantId, tenantId));
}
