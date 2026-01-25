/**
 * 离职管理数据库管理
 * 提供离职申请、交接清单、离职访谈等数据的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  resignations,
  handoverChecklists,
  exitInterviews,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import type {
  InsertResignation,
  InsertHandoverChecklist,
  InsertExitInterview,
} from '@/storage/database/shared/schema';

// ========== 离职申请管理 ==========

export async function createResignation(data: InsertResignation) {
  const db = await getDb();
  const [result] = await db.insert(resignations).values(data).returning();
  return result;
}

export async function getResignations(filters: {
  companyId: string;
  employeeId?: string;
  status?: string;
  resignationType?: string;
  reasonCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(resignations.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(resignations.employeeId, filters.employeeId));
  }

  if (filters.status) {
    conditions.push(eq(resignations.status, filters.status));
  }

  if (filters.resignationType) {
    conditions.push(eq(resignations.resignationType, filters.resignationType));
  }

  if (filters.reasonCategory) {
    conditions.push(eq(resignations.reasonCategory, filters.reasonCategory));
  }

  if (filters.dateFrom) {
    conditions.push(gte(resignations.createdAt, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(resignations.createdAt, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: resignations.id,
      companyId: resignations.companyId,
      employeeId: resignations.employeeId,
      applicantId: resignations.applicantId,
      resignationType: resignations.resignationType,
      reason: resignations.reason,
      reasonCategory: resignations.reasonCategory,
      expectedLastDate: resignations.expectedLastDate,
      actualLastDate: resignations.actualLastDate,
      status: resignations.status,
      approvedBy: resignations.approvedBy,
      approvedAt: resignations.approvedAt,
      remarks: resignations.remarks,
      metadata: resignations.metadata,
      createdAt: resignations.createdAt,
      updatedAt: resignations.updatedAt,
      employeeName: employees.name,
      employeeDepartmentId: employees.departmentId,
    })
    .from(resignations)
    .leftJoin(employees, eq(resignations.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(resignations.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getResignationById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(resignations)
    .where(eq(resignations.id, id));
  return result;
}

export async function updateResignation(
  id: string,
  data: Partial<InsertResignation>
) {
  const db = await getDb();
  const [result] = await db
    .update(resignations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(resignations.id, id))
    .returning();
  return result;
}

export async function deleteResignation(id: string) {
  const db = await getDb();
  const result = await db.delete(resignations).where(eq(resignations.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function approveResignation(
  id: string,
  approvedBy: string,
  actualLastDate?: Date
) {
  const db = await getDb();
  const [result] = await db
    .update(resignations)
    .set({
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
      actualLastDate: actualLastDate,
      updatedAt: new Date(),
    })
    .where(eq(resignations.id, id))
    .returning();
  return result;
}

export async function rejectResignation(
  id: string,
  remarks?: string
) {
  const db = await getDb();
  const [result] = await db
    .update(resignations)
    .set({
      status: 'rejected',
      remarks,
      updatedAt: new Date(),
    })
    .where(eq(resignations.id, id))
    .returning();
  return result;
}

// ========== 交接清单管理 ==========

export async function createHandoverChecklist(data: InsertHandoverChecklist) {
  const db = await getDb();
  const [result] = await db.insert(handoverChecklists).values(data).returning();
  return result;
}

export async function getHandoverChecklists(filters: {
  companyId: string;
  resignationId: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [
    eq(handoverChecklists.companyId, filters.companyId),
    eq(handoverChecklists.resignationId, filters.resignationId),
  ];

  if (filters.category) {
    conditions.push(eq(handoverChecklists.category, filters.category));
  }

  if (filters.status) {
    conditions.push(eq(handoverChecklists.status, filters.status));
  }

  const query = db
    .select()
    .from(handoverChecklists)
    .where(and(...conditions))
    .orderBy(handoverChecklists.createdAt);

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getHandoverChecklistById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(handoverChecklists)
    .where(eq(handoverChecklists.id, id));
  return result;
}

export async function updateHandoverChecklist(
  id: string,
  data: Partial<InsertHandoverChecklist>
) {
  const db = await getDb();
  const [result] = await db
    .update(handoverChecklists)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(handoverChecklists.id, id))
    .returning();
  return result;
}

export async function deleteHandoverChecklist(id: string) {
  const db = await getDb();
  const result = await db.delete(handoverChecklists).where(eq(handoverChecklists.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function completeHandoverChecklist(
  id: string
) {
  const db = await getDb();
  const [result] = await db
    .update(handoverChecklists)
    .set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(handoverChecklists.id, id))
    .returning();
  return result;
}

// ========== 离职访谈管理 ==========

export async function createExitInterview(data: InsertExitInterview) {
  const db = await getDb();
  const [result] = await db.insert(exitInterviews).values(data).returning();
  return result;
}

export async function getExitInterviews(filters: {
  companyId: string;
  employeeId?: string;
  resignationId?: string;
  interviewerId?: string;
  interviewMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(exitInterviews.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(exitInterviews.employeeId, filters.employeeId));
  }

  if (filters.resignationId) {
    conditions.push(eq(exitInterviews.resignationId, filters.resignationId));
  }

  if (filters.interviewerId) {
    conditions.push(eq(exitInterviews.interviewerId, filters.interviewerId));
  }

  if (filters.interviewMethod) {
    conditions.push(eq(exitInterviews.interviewMethod, filters.interviewMethod));
  }

  if (filters.dateFrom) {
    conditions.push(gte(exitInterviews.interviewDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(exitInterviews.interviewDate, new Date(filters.dateTo)));
  }

  const query = db
    .select()
    .from(exitInterviews)
    .where(and(...conditions))
    .orderBy(desc(exitInterviews.interviewDate));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getExitInterviewById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(exitInterviews)
    .where(eq(exitInterviews.id, id));
  return result;
}

export async function updateExitInterview(
  id: string,
  data: Partial<InsertExitInterview>
) {
  const db = await getDb();
  const [result] = await db
    .update(exitInterviews)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exitInterviews.id, id))
    .returning();
  return result;
}

export async function deleteExitInterview(id: string) {
  const db = await getDb();
  const result = await db.delete(exitInterviews).where(eq(exitInterviews.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ========== 离职统计 ==========

export async function getResignationStatistics(companyId: string, period?: string) {
  const db = await getDb();
  
  const conditions = [eq(resignations.companyId, companyId)];
  
  if (period) {
    // period格式：2024-01, 2024-Q1, 2024
    if (period.includes('-Q')) {
      // 季度
      const [year, quarter] = period.split('-Q');
      const startMonth = (parseInt(quarter) - 1) * 3 + 1;
      const startDate = new Date(parseInt(year), startMonth - 1, 1);
      const endDate = new Date(parseInt(year), startMonth + 2, 31);
      conditions.push(gte(resignations.createdAt, startDate));
      conditions.push(lte(resignations.createdAt, endDate));
    } else if (period.includes('-')) {
      // 月度
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      conditions.push(gte(resignations.createdAt, startDate));
      conditions.push(lte(resignations.createdAt, endDate));
    } else {
      // 年度
      const startDate = new Date(parseInt(period), 0, 1);
      const endDate = new Date(parseInt(period), 11, 31);
      conditions.push(gte(resignations.createdAt, startDate));
      conditions.push(lte(resignations.createdAt, endDate));
    }
  }

  const resignationRecords = await db
    .select()
    .from(resignations)
    .where(and(...conditions));

  const totalResignations = resignationRecords.length;
  const approvedResignations = resignationRecords.filter(r => r.status === 'approved').length;
  const pendingResignations = resignationRecords.filter(r => r.status === 'pending').length;
  const completedResignations = resignationRecords.filter(r => r.status === 'completed').length;

  // 按原因分类统计
  const byReasonCategory: Record<string, number> = {};
  const byResignationType: Record<string, number> = {};

  for (const record of resignationRecords) {
    if (record.reasonCategory) {
      byReasonCategory[record.reasonCategory] = (byReasonCategory[record.reasonCategory] || 0) + 1;
    }
    if (record.resignationType) {
      byResignationType[record.resignationType] = (byResignationType[record.resignationType] || 0) + 1;
    }
  }

  return {
    totalResignations,
    approvedResignations,
    pendingResignations,
    completedResignations,
    approvalRate: totalResignations > 0 ? Math.round((approvedResignations / totalResignations) * 100) : 0,
    byReasonCategory,
    byResignationType,
  };
}

export async function getExitInterviewStatistics(companyId: string, period?: string) {
  const db = await getDb();
  
  const conditions = [eq(exitInterviews.companyId, companyId)];
  
  if (period) {
    if (period.includes('-Q')) {
      const [year, quarter] = period.split('-Q');
      const startMonth = (parseInt(quarter) - 1) * 3 + 1;
      const startDate = new Date(parseInt(year), startMonth - 1, 1);
      const endDate = new Date(parseInt(year), startMonth + 2, 31);
      conditions.push(gte(exitInterviews.interviewDate, startDate));
      conditions.push(lte(exitInterviews.interviewDate, endDate));
    } else if (period.includes('-')) {
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      conditions.push(gte(exitInterviews.interviewDate, startDate));
      conditions.push(lte(exitInterviews.interviewDate, endDate));
    } else {
      const startDate = new Date(parseInt(period), 0, 1);
      const endDate = new Date(parseInt(period), 11, 31);
      conditions.push(gte(exitInterviews.interviewDate, startDate));
      conditions.push(lte(exitInterviews.interviewDate, endDate));
    }
  }

  const interviews = await db
    .select()
    .from(exitInterviews)
    .where(and(...conditions));

  const totalInterviews = interviews.length;

  // 计算平均满意度
  const overallSatisfaction = interviews
    .filter(i => i.overallSatisfaction)
    .reduce((sum, i) => sum + (i.overallSatisfaction || 0), 0);
  const avgOverallSatisfaction = interviews.filter(i => i.overallSatisfaction).length > 0
    ? Math.round(overallSatisfaction / interviews.filter(i => i.overallSatisfaction).length)
    : 0;

  const workingEnvironment = interviews
    .filter(i => i.workingEnvironment)
    .reduce((sum, i) => sum + (i.workingEnvironment || 0), 0);
  const avgWorkingEnvironment = interviews.filter(i => i.workingEnvironment).length > 0
    ? Math.round(workingEnvironment / interviews.filter(i => i.workingEnvironment).length)
    : 0;

  const salary = interviews
    .filter(i => i.salary)
    .reduce((sum, i) => sum + (i.salary || 0), 0);
  const avgSalary = interviews.filter(i => i.salary).length > 0
    ? Math.round(salary / interviews.filter(i => i.salary).length)
    : 0;

  const management = interviews
    .filter(i => i.management)
    .reduce((sum, i) => sum + (i.management || 0), 0);
  const avgManagement = interviews.filter(i => i.management).length > 0
    ? Math.round(management / interviews.filter(i => i.management).length)
    : 0;

  const careerDevelopment = interviews
    .filter(i => i.careerDevelopment)
    .reduce((sum, i) => sum + (i.careerDevelopment || 0), 0);
  const avgCareerDevelopment = interviews.filter(i => i.careerDevelopment).length > 0
    ? Math.round(careerDevelopment / interviews.filter(i => i.careerDevelopment).length)
    : 0;

  const workLifeBalance = interviews
    .filter(i => i.workLifeBalance)
    .reduce((sum, i) => sum + (i.workLifeBalance || 0), 0);
  const avgWorkLifeBalance = interviews.filter(i => i.workLifeBalance).length > 0
    ? Math.round(workLifeBalance / interviews.filter(i => i.workLifeBalance).length)
    : 0;

  return {
    totalInterviews,
    avgOverallSatisfaction,
    avgWorkingEnvironment,
    avgSalary,
    avgManagement,
    avgCareerDevelopment,
    avgWorkLifeBalance,
  };
}
