/**
 * 批量薪酬计算API
 * 提供批量薪酬计算、薪酬周期管理等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { salaryService, SalaryItem } from '@/lib/salary/salary-service';
import { z } from 'zod';

/**
 * POST /api/salary/batch-calculate
 * 批量计算薪酬
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const schema = z.object({
      employees: z.array(z.object({
        employeeId: z.string(),
        employeeName: z.string(),
        department: z.string(),
        position: z.string(),
        baseSalary: z.number().min(0),
        performanceBonus: z.number().min(0).default(0),
        overtimePay: z.number().min(0).default(0),
        allowance: z.number().min(0).default(0),
        deduction: z.number().min(0).default(0),
        paymentMethod: z.enum(['bank', 'alipay', 'wechat']),
        bankAccount: z.string().optional(),
        alipayAccount: z.string().optional(),
        wechatAccount: z.string().optional(),
        region: z.string().default('china'),
      })),
    });
    
    const validated = schema.parse(body);
    
    // 批量计算薪酬
    const salaries = await salaryService.batchCalculateSalaries(validated.employees);
    
    // 获取统计信息
    const statistics = salaryService.getSalaryStatistics(salaries);
    
    return NextResponse.json({
      success: true,
      data: {
        salaries,
        statistics,
      },
      message: `成功计算 ${salaries.length} 名员工的薪酬`,
    });
  } catch (error) {
    console.error('批量薪酬计算失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '批量计算失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
