import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { employees, positions, departments } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 员工事务工作流管理器
 * 统一管理入职、晋升、转岗、调薪等员工事务工作流
 */
export class EmployeeWorkflowManager {
  /**
   * 创建入职工作流实例
   */
  async createOnboardingWorkflow(options: {
    companyId: string;
    employeeId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, employeeId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取部门和职位信息
    let departmentName = '';
    let positionName = '';
    if (employee.departmentId) {
      const [department] = await db.select().from(departments).where(eq(departments.id, employee.departmentId)).limit(1);
      if (department) departmentName = department.name;
    }
    if (employee.positionId) {
      const [position] = await db.select().from(positions).where(eq(positions.id, employee.positionId)).limit(1);
      if (position) positionName = position.name;
    }

    // 定义入职工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '入职审批',
        type: 'approval',
        description: '部门负责人审批',
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
        name: '入职准备',
        type: 'task',
        description: '准备工位、设备、账号等',
        assigneeRole: 'admin',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '合同签订',
        type: 'task',
        description: '签订劳动合同',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '入职培训',
        type: 'task',
        description: '完成入职培训',
        assigneeId: employeeId,
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'onboarding-default',
      templateName: '标准入职流程',
      type: 'onboarding',
      name: `${employee.name} - 入职流程`,
      description: `员工：${employee.name}，职位：${positionName}，部门：${departmentName}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'employee',
      relatedEntityId: employeeId,
      relatedEntityName: employee.name,
      formData: {
        employeeId,
        employeeName: employee.name,
        departmentId: employee.departmentId,
        departmentName,
        positionId: employee.positionId,
        positionName,
        hireDate: employee.hireDate,
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
      type: 'onboarding',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建入职工作流实例：${employee.name}`,
      metadata: {
        employeeId,
        hireDate: employee.hireDate,
      },
    });

