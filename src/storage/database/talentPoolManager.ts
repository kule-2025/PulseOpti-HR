import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  talentPool,
  talentPoolMembers,
  type TalentPool,
  type TalentPoolMember,
  type InsertTalentPool,
  type InsertTalentPoolMember,
} from './shared/schema';

export class TalentPoolManager {
  // ============ 人才库管理 ============

  async createPool(data: InsertTalentPool): Promise<TalentPool> {
    const db = await getDb();
    const [pool] = await db.insert(talentPool).values(data).returning();
    return pool;
  }

  async getPools(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      type: string;
      isActive: boolean;
    }>;
  } = {}): Promise<TalentPool[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(talentPool.companyId, filters.companyId));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(talentPool.type, filters.type));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(talentPool.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(talentPool)
        .where(and(...conditions))
        .orderBy(desc(talentPool.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(talentPool)
      .orderBy(desc(talentPool.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getPoolById(id: string): Promise<TalentPool | null> {
    const db = await getDb();
    const [pool] = await db.select().from(talentPool).where(eq(talentPool.id, id));
    return pool || null;
  }

  async updatePool(id: string, data: Partial<InsertTalentPool>): Promise<TalentPool | null> {
    const db = await getDb();
    const [pool] = await db
      .update(talentPool)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(talentPool.id, id))
      .returning();
    return pool || null;
  }

  async deletePool(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(talentPool).where(eq(talentPool.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActivePools(companyId: string): Promise<TalentPool[]> {
    const db = await getDb();
    return db
      .select()
      .from(talentPool)
      .where(and(
        eq(talentPool.companyId, companyId),
        eq(talentPool.isActive, true)
      ))
      .orderBy(talentPool.createdAt);
  }

  async getPoolsByType(companyId: string, type: string): Promise<TalentPool[]> {
    const db = await getDb();
    return db
      .select()
      .from(talentPool)
      .where(and(
        eq(talentPool.companyId, companyId),
        eq(talentPool.type, type)
      ))
      .orderBy(desc(talentPool.createdAt));
  }

  // ============ 人才库成员管理 ============

  async addMember(data: InsertTalentPoolMember): Promise<TalentPoolMember> {
    const db = await getDb();
    const [member] = await db.insert(talentPoolMembers).values(data).returning();
    return member;
  }

  async getMembers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      poolId: string;
      type: string;
      relatedId: string;
      isActive: boolean;
    }>;
  } = {}): Promise<TalentPoolMember[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(talentPoolMembers.companyId, filters.companyId));
    }
    if (filters.poolId !== undefined) {
      conditions.push(eq(talentPoolMembers.poolId, filters.poolId));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(talentPoolMembers.type, filters.type));
    }
    if (filters.relatedId !== undefined) {
      conditions.push(eq(talentPoolMembers.relatedId, filters.relatedId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(talentPoolMembers.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(talentPoolMembers)
        .where(and(...conditions))
        .orderBy(desc(talentPoolMembers.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(talentPoolMembers)
      .orderBy(desc(talentPoolMembers.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getMemberById(id: string): Promise<TalentPoolMember | null> {
    const db = await getDb();
    const [member] = await db.select().from(talentPoolMembers).where(eq(talentPoolMembers.id, id));
    return member || null;
  }

  async getMembersByPool(poolId: string): Promise<TalentPoolMember[]> {
    const db = await getDb();
    return db
      .select()
      .from(talentPoolMembers)
      .where(and(
        eq(talentPoolMembers.poolId, poolId),
        eq(talentPoolMembers.isActive, true)
      ))
      .orderBy(desc(talentPoolMembers.createdAt));
  }

  async updateMember(id: string, data: Partial<InsertTalentPoolMember>): Promise<TalentPoolMember | null> {
    const db = await getDb();
    const [member] = await db
      .update(talentPoolMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(talentPoolMembers.id, id))
      .returning();
    return member || null;
  }

  async removeMember(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(talentPoolMembers).where(eq(talentPoolMembers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeMemberFromPool(poolId: string, relatedId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .delete(talentPoolMembers)
      .where(and(
        eq(talentPoolMembers.poolId, poolId),
        eq(talentPoolMembers.relatedId, relatedId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async addMembersToPool(poolId: string, members: Array<{ type: string; relatedId: string; addedBy: string; addedReason?: string }>): Promise<TalentPoolMember[]> {
    const db = await getDb();
    const addedMembers: TalentPoolMember[] = [];

    // 首先获取pool信息以获取companyId
    const [pool] = await db
      .select()
      .from(talentPool)
      .where(eq(talentPool.id, poolId));
    
    if (!pool) {
      throw new Error('Talent pool not found');
    }

    for (const member of members) {
      const [added] = await db
        .insert(talentPoolMembers)
        .values({
          companyId: pool.companyId,
          poolId,
          type: member.type,
          relatedId: member.relatedId,
          addedBy: member.addedBy,
          addedReason: member.addedReason,
        })
        .returning();
      if (added) addedMembers.push(added);
    }

    return addedMembers;
  }

  async searchMembers(
    companyId: string,
    keyword: string,
    limit = 20
  ): Promise<TalentPoolMember[]> {
    const db = await getDb();
    // 这里需要关联查询候选人或员工表，简化实现只返回成员记录
    return db
      .select()
      .from(talentPoolMembers)
      .where(and(
        eq(talentPoolMembers.companyId, companyId),
        eq(talentPoolMembers.isActive, true)
      ))
      .orderBy(desc(talentPoolMembers.aiMatchScore))
      .limit(limit);
  }

  async getTopMembers(poolId: string, limit = 10): Promise<TalentPoolMember[]> {
    const db = await getDb();
    return db
      .select()
      .from(talentPoolMembers)
      .where(and(
        eq(talentPoolMembers.poolId, poolId),
        eq(talentPoolMembers.isActive, true)
      ))
      .orderBy(desc(talentPoolMembers.aiMatchScore))
      .limit(limit);
  }

  async getPoolStatistics(poolId: string): Promise<{
    totalMembers: number;
    byType: Record<string, number>;
    avgMatchScore: number;
  }> {
    const db = await getDb();
    const members = await db
      .select()
      .from(talentPoolMembers)
      .where(and(
        eq(talentPoolMembers.poolId, poolId),
        eq(talentPoolMembers.isActive, true)
      ));

    const byType: Record<string, number> = {};
    let totalMatchScore = 0;
    let matchScoreCount = 0;

    for (const member of members) {
      byType[member.type] = (byType[member.type] || 0) + 1;
      if (member.aiMatchScore) {
        totalMatchScore += member.aiMatchScore;
        matchScoreCount++;
      }
    }

    return {
      totalMembers: members.length,
      byType,
      avgMatchScore: matchScoreCount > 0 ? Math.round(totalMatchScore / matchScoreCount) : 0,
    };
  }

  async updateMemberScore(id: string, score: number): Promise<TalentPoolMember | null> {
    const db = await getDb();
    const [member] = await db
      .update(talentPoolMembers)
      .set({
        aiMatchScore: score,
        updatedAt: new Date(),
      })
      .where(eq(talentPoolMembers.id, id))
      .returning();
    return member || null;
  }
}

export const talentPoolManager = new TalentPoolManager();
