import { NextRequest, NextResponse } from 'next/server';
import {
  createExchangeRecord,
  getExchangeRecords,
  updateExchangeRecord,
  getExchangeItemById,
  updateEmployeePoints,
  createPointTransaction,
  updateExchangeItemStock,
  getOrCreatePointStatistic,
  incrementPointStatistic,
} from '@/storage/database/pointsManager';
import type { InsertExchangeRecord } from '@/storage/database/shared/schema';

/**
 * GET /api/points/exchanges
 * 获取兑换记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    const records = await getExchangeRecords(
      companyId,
      employeeId || undefined,
      status || undefined
    );

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('获取兑换记录失败:', error);
    return NextResponse.json({ success: false, error: '获取兑换记录失败' }, { status: 500 });
  }
}

/**
 * POST /api/points/exchanges
 * 创建兑换申请
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      employeeId,
      itemId,
      deliveryMethod,
      deliveryInfo,
      remark,
    } = body;

    if (!companyId || !employeeId || !itemId) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    // 获取商品信息
    const item = await getExchangeItemById(itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    // 检查商品是否可用
    if (!item.isActive) {
      return NextResponse.json({ success: false, error: '商品已下架' }, { status: 400 });
    }

    // 检查库存
    if (!item.unlimitedStock && item.stock <= 0) {
      return NextResponse.json({ success: false, error: '商品库存不足' }, { status: 400 });
    }

    // 检查有效期
    const now = new Date();
    if (item.validFrom && new Date(item.validFrom) > now) {
      return NextResponse.json({ success: false, error: '商品兑换尚未开始' }, { status: 400 });
    }
    if (item.validTo && new Date(item.validTo) < now) {
      return NextResponse.json({ success: false, error: '商品兑换已结束' }, { status: 400 });
    }

    // 创建兑换记录
    const recordData: InsertExchangeRecord = {
      companyId,
      employeeId,
      itemId,
      itemName: item.name,
      pointsUsed: item.pointsRequired,
      status: 'pending',
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryInfo: deliveryInfo || {},
      remark,
      approvedBy: null,
      approvedAt: null,
      completedAt: null,
    };

    const record = await createExchangeRecord(recordData);

    return NextResponse.json({
      success: true,
      data: record,
      message: '兑换申请提交成功，等待审批',
    });
  } catch (error) {
    console.error('创建兑换申请失败:', error);
    return NextResponse.json({ success: false, error: '创建兑换申请失败' }, { status: 500 });
  }
}

/**
 * PUT /api/points/exchanges/approve
 * 审批兑换申请
 */
export async function approveExchange(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, approvedBy, approved = true, remark } = body;

    if (!id || !approvedBy) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    // 获取兑换记录
    const records = await getExchangeRecords(body.companyId || '', undefined, undefined);
    const record = records.find(r => r.id === id);

    if (!record) {
      return NextResponse.json({ success: false, error: '兑换记录不存在' }, { status: 404 });
    }

    if (record.status !== 'pending') {
      return NextResponse.json({ success: false, error: '该兑换记录已处理' }, { status: 400 });
    }

    if (!approved) {
      // 拒绝
      await updateExchangeRecord(id, {
        status: 'rejected',
        remark: remark || '审批拒绝',
      });

      return NextResponse.json({
        success: true,
        message: '兑换申请已拒绝',
      });
    }

    // 同意兑换，扣除积分
    const updatedRecord = await updateExchangeRecord(id, {
      status: 'approved',
      approvedBy,
      remark,
    } as any);

    // 更新员工积分
    const updatedPoint = await updateEmployeePoints(
      record.companyId,
      record.employeeId,
      record.pointsUsed,
      'redeem'
    );

    // 创建积分交易记录
    await createPointTransaction({
      companyId: record.companyId,
      employeeId: record.employeeId,
      ruleId: null,
      dimensionId: null,
      transactionType: 'redeem',
      points: -record.pointsUsed,
      balanceAfter: updatedPoint.availablePoints,
      source: 'exchange',
      sourceId: record.itemId,
      description: `兑换商品：${record.itemName}`,
      remarks: remark,
      operatedBy: approvedBy,
      metadata: { exchangeRecordId: record.id },
    });

    // 更新商品库存
    const item = await getExchangeItemById(record.itemId);
    if (item && !item.unlimitedStock) {
      await updateExchangeItemStock(record.itemId, 1);
    }

    // 更新统计数据
    const now = new Date();
    const periodValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const statistic = await getOrCreatePointStatistic(record.companyId, {
      companyId: record.companyId,
      employeeId: record.employeeId,
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

    await incrementPointStatistic(statistic.id, { redeemedPoints: record.pointsUsed });

    return NextResponse.json({
      success: true,
      data: {
        record: updatedRecord,
        employeePoint: updatedPoint,
      },
      message: '兑换申请已批准，积分已扣除',
    });
  } catch (error) {
    console.error('审批兑换申请失败:', error);
    return NextResponse.json({ success: false, error: '审批兑换申请失败' }, { status: 500 });
  }
}

/**
 * PUT /api/points/exchanges/complete
 * 完成兑换
 */
export async function completeExchange(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少兑换记录ID' }, { status: 400 });
    }

    const record = await updateExchangeRecord(id, {
      status: 'completed',
    } as any);

    if (!record) {
      return NextResponse.json({ success: false, error: '兑换记录不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: record,
      message: '兑换已完成',
    });
  } catch (error) {
    console.error('完成兑换失败:', error);
    return NextResponse.json({ success: false, error: '完成兑换失败' }, { status: 500 });
  }
}

/**
 * PUT /api/points/exchanges/cancel
 * 取消兑换
 */
export async function cancelExchange(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, remark } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少兑换记录ID' }, { status: 400 });
    }

    const record = await updateExchangeRecord(id, {
      status: 'cancelled',
      remark,
    });

    if (!record) {
      return NextResponse.json({ success: false, error: '兑换记录不存在' }, { status: 404 });
    }

    // 如果已经批准过，需要返还积分
    if (record.status === 'approved' && record.approvedAt) {
      const updatedPoint = await updateEmployeePoints(
        record.companyId,
        record.employeeId,
        record.pointsUsed,
        'earn'
      );

      // 创建积分交易记录（返还）
      await createPointTransaction({
        companyId: record.companyId,
        employeeId: record.employeeId,
        ruleId: null,
        dimensionId: null,
        transactionType: 'earn',
        points: record.pointsUsed,
        balanceAfter: updatedPoint.availablePoints,
        source: 'exchange_refund',
        sourceId: record.id,
        description: `取消兑换返还：${record.itemName}`,
        remarks: remark,
        operatedBy: null,
        metadata: { exchangeRecordId: record.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: record,
      message: '兑换已取消',
    });
  } catch (error) {
    console.error('取消兑换失败:', error);
    return NextResponse.json({ success: false, error: '取消兑换失败' }, { status: 500 });
  }
}