    return instance;
  }

  /**
   * 创建晋升工作流实例
   */
  async createPromotionWorkflow(options: {
    companyId: string;
    employeeId: string;
    targetPositionId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, employeeId, targetPositionId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取目标职位信息
    const [targetPosition] = await db.select().from(positions).where(eq(positions.id, targetPositionId)).limit(1);
    if (!targetPosition) {
      throw new Error('目标职位不存在');
    }

    // 定义晋升工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '晋升申请',
        type: 'task',
        description: '填写晋升申请',
        assigneeId: employee.userId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '部门负责人审批',
        type: 'approval',
        description: '部门负责人审批',
        assigneeRole: 'department_manager',
        status: 'pending',
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
        name: '薪资调整',
        type: 'task',
        description: '调整薪资待遇',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '晋升生效',
        type: 'task',
        description: '正式晋升生效',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'promotion-default',
      templateName: '标准晋升流程',
      type: 'promotion',
      name: `${employee.name} - 晋升流程`,
      description: `员工：${employee.name}，晋升至：${targetPosition.name}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'employee',
      relatedEntityId: employeeId,
      relatedEntityName: employee.name,
      formData: {
        employeeId,
        employeeName: employee.name,
        currentPositionId: employee.positionId,
        targetPositionId,
        targetPositionName: targetPosition.name,
        departmentId: employee.departmentId,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'promotion',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建晋升工作流实例：${employee.name}`,
      metadata: {
        employeeId,
        currentPositionId: employee.positionId,
        targetPositionId,
      },
    });

    return instance;
  }

  /**
   * 创建转岗工作流实例
   */
  async createTransferWorkflow(options: {
    companyId: string;
    employeeId: string;
    targetDepartmentId: string;
    targetPositionId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, employeeId, targetDepartmentId, targetPositionId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 获取目标部门和职位信息
    const [targetDepartment] = await db.select().from(departments).where(eq(departments.id, targetDepartmentId)).limit(1);
    const [targetPosition] = await db.select().from(positions).where(eq(positions.id, targetPositionId)).limit(1);

    // 定义转岗工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '转岗申请',
        type: 'task',
        description: '填写转岗申请',
        assigneeId: employee.userId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '原部门审批',
        type: 'approval',
        description: '原部门负责人审批',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '目标部门审批',
        type: 'approval',
        description: '目标部门负责人审批',
        assigneeId: targetDepartment?.managerId,
        status: 'pending',
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
        description: '完成原岗位工作交接',
        assigneeId: employeeId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '转岗生效',
        type: 'task',
        description: '正式转岗生效',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'transfer-default',
      templateName: '标准转岗流程',
      type: 'transfer',
      name: `${employee.name} - 转岗流程`,
      description: `员工：${employee.name}，转岗至：${targetPosition?.name}（${targetDepartment?.name}）`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'employee',
      relatedEntityId: employeeId,
      relatedEntityName: employee.name,
      formData: {
        employeeId,
        employeeName: employee.name,
        currentDepartmentId: employee.departmentId,
        currentPositionId: employee.positionId,
        targetDepartmentId,
        targetDepartmentName: targetDepartment?.name,
        targetPositionId,
        targetPositionName: targetPosition?.name,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'transfer',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建转岗工作流实例：${employee.name}`,
      metadata: {
        employeeId,
        targetDepartmentId,
        targetPositionId,
      },
    });

    return instance;
  }

  /**
   * 创建调薪工作流实例
   */
  async createSalaryAdjustmentWorkflow(options: {
    companyId: string;
    employeeId: string;
    currentSalary: number;
    newSalary: number;
    reason: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, employeeId, currentSalary, newSalary, reason, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 定义调薪工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '调薪申请',
        type: 'task',
        description: '填写调薪申请',
        assigneeId: employee.userId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批',
        assigneeId: employee.managerId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '部门负责人审批',
        type: 'approval',
        description: '部门负责人审批',
        assigneeRole: 'department_manager',
        status: 'pending',
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
        name: '薪资生效',
        type: 'task',
        description: '薪资调整生效',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'salary_adjustment-default',
      templateName: '标准调薪流程',
      type: 'salary_adjustment',
      name: `${employee.name} - 调薪流程`,
      description: `员工：${employee.name}，调薪：${currentSalary} → ${newSalary}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'employee',
      relatedEntityId: employeeId,
      relatedEntityName: employee.name,
      formData: {
        employeeId,
        employeeName: employee.name,
        currentSalary,
        newSalary,
        adjustment: newSalary - currentSalary,
        adjustmentPercent: ((newSalary - currentSalary) / currentSalary * 100).toFixed(2),
        reason,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
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
      description: `创建调薪工作流实例：${employee.name}`,
      metadata: {
        employeeId,
        currentSalary,
        newSalary,
        reason,
      },
    });

    return instance;
  }

  /**
   * 推进员工事务工作流步骤（通用方法）
   */
  async advanceEmployeeWorkflowStep(instanceId: string, options: {
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
      type: instance.type,
      action: 'step_completed',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `完成${instance.type}步骤：${currentStep.name}`,
      metadata: {
        result: options.result,
        comments: options.comments,
        formData: options.formData,
      },
    });

    // 如果是最后一步且需要更新员工信息
    if (options.advanceToNext !== false && instance.currentStepIndex >= steps.length - 1) {
      const employeeId = instance.relatedEntityId;
      const updateData: any = {};
      const formData = instance.formData as any;

      if (instance.type === 'promotion' && formData?.targetPositionId) {
        updateData.positionId = formData.targetPositionId;
      }

      if (instance.type === 'transfer') {
        if (formData?.targetDepartmentId) updateData.departmentId = formData.targetDepartmentId;
        if (formData?.targetPositionId) updateData.positionId = formData.targetPositionId;
      }

      if (instance.type === 'salary_adjustment' && formData?.newSalary) {
        updateData.salary = formData.newSalary;
      }

      if (Object.keys(updateData).length > 0) {
        await db.update(employees)
          .set(updateData)
          .where(eq(employees.id, employeeId!));
      }
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
          type: instance.type,
          action: 'completed',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          description: `${instance.type}流程已完成`,
          metadata: {
            employeeId: instance.relatedEntityId,
            endDate: updatedInstance.endDate,
          },
        });
      } else {
        // 记录开始下一步
        const newSteps = updatedInstance.steps as any[];
        const newStep = newSteps[updatedInstance.currentStepIndex];

        await workflowManager.addHistory({
          companyId: instance.companyId,
          instanceId,
          instanceName: instance.name,
          templateId: instance.templateId,
          type: instance.type,
          action: 'step_started',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          stepId: newStep.id,
          stepName: newStep.name,
          description: `开始${instance.type}步骤：${newStep.name}`,
        });
      }
    } else {
      const updated = await workflowManager.updateInstance(instanceId, {
        steps,
      });
      if (updated) {
        updatedInstance = updated;
      }
    }

    return updatedInstance;
  }

  /**
   * 获取员工事务工作流实例
   */
  async getEmployeeWorkflow(employeeId: string, workflowType: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        relatedEntityId: employeeId,
        type: workflowType,
      },
      limit: 1,
    });

    return instances[0] || null;
  }
}

export const employeeWorkflowManager = new EmployeeWorkflowManager();
