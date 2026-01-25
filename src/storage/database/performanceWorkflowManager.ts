import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { performanceRecords, performanceCycles, employees } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 绩效工作流管理器
 * 将绩效评估流程与工作流引擎深度集成，实现100%闭环
 */
export class PerformanceWorkflowManager {
  /**
   * 创建绩效工作流实例
   */
  async createPerformanceWorkflow(options: {
    companyId: string;
    cycleId: string;
    recordId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, cycleId, recordId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取绩效周期信息
    const [cycle] = await db.select().from(performanceCycles).where(eq(performanceCycles.id, cycleId)).limit(1);
    if (!cycle) {
      throw new Error('绩效周期不存在');
    }

    // 获取绩效记录信息
    const [record] = await db.select().from(performanceRecords).where(eq(performanceRecords.id, recordId)).limit(1);
    if (!record) {
      throw new Error('绩效记录不存在');
    }

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, record.employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 定义绩效工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '自评',
        type: 'task',
        description: '员工进行自我评估',
        assigneeId: employee.userId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '上级评估',
        type: 'approval',
        description: '直接上级进行评估',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '绩效面谈',
        type: 'task',
        description: '进行绩效面谈',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '结果确认',
        type: 'approval',
        description: '员工确认绩效结果',
        assigneeId: employee.userId,
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'performance-default',
      templateName: '标准绩效评估流程',
      type: 'performance',
      name: `${employee.name} - ${cycle.name} 绩效评估`,
      description: `绩效周期：${cycle.name}，员工：${employee.name}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'performance_record',
      relatedEntityId: recordId,
      relatedEntityName: `${employee.name} - ${cycle.name}`,
      formData: {
        cycleId,
        cycleName: cycle.name,
        recordId,
        employeeId: record.employeeId,
        employeeName: employee.name,
        goals: record.goals,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
    } as InsertWorkflowInstance);

    // 更新绩效记录状态
    await db.update(performanceRecords)
      .set({
        status: 'submitted',
        metadata: {
          ...(record.metadata || {}),
          workflowInstanceId: instance.id,
        },
      })
      .where(eq(performanceRecords.id, recordId));

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'performance',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建绩效工作流实例：${employee.name} - ${cycle.name}`,
      metadata: {
        cycleId,
        recordId,
        employeeId: record.employeeId,
      },
    });

    return instance;
  }

  /**
   * 获取绩效工作流实例
   */
  async getPerformanceWorkflow(recordId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        relatedEntityId: recordId,
        type: 'performance',
      },
      limit: 1,
    });

    return instances[0] || null;
  }

  /**
   * 完成绩效步骤并推进
   */
  async advancePerformanceStep(instanceId: string, options: {
    stepId: string;
    result: string;
    comments?: string;
    formData?: any;
    scores?: {
      selfScore?: number;
      reviewerScore?: number;
      finalScore?: number;
    };
    advanceToNext?: boolean;
    actorId: string;
    actorName: string;
    actorRole: string;
  }) {
    const db = await getDb();
    const instance = await workflowManager.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('工作流实例不存在');
    }

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    if (currentStep.id !== options.stepId) {
      throw new Error('步骤ID不匹配');
    }

    // 更新当前步骤
    currentStep.status = 'completed';
    currentStep.endTime = new Date();
    currentStep.result = options.result;
    if (options.comments) currentStep.comments = options.comments;
    if (options.formData) currentStep.formData = options.formData;

    // 记录历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'performance',
      action: 'step_completed',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `完成绩效步骤：${currentStep.name}`,
      metadata: {
        result: options.result,
        comments: options.comments,
        scores: options.scores,
      },
    });

    // 更新绩效记录
    const recordId = instance.relatedEntityId;
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (currentStep.name.includes('自评') && options.scores?.selfScore) {
      updateData.selfScore = options.scores.selfScore;
    }

    if (currentStep.name.includes('上级评估') && options.scores?.reviewerScore) {
      updateData.reviewerScore = options.scores.reviewerScore;
    }

    if (currentStep.name.includes('结果确认')) {
      updateData.status = 'completed';
      if (options.scores?.finalScore) {
        updateData.finalScore = options.scores.finalScore;
      }
      if (options.formData?.achievements) updateData.achievements = options.formData.achievements;
      if (options.formData?.improvements) updateData.improvements = options.formData.improvements;
      if (options.formData?.feedback) updateData.feedback = options.formData.feedback;
    }

    if (Object.keys(updateData).length > 1) {
      await db.update(performanceRecords)
        .set(updateData)
        .where(eq(performanceRecords.id, recordId!));
    }

    // 推进到下一步
    let updatedInstance: any = instance;
    if (options.advanceToNext !== false) {
      updatedInstance = await workflowManager.advanceStep(instanceId);
      if (!updatedInstance) {
        throw new Error('推进工作流失败');
      }

      // 检查是否完成
      if (updatedInstance.status === 'completed') {
        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: 'performance',
          action: 'completed',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          description: '绩效评估流程已完成',
          metadata: {
            recordId,
            finalScore: options.scores?.finalScore,
          },
        });

        // 确保绩效记录状态为已完成
        await db.update(performanceRecords)
          .set({
            status: 'completed',
            reviewedAt: new Date(),
          })
          .where(eq(performanceRecords.id, recordId!));
      } else {
        // 记录开始下一步
        const newSteps = updatedInstance.steps as any[];
        const newStep = newSteps[updatedInstance.currentStepIndex];

        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: 'performance',
          action: 'step_started',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          stepId: newStep.id,
          stepName: newStep.name,
          description: `开始绩效步骤：${newStep.name}`,
        });
      }
    } else {
      updatedInstance = await workflowManager.updateInstance(instanceId, {
        steps,
      });
    }

    return updatedInstance;
  }

  /**
   * 获取绩效统计数据
   */
  async getPerformanceStats(companyId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        companyId,
        type: 'performance',
      },
    });

    const stats = {
      total: instances.length,
      byStatus: {
        draft: 0,
        active: 0,
        paused: 0,
        completed: 0,
        cancelled: 0,
      },
      avgTime: 0,
      completionRate: 0,
    };

    let totalTime = 0;
    let completedCount = 0;

    for (const instance of instances) {
      stats.byStatus[instance.status as keyof typeof stats.byStatus]++;

      if (instance.status === 'completed' && instance.startDate && instance.endDate) {
        totalTime += instance.endDate.getTime() - instance.startDate.getTime();
        completedCount++;
      }
    }

    stats.avgTime = completedCount > 0 ? totalTime / completedCount : 0;
    stats.completionRate = completedCount > 0 ? (completedCount / instances.length) * 100 : 0;

    return stats;
  }
}

export const performanceWorkflowManager = new PerformanceWorkflowManager();
