import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { interviews, candidates, jobs, employees } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI智能面试对话API（流式输出）
 * 支持SSE协议，实现实时AI对话
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 对话请求Schema
const chatRequestSchema = z.object({
  interviewId: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  question: z.string(), // 当前问题
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'interviewer']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).default([]),
  currentPhase: z.enum([
    'introduction',
    'self_introduction',
    'behavioral',
    'technical',
    'situational',
    'cultural',
    'closing',
  ]).default('introduction'),
  candidateName: z.string().optional(),
  positionName: z.string().optional(),
  enableFollowUp: z.boolean().default(false),
  mode: z.enum(['interview', 'feedback', 'analysis']).default('interview'),
});

// System Prompt for AI interviewer
const AI_INTERVIEWER_SYSTEM_PROMPT = `你是一名专业的AI面试官，拥有丰富的面试经验和专业知识。

你的角色和职责：
1. 进行专业、友好的面试对话
2. 根据候选人的回答调整后续问题
3. 在适当时机进行追问，深入挖掘信息
4. 保持面试流程的连贯性和专业性
5. 对候选人的回答进行适度的反馈

面试原则：
- 语气友好、专业、客观
- 问题要有针对性和层次感
- 避免引导性问题和暗示性语言
- 尊重候选人，给予充分的表达时间
- 关注候选人的实际能力和经验，而非表面现象

面试阶段：
1. introduction（开场介绍）：自我介绍，介绍面试流程
2. self_introduction（候选人介绍）：引导候选人自我介绍
3. behavioral（行为面试）：考察过往行为和经验
4. technical（技术面试）：考察专业技能
5. situational（情景面试）：通过情景题考察应变能力
6. cultural（文化契合）：考察价值观匹配度
7. closing（结束阶段）：总结，询问问题，结束面试

对话模式：
- interview：正常面试模式，提出问题
- feedback：反馈模式，对候选人回答进行评价和建议
- analysis：分析模式，分析候选人的表现

回答格式：
直接输出对话内容，不要包含任何JSON或特殊格式标记。保持自然、流畅的对话风格。

注意：
- 回答要简洁明了，控制在150字以内（除非是详细解释）
- 如果是提出问题，问题要清晰、具体
- 如果是反馈，要客观、建设性
- 根据对话历史保持上下文连贯`;

/**
 * POST /api/ai/interview/chat
 * 流式AI对话（SSE）
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const db = await getDb();

    // 获取候选人信息
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.id, validated.candidateId), eq(candidates.companyId, user.companyId)))
      .limit(1);

    if (!candidate) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      );
    }

    // 获取职位信息
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, validated.jobId), eq(jobs.companyId, user.companyId)))
      .limit(1);

    if (!job) {
      return NextResponse.json(
        { error: '职位不存在' },
        { status: 404 }
      );
    }

    // 构建对话上下文
    let messages: any[] = [
      {
        role: 'system',
        content: AI_INTERVIEWER_SYSTEM_PROMPT,
      },
    ];

    // 添加面试上下文
    messages.push({
      role: 'user',
      content: `【面试上下文】
候选人姓名：${validated.candidateName || candidate.name}
应聘职位：${validated.positionName || job.title}
当前阶段：${validated.currentPhase}

职位信息：
${job.description || '未提供'}
${job.requirements ? `\n任职要求：${job.requirements}` : ''}

候选人信息：
${candidate.education ? `教育背景：${candidate.education}` : ''}
${candidate.workExperience ? `工作年限：${candidate.workExperience}年` : ''}

请根据以上信息，以专业的面试官身份进行对话。`,
    });

    // 添加对话历史
    if (validated.conversationHistory && validated.conversationHistory.length > 0) {
      validated.conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'interviewer' ? 'assistant' : msg.role,
          content: msg.content,
        });
      });
    }

    // 添加当前输入
    messages.push({
      role: 'user',
      content: validated.question,
    });

    // 创建SSE响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用LLM客户端获取响应
          const response = await llmClient.invoke(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.8,
            thinking: 'disabled',
          });

          // 如果支持流式输出
          if (typeof response === 'string') {
            // 模拟流式输出（如果API不支持流式）
            const chunks = (response as string).match(/.{1,10}/g) || [response];
            for (const chunk of chunks) {
              const data = encoder.encode(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
              controller.enqueue(data);
              await new Promise(resolve => setTimeout(resolve, 50)); // 模拟打字效果
            }
          } else if (response && typeof response === 'object' && 'content' in response) {
            // 非流式响应，模拟流式输出
            const content = (response as any).content || '';
            const chunks = content.match(/.{1,10}/g) || [content];
            for (const chunk of chunks) {
              const data = encoder.encode(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
              controller.enqueue(data);
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          // 发送完成信号
          const doneData = encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: typeof response === 'string' ? response : (response as any).content })}\n\n`);
          controller.enqueue(doneData);

          // 保存对话到面试记录
          const [interview] = await db
            .select()
            .from(interviews)
            .where(and(eq(interviews.id, validated.interviewId), eq(interviews.companyId, user.companyId)))
            .limit(1);

          if (interview) {
            const chatHistory = (interview.metadata as any)?.chatHistory || [];
            chatHistory.push({
              role: 'user',
              content: validated.question,
              timestamp: new Date().toISOString(),
            });
            chatHistory.push({
              role: 'assistant',
              content: typeof response === 'string' ? response : (response as any).content,
              timestamp: new Date().toISOString(),
            });

            await db
              .update(interviews)
              .set({
                metadata: {
                  ...(interview.metadata as any),
                  chatHistory,
                  lastChatAt: new Date().toISOString(),
                },
                updatedAt: new Date(),
              })
              .where(eq(interviews.id, validated.interviewId));
          }

          controller.close();
        } catch (error) {
          console.error('流式对话错误:', error);
          const errorData = encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : '对话失败' })}\n\n`);
          controller.enqueue(errorData);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('AI对话错误:', error);
    return NextResponse.json(
      { error: 'AI对话失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/interview/chat
 * 获取对话历史
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const searchParams = request.nextUrl.searchParams;
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: '缺少面试ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [interview] = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, interviewId), eq(interviews.companyId, user.companyId)))
      .limit(1);

    if (!interview) {
      return NextResponse.json(
        { error: '面试记录不存在' },
        { status: 404 }
      );
    }

    const chatHistory = (interview.metadata as any)?.chatHistory || [];

    return NextResponse.json({
      success: true,
      data: chatHistory,
    });

  } catch (error) {
    console.error('获取对话历史错误:', error);
    return NextResponse.json(
      { error: '获取对话历史失败' },
      { status: 500 }
    );
  }
}
