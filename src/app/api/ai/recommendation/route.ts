import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * AI决策建议接口
 * POST /api/ai/recommendation
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, metricCode, context } = await request.json();

    if (!prompt || !context) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建消息
    const messages = [
      {
        role: 'system' as const,
        content: `你是一个资深的人力资源管理专家和战略顾问，擅长基于企业的人效数据生成具体的、可执行的决策建议。
建议要具体可操作，避免空泛套话；行动步骤要有逻辑顺序，循序渐进；
资源评估要合理，考虑企业实际承受能力；风险识别要全面，缓解措施要可行；
成功指标要可衡量，能够跟踪执行效果。`,
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    // 调用LLM（使用思考模式进行复杂推理）
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      thinking: 'enabled',
      temperature: 0.7,
    });

    // 提取JSON内容
    const content = response.content.trim();
    let analysisResult;

    // 尝试提取JSON（可能在代码块中）
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        // 如果解析失败，返回原始内容
        analysisResult = { raw: content };
      }
    } else {
      analysisResult = { raw: content };
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });

  } catch (error) {
    console.error('AI决策建议生成错误:', error);
    return NextResponse.json(
      { error: 'AI决策建议生成失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
