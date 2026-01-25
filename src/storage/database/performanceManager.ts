import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  performanceCycles,
  performanceRecords,
  insertPerformanceCycleSchema,
  insertPerformanceRecordSchema
} from "./shared/schema";
import type { PerformanceCycle, InsertPerformanceCycle, PerformanceRecord, InsertPerformanceRecord } from "./shared/schema";

export class PerformanceManager {
  // Performance Cycles
  async createCycle(data: InsertPerformanceCycle): Promise<PerformanceCycle> {
    const db = await getDb();
    const validated = insertPerformanceCycleSchema.parse(data);
    const [cycle] = await db.insert(performanceCycles).values(validated).returning();
    return cycle;
  }

  async getCycles(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<PerformanceCycle, 'id' | 'companyId' | 'status'>>;
  } = {}): Promise<PerformanceCycle[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(performanceCycles.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(performanceCycles.companyId, filters.companyId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(performanceCycles.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(performanceCycles)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(performanceCycles).limit(limit).offset(skip);
  }

  async getCycleById(id: string): Promise<PerformanceCycle | null> {
    const db = await getDb();
    const [cycle] = await db.select().from(performanceCycles).where(eq(performanceCycles.id, id));
    return cycle || null;
  }

  async updateCycle(id: string, data: Partial<InsertPerformanceCycle>): Promise<PerformanceCycle | null> {
    const db = await getDb();
    const [cycle] = await db
      .update(performanceCycles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(performanceCycles.id, id))
      .returning();
    return cycle || null;
  }

  // Performance Records
  async createRecord(data: InsertPerformanceRecord): Promise<PerformanceRecord> {
    const db = await getDb();
    const validated = insertPerformanceRecordSchema.parse(data);
    const [record] = await db.insert(performanceRecords).values(validated).returning();
    return record;
  }

  async getRecords(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<PerformanceRecord, 'id' | 'companyId' | 'cycleId' | 'employeeId' | 'status'>>;
  } = {}): Promise<PerformanceRecord[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(performanceRecords.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(performanceRecords.companyId, filters.companyId));
    }
    if (filters.cycleId !== undefined) {
      conditions.push(eq(performanceRecords.cycleId, filters.cycleId));
    }
    if (filters.employeeId !== undefined) {
      conditions.push(eq(performanceRecords.employeeId, filters.employeeId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(performanceRecords.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(performanceRecords)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(performanceRecords).limit(limit).offset(skip);
  }

  async getRecordById(id: string): Promise<PerformanceRecord | null> {
    const db = await getDb();
    const [record] = await db.select().from(performanceRecords).where(eq(performanceRecords.id, id));
    return record || null;
  }

  async updateRecord(id: string, data: Partial<InsertPerformanceRecord>): Promise<PerformanceRecord | null> {
    const db = await getDb();
    const [record] = await db
      .update(performanceRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(performanceRecords.id, id))
      .returning();
    return record || null;
  }

  async getActiveCycle(companyId: string): Promise<PerformanceCycle | null> {
    const db = await getDb();
    const [cycle] = await db
      .select()
      .from(performanceCycles)
      .where(and(
        eq(performanceCycles.companyId, companyId),
        eq(performanceCycles.status, 'active')
      ));
    return cycle || null;
  }

  async getCycleRecords(cycleId: string): Promise<PerformanceRecord[]> {
    const db = await getDb();
    return db.select().from(performanceRecords).where(eq(performanceRecords.cycleId, cycleId));
  }
}

export const performanceManager = new PerformanceManager();
