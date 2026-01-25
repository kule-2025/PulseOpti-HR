import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAnyPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { workflowManager } from '@/storage/database/workflowManager';
import { auditLogManager } from '@/storage/database/auditLogManager';
import { WorkflowType, StepStatus } from '@/lib/workflow/types';

// 工作流状态
enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

// 创建工作流实例请求Schema
const createInstanceSchema = z.object({
  templateId: z.string(),
  templateName: z.string(),
  type: z.nativeEnum(WorkflowType),
  name: z.string(),
  description: z.string().optional(),
  initiatorId: z.string(),
  initiatorName: z.string(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityName: z.string().optional(),
  formData: z.record(z.string(), z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  companyId: z.string(),
  customSteps: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    assigneeRole: z.string().optional(),
  })).optional(),
});

// 更新工作流步骤请求Schema
const updateStepSchema = z.object({
  stepId: z.string(),
  status: z.nativeEnum(StepStatus),
  result: z.string().optional(),
  comments: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
    uploadedBy: z.string(),
  })).optional(),
});

// 更新工作流状态Schema
const updateStatusSchema = z.object({
  action: z.enum(['start', 'pause', 'resume', 'cancel']),
  comment: z.string().optional(),
});

/**
 * GET /api/workflows/instances - 获取工作流实例列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') || user.companyId;
    const templateId = searchParams.get('templateId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const initiatorId = searchParams.get('initiatorId');
    const relatedEntityId = searchParams.get('relatedEntityId');

    const filters: any = { companyId };
    if (templateId) filters.templateId = templateId;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (initiatorId) filters.initiatorId = initiatorId;
    if (relatedEntityId) filters.relatedEntityId = relatedEntityId;

    const instances = await workflowManager.getInstances({ filters });

    return NextResponse.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    console.error('获取工作流实例错误:', error);
    return NextResponse.json(
      { error: '获取工作流实例失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/instances - 创建工作流实例
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAnyPermission(request, [
    PERMISSIONS.WORKFLOW_MANAGE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_APPROVE,
    PERMISSIONS.PERFORMANCE_MANAGE,
    PERMISSIONS.EMPLOYEE_EDIT,
  ]);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = createInstanceSchema.parse(body);

    // 初始化工作流步骤
    let steps: any[] = [];

    if (validated.customSteps && validated.customSteps.length > 0) {
      // 使用自定义步骤
      steps = [
        {
          id: crypto.randomUUID(),
          name: '开始',
          type: 'start',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          result: '工作流启动',
        },
        ...validated.customSteps.map((step, index) => ({
          id: crypto.randomUUID(),
          name: step.name,
          description: step.description,
          assigneeId: step.assigneeId,
          assigneeRole: step.assigneeRole,
          status: index === 0 ? 'in_progress' : 'pending',
          startTime: index === 0 ? new Date() : undefined,
        })),
        {
          id: crypto.randomUUID(),
          name: '结束',
          type: 'end',
          status: 'pending',
        },
      ];
    } else {
      // 默认步骤
      steps = [
        {
          id: crypto.randomUUID(),
          name: '开始',
          type: 'start',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          result: '工作流启动',
        },
        {
          id: crypto.randomUUID(),
          name: '待办任务',
          type: 'task',
          status: 'in_progress',
          description: '请完成相关任务',
          startTime: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: '结束',
          type: 'end',
          status: 'pending',
        },
      ];
    }

    const instance = await workflowManager.createInstance({
      companyId: validated.companyId,
      templateId: validated.templateId,
      templateName: validated.templateName,
      type: validated.type,
      name: validated.name,
      description: validated.description,
      initiatorId: validated.initiatorId,
      initiatorName: validated.initiatorName,
      relatedEntityType: validated.relatedEntityType,
      relatedEntityId: validated.relatedEntityId,
      relatedEntityName: validated.relatedEntityName,
      formData: validated.formData,
      variables: validated.variables,
      priority: validated.priority || 'medium',
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      steps,
      currentStepIndex: 1,
      status: 'active',
      startDate: new Date(),
    });

    // 记录工作流历史
    await workflowManager.addHistory({
      companyId: validated.companyId,
      instanceId: instance.id,
      instanceName: instance.name,
      templateId: validated.templateId,
      type: validated.type,
      action: 'created',
      actorId: validated.initiatorId,
      actorName: validated.initiatorName,
      actorRole: user.role,
      description: `创建${validated.name}工作流实例`,
      metadata: {
        relatedEntityType: validated.relatedEntityType,
        relatedEntityId: validated.relatedEntityId,
      },
    });

    // 记录审计日志
    await auditLogManager.logAction({
      companyId: validated.companyId,
      userId: validated.initiatorId,
      userName: validated.initiatorName,
      action: 'create',
      resourceType: 'workflow_instance',
      resourceId: instance.id,
      resourceName: instance.name,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '工作流实例创建成功',
      data: instance,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建工作流实例错误:', error);
    return NextResponse.json(
      { error: '创建工作流实例失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/instances - 批量更新工作流实例
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { action, instanceIds, comment } = body;

    if (action === 'pause' || action === 'resume' || action === 'cancel') {
      const updates = await Promise.all(
        (instanceIds as string[]).map(async (instanceId) => {
          const instance = await workflowManager.getInstanceById(instanceId);
          if (!instance) return null;

          let newStatus: string;
          let actionDesc: string;

          switch (action) {
            case 'pause':
              newStatus = 'paused';
              actionDesc = '暂停';
              break;
            case 'resume':
              newStatus = 'active';
              actionDesc = '恢复';
              break;
            case 'cancel':
              newStatus = 'cancelled';
              actionDesc = '取消';
              break;
            default:
              return null;
          }

          const updated = await workflowManager.updateInstanceStatus(
            instanceId,
            newStatus,
            undefined,
            action === 'cancel' ? new Date() : undefined
          );

          if (updated) {
            await workflowManager.addHistory({
              companyId: instance.companyId,
              instanceId,
              instanceName: instance.name,
              templateId: instance.templateId,
              type: instance.type,
              action: action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'cancelled',
              actorId: user.userId,
              actorName: user.name,
              actorRole: user.role,
              description: `${actionDesc}工作流实例${comment ? `：${comment}` : ''}`,
              metadata: { previousStatus: instance.status },
            });
          }

          return updated;
        })
      );

      return NextResponse.json({
        success: true,
        message: `成功${action === 'pause' ? '暂停' : action === 'resume' ? '恢复' : '取消'}${updates.filter(Boolean).length}个工作流实例`,
        data: updates.filter(Boolean),
      });
    }

    return NextResponse.json(
      { error: '不支持的操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('更新工作流实例错误:', error);
    return NextResponse.json(
      { error: '更新工作流实例失败' },
      { status: 500 }
    );
  }
}
