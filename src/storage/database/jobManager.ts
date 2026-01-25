import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobs, insertJobSchema } from "./shared/schema";
import type { Job, InsertJob } from "./shared/schema";

export class JobManager {
  async createJob(data: InsertJob): Promise<Job> {
    const db = await getDb();
    const validated = insertJobSchema.parse(data);
    const [job] = await db.insert(jobs).values(validated).returning();
    return job;
  }

  async getJobs(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Job, 'id' | 'companyId' | 'departmentId' | 'status'>>;
  } = {}): Promise<Job[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(jobs.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(jobs.companyId, filters.companyId));
    }
    if (filters.departmentId !== undefined && filters.departmentId !== null) {
      conditions.push(eq(jobs.departmentId, filters.departmentId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(jobs.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(jobs)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(jobs).limit(limit).offset(skip);
  }

  async getJobById(id: string): Promise<Job | null> {
    const db = await getDb();
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || null;
  }

  async updateJob(id: string, data: Partial<InsertJob>): Promise<Job | null> {
    const db = await getDb();
    const [job] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job || null;
  }

  async deleteJob(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveJobs(companyId: string): Promise<Job[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobs)
      .where(and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, 'open')
      ));
  }
}

export const jobManager = new JobManager();
