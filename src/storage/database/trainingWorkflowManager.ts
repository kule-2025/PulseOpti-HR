import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { trainingCourses, trainingRecords, employees } from './shared/schema';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 培训管理工作流管理器
 * 将培训申请、审批、考核等流程与工作流引擎深度集成，实现100%闭环
 */
export class TrainingWorkflowManager {
  /**
   * 创建培训申请工作流实例
   */
  async createTrainingEnrollmentWorkflow(options: {
    companyId: string;
    courseId: string;
    employeeId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, courseId, employeeId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取培训课程信息
    const [course] = await db.select().from(trainingCourses).where(eq(trainingCourses.id, courseId)).limit(1);
    if (!course) {
      throw new Error('培训课程不存在');
    }

    // 获取员工信息
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 定义培训申请工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '直属上级审批',
        type: 'approval',
        description: '直属上级审批培训申请',
        assigneeId: employee.managerId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '部门负责人审批',
        type: 'approval',
        description: '部门负责人审批培训申请',
        assigneeRole: 'department_manager',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: 'HR审批',
        type: 'approval',
        description: 'HR部门审批培训预算',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '培训报名',
        type: 'task',
        description: '完成培训报名',
        assigneeId: employeeId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '参加培训',
        type: 'task',
        description: '参加培训课程',
        assigneeId: employeeId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '培训考核',
        type: 'approval',
        description: '完成培训考核',
        assigneeId: employeeId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '培训评估',
        type: 'task',
        description: '填写培训反馈评估',
        assigneeId: employeeId,
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'training-enrollment-default',
      templateName: '培训申请流程',
      type: 'training_enrollment',
      name: `${employee.name} - ${course.title} 培训申请`,
      description: `培训课程：${course.title}，员工：${employee.name}，时长：${course.duration}小时`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'training_enrollment',
      relatedEntityId: courseId,
      relatedEntityName: course.title,
      formData: {
        courseId,
        courseTitle: course.title,
        employeeId,
        employeeName: employee.name,
        departmentId: employee.departmentId,
        duration: course.duration,
        price: course.price,
        type: course.type,
        category: course.category,
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
      type: 'training_enrollment',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建培训申请工作流实例：${employee.name} - ${course.title}`,
      metadata: {
        courseId,
        employeeId,
        duration: course.duration,
      },
    });

    return instance;
  }

  /**
   * 创建培训课程开发工作流实例
   */
  async createTrainingDevelopmentWorkflow(options: {
    companyId: string;
    courseId?: string;
    title: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, courseId, title, initiatorId, initiatorName, customSteps } = options;

    // 定义培训课程开发工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '课程设计',
        type: 'task',
        description: '完成课程大纲设计',
        assigneeId: initiatorId,
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '内容制作',
        type: 'task',
        description: '完成培训内容制作（视频、文档等）',
        assigneeId: initiatorId,
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '专家审核',
        type: 'approval',
        description: '领域专家审核课程内容',
        assigneeRole: 'expert',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: 'HR审核',
        type: 'approval',
        description: 'HR部门审核课程合规性',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '课程发布',
        type: 'task',
        description: '发布培训课程',
        assigneeRole: 'hr',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'training-development-default',
      templateName: '培训课程开发流程',
      type: 'training_development',
      name: `${title} - 课程开发`,
      description: `培训课程：${title}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'training_course',
      relatedEntityId: courseId || 'pending',
      relatedEntityName: title,
      formData: {
        courseId,
        title,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
    } as InsertWorkflowInstance);

    // 如果有courseId，更新课程状态
    if (courseId) {
      const db = await getDb();
      await db.update(trainingCourses)
        .set({
          metadata: {
            workflowInstanceId: instance.id,
          },
        })
        .where(eq(trainingCourses.id, courseId));
    }

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'training_development',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建培训课程开发工作流实例：${title}`,
      metadata: {
        courseId,
        title,
      },
    });

    return instance;
  }

  /**
   * 获取培训工作流实例
   */
  async getTrainingWorkflow(relatedEntityId: string, type: 'training_enrollment' | 'training_development') {
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
   * 完成培训步骤并推进
   */
  async advanceTrainingStep(instanceId: string, options: {
    stepId: string;
    result: string;
    comments?: string;
    formData?: any;
    scores?: {
      trainingScore?: number;
      assessmentScore?: number;
      satisfactionScore?: number;
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
    if (options.scores) currentStep.scores = options.scores;

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
        scores: options.scores,
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

    // 如果是培训考核步骤完成，更新培训记录
    if (currentStep.name === '培训考核' && instance.formData) {
      const { courseId, employeeId } = instance.formData as any;
      const trainingScore = options.scores?.trainingScore;
      const assessmentScore = options.scores?.assessmentScore;

      if (trainingScore || assessmentScore) {
        const db = await getDb();
        if (courseId && employeeId) {
          await db.update(trainingRecords)
            .set({
              status: 'completed',
              progress: 100,
              score: trainingScore || assessmentScore,
              completionDate: new Date(),
              feedback: options.comments,
            })
            .where(and(eq(trainingRecords.courseId, courseId), eq(trainingRecords.employeeId, employeeId)));
        }
      }
    }

    // 如果是课程发布步骤完成，更新课程状态为活跃
    if (currentStep.name === '课程发布' && instance.relatedEntityId) {
      const db = await getDb();
      await db.update(trainingCourses)
        .set({
          isActive: true,
        })
        .where(eq(trainingCourses.id, instance.relatedEntityId));
    }

    return {
      success: true,
      instance: await workflowManager.getInstanceById(instance.id),
    };
  }

  /**
   * 批准培训申请
   */
  async approveTrainingEnrollment(instanceId: string, options: {
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
    return this.advanceTrainingStep(instanceId, {
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
   * 拒绝培训申请
   */
  async rejectTrainingEnrollment(instanceId: string, options: {
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
      description: `拒绝培训申请：${options.reason}`,
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

    // 更新培训记录状态为已取消
    if (instance.formData) {
      const { courseId, employeeId } = instance.formData as any;
      const db = await getDb();
      if (courseId && employeeId) {
        await db.update(trainingRecords)
          .set({
            status: 'cancelled',
          })
          .where(and(eq(trainingRecords.courseId, courseId), eq(trainingRecords.employeeId, employeeId)));
      }
    }

    return {
      success: true,
      instance: await workflowManager.getInstanceById(instance.id),
    };
  }
}

export const trainingWorkflowManager = new TrainingWorkflowManager();
