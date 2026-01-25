import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { employees, payrollRecords, trainingRecords, attendanceRecords, leaveRequests } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

// ========== GET：获取员工个人信息 ==========

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();

    // 获取员工基本信息
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, user.userId))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: '员工信息不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('获取员工信息错误:', error);
    return NextResponse.json(
      { error: '获取员工信息失败' },
      { status: 500 }
    );
  }
}

// ========== PUT：更新员工个人信息 ==========

const updateProfileSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
});

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const db = await getDb();
    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    // 获取员工信息
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, user.userId))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: '员工信息不存在' },
        { status: 404 }
      );
    }

    const [result] = await db
      .update(employees)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(employees.userId, user.userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: '个人信息更新成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('更新员工信息错误:', error);
    return NextResponse.json(
      { error: '更新员工信息失败' },
      { status: 500 }
    );
  }
}
