/**
 * 单个排班管理API
 * 提供单个排班的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Schedule } from '../route';

// 数据验证schema
const scheduleSchema = z.object({
  employeeId: z.string().min(1, '员工ID不能为空'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  shiftType: z.enum(['morning', 'afternoon', 'night', 'flexible']),
  shiftName: z.string().min(1, '班次名称不能为空'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, '开始时间格式不正确'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, '结束时间格式不正确'),
  location: z.string().min(1, '地点不能为空'),
  notes: z.string().optional(),
});

/**
 * GET /api/schedules/[id]
 * 获取单个排班
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;

    // TODO: 从数据库获取排班
    // 简化处理，返回模拟数据
    const mockSchedule: Schedule = {
      id: scheduleId,
      employeeId: '1',
      employeeName: '张三',
      date: '2025-01-20',
      shiftType: 'morning',
      shiftName: '早班',
      startTime: '08:00',
      endTime: '17:00',
      location: '办公室',
      status: 'checked_in',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockSchedule,
    });
  } catch (error) {
    console.error('获取排班失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedules/[id]
 * 更新单个排班
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;
    const body = await request.json();

    // 验证数据
    const validated = scheduleSchema.parse(body);

    // TODO: 更新数据库
    const updatedSchedule: Schedule = {
      id: scheduleId,
      ...validated,
      employeeName: body.employeeName || `员工${validated.employeeId}`,
      status: body.status || 'scheduled',
      companyId: body.companyId || 'default',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: '排班信息更新成功',
    });
  } catch (error) {
    console.error('更新排班失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules/[id]
 * 删除单个排班
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;

    // TODO: 从数据库删除
    return NextResponse.json({
      success: true,
      message: '排班删除成功',
    });
  } catch (error) {
    console.error('删除排班失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
