/**
 * 多租户SaaS架构服务
 * 实现租户隔离、认证、配置和计费管理
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string; // 租户唯一标识（子域名）
  logo?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  
  // 联系信息
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  
  // 配置
  timezone: string;
  locale: string;
  currency: string;
  
  // 订阅信息
  plan: TenantPlan;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  
  // 资源配额
  quotas: TenantQuotas;
  usage: TenantUsage;
  
  // 元数据
  metadata?: Record<string, any>;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

export type TenantPlan = 
  | 'free'           // 免费版
  | 'basic'          // 基础版
  | 'professional'   // 专业版
  | 'enterprise';    // 企业版

export interface TenantQuotas {
  maxUsers: number;
  maxEmployees: number;
  maxStorageGB: number;
  maxApiCallsPerMonth: number;
  maxReportsPerMonth: number;
  maxAiQueriesPerMonth: number;
  features: string[];
}

export interface TenantUsage {
  users: number;
  employees: number;
  storageGB: number;
  apiCallsThisMonth: number;
  reportsThisMonth: number;
  aiQueriesThisMonth: number;
  lastResetDate: Date;
}

export interface TenantConfig {
  // 功能开关
  features: {
    aiInterview: boolean;
    turnoverPrediction: boolean;
    performancePrediction: boolean;
    customReports: boolean;
    realTimeDashboard: boolean;
    industryComparison: boolean;
    salaryManagement: boolean;
    talentMap: boolean;
    knowledgeBase: boolean;
  };
  
  // 自定义配置
  customizations: {
    primaryColor?: string;
    logo?: string;
    favicon?: string;
    customDomain?: string;
  };
  
  // 集成配置
  integrations: {
    feishu?: {
      enabled: boolean;
      appId?: string;
      appSecret?: string;
    };
    wechat?: {
      enabled: boolean;
      appId?: string;
      appSecret?: string;
    };
    email?: {
      enabled: boolean;
      provider: 'smtp' | 'aliyun' | 'tencent';
      config?: Record<string, any>;
    };
  };
  
  // 安全配置
  security: {
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number; // 分钟
    ipWhitelist?: string[];
  };
}

export class TenantService {
  private tenantCache: Map<string, Tenant> = new Map();
  private configCache: Map<string, TenantConfig> = new Map();
  
  /**
   * 根据租户ID获取租户信息
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    // 先从缓存读取
    if (this.tenantCache.has(tenantId)) {
      return this.tenantCache.get(tenantId)!;
    }
    
    // TODO: 从数据库读取
    const tenant = await this.loadTenantFromDb(tenantId);
    
    if (tenant) {
      this.tenantCache.set(tenantId, tenant);
    }
    
    return tenant;
  }
  
  /**
   * 根据租户Slug获取租户信息
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    // TODO: 从数据库查询
    // 简化处理，直接返回null
    return null;
  }
  
  /**
   * 获取租户配置
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // 先从缓存读取
    if (this.configCache.has(tenantId)) {
      return this.configCache.get(tenantId)!;
    }
    
    // TODO: 从数据库读取
    const config = await this.loadConfigFromDb(tenantId);
    
    this.configCache.set(tenantId, config);
    
    return config;
  }
  
  /**
   * 创建租户
   */
  async createTenant(data: {
    name: string;
    slug: string;
    contactName: string;
    contactEmail: string;
    plan: TenantPlan;
    industry: string;
    size: string;
  }): Promise<Tenant> {
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: data.name,
      slug: data.slug,
      industry: data.industry,
      size: data.size as any,
      status: 'active',
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      timezone: 'Asia/Shanghai',
      locale: 'zh-CN',
      currency: 'CNY',
      plan: data.plan,
      subscriptionStatus: 'trial',
      subscriptionStartDate: new Date(),
      quotas: this.getPlanQuotas(data.plan),
      usage: this.getEmptyUsage(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 设置试用到期时间（30天）
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    tenant.subscriptionEndDate = trialEndDate;
    
    // TODO: 保存到数据库
    console.log('创建租户:', tenant);
    
    // 缓存租户信息
    this.tenantCache.set(tenant.id, tenant);
    
    return tenant;
  }
  
  /**
   * 更新租户信息
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('租户不存在');
    }
    
    // 更新字段
    Object.assign(tenant, updates, { updatedAt: new Date() });
    
    // TODO: 保存到数据库
    console.log('更新租户:', tenant);
    
    // 更新缓存
    this.tenantCache.set(tenantId, tenant);
    
    return tenant;
  }
  
  /**
   * 更新租户配置
   */
  async updateTenantConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig> {
    const existingConfig = await this.getTenantConfig(tenantId);
    
    // 深度合并配置
    const newConfig = this.deepMerge(existingConfig, config);
    
    // TODO: 保存到数据库
    console.log('更新租户配置:', newConfig);
    
    // 更新缓存
    this.configCache.set(tenantId, newConfig);
    
    return newConfig;
  }
  
  /**
   * 检查租户是否激活
   */
  async isTenantActive(tenantId: string): Promise<boolean> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) return false;
    
    if (tenant.status !== 'active') return false;
    
    // 检查订阅是否过期
    if (tenant.subscriptionEndDate && new Date() > tenant.subscriptionEndDate) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查租户配额
   */
  async checkQuota(tenantId: string, resource: keyof TenantQuotas): Promise<{
    allowed: boolean;
    current: number;
    max: number;
    exceeded: boolean;
  }> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('租户不存在');
    }
    
    const quotas = tenant.quotas;
    const usage = tenant.usage;
    
    let current = 0;
    let max = 0;
    
    switch (resource) {
      case 'maxUsers':
        current = usage.users;
        max = quotas.maxUsers;
        break;
      case 'maxEmployees':
        current = usage.employees;
        max = quotas.maxEmployees;
        break;
      case 'maxStorageGB':
        current = usage.storageGB;
        max = quotas.maxStorageGB;
        break;
      case 'maxApiCallsPerMonth':
        current = usage.apiCallsThisMonth;
        max = quotas.maxApiCallsPerMonth;
        break;
      case 'maxReportsPerMonth':
        current = usage.reportsThisMonth;
        max = quotas.maxReportsPerMonth;
        break;
      case 'maxAiQueriesPerMonth':
        current = usage.aiQueriesThisMonth;
        max = quotas.maxAiQueriesPerMonth;
        break;
    }
    
    const exceeded = current >= max;
    const allowed = !exceeded;
    
    return {
      allowed,
      current,
      max,
      exceeded,
    };
  }
  
  /**
   * 更新资源使用量
   */
  async updateUsage(tenantId: string, resource: keyof TenantUsage, increment: number = 1): Promise<void> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('租户不存在');
    }
    
    // 检查是否需要重置月度统计
    const now = new Date();
    const lastReset = tenant.usage.lastResetDate;
    const shouldReset = 
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();
    
    if (shouldReset) {
      // 重置月度统计
      tenant.usage.apiCallsThisMonth = 0;
      tenant.usage.reportsThisMonth = 0;
      tenant.usage.aiQueriesThisMonth = 0;
      tenant.usage.lastResetDate = now;
    }
    
    // 更新使用量
    const currentValue = tenant.usage[resource] as number;
    tenant.usage[resource] = currentValue + increment;
    
    // TODO: 保存到数据库
    console.log('更新租户使用量:', tenantId, resource, increment);
    
    // 更新缓存
    this.tenantCache.set(tenantId, tenant);
  }
  
  /**
   * 升级/降级订阅计划
   */
  async changePlan(tenantId: string, newPlan: TenantPlan): Promise<Tenant> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('租户不存在');
    }
    
    // 更新计划
    tenant.plan = newPlan;
    tenant.quotas = this.getPlanQuotas(newPlan);
    tenant.updatedAt = new Date();
    
    // TODO: 保存到数据库
    console.log('更改订阅计划:', tenantId, newPlan);
    
    // 更新缓存
    this.tenantCache.set(tenantId, tenant);
    
    return tenant;
  }
  
  /**
   * 暂停租户
   */
  async suspendTenant(tenantId: string, reason: string): Promise<Tenant> {
    return await this.updateTenant(tenantId, {
      status: 'suspended',
      metadata: {
        ...this.tenantCache.get(tenantId)?.metadata,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString(),
      },
    });
  }
  
  /**
   * 取消租户
   */
  async cancelTenant(tenantId: string): Promise<Tenant> {
    return await this.updateTenant(tenantId, {
      status: 'cancelled',
      subscriptionEndDate: new Date(),
    });
  }
  
  /**
   * 获取租户统计信息
   */
  async getTenantStats(tenantId: string): Promise<{
    users: number;
    employees: number;
    storageUsage: number;
    apiCallsThisMonth: number;
    reportsThisMonth: number;
    aiQueriesThisMonth: number;
    quotaPercentages: Record<string, number>;
  }> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('租户不存在');
    }
    
    const quotaPercentages: Record<string, number> = {};
    
    for (const [key, quota] of Object.entries(tenant.quotas)) {
      if (typeof quota === 'number') {
        const usageKey = key.replace('max', '').toLowerCase();
        // @ts-ignore
        const usageValue = tenant.usage[usageKey];
        quotaPercentages[key] = usageValue > 0 ? Math.round((usageValue / quota) * 100) : 0;
      }
    }
    
    return {
      users: tenant.usage.users,
      employees: tenant.usage.employees,
      storageUsage: tenant.usage.storageGB,
      apiCallsThisMonth: tenant.usage.apiCallsThisMonth,
      reportsThisMonth: tenant.usage.reportsThisMonth,
      aiQueriesThisMonth: tenant.usage.aiQueriesThisMonth,
      quotaPercentages,
    };
  }
  
  // ==================== 私有方法 ====================
  
  private getPlanQuotas(plan: TenantPlan): TenantQuotas {
    const quotas: Record<TenantPlan, TenantQuotas> = {
      free: {
        maxUsers: 5,
        maxEmployees: 10,
        maxStorageGB: 1,
        maxApiCallsPerMonth: 1000,
        maxReportsPerMonth: 10,
        maxAiQueriesPerMonth: 50,
        features: [
          'basic-employees',
          'basic-attendance',
          'basic-performance',
        ],
      },
      basic: {
        maxUsers: 20,
        maxEmployees: 100,
        maxStorageGB: 10,
        maxApiCallsPerMonth: 10000,
        maxReportsPerMonth: 100,
        maxAiQueriesPerMonth: 500,
        features: [
          'basic-employees',
          'basic-attendance',
          'basic-performance',
          'recruitment',
          'basic-reports',
          'salary-management',
        ],
      },
      professional: {
        maxUsers: 100,
        maxEmployees: 500,
        maxStorageGB: 50,
        maxApiCallsPerMonth: 100000,
        maxReportsPerMonth: 500,
        maxAiQueriesPerMonth: 5000,
        features: [
          'all-basic',
          'ai-interview',
          'turnover-prediction',
          'performance-prediction',
          'custom-reports',
          'realtime-dashboard',
          'industry-comparison',
          'talent-map',
          'knowledge-base',
        ],
      },
      enterprise: {
        maxUsers: -1, // 无限制
        maxEmployees: -1,
        maxStorageGB: 500,
        maxApiCallsPerMonth: -1,
        maxReportsPerMonth: -1,
        maxAiQueriesPerMonth: -1,
        features: [
          'all',
          'custom-integrations',
          'dedicated-support',
          'sla-guarantee',
          'advanced-analytics',
          'white-label',
        ],
      },
    };
    
    return quotas[plan];
  }
  
  private getEmptyUsage(): TenantUsage {
    return {
      users: 0,
      employees: 0,
      storageGB: 0,
      apiCallsThisMonth: 0,
      reportsThisMonth: 0,
      aiQueriesThisMonth: 0,
      lastResetDate: new Date(),
    };
  }
  
  private async loadTenantFromDb(tenantId: string): Promise<Tenant | null> {
    // TODO: 从数据库加载租户信息
    // 这里简化处理，返回null
    return null;
  }
  
  private async loadConfigFromDb(tenantId: string): Promise<TenantConfig> {
    // TODO: 从数据库加载租户配置
    // 这里返回默认配置
    return {
      features: {
        aiInterview: false,
        turnoverPrediction: false,
        performancePrediction: false,
        customReports: false,
        realTimeDashboard: false,
        industryComparison: false,
        salaryManagement: false,
        talentMap: false,
        knowledgeBase: false,
      },
      customizations: {},
      integrations: {},
      security: {
        mfaRequired: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false,
        },
        sessionTimeout: 60,
      },
    };
  }
  
  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// 导出单例
export const tenantService = new TenantService();
