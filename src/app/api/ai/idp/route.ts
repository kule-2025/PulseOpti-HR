import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// IDP生成请求Schema
const generateIDPSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  department: z.string(),
  position: z.string(),
  performance: z.number().min(0).max(100),
  potential: z.number().min(0).max(100),
  skills: z.record(z.string(), z.number()).optional(),
  targetPosition: z.string().optional(),
  timeframe: z.string().optional(),
});

/**
 * AI生成个人发展计划(IDP)接口
 * POST /api/ai/idp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateIDPSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位资深的人才发展和学习专家，擅长为员工制定个性化的个人发展计划(IDP)。
请基于员工的绩效、潜力、技能差距等信息，生成包含以下内容的完整IDP：

1. 整体发展目标
2. 核心技能差距分析（识别3-5个关键技能）
3. 阶段性发展目标（按优先级排序：高/中/低）
4. 推荐培训课程（包括在线课程、线下培训、工作坊、导师制等）
5. 指导人建议（推荐合适的导师及理由）
6. 时间框架和里程碑

输出格式要求JSON结构，包含以下字段：
{
  "overallGoal": "整体发展目标",
  "timeframe": "建议时间框架",
  "skillsGap": [
    {
      "skill": "技能名称",
      "currentLevel": 当前水平(0-100),
      "targetLevel": 目标水平(0-100),
      "priority": "high/medium/low"
    }
  ],
  "developments": [
    {
      "id": "唯一标识",
      "goal": "发展目标",
      "priority": "high/medium/low",
      "targetDate": "目标日期",
      "progress": 0,
      "milestones": [
        {
          "id": "标识",
          "title": "里程碑",
          "completed": false,
          "dueDate": "日期"
        }
      ]
    }
  ],
  "trainings": [
    {
      "id": "唯一标识",
      "title": "课程标题",
      "type": "online/offline/workshop/mentorship",
      "duration": "时长",
      "provider": "提供方",
      "relevanceScore": 相关度(0-100),
      "status": "recommended"
    }
  ],
  "mentor": {
    "name": "导师姓名",
    "position": "职位",
    "department": "部门",
    "reason": "推荐理由"
  },
  "confidence": 置信度(0-100)
}`;

    // 构建用户提示词
    let userPrompt = `请为以下员工生成个性化发展计划(IDP)：

员工信息：
- 姓名：${validated.employeeName}
- 部门：${validated.department}
- 职位：${validated.position}
- 绩效评分：${validated.performance}/100
- 潜力评分：${validated.potential}/100`;

    if (validated.targetPosition) {
      userPrompt += `\n- 目标职位：${validated.targetPosition}`;
    }

    if (validated.timeframe) {
      userPrompt += `\n- 时间框架：${validated.timeframe}`;
    }

    if (validated.skills && Object.keys(validated.skills).length > 0) {
      userPrompt += '\n\n技能水平：\n';
      Object.entries(validated.skills).forEach(([skill, level]) => {
        userPrompt += `- ${skill}：${level}/100\n`;
      });
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式输出（避免invoke的参数问题）
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

    // 提取JSON内容
    const content = fullContent.trim();
    let idpData;

    // 尝试提取JSON
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        idpData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        // 如果解析失败，创建默认结构
        idpData = {
          overallGoal: '基于员工能力提升目标',
          timeframe: validated.timeframe || '6个月',
          skillsGap: [],
          developments: [],
          trainings: [],
          confidence: 80,
        };
      }
    } else {
      // 如果没有找到JSON，创建默认结构
      idpData = {
        overallGoal: content.slice(0, 200),
        timeframe: validated.timeframe || '6个月',
        skillsGap: [],
        developments: [],
        trainings: [],
        confidence: 70,
      };
    }

    // 添加元数据
    const idp = {
      employeeId: validated.employeeId,
      employeeName: validated.employeeName,
      currentPosition: validated.position,
      targetPosition: validated.targetPosition,
      generatedAt: new Date().toISOString(),
      ...idpData,
    };

    return NextResponse.json({
      success: true,
      message: 'IDP生成成功',
      idp,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('生成IDP错误:', error);
    return NextResponse.json(
      { error: '生成IDP失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
