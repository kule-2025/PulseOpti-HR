/**
 * 简历评估模板管理器
 */

import { getDb } from '@/lib/db';
import { eq, and, desc, asc, isNull, sql } from 'drizzle-orm';
import {
  assessmentTemplates,
  assessmentDimensions,
  assessmentReports,
  type InsertAssessmentTemplate,
  type InsertAssessmentDimension,
  type InsertAssessmentReport,
} from './shared/schema';

// ============ 评估模板管理 ============

/**
 * 创建评估模板
 */
export async function createAssessmentTemplate(
  data: InsertAssessmentTemplate
) {
  const db = await getDb();
  const [template] = await db
    .insert(assessmentTemplates)
    .values(data)
    .returning();
  return template;
}

/**
 * 获取评估模板列表
 */
export async function getAssessmentTemplates(params: {
  companyId: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const db = await getDb();
  const { companyId, category, isActive, page = 1, pageSize = 20 } = params;

  const conditions = [eq(assessmentTemplates.companyId, companyId)];

  if (category) {
    conditions.push(eq(assessmentTemplates.category, category));
  }

  if (isActive !== undefined) {
    conditions.push(eq(assessmentTemplates.isActive, isActive));
  }

  const [templates, total] = await Promise.all([
    db
      .select()
      .from(assessmentTemplates)
      .where(and(...conditions))
      .orderBy(desc(assessmentTemplates.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(assessmentTemplates)
      .where(and(...conditions))
      .then((result: any) => result[0]?.count || 0),
  ]);

  return {
    templates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * 获取评估模板详情（包含维度）
 */
export async function getAssessmentTemplateById(id: string) {
  const db = await getDb();
  const [template] = await db
    .select()
    .from(assessmentTemplates)
    .where(eq(assessmentTemplates.id, id))
    .limit(1);

  if (!template) {
    return null;
  }

  // 获取关联的维度
  const dimensions = await db
    .select()
    .from(assessmentDimensions)
    .where(eq(assessmentDimensions.templateId, id))
    .orderBy(asc(assessmentDimensions.sortOrder));

  return {
    ...template,
    dimensions,
  };
}

/**
 * 更新评估模板
 */
export async function updateAssessmentTemplate(
  id: string,
  data: Partial<InsertAssessmentTemplate>
) {
  const db = await getDb();
  const [template] = await db
    .update(assessmentTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(assessmentTemplates.id, id))
    .returning();

  return template;
}

/**
 * 删除评估模板
 */
export async function deleteAssessmentTemplate(id: string) {
  const db = await getDb();
  const result = await db
    .delete(assessmentTemplates)
    .where(eq(assessmentTemplates.id, id))
    .returning();

  return result.length > 0;
}

/**
 * 获取默认评估模板
 */
export async function getDefaultAssessmentTemplate(
  companyId: string,
  category: string = 'resume'
) {
  const db = await getDb();

  // 优先获取企业的默认模板
  const [companyDefault] = await db
    .select()
    .from(assessmentTemplates)
    .where(
      and(
        eq(assessmentTemplates.companyId, companyId),
        eq(assessmentTemplates.category, category),
        eq(assessmentTemplates.isDefault, true),
        eq(assessmentTemplates.isActive, true)
      )
    )
    .limit(1);

  if (companyDefault) {
    return getAssessmentTemplateById(companyDefault.id);
  }

  // 如果没有企业默认模板，获取系统默认模板
  const [systemDefault] = await db
    .select()
    .from(assessmentTemplates)
    .where(
      and(
        eq(assessmentTemplates.companyId, 'system'),
        eq(assessmentTemplates.category, category),
        eq(assessmentTemplates.isDefault, true),
        eq(assessmentTemplates.isActive, true)
      )
    )
    .limit(1);

  if (systemDefault) {
    return getAssessmentTemplateById(systemDefault.id);
  }

  return null;
}

// ============ 评估维度管理 ============

/**
 * 创建评估维度
 */
export async function createAssessmentDimension(
  data: InsertAssessmentDimension
) {
  const db = await getDb();
  const [dimension] = await db
    .insert(assessmentDimensions)
    .values(data)
    .returning();
  return dimension;
}

/**
 * 批量创建评估维度
 */
export async function batchCreateAssessmentDimensions(
  dimensions: InsertAssessmentDimension[]
) {
  const db = await getDb();
  const result = await db
    .insert(assessmentDimensions)
    .values(dimensions)
    .returning();
  return result;
}

/**
 * 更新评估维度
 */
export async function updateAssessmentDimension(
  id: string,
  data: Partial<InsertAssessmentDimension>
) {
  const db = await getDb();
  const [dimension] = await db
    .update(assessmentDimensions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(assessmentDimensions.id, id))
    .returning();

  return dimension;
}

/**
 * 删除评估维度
 */
export async function deleteAssessmentDimension(id: string) {
  const db = await getDb();
  const result = await db
    .delete(assessmentDimensions)
    .where(eq(assessmentDimensions.id, id))
    .returning();

  return result.length > 0;
}

/**
 * 批量删除评估维度
 */
export async function batchDeleteAssessmentDimensions(templateId: string) {
  const db = await getDb();
  const result = await db
    .delete(assessmentDimensions)
    .where(eq(assessmentDimensions.templateId, templateId))
    .returning();

  return result.length;
}

// ============ 评估报告管理 ============

/**
 * 创建评估报告
 */
export async function createAssessmentReport(
  data: InsertAssessmentReport
) {
  const db = await getDb();
  const [report] = await db
    .insert(assessmentReports)
    .values(data)
    .returning();
  return report;
}

/**
 * 获取评估报告列表
 */
export async function getAssessmentReports(params: {
  companyId: string;
  templateId?: string;
  targetId?: string;
  targetType?: string;
  passed?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const db = await getDb();
  const {
    companyId,
    templateId,
    targetId,
    targetType,
    passed,
    page = 1,
    pageSize = 20,
  } = params;

  const conditions = [eq(assessmentReports.companyId, companyId)];

  if (templateId) {
    conditions.push(eq(assessmentReports.templateId, templateId));
  }

  if (targetId) {
    conditions.push(eq(assessmentReports.targetId, targetId));
  }

  if (targetType) {
    conditions.push(eq(assessmentReports.targetType, targetType));
  }

  if (passed !== undefined) {
    conditions.push(eq(assessmentReports.passed, passed));
  }

  const [reports, total] = await Promise.all([
    db
      .select()
      .from(assessmentReports)
      .where(and(...conditions))
      .orderBy(desc(assessmentReports.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(assessmentReports)
      .where(and(...conditions))
      .then((result: any) => result[0]?.count || 0),
  ]);

  return {
    reports,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * 获取评估报告详情
 */
export async function getAssessmentReportById(id: string) {
  const db = await getDb();
  const [report] = await db
    .select()
    .from(assessmentReports)
    .where(eq(assessmentReports.id, id))
    .limit(1);

  return report || null;
}

/**
 * 获取目标的最新评估报告
 */
export async function getLatestAssessmentReport(
  targetId: string,
  targetType: string = 'candidate'
) {
  const db = await getDb();
  const [report] = await db
    .select()
    .from(assessmentReports)
    .where(
      and(
        eq(assessmentReports.targetId, targetId),
        eq(assessmentReports.targetType, targetType)
      )
    )
    .orderBy(desc(assessmentReports.createdAt))
    .limit(1);

  return report || null;
}

/**
 * 获取评估统计信息
 */
export async function getAssessmentStats(params: {
  companyId: string;
  templateId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  const { companyId, templateId, startDate, endDate } = params;

  const conditions = [eq(assessmentReports.companyId, companyId)];

  if (templateId) {
    conditions.push(eq(assessmentReports.templateId, templateId));
  }

  if (startDate) {
    conditions.push(sql`${assessmentReports.createdAt} >= ${startDate}`);
  }

  if (endDate) {
    conditions.push(sql`${assessmentReports.createdAt} <= ${endDate}`);
  }

  const reports = await db
    .select()
    .from(assessmentReports)
    .where(and(...conditions));

  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  const failed = total - passed;

  const avgScore =
    total > 0
      ? reports.reduce((sum, r) => sum + r.overallScore, 0) / total
      : 0;

  const scoreDistribution = {
    excellent: reports.filter((r: any) => r.overallScore >= 90).length,
    good: reports.filter((r: any) => r.overallScore >= 80 && r.overallScore < 90)
      .length,
    average: reports.filter((r: any) => r.overallScore >= 60 && r.overallScore < 80)
      .length,
    poor: reports.filter((r: any) => r.overallScore < 60).length,
  };

  const confidenceDistribution = {
    high: reports.filter((r: any) => r.confidenceLevel === 'high').length,
    medium: reports.filter((r: any) => r.confidenceLevel === 'medium').length,
    low: reports.filter((r: any) => r.confidenceLevel === 'low').length,
  };

  return {
    total,
    passed,
    failed,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    avgScore: Math.round(avgScore),
    scoreDistribution,
    confidenceDistribution,
  };
}
