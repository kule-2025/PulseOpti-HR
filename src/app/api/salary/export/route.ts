/**
 * 薪酬报表导出API
 * 提供薪酬统计、报表导出等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { salaryService, SalaryItem } from '@/lib/salary/salary-service';
import { z } from 'zod';

/**
 * POST /api/salary/export
 * 导出薪酬报表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const schema = z.object({
      salaries: z.array(z.any()), // SalaryItem array
      format: z.enum(['csv', 'json']).default('csv'),
    });
    
    const validated = schema.parse(body);
    
    // 导出报表
    if (validated.format === 'csv') {
      const csv = salaryService.exportSalaryReport(validated.salaries);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="salary-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        data: validated.salaries,
      });
    }
  } catch (error) {
    console.error('导出薪酬报表失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '导出失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/salary/statistics
 * 获取薪酬统计
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const schema = z.object({
      salaries: z.array(z.any()),
    });
    
    const validated = schema.parse(body);
    
    // 获取统计信息
    const statistics = salaryService.getSalaryStatistics(validated.salaries);
    
    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('获取薪酬统计失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '统计失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
