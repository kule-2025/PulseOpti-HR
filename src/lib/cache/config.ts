/**
 * 缓存配置
 * 统一管理所有页面的缓存策略
 */

export interface CacheConfig {
  ttl: number; // 缓存时间（毫秒）
  enabled: boolean; // 是否启用
  keyPrefix: string; // 缓存键前缀
  staleWhileRevalidate?: boolean; // 是否在后台更新过期缓存
}

export const CACHE_CONFIG = {
  // 员工管理
  employees: {
    ttl: 3 * 60 * 1000, // 3 分钟
    enabled: true,
    keyPrefix: 'employees',
  } as CacheConfig,

  // 部门管理
  departments: {
    ttl: 10 * 60 * 1000, // 10 分钟（部门信息变化较少）
    enabled: true,
    keyPrefix: 'departments',
  } as CacheConfig,

  // 绩效管理
  performance: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'performance',
  } as CacheConfig,

  // 绩效目标
  goals: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'goals',
    staleWhileRevalidate: true,
  } as CacheConfig,

  // 招聘管理
  recruitment: {
    ttl: 2 * 60 * 1000, // 2 分钟（招聘信息变化较快）
    enabled: true,
    keyPrefix: 'recruitment',
  } as CacheConfig,

  // 候选人
  candidates: {
    ttl: 2 * 60 * 1000, // 2 分钟
    enabled: true,
    keyPrefix: 'candidates',
  } as CacheConfig,

  // 考勤管理
  attendance: {
    ttl: 1 * 60 * 1000, // 1 分钟（考勤数据实时性要求高）
    enabled: true,
    keyPrefix: 'attendance',
  } as CacheConfig,

  // 薪酬管理
  salary: {
    ttl: 30 * 60 * 1000, // 30 分钟（薪酬数据变化较少）
    enabled: true,
    keyPrefix: 'salary',
  } as CacheConfig,

  // 合规管理
  compliance: {
    ttl: 10 * 60 * 1000, // 10 分钟
    enabled: true,
    keyPrefix: 'compliance',
  } as CacheConfig,

  // HR报表
  hrReports: {
    ttl: 15 * 60 * 1000, // 15 分钟
    enabled: true,
    keyPrefix: 'hr-reports',
  } as CacheConfig,

  // 工作流
  workflows: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'workflows',
  } as CacheConfig,

  // 培训管理
  training: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'training',
  } as CacheConfig,

  // 离职管理
  offboarding: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'offboarding',
  } as CacheConfig,

  // 积分管理
  points: {
    ttl: 2 * 60 * 1000, // 2 分钟
    enabled: true,
    keyPrefix: 'points',
  } as CacheConfig,

  // 人效监测
  efficiency: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'efficiency',
  } as CacheConfig,

  // 组织架构
  organization: {
    ttl: 10 * 60 * 1000, // 10 分钟
    enabled: true,
    keyPrefix: 'organization',
  } as CacheConfig,

  // 通用默认配置
  default: {
    ttl: 5 * 60 * 1000, // 5 分钟
    enabled: true,
    keyPrefix: 'default',
  } as CacheConfig,
} as const;

/**
 * 获取缓存配置
 */
export function getCacheConfig(key: keyof typeof CACHE_CONFIG): CacheConfig {
  return CACHE_CONFIG[key] || CACHE_CONFIG.default;
}

/**
 * 构建缓存键
 */
export function buildCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return `${prefix}?${sortedParams}`;
}

/**
 * 根据数据类型确定是否应该缓存
 */
export function shouldCache(dataType: string): boolean {
  const config = CACHE_CONFIG[dataType as keyof typeof CACHE_CONFIG];
  return config ? config.enabled : true;
}

/**
 * 获取缓存 TTL
 */
export function getCacheTTL(dataType: string): number {
  const config = CACHE_CONFIG[dataType as keyof typeof CACHE_CONFIG];
  return config ? config.ttl : CACHE_CONFIG.default.ttl;
}
