/**
 * GDPR合规服务
 * 提供数据主体权利接口，支持数据访问、删除、导出等功能
 */

import { db } from '@/lib/db';
import { users, employees, performanceRecords, attendanceRecords, trainingRecords } from '@/storage/database/shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { encryptionService } from '@/lib/encryption-service';

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'deletion' | 'correction' | 'export' | 'restriction';
  requesterId: string;
  requesterEmail: string;
  dataSubjectId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  rejectionReason?: string;
}

export interface DataExportPackage {
  requestId: string;
  dataSubjectId: string;
  exportedAt: Date;
  format: 'json' | 'csv' | 'pdf';
  data: {
    personalData: any;
    employmentData: any;
    performanceData: any;
    attendanceData: any;
    trainingData: any;
  };
}

export class GDPRComplianceService {
  /**
   * 创建数据主体请求
   */
  async createRequest(
    requesterId: string,
    type: DataSubjectRequest['type'],
    dataSubjectId?: string
  ): Promise<DataSubjectRequest> {
    const [requester] = await db
      .select()
      .from(users)
      .where(eq(users.id, requesterId))
      .limit(1);

    if (!requester) {
      throw new Error('请求者不存在');
    }

    // 如果未指定数据主体，默认为请求者本人
    const subjectId = dataSubjectId || requesterId;

    // 验证权限（管理员可以为他人发起请求）
    if (subjectId !== requesterId && requester.role !== 'admin' && requester.role !== 'super_admin') {
      throw new Error('无权为他人发起请求');
    }

    const request: DataSubjectRequest = {
      id: `dsr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      requesterId,
      requesterEmail: requester.email,
      dataSubjectId: subjectId,
      status: 'pending',
      requestedAt: new Date(),
    };

    // TODO: 保存请求到数据库
    // 这里简化处理，直接返回

    return request;
  }

  /**
   * 处理数据访问请求
   */
  async processAccessRequest(requestId: string): Promise<any> {
    const request = await this.getRequest(requestId);
    if (!request) throw new Error('请求不存在');

    // 更新状态
    request.status = 'processing';

    // 收集所有相关数据
    const personalData = await this.getPersonalData(request.dataSubjectId);
    const employmentData = await this.getEmploymentData(request.dataSubjectId);
    const performanceData = await this.getPerformanceData(request.dataSubjectId);
    const attendanceData = await this.getAttendanceData(request.dataSubjectId);
    const trainingData = await this.getTrainingData(request.dataSubjectId);

    request.status = 'completed';
    request.processedAt = new Date();

    return {
      requestId,
      dataSubjectId: request.dataSubjectId,
      data: {
        personalData,
        employmentData,
        performanceData,
        attendanceData,
        trainingData,
      },
      processedAt: request.processedAt,
    };
  }

  /**
   * 处理数据删除请求（被遗忘权）
   */
  async processDeletionRequest(requestId: string): Promise<void> {
    const request = await this.getRequest(requestId);
    if (!request) throw new Error('请求不存在');

    request.status = 'processing';

    // 软删除（标记为已删除）
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        status: 'deleted',
      })
      .where(eq(users.id, request.dataSubjectId));

    // TODO: 处理相关数据的删除或匿名化
    // 注意：某些数据（如绩效记录、考勤记录）可能需要保留以符合法律规定

    request.status = 'completed';
    request.processedAt = new Date();
  }

  /**
   * 处理数据导出请求（数据可携带权）
   */
  async processExportRequest(
    requestId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<DataExportPackage> {
    const request = await this.getRequest(requestId);
    if (!request) throw new Error('请求不存在');

    request.status = 'processing';

    const dataPackage: DataExportPackage = {
      requestId,
      dataSubjectId: request.dataSubjectId,
      exportedAt: new Date(),
      format,
      data: {
        personalData: await this.getPersonalData(request.dataSubjectId),
        employmentData: await this.getEmploymentData(request.dataSubjectId),
        performanceData: await this.getPerformanceData(request.dataSubjectId),
        attendanceData: await this.getAttendanceData(request.dataSubjectId),
        trainingData: await this.getTrainingData(request.dataSubjectId),
      },
    };

    request.status = 'completed';
    request.processedAt = new Date();

    return dataPackage;
  }

  /**
   * 处理数据更正请求
   */
  async processCorrectionRequest(
    requestId: string,
    corrections: Record<string, any>
  ): Promise<void> {
    const request = await this.getRequest(requestId);
    if (!request) throw new Error('请求不存在');

    request.status = 'processing';

    // 应用更正
    for (const [field, value] of Object.entries(corrections)) {
      if (field === 'phone') {
        // 加密敏感信息
        const encryptedValue = encryptionService.encrypt(value);
        await db
          .update(users)
          .set({ [field]: encryptedValue })
          .where(eq(users.id, request.dataSubjectId));
      } else {
        await db
          .update(users)
          .set({ [field]: value })
          .where(eq(users.id, request.dataSubjectId));
      }
    }

    request.status = 'completed';
    request.processedAt = new Date();
  }

  /**
   * 获取数据主体请求列表
   */
  async getRequests(filters?: {
    requesterId?: string;
    status?: DataSubjectRequest['status'];
    type?: DataSubjectRequest['type'];
  }): Promise<DataSubjectRequest[]> {
    // TODO: 实现查询逻辑
    return [];
  }

  // ==================== 私有方法 ====================

  private async getRequest(requestId: string): Promise<DataSubjectRequest | null> {
    // TODO: 从数据库获取请求
    // 这里简化处理
    return {
      id: requestId,
      type: 'access',
      requesterId: '',
      requesterEmail: '',
      dataSubjectId: '',
      status: 'pending',
      requestedAt: new Date(),
    };
  }

  private async getPersonalData(userId: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    // 解密敏感信息
    const phone = user.phone ? encryptionService.decrypt(user.phone) : null;

    return {
      ...user,
      phone,
    };
  }

  private async getEmploymentData(userId: string): Promise<any> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    return employee;
  }

  private async getPerformanceData(userId: string): Promise<any[]> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    if (!employee) return [];

    const results = await db
      .select()
      .from(performance)
      .where(eq(performance.employeeId, employee.id));

    return results;
  }

  private async getAttendanceData(userId: string): Promise<any[]> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    if (!employee) return [];

    const results = await db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employee.id));

    return results;
  }

  private async getTrainingData(userId: string): Promise<any[]> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);

    if (!employee) return [];

    const results = await db
      .select()
      .from(training)
      .where(eq(training.employeeId, employee.id));

    return results;
  }
}

// 导出单例
export const gdprComplianceService = new GDPRComplianceService();
