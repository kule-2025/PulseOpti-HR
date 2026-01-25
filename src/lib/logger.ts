/**
 * 日志记录工具
 * 用于记录系统运行日志和审计日志
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LogType {
  SYSTEM = 'SYSTEM',
  API = 'API',
  DATABASE = 'DATABASE',
  WORKFLOW = 'WORKFLOW',
  AUTH = 'AUTH',
  AUDIT = 'AUDIT',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  type: LogType;
  message: string;
  userId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // 从环境变量读取日志级别
    const envLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLevel && Object.values(LogLevel).includes(envLevel)) {
      this.logLevel = envLevel;
    }
  }

  /**
   * 判断是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevel = levels.indexOf(this.logLevel);
    const targetLevel = levels.indexOf(level);
    return targetLevel >= currentLevel;
  }

  /**
   * 格式化日志消息
   */
  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level}]`,
      `[${entry.type}]`,
    ];

    if (entry.userId) parts.push(`[User:${entry.userId}]`);
    if (entry.companyId) parts.push(`[Company:${entry.companyId}]`);

    parts.push(entry.message);

    if (entry.error) {
      parts.push(`\nError: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`\nStack: ${entry.error.stack}`);
      }
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      parts.push(`\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`);
    }

    return parts.join(' ');
  }

  /**
   * 写入日志
   */
  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formattedLog = this.formatLog(entry);

    // 根据日志级别选择输出方式
    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }

    // TODO: 如果需要，可以在这里添加将日志写入文件的逻辑
    // 注意：根据环境限制，日志文件应该写入 /app/work/logs/bypass/ 目录
  }

  /**
   * 创建日志条目
   */
  private createEntry(
    level: LogLevel,
    type: LogType,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      type,
      message,
      userId: metadata?.userId,
      companyId: metadata?.companyId,
      metadata: metadata?.error ? undefined : metadata,
      error,
    };
  }

  /**
   * DEBUG级别日志
   */
  debug(type: LogType, message: string, metadata?: Record<string, any>): void {
    const entry = this.createEntry(LogLevel.DEBUG, type, message, metadata);
    this.writeLog(entry);
  }

  /**
   * INFO级别日志
   */
  info(type: LogType, message: string, metadata?: Record<string, any>): void {
    const entry = this.createEntry(LogLevel.INFO, type, message, metadata);
    this.writeLog(entry);
  }

  /**
   * WARN级别日志
   */
  warn(type: LogType, message: string, metadata?: Record<string, any>): void {
    const entry = this.createEntry(LogLevel.WARN, type, message, metadata);
    this.writeLog(entry);
  }

  /**
   * ERROR级别日志
   */
  error(type: LogType, message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createEntry(LogLevel.ERROR, type, message, metadata, error);
    this.writeLog(entry);
  }

  /**
   * API请求日志
   */
  apiRequest(method: string, path: string, userId?: string, companyId?: string): void {
    this.info(LogType.API, `API Request: ${method} ${path}`, {
      userId,
      companyId,
    });
  }

  /**
   * API响应日志
   */
  apiResponse(method: string, path: string, statusCode: number, duration: number): void {
    this.info(LogType.API, `API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, {
      statusCode,
      duration,
    });
  }

  /**
   * 数据库查询日志
   */
  dbQuery(query: string, duration: number, userId?: string): void {
    this.debug(LogType.DATABASE, `DB Query executed in ${duration}ms`, {
      query: query.substring(0, 100), // 只记录查询的前100个字符
      duration,
      userId,
    });
  }

  /**
   * 工作流日志
   */
  workflow(action: string, instanceId: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(LogType.WORKFLOW, `Workflow ${action}: ${instanceId}`, {
      userId,
      ...metadata,
    });
  }

  /**
   * 认证日志
   */
  auth(action: string, userId?: string, success: boolean = true): void {
    if (success) {
      this.info(LogType.AUTH, `Auth ${action} success`, { userId });
    } else {
      this.warn(LogType.AUTH, `Auth ${action} failed`, { userId });
    }
  }

  /**
   * 审计日志
   */
  audit(action: string, resource: string, resourceId: string, userId: string, companyId: string, changes?: Record<string, any>): void {
    this.info(LogType.AUDIT, `Audit: ${action} ${resource}:${resourceId}`, {
      userId,
      companyId,
      changes,
    });
  }
}

// 创建全局日志实例
export const logger = new Logger();

/**
 * 性能监控装饰器
 */
export function withPerformanceLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  logType: LogType = LogType.API
): Promise<T> {
  const startTime = Date.now();

  return operation().finally(() => {
    const duration = Date.now() - startTime;
    logger.info(logType, `${operationName} completed in ${duration}ms`, { duration });

    if (duration > 1000) {
      logger.warn(logType, `${operationName} took longer than expected (${duration}ms)`, {
        operationName,
        duration,
      });
    }
  });
}

/**
 * 错误监控装饰器
 */
export async function withErrorLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  logType: LogType = LogType.API,
  metadata?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(logType, `${operationName} failed`, error as Error, metadata);
    throw error;
  }
}

/**
 * 上下文日志记录器
 * 用于在特定上下文中记录日志
 */
export class ContextLogger {
  constructor(
    private context: {
      userId?: string;
      companyId?: string;
      requestId?: string;
    }
  ) {}

  private mergeMetadata(metadata?: Record<string, any>): Record<string, any> {
    return {
      ...this.context,
      ...metadata,
    };
  }

  debug(type: LogType, message: string, metadata?: Record<string, any>): void {
    logger.debug(type, message, this.mergeMetadata(metadata));
  }

  info(type: LogType, message: string, metadata?: Record<string, any>): void {
    logger.info(type, message, this.mergeMetadata(metadata));
  }

  warn(type: LogType, message: string, metadata?: Record<string, any>): void {
    logger.warn(type, message, this.mergeMetadata(metadata));
  }

  error(type: LogType, message: string, error?: Error, metadata?: Record<string, any>): void {
    logger.error(type, message, error, this.mergeMetadata(metadata));
  }
}

/**
 * 创建上下文日志记录器
 */
export function createContextLogger(context: {
  userId?: string;
  companyId?: string;
  requestId?: string;
}): ContextLogger {
  return new ContextLogger(context);
}
