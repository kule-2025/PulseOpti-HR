import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { departments, insertDepartmentSchema } from "./shared/schema";
import type { Department, InsertDepartment } from "./shared/schema";

export class DepartmentManager {
  async createDepartment(data: InsertDepartment): Promise<Department> {
    const db = await getDb();
    const validated = insertDepartmentSchema.parse(data);
    const [department] = await db.insert(departments).values(validated).returning();
    return department;
  }

  async getDepartments(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Department, 'id' | 'companyId' | 'name' | 'code' | 'parentId' | 'isActive'>>;
  } = {}): Promise<Department[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(departments.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(departments.companyId, filters.companyId));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(departments.name, filters.name));
    }
    if (filters.code !== undefined && filters.code !== null) {
      conditions.push(eq(departments.code, filters.code));
    }
    if (filters.parentId !== undefined && filters.parentId !== null) {
      conditions.push(eq(departments.parentId, filters.parentId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(departments.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(departments)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(departments).limit(limit).offset(skip);
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const db = await getDb();
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || null;
  }

  async updateDepartment(id: string, data: Partial<InsertDepartment>): Promise<Department | null> {
    const db = await getDb();
    const [department] = await db
      .update(departments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return department || null;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(departments).where(eq(departments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCompanyDepartments(companyId: string): Promise<Department[]> {
    const db = await getDb();
    return db
      .select()
      .from(departments)
      .where(eq(departments.companyId, companyId));
  }

  async getRootDepartments(companyId: string): Promise<Department[]> {
    const db = await getDb();
    return db
      .select()
      .from(departments)
      .where(and(
        eq(departments.companyId, companyId),
        eq(departments.isActive, true)
      ));
  }
}

export const departmentManager = new DepartmentManager();
