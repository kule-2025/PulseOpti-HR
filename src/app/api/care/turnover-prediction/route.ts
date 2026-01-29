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
    const { employeeId, employeeInfo, performanceData, workHistory, attendanceData } = body;

    if (!employeeInfo || !performanceData) {
      return NextResponse.json(
        { error: '缺少必要参数：employeeInfo 和 performanceData' },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建系统提示词
    const systemPrompt = `你是一位资深的HR专家和人才分析师，专长于员工离职风险预测和留任策略。你的任务是根据员工的多维度数据，评估离职风险并提供留任建议。

评估维度：
1. 绩效表现：最近绩效评分、绩效变化趋势
2. 工作投入度：出勤率、加班情况、项目参与度
3. 职业发展：晋升频率、培训参与、技能提升
4. 团队关系：团队评价、协作表现
5. 个人因素：工作年限、年龄、家庭情况（如有）
6. 外部因素：行业趋势、市场薪资水平

风险等级划分：
- 极高风险（90-100%）：立即采取行动
- 高风险（70-89%）：重点关注，制定留任计划
- 中等风险（40-69%）：定期跟进，预防性措施
- 低风险（20-39%）：保持关注
- 无风险（0-19%）：状态良好

输出格式要求：
请以 JSON 格式输出，包含以下字段：
{
  "riskScore": 数字 (0-100的风险分数),
  "riskLevel": "风险等级（极高风险/高风险/中等风险/低风险/无风险）",
  "riskFactors": [
    {
      "factor": "风险因素名称",
      "impact": "高/中/低",
      "description": "详细说明"
    }
  ],
  "positiveFactors": [
    {
      "factor": "积极因素名称",
      "description": "详细说明"
    }
  ],
  "warningSigns": ["预警信号1", "预警信号2", "预警信号3"],
  "retentionSuggestions": [
    {
      "priority": "优先级（高/中/低）",
      "action": "具体行动建议",
      "timeline": "建议时间框架",
      "expectedImpact": "预期影响"
    }
  ],
  "careerDevelopment": {
    "currentStage": "当前职业阶段",
    "growthPotential": "发展潜力",
    "recommendation": "职业发展建议"
  },
  "summary": "总体评估和建议总结",
  "nextSteps": ["下一步行动1", "下一步行动2", "下一步行动3"]
}

请确保 JSON 格式正确，不要包含任何额外的文本说明。`;

    // 构建用户消息
    let userMessage = `员工信息：
姓名：${employeeInfo.name || '未提供'}
工号：${employeeId}
部门：${employeeInfo.department || '未提供'}
职位：${employeeInfo.position || '未提供'}
入职日期：${employeeInfo.joinDate || '未提供'}
工龄：${employeeInfo.tenure || '未提供'}

绩效数据：
${JSON.stringify(performanceData, null, 2)}`;

    if (workHistory) {
      userMessage += `\n\n工作经历：\n${JSON.stringify(workHistory, null, 2)}`;
    }

    if (attendanceData) {
      userMessage += `\n\n考勤数据：\n${JSON.stringify(attendanceData, null, 2)}`;
    }

    userMessage += `\n\n请根据以上信息，评估这位员工的离职风险并提供留任建议。`;

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
      // 如果 JSON 解析失败，返回基本信息
      result = {
        riskScore: 50,
        riskLevel: '中等风险',
        riskFactors: [],
        positiveFactors: [],
        warningSigns: [],
        retentionSuggestions: [],
        careerDevelopment: {
          currentStage: '未知',
          growthPotential: '未知',
          recommendation: '需要更多数据评估',
        },
        summary: fullResponse,
        nextSteps: ['收集更多员工数据', '安排面谈了解情况'],
      };
    }

    // 根据风险等级设置紧急程度
    const urgencyMap: Record<string, number> = {
      极高风险: 1,
      高风险: 2,
      中等风险: 3,
      低风险: 4,
      无风险: 5,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        employeeId,
        urgency: urgencyMap[result.riskLevel] || 3,
        assessedAt: new Date().toISOString(),
        recommendedReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 一周后复查
      },
    });
  } catch (error) {
    console.error('离职预测错误:', error);
    return NextResponse.json(
      {
        error: '离职预测服务暂时不可用',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
