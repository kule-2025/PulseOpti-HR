import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { workflowManager } from './workflowManager';
import { candidates, jobs } from './shared/schema';
import { candidateManager } from './candidateManager';
import type { InsertWorkflowInstance } from './shared/schema';

/**
 * 招聘工作流管理器
 * 将招聘流程与工作流引擎深度集成，实现100%闭环
 */
export class RecruitmentWorkflowManager {
  /**
   * 创建招聘工作流实例
   */
  async createRecruitmentWorkflow(options: {
    companyId: string;
    jobId: string;
    candidateId: string;
    initiatorId: string;
    initiatorName: string;
    customSteps?: any[];
  }) {
    const { companyId, jobId, candidateId, initiatorId, initiatorName, customSteps } = options;

    const db = await getDb();

    // 获取职位信息
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) {
      throw new Error('职位不存在');
    }

    // 获取候选人信息
    const candidate = await candidateManager.getCandidateById(candidateId);
    if (!candidate) {
      throw new Error('候选人不存在');
    }

    // 定义招聘工作流步骤
    const defaultSteps = [
      {
        id: crypto.randomUUID(),
        name: '简历筛选',
        type: 'task',
        description: 'HR筛选候选人简历',
        assigneeRole: 'hr',
        status: 'in_progress',
        startTime: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: '初试',
        type: 'approval',
        description: '技术面试官进行初试',
        assigneeRole: 'tech_interviewer',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '复试',
        type: 'approval',
        description: '部门负责人进行复试',
        assigneeRole: 'department_manager',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '终试',
        type: 'approval',
        description: 'HR总监进行终试',
        assigneeRole: 'hr_director',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '发放Offer',
        type: 'task',
        description: '发送录用通知',
        assigneeRole: 'hr',
        status: 'pending',
      },
      {
        id: crypto.randomUUID(),
        name: '录用确认',
        type: 'approval',
        description: '候选人确认接受Offer',
        assigneeRole: 'candidate',
        status: 'pending',
      },
    ];

    const steps = customSteps && customSteps.length > 0 ? customSteps : defaultSteps;

    // 创建工作流实例
    const instance = await workflowManager.createInstance({
      companyId,
      templateId: 'recruitment-default',
      templateName: '标准招聘流程',
      type: 'recruitment',
      name: `${candidate.name} - ${job.title} 招聘流程`,
      description: `招聘职位：${job.title}，候选人：${candidate.name}`,
      initiatorId,
      initiatorName,
      relatedEntityType: 'candidate',
      relatedEntityId: candidateId,
      relatedEntityName: candidate.name,
      formData: {
        jobId,
        jobTitle: job.title,
        candidateId,
        candidateName: candidate.name,
        candidatePhone: candidate.phone,
        candidateEmail: candidate.email,
      },
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
      priority: 'medium',
    } as InsertWorkflowInstance);

    // 更新候选人状态
    await db.update(candidates)
      .set({
        status: 'screening',
      })
      .where(eq(candidates.id, candidateId));

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'recruitment',
      action: 'created',
      actorId: initiatorId,
      actorName: initiatorName,
      actorRole: 'initiator',
      description: `创建招聘工作流实例：${candidate.name} - ${job.title}`,
      metadata: {
        jobId,
        candidateId,
      },
    });

    return instance;
  }

  /**
   * 获取招聘工作流实例
   */
  async getRecruitmentWorkflow(candidateId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        relatedEntityId: candidateId,
        type: 'recruitment',
      },
      limit: 1,
    });

    return instances[0] || null;
  }

  /**
   * 完成招聘步骤并推进
   */
  async advanceRecruitmentStep(instanceId: string, options: {
    stepId: string;
    result: string;
    comments?: string;
    formData?: any;
    advanceToNext?: boolean;
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
      type: 'recruitment',
      action: 'step_completed',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      stepId: currentStep.id,
      stepName: currentStep.name,
      description: `完成招聘步骤：${currentStep.name}`,
      metadata: {
        result: options.result,
        comments: options.comments,
      },
    });

    // 更新候选人状态
    const formData = instance.formData as any;
    const candidateId = (formData?.candidateId || instance.relatedEntityId) as string;
    if (!candidateId) {
      throw new Error('候选人ID不存在');
    }

    let candidateStatus = 'screening';
    if (currentStep.name.includes('初试')) candidateStatus = 'interviewing';
    if (currentStep.name.includes('复试')) candidateStatus = 'interviewing';
    if (currentStep.name.includes('终试')) candidateStatus = 'interviewing';
    if (currentStep.name.includes('Offer')) candidateStatus = 'offered';

    await candidateManager.updateCandidate(candidateId, {
      status: candidateStatus,
    });

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
          type: 'recruitment',
          action: 'completed',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          description: '招聘流程已完成',
          metadata: {
            candidateId,
            result: 'hired',
          },
        });

        // 更新候选人为已录用
        await candidateManager.updateCandidate(candidateId, {
          status: 'hired',
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
          type: 'recruitment',
          action: 'step_started',
          actorId: options.actorId,
          actorName: options.actorName,
          actorRole: options.actorRole,
          stepId: newStep.id,
          stepName: newStep.name,
          description: `开始招聘步骤：${newStep.name}`,
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
   * 拒绝候选人（取消招聘流程）
   */
  async rejectCandidate(instanceId: string, options: {
    reason: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  }) {
    const instance = await workflowManager.getInstanceById(instanceId);
    if (!instance) {
      throw new Error('工作流实例不存在');
    }

    const formData = instance.formData as any;
    const candidateId = (formData?.candidateId || instance.relatedEntityId) as string;
    if (!candidateId) {
      throw new Error('候选人ID不存在');
    }

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

    // 更新候选人为已拒绝
    await candidateManager.updateCandidate(candidateId, {
      status: 'rejected',
    });

    // 记录历史
    await workflowManager.addHistory({
      companyId: instance.companyId,
      instanceId,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: 'recruitment',
      action: 'cancelled',
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      description: `拒绝候选人，原因：${options.reason}`,
      metadata: {
        reason: options.reason,
        candidateId,
      },
    });

    return updatedInstance;
  }

  /**
   * 获取招聘统计数据
   */
  async getRecruitmentStats(companyId: string) {
    const instances = await workflowManager.getInstances({
      filters: {
        companyId,
        type: 'recruitment',
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
      successRate: 0,
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
    stats.successRate = completedCount > 0 ? (completedCount / instances.length) * 100 : 0;

    return stats;
  }
}

export const recruitmentWorkflowManager = new RecruitmentWorkflowManager();
