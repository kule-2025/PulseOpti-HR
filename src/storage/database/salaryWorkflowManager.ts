import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { employees, departments } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 薪酬管理工作流管理器
 * 将薪资核算、薪资发放等流程与工作流引擎深度集成，实现100%闭环
 */
export class SalaryWorkflowManager {
  /**
   * 创建薪资核算工作流实例
   */
  async createSalaryCalculationWorkflow(options: {
    companyId: string;
    year: number;
    month: number;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, year, month, initiatorId, initiatorName, customSteps } = options;

    // 定义薪资核算工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '数据核对',
        type: 'task',
        description: '核对考勤、绩效等基础数据',
        assigneeRole: 'hr',
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '薪资计算',
        type: 'task',
        description: '计算员工薪资',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '薪资审核',
        type: 'approval',
        description: 'HR总监审核薪资数据',
        assigneeRole: 'hr_director',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '财务审批',
        type: 'approval',
        description: '财务部门审批',
        assigneeRole: 'finance',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '薪资发放',
        type: 'task',
        description: '发放员工薪资',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '发放确认',
        type: 'task',
        description: '员工确认薪资到账',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'salary-calculation-default',
      templateName: '薪资核算流程',
      type: 'salary_calculation',
      name: `${year}年${month}月薪资核算`,
      description: `核算周期：${year}年${month}月`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'salary_calculation',
      relatedEntityId: `${year}-${month.toString().padStart(2, '0')}`,
      relatedEntityName: `${year}年${month}月`,
      formData: {
        year,
        month,
        calculationDate: new Date().toISOString(),
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'high',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'salary_calculation',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建薪资核算工作流实例：${year}年${month}月`,
      metadata: {
        year,
        month,
      },
    });

    return instance;
  }

  /**
   * 创建薪资调整工作流实例（已在employeeWorkflowManager中实现，这里提供统一接口）
   */
  async createSalaryAdjustmentWorkflow(options: {
    companyId: string;
    employeeId: string;
    currentSalary: number;
    newSalary: number;
    adjustmentType: 'regular' | 'promotion' | 'special';
    reason: string;
    effectiveDate: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      employeeId,
      currentSalary,
      newSalary,
      adjustmentType,
      reason,
      effectiveDate,
      initiatorId,
      initiatorName,
      customSteps,
    } = options;

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取部门信息
    let departmentName = '';
    if (employee.departmentId) {
      const [department] = await db.select().from(departments).where(eq(departments.id, employee.departmentId)).limit(1);
      if (department) departmentName = department.name;
    }

    const adjustmentPercent = ((newSalary - currentSalary) / currentSalary * 100).toFixed(2);

    // 定义调薪工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '调薪申请',
        type: 'task',
        description: '填写调薪申请',
        assigneeId: initiatorId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '绩效数据核实',
        type: 'task',
        description: 'HRBP核实绩效数据',
        assigneeRole: 'hrbp',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '部门预算审批',
        type: 'approval',
        description: '部门负责人审批预算',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: 'HRBP评估',
        type: 'approval',
        description: 'HRBP综合评估',
        assigneeRole: 'hrbp',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: 'HR总监审批',
        type: 'approval',
        description: 'HR总监审批',
        assigneeRole: 'hr_director',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '总经理审批',
        type: 'approval',
        description: '总经理审批',
        assigneeRole: 'ceo',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '薪资调整生效',
        type: 'task',
        description: '更新员工薪资信息',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '发送调薪通知',
        type: 'task',
        description: '发送调薪通知给员工',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'salary-adjustment-default',
      templateName: '薪资调整流程',
      type: 'salary_adjustment',
      name: `${employee.name} - 薪资调整`,
      description: `员工：${employee.name}，调薪类型：${adjustmentType}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'employee',
      relatedEntityId: employeeId,
      relatedEntityName: employee.name,
      formData: {
        employeeId,
        employeeName: employee.name,
        departmentName,
        currentSalary,
        newSalary,
        adjustmentPercent: Number(adjustmentPercent),
        adjustmentType,
        reason,
        effectiveDate,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: adjustmentType === 'promotion' ? 'high' : 'medium',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'salary_adjustment',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建薪资调整工作流实例：${employee.name}`,
      metadata: {
        employeeId,
        currentSalary,
        newSalary,
        adjustmentType,
        effectiveDate,
      },
    });

    return instance;
  }

  /**
   * 获取薪酬工作流实例
   */
  async getSalaryWorkflow(relatedEntityId: string, type: 'salary_calculation' | 'salary_adjustment') {
    const instances = await workflowManager.getInstances({
      filters: {
        relatedEntityId,
        type,
      },
      limit: 1,
    });

    return instances[0] || null;
  }

  /**
   * 获取薪资工作流实例（别名）
   */
  async getPayrollWorkflow(relatedEntityId: string) {
    return this.getSalaryWorkflow(relatedEntityId, 'salary_calculation');
  }

  /**
   * 完成薪酬步骤并推进
   */
  async advanceSalaryStep(instanceId: string, options: {
    stepId: string;
    result: string;
    comments?: string;
    formData?: any;
    salaryData?: {
      totalAmount?: number;
      employeeCount?: number;
      bonusAmount?: number;
      deductionAmount?: number;
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
    if (options.salaryData) currentStep.salaryData = options.salaryData;

    // 记录历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type as any,
      action: 'step_completed',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      description: `完成步骤：${currentStep.name} - ${options.result}`,
      metadata: {
        stepId: options.stepId,
        stepName: currentStep.name,
        result: options.result,
        salaryData: options.salaryData,
      },
    });

    // 更新工作流实例
    let newStatus = instance.status;
    let newStepIndex = instance.currentStepIndex;

    if (options.advanceToNext !== false) {
      // 判断是否是最后一步
      if (instance.currentStepIndex >= steps.length - 1) {
        newStatus = 'completed';
        instance.endDate = new Date();
      } else {
        newStepIndex = instance.currentStepIndex + 1;
        const nextStep = steps[newStepIndex];
        if (nextStep) {
          nextStep.status = 'in_progress';
          nextStep.startTime = new Date();
        }
      }
    }

    await workflowManager.updateInstance(instance.id, {
      steps,
      currentStepIndex: newStepIndex,
      status: newStatus,
      endDate: instance.endDate,
    });

    // 如果是薪资调整生效步骤，更新员工薪资
    if (currentStep.name === '薪资调整生效' && instance.formData) {
      const { employeeId, newSalary } = instance.formData as any;
      await db.update(employees)
        .set({
          salary: newSalary,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, employeeId));
    }

    return {
      success: true,
      instance: await workflowManager.getInstanceById(instance.id),
    };
  }

  /**
   * 批准薪酬流程
   */
  async approveSalaryWorkflow(instanceId: string, options: {
    comments?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  }) {
    const instance = await workflowManager.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('工作流实例不存在');
    }

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    if (!currentStep || currentStep.type !== 'approval') {
      throw new Error('当前步骤不是审批步骤');
    }

    // 推进到下一步
    return this.advanceSalaryStep(instanceId, {
      stepId: currentStep.id,
      result: 'approved',
      comments: options.comments,
      advanceToNext: true,
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
    });
  }

  /**
   * 拒绝薪酬流程
   */
  async rejectSalaryWorkflow(instanceId: string, options: {
    reason?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  }) {
    const instance = await workflowManager.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('工作流实例不存在');
    }

    const steps = instance.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    // 记录历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type as any,
      action: 'rejected',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      description: `拒绝${instance.type === 'salary_adjustment' ? '调薪申请' : '薪资核算'}：${options.reason}`,
      metadata: {
        stepId: currentStep?.id,
        stepName: currentStep?.name,
        reason: options.reason,
      },
    });

    // 更新工作流状态为已取消
    await workflowManager.updateInstance(instance.id, {
      status: 'cancelled',
      endDate: new Date(),
    });

    return {
      success: true,
      instance: await workflowManager.getInstanceById(instance.id),
    };
  }
}

export const salaryWorkflowManager = new SalaryWorkflowManager();
