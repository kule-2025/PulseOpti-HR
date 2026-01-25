import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * AI归因分析接口
 * POST /api/ai/attribution
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, companyId, metricCode } = await request.json();

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
        content: `你是一个资深的人力资源数据分析师，擅长对企业的各项人效指标进行深度归因分析。
请基于数据和事实，从外部环境、内部运营、人员因素、资源因素等多个维度进行分析。
分析结果要精准、具体、可操作，能够为管理决策提供有效支持。`,
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    // 调用LLM（使用非流式方式）
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
    console.error('AI归因分析错误:', error);
    return NextResponse.json(
      { error: 'AI归因分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
