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
    const { jobId, resumeText, jobRequirements, threshold = 80 } = body;

    if (!resumeText || !jobRequirements) {
      return NextResponse.json(
        { error: '缺少必要参数：resumeText 和 jobRequirements' },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位专业的招聘专家和人才评估师。你的任务是根据职位要求评估候选人的简历匹配度。

评估维度：
1. 技能匹配度：评估候选人的技术技能与职位要求的匹配程度
2. 经验相关性：评估候选人的工作经验与职位的相关性
3. 教育背景：评估候选人的学历和专业是否匹配
4. 项目经验：评估候选人的项目经验是否符合职位需求
5. 软技能：评估候选人的沟通能力、团队协作等软技能

输出格式要求：
请以 JSON 格式输出，包含以下字段：
{
  "matchScore": 数字 (0-100的匹配度分数),
  "skillsAnalysis": {
    "matched": ["技能1", "技能2"],
    "missing": ["缺失技能1", "缺失技能2"]
  },
  "experienceAnalysis": "对工作经验的简要分析",
  "educationAnalysis": "对教育背景的简要分析",
  "projectAnalysis": "对项目经验的简要分析",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "concerns": ["潜在问题1", "潜在问题2"],
  "recommendation": "推荐意见：强烈推荐/推荐/考虑/不推荐",
  "reasoning": "详细的推荐理由"
}

请确保 JSON 格式正确，不要包含任何额外的文本说明。`;

    // 构建用户消息
    const userMessage = `职位要求：
${JSON.stringify(jobRequirements, null, 2)}

候选人简历：
${resumeText}

请根据职位要求评估这位候选人的匹配度（匹配度阈值：${threshold}%）。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
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
      // 如果 JSON 解析失败，返回原始文本
      result = {
        matchScore: 75,
        skillsAnalysis: { matched: [], missing: [] },
        experienceAnalysis: fullResponse,
        educationAnalysis: '',
        projectAnalysis: '',
        highlights: [],
        concerns: [],
        recommendation: '考虑',
        reasoning: fullResponse,
      };
    }

    // 检查匹配度是否达到阈值
    const isQualified = result.matchScore >= threshold;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        isQualified,
        threshold,
        jobId,
      },
    });
  } catch (error) {
    console.error('AI简历筛选错误:', error);
    return NextResponse.json(
      {
        error: 'AI筛选服务暂时不可用',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
