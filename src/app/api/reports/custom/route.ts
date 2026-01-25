import { NextRequest, NextResponse } from 'next/server';
import { reportBuilder, ReportDefinition } from '@/lib/reports/report-builder';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * 自定义报表生成器API
 * 提供报表创建、查询、导出、模板等功能
 */

/**
 * POST /api/reports/custom/generate
 * 生成自定义报表
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'generate':
        return await generateReport(body, user);
      case 'export':
        return await exportReport(body, user);
      case 'save':
        return await saveReport(body, user);
      case 'templates':
        return await getTemplates();
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('报表操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 生成报表
 */
async function generateReport(body: any, user: any) {
  const definition: ReportDefinition = body.definition;

  if (!definition) {
    return NextResponse.json(
      { error: '缺少报表定义' },
      { status: 400 }
    );
  }

  const result = await reportBuilder.generateReport(definition);

  return NextResponse.json({
    success: true,
    data: result,
  });
}

/**
 * 导出报表
 */
async function exportReport(body: any, user: any) {
  const { definition, options } = body;

  if (!definition || !options) {
    return NextResponse.json(
      { error: '缺少必要参数' },
      { status: 400 }
    );
  }

  const blob = await reportBuilder.exportReport(definition, options);

  const filename = options.filename || `report-${Date.now()}.${options.format}`;

  return new NextResponse(blob, {
    headers: {
      'Content-Type':
        options.format === 'csv'
          ? 'text/csv'
          : options.format === 'html'
          ? 'text/html'
          : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

/**
 * 保存报表
 */
async function saveReport(body: any, user: any) {
  const definition: ReportDefinition = body.definition;

  if (!definition) {
    return NextResponse.json(
      { error: '缺少报表定义' },
      { status: 400 }
    );
  }

  const saved = await reportBuilder.saveReport(definition, user.id);

  return NextResponse.json({
    success: true,
    data: saved,
    message: '报表保存成功',
  });
}

/**
 * 获取报表模板
 */
async function getTemplates() {
  const templates = reportBuilder.getReportTemplates();

  return NextResponse.json({
    success: true,
    data: templates,
  });
}
