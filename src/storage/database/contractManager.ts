import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  employmentContracts,
  type EmploymentContract,
  type InsertEmploymentContract,
} from './shared/schema';

export class ContractManager {
  async createContract(data: InsertEmploymentContract): Promise<EmploymentContract> {
    const db = await getDb();
    const [contract] = await db.insert(employmentContracts).values(data).returning();
    return contract;
  }

  async getContracts(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      employeeId: string;
      status: string;
      contractType: string;
    }>;
  } = {}): Promise<EmploymentContract[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(employmentContracts.companyId, filters.companyId));
    }
    if (filters.employeeId !== undefined) {
      conditions.push(eq(employmentContracts.employeeId, filters.employeeId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(employmentContracts.status, filters.status));
    }
    if (filters.contractType !== undefined) {
      conditions.push(eq(employmentContracts.contractType, filters.contractType));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(employmentContracts)
        .where(and(...conditions))
        .orderBy(desc(employmentContracts.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(employmentContracts)
      .orderBy(desc(employmentContracts.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getContractById(id: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db.select().from(employmentContracts).where(eq(employmentContracts.id, id));
    return contract || null;
  }

  async getContractByNumber(contractNumber: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .select()
      .from(employmentContracts)
      .where(eq(employmentContracts.contractNumber, contractNumber));
    return contract || null;
  }

  async getActiveContractByEmployee(employeeId: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .select()
      .from(employmentContracts)
      .where(and(
        eq(employmentContracts.employeeId, employeeId),
        eq(employmentContracts.status, 'active')
      ));
    return contract || null;
  }

  async getEmployeeContracts(employeeId: string): Promise<EmploymentContract[]> {
    const db = await getDb();
    return db
      .select()
      .from(employmentContracts)
      .where(eq(employmentContracts.employeeId, employeeId))
      .orderBy(desc(employmentContracts.createdAt));
  }

  async updateContract(id: string, data: Partial<InsertEmploymentContract>): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async updateContractStatus(id: string, status: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({ status, updatedAt: new Date() })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async passProbation(id: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({
        isProbationPassed: true,
        probationPassedDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async terminateContract(id: string, terminationReason: string): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({
        status: 'terminated',
        terminationDate: new Date(),
        terminationReason,
        updatedAt: new Date(),
      })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async renewContract(
    id: string,
    newEndDate: Date,
    contractUrl?: string
  ): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({
        status: 'renewed',
        endDate: newEndDate,
        ...(contractUrl && { contractUrl }),
        updatedAt: new Date(),
      })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async signContract(
    id: string,
    signedByEmployee: string,
    signedByCompany: string
  ): Promise<EmploymentContract | null> {
    const db = await getDb();
    const [contract] = await db
      .update(employmentContracts)
      .set({
        signedAt: new Date(),
        signedByEmployee,
        signedByCompany,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(employmentContracts.id, id))
      .returning();
    return contract || null;
  }

  async deleteContract(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(employmentContracts).where(eq(employmentContracts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveContracts(companyId: string): Promise<EmploymentContract[]> {
    const db = await getDb();
    return db
      .select()
      .from(employmentContracts)
      .where(and(
        eq(employmentContracts.companyId, companyId),
        eq(employmentContracts.status, 'active')
      ))
      .orderBy(desc(employmentContracts.createdAt));
  }

  async getContractsExpiringSoon(companyId: string, days = 30): Promise<EmploymentContract[]> {
    const db = await getDb();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return db
      .select()
      .from(employmentContracts)
      .where(and(
        eq(employmentContracts.companyId, companyId),
        eq(employmentContracts.status, 'active'),
        sql`${employmentContracts.endDate} <= ${futureDate}`,
        sql`${employmentContracts.endDate} >= ${new Date()}`
      ))
      .orderBy(employmentContracts.endDate);
  }

  async getProbationContracts(companyId: string): Promise<EmploymentContract[]> {
    const db = await getDb();
    return db
      .select()
      .from(employmentContracts)
      .where(and(
        eq(employmentContracts.companyId, companyId),
        eq(employmentContracts.status, 'active'),
        sql`${employmentContracts.isProbationPassed} IS NULL OR ${employmentContracts.isProbationPassed} = false`
      ))
      .orderBy(employmentContracts.probationEndDate);
  }

  async getExpiringProbationContracts(companyId: string, days = 7): Promise<EmploymentContract[]> {
    const db = await getDb();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return db
      .select()
      .from(employmentContracts)
      .where(and(
        eq(employmentContracts.companyId, companyId),
        eq(employmentContracts.status, 'active'),
        sql`${employmentContracts.isProbationPassed} IS NULL OR ${employmentContracts.isProbationPassed} = false`,
        sql`${employmentContracts.probationEndDate} <= ${futureDate}`,
        sql`${employmentContracts.probationEndDate} >= ${new Date()}`
      ))
      .orderBy(employmentContracts.probationEndDate);
  }

  async getContractStatistics(companyId: string): Promise<{
    total: number;
    active: number;
    draft: number;
    terminated: number;
    expired: number;
    renewed: number;
    inProbation: number;
    expiringSoon: number;
  }> {
    const db = await getDb();
    const contracts = await db
      .select()
      .from(employmentContracts)
      .where(eq(employmentContracts.companyId, companyId));

    const statistics = {
      total: contracts.length,
      active: 0,
      draft: 0,
      terminated: 0,
      expired: 0,
      renewed: 0,
      inProbation: 0,
      expiringSoon: 0,
    };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    for (const contract of contracts) {
      statistics[contract.status as keyof typeof statistics]++;
      
      if (contract.status === 'active') {
        if (!contract.isProbationPassed) {
          statistics.inProbation++;
        }
        if (contract.endDate && contract.endDate <= futureDate) {
          statistics.expiringSoon++;
        }
      }
    }

    return statistics;
  }
}

export const contractManager = new ContractManager();
