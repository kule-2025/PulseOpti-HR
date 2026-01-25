/**
 * 数据验证和清理工具
 * 用于验证和清理用户输入数据
 */

import { z } from 'zod';

/**
 * 员工数据验证Schema
 */
export const employeeSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符'),
  employeeNo: z.string().min(1, '员工号不能为空').max(20, '员工号不能超过20个字符'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  departmentId: z.string().min(1, '部门ID不能为空'),
  positionId: z.string().min(1, '职位ID不能为空'),
  companyId: z.string().min(1, '公司ID不能为空'),
  hireDate: z.string().datetime('入职日期格式不正确'),
  salary: z.number().min(0, '薪资不能为负数'),
  employmentStatus: z.enum(['active', 'probation', 'resigned', 'terminated']),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  education: z.string().optional(),
  address: z.string().max(200, '地址不能超过200个字符').optional(),
  avatarUrl: z.string().url('头像URL格式不正确').optional(),
  bankAccount: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

/**
 * 部门数据验证Schema
 */
export const departmentSchema = z.object({
  name: z.string().min(1, '部门名称不能为空').max(50, '部门名称不能超过50个字符'),
  companyId: z.string().min(1, '公司ID不能为空'),
  managerId: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
});

/**
 * 职位数据验证Schema
 */
export const positionSchema = z.object({
  name: z.string().min(1, '职位名称不能为空').max(50, '职位名称不能超过50个字符'),
  companyId: z.string().min(1, '公司ID不能为空'),
  departmentId: z.string().min(1, '部门ID不能为空'),
  level: z.number().min(1, '职级不能小于1').max(10, '职级不能大于10').optional(),
  description: z.string().max(1000, '描述不能超过1000个字符').optional(),
  requirements: z.string().max(1000, '要求不能超过1000个字符').optional(),
  salaryRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
});

/**
 * 工作流实例数据验证Schema
 */
export const workflowInstanceSchema = z.object({
  workflowDefinitionId: z.string().min(1, '工作流定义ID不能为空'),
  companyId: z.string().min(1, '公司ID不能为空'),
  businessType: z.string().min(1, '业务类型不能为空'),
  businessId: z.string().min(1, '业务ID不能为空'),
  initiatorId: z.string().min(1, '发起人ID不能为空'),
  variables: z.record(z.any()).optional(),
});

/**
 * 审批操作验证Schema
 */
export const approvalActionSchema = z.object({
  instanceId: z.string().min(1, '实例ID不能为空'),
  nodeId: z.string().min(1, '节点ID不能为空'),
  approverId: z.string().min(1, '审批人ID不能为空'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: '操作类型必须是 approve 或 reject' }),
  }),
  comment: z.string().max(500, '评论不能超过500个字符').optional(),
});

/**
 * 清理字符串数据
 * 去除前后空格，防止XSS攻击
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * 清理对象数据
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]) as T[Extract<keyof T, string>];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]) as T[Extract<keyof T, string>];
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

/**
 * 验证员工数据
 */
export function validateEmployeeData(data: any): {
  valid: boolean;
  data?: any;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const validated = employeeSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { valid: false, errors };
  }
}

/**
 * 验证部门数据
 */
export function validateDepartmentData(data: any): {
  valid: boolean;
  data?: any;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const validated = departmentSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { valid: false, errors };
  }
}

/**
 * 验证职位数据
 */
export function validatePositionData(data: any): {
  valid: boolean;
  data?: any;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const validated = positionSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { valid: false, errors };
  }
}

/**
 * 验证工作流实例数据
 */
export function validateWorkflowInstanceData(data: any): {
  valid: boolean;
  data?: any;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const validated = workflowInstanceSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { valid: false, errors };
  }
}

/**
 * 验证审批操作数据
 */
export function validateApprovalActionData(data: any): {
  valid: boolean;
  data?: any;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const validated = approvalActionSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
    return { valid: false, errors };
  }
}

/**
 * 移除敏感字段
 * 从对象中移除密码、token等敏感字段
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey']
): Partial<T> {
  const sanitized = { ...obj };

  for (const field of sensitiveFields) {
    delete sanitized[field];
  }

  return sanitized;
}

/**
 * 脱敏处理
 * 对敏感信息进行脱敏处理
 */
export function maskSensitiveData(
  data: string,
  type: 'phone' | 'email' | 'idCard' | 'name'
): string {
  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'email':
      const [username, domain] = data.split('@');
      return `${username[0]}***@${domain}`;
    case 'idCard':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    case 'name':
      if (data.length <= 2) {
        return `${data[0]}*`;
      }
      return `${data[0]}${'*'.repeat(data.length - 2)}${data[data.length - 1]}`;
    default:
      return data;
  }
}

/**
 * 检查SQL注入
 * 简单的SQL注入检测
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE)\b)/i,
    /([';-])/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(XOR)\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * 验证数据安全性
 */
export function validateSecurity(data: Record<string, any>): {
  safe: boolean;
  issues?: string[];
} {
  const issues: string[] = [];

  for (const key in data) {
    if (typeof data[key] === 'string') {
      if (detectSqlInjection(data[key])) {
        issues.push(`字段 "${key}" 可能包含SQL注入`);
      }
    }
  }

  return {
    safe: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
  };
}

/**
 * 数据验证装饰器
 * 用于在API中自动验证数据
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  operation: (data: T) => Promise<any>
) {
  return async (data: any) => {
    try {
      const validated = schema.parse(data);
      return await operation(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => e.message).join('; ');
        throw new Error(`数据验证失败: ${errors}`);
      }
      throw error;
    }
  };
}
