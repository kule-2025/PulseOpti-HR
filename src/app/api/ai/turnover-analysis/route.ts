import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 离职分析报告生成请求Schema
const generateTurnoverAnalysisSchema = z.object({
  companyId: z.string(),
  timeRange: z.string(), // 例如："2024年1月-2024年12月"
  turnoverData: z.object({
    totalEmployees: z.number(),
    resignedCount: z.number(),
    averageTenure: z.number(), // 平均工龄（月）
    topResignationReasons: z.array(z.object({
      reason: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
    departmentBreakdown: z.array(z.object({
      department: z.string(),
      employeeCount: z.number(),
      resignedCount: z.number(),
      turnoverRate: z.number(),
    })),
    tenureBreakdown: z.array(z.object({
      range: z.string(), // "0-6个月", "6-12个月", "1-2年", "2-5年", "5年以上"
      employeeCount: z.number(),
      resignedCount: z.number(),
      turnoverRate: z.number(),
    })),
  }).optional(),
  customInsights: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateTurnoverAnalysisSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位资深的人力资源分析师和离职管理专家，擅长分析员工离职原因并提出针对性改进建议。
请基于提供的数据，生成专业的离职分析报告。

报告结构要求：
1. 离职概况
   - 离职率计算和分析
   - 与行业平均水平对比
   - 离职趋势分析

2. 离职原因分析
   - 主要离职原因
   - 按部门分析
   - 按工龄分析
   - 深层原因挖掘

3. 风险识别
   - 高离职率部门
   - 关键人才流失风险
   - 新员工流失风险

4. 改进建议
   - 短期措施（3个月内）
   - 中期措施（3-12个月）
   - 长期策略（1年以上）
   - 预期效果

5. 保留策略
   - 关键人才保留计划
   - 新员工融入计划
   - 员工满意度提升

输出要求：
- 数据准确，分析深入
- 建议具体可执行
- 符合现代企业管理实践`;

    let userPrompt = `请生成离职分析报告。

统计周期：${validated.timeRange}`;

    if (validated.turnoverData) {
      const data = validated.turnoverData;
      userPrompt += `\n\n基础数据：\n`;
      userPrompt += `- 员工总数：${data.totalEmployees}\n`;
      userPrompt += `- 离职人数：${data.resignedCount}\n`;
      userPrompt += `- 平均工龄：${data.averageTenure}个月\n`;

      if (data.topResignationReasons && data.topResignationReasons.length > 0) {
        userPrompt += `\n主要离职原因：\n`;
        data.topResignationReasons.forEach((item, index) => {
          userPrompt += `${index + 1}. ${item.reason}：${item.count}人（${item.percentage}%）\n`;
        });
      }

      if (data.departmentBreakdown && data.departmentBreakdown.length > 0) {
        userPrompt += `\n部门离职率：\n`;
        data.departmentBreakdown.forEach((item) => {
          userPrompt += `- ${item.department}：${item.turnoverRate}%（${item.resignedCount}/${item.employeeCount}）\n`;
        });
      }

      if (data.tenureBreakdown && data.tenureBreakdown.length > 0) {
        userPrompt += `\n工龄离职率：\n`;
        data.tenureBreakdown.forEach((item) => {
          userPrompt += `- ${item.range}：${item.turnoverRate}%（${item.resignedCount}/${item.employeeCount}）\n`;
        });
      }
    }

    if (validated.customInsights) {
      userPrompt += `\n\n补充信息：\n${validated.customInsights}`;
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      temperature: 0.7,
    });

    // 收集完整响应
    let fullContent = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        fullContent += chunk.content.toString();
      }
    }

    // 解析报告内容
    const analysis = {
      report: fullContent,
      turnoverRate: calculateTurnoverRate(validated.turnoverData),
      keyFindings: extractKeyFindings(fullContent),
      recommendations: extractRecommendations(fullContent),
    };

    return NextResponse.json({
      success: true,
      message: '离职分析报告生成成功',
      data: analysis,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成离职分析报告错误:', error);
    return NextResponse.json(
      { error: '生成离职分析报告失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 计算离职率
function calculateTurnoverRate(data?: any): number {
  if (!data || !data.totalEmployees || !data.resignedCount) {
    return 0;
  }
  return Number(((data.resignedCount / data.totalEmployees) * 100).toFixed(2));
}

// 提取关键发现
function extractKeyFindings(content: string): string[] {
  const findings: string[] = [];
  const lines = content.split('\n');

  let inFindingsSection = false;
  for (const line of lines) {
    if (line.includes('关键发现') || line.includes('主要发现')) {
      inFindingsSection = true;
      continue;
    }

    if (inFindingsSection && (line.includes('改进建议') || line.includes('保留策略'))) {
      break;
    }

    if (inFindingsSection && (line.match(/^\d+\./) || line.match(/^-/))) {
      findings.push(line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
    }
  }

  return findings.slice(0, 5);
}

// 提取改进建议
function extractRecommendations(content: string): Array<{
  category: string;
  items: string[];
}> {
  const recommendations: Array<{ category: string; items: string[] }> = [];
  const lines = content.split('\n');

  let currentCategory = '';
  let currentItems: string[] = [];

  for (const line of lines) {
    if (line.includes('短期措施') || line.includes('中期措施') || line.includes('长期策略')) {
      if (currentCategory && currentItems.length > 0) {
        recommendations.push({ category: currentCategory, items: currentItems });
      }
      currentCategory = line.replace(/[:：]/, '');
      currentItems = [];
    } else if (currentCategory && (line.match(/^\d+\./) || line.match(/^-/))) {
      currentItems.push(line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
    }
  }

  if (currentCategory && currentItems.length > 0) {
    recommendations.push({ category: currentCategory, items: currentItems });
  }

  return recommendations;
}
