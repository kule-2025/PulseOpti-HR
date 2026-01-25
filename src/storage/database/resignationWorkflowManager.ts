import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { resignations, employees, departments } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 离职工作流管理器
 * 将离职流程与工作流引擎深度集成，实现100%闭环
 */
export class ResignationWorkflowManager {
  /**
   * 创建离职工作流实例
   */
  async createResignationWorkflow(options: {
    companyId: string;
    resignationId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, resignationId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取离职申请信息
    const [resignation] = await db.select().from(resignations).where(eq(resignations.id, resignationId)).limit(1);
    if (!resignation) {
      throw new Error('离职申请不存在');
    }

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, resignation.employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取部门信息
    let departmentName = '';
    if (employee.departmentId) {
      const [department] = await db.select().from(departments).where(eq(departments.id, employee.departmentId)).limit(1);
      if (department) departmentName = department.name;
    }

    // 定义离职工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '离职审批',
        type: 'approval',
        description: '直属上级审批离职申请',
        assigneeId: employee.managerId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: 'HR审批',
        type: 'approval',
        description: 'HR部门审批',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '工作交接',
        type: 'task',
        description: '进行工作交接',
        assigneeId: resignation.employeeId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '资产归还',
        type: 'task',
        description: '归还公司资产',
        assigneeRole: 'admin',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '离职面谈',
        type: 'task',
        description: '进行离职面谈',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '离职手续办理',
        type: 'task',
        description: '办理离职手续',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'resignation-default',
      templateName: '标准离职流程',
      type: 'resignation',
      name: `${employee.name} - 离职流程`,
      description: `员工：${employee.name}，预计最后工作日：${resignation.expectedLastDate}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'resignation',
      relatedEntityId: resignationId,
      relatedEntityName: `${employee.name} - 离职申请`,
      formData: {
        resignationId,
        employeeId: resignation.employeeId,
        employeeName: employee.name,
        departmentName,
        expectedLastDate: resignation.expectedLastDate,
        reason: resignation.reason,
        reasonCategory: resignation.reasonCategory,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'high',
    } as InsertWorkflowInstance);

    // 更新离职申请状态
    await db.update(resignations)
      .set({
        status: 'approved',
        metadata: {
          ...(resignation.metadata || {}),
          workflowInstanceId: instance.id,
        },
      })
      .where(eq(resignations.id, resignationId!));

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'resignation',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建离职工作流实例：${employee.name}`,
      metadata: {
        resignationId,
        employeeId: resignation.employeeId,
        expectedLastDate: resignation.expectedLastDate,
      },
    });

    return instance;
  }

  /**
   * 获取离职工作流实例
   */
  async getResignationWorkflow(resignationId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        relatedEntityId: resignationId,
        type: 'resignation',
      },
      limit: 1,
    });

    return instances[0] || null;
  }

  /**
   * 完成离职步骤并推进
   */
  async advanceResignationStep(instanceId: string, options: {
    stepId: string;
    result: string;
    comments?: string;
    formData?: any;
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
      type: 'resignation',
      action: 'step_completed',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `完成离职步骤：${currentStep.name}`,
      metadata: {
        result: options.result,
        comments: options.comments,
      },
    });

    // 更新离职申请
    const formData = instance.formData as any;
    const resignationId = (formData?.resignationId || instance.relatedEntityId) as string;
    if (resignationId && currentStep.name.includes('离职审批') && options.result === 'approved') {
      await db.update(resignations)
        .set({
          approvedBy: options.actorId,
          approvedAt: new Date(),
        })
        .where(eq(resignations.id, resignationId));
    }

    // 推进到下一步
    let updatedInstance: any = instance;
    if (options.advanceToNext !== false) {
      const advancedInstance = await workflowManager.advanceStep(instanceId);
      if (!advancedInstance) {
        throw new Error('推进工作流失败');
      }
      updatedInstance = advancedInstance;

      // 检查是否完成
      if (updatedInstance.status === 'completed') {
        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: 'resignation',
          action: 'completed',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          description: '离职流程已完成',
          metadata: {
            resignationId,
            endDate: updatedInstance.endDate,
          },
        });

        // 更新离职申请状态为已完成
        // 更新离职申请为已完成
        if (resignationId) {
          await db.update(resignations)
            .set({
              status: 'completed',
              actualLastDate: updatedInstance.endDate,
            })
            .where(eq(resignations.id, resignationId));
        }

        // 更新员工状态为已离职
        const employeeId = formData?.employeeId;
        if (employeeId) {
          await db.update(employees)
            .set({
              employmentStatus: 'resigned',
            })
            .where(eq(employees.id, employeeId));
        }
      } else {
        // 记录开始下一步
        const newSteps = updatedInstance.steps as any[];
        const newStep = newSteps[updatedInstance.currentStepIndex];

        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: 'resignation',
          action: 'step_started',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          stepId: newStep.id,
          stepName: newStep.name,
          description: `开始离职步骤：${newStep.name}`,
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
   * 拒绝离职申请（取消离职流程）
   */
  async rejectResignation(instanceId: string, options: {
    reason: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  }) {
    const db = await getDb();
    const instance = await workflowManager.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('工作流实例不存在');
    }

    const formData = instance.formData as any;
    const resignationId = (formData?.resignationId || instance.relatedEntityId) as string;

    // 取消工作流
    const updatedInstance = await workflowManager.updateInstanceStatus(
      instanceId,
      'cancelled',
      undefined,
      new Date()
    );

    if (!updatedInstance) {
      throw new Error('取消工作流失败');
    }

    // 更新离职申请为已拒绝
    if (resignationId) {
      await db.update(resignations)
        .set({
          status: 'rejected',
        })
        .where(eq(resignations.id, resignationId));
    }

    // 记录历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'resignation',
      action: 'cancelled',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      description: `离职申请被拒绝，原因：${options.reason}`,
      metadata: {
        reason: options.reason,
        resignationId,
      },
    });

    return updatedInstance;
  }

  /**
   * 获取离职统计数据
   */
  async getResignationStats(companyId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        companyId,
        type: 'resignation',
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
      approvalRate: 0,
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
    stats.approvalRate = completedCount > 0 ? (completedCount / instances.length) * 100 : 0;

    return stats;
  }
}

export const resignationWorkflowManager = new ResignationWorkflowManager();
