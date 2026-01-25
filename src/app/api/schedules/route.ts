/**
 * 排班管理API
 * 提供排班的CRUD操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 排班数据结构
export interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  shiftName: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'checked_in' | 'checked_out' | 'absent';
  overtime?: number;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

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
 * GET /api/schedules
 * 获取排班列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 从数据库获取排班列表
    // 简化处理，返回模拟数据
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: '张三',
        date: '2025-01-20',
        shiftType: 'morning',
        shiftName: '早班',
        startTime: '08:00',
        endTime: '17:00',
        location: '办公室',
        status: 'checked_in',
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: '李四',
        date: '2025-01-20',
        shiftType: 'morning',
        shiftName: '早班',
        startTime: '08:00',
        endTime: '17:00',
        location: '办公室',
        status: 'scheduled',
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        employeeId: '3',
        employeeName: '王五',
        date: '2025-01-20',
        shiftType: 'night',
        shiftName: '夜班',
        startTime: '20:00',
        endTime: '08:00',
        location: '工厂',
        status: 'scheduled',
        companyId: companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 过滤
    let filteredSchedules = mockSchedules;
    if (employeeId) {
      filteredSchedules = filteredSchedules.filter(sch => sch.employeeId === employeeId);
    }
    if (status) {
      filteredSchedules = filteredSchedules.filter(sch => sch.status === status);
    }
    if (startDate && endDate) {
      filteredSchedules = filteredSchedules.filter(
        sch => sch.date >= startDate && sch.date <= endDate
      );
    }

    // 分页
    const total = filteredSchedules.length;
    const start = (page - 1) * limit;
    const data = filteredSchedules.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取排班列表失败:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 * 创建排班
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 支持批量创建
    const schedules = Array.isArray(body) ? body : [body];

    // 验证数据
    const validatedSchedules = schedules.map(sch => scheduleSchema.parse(sch));

    // TODO: 保存到数据库
    const newSchedules: Schedule[] = validatedSchedules.map(sch => {
      const mockEmployeeName = `员工${sch.employeeId}`;
      return {
        id: crypto.randomUUID(),
        ...sch,
        employeeName: mockEmployeeName,
        status: 'scheduled' as const,
        companyId: sch.companyId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: newSchedules,
      message: `成功创建 ${newSchedules.length} 条排班记录`,
    }, { status: 201 });
  } catch (error) {
    console.error('创建排班失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedules
 * 批量更新排班
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleIds, updates } = body;

    if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要更新的排班' },
        { status: 400 }
      );
    }

    // TODO: 批量更新数据库
    const updatedSchedules = scheduleIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: updatedSchedules,
      message: `成功更新 ${scheduleIds.length} 条排班记录`,
    });
  } catch (error) {
    console.error('批量更新排班失败:', error);
    return NextResponse.json(
      { error: '批量更新失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules
 * 批量删除排班
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleIds } = body;

    if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的排班' },
        { status: 400 }
      );
    }

    // TODO: 从数据库批量删除
    return NextResponse.json({
      success: true,
      message: `成功删除 ${scheduleIds.length} 条排班记录`,
    });
  } catch (error) {
    console.error('批量删除排班失败:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
