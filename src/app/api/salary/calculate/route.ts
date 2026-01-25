/**
 * 智能薪酬计算API
 * 提供薪酬计算、批量计算、报表导出等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { salaryService } from '@/lib/salary/salary-service';
import { z } from 'zod';

/**
 * POST /api/salary/calculate
 * 计算单个员工薪酬
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const schema = z.object({
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
    });
    
    const validated = schema.parse(body);
    
    // 验证支付方式对应的账号
    if (validated.paymentMethod === 'bank' && !validated.bankAccount) {
      return NextResponse.json(
        { error: '银行支付必须提供银行账号' },
        { status: 400 }
      );
    }
    
    if (validated.paymentMethod === 'alipay' && !validated.alipayAccount) {
      return NextResponse.json(
        { error: '支付宝支付必须提供支付宝账号' },
        { status: 400 }
      );
    }
    
    if (validated.paymentMethod === 'wechat' && !validated.wechatAccount) {
      return NextResponse.json(
        { error: '微信支付必须提供微信账号' },
        { status: 400 }
      );
    }
    
    // 计算薪酬
    const salary = await salaryService.calculateSalary(validated);
    
    return NextResponse.json({
      success: true,
      data: salary,
      message: '薪酬计算成功',
    });
  } catch (error) {
    console.error('薪酬计算失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '计算失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
