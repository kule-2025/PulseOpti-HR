import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { employees, departments } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 考勤管理工作流管理器
 * 将请假、加班、出差等审批流程与工作流引擎深度集成，实现100%闭环
 */
export class AttendanceWorkflowManager {
  /**
   * 创建请假申请工作流实例
   */
  async createLeaveWorkflow(options: {
    companyId: string;
    leaveRequestId: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      leaveRequestId,
      employeeId,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
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

    // 根据假期类型确定审批流程
    const leaveTypeMap: Record<string, { name: string; needDirectorApproval: boolean; needHrApproval: boolean }> = {
      annual: { name: '年假', needDirectorApproval: false, needHrApproval: false },
      sick: { name: '病假', needDirectorApproval: false, needHrApproval: true },
      personal: { name: '事假', needDirectorApproval: true, needHrApproval: false },
      marriage: { name: '婚假', needDirectorApproval: true, needHrApproval: true },
      bereavement: { name: '丧假', needDirectorApproval: true, needHrApproval: true },
      maternity: { name: '产假', needDirectorApproval: true, needHrApproval: true },
      paternity: { name: '陪产假', needDirectorApproval: true, needHrApproval: true },
    };

    const leaveInfo = leaveTypeMap[leaveType] || leaveTypeMap.personal;

    // 定义请假工作流步骤
    const defaultSteps: any[] = [
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批请假申请',
        assigneeId: employee.managerId,
        status: 'in_progress',
        startTime: new Date(),
      },
    ];

    // 根据假期类型添加额外审批步骤
    if (leaveInfo.needDirectorApproval) {
      defaultSteps.push({
        id: crypto.randomUUID(),
        name: '部门负责人审批',
        type: 'approval',
        description: '部门负责人审批',
        assigneeRole: 'department_manager',
        status: 'pending',
      });
    }

    if (leaveInfo.needHrApproval) {
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
      name: '请假记录',
      type: 'task',
      description: '系统记录请假',
      assigneeRole: 'system',
      status: 'pending',
    });

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'leave-approval-default',
      templateName: '请假审批流程',
      type: 'leave_approval',
      name: `${employee.name} - ${leaveInfo.name}`,
      description: `请假类型：${leaveInfo.name}，请假天数：${days}天，请假时间：${startDate} 至 ${endDate}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'leave_request',
      relatedEntityId: leaveRequestId,
      relatedEntityName: `${employee.name} - ${leaveInfo.name}`,
      formData: {
        leaveRequestId,
        employeeId,
        employeeName: employee.name,
        departmentName,
        leaveType,
        leaveTypeName: leaveInfo.name,
        startDate,
        endDate,
        days,
        reason,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: days > 3 ? 'medium' : 'low',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'leave_approval',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建请假审批工作流实例：${employee.name} - ${leaveInfo.name}`,
      metadata: {
        leaveRequestId,
        employeeId,
        leaveType,
        days,
        startDate,
        endDate,
      },
    });

    return instance;
  }

  /**
   * 创建加班申请工作流实例
   */
  async createOvertimeWorkflow(options: {
    companyId: string;
    overtimeRequestId: string;
    employeeId: string;
    overtimeDate: string;
    startTime: string;
    endTime: string;
    hours: number;
    reason: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const {
      companyId,
      overtimeRequestId,
      employeeId,
      overtimeDate,
      startTime,
      endTime,
      hours,
      reason,
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

    // 根据加班时长确定审批流程
    const needDirectorApproval = hours > 4;

    // 定义加班工作流步骤
    const defaultSteps: any[] = [
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批加班申请',
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

    defaultSteps.push({
      id: crypto.randomUUID(),
      name: '加班记录',
      type: 'task',
      description: '系统记录加班时间',
      assigneeRole: 'system',
      status: 'pending',
    });

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'overtime-approval-default',
      templateName: '加班审批流程',
      type: 'overtime_approval',
      name: `${employee.name} - 加班申请`,
      description: `加班时间：${overtimeDate} ${startTime}-${endTime}，加班时长：${hours}小时`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'overtime_request',
      relatedEntityId: overtimeRequestId,
      relatedEntityName: `${employee.name} - 加班`,
      formData: {
        overtimeRequestId,
        employeeId,
        employeeName: employee.name,
        overtimeDate,
        startTime,
        endTime,
        hours,
        reason,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: hours > 4 ? 'medium' : 'low',
    } as InsertWorkflowInstance);

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'overtime_approval',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建加班审批工作流实例：${employee.name}`,
      metadata: {
        overtimeRequestId,
        employeeId,
        overtimeDate,
        hours,
      },
    });

    return instance;
  }

  /**
   * 获取考勤工作流实例
   */
  async getAttendanceWorkflow(relatedEntityId: string, type: 'leave_approval' | 'overtime_approval') {
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
   * 获取请假工作流实例
   */
  async getLeaveWorkflow(relatedEntityId: string) {
    return this.getAttendanceWorkflow(relatedEntityId, 'leave_approval');
  }

  /**
   * 获取加班工作流实例
   */
  async getOvertimeWorkflow(relatedEntityId: string) {
    return this.getAttendanceWorkflow(relatedEntityId, 'overtime_approval');
  }

  /**
   * 完成考勤步骤并推进
   */
  async advanceAttendanceStep(instanceId: string, options: {
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
   * 批准考勤申请
   */
  async approveAttendance(instanceId: string, options: {
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
    return this.advanceAttendanceStep(instanceId, {
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
   * 拒绝考勤申请
   */
  async rejectAttendance(instanceId: string, options: {
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
      description: `拒绝${instance.type === 'leave_approval' ? '请假' : '加班'}申请：${options.reason}`,
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

export const attendanceWorkflowManager = new AttendanceWorkflowManager();
