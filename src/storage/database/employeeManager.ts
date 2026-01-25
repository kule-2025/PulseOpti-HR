import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { employees, insertEmployeeSchema } from "./shared/schema";
import type { Employee, InsertEmployee } from "./shared/schema";

export class EmployeeManager {
  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const db = await getDb();
    const validated = insertEmployeeSchema.parse(data);
    const [employee] = await db.insert(employees).values(validated).returning();
    return employee;
  }

  async getEmployees(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Employee, 'id' | 'companyId' | 'userId' | 'employeeNumber' | 'name' | 'departmentId' | 'positionId' | 'employmentStatus'>>;
  } = {}): Promise<Employee[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(employees.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(employees.companyId, filters.companyId));
    }
    if (filters.userId !== undefined && filters.userId !== null) {
      conditions.push(eq(employees.userId, filters.userId));
    }
    if (filters.employeeNumber !== undefined && filters.employeeNumber !== null) {
      conditions.push(eq(employees.employeeNumber, filters.employeeNumber));
    }
    if (filters.name !== undefined && filters.name !== null) {
      conditions.push(eq(employees.name, filters.name));
    }
    if (filters.departmentId !== undefined && filters.departmentId !== null) {
      conditions.push(eq(employees.departmentId, filters.departmentId));
    }
    if (filters.positionId !== undefined && filters.positionId !== null) {
      conditions.push(eq(employees.positionId, filters.positionId));
    }
    if (filters.employmentStatus !== undefined) {
      conditions.push(eq(employees.employmentStatus, filters.employmentStatus));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(employees)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(employees).limit(limit).offset(skip);
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const db = await getDb();
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || null;
  }

  async getEmployeeByNumber(employeeNumber: string): Promise<Employee | null> {
    const db = await getDb();
    const [employee] = await db.select().from(employees).where(eq(employees.employeeNumber, employeeNumber));
    return employee || null;
  }

  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee | null> {
    const db = await getDb();
    const [employee] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return employee || null;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDepartmentEmployees(departmentId: string): Promise<Employee[]> {
    const db = await getDb();
    return db.select().from(employees).where(eq(employees.departmentId, departmentId));
  }

  async getCompanyEmployees(companyId: string): Promise<Employee[]> {
    const db = await getDb();
    return db.select().from(employees).where(eq(employees.companyId, companyId));
  }

  async getEmployeeCount(companyId: string): Promise<number> {
    const db = await getDb();
    const result = await db
      .select({ count: employees.id })
      .from(employees)
      .where(eq(employees.companyId, companyId));
    return result.length;
  }
}

export const employeeManager = new EmployeeManager();
