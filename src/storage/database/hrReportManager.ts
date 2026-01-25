import { eq, and, desc, SQL } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  hrReportTemplates,
  type HrReportTemplate,
  type InsertHrReportTemplate,
} from './shared/schema';

export class HRReportManager {
  async createTemplate(data: InsertHrReportTemplate): Promise<HrReportTemplate> {
    const db = await getDb();
    const [template] = await db.insert(hrReportTemplates).values(data).returning();
    return template;
  }

  async getTemplates(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      category: string;
      type: string;
      isPublic: boolean;
      isActive: boolean;
    }>;
  } = {}): Promise<HrReportTemplate[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(hrReportTemplates.companyId, filters.companyId));
    }
    if (filters.category !== undefined) {
      conditions.push(eq(hrReportTemplates.category, filters.category));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(hrReportTemplates.type, filters.type));
    }
    if (filters.isPublic !== undefined) {
      conditions.push(eq(hrReportTemplates.isPublic, filters.isPublic));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(hrReportTemplates.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(hrReportTemplates)
        .where(and(...conditions))
        .orderBy(desc(hrReportTemplates.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(hrReportTemplates)
      .orderBy(desc(hrReportTemplates.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getTemplateById(id: string): Promise<HrReportTemplate | null> {
    const db = await getDb();
    const [template] = await db.select().from(hrReportTemplates).where(eq(hrReportTemplates.id, id));
    return template || null;
  }

  async getTemplateByCode(companyId: string, code: string): Promise<HrReportTemplate | null> {
    const db = await getDb();
    const [template] = await db
      .select()
      .from(hrReportTemplates)
      .where(and(
        eq(hrReportTemplates.companyId, companyId),
        eq(hrReportTemplates.code, code)
      ));
    return template || null;
  }

  async updateTemplate(id: string, data: Partial<InsertHrReportTemplate>): Promise<HrReportTemplate | null> {
    const db = await getDb();
    const [template] = await db
      .update(hrReportTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hrReportTemplates.id, id))
      .returning();
    return template || null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(hrReportTemplates).where(eq(hrReportTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPublicTemplates(category?: string): Promise<HrReportTemplate[]> {
    const db = await getDb();
    const conditions: SQL[] = [
      eq(hrReportTemplates.isPublic, true),
      eq(hrReportTemplates.isActive, true)
    ];

    if (category) {
      conditions.push(eq(hrReportTemplates.category, category));
    }

    return db
      .select()
      .from(hrReportTemplates)
      .where(and(...conditions))
      .orderBy(desc(hrReportTemplates.createdAt));
  }

  async getTemplatesByCategory(companyId: string, category: string): Promise<HrReportTemplate[]> {
    const db = await getDb();
    return db
      .select()
      .from(hrReportTemplates)
      .where(and(
        eq(hrReportTemplates.companyId, companyId),
        eq(hrReportTemplates.category, category),
        eq(hrReportTemplates.isActive, true)
      ))
      .orderBy(desc(hrReportTemplates.createdAt));
  }

  async getTemplatesByType(companyId: string, type: string): Promise<HrReportTemplate[]> {
    const db = await getDb();
    return db
      .select()
      .from(hrReportTemplates)
      .where(and(
        eq(hrReportTemplates.companyId, companyId),
        eq(hrReportTemplates.type, type),
        eq(hrReportTemplates.isActive, true)
      ))
      .orderBy(desc(hrReportTemplates.createdAt));
  }

  async getCompanyTemplates(companyId: string): Promise<HrReportTemplate[]> {
    const db = await getDb();
    return db
      .select()
      .from(hrReportTemplates)
      .where(and(
        eq(hrReportTemplates.companyId, companyId),
        eq(hrReportTemplates.isActive, true)
      ))
      .orderBy(desc(hrReportTemplates.createdAt));
  }

  async getReportCategories(): Promise<Array<{ category: string; count: number }>> {
    const db = await getDb();
    const templates = await db
      .select()
      .from(hrReportTemplates)
      .where(eq(hrReportTemplates.isActive, true));

    const categories: Record<string, number> = {};
    for (const template of templates) {
      categories[template.category] = (categories[template.category] || 0) + 1;
    }

    return Object.entries(categories).map(([category, count]) => ({ category, count }));
  }
}

export const hrReportManager = new HRReportManager();
