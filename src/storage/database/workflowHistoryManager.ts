import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  workflowHistory,
  type WorkflowHistory as WorkflowHistoryType,
  type InsertWorkflowHistory,
} from './shared/schema';

export class WorkflowHistoryManager {
  async createHistory(data: InsertWorkflowHistory): Promise<WorkflowHistoryType> {
    const db = await getDb();
    const [history] = await db.insert(workflowHistory).values(data).returning();
    return history;
  }

  async getHistory(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      instanceId: string;
      type: string;
      action: string;
      actorId: string;
      stepId: string;
    }>;
  } = {}): Promise<WorkflowHistoryType[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(workflowHistory.companyId, filters.companyId));
    }
    if (filters.instanceId !== undefined) {
      conditions.push(eq(workflowHistory.instanceId, filters.instanceId));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(workflowHistory.type, filters.type));
    }
    if (filters.action !== undefined) {
      conditions.push(eq(workflowHistory.action, filters.action));
    }
    if (filters.actorId !== undefined) {
      conditions.push(eq(workflowHistory.actorId, filters.actorId));
    }
    if (filters.stepId !== undefined) {
      conditions.push(eq(workflowHistory.stepId, filters.stepId));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(workflowHistory)
        .where(and(...conditions))
        .orderBy(desc(workflowHistory.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(workflowHistory)
      .orderBy(desc(workflowHistory.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getHistoryByInstance(instanceId: string): Promise<WorkflowHistoryType[]> {
    const db = await getDb();
    return db
      .select()
      .from(workflowHistory)
      .where(eq(workflowHistory.instanceId, instanceId))
      .orderBy(workflowHistory.createdAt);
  }

  async getHistoryById(id: string): Promise<WorkflowHistoryType | null> {
    const db = await getDb();
    const [history] = await db.select().from(workflowHistory).where(eq(workflowHistory.id, id));
    return history || null;
  }

  async getHistoryStatistics(companyId: string): Promise<{
    total: number;
    byAction: Record<string, number>;
    byType: Record<string, number>;
    recentActivity: WorkflowHistoryType[];
  }> {
    const db = await getDb();
    const historyRecords = await db
      .select()
      .from(workflowHistory)
      .where(eq(workflowHistory.companyId, companyId));

    const byAction: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const record of historyRecords) {
      byAction[record.action] = (byAction[record.action] || 0) + 1;
      byType[record.type] = (byType[record.type] || 0) + 1;
    }

    const recentActivity = historyRecords
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      total: historyRecords.length,
      byAction,
      byType,
      recentActivity,
    };
  }

  async getActorHistory(companyId: string, actorId: string, limit = 50): Promise<WorkflowHistoryType[]> {
    const db = await getDb();
    return db
      .select()
      .from(workflowHistory)
      .where(and(
        eq(workflowHistory.companyId, companyId),
        eq(workflowHistory.actorId, actorId)
      ))
      .orderBy(desc(workflowHistory.createdAt))
      .limit(limit);
  }

  async getStepHistory(instanceId: string, stepId: string): Promise<WorkflowHistoryType[]> {
    const db = await getDb();
    return db
      .select()
      .from(workflowHistory)
      .where(and(
        eq(workflowHistory.instanceId, instanceId),
        eq(workflowHistory.stepId, stepId)
      ))
      .orderBy(workflowHistory.createdAt);
  }

  async deleteHistory(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(workflowHistory).where(eq(workflowHistory.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteInstanceHistory(instanceId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(workflowHistory).where(eq(workflowHistory.instanceId, instanceId));
    return (result.rowCount ?? 0) > 0;
  }

  async searchHistory(
    companyId: string,
    keyword: string,
    limit = 20
  ): Promise<WorkflowHistoryType[]> {
    const db = await getDb();
    // 使用ILIKE进行模糊搜索
    return db
      .select()
      .from(workflowHistory)
      .where(and(
        eq(workflowHistory.companyId, companyId),
        sql`${workflowHistory.description} ILIKE ${`%${keyword}%`}`
      ))
      .orderBy(desc(workflowHistory.createdAt))
      .limit(limit);
  }
}

export const workflowHistoryManager = new WorkflowHistoryManager();
