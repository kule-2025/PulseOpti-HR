import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  jobFamilies,
  jobRanks,
  jobGrades,
  jobRankMappings,
  type JobFamily,
  type JobRank,
  type JobGrade,
  type JobRankMapping,
  type InsertJobFamily,
  type InsertJobRank,
  type InsertJobGrade,
  type InsertJobRankMapping,
} from './shared/schema';

export class JobFamilyManager {
  // ============ 职位族管理 ============

  async createFamily(data: InsertJobFamily): Promise<JobFamily> {
    const db = await getDb();
    const [family] = await db.insert(jobFamilies).values(data).returning();
    return family;
  }

  async getFamilies(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      parentId: string;
      isActive: boolean;
    }>;
  } = {}): Promise<JobFamily[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(jobFamilies.companyId, filters.companyId));
    }
    if (filters.parentId !== undefined) {
      conditions.push(eq(jobFamilies.parentId, filters.parentId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(jobFamilies.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(jobFamilies)
        .where(and(...conditions))
        .orderBy(jobFamilies.sort)
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(jobFamilies)
      .orderBy(jobFamilies.sort)
      .limit(limit)
      .offset(skip);
  }

  async getFamilyById(id: string): Promise<JobFamily | null> {
    const db = await getDb();
    const [family] = await db.select().from(jobFamilies).where(eq(jobFamilies.id, id));
    return family || null;
  }

  async getFamilyByCode(companyId: string, code: string): Promise<JobFamily | null> {
    const db = await getDb();
    const [family] = await db
      .select()
      .from(jobFamilies)
      .where(and(
        eq(jobFamilies.companyId, companyId),
        eq(jobFamilies.code, code)
      ));
    return family || null;
  }

  async updateFamily(id: string, data: Partial<InsertJobFamily>): Promise<JobFamily | null> {
    const db = await getDb();
    const [family] = await db
      .update(jobFamilies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobFamilies.id, id))
      .returning();
    return family || null;
  }

  async deleteFamily(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(jobFamilies).where(eq(jobFamilies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getRootFamilies(companyId: string): Promise<JobFamily[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobFamilies)
      .where(and(
        eq(jobFamilies.companyId, companyId),
        sql`${jobFamilies.parentId} IS NULL`,
        eq(jobFamilies.isActive, true)
      ))
      .orderBy(jobFamilies.sort);
  }

  async getSubFamilies(parentId: string): Promise<JobFamily[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobFamilies)
      .where(and(
        eq(jobFamilies.parentId, parentId),
        eq(jobFamilies.isActive, true)
      ))
      .orderBy(jobFamilies.sort);
  }

  async getFamilyTree(companyId: string): Promise<JobFamily[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobFamilies)
      .where(and(
        eq(jobFamilies.companyId, companyId),
        eq(jobFamilies.isActive, true)
      ))
      .orderBy(jobFamilies.sort);
  }

  // ============ 职级管理 ============

  async createRank(data: InsertJobRank): Promise<JobRank> {
    const db = await getDb();
    const [rank] = await db.insert(jobRanks).values(data).returning();
    return rank;
  }

  async getRanks(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      isActive: boolean;
    }>;
  } = {}): Promise<JobRank[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(jobRanks.companyId, filters.companyId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(jobRanks.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(jobRanks)
        .where(and(...conditions))
        .orderBy(jobRanks.sequence)
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(jobRanks)
      .orderBy(jobRanks.sequence)
      .limit(limit)
      .offset(skip);
  }

  async getRankById(id: string): Promise<JobRank | null> {
    const db = await getDb();
    const [rank] = await db.select().from(jobRanks).where(eq(jobRanks.id, id));
    return rank || null;
  }

  async getRankByCode(companyId: string, code: string): Promise<JobRank | null> {
    const db = await getDb();
    const [rank] = await db
      .select()
      .from(jobRanks)
      .where(and(
        eq(jobRanks.companyId, companyId),
        eq(jobRanks.code, code)
      ));
    return rank || null;
  }

  async updateRank(id: string, data: Partial<InsertJobRank>): Promise<JobRank | null> {
    const db = await getDb();
    const [rank] = await db
      .update(jobRanks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobRanks.id, id))
      .returning();
    return rank || null;
  }

  async deleteRank(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(jobRanks).where(eq(jobRanks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveRanks(companyId: string): Promise<JobRank[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobRanks)
      .where(and(
        eq(jobRanks.companyId, companyId),
        eq(jobRanks.isActive, true)
      ))
      .orderBy(jobRanks.sequence);
  }

  // ============ 职等管理 ============

  async createGrade(data: InsertJobGrade): Promise<JobGrade> {
    const db = await getDb();
    const [grade] = await db.insert(jobGrades).values(data).returning();
    return grade;
  }

  async getGrades(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      isActive: boolean;
    }>;
  } = {}): Promise<JobGrade[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(jobGrades.companyId, filters.companyId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(jobGrades.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(jobGrades)
        .where(and(...conditions))
        .orderBy(jobGrades.sequence)
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(jobGrades)
      .orderBy(jobGrades.sequence)
      .limit(limit)
      .offset(skip);
  }

  async getGradeById(id: string): Promise<JobGrade | null> {
    const db = await getDb();
    const [grade] = await db.select().from(jobGrades).where(eq(jobGrades.id, id));
    return grade || null;
  }

  async getGradeByCode(companyId: string, code: string): Promise<JobGrade | null> {
    const db = await getDb();
    const [grade] = await db
      .select()
      .from(jobGrades)
      .where(and(
        eq(jobGrades.companyId, companyId),
        eq(jobGrades.code, code)
      ));
    return grade || null;
  }

  async updateGrade(id: string, data: Partial<InsertJobGrade>): Promise<JobGrade | null> {
    const db = await getDb();
    const [grade] = await db
      .update(jobGrades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobGrades.id, id))
      .returning();
    return grade || null;
  }

  async deleteGrade(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(jobGrades).where(eq(jobGrades.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveGrades(companyId: string): Promise<JobGrade[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobGrades)
      .where(and(
        eq(jobGrades.companyId, companyId),
        eq(jobGrades.isActive, true)
      ))
      .orderBy(jobGrades.sequence);
  }

  // ============ 职级职等映射管理 ============

  async createMapping(data: InsertJobRankMapping): Promise<JobRankMapping> {
    const db = await getDb();
    const [mapping] = await db.insert(jobRankMappings).values(data).returning();
    return mapping;
  }

  async getMappings(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      jobFamilyId: string;
      jobRankId: string;
      jobGradeId: string;
      isActive: boolean;
    }>;
  } = {}): Promise<JobRankMapping[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(jobRankMappings.companyId, filters.companyId));
    }
    if (filters.jobFamilyId !== undefined) {
      conditions.push(eq(jobRankMappings.jobFamilyId, filters.jobFamilyId));
    }
    if (filters.jobRankId !== undefined) {
      conditions.push(eq(jobRankMappings.jobRankId, filters.jobRankId));
    }
    if (filters.jobGradeId !== undefined) {
      conditions.push(eq(jobRankMappings.jobGradeId, filters.jobGradeId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(jobRankMappings.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(jobRankMappings)
        .where(and(...conditions))
        .orderBy(desc(jobRankMappings.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(jobRankMappings)
      .orderBy(desc(jobRankMappings.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getMappingById(id: string): Promise<JobRankMapping | null> {
    const db = await getDb();
    const [mapping] = await db.select().from(jobRankMappings).where(eq(jobRankMappings.id, id));
    return mapping || null;
  }

  async updateMapping(id: string, data: Partial<InsertJobRankMapping>): Promise<JobRankMapping | null> {
    const db = await getDb();
    const [mapping] = await db
      .update(jobRankMappings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobRankMappings.id, id))
      .returning();
    return mapping || null;
  }

  async deleteMapping(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(jobRankMappings).where(eq(jobRankMappings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMappingsByFamily(jobFamilyId: string): Promise<JobRankMapping[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobRankMappings)
      .where(and(
        eq(jobRankMappings.jobFamilyId, jobFamilyId),
        eq(jobRankMappings.isActive, true)
      ))
      .orderBy(desc(jobRankMappings.createdAt));
  }

  async getMappingsByRank(jobRankId: string): Promise<JobRankMapping[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobRankMappings)
      .where(and(
        eq(jobRankMappings.jobRankId, jobRankId),
        eq(jobRankMappings.isActive, true)
      ))
      .orderBy(desc(jobRankMappings.createdAt));
  }

  async getMappingsByGrade(jobGradeId: string): Promise<JobRankMapping[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobRankMappings)
      .where(and(
        eq(jobRankMappings.jobGradeId, jobGradeId),
        eq(jobRankMappings.isActive, true)
      ))
      .orderBy(desc(jobRankMappings.createdAt));
  }

  async getActiveMappings(companyId: string): Promise<JobRankMapping[]> {
    const db = await getDb();
    return db
      .select()
      .from(jobRankMappings)
      .where(and(
        eq(jobRankMappings.companyId, companyId),
        eq(jobRankMappings.isActive, true)
      ))
      .orderBy(desc(jobRankMappings.createdAt));
  }

  async getJobMatrix(companyId: string): Promise<{
    families: JobFamily[];
    ranks: JobRank[];
    grades: JobGrade[];
    mappings: JobRankMapping[];
  }> {
    const db = await getDb();

    const [families, ranks, grades, mappings] = await Promise.all([
      db.select().from(jobFamilies).where(eq(jobFamilies.companyId, companyId)),
      db.select().from(jobRanks).where(eq(jobRanks.companyId, companyId)),
      db.select().from(jobGrades).where(eq(jobGrades.companyId, companyId)),
      db.select().from(jobRankMappings).where(
        and(
          eq(jobRankMappings.companyId, companyId),
          eq(jobRankMappings.isActive, true)
        )
      ),
    ]);

    return {
      families: families.filter(f => f.isActive),
      ranks: ranks.filter(r => r.isActive),
      grades: grades.filter(g => g.isActive),
      mappings,
    };
  }
}

export const jobFamilyManager = new JobFamilyManager();
