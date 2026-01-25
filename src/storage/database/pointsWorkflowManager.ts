import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { employees, departments } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 积分管理工作流管理器
 * 将积分审批、兑换审批等流程与工作流引擎深度集成，实现100%闭环
 */
export class PointsWorkflowManager {
  /**
   * 创建积分审批工作流实例
   */
  async createPointsApprovalWorkflow(options: {
    companyId: string;
    pointsRequestId: string;
    employeeId: string;
    points: number;
    reason: string;
    category: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      pointsRequestId,
      employeeId,
      points,
      reason,
      category,
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

    // 根据积分数量确定审批流程
    const needDirectorApproval = points > 500;
    const needHrApproval = points > 1000;

    // 定义积分审批工作流步骤
    const defaultSteps: any[] = [
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批积分申请',
        assigneeId: employee.managerId,
        status: 'in_progress',
        startTime: new Date(),
      },
    ];

    if (needDirectorApproval) {
      defaultSteps.push({
        id: crypto.randomUUID(),
        name: '部门负责人审批',
        type: 'approval',
        description: '部门负责人审批',
        assigneeRole: 'department_manager',
        status: 'pending',
      });
    }

    if (needHrApproval) {
      defaultSteps.push({
        id: crypto.randomUUID(),
        name: 'HR审批',
        type: 'approval',
        description: 'HR部门审批',
        assigneeRole: 'hr',
        status: 'pending',
      });
    }

    defaultSteps.push({
      id: crypto.randomUUID(),
      name: '积分发放',
      type: 'task',
      description: '发放积分到员工账户',
      assigneeRole: 'system',
      status: 'pending',
    });

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'points-approval-default',
      templateName: '积分审批流程',
      type: 'points_approval',
      name: `${employee.name} - ${category}积分申请`,
      description: `申请积分：${points}，原因：${reason}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'points_request',
      relatedEntityId: pointsRequestId,
      relatedEntityName: `${employee.name} - 积分申请`,
      formData: {
        pointsRequestId,
        employeeId,
        employeeName: employee.name,
        departmentName,
        points,
        reason,
        category,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: points > 1000 ? 'high' : 'medium',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'points_approval',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建积分审批工作流实例：${employee.name} - ${points}积分`,
      metadata: {
        pointsRequestId,
        employeeId,
        points,
        category,
      },
    });

    return instance;
  }

  /**
   * 创建积分兑换工作流实例
   */
  async createPointsExchangeWorkflow(options: {
    companyId: string;
    exchangeRequestId: string;
    employeeId: string;
    itemId: string;
    itemName: string;
    points: number;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      exchangeRequestId,
      employeeId,
      itemId,
      itemName,
      points,
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

    // 定义积分兑换工作流步骤（一般无需审批，系统自动处理）
    const defaultSteps: any[] = [
      {
        id: crypto.randomUUID(),
        name: '兑换申请',
        type: 'task',
        description: '提交积分兑换申请',
        assigneeId: employeeId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '积分扣除',
        type: 'task',
        description: '扣除员工积分',
        assigneeRole: 'system',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '发放商品',
        type: 'task',
        description: '发放兑换商品或服务',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '兑换完成',
        type: 'task',
        description: '记录兑换完成',
        assigneeRole: 'system',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'points-exchange-default',
      templateName: '积分兑换流程',
      type: 'points_exchange',
      name: `${employee.name} - ${itemName}`,
      description: `兑换商品：${itemName}，消耗积分：${points}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'points_exchange',
      relatedEntityId: exchangeRequestId,
      relatedEntityName: `${employee.name} - ${itemName}`,
      formData: {
        exchangeRequestId,
        employeeId,
        employeeName: employee.name,
        itemId,
        itemName,
        points,
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
      type: 'points_exchange',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建积分兑换工作流实例：${employee.name} - ${itemName}`,
      metadata: {
        exchangeRequestId,
        employeeId,
        itemId,
        points,
      },
    });

    return instance;
  }

  /**
   * 创建积分规则变更工作流实例
   */
  async createPointsRuleChangeWorkflow(options: {
    companyId: string;
    ruleId: string;
    ruleName: string;
    changeType: 'create' | 'update' | 'delete';
    description: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      ruleId,
      ruleName,
      changeType,
      description,
      initiatorId,
      initiatorName,
      customSteps,
    } = options;

    // 定义积分规则变更工作流步骤
    const defaultSteps: any[] = [
      {
        id: crypto.randomUUID(),
        name: 'HR审核',
        type: 'approval',
        description: 'HR部门审核规则变更',
        assigneeRole: 'hr',
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '管理层审批',
        type: 'approval',
        description: '管理层审批规则变更',
        assigneeRole: 'ceo',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '规则生效',
        type: 'task',
        description: '使新规则生效',
        assigneeRole: 'system',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '通知员工',
        type: 'task',
        description: '通知员工规则变更',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'points-rule-change-default',
      templateName: '积分规则变更流程',
      type: 'points_rule_change',
      name: `${ruleName} - 规则${changeType === 'create' ? '新增' : changeType === 'update' ? '修改' : '删除'}`,
      description: `积分规则变更：${description}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'points_rule',
      relatedEntityId: ruleId,
      relatedEntityName: ruleName,
      formData: {
        ruleId,
        ruleName,
        changeType,
        description,
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
      type: 'points_rule_change',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建积分规则变更工作流实例：${ruleName}`,
      metadata: {
        ruleId,
        ruleName,
        changeType,
      },
    });

    return instance;
  }

  /**
   * 获取积分工作流实例
   */
  async getPointsWorkflow(relatedEntityId: string, type: 'points_approval' | 'points_exchange' | 'points_rule_change') {
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
   * 完成积分步骤并推进
   */
  async advancePointsStep(instanceId: string, options: {
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

    return {
      success: true,
      instance: await workflowManager.getInstanceById(instance.id),
    };
  }

  /**
   * 批准积分工作流
   */
  async approvePointsWorkflow(instanceId: string, options: {
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
    return this.advancePointsStep(instanceId, {
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
   * 拒绝积分工作流
   */
  async rejectPointsWorkflow(instanceId: string, options: {
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
      description: `拒绝${instance.type === 'points_approval' ? '积分申请' : instance.type === 'points_exchange' ? '积分兑换' : '规则变更'}：${options.reason}`,
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

export const pointsWorkflowManager = new PointsWorkflowManager();
