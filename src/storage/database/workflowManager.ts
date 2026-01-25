import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  workflowTemplates,
  workflowInstances,
  workflowHistory,
  type WorkflowTemplate,
  type WorkflowInstance,
  type WorkflowHistory as WorkflowHistoryType,
  type InsertWorkflowTemplate,
  type InsertWorkflowInstance,
  type InsertWorkflowHistory,
} from './shared/schema';
import { workflowHistoryManager } from './workflowHistoryManager';

export class WorkflowManager {
  // ============ 工作流模板管理 ============

  async createTemplate(data: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const db = await getDb();
    const [template] = await db.insert(workflowTemplates).values(data).returning();
    return template;
  }

  async getTemplates(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      type: string;
      isActive: boolean;
      isPublic: boolean;
    }>;
  } = {}): Promise<WorkflowTemplate[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(workflowTemplates.companyId, filters.companyId));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(workflowTemplates.type, filters.type));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(workflowTemplates.isActive, filters.isActive));
    }
    if (filters.isPublic !== undefined) {
      conditions.push(eq(workflowTemplates.isPublic, filters.isPublic));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(workflowTemplates)
        .where(and(...conditions))
        .orderBy(desc(workflowTemplates.updatedAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(workflowTemplates)
      .orderBy(desc(workflowTemplates.updatedAt))
      .limit(limit)
      .offset(skip);
  }

  async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    const db = await getDb();
    const [template] = await db.select().from(workflowTemplates).where(eq(workflowTemplates.id, id));
    return template || null;
  }

  async getTemplateByType(companyId: string, type: string): Promise<WorkflowTemplate | null> {
    const db = await getDb();
    const [template] = await db
      .select()
      .from(workflowTemplates)
      .where(and(
        eq(workflowTemplates.companyId, companyId),
        eq(workflowTemplates.type, type),
        eq(workflowTemplates.isActive, true)
      ));
    return template || null;
  }

  async updateTemplate(id: string, data: Partial<InsertWorkflowTemplate>): Promise<WorkflowTemplate | null> {
    const db = await getDb();
    const [template] = await db
      .update(workflowTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workflowTemplates.id, id))
      .returning();
    return template || null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(workflowTemplates).where(eq(workflowTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPublicTemplates(type?: string): Promise<WorkflowTemplate[]> {
    const db = await getDb();
    const conditions: SQL[] = [
      eq(workflowTemplates.isPublic, true),
      eq(workflowTemplates.isActive, true)
    ];

    if (type) {
      conditions.push(eq(workflowTemplates.type, type));
    }

    return db
      .select()
      .from(workflowTemplates)
      .where(and(...conditions))
      .orderBy(desc(workflowTemplates.createdAt));
  }

  // ============ 工作流实例管理 ============

  async createInstance(data: InsertWorkflowInstance): Promise<WorkflowInstance> {
    const db = await getDb();
    const [instance] = await db.insert(workflowInstances).values(data).returning();
    return instance;
  }

  async getInstances(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      companyId: string;
      templateId: string;
      type: string;
      status: string;
      initiatorId: string;
      relatedEntityId: string;
    }>;
  } = {}): Promise<WorkflowInstance[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.companyId !== undefined) {
      conditions.push(eq(workflowInstances.companyId, filters.companyId));
    }
    if (filters.templateId !== undefined) {
      conditions.push(eq(workflowInstances.templateId, filters.templateId));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(workflowInstances.type, filters.type));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(workflowInstances.status, filters.status));
    }
    if (filters.initiatorId !== undefined) {
      conditions.push(eq(workflowInstances.initiatorId, filters.initiatorId));
    }
    if (filters.relatedEntityId !== undefined) {
      conditions.push(eq(workflowInstances.relatedEntityId, filters.relatedEntityId));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(workflowInstances)
        .where(and(...conditions))
        .orderBy(desc(workflowInstances.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(workflowInstances)
      .orderBy(desc(workflowInstances.createdAt))
      .limit(limit)
      .offset(skip);
  }

  async getInstanceById(id: string): Promise<WorkflowInstance | null> {
    const db = await getDb();
    const [instance] = await db.select().from(workflowInstances).where(eq(workflowInstances.id, id));
    return instance || null;
  }

  async updateInstance(id: string, data: Partial<InsertWorkflowInstance>): Promise<WorkflowInstance | null> {
    const db = await getDb();
    const [instance] = await db
      .update(workflowInstances)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workflowInstances.id, id))
      .returning();
    return instance || null;
  }

  async updateInstanceStatus(
    id: string,
    status: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkflowInstance | null> {
    const db = await getDb();
    const updateData: any = { status, updatedAt: new Date() };
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;

    const [instance] = await db
      .update(workflowInstances)
      .set(updateData)
      .where(eq(workflowInstances.id, id))
      .returning();
    return instance || null;
  }

  async advanceStep(instanceId: string): Promise<WorkflowInstance | null> {
    const db = await getDb();
    const [instance] = await db.select().from(workflowInstances).where(eq(workflowInstances.id, instanceId));
    if (!instance) return null;

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];
    
    // 完成当前步骤
    currentStep.status = 'completed';
    currentStep.endTime = new Date();

    // 进入下一步
    if (instance.currentStepIndex < steps.length - 1) {
      instance.currentStepIndex++;
      steps[instance.currentStepIndex].status = 'in_progress';
      steps[instance.currentStepIndex].startTime = new Date();
    } else {
      // 所有步骤完成
      instance.status = 'completed';
      instance.endDate = new Date();
    }

    const [updatedInstance] = await db
      .update(workflowInstances)
      .set({
        steps: steps,
        currentStepIndex: instance.currentStepIndex,
        status: instance.status,
        endDate: instance.endDate,
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instanceId))
      .returning();

    return updatedInstance || null;
  }

  async deleteInstance(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(workflowInstances).where(eq(workflowInstances.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveInstances(companyId: string): Promise<WorkflowInstance[]> {
    const db = await getDb();
    return db
      .select()
      .from(workflowInstances)
      .where(and(
        eq(workflowInstances.companyId, companyId),
        eq(workflowInstances.status, 'active')
      ))
      .orderBy(workflowInstances.createdAt);
  }

  async getPendingTasks(companyId: string, userId?: string): Promise<any[]> {
    const db = await getDb();
    const instances = await db
      .select()
      .from(workflowInstances)
      .where(and(
        eq(workflowInstances.companyId, companyId),
        eq(workflowInstances.status, 'active')
      ));

    const tasks: any[] = [];
    for (const instance of instances) {
      const steps = instance.steps as any[];
      const currentStep = steps[instance.currentStepIndex];
      
      if (currentStep && currentStep.status === 'in_progress') {
        // 如果指定了userId，只返回分配给该用户的任务
        if (!userId || currentStep.assigneeId === userId) {
          tasks.push({
            instanceId: instance.id,
            instanceName: instance.name,
            type: instance.type,
            stepId: currentStep.id,
            stepName: currentStep.name,
            stepIndex: instance.currentStepIndex,
            assigneeId: currentStep.assigneeId,
            initiatorId: instance.initiatorId,
            initiatorName: instance.initiatorName,
            createdAt: instance.createdAt,
            dueDate: instance.dueDate,
          });
        }
      }
    }

    return tasks;
  }

  // ============ 工作流统计 ============

  async getInstanceStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    avgCompletionTime: number;
  }> {
    const db = await getDb();
    const instances = await db
      .select()
      .from(workflowInstances)
      .where(eq(workflowInstances.companyId, companyId));

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalCompletionTime = 0;
    let completedCount = 0;

    for (const instance of instances) {
      byStatus[instance.status] = (byStatus[instance.status] || 0) + 1;
      byType[instance.type] = (byType[instance.type] || 0) + 1;

      if (instance.status === 'completed' && instance.startDate && instance.endDate) {
        totalCompletionTime += instance.endDate.getTime() - instance.startDate.getTime();
        completedCount++;
      }
    }

    return {
      total: instances.length,
      byStatus,
      byType,
      avgCompletionTime: completedCount > 0 ? totalCompletionTime / completedCount : 0,
    };
  }

  // ============ 工作流历史记录 ============

  async addHistory(data: InsertWorkflowHistory): Promise<WorkflowHistoryType> {
    return await workflowHistoryManager.createHistory(data);
  }

  async getHistory(instanceId: string): Promise<WorkflowHistoryType[]> {
    return await workflowHistoryManager.getHistoryByInstance(instanceId);
  }

  async getAllHistory(companyId: string, options?: {
    skip?: number;
    limit?: number;
    filters?: Partial<{
      type: string;
      action: string;
      actorId: string;
    }>;
  }): Promise<WorkflowHistoryType[]> {
    return await workflowHistoryManager.getHistory({
      skip: options?.skip,
      limit: options?.limit,
      filters: {
        companyId,
        ...options?.filters,
      },
    });
  }
}

export const workflowManager = new WorkflowManager();
