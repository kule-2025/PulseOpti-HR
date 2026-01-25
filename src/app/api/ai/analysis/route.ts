import { NextRequest, NextResponse } from 'next/server';
import { aiAnalysisService } from '@/lib/ai-analysis';

/**
 * 流式AI分析（用于实时展示）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: '缺少必填字段: type, data' },
        { status: 400 }
      );
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiAnalysisService.streamAnalysis(type, data)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error('AI分析流式输出错误:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI分析失败:', error);
    return NextResponse.json(
      { error: 'AI分析失败' },
      { status: 500 }
    );
  }
}

/**
 * 非流式AI分析
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const dataStr = searchParams.get('data');

    if (!type || !dataStr) {
      return NextResponse.json(
        { error: '缺少必填参数: type, data' },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataStr);

    let result = '';

    switch (type) {
      case 'employee':
        result = await aiAnalysisService.analyzeEmployees(data);
        break;
      case 'recruitment':
        result = await aiAnalysisService.analyzeRecruitment(data);
        break;
      case 'performance':
        result = await aiAnalysisService.analyzePerformance(data);
        break;
      default:
        return NextResponse.json(
          { error: `未知的分析类型: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: result,
      },
    });

  } catch (error) {
    console.error('AI分析失败:', error);
    return NextResponse.json(
      { error: 'AI分析失败' },
      { status: 500 }
    );
  }
}

/**
 * 回答用户问题
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { question, context } = body;

    if (!question) {
      return NextResponse.json(
        { error: '缺少必填字段: question' },
        { status: 400 }
      );
    }

    const answer = await aiAnalysisService.answerQuestion(question, context);

    return NextResponse.json({
      success: true,
      data: {
        answer,
      },
    });

  } catch (error) {
    console.error('AI问答失败:', error);
    return NextResponse.json(
      { error: 'AI问答失败' },
      { status: 500 }
    );
  }
}
