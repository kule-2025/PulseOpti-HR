/**
 * 考勤管理数据库管理
 * 提供打卡、请假、加班、排班等数据的CRUD操作
 */

import { getDb } from '@/lib/db';
import {
  attendanceRecords,
  leaveRequests,
  overtimeRequests,
  schedules,
  employees,
} from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte, or, between } from 'drizzle-orm';
import type {
  InsertAttendanceRecord,
  InsertLeaveRequest,
  InsertOvertimeRequest,
  InsertSchedule,
} from '@/storage/database/shared/schema';

async function getDB() {
  return await getDb();
}

// ========== 打卡记录管理 ==========

export async function createAttendanceRecord(data: InsertAttendanceRecord) {
  const db = await getDB();
  const [result] = await db.insert(attendanceRecords).values(data).returning();
  return result;
}

export async function getAttendanceRecords(filters: {
  companyId: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDB();
  const conditions = [eq(attendanceRecords.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(attendanceRecords.employeeId, filters.employeeId));
  }

  if (filters.dateFrom) {
    conditions.push(gte(attendanceRecords.recordDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(attendanceRecords.recordDate, new Date(filters.dateTo)));
  }

  if (filters.status) {
    conditions.push(eq(attendanceRecords.status, filters.status));
  }

  const query = db
    .select({
      id: attendanceRecords.id,
      companyId: attendanceRecords.companyId,
      employeeId: attendanceRecords.employeeId,
      recordDate: attendanceRecords.recordDate,
      clockInTime: attendanceRecords.clockInTime,
      clockOutTime: attendanceRecords.clockOutTime,
      workHours: attendanceRecords.workHours,
      status: attendanceRecords.status,
      location: attendanceRecords.location,
      deviceInfo: attendanceRecords.deviceInfo,
      metadata: attendanceRecords.metadata,
      createdAt: attendanceRecords.createdAt,
      updatedAt: attendanceRecords.updatedAt,
      employeeName: employees.name,
      employeeDepartment: employees.departmentId,
    })
    .from(attendanceRecords)
    .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(attendanceRecords.recordDate));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getAttendanceRecordById(id: string) {
  const db = await getDB();
  const [result] = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.id, id));
  return result;
}

export async function updateAttendanceRecord(id: string, data: Partial<InsertAttendanceRecord>) {
  const db = await getDB();
  const [result] = await db
    .update(attendanceRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(attendanceRecords.id, id))
    .returning();
  return result;
}

// ========== 请假管理 ==========

export async function createLeaveRequest(data: InsertLeaveRequest) {
  const db = await getDB();
  const [result] = await db.insert(leaveRequests).values(data).returning();
  return result;
}

