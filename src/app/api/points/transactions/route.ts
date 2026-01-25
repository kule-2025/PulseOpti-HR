import { NextRequest, NextResponse } from 'next/server';
import {
  getPointTransactions,
  createPointTransaction,
  updateEmployeePoints,
  getOrCreateEmployeePoint,
  getOrCreatePointStatistic,
  incrementPointStatistic,
  getPointStatistics,
} from '@/storage/database/pointsManager';
import { pointsWorkflowManager } from '@/storage/database/pointsWorkflowManager';
import type { InsertPointTransaction } from '@/storage/database/shared/schema';

/**
 * GET /api/points/transactions
 * 获取积分交易记录
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    const transactions = await getPointTransactions(
      companyId,
      employeeId || undefined,
      limit
    );

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('获取积分交易记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取积分交易记录失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/points/transactions
 * 创建积分交易（手动调整积分，需要审批则启动工作流）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      employeeId,
      transactionType,
      points,
      source,
      sourceId,
      description,
      remarks,
      operatedBy,
      metadata,
      requireApproval = false,
    } = body;

    if (!companyId || !employeeId || !transactionType || !points || !source) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    // 如果需要审批，启动工作流
    if (requireApproval && (transactionType === 'earn' || transactionType === 'adjust')) {
      const pointsRequestId = crypto.randomUUID();
      
      // 创建临时积分请求ID用于工作流
      const workflow = await pointsWorkflowManager.createPointsApprovalWorkflow({
        companyId,
        pointsRequestId,
        employeeId,
        points,
        reason: description || remarks,
        category: source,
        initiatorId: operatedBy,
        initiatorName: operatedBy,
      });

      return NextResponse.json({
        success: true,
        data: {
          workflowInstanceId: workflow.id,
          workflowStatus: workflow.status,
          pointsRequestId,
          message: '积分调整已提交审批',
        },
        message: '积分调整已提交审批',
      });
    }

    // 不需要审批，直接执行
    const employeePoint = await getOrCreateEmployeePoint(companyId, employeeId);

    // 验证积分是否足够（消费类型）
    if (transactionType === 'redeem' && employeePoint.availablePoints < Math.abs(points)) {
      return NextResponse.json(
        { success: false, error: '可用积分不足' },
        { status: 400 }
      );
    }

    // 更新员工积分
    const updatedPoint = await updateEmployeePoints(
      companyId,
      employeeId,
      Math.abs(points),
      transactionType
    );

    // 创建交易记录
    const transactionData: InsertPointTransaction = {
      companyId,
      employeeId,
      ruleId: null, // 手动调整没有关联规则
      dimensionId: null,
      transactionType,
      points: transactionType === 'redeem' ? -Math.abs(points) : points,
      balanceAfter: updatedPoint.availablePoints,
      source,
      sourceId: sourceId || null,
      description,
      remarks,
      operatedBy,
      metadata,
    };

    const transaction = await createPointTransaction(transactionData);

    // 更新统计数据
    const now = new Date();
    const periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const statistic = await getOrCreatePointStatistic(companyId, {
      companyId,
      employeeId,
      departmentId: null,
      dimensionId: null,
      period: 'monthly',
      periodValue,
      earnedPoints: 0,
      redeemedPoints: 0,
      netPoints: 0,
      transactionCount: 0,
      metadata: {},
    });

    if (transactionType === 'earn' || transactionType === 'adjust') {
      await incrementPointStatistic(statistic.id, { earnedPoints: Math.abs(points) });
    } else if (transactionType === 'redeem') {
      await incrementPointStatistic(statistic.id, { redeemedPoints: Math.abs(points) });
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        employeePoint: updatedPoint,
      },
      message: '积分交易成功',
    });
  } catch (error) {
    console.error('创建积分交易失败:', error);
    return NextResponse.json(
      { success: false, error: '创建积分交易失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/points/transactions/stats
 * 获取积分统计
 */
export async function getTransactionStats(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period') || 'monthly';

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    // 获取当前周期值
    const now = new Date();
    let periodValue = '';
    if (period === 'daily') {
      periodValue = now.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'yearly') {
      periodValue = `${now.getFullYear()}`;
    }

    const stats = await getPointStatistics(companyId, period, periodValue);

    // 过滤employeeId
    const filteredStats = employeeId
      ? stats.filter((s: any) => s.employeeId === employeeId)
      : stats;

    // 汇总数据
    const summary = filteredStats.reduce(
      (acc: { totalEarned: number; totalRedeemed: number; netPoints: number; transactionCount: number }, stat: any) => ({
        totalEarned: acc.totalEarned + stat.earnedPoints,
        totalRedeemed: acc.totalRedeemed + stat.redeemedPoints,
        netPoints: acc.netPoints + stat.netPoints,
        transactionCount: acc.transactionCount + stat.transactionCount,
      }),
      { totalEarned: 0, totalRedeemed: 0, netPoints: 0, transactionCount: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        stats: filteredStats,
        summary,
      },
    });
  } catch (error) {
    console.error('获取积分统计失败:', error);
    return NextResponse.json({ success: false, error: '获取积分统计失败' }, { status: 500 });
  }
}
