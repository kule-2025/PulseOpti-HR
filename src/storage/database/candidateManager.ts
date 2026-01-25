import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { candidates, insertCandidateSchema } from "./shared/schema";
import type { Candidate, InsertCandidate } from "./shared/schema";

export class CandidateManager {
  async createCandidate(data: InsertCandidate): Promise<Candidate> {
    const db = await getDb();
    const validated = insertCandidateSchema.parse(data);
    const [candidate] = await db.insert(candidates).values(validated).returning();
    return candidate;
  }

  async getCandidates(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Candidate, 'id' | 'companyId' | 'jobId' | 'status'>>;
  } = {}): Promise<Candidate[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(candidates.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(candidates.companyId, filters.companyId));
    }
    if (filters.jobId !== undefined && filters.jobId !== null) {
      conditions.push(eq(candidates.jobId, filters.jobId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(candidates.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(candidates)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(candidates).limit(limit).offset(skip);
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    const db = await getDb();
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || null;
  }

  async updateCandidate(id: string, data: Partial<InsertCandidate>): Promise<Candidate | null> {
    const db = await getDb();
    const [candidate] = await db
      .update(candidates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(candidates.id, id))
      .returning();
    return candidate || null;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(candidates).where(eq(candidates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getJobCandidates(jobId: string): Promise<Candidate[]> {
    const db = await getDb();
    return db.select().from(candidates).where(eq(candidates.jobId, jobId));
  }
}

export const candidateManager = new CandidateManager();
