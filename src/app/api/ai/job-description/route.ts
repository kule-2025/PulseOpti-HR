import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 岗位画像生成请求Schema
const generateJobDescriptionSchema = z.object({
  jobTitle: z.string().min(1, '职位名称不能为空'),
  department: z.string().optional(),
  businessGoal: z.string().min(1, '业务目标不能为空'),
  keyResponsibilities: z.string().optional(),
  requirements: z.string().optional(),
  salaryRange: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateJobDescriptionSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位资深的人力资源专家和招聘顾问，擅长编写专业的岗位描述（JD）。
请根据用户提供的信息，生成一份完整、专业的岗位描述，包括以下部分：
1. 岗位名称
2. 岗位概述（基于业务目标）
3. 核心职责（详细列出3-8条）
4. 任职要求（包括学历、经验、技能、能力等）
5. 能力模型（列出该岗位需要的核心能力）
6. 薪酬建议（基于市场行情）
7. 面试问题建议（3-5个结构化面试问题）

输出格式要求：
- 使用清晰的章节结构
- 语言专业、简洁、准确
- 每个要点控制在30字以内
- 符合现代企业招聘规范`;

    const userPrompt = `请根据以下信息生成岗位描述：

职位名称：${validated.jobTitle}
部门：${validated.department || '待定'}
业务目标：${validated.businessGoal}
${validated.keyResponsibilities ? `核心职责参考：${validated.keyResponsibilities}` : ''}
${validated.requirements ? `任职要求参考：${validated.requirements}` : ''}
${validated.salaryRange ? `薪酬范围参考：${validated.salaryRange}` : ''}

请生成一份专业的岗位描述。`;

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

    // 解析生成的岗位描述，提取结构化数据
    const jobDescription = {
      title: validated.jobTitle,
      description: fullContent,
      // 可以进一步解析fullContent提取结构化字段
      responsibilities: extractSection(fullContent, '核心职责'),
      requirements: extractSection(fullContent, '任职要求'),
      competencies: extractSection(fullContent, '能力模型'),
      interviewQuestions: extractSection(fullContent, '面试问题'),
    };

    return NextResponse.json({
      success: true,
      message: '岗位描述生成成功',
      data: jobDescription,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成岗位描述错误:', error);
    return NextResponse.json(
      { error: '生成岗位描述失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 辅助函数：提取特定章节的内容
function extractSection(content: string, sectionTitle: string): string[] {
  const sectionStart = content.indexOf(sectionTitle);
  if (sectionStart === -1) return [];

  const nextSectionStart = content.indexOf('\n\n', sectionStart + sectionTitle.length);
  const sectionContent = nextSectionStart === -1
    ? content.slice(sectionStart)
    : content.slice(sectionStart, nextSectionStart);

  // 提取列表项
  const items: string[] = [];
  const lines = sectionContent.split('\n');
  for (const line of lines) {
    if (line.match(/^\d+\./) || line.match(/^-/)) {
      items.push(line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
    }
  }

  return items;
}
