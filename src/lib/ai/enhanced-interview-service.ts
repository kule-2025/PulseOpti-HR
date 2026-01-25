/**
 * AI智能面试增强服务
 * 提供面试题库生成、智能推荐、模拟面试、多维度评分等功能
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface Question {
  id: string;
  question: string;
  type: QuestionType;
  category: string;
  difficulty: Difficulty;
  dimension: string[];
  timeLimit: number;
  evaluationCriteria: string;
  followUpQuestions: string[];
  rationale: string;
  tags: string[];
  relatedSkills: string[];
  expectedAnswer?: string;
}

type QuestionType =
  | 'behavioral'      // 行为面试
  | 'technical'       // 技术面试
  | 'situational'     // 情景面试
  | 'cultural'        // 文化契合
  | 'leadership'      // 领导力
  | 'communication'   // 沟通能力
  | 'problem_solving' // 问题解决
  | 'teamwork'        // 团队协作
  | 'innovation'      // 创新能力
  | 'adaptability';   // 适应能力

type Difficulty = 'junior' | 'middle' | 'senior' | 'expert';

interface InterviewContext {
  candidate: {
    name: string;
    education: string;
    workExperience: string;
    skills: string[];
    position?: string;
  };
  job: {
    title: string;
    description: string;
    requirements: string;
    benefits: string;
  };
  company?: {
    industry: string;
    size: string;
    culture: string;
  };
}

interface QuestionGenerationOptions {
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  questionCount: number;
  focusAreas?: string[];
  timeLimit?: number;
  includeExpectedAnswer?: boolean;
}

interface EvaluationResult {
  overallScore: number;
  dimensionScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  keyObservations: string[];
  overallFeedback: string;
  recommendation: 'strongly_recommend' | 'recommend' | 'consider' | 'not_recommend';
  nextSteps: string[];
  tags: string[];
  detailedAnalysis?: {
    answerQuality: number;
    depth: number;
    clarity: number;
    relevance: number;
    examples: number;
    confidence: number;
  };
}

interface MockInterviewSession {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  questions: Question[];
  answers: Array<{
    questionId: string;
    answer: string;
    evaluation?: EvaluationResult;
    timestamp: number;
  }>;
  overallScore?: number;
  recommendations?: string[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export class EnhancedInterviewService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
    this.llmClient = new LLMClient(config);
  }

  /**
   * 智能生成面试问题（增强版）
   */
  async generateQuestions(
    context: InterviewContext,
    options: QuestionGenerationOptions
  ): Promise<{ questions: Question[]; summary: any }> {
    const systemPrompt = this.buildQuestionGenerationSystemPrompt(options);
    const userPrompt = this.buildQuestionGenerationUserPrompt(context, options);

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    return this.parseQuestionsResponse(response.content);
  }

  /**
   * 从题库推荐问题
   */
  async recommendQuestions(
    context: InterviewContext,
    questionCount: number = 5
  ): Promise<Question[]> {
    const systemPrompt = `你是一名专业的面试专家，擅长根据候选人背景和职位要求，从题库中推荐最合适的面试问题。

推荐原则：
1. 问题要与候选人背景匹配
2. 问题要与职位要求相关
3. 问题要有区分度和针对性
4. 避免重复和相似问题
5. 考虑问题的难度梯度

返回格式（JSON数组）：
[
  {
    "id": "q-001",
    "question": "问题内容",
    "type": "问题类型",
    "category": "问题分类",
    "difficulty": "难度级别",
    "dimension": ["考察维度"],
    "timeLimit": 5,
    "evaluationCriteria": "评估标准",
    "tags": ["标签"],
    "relatedSkills": ["相关技能"]
  }
]`;

    const userPrompt = `请为以下候选人和职位推荐${questionCount}个最合适的面试问题：

【候选人信息】
姓名：${context.candidate.name}
教育背景：${context.candidate.education}
工作年限：${context.candidate.workExperience}
技能：${context.candidate.skills.join(', ')}

【职位信息】
职位名称：${context.job.title}
职位描述：${context.job.description}
任职要求：${context.job.requirements}

请推荐${questionCount}个最合适的面试问题。`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.6,
    });

    return this.parseQuestionsList(response.content);
  }

  /**
   * 创建模拟面试会话
   */
  async createMockInterview(
    candidateId: string,
    jobId: string,
    context: InterviewContext,
    options: QuestionGenerationOptions
  ): Promise<MockInterviewSession> {
    const sessionId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 生成面试问题
    const { questions } = await this.generateQuestions(context, options);

    const session: MockInterviewSession = {
      id: sessionId,
      candidateId,
      jobId,
      status: 'pending',
      questions,
      answers: [],
      createdAt: Date.now(),
    };

    return session;
  }

  /**
   * 开始模拟面试
   */
  async startMockInterview(sessionId: string): Promise<void> {
    // 更新会话状态
    // 实际实现需要存储层
  }

  /**
   * 提交答案并评估
   */
  async submitAnswer(
    session: MockInterviewSession,
    questionId: string,
    answer: string,
    context?: InterviewContext
  ): Promise<EvaluationResult> {
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('问题不存在');
    }

    // 评估答案
    const evaluation = await this.evaluateAnswer(
      {
        question: question.question,
        answer,
        questionType: question.type,
        expectedAnswer: question.expectedAnswer,
        dimensions: question.dimension,
      },
      context
    );

    // 记录答案
    session.answers.push({
      questionId,
      answer,
      evaluation,
      timestamp: Date.now(),
    });

    return evaluation;
  }

  /**
   * 完成模拟面试
   */
  async completeMockInterview(session: MockInterviewSession): Promise<{
    overallScore: number;
    detailedReport: any;
    recommendations: string[];
  }> {
    // 计算总体评分
    const overallScore = this.calculateOverallScore(session);

    // 生成详细报告
    const detailedReport = await this.generateInterviewReport(session);

    // 生成推荐建议
    const recommendations = await this.generateRecommendations(session);

    // 更新会话状态
    session.status = 'completed';
    session.completedAt = Date.now();
    session.overallScore = overallScore;
    session.recommendations = recommendations;

    return {
      overallScore,
      detailedReport,
      recommendations,
    };
  }

  /**
   * 评估候选人回答（增强版）
   */
  async evaluateAnswer(
    params: {
      question: string;
      answer: string;
      questionType: QuestionType;
      expectedAnswer?: string;
      dimensions: string[];
      context?: string;
    },
    interviewContext?: InterviewContext
  ): Promise<EvaluationResult> {
    const systemPrompt = this.buildEvaluationSystemPrompt();
    const userPrompt = this.buildEvaluationUserPrompt(params, interviewContext);

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
    });

    return this.parseEvaluationResponse(response.content);
  }

  /**
   * 生成面试报告
   */
  async generateInterviewReport(session: MockInterviewSession): Promise<any> {
    const systemPrompt = `你是一名专业的HR面试报告生成专家，擅长对面试过程进行全面分析，生成结构化、可视化的面试报告。

报告内容要求：
1. 面试概览（基本信息、时间、状态）
2. 问题回答分析（每个问题的评分和反馈）
3. 能力雷达图（各维度得分）
4. 优势分析
5. 待提升项
6. 综合评价
7. 录用建议

返回格式（JSON）：
{
  "overview": {
    "candidateName": "候选人姓名",
    "jobTitle": "职位名称",
    "duration": "面试时长",
    "questionCount": "问题数量",
    "status": "面试状态"
  },
  "questionsAnalysis": [
    {
      "question": "问题内容",
      "answer": "回答摘要",
      "score": 85,
      "dimensionScores": {},
      "feedback": "反馈"
    }
  ],
  "abilityRadar": {
    "逻辑思维": 85,
    "表达能力": 80,
    "问题解决": 88,
    "专业知识": 82,
    "经验匹配": 78
  },
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["待提升1", "待提升2"],
  "overallEvaluation": "综合评价",
  "recommendation": "录用建议",
  "tags": ["标签"]
}`;

    const userPrompt = `请生成以下模拟面试的详细报告：

【面试概览】
会话ID：${session.id}
问题数量：${session.questions.length}
已完成问题：${session.answers.length}
总体评分：${session.overallScore || '未评分'}

【问题回答详情】
${session.answers.map((a, i) => {
  const q = session.questions[i];
  return `
问题${i + 1}：${q.question}
回答：${a.answer}
评分：${a.evaluation?.overallScore}
评估：${a.evaluation?.overallFeedback}
`;
}).join('\n')}

【推荐建议】
${session.recommendations?.join('\n') || '无'}`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.5,
    });

    return JSON.parse(this.extractJson(response.content));
  }

  /**
   * 生成推荐建议
   */
  async generateRecommendations(session: MockInterviewSession): Promise<string[]> {
    const systemPrompt = `你是一名专业的招聘顾问，擅长根据面试表现，提供针对性的招聘建议。

建议类型：
1. 录用建议（强烈推荐、推荐、可以考虑、不推荐）
2. 面试下一步建议
3. 薪资建议
4. 入职后培养建议

返回格式（JSON数组）：
[
  "建议1",
  "建议2",
  "建议3"
]`;

    const userPrompt = `请根据以下面试表现，提供招聘建议：

【候选人表现】
总体评分：${session.overallScore || '未评分'}
完成问题数：${session.answers.length}

【问题评分】
${session.answers.map((a, i) => `问题${i + 1}：${a.evaluation?.overallScore}分`).join('\n')}

请提供3-5条具体的招聘建议。`;

    const response = await this.llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.6,
    });

    return JSON.parse(this.extractJson(response.content));
  }

  // ==================== 私有方法 ====================

  private buildQuestionGenerationSystemPrompt(options: QuestionGenerationOptions): string {
    return `你是一名专业的HR面试专家，擅长设计精准、有针对性的面试问题。

问题类型说明：
- behavioral（行为面试）：通过过往行为预测未来表现，使用STAR法则
- technical（技术面试）：考察专业技能和技术深度
- situational（情景面试）：通过假设情景考察应变能力
- cultural（文化契合）：考察价值观和文化匹配度
- leadership（领导力）：考察领导和管理能力
- communication（沟通能力）：考察表达和沟通技巧
- problem_solving（问题解决）：考察分析和解决问题的能力
- teamwork（团队协作）：考察团队合作精神
- innovation（创新能力）：考察创新思维和创造力
- adaptability（适应能力）：考察学习和适应变化的能力

问题设计原则：
- 问题要具体、开放、有针对性
- 避免引导性问题和是非题
- 每个问题都要有明确的评估维度
- 根据候选人的经历定制问题
- 难度要与职位等级匹配

返回格式（JSON）：
{
  "questions": [
    {
      "id": "q-001",
      "question": "问题内容",
      "type": "问题类型",
      "category": "问题分类",
      "difficulty": "难度级别",
      "dimension": ["考察维度1", "考察维度2"],
      "timeLimit": 5,
      "evaluationCriteria": "评估标准",
      "followUpQuestions": ["追问1", "追问2"],
      "rationale": "设计理由",
      "tags": ["标签"],
      "relatedSkills": ["技能1", "技能2"],
      "expectedAnswer": "期望答案（可选）"
    }
  ],
  "summary": {
    "totalQuestions": 10,
    "typeDistribution": {
      "behavioral": 3,
      "technical": 4
    },
    "focusAreas": ["重点领域"],
    "estimatedTime": "预计用时"
  }
}`;
  }

  private buildQuestionGenerationUserPrompt(
    context: InterviewContext,
    options: QuestionGenerationOptions
  ): string {
    return `请为以下候选人设计面试问题：

【候选人信息】
姓名：${context.candidate.name}
教育背景：${context.candidate.education}
工作年限：${context.candidate.workExperience}年
技能：${context.candidate.skills.join(', ')}

【职位信息】
职位名称：${context.job.title}
职位描述：${context.job.description}
任职要求：${context.job.requirements}

【面试要求】
问题类型：${options.questionTypes.join(', ')}
难度级别：${options.difficulty}
问题数量：${options.questionCount}
重点考察领域：${options.focusAreas?.join(', ') || '全面考察'}
${options.includeExpectedAnswer ? '包含期望答案：是' : ''}

请根据候选人背景和职位要求，生成${options.questionCount}个有针对性的面试问题。`;
  }

  private buildEvaluationSystemPrompt(): string {
    return `你是一名专业的HR面试评估专家，擅长对候选人的回答进行精准、客观的多维度评估。

评估维度说明：
- 逻辑思维：回答的逻辑性、条理性、分析能力
- 表达能力：语言的清晰度、流畅度、专业性
- 问题解决：解决问题的思路、方法、效果
- 专业知识：相关知识的掌握程度、深度
- 经验匹配：过往经验与岗位的匹配度
- 沟通能力：互动性、倾听能力、反馈意识
- 团队协作：团队意识、合作精神
- 创新能力：创新思维、解决方案的创新性
- 情绪管理：情绪稳定性、压力应对能力
- 学习能力：学习速度、适应能力

评估原则：
- 客观公正，基于事实和数据
- 关注实质内容而非表面形式
- 考虑候选人的背景和经验
- 评估要有层次感和区分度
- 提供建设性的反馈

返回格式（JSON）：
{
  "overallScore": 85,
  "dimensionScores": {
    "逻辑思维": 90,
    "表达能力": 85,
    "问题解决": 80,
    "专业知识": 88,
    "经验匹配": 82
  },
  "strengths": ["优势1", "优势2", "优势3"],
  "improvements": ["改进1", "改进2", "改进3"],
  "keyObservations": ["观察1", "观察2"],
  "overallFeedback": "整体表现优秀",
  "recommendation": "strongly_recommend",
  "nextSteps": ["下一步1", "下一步2"],
  "tags": ["标签1", "标签2"],
  "detailedAnalysis": {
    "answerQuality": 85,
    "depth": 80,
    "clarity": 88,
    "relevance": 85,
    "examples": 82,
    "confidence": 80
  }
}

recommendation取值：
- strongly_recommend：强烈推荐
- recommend：推荐
- consider：可以考虑
- not_recommend：不推荐`;
  }

  private buildEvaluationUserPrompt(
    params: any,
    context?: InterviewContext
  ): string {
    let prompt = `请评估以下面试回答：

【面试问题】
问题：${params.question}
问题类型：${params.questionType}

【候选人回答】
${params.answer}

【评估维度】
${params.dimensions.join(', ')}
${params.expectedAnswer ? `\n期望答案：${params.expectedAnswer}` : ''}
${params.context ? `\n额外上下文：${params.context}` : ''}`;

    if (context) {
      prompt += `

【职位信息】
职位名称：${context.job.title}
职位要求：${context.job.requirements}

【候选人信息】
候选人姓名：${context.candidate.name}
工作年限：${context.candidate.workExperience}年
技能：${context.candidate.skills.join(', ')}`;
    }

    return prompt + '\n\n请对候选人的回答进行全面评估，提供详细的评分和反馈。';
  }

  private parseQuestionsResponse(content: string): any {
    const jsonStr = this.extractJson(content);
    return JSON.parse(jsonStr);
  }

  private parseQuestionsList(content: string): Question[] {
    const jsonStr = this.extractJson(content);
    return JSON.parse(jsonStr);
  }

  private parseEvaluationResponse(content: string): EvaluationResult {
    const jsonStr = this.extractJson(content);
    return JSON.parse(jsonStr);
  }

  private calculateOverallScore(session: MockInterviewSession): number {
    if (session.answers.length === 0) return 0;

    const totalScore = session.answers.reduce((sum, a) => {
      return sum + (a.evaluation?.overallScore || 0);
    }, 0);

    return Math.round(totalScore / session.answers.length);
  }

  private extractJson(content: string): string {
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? jsonMatch[0] : content;
  }
}

// 导出单例
export const enhancedInterviewService = new EnhancedInterviewService();
