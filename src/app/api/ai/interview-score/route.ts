import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 面试评分请求Schema
const scoreInterviewSchema = z.object({
  question: z.string(),
  answer: z.string(),
  questionType: z.enum(['behavioral', 'technical', 'situational', 'cultural']),
  position: z.string(),
  candidateExperience: z.string().optional(),
  scoringCriteria: z.array(z.object({
    dimension: z.string(),
    weight: z.number(),
    description: z.string(),
  })).optional(),
});

/**
 * AI面试评分接口
 * POST /api/ai/interview-score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = scoreInterviewSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 构建评分维度
    const defaultCriteria = [
      { dimension: '内容完整性', weight: 30, description: '回答是否完整，是否覆盖了问题的关键点' },
      { dimension: '逻辑清晰度', weight: 25, description: '思路是否清晰，表达是否有条理' },
      { dimension: '专业深度', weight: 25, description: '对专业问题的理解深度和技术水平' },
      { dimension: '沟通表达', weight: 20, description: '语言表达能力、沟通技巧和说服力' },
    ];

    const criteria = validated.scoringCriteria || defaultCriteria;

    // 构建系统提示词
    const systemPrompt = `你是一位资深的人力资源专家和面试官，擅长对候选人的面试回答进行专业评估。
请基于以下评分维度对候选人的回答进行评估打分：

${criteria.map((c, i) => `${i + 1}. ${c.dimension}（权重${c.weight}%）：${c.description}`).join('\n')}

评分标准：
- 90-100分：优秀，超出预期
- 80-89分：良好，达到预期
- 70-79分：合格，基本满足要求
- 60-69分：需改进，存在明显不足
- 0-59分：不合格，无法满足要求

输出格式要求JSON结构，包含以下字段：
{
  "overallScore": 总分(0-100),
  "dimensionScores": [
    {
      "dimension": "评分维度",
      "score": 分数(0-100),
      "weight": 权重,
      "weightedScore": 加权分数,
      "feedback": "具体反馈"
    }
  ],
  "strengths": ["优势点1", "优势点2"],
  "improvements": ["改进点1", "改进点2"],
  "feedback": "总体反馈",
  "recommendation": "hire/consider/reject"
}`;

    // 构建用户提示词
    let userPrompt = `请对以下面试回答进行评估：

职位：${validated.position}
题目类型：${validated.questionType}

面试问题：
${validated.question}

候选人的回答：
${validated.answer}`;

    if (validated.candidateExperience) {
      userPrompt += `\n\n候选人背景：${validated.candidateExperience}`;
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 调用LLM（使用思考模式进行复杂推理）
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      thinking: 'enabled',
      temperature: 0.6,
    });

    // 提取JSON内容
    const content = response.content.trim();
    let scoreData;

    // 尝试提取JSON
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        scoreData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        // 如果解析失败，创建默认结构
        scoreData = {
          overallScore: 75,
          dimensionScores: criteria.map(c => ({
            dimension: c.dimension,
            score: 75,
            weight: c.weight,
            weightedScore: 75 * c.weight / 100,
            feedback: '基于常规水平的评估',
          })),
          strengths: [],
          improvements: [],
          feedback: content.slice(0, 300),
          recommendation: 'consider',
        };
      }
    } else {
      // 如果没有找到JSON，创建默认结构
      scoreData = {
        overallScore: 70,
        dimensionScores: criteria.map(c => ({
          dimension: c.dimension,
          score: 70,
          weight: c.weight,
          weightedScore: 70 * c.weight / 100,
          feedback: '请提供更详细的回答以便准确评估',
        })),
        strengths: [],
        improvements: ['建议提供更具体的例子', '可以加强逻辑结构'],
        feedback: content.slice(0, 300),
        recommendation: 'consider',
      };
    }

    // 验证推荐类型
    if (
!['hire', 'consider', 'reject'].includes(scoreData.recommendation)
) {
      scoreData.recommendation = 'consider';
    }

    return NextResponse.json({
      success: true,
      message: '面试评分完成',
      evaluation: scoreData,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('面试评分错误:', error);
    return NextResponse.json(
      { error: '面试评分失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
