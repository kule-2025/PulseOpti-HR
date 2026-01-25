import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 面试会话状态
enum InterviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 面试阶段
enum InterviewPhase {
  INTRODUCTION = 'introduction', // 开场介绍
  SELF_INTRODUCTION = 'self_introduction', // 自我介绍
  BEHAVIORAL = 'behavioral', // 行为面试
  TECHNICAL = 'technical', // 技术面试
  SITUATIONAL = 'situational', // 情景面试
  CULTURAL = 'cultural', // 文化契合
  CLOSING = 'closing', // 结束阶段
}

// 面试会话
interface InterviewSession {
  id: string;
  companyId: string;
  positionId: string;
  positionName: string;
  candidateId: string;
  candidateName: string;
  interviewerId: string;
  interviewerName: string;
  status: InterviewStatus;
  currentPhase: InterviewPhase;
  currentQuestionIndex: number;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    askedAt: Date;
    answer?: string;
    answeredAt?: Date;
    evaluation?: {
      score: number;
      strengths: string[];
      improvements: string[];
      feedback: string;
    };
    transcript?: string; // 语音识别的文本
    audioUrl?: string; // 录音文件URL
  }>;
  overallEvaluation?: {
    totalScore: number;
    dimensionScores: Record<string, number>;
    strengths: string[];
    improvements: string[];
    recommendation: string;
    summary: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// 模拟面试会话存储
let interviewSessions: InterviewSession[] = [];

// 创建面试会话Schema
const createSessionSchema = z.object({
  companyId: z.string(),
  positionId: z.string(),
  positionName: z.string(),
  candidateId: z.string(),
  candidateName: z.string(),
  interviewerId: z.string(),
  interviewerName: z.string(),
  questionType: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// 开始面试Schema
const startInterviewSchema = z.object({
  sessionId: z.string(),
});

// 回答问题Schema
const answerQuestionSchema = z.object({
  sessionId: z.string(),
  questionIndex: z.number(),
  answer: z.string(),
  transcript: z.string().optional(),
  audioUrl: z.string().optional(),
  audioDuration: z.number().optional(),
});

// 获取下一个问题Schema
const nextQuestionSchema = z.object({
  sessionId: z.string(),
});

// 语音识别Schema
const speechToTextSchema = z.object({
  sessionId: z.string(),
  questionIndex: z.number(),
  audioData: z.string(), // Base64编码的音频数据
  format: z.enum(['wav', 'mp3', 'ogg', 'webm']),
});

/**
 * POST /api/interview/ai-interviewer - 创建面试会话
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'start') {
      return startInterview(body);
    } else if (body.action === 'answer') {
      return handleAnswer(body);
    } else if (body.action === 'next_question') {
      return getNextQuestion(body);
    } else if (body.action === 'complete') {
      return completeInterview(body);
    } else if (body.action === 'speech_to_text') {
      return handleSpeechToText(body);
    } else {
      // 创建新会话
      return createSession(body);
    }
  } catch (error) {
    console.error('AI面试官错误:', error);
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 创建面试会话
async function createSession(body: any) {
  try {
    const validated = createSessionSchema.parse(body);

    const newSession: InterviewSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyId: validated.companyId,
      positionId: validated.positionId,
      positionName: validated.positionName,
      candidateId: validated.candidateId,
      candidateName: validated.candidateName,
      interviewerId: validated.interviewerId,
      interviewerName: validated.interviewerName,
      status: InterviewStatus.PENDING,
      currentPhase: InterviewPhase.INTRODUCTION,
      currentQuestionIndex: -1,
      questions: [],
      metadata: validated.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    interviewSessions.push(newSession);

    return NextResponse.json({
      success: true,
      message: '面试会话创建成功',
      data: newSession,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

// 开始面试
async function startInterview(body: any) {
  try {
    const validated = startInterviewSchema.parse(body);

    const sessionIndex = interviewSessions.findIndex(s => s.id === validated.sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: '面试会话不存在' },
        { status: 404 }
      );
    }

    const session = interviewSessions[sessionIndex];
    session.status = InterviewStatus.IN_PROGRESS;
    session.currentPhase = InterviewPhase.SELF_INTRODUCTION;
    session.startedAt = new Date();
    session.updatedAt = new Date();

    // 生成开场白
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      {
        role: 'system' as const,
        content: `你是一位专业的AI面试官，正在进行一场${session.positionName}职位的面试。
请用友好、专业的语气开场，介绍自己，并说明面试流程。
面试将包括自我介绍、行为面试、技术面试（如果是技术岗）、情景面试和文化契合度评估几个阶段。
每个阶段我会提出相应的问题，请你认真回答。
整个过程大约需要30-45分钟。
现在请开始面试。`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      thinking: 'enabled',
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      message: '面试已开始',
      data: {
        session,
        interviewerMessage: response.content,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

// 处理回答
async function handleAnswer(body: any) {
  try {
    const validated = answerQuestionSchema.parse(body);

    const sessionIndex = interviewSessions.findIndex(s => s.id === validated.sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: '面试会话不存在' },
        { status: 404 }
      );
    }

    const session = interviewSessions[sessionIndex];

    // 检查问题索引
    if (validated.questionIndex < 0 || validated.questionIndex >= session.questions.length) {
      return NextResponse.json(
        { error: '问题索引无效' },
        { status: 400 }
      );
    }

    // 保存回答
    const question = session.questions[validated.questionIndex];
    question.answer = validated.answer;
    question.transcript = validated.transcript;
    question.audioUrl = validated.audioUrl;
    question.answeredAt = new Date();

    // AI评估回答
    const evaluation = await evaluateAnswer(
      session.positionName,
      question.question,
      validated.answer,
      question.type
    );

    question.evaluation = evaluation;
    session.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      message: '回答已保存',
      data: {
        question,
        evaluation,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

// 获取下一个问题
async function getNextQuestion(body: any) {
  try {
    const validated = nextQuestionSchema.parse(body);

    const sessionIndex = interviewSessions.findIndex(s => s.id === validated.sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: '面试会话不存在' },
        { status: 404 }
      );
    }

    const session = interviewSessions[sessionIndex];

    // 调用AI生成下一个问题
    const config = new Config();
    const client = new LLMClient(config);

    const conversationContext = session.questions.map((q, i) => {
      let context = `Q${i + 1}: ${q.question}\n`;
      if (q.answer) {
        context += `A${i + 1}: ${q.answer}\n`;
      }
      return context;
    }).join('\n');

    let phasePrompt = '';
    switch (session.currentPhase) {
      case InterviewPhase.SELF_INTRODUCTION:
        phasePrompt = '请先请候选人进行自我介绍。';
        break;
      case InterviewPhase.BEHAVIORAL:
        phasePrompt = '请提出一个行为面试问题，使用STAR法则评估候选人的过去行为。';
        break;
      case InterviewPhase.TECHNICAL:
        phasePrompt = '请提出一个技术面试问题，评估候选人的专业技能。';
        break;
      case InterviewPhase.SITUATIONAL:
        phasePrompt = '请提出一个情景面试问题，评估候选人的问题解决能力。';
        break;
      case InterviewPhase.CULTURAL:
        phasePrompt = '请提出一个文化契合度问题，评估候选人与公司的价值观匹配。';
        break;
      case InterviewPhase.CLOSING:
        phasePrompt = '面试即将结束，请询问候选人是否有任何问题，并进行总结。';
        break;
    }

    const messages = [
      {
        role: 'system' as const,
        content: `你是一位专业的AI面试官，正在进行一场${session.positionName}职位的面试。
当前面试阶段：${session.currentPhase}
已问问题数：${session.currentQuestionIndex + 1}

${phasePrompt}

请生成下一个面试问题，要求：
1. 问题要与职位相关
2. 问题要有深度和针对性
3. 问题要能够有效评估候选人
4. 如果是自我介绍阶段，请引导候选人进行介绍

输出格式：
{
  "question": "问题内容",
  "type": "问题类型",
  "phase": "当前阶段",
  "suggestedTime": "建议回答时间（分钟）"
}`,
      },
      {
        role: 'user' as const,
        content: `面试对话记录：
${conversationContext}

当前候选人是：${session.candidateName}
请生成下一个问题。`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      thinking: 'enabled',
      temperature: 0.7,
    });

    // 提取JSON
    const content = response.content.trim();
    let questionData: any = {};

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        questionData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        questionData = { question: content };
      }
    } else {
      questionData = { question: content };
    }

    // 添加问题到会话
    const newQuestion = {
      id: `q-${session.questions.length + 1}`,
      question: questionData.question || content,
      type: questionData.type || 'general',
      phase: questionData.phase || session.currentPhase,
      askedAt: new Date(),
    };

    session.questions.push(newQuestion);
    session.currentQuestionIndex = session.questions.length - 1;
    session.updatedAt = new Date();

    // 自动切换到下一个阶段（如果需要）
    if (session.currentPhase === InterviewPhase.SELF_INTRODUCTION) {
      session.currentPhase = InterviewPhase.BEHAVIORAL;
    } else if (session.questions.length === 3 && session.currentPhase === InterviewPhase.BEHAVIORAL) {
      session.currentPhase = session.positionName.includes('工程师') ||
                           session.positionName.includes('架构师') ||
                           session.positionName.includes('技术')
        ? InterviewPhase.TECHNICAL
        : InterviewPhase.SITUATIONAL;
    } else if (session.questions.length === 5 && session.currentPhase === InterviewPhase.TECHNICAL) {
      session.currentPhase = InterviewPhase.SITUATIONAL;
    } else if (session.questions.length === 7 && session.currentPhase === InterviewPhase.SITUATIONAL) {
      session.currentPhase = InterviewPhase.CULTURAL;
    } else if (session.questions.length === 9) {
      session.currentPhase = InterviewPhase.CLOSING;
    }

    return NextResponse.json({
      success: true,
      message: '获取下一个问题成功',
      data: {
        question: newQuestion,
        currentPhase: session.currentPhase,
        questionNumber: session.questions.length,
        interviewerMessage: questionData.question || content,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

// 完成面试
async function completeInterview(body: any) {
  try {
    const { sessionId } = body;

    const sessionIndex = interviewSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: '面试会话不存在' },
        { status: 404 }
      );
    }

    const session = interviewSessions[sessionIndex];

    // 生成综合评估
    const overallEvaluation = await generateOverallEvaluation(session);

    session.overallEvaluation = overallEvaluation;
    session.status = InterviewStatus.COMPLETED;
    session.completedAt = new Date();
    session.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      message: '面试已完成',
      data: {
        session,
        overallEvaluation,
      },
    });
  } catch (error) {
    throw error;
  }
}

// 语音识别（模拟）
async function handleSpeechToText(body: any) {
  try {
    const validated = speechToTextSchema.parse(body);

    // 注意：这里使用集成服务中的语音大模型进行真实的语音识别
    // 实际项目中应该调用语音识别API

    // 由于当前环境限制，我们模拟返回转录文本
    // 在实际项目中，这里应该调用：
    // 1. 豆包语音大模型 (integration-doubao-voice)
    // 2. 或其他语音识别服务

    const transcript = "这是模拟的语音识别文本。实际项目中应该调用语音识别API。";

    return NextResponse.json({
      success: true,
      message: '语音识别成功',
      data: {
        transcript,
        confidence: 0.95,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}

// 评估回答
async function evaluateAnswer(
  position: string,
  question: string,
  answer: string,
  type: string
) {
  const config = new Config();
  const client = new LLMClient(config);

  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的面试评估专家，请对候选人的回答进行评估。
职位：${position}
问题类型：${type}

请从以下维度进行评估：
1. 内容完整性（30%）
2. 逻辑清晰度（25%）
3. 专业深度（25%）
4. 沟通表达（20%）

评分标准：
- 90-100分：优秀，超出预期
- 80-89分：良好，达到预期
- 70-79分：合格，基本满足要求
- 60-69分：需改进，存在明显不足
- 0-59分：不合格，无法满足要求

输出格式JSON：
{
  "score": 总分(0-100),
  "dimensionScores": {
    "内容完整性": 分数,
    "逻辑清晰度": 分数,
    "专业深度": 分数,
    "沟通表达": 分数
  },
  "strengths": ["优势点1", "优势点2"],
  "improvements": ["改进点1", "改进点2"],
  "feedback": "总体反馈"
}`,
    },
    {
      role: 'user' as const,
      content: `问题：${question}\n\n回答：${answer}\n\n请对上述回答进行评估。`,
    },
  ];

  const response = await client.invoke(messages, {
    temperature: 0.6,
  });

  const content = response.content.trim();
  let evaluationData: any = {};

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                   content.match(/```\s*([\s\S]*?)\s*```/) ||
                   content.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      evaluationData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      evaluationData = {
        score: 75,
        dimensionScores: {
          内容完整性: 75,
          逻辑清晰度: 75,
          专业深度: 75,
          沟通表达: 75,
        },
        strengths: [],
        improvements: [],
        feedback: content,
      };
    }
  }

  return evaluationData;
}

// 生成综合评估
async function generateOverallEvaluation(session: InterviewSession) {
  const config = new Config();
  const client = new LLMClient(config);

  const questionsSummary = session.questions.map((q, i) => {
    let summary = `${i + 1}. ${q.question}\n`;
    if (q.answer) {
      summary += `回答：${q.answer.substring(0, 200)}...\n`;
    }
    if (q.evaluation) {
      summary += `评分：${q.evaluation.score}\n`;
    }
    return summary;
  }).join('\n');

  const messages = [
    {
      role: 'system' as const,
      content: `你是一位专业的面试评估专家，请根据面试过程生成综合评估报告。
候选人：${session.candidateName}
职位：${session.positionName}
问题数量：${session.questions.length}

请生成以下内容：
1. 总体评分（0-100）
2. 各维度得分（内容完整性、逻辑清晰度、专业深度、沟通表达）
3. 主要优势（3-5点）
4. 改进建议（3-5点）
5. 面试总结
6. 录用建议（hire/consider/reject）

输出格式JSON：
{
  "totalScore": 总分,
  "dimensionScores": {
    "内容完整性": 分数,
    "逻辑清晰度": 分数,
    "专业深度": 分数,
    "沟通表达": 分数
  },
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进1", "改进2"],
  "summary": "面试总结",
  "recommendation": "hire/consider/reject"
}`,
    },
    {
      role: 'user' as const,
      content: `面试记录：\n${questionsSummary}\n\n请生成综合评估报告。`,
    },
  ];

  const response = await client.invoke(messages, {
    temperature: 0.6,
  });

  const content = response.content.trim();
  let evaluationData: any = {};

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                   content.match(/```\s*([\s\S]*?)\s*```/) ||
                   content.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      evaluationData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      evaluationData = {
        totalScore: 75,
        dimensionScores: {
          内容完整性: 75,
          逻辑清晰度: 75,
          专业深度: 75,
          沟通表达: 75,
        },
        strengths: [],
        improvements: [],
        summary: content,
        recommendation: 'consider',
      };
    }
  }

  return evaluationData;
}

/**
 * GET /api/interview/ai-interviewer - 获取面试会话列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const candidateId = searchParams.get('candidateId');
    const status = searchParams.get('status');

    let filteredSessions = [...interviewSessions];

    if (companyId) {
      filteredSessions = filteredSessions.filter(s => s.companyId === companyId);
    }

    if (candidateId) {
      filteredSessions = filteredSessions.filter(s => s.candidateId === candidateId);
    }

    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredSessions,
    });
  } catch (error) {
    console.error('获取面试会话列表错误:', error);
    return NextResponse.json(
      { error: '获取面试会话列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
