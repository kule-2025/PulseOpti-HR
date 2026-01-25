import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 问题类型
enum QuestionType {
  BEHAVIORAL = 'behavioral', // 行为面试
  TECHNICAL = 'technical', // 技术面试
  SITUATIONAL = 'situational', // 情景面试
  CULTURAL = 'cultural', // 文化契合度
  CASE_STUDY = 'case_study', // 案例分析
  LEADERSHIP = 'leadership', // 领导力
  COMMUNICATION = 'communication', // 沟通能力
  PROBLEM_SOLVING = 'problem_solving', // 问题解决
}

// 难度级别
enum Difficulty {
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

// 面试问题
interface InterviewQuestion {
  id: string;
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  position: string[];
  department?: string;
  timeLimit?: number; // 分钟
  idealAnswer?: string;
  evaluationCriteria: Array<{
    dimension: string;
    description: string;
    weight: number; // 权重 0-100
  }>;
  followUpQuestions?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 面试问题库
interface QuestionBank {
  id: string;
  name: string;
  description: string;
  type: QuestionType;
  questions: string[]; // 问题ID列表
  companyId: string;
  isPublic: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 模拟问题存储
let questions: InterviewQuestion[] = [];
let questionBanks: QuestionBank[] = [];

// 初始化一些示例问题
function initializeQuestions() {
  if (questions.length === 0) {
    const sampleQuestions: InterviewQuestion[] = [
      {
        id: 'q-001',
        question: '请分享一个你成功解决复杂问题的经历。',
        type: QuestionType.BEHAVIORAL,
        difficulty: Difficulty.MIDDLE,
        category: '问题解决',
        tags: ['STAR', '问题分析', '执行力'],
        position: ['软件工程师', '产品经理', '项目经理'],
        timeLimit: 5,
        idealAnswer: '使用STAR法则描述情境、任务、行动、结果，展现问题分析和解决能力。',
        evaluationCriteria: [
          { dimension: '问题分析能力', description: '能否清晰识别问题根源', weight: 30 },
          { dimension: '解决方案质量', description: '解决方案是否有效和创新', weight: 30 },
          { dimension: '执行力', description: '能否有效推动方案实施', weight: 25 },
          { dimension: '结果导向', description: '是否关注最终结果', weight: 15 },
        ],
        followUpQuestions: [
          '你当时考虑过哪些替代方案？',
          '如果现在再遇到类似问题，你会如何改进？',
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
      {
        id: 'q-002',
        question: '请描述一次你与团队成员产生分歧的经历，你是如何处理的？',
        type: QuestionType.BEHAVIORAL,
        difficulty: Difficulty.MIDDLE,
        category: '团队协作',
        tags: ['冲突管理', '沟通', '协作'],
        position: ['软件工程师', '产品经理', '设计师'],
        timeLimit: 5,
        idealAnswer: '展现良好的沟通能力、冲突处理技巧和团队协作精神。',
        evaluationCriteria: [
          { dimension: '情绪管理', description: '能否控制情绪，保持理性', weight: 25 },
          { dimension: '沟通技巧', description: '能否有效倾听和表达', weight: 30 },
          { dimension: '解决问题', description: '能否找到双赢解决方案', weight: 30 },
          { dimension: '团队意识', description: '是否以团队利益为重', weight: 15 },
        ],
        followUpQuestions: [
          '最终结果如何？团队关系是否受到影响？',
          '你会采用不同的处理方式吗？',
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
      {
        id: 'q-003',
        question: '请解释一下微服务架构的优缺点。',
        type: QuestionType.TECHNICAL,
        difficulty: Difficulty.SENIOR,
        category: '架构设计',
        tags: ['微服务', '架构', '分布式系统'],
        position: ['架构师', '技术经理', '高级软件工程师'],
        timeLimit: 8,
        idealAnswer: '全面理解微服务的优势和挑战，能结合实际项目经验说明。',
        evaluationCriteria: [
          { dimension: '知识深度', description: '对微服务架构的理解程度', weight: 40 },
          { dimension: '实践经验', description: '是否有实际应用经验', weight: 30 },
          { dimension: '批判性思维', description: '能否客观评价优缺点', weight: 20 },
          { dimension: '表达能力', description: '能否清晰阐述技术概念', weight: 10 },
        ],
        followUpQuestions: [
          '在什么情况下不推荐使用微服务？',
          '你们项目中是如何解决服务间通信问题的？',
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
      {
        id: 'q-004',
        question: '如果团队中的项目进度落后于计划，你会如何处理？',
        type: QuestionType.SITUATIONAL,
        difficulty: Difficulty.MIDDLE,
        category: '项目管理',
        tags: ['项目管理', '问题解决', '领导力'],
        position: ['项目经理', '技术经理'],
        timeLimit: 6,
        idealAnswer: '展现项目管理能力、风险应对和领导力。',
        evaluationCriteria: [
          { dimension: '问题诊断', description: '能否准确分析进度落后的原因', weight: 25 },
          { dimension: '应对策略', description: '是否制定有效的应对措施', weight: 35 },
          { dimension: '领导力', description: '能否有效协调资源和支持团队', weight: 25 },
          { dimension: '沟通协调', description: '能否及时与相关方沟通', weight: 15 },
        ],
        followUpQuestions: [
          '你会优先采取哪些措施？',
          '如何平衡质量和进度？',
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
      {
        id: 'q-005',
        question: '你认为什么样的企业文化是理想的？为什么？',
        type: QuestionType.CULTURAL,
        difficulty: Difficulty.MIDDLE,
        category: '文化契合',
        tags: ['企业文化', '价值观', '职业态度'],
        position: ['所有职位'],
        timeLimit: 4,
        idealAnswer: '展现对公司文化的理解和认同，价值观匹配。',
        evaluationCriteria: [
          { dimension: '文化理解', description: '对企业文化的理解深度', weight: 30 },
          { dimension: '价值观契合', description: '个人价值观是否与公司匹配', weight: 35 },
          { dimension: '职业态度', description: '是否展现积极的工作态度', weight: 20 },
          { dimension: '表达清晰', description: '能否清晰表达观点', weight: 15 },
        ],
        followUpQuestions: [
          '你过去的公司文化是怎样的？你有什么看法？',
          '你会为营造理想的企业文化做出什么贡献？',
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
    ];

    questions = sampleQuestions;
  }
}

initializeQuestions();

// 创建问题Schema
const createQuestionSchema = z.object({
  question: z.string(),
  type: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(Difficulty),
  category: z.string(),
  tags: z.array(z.string()),
  position: z.array(z.string()),
  department: z.string().optional(),
  timeLimit: z.number().optional(),
  idealAnswer: z.string().optional(),
  evaluationCriteria: z.array(z.object({
    dimension: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(100),
  })),
  followUpQuestions: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  createdBy: z.string(),
});

// 创建问题库Schema
const createQuestionBankSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.nativeEnum(QuestionType),
  questions: z.array(z.string()),
  companyId: z.string(),
  isPublic: z.boolean().default(false),
});

/**
 * GET /api/interview/questions - 获取面试问题列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const position = searchParams.get('position');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredQuestions = [...questions];

    // 按类型过滤
    if (type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === type);
    }

    // 按难度过滤
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    // 按类别过滤
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }

    // 按职位过滤
    if (position) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.position.includes(position) || q.position.includes('所有职位')
      );
    }

    // 按状态过滤
    if (active !== null && active !== undefined) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.active === (active === 'true')
      );
    }

    // 分页
    const paginatedQuestions = filteredQuestions.slice(offset, offset + limit);

    // 统计信息
    const statistics = {
      total: filteredQuestions.length,
      byType: filteredQuestions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: filteredQuestions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: filteredQuestions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: paginatedQuestions,
      statistics,
      pagination: {
        total: filteredQuestions.length,
        limit,
        offset,
        hasMore: offset + limit < filteredQuestions.length,
      },
    });
  } catch (error) {
    console.error('获取面试问题列表错误:', error);
    return NextResponse.json(
      { error: '获取面试问题列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview/questions - 创建面试问题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createQuestionSchema.parse(body);

    const newQuestion: InterviewQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: validated.question,
      type: validated.type,
      difficulty: validated.difficulty,
      category: validated.category,
      tags: validated.tags,
      position: validated.position,
      department: validated.department,
      timeLimit: validated.timeLimit,
      idealAnswer: validated.idealAnswer,
      evaluationCriteria: validated.evaluationCriteria,
      followUpQuestions: validated.followUpQuestions,
      active: validated.active,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: validated.createdBy,
    };

    questions.push(newQuestion);

    return NextResponse.json({
      success: true,
      message: '面试问题创建成功',
      data: newQuestion,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('创建面试问题错误:', error);
    return NextResponse.json(
      { error: '创建面试问题失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
