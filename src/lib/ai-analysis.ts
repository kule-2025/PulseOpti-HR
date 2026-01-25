import { LLMClient, Config } from 'coze-coding-dev-sdk';

const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const client = new LLMClient(config);

export interface AnalysisRequest {
  type: 'employee' | 'recruitment' | 'performance' | 'salary' | 'attendance';
  data: any;
  question?: string;
}

/**
 * AI智能分析服务
 * 提供HR相关的智能分析和建议
 */
export class AIAnalysisService {
  /**
   * 分析员工数据
   */
  async analyzeEmployees(data: {
    totalEmployees: number;
    activeEmployees: number;
    probationEmployees: number;
    resignedEmployees: number;
    avgSalary: number;
    departmentStats: any[];
  }): Promise<string> {
    const prompt = `作为一位资深HR专家，请分析以下员工数据并提供专业建议：

**员工概况：**
- 总人数：${data.totalEmployees}人
- 在职人数：${data.activeEmployees}人
- 试用期人数：${data.probationEmployees}人
- 离职人数：${data.resignedEmployees}人
- 平均薪资：${data.avgSalary}元

**部门分布：**
${data.departmentStats.map((dept: any, i: number) => `${i + 1}. ${dept.departmentName}: ${dept.employeeCount}人，平均薪资${dept.avgSalary}元`).join('\n')}

请从以下维度进行分析：
1. 员工结构和离职风险
2. 薪资合理性分析
3. 部门资源配置优化建议
4. 人才发展策略建议
5. 具体可执行的行动建议

请用简洁、专业的语言给出分析报告。`;

    const messages = [
      {
        role: 'system',
        content: '你是一位资深的HR管理专家，拥有10年以上的企业人力资源管理经验，擅长数据分析、人才发展和组织优化。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ] as const;

    const stream = client.stream(messages as any, { temperature: 0.7 });

    let response = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        response += chunk.content.toString();
      }
    }

    return response;
  }

  /**
   * 分析招聘数据
   */
  async analyzeRecruitment(data: {
    totalJobs: number;
    openJobs: number;
    totalCandidates: number;
    totalInterviews: number;
    interviewRate: number;
    hireRate: number;
  }): Promise<string> {
    const prompt = `作为招聘专家，请分析以下招聘数据：

**招聘概况：**
- 职位总数：${data.totalJobs}个
- 开放中职位：${data.openJobs}个
- 候选人总数：${data.totalCandidates}人
- 面试次数：${data.totalInterviews}次
- 面试率：${data.interviewRate}%
- 录用率：${data.hireRate}%

请从以下维度进行分析：
1. 招聘效率评估
2. 候选人质量分析
3. 面试流程优化建议
4. 提高录用率的策略
5. 具体可执行的行动建议

请用简洁、专业的语言给出分析报告。`;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一位资深的招聘专家，拥有丰富的招聘管理和人才寻访经验。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ] as const;

    const response = await client.invoke(messages as any, { temperature: 0.7 });
    return response.content;
  }

  /**
   * 分析绩效数据
   */
  async analyzePerformance(data: {
    completedRecords: number;
    pendingRecords: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
  }): Promise<string> {
    const prompt = `作为绩效管理专家，请分析以下绩效数据：

**绩效概况：**
- 已完成考核：${data.completedRecords}人
- 待完成考核：${data.pendingRecords}人
- 平均绩效分数：${data.avgScore}分
- 最高分数：${data.maxScore}分
- 最低分数：${data.minScore}分

请从以下维度进行分析：
1. 绩效整体水平评估
2. 员工绩效分布分析
3. 绩效改进方向建议
4. 激励机制优化建议
5. 具体可执行的行动建议

请用简洁、专业的语言给出分析报告。`;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一位资深的绩效管理专家，拥有丰富的绩效考核和员工发展经验。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ] as const;

    const response = await client.invoke(messages as any, { temperature: 0.7 });
    return response.content;
  }

  /**
   * 回答用户问题
   */
  async answerQuestion(question: string, context?: string): Promise<string> {
    const systemPrompt = context 
      ? `你是一位资深的HR管理顾问。请根据以下背景信息回答用户的问题：\n\n背景信息：\n${context}`
      : '你是一位资深的HR管理顾问，能够为各类人力资源管理问题提供专业建议。';

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      {
        role: 'user' as const,
        content: question
      }
    ] as const;

    const stream = client.stream(messages as any, { temperature: 0.8 });

    let response = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        response += chunk.content.toString();
      }
    }

    return response;
  }

  /**
   * 生成工作建议
   */
  async generateRecommendations(type: string, data: any): Promise<string> {
    let prompt = '';

    switch (type) {
      case 'employee_retention':
        prompt = `作为员工保留专家，请根据以下数据提供员工保留建议：\n${JSON.stringify(data, null, 2)}`;
        break;
      case 'salary_optimization':
        prompt = `作为薪酬管理专家，请根据以下数据提供薪资优化建议：\n${JSON.stringify(data, null, 2)}`;
        break;
      case 'performance_improvement':
        prompt = `作为绩效改进专家，请根据以下数据提供绩效改进建议：\n${JSON.stringify(data, null, 2)}`;
        break;
      default:
        prompt = `作为HR管理专家，请根据以下数据提供专业建议：\n${JSON.stringify(data, null, 2)}`;
    }

    const messages = [
      {
        role: 'system' as const,
        content: '你是一位资深的HR管理顾问，擅长数据分析和解决方案制定。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ] as const;

    const response = await client.invoke(messages as any, { temperature: 0.7 });
    return response.content;
  }

  /**
   * 流式分析（用于实时展示）
   */
  async *streamAnalysis(type: string, data: any): AsyncGenerator<string> {
    let prompt = '';

    switch (type) {
      case 'employee':
        prompt = `分析员工数据：\n${JSON.stringify(data, null, 2)}`;
        break;
      case 'recruitment':
        prompt = `分析招聘数据：\n${JSON.stringify(data, null, 2)}`;
        break;
      case 'performance':
        prompt = `分析绩效数据：\n${JSON.stringify(data, null, 2)}`;
        break;
      default:
        prompt = `分析数据：\n${JSON.stringify(data, null, 2)}`;
    }

    const messages = [
      {
        role: 'system',
        content: '你是一位资深的HR管理专家。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ] as const;

    const stream = client.stream(messages as any, { temperature: 0.7 });

    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content.toString();
      }
    }
  }
}

// 导出单例
export const aiAnalysisService = new AIAnalysisService();
