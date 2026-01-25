import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { workflowTemplates, workflowInstances } from '@/storage/database/shared/schema';
import { WorkflowType, WorkflowStatus, WorkflowStep, WorkflowInstance, WorkflowTemplate } from '@/lib/workflow/types';

// ========== 验证 Schema ==========

const createWorkflowTemplateSchema = z.object({
  companyId: z.string().min(1, '企业ID不能为空'),
  name: z.string().min(1, '工作流名称不能为空'),
  type: z.nativeEnum(WorkflowType),
  description: z.string().optional(),
  steps: z.array(z.object({
    name: z.string().min(1, '步骤名称不能为空'),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).min(1, '至少需要一个步骤'),
  defaultAssignees: z.record(z.string(), z.array(z.string())).optional(),
  conditions: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().default(false),
  createdBy: z.string(),
});

const createWorkflowInstanceSchema = z.object({
  companyId: z.string().min(1, '企业ID不能为空'),
  templateId: z.string().optional(),
  templateName: z.string().optional(),
  type: z.nativeEnum(WorkflowType),
  name: z.string().min(1, '工作流名称不能为空'),
  description: z.string().optional(),
  initiatorId: z.string(),
  initiatorName: z.string(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityName: z.string().optional(),
  formData: z.record(z.string(), z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  customSteps: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).optional(),
});

const updateWorkflowStatusSchema = z.object({
  action: z.enum(['start', 'pause', 'resume', 'complete', 'cancel']),
  comment: z.string().optional(),
});

// ========== GET：获取工作流列表（模板和实例） ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'template' | 'instance'
    const workflowType = searchParams.get('workflowType');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId') || user.companyId;

    // 获取工作流模板
    if (type === 'template') {
      const filters: any = { companyId };
      if (workflowType) filters.type = workflowType;
      if (status) filters.isActive = status === 'active';

      const templates = await workflowManager.getTemplates({ filters });
      
      return NextResponse.json({
        success: true,
        data: templates,
      });
    }

    // 获取工作流实例（默认）
    const filters: any = { companyId };
    if (workflowType) filters.type = workflowType;
    if (status) filters.status = status;
    if (searchParams.get('initiatorId')) filters.initiatorId = searchParams.get('initiatorId');
    if (searchParams.get('relatedEntityId')) filters.relatedEntityId = searchParams.get('relatedEntityId');

    const instances = await workflowManager.getInstances({ filters });

    return NextResponse.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    console.error('获取工作流列表错误:', error);
    return NextResponse.json(
      { error: '获取工作流列表失败' },
      { status: 500 }
    );
  }
}

// ========== POST：创建工作流模板或实例 ==========

export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [PERMISSIONS.WORKFLOW_MANAGE]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const createType = body.type || 'instance'; // 'template' | 'instance'

    // 创建工作流模板
    if (createType === 'template') {
      const validated = createWorkflowTemplateSchema.parse(body);

      const template = await workflowManager.createTemplate({
        ...validated,
        isActive: true,
        version: 1,
      } as any);

      // 记录审计日志
      await auditLogManager.logAction({
        companyId: user.companyId,
        userId: user.userId,
        userName: user.name,
        action: 'create',
        resourceType: 'workflow_template',
        resourceId: template.id,
        resourceName: template.name,
        status: 'success',
      });

      return NextResponse.json({
        success: true,
        message: '工作流模板创建成功',
        data: template,
      }, { status: 201 });
    }

    // 创建工作流实例（默认）
    const validated = createWorkflowInstanceSchema.parse(body);

    let template: any;
    let steps: any[];

      if (validated.templateId) {
        // 使用模板
        template = await workflowManager.getTemplateById(validated.templateId);
        if (!template) {
          return NextResponse.json(
            { error: '工作流模板不存在' },
            { status: 404 }
          );
        }
        steps = (template.steps as any[]).map((step: any, index: number) => ({
          ...step,
          id: crypto.randomUUID(),
          status: index === 0 ? 'pending' : 'pending',
        }));
      } else if (validated.customSteps) {
      // 使用自定义步骤
      steps = validated.customSteps.map((step: any, index: number) => ({
        ...step,
        id: crypto.randomUUID(),
        status: index === 0 ? 'pending' : 'pending',
      }));
    } else {
      return NextResponse.json(
        { error: '必须指定模板ID或自定义步骤' },
        { status: 400 }
      );
    }

    const instance = await workflowManager.createInstance({
      companyId: validated.companyId,
      templateId: template?.id || crypto.randomUUID(),
      templateName: validated.templateName || template?.name || validated.name,
      type: validated.type,
      name: validated.name,
      description: validated.description,
      status: WorkflowStatus.DRAFT,
      steps,
      currentStepIndex: 0,
      initiatorId: validated.initiatorId,
      initiatorName: validated.initiatorName,
      relatedEntityType: validated.relatedEntityType,
      relatedEntityId: validated.relatedEntityId,
      relatedEntityName: validated.relatedEntityName,
      formData: validated.formData,
      variables: validated.variables,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    } as any);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'create',
      resourceType: 'workflow_instance',
      resourceId: instance.id,
      resourceName: instance.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流创建成功',
      data: instance,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建工作流错误:', error);
    return NextResponse.json(
      { error: '创建工作流失败' },
      { status: 500 }
    );
  }
}

