/**
 * 人才盘点报告API
 */

import { NextRequest, NextResponse } from 'next/server';
import { talentMapService } from '@/lib/talent/talent-map-service';

/**
 * POST /api/talent/review-report
 * 生成人才盘点报告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employees, includeRecommendations = true } = body;
    
    if (!Array.isArray(employees)) {
      return NextResponse.json(
        { error: '员工数据必须是数组' },
        { status: 400 }
      );
    }
    
    const report = talentMapService.generateTalentReviewReport(employees);
    
    return NextResponse.json({
      success: true,
      data: report,
      message: '人才盘点报告生成成功',
    });
  } catch (error) {
    console.error('生成人才盘点报告失败:', error);
    return NextResponse.json(
      { error: '生成失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/talent/review-report/export
 * 导出人才盘点报告
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { error: '缺少报告ID' },
        { status: 400 }
      );
    }
    
    // TODO: 从数据库获取报告数据
    
    // 导出报告
    if (format === 'csv') {
      // TODO: 生成CSV格式
      const csv = '';
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="talent-review-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // JSON格式
      return NextResponse.json({
        success: true,
        data: {},
      });
    }
  } catch (error) {
    console.error('导出人才盘点报告失败:', error);
    return NextResponse.json(
      { error: '导出失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
