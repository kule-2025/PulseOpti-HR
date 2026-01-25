import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 工作流操作类型
enum WorkflowAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STEP_STARTED = 'step_started',
  STEP_COMPLETED = 'step_completed',
  STEP_ERROR = 'step_error',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  COMMENT_ADDED = 'comment_added',
  ATTACHMENT_ADDED = 'attachment_added',
  VARIABLE_UPDATED = 'variable_updated',
  ASSIGNED = 'assigned',
}

// 工作流历史记录
interface WorkflowHistory {
  id: string;
  companyId: string;
  instanceId: string;
  instanceName: string;
  templateId: string;
  type: string;
  action: WorkflowAction;
  actorId: string;
  actorName: string;
  actorRole?: string;
  stepId?: string;
  stepName?: string;
  description: string;
  metadata?: Record<string, any>;
  changes?: Record<string, any>; // 记录变更前后的值
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// 模拟历史记录存储
let workflowHistory: WorkflowHistory[] = [];

// 添加历史记录函数（内部使用）
export async function addHistoryEntry(entry: {
  companyId: string;
  instanceId: string;
  instanceName: string;
  templateId: string;
  type: string;
  action: WorkflowAction;
  actorId: string;
  actorName: string;
  actorRole?: string;
  stepId?: string;
  stepName?: string;
  description: string;
  metadata?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<WorkflowHistory> {
  const historyEntry: WorkflowHistory = {
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    ...entry,
  };

  workflowHistory.push(historyEntry);
  return historyEntry;
}

// 获取历史记录列表请求参数Schema
const getHistorySchema = z.object({
  companyId: z.string().optional(),
  instanceId: z.string().optional(),
  type: z.string().optional(),
  action: z.nativeEnum(WorkflowAction).optional(),
  actorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/workflows/history - 获取工作流历史记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      companyId: searchParams.get('companyId') || undefined,
      instanceId: searchParams.get('instanceId') || undefined,
      type: searchParams.get('type') || undefined,
      action: searchParams.get('action') as WorkflowAction | undefined,
      actorId: searchParams.get('actorId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validated = getHistorySchema.parse(params);

    let filteredHistory = [...workflowHistory];

    // 按公司ID过滤
    if (validated.companyId) {
      filteredHistory = filteredHistory.filter(h => h.companyId === validated.companyId);
    }

    // 按实例ID过滤
    if (validated.instanceId) {
      filteredHistory = filteredHistory.filter(h => h.instanceId === validated.instanceId);
    }

    // 按类型过滤
    if (validated.type) {
      filteredHistory = filteredHistory.filter(h => h.type === validated.type);
    }

    // 按操作类型过滤
    if (validated.action) {
      filteredHistory = filteredHistory.filter(h => h.action === validated.action);
    }

    // 按操作人过滤
    if (validated.actorId) {
      filteredHistory = filteredHistory.filter(h => h.actorId === validated.actorId);
    }

    // 按日期范围过滤
    if (validated.startDate) {
      const startDate = new Date(validated.startDate);
      filteredHistory = filteredHistory.filter(h => h.createdAt >= startDate);
    }

    if (validated.endDate) {
      const endDate = new Date(validated.endDate);
      filteredHistory = filteredHistory.filter(h => h.createdAt <= endDate);
    }

    // 按创建时间倒序排序
    filteredHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const paginatedHistory = filteredHistory.slice(validated.offset, validated.offset + validated.limit);

    // 统计数据
    const statistics = {
      total: filteredHistory.length,
      byAction: filteredHistory.reduce((acc, h) => {
        acc[h.action] = (acc[h.action] || 0) + 1;
        return acc;
      }, {} as Record<WorkflowAction, number>),
      byType: filteredHistory.reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: paginatedHistory,
      statistics,
      pagination: {
        total: filteredHistory.length,
        limit: validated.limit,
        offset: validated.offset,
        hasMore: validated.offset + validated.limit < filteredHistory.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('获取工作流历史记录错误:', error);
    return NextResponse.json(
      { error: '获取工作流历史记录失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/history - 批量添加历史记录（内部使用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = Array.isArray(body) ? body : [body];

    const addedEntries = await Promise.all(
      entries.map(entry => addHistoryEntry(entry))
    );

    return NextResponse.json({
      success: true,
      message: `成功添加 ${addedEntries.length} 条历史记录`,
      data: addedEntries,
    });
  } catch (error) {
    console.error('添加工作流历史记录错误:', error);
    return NextResponse.json(
      { error: '添加工作流历史记录失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