export async function getLeaveRequests(filters: {
  companyId: string;
  employeeId?: string;
  departmentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDB();
  const conditions = [eq(leaveRequests.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(leaveRequests.employeeId, filters.employeeId));
  }

  if (filters.departmentId) {
    conditions.push(eq(leaveRequests.departmentId, filters.departmentId));
  }

  if (filters.status) {
    conditions.push(eq(leaveRequests.status, filters.status));
  }

  if (filters.dateFrom) {
    conditions.push(gte(leaveRequests.startDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(leaveRequests.endDate, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: leaveRequests.id,
      companyId: leaveRequests.companyId,
      employeeId: leaveRequests.employeeId,
      departmentId: leaveRequests.departmentId,
      leaveType: leaveRequests.leaveType,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      days: leaveRequests.days,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      approverId: leaveRequests.approverId,
      approverName: leaveRequests.approverName,
      approverComment: leaveRequests.approverComment,
      approvedAt: leaveRequests.approvedAt,
      attachments: leaveRequests.attachments,
      metadata: leaveRequests.metadata,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      employeeName: employees.name,
    })
    .from(leaveRequests)
    .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(leaveRequests.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getLeaveRequestById(id: string) {
  const db = await getDB();
  const [result] = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.id, id));
  return result;
}

export async function updateLeaveRequest(
  id: string,
  data: Partial<InsertLeaveRequest>
) {
  const db = await getDB();
  const [result] = await db
    .update(leaveRequests)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(leaveRequests.id, id))
    .returning();
  return result;
}

export async function approveLeaveRequest(
  id: string,
  approverId: string,
  approverName: string,
  approved: boolean,
  comment?: string
) {
  const db = await getDB();
  const [result] = await db
    .update(leaveRequests)
    .set({
      status: approved ? 'approved' : 'rejected',
      approverId,
      approverName,
      approverComment: comment,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, id))
    .returning();
  return result;
}

// ========== 加班管理 ==========

export async function createOvertimeRequest(data: InsertOvertimeRequest) {
  const db = await getDB();
  const [result] = await db.insert(overtimeRequests).values(data).returning();
  return result;
}

export async function getOvertimeRequests(filters: {
  companyId: string;
  employeeId?: string;
  departmentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDB();
  const conditions = [eq(overtimeRequests.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(overtimeRequests.employeeId, filters.employeeId));
  }

  if (filters.departmentId) {
    conditions.push(eq(overtimeRequests.departmentId, filters.departmentId));
  }

  if (filters.status) {
    conditions.push(eq(overtimeRequests.status, filters.status));
  }

  if (filters.dateFrom) {
    conditions.push(gte(overtimeRequests.overtimeDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(overtimeRequests.overtimeDate, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: overtimeRequests.id,
      companyId: overtimeRequests.companyId,
      employeeId: overtimeRequests.employeeId,
      departmentId: overtimeRequests.departmentId,
      overtimeDate: overtimeRequests.overtimeDate,
      startTime: overtimeRequests.startTime,
      endTime: overtimeRequests.endTime,
      duration: overtimeRequests.duration,
      reason: overtimeRequests.reason,
      overtimeType: overtimeRequests.overtimeType,
      status: overtimeRequests.status,
      approverId: overtimeRequests.approverId,
      approverName: overtimeRequests.approverName,
      approverComment: overtimeRequests.approverComment,
      approvedAt: overtimeRequests.approvedAt,
      metadata: overtimeRequests.metadata,
      createdAt: overtimeRequests.createdAt,
      updatedAt: overtimeRequests.updatedAt,
      employeeName: employees.name,
    })
    .from(overtimeRequests)
    .leftJoin(employees, eq(overtimeRequests.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(desc(overtimeRequests.createdAt));

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getOvertimeRequestById(id: string) {
  const db = await getDB();
  const [result] = await db
    .select()
    .from(overtimeRequests)
    .where(eq(overtimeRequests.id, id));
  return result;
}

export async function updateOvertimeRequest(
  id: string,
  data: Partial<InsertOvertimeRequest>
) {
  const db = await getDB();
  const [result] = await db
    .update(overtimeRequests)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(overtimeRequests.id, id))
    .returning();
  return result;
}

export async function approveOvertimeRequest(
  id: string,
  approverId: string,
  approverName: string,
  approved: boolean,
  comment?: string
) {
  const db = await getDB();
  const [result] = await db
    .update(overtimeRequests)
    .set({
      status: approved ? 'approved' : 'rejected',
      approverId,
      approverName,
      approverComment: comment,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(overtimeRequests.id, id))
    .returning();
  return result;
}

// ========== 排班管理 ==========

export async function createSchedule(data: InsertSchedule) {
  const db = await getDB();
  const [result] = await db.insert(schedules).values(data).returning();
  return result;
}

export async function getSchedules(filters: {
  companyId: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDB();
  const conditions = [eq(schedules.companyId, filters.companyId)];

  if (filters.employeeId) {
    conditions.push(eq(schedules.employeeId, filters.employeeId));
  }

  if (filters.dateFrom) {
    conditions.push(gte(schedules.scheduleDate, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(schedules.scheduleDate, new Date(filters.dateTo)));
  }

  const query = db
    .select({
      id: schedules.id,
      companyId: schedules.companyId,
      employeeId: schedules.employeeId,
      scheduleDate: schedules.scheduleDate,
      shiftType: schedules.shiftType,
      shiftName: schedules.shiftName,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      metadata: schedules.metadata,
      createdAt: schedules.createdAt,
      updatedAt: schedules.updatedAt,
      employeeName: employees.name,
    })
    .from(schedules)
    .leftJoin(employees, eq(schedules.employeeId, employees.id))
    .where(and(...conditions))
    .orderBy(schedules.scheduleDate);

  if (filters.offset) query.offset(filters.offset);
  if (filters.limit) query.limit(filters.limit);

  return query;
}

export async function getScheduleById(id: string) {
  const db = await getDB();
  const [result] = await db.select().from(schedules).where(eq(schedules.id, id));
  return result;
}

export async function updateSchedule(id: string, data: Partial<InsertSchedule>) {
  const db = await getDB();
  const [result] = await db
    .update(schedules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schedules.id, id))
    .returning();
  return result;
}

export async function deleteSchedule(id: string) {
  const db = await getDB();
  const [result] = await db
    .delete(schedules)
    .where(eq(schedules.id, id))
    .returning();
  return result;
}

// ========== 统计分析 ==========

export async function getAttendanceStatistics(companyId: string, dateFrom: string, dateTo: string) {
  const db = await getDB();
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const records = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.companyId, companyId),
        gte(attendanceRecords.recordDate, fromDate),
        lte(attendanceRecords.recordDate, toDate)
      )
    );

  const stats = {
    totalRecords: records.length,
    normal: records.filter(r => r.status === 'normal').length,
    late: records.filter(r => r.status === 'late').length,
    early: records.filter(r => r.status === 'early_leave').length,
    absent: records.filter(r => r.status === 'absent').length,
    overtime: records.filter(r => r.status === 'overtime').length,
    lateRate: records.length > 0 ? (records.filter(r => r.status === 'late').length / records.length * 100).toFixed(1) : '0',
    attendanceRate: records.length > 0 ? ((records.filter(r => r.status === 'normal').length / records.length) * 100).toFixed(1) : '0',
    averageWorkHours: records.length > 0 ? (records.reduce((sum, r) => sum + (r.workHours || 0), 0) / records.length / 60).toFixed(1) : '0',
  };

  return stats;
}

// 获取考勤异常记录
export async function getAbnormalAttendanceRecords(companyId: string, dateFrom: string, dateTo: string) {
  const db = await getDB();
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const records = await db
    .select({
      id: attendanceRecords.id,
      companyId: attendanceRecords.companyId,
      employeeId: attendanceRecords.employeeId,
      recordDate: attendanceRecords.recordDate,
      clockInTime: attendanceRecords.clockInTime,
      clockOutTime: attendanceRecords.clockOutTime,
      workHours: attendanceRecords.workHours,
      status: attendanceRecords.status,
      location: attendanceRecords.location,
      deviceInfo: attendanceRecords.deviceInfo,
      metadata: attendanceRecords.metadata,
      createdAt: attendanceRecords.createdAt,
      updatedAt: attendanceRecords.updatedAt,
      employeeName: employees.name,
      employeeDepartmentId: employees.departmentId,
    })
    .from(attendanceRecords)
    .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
    .where(
      and(
        eq(attendanceRecords.companyId, companyId),
        gte(attendanceRecords.recordDate, fromDate),
        lte(attendanceRecords.recordDate, toDate),
        or(
          eq(attendanceRecords.status, 'late'),
          eq(attendanceRecords.status, 'early_leave'),
          eq(attendanceRecords.status, 'absent'),
          eq(attendanceRecords.status, 'overtime')
        )
      )
    )
    .orderBy(desc(attendanceRecords.recordDate));

  return records;
}

// 获取请假统计
export async function getLeaveStatistics(companyId: string, dateFrom: string, dateTo: string) {
  const db = await getDB();
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const requests = await db
    .select()
    .from(leaveRequests)
    .where(
      and(
        eq(leaveRequests.companyId, companyId),
        gte(leaveRequests.startDate, fromDate),
        lte(leaveRequests.endDate, toDate)
      )
    );

  const stats = {
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalDays: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0),
    annualLeave: requests.filter(r => r.leaveType === 'annual' && r.status === 'approved').reduce((sum, r) => sum + r.days, 0),
    sickLeave: requests.filter(r => r.leaveType === 'sick' && r.status === 'approved').reduce((sum, r) => sum + r.days, 0),
    personalLeave: requests.filter(r => r.leaveType === 'personal' && r.status === 'approved').reduce((sum, r) => sum + r.days, 0),
  };

  return stats;
}

// 获取加班统计
export async function getOvertimeStatistics(companyId: string, dateFrom: string, dateTo: string) {
  const db = await getDB();

  const requests = await db
    .select()
    .from(overtimeRequests)
    .where(
      and(
        eq(overtimeRequests.companyId, companyId),
        gte(overtimeRequests.overtimeDate, new Date(dateFrom)),
        lte(overtimeRequests.overtimeDate, new Date(dateTo))
      )
    );

  const stats = {
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalHours: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.duration, 0) / 60,
    totalEmployees: new Set(requests.filter(r => r.status === 'approved').map(r => r.employeeId)).size,
    averageHoursPerEmployee: 0,
  };

  if (stats.totalEmployees > 0) {
    stats.averageHoursPerEmployee = parseFloat((stats.totalHours / stats.totalEmployees).toFixed(1));
  }

  return stats;
}

// 获取排班统计
export async function getScheduleStatistics(companyId: string, dateFrom: string, dateTo: string) {
  const db = await getDB();

  const scheduleRecords = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.companyId, companyId),
        gte(schedules.scheduleDate, new Date(dateFrom)),
        lte(schedules.scheduleDate, new Date(dateTo))
      )
    );

  const stats = {
    totalSchedules: scheduleRecords.length,
    workingDays: scheduleRecords.filter(s => s.isWorkingDay).length,
    totalEmployees: new Set(scheduleRecords.map(s => s.employeeId)).size,
    shiftTypes: [...new Set(scheduleRecords.map(s => s.shiftType))],
    coverageRate: '0',
  };

  return stats;
}
