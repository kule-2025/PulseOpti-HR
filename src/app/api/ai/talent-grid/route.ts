import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 人才盘点九宫格生成请求Schema
const generateTalentGridSchema = z.object({
  department: z.string().optional(),
  teamSize: z.number().optional(),
  criteria: z.object({
    performance: z.string().optional(), // 绩效评估标准
    potential: z.string().optional(), // 潜力评估标准
    values: z.string().optional(), // 价值观匹配度
  }),
  employees: z.array(z.object({
    name: z.string(),
    position: z.string(),
    performanceScore: z.number().min(1).max(5),
    potentialScore: z.number().min(1).max(5),
    keyStrengths: z.string().optional(),
    developmentNeeds: z.string().optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateTalentGridSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位资深的人才管理专家和组织发展顾问，擅长人才盘点和人才梯队建设。
请基于提供的信息，生成人才盘点九宫格分析报告。

九宫格定义（横轴：绩效，纵轴：潜力）：
- 右上（4-5星绩效，4-5星潜力）：高潜人才（Super Stars）- 重点培养
- 右中（4-5星绩效，2-3星潜力）：核心骨干（Solid Performers）- 稳定保留
- 右下（4-5星绩效，1星潜力）：优秀执行者（Strong Contributors）- 保留培养
- 中上（2-3星绩效，4-5星潜力）：成长型人才（Rising Stars）- 关注发展
- 中中（2-3星绩效，2-3星潜力）：稳定员工（Steady Contributors）- 正常管理
- 中下（2-3星绩效，1星潜力）：待提升（Underachievers）- 辅导改进
- 左上（1星绩效，4-5星潜力）：有潜力的低绩效者（Misplaced Talents）- 调整岗位
- 左中（1星绩效，2-3星潜力）：低绩效者（Underperformers）- 改进计划
- 左下（1星绩效，1星潜力）：不匹配者（Misfits）- 优化淘汰

输出格式要求：
1. 九宫格分布统计
2. 各区域人员名单
3. 人才盘点结论和建议
4. 后续行动计划`;

    let userPrompt = `请生成人才盘点九宫格分析报告。

部门：${validated.department || '全公司'}
团队规模：${validated.teamSize || '根据提供的数据'}

评估标准：
${validated.criteria.performance ? `- 绩效：${validated.criteria.performance}` : ''}
${validated.criteria.potential ? `- 潜力：${validated.criteria.potential}` : ''}
${validated.criteria.values ? `- 价值观：${validated.criteria.values}` : ''}`;

    if (validated.employees && validated.employees.length > 0) {
      userPrompt += '\n\n员工数据：\n';
      validated.employees.forEach((emp, index) => {
        userPrompt += `${index + 1}. ${emp.name}（${emp.position}）\n`;
        userPrompt += `   - 绩效分数：${emp.performanceScore}/5\n`;
        userPrompt += `   - 潜力分数：${emp.potentialScore}/5\n`;
        if (emp.keyStrengths) userPrompt += `   - 核心优势：${emp.keyStrengths}\n`;
        if (emp.developmentNeeds) userPrompt += `   - 发展需求：${emp.developmentNeeds}\n`;
        userPrompt += '\n';
      });
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

    // 解析分析结果
    const analysis = {
      report: fullContent,
      // 可以进一步解析fullContent提取结构化数据
      summary: extractSummary(fullContent),
      recommendations: extractRecommendations(fullContent),
    };

    return NextResponse.json({
      success: true,
      message: '人才盘点分析生成成功',
      data: analysis,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成人才盘点分析错误:', error);
    return NextResponse.json(
      { error: '生成人才盘点分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 辅助函数：提取总结
function extractSummary(content: string): string {
  const summaryStart = content.indexOf('结论') || content.indexOf('总结');
  if (summaryStart === -1) return content.slice(0, 200) + '...';

  const summaryEnd = content.indexOf('\n\n', summaryStart);
  return summaryEnd === -1
    ? content.slice(summaryStart)
    : content.slice(summaryStart, summaryEnd);
}

// 辅助函数：提取建议
function extractRecommendations(content: string): string[] {
  const recommendationsStart = content.indexOf('建议') || content.indexOf('行动计划');
  if (recommendationsStart === -1) return [];

  const recommendationsSection = content.slice(recommendationsStart);
  const items: string[] = [];
  const lines = recommendationsSection.split('\n');

  for (const line of lines) {
    if (line.match(/^\d+\./) || line.match(/^-/)) {
      items.push(line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
    }
  }

  return items.slice(0, 5); // 最多返回5条建议
}
