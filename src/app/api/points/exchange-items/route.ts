import { NextRequest, NextResponse } from 'next/server';
import {
  createExchangeItem,
  getExchangeItems,
  getPublicExchangeItems,
  updateExchangeItem,
  deleteExchangeItem,
  getExchangeItemById,
} from '@/storage/database/pointsManager';
import type { InsertExchangeItem } from '@/storage/database/shared/schema';

/**
 * GET /api/points/exchange-items
 * 获取兑换商品列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const category = searchParams.get('category');

    // 如果没有companyId，获取公共商品
    if (!companyId) {
      const items = await getPublicExchangeItems(category || undefined);
      return NextResponse.json({
        success: true,
        data: items,
      });
    }

    const items = await getExchangeItems(companyId, category || undefined);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('获取兑换商品失败:', error);
    return NextResponse.json({ success: false, error: '获取兑换商品失败' }, { status: 500 });
  }
}

/**
 * POST /api/points/exchange-items
 * 创建兑换商品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      code,
      name,
      description,
      imageUrl,
      category,
      pointsRequired,
      stock,
      unlimitedStock,
      value,
      tags,
      isPublic,
      isActive,
      validFrom,
      validTo,
      sortOrder,
    } = body;

    if (!code || !name || !pointsRequired) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const itemData: InsertExchangeItem = {
      companyId: companyId || null,
      code,
      name,
      description,
      imageUrl,
      category,
      pointsRequired: parseInt(pointsRequired),
      stock: stock || 0,
      unlimitedStock: unlimitedStock || false,
      value: value || null,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : false,
      isActive: isActive !== undefined ? isActive : true,
      validFrom: validFrom || null,
      validTo: validTo || null,
      sortOrder: sortOrder || 0,
    };

    const item = await createExchangeItem(itemData);

    return NextResponse.json({
      success: true,
      data: item,
      message: '兑换商品创建成功',
    });
  } catch (error) {
    console.error('创建兑换商品失败:', error);
    return NextResponse.json({ success: false, error: '创建兑换商品失败' }, { status: 500 });
  }
}

/**
 * PUT /api/points/exchange-items
 * 更新兑换商品
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少商品ID' }, { status: 400 });
    }

    // 转换数值字段
    if (updateData.pointsRequired !== undefined) {
      updateData.pointsRequired = parseInt(updateData.pointsRequired);
    }

    if (updateData.stock !== undefined) {
      updateData.stock = parseInt(updateData.stock);
    }

    if (updateData.value !== undefined) {
      updateData.value = updateData.value ? parseInt(updateData.value) : null;
    }

    const item = await updateExchangeItem(id, updateData);

    if (!item) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item,
      message: '兑换商品更新成功',
    });
  } catch (error) {
    console.error('更新兑换商品失败:', error);
    return NextResponse.json({ success: false, error: '更新兑换商品失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/points/exchange-items
 * 删除兑换商品
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少商品ID' }, { status: 400 });
    }

    const item = await deleteExchangeItem(id);

    if (!item) {
      return NextResponse.json({ success: false, error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '兑换商品删除成功',
    });
  } catch (error) {
    console.error('删除兑换商品失败:', error);
    return NextResponse.json({ success: false, error: '删除兑换商品失败' }, { status: 500 });
  }
}
