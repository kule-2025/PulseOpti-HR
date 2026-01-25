/**
 * 积分系统数据库管理
 * 提供积分维度、规则、交易、兑换等数据的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  pointDimensions,
  pointRules,
  employeePoints,
  pointTransactions,
  exchangeItems,
  exchangeRecords,
  pointLevels,
  pointStatistics,
  pointLeaderboard,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, lte, gte, or, isNull } from 'drizzle-orm';
import type {
  InsertPointDimension,
  InsertPointRule,
  InsertEmployeePoint,
  InsertPointTransaction,
  InsertExchangeItem,
  InsertExchangeRecord,
  InsertPointLevel,
  InsertPointStatistic,
  InsertPointLeaderboard,
} from '@/storage/database/shared/schema';

async function getDB() {
  return await getDb();
}

// ========== 积分维度管理 ==========

export async function createPointDimension(data: InsertPointDimension) {
  const db = await getDB();
  const [result] = await db.insert(pointDimensions).values(data).returning();
  return result;
}

export async function getPointDimensions(companyId: string) {
  const db = await getDB();
  return db
    .select()
    .from(pointDimensions)
    .where(and(eq(pointDimensions.companyId, companyId), eq(pointDimensions.isActive, true)))
    .orderBy(pointDimensions.sort);
}

export async function getPointDimensionById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(pointDimensions).where(eq(pointDimensions.id, id));
  return result;
}

export async function updatePointDimension(id: string, data: Partial<InsertPointDimension>) {
  const db = await getDB();
  const [result] = await db
    .update(pointDimensions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pointDimensions.id, id))
    .returning();
  return result;
}

export async function deletePointDimension(id: string) {
  const db = await getDB();
  const [result] = await db
    .update(pointDimensions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(pointDimensions.id, id))
    .returning();
  return result;
}

// ========== 积分规则管理 ==========

export async function createPointRule(data: InsertPointRule) {
  const db = await getDB();
  const [result] = await db.insert(pointRules).values(data).returning();
  return result;
}

export async function getPointRules(companyId: string, dimensionId?: string) {
  const db = await getDB();
  const conditions = dimensionId
    ? and(eq(pointRules.companyId, companyId), eq(pointRules.dimensionId, dimensionId), eq(pointRules.isActive, true))
    : and(eq(pointRules.companyId, companyId), eq(pointRules.isActive, true));

  return db.select().from(pointRules).where(conditions).orderBy(pointRules.priority);
}

export async function getPointRuleById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(pointRules).where(eq(pointRules.id, id));
  return result;
}

export async function getPointRuleByCode(companyId: string, code: string) {
  const db = await getDB();
  const [result] = await db
    .select()
    .from(pointRules)
    .where(and(eq(pointRules.companyId, companyId), eq(pointRules.code, code), eq(pointRules.isActive, true)));
  return result;
}

export async function updatePointRule(id: string, data: Partial<InsertPointRule>) {
  const db = await getDB();
  const [result] = await db
    .update(pointRules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pointRules.id, id))
    .returning();
  return result;
}

export async function deletePointRule(id: string) {
  const db = await getDB();
  const [result] = await db
    .update(pointRules)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(pointRules.id, id))
    .returning();
  return result;
}

// ========== 员工积分管理 ==========

export async function getOrCreateEmployeePoint(companyId: string, employeeId: string) {
  const db = await getDB();
  let [pointRecord] = await db
    .select()
    .from(employeePoints)
    .where(and(eq(employeePoints.companyId, companyId), eq(employeePoints.employeeId, employeeId)));

  if (!pointRecord) {
    const [newRecord] = await db
      .insert(employeePoints)
      .values({
        companyId,
        employeeId,
        totalPoints: 0,
        availablePoints: 0,
        usedPoints: 0,
      })
      .returning();
    pointRecord = newRecord;
  }

  return pointRecord;
}

export async function updateEmployeePoints(
  companyId: string,
  employeeId: string,
  points: number,
  transactionType: 'earn' | 'redeem' | 'adjust'
) {
  const db = await getDB();
  const pointRecord = await getOrCreateEmployeePoint(companyId, employeeId);

  const newTotalPoints =
    transactionType === 'redeem' ? pointRecord.totalPoints - Math.abs(points) : pointRecord.totalPoints + points;

  const newAvailablePoints =
    transactionType === 'redeem'
      ? pointRecord.availablePoints - Math.abs(points)
      : pointRecord.availablePoints + points;

  const newUsedPoints =
    transactionType === 'redeem' ? pointRecord.usedPoints + Math.abs(points) : pointRecord.usedPoints;

  const [result] = await db
    .update(employeePoints)
    .set({
      totalPoints: newTotalPoints,
      availablePoints: newAvailablePoints,
      usedPoints: newUsedPoints,
      lastUpdated: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(employeePoints.id, pointRecord.id))
    .returning();

  return result;
}

export async function getEmployeePoints(companyId: string, employeeId?: string) {
  const db = await getDB();
  const conditions = employeeId
    ? and(eq(employeePoints.companyId, companyId), eq(employeePoints.employeeId, employeeId))
    : eq(employeePoints.companyId, companyId);

  return db.select().from(employeePoints).where(conditions).orderBy(desc(employeePoints.totalPoints));
}

export async function getEmployeePointById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(employeePoints).where(eq(employeePoints.id, id));
  return result;
}

// ========== 积分交易管理 ==========

export async function createPointTransaction(data: InsertPointTransaction) {
  const db = await getDB();
  const [result] = await db.insert(pointTransactions).values(data).returning();
  return result;
}

export async function getPointTransactions(companyId: string, employeeId?: string, limit: number = 50) {
  const db = await getDB();
  const conditions = employeeId
    ? and(eq(pointTransactions.companyId, companyId), eq(pointTransactions.employeeId, employeeId))
    : eq(pointTransactions.companyId, companyId);

  return db
    .select()
    .from(pointTransactions)
    .where(conditions)
    .orderBy(desc(pointTransactions.createdAt))
    .limit(limit);
}

export async function getPointTransactionById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(pointTransactions).where(eq(pointTransactions.id, id));
  return result;
}

export async function getPointTransactionsBySource(
  companyId: string,
  source: string,
  sourceId?: string
) {
  const db = await getDB();
  const conditions = sourceId
    ? and(eq(pointTransactions.companyId, companyId), eq(pointTransactions.source, source), eq(pointTransactions.sourceId, sourceId))
    : and(eq(pointTransactions.companyId, companyId), eq(pointTransactions.source, source));

  return db.select().from(pointTransactions).where(conditions).orderBy(desc(pointTransactions.createdAt));
}

// ========== 兑换商品管理 ==========

export async function createExchangeItem(data: InsertExchangeItem) {
  const db = await getDB();
  const [result] = await db.insert(exchangeItems).values(data).returning();
  return result;
}

export async function getExchangeItems(companyId: string, category?: string) {
  const db = await getDB();
  const conditions = category
    ? and(eq(exchangeItems.companyId, companyId), eq(exchangeItems.category, category), eq(exchangeItems.isActive, true))
    : and(eq(exchangeItems.companyId, companyId), eq(exchangeItems.isActive, true));

  return db.select().from(exchangeItems).where(conditions).orderBy(exchangeItems.sortOrder);
}

export async function getPublicExchangeItems(category?: string) {
  const db = await getDB();
  const conditions = category
    ? and(isNull(exchangeItems.companyId), eq(exchangeItems.category, category), eq(exchangeItems.isActive, true))
    : and(isNull(exchangeItems.companyId), eq(exchangeItems.isActive, true));

  return db.select().from(exchangeItems).where(conditions).orderBy(exchangeItems.sortOrder);
}

export async function getExchangeItemById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(exchangeItems).where(eq(exchangeItems.id, id));
  return result;
}

export async function updateExchangeItem(id: string, data: Partial<InsertExchangeItem>) {
  const db = await getDB();
  const [result] = await db
    .update(exchangeItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exchangeItems.id, id))
    .returning();
  return result;
}

export async function updateExchangeItemStock(id: string, quantity: number) {
  const db = await getDB();
  const [result] = await db
    .update(exchangeItems)
    .set({
      stock: sql<number>`${exchangeItems.stock} - ${quantity}`,
      updatedAt: new Date(),
    })
    .where(and(eq(exchangeItems.id, id), eq(exchangeItems.unlimitedStock, false)))
    .returning();
  return result;
}

export async function deleteExchangeItem(id: string) {
  const db = await getDB();
  const [result] = await db
    .update(exchangeItems)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(exchangeItems.id, id))
    .returning();
  return result;
}

// ========== 兑换记录管理 ==========

export async function createExchangeRecord(data: InsertExchangeRecord) {
  const db = await getDB();
  const [result] = await db.insert(exchangeRecords).values(data).returning();
  return result;
}

export async function getExchangeRecords(companyId: string, employeeId?: string, status?: string) {
  const db = await getDB();
  let conditions = employeeId
    ? and(eq(exchangeRecords.companyId, companyId), eq(exchangeRecords.employeeId, employeeId))
    : eq(exchangeRecords.companyId, companyId);

  if (status) {
    conditions = and(conditions, eq(exchangeRecords.status, status));
  }

  return db.select().from(exchangeRecords).where(conditions).orderBy(desc(exchangeRecords.createdAt));
}

export async function getExchangeRecordById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(exchangeRecords).where(eq(exchangeRecords.id, id));
  return result;
}

export async function updateExchangeRecord(
  id: string,
  data: Partial<InsertExchangeRecord> & { status?: string }
) {
  const db = await getDB();
  const updateData: any = { ...data, updatedAt: new Date() };

  if (data.status === 'approved') {
    updateData.approvedAt = new Date();
  } else if (data.status === 'completed') {
    updateData.completedAt = new Date();
  }

  const [result] = await db.update(exchangeRecords).set(updateData).where(eq(exchangeRecords.id, id)).returning();
  return result;
}

// ========== 积分级别管理 ==========

export async function createPointLevel(data: InsertPointLevel) {
  const db = await getDB();
  const [result] = await db.insert(pointLevels).values(data).returning();
  return result;
}

export async function getPointLevels(companyId?: string) {
  const db = await getDB();
  const conditions = companyId ? eq(pointLevels.companyId, companyId) : isNull(pointLevels.companyId);

  return db.select().from(pointLevels).where(conditions).orderBy(pointLevels.minPoints);
}

export async function getPointLevelByPoints(companyId: string | undefined, points: number) {
  const db = await getDB();
  const conditions = companyId
    ? and(eq(pointLevels.companyId, companyId), lte(pointLevels.minPoints, points), or(gte(pointLevels.maxPoints!, points), isNull(pointLevels.maxPoints)))
    : and(isNull(pointLevels.companyId), lte(pointLevels.minPoints, points), or(gte(pointLevels.maxPoints!, points), isNull(pointLevels.maxPoints)));

  const [result] = await db.select().from(pointLevels).where(conditions).orderBy(desc(pointLevels.minPoints)).limit(1);
  return result;
}

export async function updatePointLevel(id: string, data: Partial<InsertPointLevel>) {
  const db = await getDB();
  const [result] = await db
    .update(pointLevels)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pointLevels.id, id))
    .returning();
  return result;
}

export async function deletePointLevel(id: string) {
  const db = await getDB();
  const [result] = await db
    .update(pointLevels)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(pointLevels.id, id))
    .returning();
  return result;
}

// ========== 积分统计管理 ==========

export async function getOrCreatePointStatistic(
  companyId: string,
  data: Omit<InsertPointStatistic, 'id' | 'createdAt' | 'updatedAt'>
) {
  const db = await getDB();
  const [existing] = await db
    .select()
    .from(pointStatistics)
    .where(
      and(
        eq(pointStatistics.companyId, companyId),
        eq(pointStatistics.period, data.period),
        eq(pointStatistics.periodValue, data.periodValue),
        data.employeeId ? eq(pointStatistics.employeeId, data.employeeId) : isNull(pointStatistics.employeeId),
        data.departmentId ? eq(pointStatistics.departmentId, data.departmentId) : isNull(pointStatistics.departmentId),
        data.dimensionId ? eq(pointStatistics.dimensionId, data.dimensionId) : isNull(pointStatistics.dimensionId)
      )
    );

  if (existing) {
    return existing;
  }

  const [newRecord] = await db.insert(pointStatistics).values(data).returning();
  return newRecord;
}

export async function updatePointStatistic(id: string, data: Partial<InsertPointStatistic>) {
  const db = await getDB();
  const [result] = await db
    .update(pointStatistics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pointStatistics.id, id))
    .returning();
  return result;
}

export async function incrementPointStatistic(id: string, data: { earnedPoints?: number; redeemedPoints?: number }) {
  const db = await getDB();
  const updateData: Record<string, any> = { updatedAt: new Date() };

  if (data.earnedPoints !== undefined) {
    updateData.earnedPoints = sql`${pointStatistics.earnedPoints} + ${data.earnedPoints}`;
    updateData.netPoints = sql`${pointStatistics.netPoints} + ${data.earnedPoints}`;
  }

  if (data.redeemedPoints !== undefined) {
    updateData.redeemedPoints = sql`${pointStatistics.redeemedPoints} + ${data.redeemedPoints}`;
    updateData.netPoints = sql`${pointStatistics.netPoints} - ${data.redeemedPoints}`;
  }

  if (data.earnedPoints !== undefined || data.redeemedPoints !== undefined) {
    updateData.transactionCount = sql`${pointStatistics.transactionCount} + 1`;
  }

  const [result] = await db.update(pointStatistics).set(updateData as any).where(eq(pointStatistics.id, id)).returning();
  return result;
}

export async function getPointStatistics(companyId: string, period?: string, periodValue?: string) {
  const db = await getDB();
  const conditionsList = [eq(pointStatistics.companyId, companyId)];

  if (period) {
    conditionsList.push(eq(pointStatistics.period, period));
  }

  if (periodValue) {
    conditionsList.push(eq(pointStatistics.periodValue, periodValue));
  }

  const conditions = and(...conditionsList);
  
  return db.select().from(pointStatistics).where(conditions!);
}

// ========== 积分排行榜管理 ==========

export async function getLeaderboard(companyId: string, period: string, periodValue?: string, limit: number = 100) {
  const db = await getDB();
  const conditions = periodValue
    ? and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period), eq(pointLeaderboard.periodValue, periodValue))
    : and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period));

  return db.select().from(pointLeaderboard).where(conditions).orderBy(pointLeaderboard.rank).limit(limit);
}

export async function refreshLeaderboard(companyId: string, period: string, periodValue?: string) {
  const db = await getDB();
  // 删除旧排行榜数据
  const deleteConditions = periodValue
    ? and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period), eq(pointLeaderboard.periodValue, periodValue))
    : and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period));

  await db.delete(pointLeaderboard).where(deleteConditions);

  // 查询员工积分数据
  let results;

  // 如果是周期排行榜，查询统计数据
  if (period !== 'all') {
    const conditions = [eq(pointStatistics.companyId, companyId), eq(pointStatistics.period, period)];
    if (periodValue) {
      conditions.push(eq(pointStatistics.periodValue, periodValue));
    }

    results = await db
      .select({
        companyId: pointStatistics.companyId,
        employeeId: pointStatistics.employeeId!,
        employeeName: employees.name,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        avatarUrl: employees.avatarUrl,
        totalPoints: pointStatistics.earnedPoints,
      })
      .from(pointStatistics)
      .innerJoin(employees, eq(employees.id, pointStatistics.employeeId!))
      .where(and(...conditions));
  } else {
    // 查询总积分
    results = await db
      .select({
        companyId: employees.companyId,
        employeeId: employees.id,
        employeeName: employees.name,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        avatarUrl: employees.avatarUrl,
        totalPoints: employeePoints.totalPoints,
      })
      .from(employees)
      .innerJoin(employeePoints, eq(employeePoints.employeeId, employees.id))
      .where(eq(employees.companyId, companyId));
  }

  const sortedResults = await (results as any).orderBy(desc(sql`total_points`));

  // 计算排名并插入
  const leaderboardData = (sortedResults as any[]).map((row: any, index: number) => ({
    companyId: row.companyId,
    period,
    periodValue: periodValue || '',
    employeeId: row.employeeId!,
    employeeName: row.employeeName,
    departmentId: row.departmentId,
    position: '', // 可以从positions表获取
    avatarUrl: row.avatarUrl,
    totalPoints: row.totalPoints,
    earnedPoints: row.totalPoints,
    rank: index + 1,
    trend: 'stable' as const,
    rankChange: 0,
    updatedAt: new Date(),
  }));

  if (leaderboardData.length > 0) {
    await db.insert(pointLeaderboard).values(leaderboardData);
  }

  return leaderboardData;
}

export async function getLeaderboardByEmployee(
  companyId: string,
  employeeId: string,
  period: string,
  periodValue?: string
) {
  const db = await getDB();
  const conditions = periodValue
    ? and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period), eq(pointLeaderboard.periodValue, periodValue), eq(pointLeaderboard.employeeId, employeeId))
    : and(eq(pointLeaderboard.companyId, companyId), eq(pointLeaderboard.period, period), eq(pointLeaderboard.employeeId, employeeId));

  const [result] = await db.select().from(pointLeaderboard).where(conditions);
  return result;
}
