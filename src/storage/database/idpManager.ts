/**
 * 个人发展计划(IDP)数据库管理
 * 提供个人发展计划的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  individualDevelopmentPlans,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import type {
  InsertIndividualDevelopmentPlan,
} from '@/storage/database/shared/schema';

// ========== 个人发展计划管理 ==========

export async function createIndividualDevelopmentPlan(data: InsertIndividualDevelopmentPlan) {
  const db = await getDb();
  const [result] = await db.insert(individualDevelopmentPlans).values(data).returning();
  return result;
}

export async function getIndividualDevelopmentPlans(filters: {
  companyId: string;
  employeeId?: string;
  period?: string;
  status?: string;
  mentorId?: string;
  managerId?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(individualDevelopmentPlans.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(individualDevelopmentPlans.employeeId, filters.employeeId));
  }

  if (filters.period) {
    conditions.push(eq(individualDevelopmentPlans.period, filters.period));
  }

  if (filters.status) {
    conditions.push(eq(individualDevelopmentPlans.status, filters.status));
  }

  if (filters.mentorId) {
    conditions.push(eq(individualDevelopmentPlans.mentorId, filters.mentorId));
  }

  if (filters.managerId) {
    conditions.push(eq(individualDevelopmentPlans.managerId, filters.managerId));
  }

  const query = db
    .select({
      id: individualDevelopmentPlans.id,
      companyId: individualDevelopmentPlans.companyId,
      employeeId: individualDevelopmentPlans.employeeId,
      period: individualDevelopmentPlans.period,
      title: individualDevelopmentPlans.title,
      careerGoal: individualDevelopmentPlans.careerGoal,
      skillGapAnalysis: individualDevelopmentPlans.skillGapAnalysis,
      goals: individualDevelopmentPlans.goals,
      learningActivities: individualDevelopmentPlans.learningActivities,
      milestones: individualDevelopmentPlans.milestones,
      resources: individualDevelopmentPlans.resources,
      mentorId: individualDevelopmentPlans.mentorId,
      managerId: individualDevelopmentPlans.managerId,
      status: individualDevelopmentPlans.status,
      progress: individualDevelopmentPlans.progress,
      employeeComments: individualDevelopmentPlans.employeeComments,
      managerComments: individualDevelopmentPlans.managerComments,
      completedAt: individualDevelopmentPlans.completedAt,
      createdAt: individualDevelopmentPlans.createdAt,
      updatedAt: individualDevelopmentPlans.updatedAt,
      employeeName: employees.name,
      employeeDepartmentId: employees.departmentId,
    })
    .from(individualDevelopmentPlans)
    .leftJoin(employees, eq(individualDevelopmentPlans.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(individualDevelopmentPlans.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getIndividualDevelopmentPlanById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(individualDevelopmentPlans)
    .where(eq(individualDevelopmentPlans.id, id));
  return result;
}

export async function updateIndividualDevelopmentPlan(
  id: string,
  data: Partial<InsertIndividualDevelopmentPlan>
) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();
  return result;
}

export async function deleteIndividualDevelopmentPlan(id: string) {
  const db = await getDb();
  const result = await db.delete(individualDevelopmentPlans).where(eq(individualDevelopmentPlans.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getEmployeeIDPs(employeeId: string) {
  const db = await getDb();
  return db
    .select()
    .from(individualDevelopmentPlans)
    .where(eq(individualDevelopmentPlans.employeeId, employeeId))
    .orderBy(desc(individualDevelopmentPlans.period));
}

export async function updateIDPProgress(
  id: string,
  progress: number
) {
  const db = await getDb();
  
  const updateData: any = {
    progress,
    updatedAt: new Date(),
  };

  if (progress >= 100) {
    updateData.status = 'completed';
    updateData.completedAt = new Date();
  } else if (progress > 0 && progress < 100) {
    updateData.status = 'active';
  }

  const [result] = await db
    .update(individualDevelopmentPlans)
    .set(updateData)
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

export async function addEmployeeComments(
  id: string,
  comments: string
) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({
      employeeComments: comments,
      updatedAt: new Date(),
    })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

export async function addManagerComments(
  id: string,
  comments: string
) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({
      managerComments: comments,
      updatedAt: new Date(),
    })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

export async function activateIDP(id: string) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

export async function completeIDP(id: string) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

export async function cancelIDP(id: string) {
  const db = await getDb();
  const [result] = await db
    .update(individualDevelopmentPlans)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(individualDevelopmentPlans.id, id))
    .returning();

  return result;
}

// ========== IDP统计 ==========

export async function getIDPStatistics(companyId: string, period?: string) {
  const db = await getDb();
  
  const conditions = [eq(individualDevelopmentPlans.companyId, companyId)];
  
  if (period) {
    conditions.push(eq(individualDevelopmentPlans.period, period));
  }

  const idpRecords = await db
    .select()
    .from(individualDevelopmentPlans)
    .where(and(...conditions));

  const totalIDPs = idpRecords.length;
  const activeIDPs = idpRecords.filter(r => r.status === 'active').length;
  const completedIDPs = idpRecords.filter(r => r.status === 'completed').length;
  const draftIDPs = idpRecords.filter(r => r.status === 'draft').length;
  const cancelledIDPs = idpRecords.filter(r => r.status === 'cancelled').length;

  // 平均完成度
  const totalProgress = idpRecords.reduce((sum, r) => sum + (r.progress || 0), 0);
  const avgProgress = totalIDPs > 0 ? Math.round(totalProgress / totalIDPs) : 0;

  // 完成率
  const completionRate = totalIDPs > 0 ? Math.round((completedIDPs / totalIDPs) * 100) : 0;

  // 活跃计划的平均进度
  const activeProgress = activeIDPs > 0
    ? Math.round(
        idpRecords
          .filter(r => r.status === 'active')
          .reduce((sum, r) => sum + (r.progress || 0), 0) / activeIDPs
      )
    : 0;

  return {
    totalIDPs,
    activeIDPs,
    completedIDPs,
    draftIDPs,
    cancelledIDPs,
    avgProgress,
    completionRate,
    activeProgress,
  };
}

export async function getEmployeeIDPStats(employeeId: string) {
  const db = await getDb();
  
  const idpRecords = await db
    .select()
    .from(individualDevelopmentPlans)
    .where(eq(individualDevelopmentPlans.employeeId, employeeId));

  const totalIDPs = idpRecords.length;
  const activeIDPs = idpRecords.filter(r => r.status === 'active').length;
  const completedIDPs = idpRecords.filter(r => r.status === 'completed').length;

  // 平均完成度
  const totalProgress = idpRecords.reduce((sum, r) => sum + (r.progress || 0), 0);
  const avgProgress = totalIDPs > 0 ? Math.round(totalProgress / totalIDPs) : 0;

  // 统计完成的目标数量
  let totalGoals = 0;
  let completedGoals = 0;

  for (const idp of idpRecords) {
    if (idp.goals && Array.isArray(idp.goals)) {
      const goals = idp.goals as any[];
      totalGoals += goals.length;
      completedGoals += goals.filter(g => g.status === 'completed').length;
    }
  }

  return {
    totalIDPs,
    activeIDPs,
    completedIDPs,
    avgProgress,
    totalGoals,
    completedGoals,
    goalsCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
  };
}

export async function getMentorIDPs(mentorId: string) {
  const db = await getDb();
  
  return db
    .select()
    .from(individualDevelopmentPlans)
    .where(eq(individualDevelopmentPlans.mentorId, mentorId))
    .orderBy(desc(individualDevelopmentPlans.createdAt));
}

export async function getManagerIDPs(managerId: string) {
  const db = await getDb();
  
  return db
    .select()
    .from(individualDevelopmentPlans)
    .where(eq(individualDevelopmentPlans.managerId, managerId))
    .orderBy(desc(individualDevelopmentPlans.createdAt));
}