// ========== PATCH：更新工作流状态 ==========

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { workflowId, instanceId, action, comment } = body;
    const id = workflowId || instanceId;

    if (!id) {
      return NextResponse.json(
        { error: '工作流ID不能为空' },
        { status: 400 }
      );
    }

    const validated = updateWorkflowStatusSchema.parse({ action, comment });

    const instance = await workflowManager.getInstanceById(id);
    if (!instance) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    let updatedInstance;

    switch (validated.action) {
      case 'start':
        if (instance.status !== WorkflowStatus.DRAFT) {
          return NextResponse.json(
            { error: '只能启动草稿状态的工作流' },
            { status: 400 }
          );
        }
        updatedInstance = await workflowManager.updateInstanceStatus(
          id,
          WorkflowStatus.ACTIVE,
          new Date()
        );
        break;

      case 'pause':
        if (instance.status !== WorkflowStatus.ACTIVE) {
          return NextResponse.json(
            { error: '只能暂停进行中的工作流' },
            { status: 400 }
          );
        }
        updatedInstance = await workflowManager.updateInstanceStatus(id, WorkflowStatus.PAUSED);
        break;

      case 'resume':
        if (instance.status !== WorkflowStatus.PAUSED) {
          return NextResponse.json(
            { error: '只能恢复暂停的工作流' },
            { status: 400 }
          );
        }
        updatedInstance = await workflowManager.updateInstanceStatus(id, WorkflowStatus.ACTIVE);
        break;

      case 'complete':
        if (instance.status !== WorkflowStatus.ACTIVE) {
          return NextResponse.json(
            { error: '只能完成进行中的工作流' },
            { status: 400 }
          );
        }
        updatedInstance = await workflowManager.updateInstanceStatus(
          id,
          WorkflowStatus.COMPLETED,
          undefined,
          new Date()
        );
        break;

      case 'cancel':
        if (instance.status === WorkflowStatus.COMPLETED) {
          return NextResponse.json(
            { error: '不能取消已完成的工作流' },
            { status: 400 }
          );
        }
        updatedInstance = await workflowManager.updateInstanceStatus(
          id,
          WorkflowStatus.CANCELLED,
          undefined,
          new Date()
        );
        break;

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        );
    }

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: user.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: instance.templateId,
      type: instance.type,
      action: validated.action,
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      description: `${action}工作流${comment ? `: ${comment}` : ''}`,
    } as any);

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: user.companyId,
      userId: user.userId,
      userName: user.name,
      action: 'update',
      resourceType: 'workflow_instance',
      resourceId: id,
      resourceName: instance.name,
      changes: { action, previousStatus: instance.status, newStatus: updatedInstance?.status },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流状态更新成功',
      data: updatedInstance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新工作流错误:', error);
    return NextResponse.json(
      { error: '更新工作流失败' },
      { status: 500 }
    );
  }
}
