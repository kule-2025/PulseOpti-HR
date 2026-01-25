import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * AI预测分析接口
 * POST /api/ai/prediction
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, companyId, metricCode, predictionType } = await request.json();

    if (!prompt || !companyId) {
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
        content: `你是一个资深的人力资源数据预测专家，擅长基于历史数据和企业现状预测未来的人效指标趋势。
请结合数据趋势、行业规律、驱动因素等多方面进行预测分析。
预测要基于数据，情景要合理，风险要识别，机会要挖掘，建议要可操作。`,
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
    console.error('AI预测分析错误:', error);
    return NextResponse.json(
      { error: 'AI预测分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
