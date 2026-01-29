import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { verifyAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const auth = await verifyAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json();
    const {
      jobId,
      jobTitle,
      jobRequirements,
      candidateInfo,
      interviewType = 'technical', // technical, behavioral, mixed
      questionCount = 5,
    } = body;

    if (!jobTitle || !jobRequirements || !candidateInfo) {
      return NextResponse.json(
        { error: '缺少必要参数：jobTitle, jobRequirements, candidateInfo' },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 根据面试类型构建系统提示词
    const getSystemPrompt = (type: string) => {
      if (type === 'technical') {
        return `你是一位专业的技术面试官。你的任务是根据职位要求和候选人信息，设计技术面试题目。

题目设计原则：
1. 难度递进：从基础到进阶
2. 考察全面：涵盖理论知识和实践能力
3. 场景化：结合实际工作场景
4. 可量化：每个问题都有明确的评分标准

输出格式要求：
请以 JSON 格式输出，包含以下字段：
{
  "interviewPlan": {
    "duration": "预估面试时长（分钟）",
    "overview": "面试概述"
  },
  "questions": [
    {
      "id": 1,
      "category": "问题分类（如：基础理论/架构设计/编码能力/系统设计等）",
      "difficulty": "难度等级（easy/medium/hard）",
      "question": "问题内容",
      "expectedAnswer": "期望的回答要点",
      "evaluationCriteria": "评分标准",
      "timeLimit": "建议回答时长（分钟）",
      "followUp": "可能的追问方向"
    }
  ],
  "evaluationFramework": {
    "totalScore": 100,
    "dimensions": [
      {
        "dimension": "评估维度",
        "weight": "权重",
        "description": "描述"
      }
    ]
  },
  "tips": ["面试官提示1", "面试官提示2"]
}

请确保 JSON 格式正确，不要包含任何额外的文本说明。`;
      } else if (type === 'behavioral') {
        return `你是一位专业的HR面试官，擅长行为面试（Behavioral Interview）。你的任务是根据职位要求和候选人信息，设计行为面试题目。

使用 STAR 法则（Situation情境、Task任务、Action行动、Result结果）评估候选人。

题目设计原则：
1. 关注过去的行为预测未来的表现
2. 深入挖掘具体案例
3. 考察软技能和团队协作能力
4. 评估文化契合度

输出格式要求：
请以 JSON 格式输出，包含以下字段：
{
  "interviewPlan": {
    "duration": "预估面试时长（分钟）",
    "overview": "面试概述"
  },
  "questions": [
    {
      "id": 1,
      "category": "问题分类（如：团队协作/问题解决/领导力/抗压能力等）",
      "question": "问题内容（要求举出具体例子）",
      "starFramework": {
        "situation": "引导了解具体情境",
        "task": "引导了解任务目标",
        "action": "引导了解采取的行动",
        "result": "引导了解最终结果"
      },
      "evaluationCriteria": "评分标准",
      "timeLimit": "建议回答时长（分钟）",
      "goodIndicators": ["良好表现的指标1", "良好表现的指标2"],
      "concernIndicators": ["需要注意的指标1", "需要注意的指标2"]
    }
  ],
  "evaluationFramework": {
    "totalScore": 100,
    "dimensions": [
      {
        "dimension": "评估维度",
        "weight": "权重",
        "description": "描述"
      }
    ]
  },
  "tips": ["面试官提示1", "面试官提示2"]
}

请确保 JSON 格式正确，不要包含任何额外的文本说明。`;
      } else {
        // mixed
        return `你是一位资深的面试官，擅长综合面试（技术+行为）。你的任务是根据职位要求和候选人信息，设计综合面试题目。

题目设计原则：
1. 技术与软技能并重
2. 考察综合能力
3. 模拟真实工作场景
4. 评估候选人潜力

输出格式要求：
请以 JSON 格式输出，包含以下字段：
{
  "interviewPlan": {
    "duration": "预估面试时长（分钟）",
    "overview": "面试概述"
  },
  "questions": [
    {
      "id": 1,
      "type": "题目类型（technical/behavioral/综合）",
      "category": "问题分类",
      "difficulty": "难度等级",
      "question": "问题内容",
      "expectedAnswer": "期望的回答要点",
      "evaluationCriteria": "评分标准",
      "timeLimit": "建议回答时长（分钟）",
      "followUp": "可能的追问方向"
    }
  ],
  "evaluationFramework": {
    "totalScore": 100,
    "dimensions": [
      {
        "dimension": "评估维度",
        "weight": "权重",
        "description": "描述"
      }
    ]
  },
  "tips": ["面试官提示1", "面试官提示2"]
}

请确保 JSON 格式正确，不要包含任何额外的文本说明。`;
      }
    };

    // 构建用户消息
    const userMessage = `职位信息：
职位名称：${jobTitle}
职位要求：
${JSON.stringify(jobRequirements, null, 2)}

候选人信息：
${JSON.stringify(candidateInfo, null, 2)}

面试类型：${interviewType}
题目数量：${questionCount}

请根据以上信息，设计${questionCount}道面试题目。`;

    const messages = [
      { role: 'system' as const, content: getSystemPrompt(interviewType) },
      { role: 'user' as const, content: userMessage },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.6,
    });

    // 收集完整响应
    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    // 尝试解析 JSON
    let result;
    try {
      // 清理可能的 markdown 代码块标记
      const cleanedResponse = fullResponse.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // 如果 JSON 解析失败，返回基本信息
      result = {
        interviewPlan: {
          duration: '60分钟',
          overview: '面试计划生成失败，请检查输入信息',
        },
        questions: [],
        evaluationFramework: {
          totalScore: 100,
          dimensions: [],
        },
        tips: [],
        error: fullResponse,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        jobId,
        jobTitle,
        interviewType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI面试辅助错误:', error);
    return NextResponse.json(
      {
        error: 'AI面试服务暂时不可用',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
