/**
 * 行业对比分析API
 * 提供行业对比分析、图表数据生成和报告导出功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  industryBenchmarkService, 
  IndustryType, 
  CompanySize, 
  Region 
} from '@/lib/analytics/industry-benchmark';
import { dataCollectionService } from '@/lib/analytics/data-collection';
import { comparisonAnalyzerService } from '@/lib/analytics/comparison-analyzer';
import { companies } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';

/**
 * POST /api/analytics/industry-comparison
 * 
 * 请求体：
 * {
 *   action: 'compare' | 'benchmark' | 'charts' | 'report' | 'export',
 *   companyId: string,
 *   industry?: IndustryType,
 *   companySize?: CompanySize,
 *   region?: Region,
 *   year?: number,
 *   quarter?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, companyId, industry, companySize, region, year, quarter } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: '请指定操作类型' },
        { status: 400 }
      );
    }
    
    // 获取公司信息
    const companyList = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    
    if (companyList.length === 0) {
      return NextResponse.json(
        { error: '公司不存在' },
        { status: 404 }
      );
    }
    
    const company = companyList[0];
    
    switch (action) {
      case 'benchmark':
        // 获取行业基准数据
        return await getBenchmarkData(body);
        
      case 'compare':
        // 执行对比分析
        return await performComparison(company, body);
        
      case 'charts':
        // 生成图表数据
        return await generateCharts(company, body);
        
      case 'report':
        // 生成对比报告
        return await generateReport(company, body);
        
      case 'export':
        // 导出报告
        return await exportReport(company, body);
        
      default:
        return NextResponse.json(
          { error: '不支持的操作类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('行业对比分析API错误:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/industry-comparison
 * 
 * 查询参数：
 * - action: 'metadata' | 'template'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'metadata':
        // 获取元数据（行业、规模、地区列表）
        return await getMetadata();
        
      case 'template':
        // 获取导入模板
        return await getImportTemplate();
        
      default:
        return NextResponse.json(
          { error: '不支持的操作类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('行业对比分析API错误:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 获取行业基准数据
 */
async function getBenchmarkData(body: any) {
  const { industry, companySize, region, year, quarter } = body;
  
  if (!industry || !companySize || !region) {
    return NextResponse.json(
      { error: '请提供行业、企业规模和地区信息' },
      { status: 400 }
    );
  }
  
  const benchmark = await industryBenchmarkService.getBenchmark({
    industry,
    companySize,
    region,
    year,
    quarter,
  });
  
  if (!benchmark) {
    return NextResponse.json(
      { error: '未找到匹配的基准数据' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: benchmark,
  });
}

/**
 * 执行对比分析
 */
async function performComparison(company: any, body: any) {
  const { industry, companySize, region, year, quarter } = body;
  
  // 如果没有指定行业、规模、地区，自动推断
  const autoIndustry = industry as IndustryType || 'technology';
  const autoSize = companySize as CompanySize || 
    industryBenchmarkService.inferCompanySize(company.employeeCount || 0);
  const autoRegion = region as Region || 'east';
  
  // 获取行业基准数据
  const benchmark = await industryBenchmarkService.getBenchmark({
    industry: autoIndustry,
    companySize: autoSize,
    region: autoRegion,
    year,
    quarter,
  });
  
  if (!benchmark) {
    return NextResponse.json(
      { error: '未找到匹配的基准数据' },
      { status: 404 }
    );
  }
  
  // 采集公司数据
  const companyMetrics = await dataCollectionService.collectCompanyMetrics(
    company.id,
    year,
    quarter
  );
  
  // 执行对比分析
  const result = await comparisonAnalyzerService.compare(
    company.id,
    company.name,
    benchmark,
    companyMetrics
  );
  
  return NextResponse.json({
    success: true,
    data: result,
  });
}

/**
 * 生成图表数据
 */
async function generateCharts(company: any, body: any) {
  const { industry, companySize, region, year, quarter } = body;
  
  // 执行对比分析
  const compareResponse = await performComparison(company, body);
  const compareData = await compareResponse.json();
  
  if (!compareData.success) {
    return compareResponse;
  }
  
  // 生成图表数据
  const charts = comparisonAnalyzerService.generateChartData(compareData.data);
  
  return NextResponse.json({
    success: true,
    data: charts,
  });
}

/**
 * 生成对比报告
 */
async function generateReport(company: any, body: any) {
  // 执行对比分析
  const compareResponse = await performComparison(company, body);
  const compareData = await compareResponse.json();
  
  if (!compareData.success) {
    return compareResponse;
  }
  
  // 生成报告
  const report = comparisonAnalyzerService.generateReport(compareData.data);
  
  return NextResponse.json({
    success: true,
    data: report,
  });
}

/**
 * 导出报告
 */
async function exportReport(company: any, body: any) {
  const { format = 'markdown' } = body;
  
  // 执行对比分析
  const compareResponse = await performComparison(company, body);
  const compareData = await compareResponse.json();
  
  if (!compareData.success) {
    return compareResponse;
  }
  
  // 生成报告
  const report = comparisonAnalyzerService.generateReport(compareData.data);
  
  // 根据格式导出
  switch (format) {
    case 'markdown':
      return NextResponse.json({
        success: true,
        data: {
          content: report,
          filename: `${company.name}_行业对比分析报告_${Date.now()}.md`,
          mimeType: 'text/markdown',
        },
      });
      
    case 'text':
      return NextResponse.json({
        success: true,
        data: {
          content: report,
          filename: `${company.name}_行业对比分析报告_${Date.now()}.txt`,
          mimeType: 'text/plain',
        },
      });
      
    default:
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      );
  }
}

/**
 * 获取元数据
 */
async function getMetadata() {
  return NextResponse.json({
    success: true,
    data: {
      industries: industryBenchmarkService.getIndustries(),
      companySizes: industryBenchmarkService.getCompanySizes(),
      regions: industryBenchmarkService.getRegions(),
      dimensions: [
        {
          key: 'hr',
          label: '人力资源',
          items: [
            { key: 'employeeCount', label: '员工规模', unit: '人' },
            { key: 'employeeGrowthRate', label: '员工增长率', unit: '%' },
            { key: 'turnoverRate', label: '离职率', unit: '%' },
            { key: 'avgAttendanceRate', label: '出勤率', unit: '%' },
          ],
        },
        {
          key: 'performance',
          label: '绩效管理',
          items: [
            { key: 'avgPerformanceScore', label: '平均绩效分数', unit: '分' },
            { key: 'avgOvertimeHours', label: '平均加班时长', unit: '小时/月' },
          ],
        },
        {
          key: 'recruitment',
          label: '招聘管理',
          items: [
            { key: 'avgRecruitmentCycle', label: '招聘周期', unit: '天' },
            { key: 'offerAcceptanceRate', label: 'Offer接受率', unit: '%' },
            { key: 'costPerHire', label: '单次招聘成本', unit: '元' },
          ],
        },
        {
          key: 'compensation',
          label: '薪酬管理',
          items: [
            { key: 'avgSalary', label: '平均薪资', unit: '万元/年' },
            { key: 'salaryGrowthRate', label: '薪资增长率', unit: '%' },
          ],
        },
        {
          key: 'satisfaction',
          label: '员工满意度',
          items: [
            { key: 'employeeSatisfaction', label: '员工满意度', unit: '分' },
            { key: 'engagementScore', label: '敬业度', unit: '分' },
          ],
        },
      ],
    },
  });
}

/**
 * 获取导入模板
 */
async function getImportTemplate() {
  const template = dataCollectionService.generateImportTemplate();
  
  return NextResponse.json({
    success: true,
    data: template,
  });
}
