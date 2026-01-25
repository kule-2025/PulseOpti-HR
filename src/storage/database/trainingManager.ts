/**
 * 培训管理数据库管理
 * 提供培训课程、培训记录等数据的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  trainingCourses,
  trainingRecords,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import type {
  InsertTrainingCourse,
  InsertTrainingRecord,
} from '@/storage/database/shared/schema';

// ========== 培训课程管理 ==========

export async function createTrainingCourse(data: InsertTrainingCourse) {
  const db = await getDb();
  const [result] = await db.insert(trainingCourses).values(data).returning();
  return result;
}

export async function getTrainingCourses(filters: {
  companyId?: string;
  type?: string;
  category?: string;
  difficulty?: string;
  instructorId?: string;
  isActive?: boolean;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions: any[] = [];

  // 如果指定了companyId，或者查询公开课程
  if (filters.companyId) {
    conditions.push(
      sql`(${trainingCourses.companyId} = ${filters.companyId} OR ${trainingCourses.isPublic} = true)`
    );
  } else if (filters.isPublic) {
    conditions.push(eq(trainingCourses.isPublic, true));
  }

  if (filters.type) {
    conditions.push(eq(trainingCourses.type, filters.type));
  }

  if (filters.category) {
    conditions.push(eq(trainingCourses.category, filters.category));
  }

  if (filters.difficulty) {
    conditions.push(eq(trainingCourses.difficulty, filters.difficulty));
  }

  if (filters.instructorId) {
    conditions.push(eq(trainingCourses.instructorId, filters.instructorId));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(trainingCourses.isActive, filters.isActive));
  }

  if (filters.isPublic !== undefined) {
    conditions.push(eq(trainingCourses.isPublic, filters.isPublic));
  }

  const query = db
    .select()
    .from(trainingCourses)
    .where(and(...conditions))
    .orderBy(desc(trainingCourses.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getTrainingCourseById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(trainingCourses)
    .where(eq(trainingCourses.id, id));
  return result;
}

export async function updateTrainingCourse(
  id: string,
  data: Partial<InsertTrainingCourse>
) {
  const db = await getDb();
  const [result] = await db
    .update(trainingCourses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(trainingCourses.id, id))
    .returning();
  return result;
}

export async function deleteTrainingCourse(id: string) {
  const db = await getDb();
  const result = await db.delete(trainingCourses).where(eq(trainingCourses.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function updateCourseRating(
  id: string,
  rating: number
) {
  const db = await getDb();
  
  // 获取当前课程信息
  const [course] = await db
    .select()
    .from(trainingCourses)
    .where(eq(trainingCourses.id, id));
  
  if (!course) {
    return null;
  }

  // 计算新评分
  const newReviewCount = (course.reviewCount || 0) + 1;
  const newRating = Math.round(
    ((course.rating || 0) * (course.reviewCount || 0) + rating) / newReviewCount
  );

  const [result] = await db
    .update(trainingCourses)
    .set({
      rating: newRating,
      reviewCount: newReviewCount,
      updatedAt: new Date(),
    })
    .where(eq(trainingCourses.id, id))
    .returning();

  return result;
}

// ========== 培训记录管理 ==========

export async function createTrainingRecord(data: InsertTrainingRecord) {
  const db = await getDb();
  const [result] = await db.insert(trainingRecords).values(data).returning();
  return result;
}

export async function getTrainingRecords(filters: {
  companyId: string;
  courseId?: string;
  employeeId?: string;
  instructorId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(trainingRecords.companyId, filters.companyId)];

  if (filters.courseId) {
    conditions.push(eq(trainingRecords.courseId, filters.courseId));
  }

  if (filters.employeeId) {
    conditions.push(eq(trainingRecords.employeeId, filters.employeeId));
  }

  if (filters.instructorId) {
    conditions.push(eq(trainingRecords.instructorId, filters.instructorId));
  }

  if (filters.status) {
    conditions.push(eq(trainingRecords.status, filters.status));
  }

  if (filters.dateFrom) {
    conditions.push(gte(trainingRecords.enrollmentDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(trainingRecords.enrollmentDate, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: trainingRecords.id,
      companyId: trainingRecords.companyId,
      courseId: trainingRecords.courseId,
      employeeId: trainingRecords.employeeId,
      employeeName: trainingRecords.employeeName,
      courseTitle: trainingRecords.courseTitle,
      enrollmentDate: trainingRecords.enrollmentDate,
      startDate: trainingRecords.startDate,
      endDate: trainingRecords.endDate,
      progress: trainingRecords.progress,
      completionDate: trainingRecords.completionDate,
      status: trainingRecords.status,
      score: trainingRecords.score,
      maxScore: trainingRecords.maxScore,
      grade: trainingRecords.grade,
      certificateUrl: trainingRecords.certificateUrl,
      feedback: trainingRecords.feedback,
      rating: trainingRecords.rating,
      instructorId: trainingRecords.instructorId,
      attendance: trainingRecords.attendance,
      learningHours: trainingRecords.learningHours,
      cost: trainingRecords.cost,
      metadata: trainingRecords.metadata,
      createdAt: trainingRecords.createdAt,
      updatedAt: trainingRecords.updatedAt,
    })
    .from(trainingRecords)
    .where(and(...conditions))
    .orderBy(desc(trainingRecords.enrollmentDate));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getTrainingRecordById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(trainingRecords)
    .where(eq(trainingRecords.id, id));
  return result;
}

export async function updateTrainingRecord(
  id: string,
  data: Partial<InsertTrainingRecord>
) {
  const db = await getDb();
  const [result] = await db
    .update(trainingRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(trainingRecords.id, id))
    .returning();
  return result;
}

export async function deleteTrainingRecord(id: string) {
  const db = await getDb();
  const result = await db.delete(trainingRecords).where(eq(trainingRecords.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function completeTrainingRecord(
  id: string,
  progress: number,
  completionDate?: Date
) {
  const db = await getDb();
  const [result] = await db
    .update(trainingRecords)
    .set({
      progress: 100,
      status: 'completed',
      completionDate: completionDate || new Date(),
      updatedAt: new Date(),
    })
    .where(eq(trainingRecords.id, id))
    .returning();
  return result;
}

export async function getEmployeeTrainingRecords(employeeId: string) {
  const db = await getDb();
  return db
    .select()
    .from(trainingRecords)
    .where(eq(trainingRecords.employeeId, employeeId))
    .orderBy(desc(trainingRecords.enrollmentDate));
}

export async function getCourseTrainingRecords(courseId: string) {
  const db = await getDb();
  return db
    .select()
    .from(trainingRecords)
    .where(eq(trainingRecords.courseId, courseId))
    .orderBy(desc(trainingRecords.enrollmentDate));
}

// ========== 培训统计 ==========

export async function getTrainingStatistics(companyId: string, period?: string) {
  const db = await getDb();
  
  // 构建时间条件
  const conditions = [eq(trainingRecords.companyId, companyId)];
  
  if (period) {
    // period格式：2024-01, 2024-Q1, 2024
    if (period.includes('-Q')) {
      // 季度
      const [year, quarter] = period.split('-Q');
      const startMonth = (parseInt(quarter) - 1) * 3 + 1;
      const startDate = new Date(parseInt(year), startMonth - 1, 1);
      const endDate = new Date(parseInt(year), startMonth + 2, 31);
      conditions.push(gte(trainingRecords.enrollmentDate, startDate));
      conditions.push(lte(trainingRecords.enrollmentDate, endDate));
    } else if (period.includes('-')) {
      // 月度
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      conditions.push(gte(trainingRecords.enrollmentDate, startDate));
      conditions.push(lte(trainingRecords.enrollmentDate, endDate));
    } else {
      // 年度
      const startDate = new Date(parseInt(period), 0, 1);
      const endDate = new Date(parseInt(period), 11, 31);
      conditions.push(gte(trainingRecords.enrollmentDate, startDate));
      conditions.push(lte(trainingRecords.enrollmentDate, endDate));
    }
  }

  const records = await db
    .select()
    .from(trainingRecords)
    .where(and(...conditions));

  // 统计数据
  const totalEnrollments = records.length;
  const completedRecords = records.filter(r => r.status === 'completed');
  const inProgressRecords = records.filter(r => r.status === 'in_progress');
  const totalCompleted = completedRecords.length;
  const totalLearningHours = records.reduce((sum, r) => sum + (r.learningHours || 0), 0);
  const avgRating = records.filter(r => r.rating).length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.rating || 0), 0) / records.filter(r => r.rating).length)
    : 0;
  const avgScore = records.filter(r => r.score).length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.score || 0), 0) / records.filter(r => r.score).length)
    : 0;

  return {
    totalEnrollments,
    totalCompleted,
    totalInProgress: inProgressRecords.length,
    completionRate: totalEnrollments > 0 ? Math.round((totalCompleted / totalEnrollments) * 100) : 0,
    totalLearningHours,
    avgRating,
    avgScore,
  };
}

export async function getEmployeeTrainingStats(employeeId: string) {
  const db = await getDb();
  
  const records = await db
    .select()
    .from(trainingRecords)
    .where(eq(trainingRecords.employeeId, employeeId));

  const completedRecords = records.filter(r => r.status === 'completed');
  const inProgressRecords = records.filter(r => r.status === 'in_progress');

  return {
    totalEnrollments: records.length,
    totalCompleted: completedRecords.length,
    totalInProgress: inProgressRecords.length,
    totalLearningHours: records.reduce((sum, r) => sum + (r.learningHours || 0), 0),
    avgRating: records.filter(r => r.rating).length > 0
      ? Math.round(records.reduce((sum, r) => sum + (r.rating || 0), 0) / records.filter(r => r.rating).length)
      : 0,
  };
}
