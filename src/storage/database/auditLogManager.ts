import { eq, and, SQL, desc, gte, lte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLogs, insertAuditLogSchema } from "./shared/schema";
import type { AuditLog, InsertAuditLog } from "./shared/schema";

export class AuditLogManager {
  async createLog(data: InsertAuditLog): Promise<AuditLog> {
    const db = await getDb();
    const validated = insertAuditLogSchema.parse(data);
    const [log] = await db.insert(auditLogs).values(validated).returning();
    return log;
  }

  async getLogs(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<AuditLog, 'id' | 'companyId' | 'userId' | 'action' | 'resourceType' | 'status'>
    >;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<AuditLog[]> {
    const { skip = 0, limit = 100, filters = {}, startDate, endDate } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(auditLogs.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(auditLogs.companyId, filters.companyId));
    }
    if (filters.userId !== undefined) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters.action !== undefined) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.resourceType !== undefined) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(auditLogs.status, filters.status));
    }
    if (startDate !== undefined) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }
    if (endDate !== undefined) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    const query = db.select().from(auditLogs);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(skip);
  }

  async getLogById(id: string): Promise<AuditLog | null> {
    const db = await getDb();
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return log || null;
  }

  async getCompanyLogs(companyId: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.companyId, companyId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getUserLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getLogsByResource(companyId: string, resourceType: string, resourceId: string): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.companyId, companyId),
          eq(auditLogs.resourceType, resourceType),
          eq(auditLogs.resourceId, resourceId)
        )
      )
      .orderBy(desc(auditLogs.createdAt));
  }

  // 快捷方法
  async logAction(data: {
    companyId: string;
    userId: string;
    userName?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    resourceName?: string;
    ipAddress?: string;
    userAgent?: string;
    changes?: any;
    status?: 'success' | 'failed';
    errorMessage?: string;
  }): Promise<AuditLog> {
    return this.createLog(data);
  }

  async deleteLog(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(auditLogs).where(eq(auditLogs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 清理过期日志（保留最近N天）
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const db = await getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db
      .delete(auditLogs)
      .where(lte(auditLogs.createdAt, cutoffDate));

    return result.rowCount ?? 0;
  }
}

export const auditLogManager = new AuditLogManager();
