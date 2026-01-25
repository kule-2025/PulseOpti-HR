/**
 * 薪酬管理数据库管理
 * 提供薪酬结构、薪资单、社保记录等数据的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  payrollRecords,
  salaryStructures,
  socialInsuranceRecords,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import type {
  InsertPayrollRecord,
  InsertSalaryStructure,
  InsertSocialInsuranceRecord,
} from '@/storage/database/shared/schema';

// ========== 薪酬结构管理 ==========

export async function createSalaryStructure(data: InsertSalaryStructure) {
  const db = await getDb();
  const [result] = await db.insert(salaryStructures).values(data).returning();
  return result;
}

export async function getSalaryStructures(filters: {
  companyId: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(salaryStructures.companyId, filters.companyId)];

  if (filters.isActive !== undefined) {
    conditions.push(eq(salaryStructures.isActive, filters.isActive));
  }

  const query = db
    .select()
    .from(salaryStructures)
    .where(and(...conditions))
    .orderBy(desc(salaryStructures.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getSalaryStructureById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(salaryStructures)
    .where(eq(salaryStructures.id, id));
  return result;
}

export async function updateSalaryStructure(
  id: string,
  data: Partial<InsertSalaryStructure>
) {
  const db = await getDb();
  const [result] = await db
    .update(salaryStructures)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(salaryStructures.id, id))
    .returning();
  return result;
}

export async function deleteSalaryStructure(id: string) {
  const db = await getDb();
  const result = await db.delete(salaryStructures).where(eq(salaryStructures.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ========== 薪资单管理 ==========

export async function createPayrollRecord(data: InsertPayrollRecord) {
  const db = await getDb();
  const [result] = await db.insert(payrollRecords).values(data).returning();
  return result;
}

export async function getPayrollRecords(filters: {
  companyId: string;
  employeeId?: string;
  period?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(payrollRecords.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(payrollRecords.employeeId, filters.employeeId));
  }

  if (filters.period) {
    conditions.push(eq(payrollRecords.period, filters.period));
  }

  if (filters.status) {
    conditions.push(eq(payrollRecords.status, filters.status));
  }

  if (filters.dateFrom) {
    conditions.push(gte(payrollRecords.createdAt, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(payrollRecords.createdAt, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: payrollRecords.id,
      companyId: payrollRecords.companyId,
      employeeId: payrollRecords.employeeId,
      period: payrollRecords.period,
      salaryStructureId: payrollRecords.salaryStructureId,
      baseSalary: payrollRecords.baseSalary,
      bonus: payrollRecords.bonus,
      allowance: payrollRecords.allowance,
      overtimePay: payrollRecords.overtimePay,
      deduction: payrollRecords.deduction,
      socialInsurance: payrollRecords.socialInsurance,
      tax: payrollRecords.tax,
      grossPay: payrollRecords.grossPay,
      netPay: payrollRecords.netPay,
      workDays: payrollRecords.workDays,
      actualWorkDays: payrollRecords.actualWorkDays,
      paidLeaveDays: payrollRecords.paidLeaveDays,
      unpaidLeaveDays: payrollRecords.unpaidLeaveDays,
      overtimeHours: payrollRecords.overtimeHours,
      status: payrollRecords.status,
      calculatedAt: payrollRecords.calculatedAt,
      paidAt: payrollRecords.paidAt,
      paymentMethod: payrollRecords.paymentMethod,
      paymentAccount: payrollRecords.paymentAccount,
      notes: payrollRecords.notes,
      metadata: payrollRecords.metadata,
      createdAt: payrollRecords.createdAt,
      updatedAt: payrollRecords.updatedAt,
      employeeName: employees.name,
      employeeDepartmentId: employees.departmentId,
    })
    .from(payrollRecords)
    .leftJoin(employees, eq(payrollRecords.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(payrollRecords.period));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getPayrollRecordById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(payrollRecords)
    .where(eq(payrollRecords.id, id));
  return result;
}

export async function updatePayrollRecord(
  id: string,
  data: Partial<InsertPayrollRecord>
) {
  const db = await getDb();
  const [result] = await db
    .update(payrollRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(payrollRecords.id, id))
    .returning();
  return result;
}

export async function deletePayrollRecord(id: string) {
  const db = await getDb();
  const result = await db.delete(payrollRecords).where(eq(payrollRecords.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getEmployeePayrollRecords(employeeId: string, limit = 12) {
  const db = await getDb();
  return db
    .select()
    .from(payrollRecords)
    .where(eq(payrollRecords.employeeId, employeeId))
    .orderBy(desc(payrollRecords.period))
    .limit(limit);
}

export async function calculatePayroll(data: {
  companyId: string;
  employeeId: string;
  period: string;
  baseSalary?: number;
  workDays?: number;
  actualWorkDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  overtimeHours?: number;
  hourlyRate?: number;
  bonus?: number;
  allowance?: number;
  deduction?: number;
}) {
  // 简化薪资计算逻辑
  const dailyRate = Math.floor((data.baseSalary || 1000000) / 21.75); // 日薪
  const hourlyRate = data.hourlyRate || Math.floor(dailyRate / 8); // 时薪

  const actualPayDays = (data.actualWorkDays || 0) + (data.paidLeaveDays || 0) - (data.unpaidLeaveDays || 0);
  const basePay = Math.floor(dailyRate * actualPayDays);
  const overtimePay = Math.floor(hourlyRate * 1.5 * (data.overtimeHours || 0)); // 加班费1.5倍

  const grossPay = basePay + (data.bonus || 0) + (data.allowance || 0) + overtimePay;
  const socialInsurance = Math.floor(grossPay * 0.105); // 社保10.5%
  const tax = Math.floor(Math.max(0, grossPay - socialInsurance - 500000) * 0.03); // 个税（简化计算）
  const netPay = grossPay - socialInsurance - tax - (data.deduction || 0);

  return {
    baseSalary: data.baseSalary || 1000000,
    workDays: data.workDays || 21,
    actualWorkDays: data.actualWorkDays || 0,
    paidLeaveDays: data.paidLeaveDays || 0,
    unpaidLeaveDays: data.unpaidLeaveDays || 0,
    overtimeHours: data.overtimeHours || 0,
    basePay,
    overtimePay,
    bonus: data.bonus || 0,
    allowance: data.allowance || 0,
    deduction: data.deduction || 0,
    socialInsurance,
    tax,
    grossPay,
    netPay,
  };
}

export async function markPayrollAsPaid(
  id: string,
  paymentMethod: string,
  paymentAccount?: string
) {
  const db = await getDb();
  const [result] = await db
    .update(payrollRecords)
    .set({
      status: 'paid',
      paidAt: new Date(),
      paymentMethod,
      paymentAccount,
      updatedAt: new Date(),
    })
    .where(eq(payrollRecords.id, id))
    .returning();
  return result;
}

// ========== 社保记录管理 ==========

export async function createSocialInsuranceRecord(data: InsertSocialInsuranceRecord) {
  const db = await getDb();
  const [result] = await db.insert(socialInsuranceRecords).values(data).returning();
  return result;
}

export async function getSocialInsuranceRecords(filters: {
  companyId: string;
  employeeId?: string;
  period?: string;
  insuranceType?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  const conditions = [eq(socialInsuranceRecords.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(socialInsuranceRecords.employeeId, filters.employeeId));
  }

  if (filters.period) {
    conditions.push(eq(socialInsuranceRecords.period, filters.period));
  }

  if (filters.insuranceType) {
    conditions.push(eq(socialInsuranceRecords.insuranceType, filters.insuranceType));
  }

  const query = db
    .select()
    .from(socialInsuranceRecords)
    .where(and(...conditions))
    .orderBy(desc(socialInsuranceRecords.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getSocialInsuranceRecordById(id: string) {
  const db = await getDb();
  const [result] = await db
    .select()
    .from(socialInsuranceRecords)
    .where(eq(socialInsuranceRecords.id, id));
  return result;
}

export async function updateSocialInsuranceRecord(
  id: string,
  data: Partial<InsertSocialInsuranceRecord>
) {
  const db = await getDb();
  const [result] = await db
    .update(socialInsuranceRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(socialInsuranceRecords.id, id))
    .returning();
  return result;
}

export async function deleteSocialInsuranceRecord(id: string) {
  const db = await getDb();
  const result = await db.delete(socialInsuranceRecords).where(eq(socialInsuranceRecords.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getEmployeeSocialInsuranceRecords(employeeId: string, limit = 12) {
  const db = await getDb();
  return db
    .select()
    .from(socialInsuranceRecords)
    .where(eq(socialInsuranceRecords.employeeId, employeeId))
    .orderBy(desc(socialInsuranceRecords.createdAt))
    .limit(limit);
}

// ========== 薪酬统计 ==========

export async function getPayrollStatistics(companyId: string, period?: string) {
  const db = await getDb();
  
  const conditions = [eq(payrollRecords.companyId, companyId)];
  
  if (period) {
    conditions.push(eq(payrollRecords.period, period));
  }

  const records = await db
    .select()
    .from(payrollRecords)
    .where(and(...conditions));

  const totalRecords = records.length;
  const paidRecords = records.filter(r => r.status === 'paid');
  const calculatedRecords = records.filter(r => r.status === 'calculated');

  const totalBaseSalary = records.reduce((sum, r) => sum + (r.baseSalary || 0), 0);
  const totalGrossPay = records.reduce((sum, r) => sum + (r.grossPay || 0), 0);
  const totalNetPay = records.reduce((sum, r) => sum + (r.netPay || 0), 0);
  const totalBonus = records.reduce((sum, r) => sum + (r.bonus || 0), 0);
  const totalOvertimePay = records.reduce((sum, r) => sum + (r.overtimePay || 0), 0);
  const totalSocialInsurance = records.reduce((sum, r) => sum + (r.socialInsurance || 0), 0);
  const totalTax = records.reduce((sum, r) => sum + (r.tax || 0), 0);

  return {
    totalRecords,
    paidRecords: paidRecords.length,
    calculatedRecords: calculatedRecords.length,
    totalBaseSalary,
    totalGrossPay,
    totalNetPay,
    totalBonus,
    totalOvertimePay,
    totalSocialInsurance,
    totalTax,
    avgBaseSalary: totalRecords > 0 ? Math.round(totalBaseSalary / totalRecords) : 0,
    avgGrossPay: totalRecords > 0 ? Math.round(totalGrossPay / totalRecords) : 0,
    avgNetPay: totalRecords > 0 ? Math.round(totalNetPay / totalRecords) : 0,
  };
}

export async function getCompanyPayrollSummary(companyId: string, months = 12) {
  const db = await getDb();
  
  // 获取最近N个月的数据
  const recentPeriods: string[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    recentPeriods.push(period);
  }

  const records = await db
    .select()
    .from(payrollRecords)
    .where(
      and(
        eq(payrollRecords.companyId, companyId),
        sql`${payrollRecords.period} = ANY(${recentPeriods})`
      )
    );

  // 按月分组统计
  const monthlySummary = recentPeriods.map(period => {
    const periodRecords = records.filter(r => r.period === period);
    return {
      period,
      totalEmployees: periodRecords.length,
      totalGrossPay: periodRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0),
      totalNetPay: periodRecords.reduce((sum, r) => sum + (r.netPay || 0), 0),
      avgGrossPay: periodRecords.length > 0 
        ? Math.round(periodRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0) / periodRecords.length)
        : 0,
      avgNetPay: periodRecords.length > 0 
        ? Math.round(periodRecords.reduce((sum, r) => sum + (r.netPay || 0), 0) / periodRecords.length)
        : 0,
    };
  });

  return monthlySummary.reverse();
}
