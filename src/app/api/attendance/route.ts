import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employees } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// 考勤记录存储在内存中（生产环境应使用数据库）
const attendanceRecords: Map<string, any[]> = new Map();

/**
 * 打卡
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userStr = request.headers.get('x-user-id');
    if (!userStr) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userStr);

    // 验证必填字段
    const requiredFields = ['employeeId', 'type', 'location'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();

    // 验证员工是否存在
    const employee = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.id, body.employeeId),
          eq(employees.companyId, user.companyId)
        )
      )
      .limit(1);

    if (!employee.length) {
      return NextResponse.json(
        { error: '员工不存在' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const recordId = randomUUID();

    // 获取今天的考勤记录
    const todayRecords = attendanceRecords.get(today) || [];

    // 检查是否已打卡
    const existingRecord = todayRecords.find(
      record => record.employeeId === body.employeeId && record.type === body.type
    );

    if (existingRecord) {
      return NextResponse.json(
        { error: `您今天已${body.type === 'in' ? '上班' : '下班'}打卡` },
        { status: 400 }
      );
    }

    // 创建考勤记录
    const record = {
      id: recordId,
      companyId: user.companyId,
      employeeId: body.employeeId,
      employeeName: employee[0].name,
      type: body.type as 'in' | 'out', // 上班打卡/下班打卡
      location: body.location,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      deviceId: body.deviceId || '',
      remark: body.remark || '',
      status: 'normal', // normal, late, early_leave, absent
      timestamp: now,
      createdAt: now,
    };

    todayRecords.push(record);
    attendanceRecords.set(today, todayRecords);

    return NextResponse.json({
      success: true,
      message: '打卡成功',
      data: record,
    });

  } catch (error) {
    console.error('打卡失败:', error);
    return NextResponse.json(
      { error: '打卡失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取考勤记录
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId') || '';
    const date = searchParams.get('date') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: '缺少企业ID' },
        { status: 400 }
      );
    }

    // 收集所有考勤记录
    let allRecords: any[] = [];

    if (date) {
      // 查询特定日期
      const records = attendanceRecords.get(date) || [];
      allRecords = records.filter(r => r.companyId === companyId);
    } else if (startDate && endDate) {
      // 查询日期范围
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (const [key, records] of attendanceRecords.entries()) {
        const currentDate = new Date(key);
        if (currentDate >= start && currentDate <= end) {
          allRecords = allRecords.concat(
            records.filter(r => r.companyId === companyId)
          );
        }
      }
    } else {
      // 查询最近30天
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      for (const [key, records] of attendanceRecords.entries()) {
        const currentDate = new Date(key);
        if (currentDate >= thirtyDaysAgo) {
          allRecords = allRecords.concat(
            records.filter(r => r.companyId === companyId)
          );
        }
      }
    }

    // 按员工ID筛选
    if (employeeId) {
      allRecords = allRecords.filter(r => r.employeeId === employeeId);
    }

    // 排序
    allRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 分页
    const total = allRecords.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pagedRecords = allRecords.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: pagedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('获取考勤记录失败:', error);
    return NextResponse.json(
      { error: '获取考勤记录失败' },
      { status: 500 }
    );
  }
}
