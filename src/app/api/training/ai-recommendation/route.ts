import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 培训类型
enum TrainingType {
  ONLINE = 'online', // 在线课程
  OFFLINE = 'offline', // 线下培训
  WORKSHOP = 'workshop', // 工作坊
  MENTORSHIP = 'mentorship', // 导师制
  WEBINAR = 'webinar', // 网络研讨会
  E_LEARNING = 'e_learning', // 电子学习
  SELF_PACED = 'self_paced', // 自主学习
  BLENDED = 'blended', // 混合式学习
}

// 培训课程
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  type: TrainingType;
  category: string;
  tags: string[];
  skills: string[];
  duration: number; // 小时
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  provider: string;
  rating: number; // 0-5
  reviews: number;
  price?: number;
  prerequisites?: string[];
  learningObjectives: string[];
  targetAudience: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 学习路径节点
interface LearningPathNode {
  id: string;
  courseId: string;
  courseTitle: string;
  type: TrainingType;
  order: number;
  dependencies?: string[]; // 前置课程ID
  estimatedDuration: number; // 小时
  recommended?: boolean;
  required?: boolean;
  notes?: string;
}

// 学习路径
interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetRole?: string; // 目标职位
  targetSkills: string[]; // 目标技能
  skillLevel?: string; // 目标水平
  nodes: LearningPathNode[];
  totalDuration: number;
  estimatedCompletionTime: string; // 例如：3个月
  companyId: string;
  createdBy: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 个性化推荐
interface PersonalizedRecommendation {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentSkills: Record<string, number>; // 技能名称 -> 当前水平
  targetPosition?: string;
  targetSkills?: Record<string, number>; // 目标技能 -> 目标水平
  skillGaps: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendedCourses: Array<{
    course: Partial<TrainingCourse>;
    relevanceScore: number; // 0-100
    reason: string;
    expectedImpact: string;
  }>;
  learningPath?: LearningPath;
  timeline: {
    phase: string;
    courses: string[];
    duration: string;
  }[];
  mentorship?: {
    recommended: boolean;
    reason: string;
    suggestedMentors?: string[];
  };
  expectedOutcomes: string[];
  estimatedCompletionTime: string;
  createdAt: Date;
}

// 模拟培训课程存储
let trainingCourses: TrainingCourse[] = [];

// 初始化示例课程
function initializeCourses() {
  if (trainingCourses.length === 0) {
    const sampleCourses: TrainingCourse[] = [
      {
        id: 'course-001',
        title: '领导力基础培训',
        description: '针对新任管理者设计的领导力基础课程，涵盖团队管理、沟通技巧、决策能力等核心技能。',
        type: TrainingType.WORKSHOP,
        category: '领导力',
        tags: ['管理', '团队协作', '沟通'],
        skills: ['领导力', '团队管理', '沟通能力', '决策能力'],
        duration: 16,
        difficulty: 'intermediate',
        provider: '内部培训',
        rating: 4.5,
        reviews: 128,
        learningObjectives: [
          '理解领导力的核心要素',
          '掌握团队管理的基本方法',
          '提升沟通协调能力',
          '学习有效的决策技巧',
        ],
        targetAudience: ['新任管理者', '项目经理'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-002',
        title: 'Python数据分析进阶',
        description: '深入学习Python数据分析，包括数据清洗、可视化、机器学习基础等内容。',
        type: TrainingType.ONLINE,
        category: '技术',
        tags: ['Python', '数据分析', '机器学习'],
        skills: ['Python', '数据分析', '数据可视化', '机器学习'],
        duration: 40,
        difficulty: 'advanced',
        provider: '在线学习平台',
        rating: 4.7,
        reviews: 256,
        price: 2999,
        learningObjectives: [
          '掌握Python数据分析库',
          '学习数据清洗和处理技巧',
          '创建专业的数据可视化',
          '了解机器学习基础概念',
        ],
        targetAudience: ['数据分析师', '软件工程师', '产品经理'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-003',
        title: '项目管理PMP认证培训',
        description: '系统学习项目管理知识体系，为PMP认证考试做好准备。',
        type: TrainingType.OFFLINE,
        category: '项目管理',
        tags: ['PMP', '项目管理', '认证'],
        skills: ['项目管理', '风险管理', '质量管理', '沟通管理'],
        duration: 35,
        difficulty: 'advanced',
        provider: '专业培训机构',
        rating: 4.8,
        reviews: 312,
        price: 5800,
        learningObjectives: [
          '掌握项目管理五大过程组',
          '理解十大知识领域',
          '学习项目管理最佳实践',
          '准备PMP认证考试',
        ],
        targetAudience: ['项目经理', '项目协调员'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-004',
        title: '商务沟通技巧',
        description: '提升职场沟通能力，包括演讲、谈判、汇报等场景下的沟通技巧。',
        type: TrainingType.WORKSHOP,
        category: '软技能',
        tags: ['沟通', '演讲', '谈判'],
        skills: ['沟通能力', '演讲技巧', '谈判技巧', '汇报能力'],
        duration: 12,
        difficulty: 'beginner',
        provider: '内部培训',
        rating: 4.3,
        reviews: 89,
        learningObjectives: [
          '提升商务演讲能力',
          '学习有效的谈判技巧',
          '掌握职场汇报要点',
          '增强跨部门沟通能力',
        ],
        targetAudience: ['所有职位'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-005',
        title: '敏捷开发实践',
        description: '深入学习敏捷开发方法论，包括Scrum、Kanban等实践框架。',
        type: TrainingType.BLENDED,
        category: '技术',
        tags: ['敏捷', 'Scrum', 'Kanban', '软件开发'],
        skills: ['敏捷开发', 'Scrum', 'Kanban', '项目管理'],
        duration: 24,
        difficulty: 'intermediate',
        provider: '内部培训',
        rating: 4.6,
        reviews: 178,
        learningObjectives: [
          '理解敏捷开发核心原则',
          '掌握Scrum框架实践',
          '学习Kanban方法',
          '在项目中应用敏捷开发',
        ],
        targetAudience: ['软件工程师', '项目经理', '产品经理'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    trainingCourses = sampleCourses;
  }
}

initializeCourses();

// 个性化推荐请求Schema
const recommendationSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  currentPosition: z.string().optional(),
  currentSkills: z.record(z.string(), z.number()),
  targetPosition: z.string().optional(),
  targetSkills: z.record(z.string(), z.number()).optional(),
  learningGoals: z.array(z.string()).optional(),
  preferredLearningStyle: z.enum(['online', 'offline', 'mixed']).optional(),
  availableTime: z.number().optional(), // 每周可用学习时间（小时）
  budgetLimit: z.number().optional(),
  includeMentorship: z.boolean().default(true),
  companyId: z.string(),
  requestedBy: z.string(),
});

// 学习路径生成Schema
const generatePathSchema = z.object({
  targetRole: z.string(),
  targetSkills: z.array(z.object({
    name: z.string(),
    requiredLevel: z.number(),
  })),
  currentSkills: z.record(z.string(), z.number()),
  learningStyle: z.enum(['online', 'offline', 'mixed']).optional(),
  durationPreference: z.enum(['1month', '3months', '6months', '1year']).optional(),
  companyId: z.string(),
  requestedBy: z.string(),
});

/**
 * POST /api/training/ai-recommendation - AI个性化培训推荐
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'generate_path') {
      return generateLearningPath(body);
    } else {
      return generateRecommendation(body);
    }
  } catch (error) {
    console.error('AI培训推荐错误:', error);
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 生成个性化推荐
async function generateRecommendation(body: any) {
  try {
    const validated = recommendationSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    // 计算技能差距
    const skillGaps = calculateSkillGaps(
      validated.currentSkills,
      validated.targetSkills || {}
    );

    // 调用AI生成推荐
    const systemPrompt = `你是一位专业的学习发展专家和培训顾问，擅长为员工制定个性化的学习发展计划。

请基于员工的技能状况和发展目标，提供个性化的培训推荐。

分析维度：
1. 技能差距分析：识别关键技能缺口
2. 学习风格匹配：根据偏好选择合适的培训形式
3. 时间安排：考虑可用时间制定合理的学习计划
4. 预算控制：在预算范围内选择最佳方案
5. 效果最大化：优先推荐高影响力的培训

推荐原则：
- 优先填补高优先级的技能差距
- 培训内容与当前职位和目标职位高度相关
- 考虑培训的难度递进和前置依赖
- 平衡在线学习和线下实践
- 考虑培训的成本效益比

输出格式要求JSON结构：
{
  "recommendedCourses": [
    {
      "courseId": "课程ID",
      "title": "课程标题",
      "type": "培训类型",
      "duration": 时长,
      "difficulty": "难度",
      "relevanceScore": 相关度(0-100),
      "reason": "推荐理由",
      "expectedImpact": "预期影响"
    }
  ],
  "learningPath": {
    "name": "学习路径名称",
    "description": "描述",
    "timeline": [
      {
        "phase": "阶段名称",
        "courses": ["课程1", "课程2"],
        "duration": "持续时间"
      }
    ]
  },
  "mentorship": {
    "recommended": true/false,
    "reason": "理由",
    "suggestedMentors": ["导师1", "导师2"]
  },
  "expectedOutcomes": ["成果1", "成果2"],
  "estimatedCompletionTime": "预计完成时间"
}`;

    let userPrompt = `请为以下员工制定个性化的培训推荐计划：

**员工信息：**
- 姓名：${validated.employeeName}
- 当前职位：${validated.currentPosition || '未指定'}
- 目标职位：${validated.targetPosition || '未指定'}
- 学习目标：${validated.learningGoals?.join('、') || '综合提升'}
- 偏好学习方式：${validated.preferredLearningStyle || '混合式'}
- 每周可用学习时间：${validated.availableTime || 5}小时
- 预算限制：${validated.budgetLimit ? `¥${validated.budgetLimit}` : '未限制'}
- 是否包含导师制：${validated.includeMentorship ? '是' : '否'}

**当前技能水平：**
`;
    Object.entries(validated.currentSkills).forEach(([skill, level]) => {
      userPrompt += `- ${skill}：${level}/100\n`;
    });

    if (validated.targetSkills && Object.keys(validated.targetSkills).length > 0) {
      userPrompt += '\n**目标技能水平：**\n';
      Object.entries(validated.targetSkills).forEach(([skill, level]) => {
        userPrompt += `- ${skill}：${level}/100\n`;
      });
    }

    userPrompt += '\n**技能差距分析：**\n';
    skillGaps.forEach(gap => {
      userPrompt += `- ${gap.skill}：当前${gap.currentLevel}，目标${gap.targetLevel}，差距${gap.gap}（${gap.priority === 'high' ? '高优先级' : gap.priority === 'medium' ? '中优先级' : '低优先级'}）\n`;
    });

    userPrompt += `\n**可用培训课程（前20个）：**\n${trainingCourses.slice(0, 20).map(c =>
      `- ${c.id}：${c.title}（${c.type}，${c.category}，${c.duration}小时，${c.difficulty}，评分${c.rating}）\n  技能：${c.skills.join('、')}\n  目标人群：${c.targetAudience.join('、')}`
    ).join('\n\n')}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      thinking: 'enabled',
      temperature: 0.7,
    });

    const content = response.content.trim();
    let recommendationData: any = {};

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        recommendationData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        recommendationData = createDefaultRecommendation(validated, skillGaps);
      }
    } else {
      recommendationData = createDefaultRecommendation(validated, skillGaps);
    }

    // 构建完整的推荐结果
    const result: PersonalizedRecommendation = {
      employeeId: validated.employeeId,
      employeeName: validated.employeeName,
      currentPosition: validated.currentPosition || '未指定',
      currentSkills: validated.currentSkills,
      targetPosition: validated.targetPosition,
      targetSkills: validated.targetSkills,
      skillGaps,
      recommendedCourses: (recommendationData.recommendedCourses || []).map((rec: any) => {
        const course = trainingCourses.find(c => c.id === rec.courseId);
        return {
          course: course || rec,
          relevanceScore: rec.relevanceScore || 80,
          reason: rec.reason || '与技能发展目标高度匹配',
          expectedImpact: rec.expectedImpact || '提升相关技能水平',
        };
      }),
      timeline: recommendationData.learningPath?.timeline || generateDefaultTimeline(validated.availableTime || 5),
      mentorship: recommendationData.mentorship || {
        recommended: validated.includeMentorship,
        reason: '有助于快速提升技能和积累经验',
      },
      expectedOutcomes: recommendationData.expectedOutcomes || [
        '填补关键技能差距',
        '提升工作表现',
        '为职业发展做好准备',
      ],
      estimatedCompletionTime: recommendationData.estimatedCompletionTime || '3-6个月',
      createdAt: new Date(),
    };

    // 如果有学习路径，转换为完整格式
    if (recommendationData.learningPath) {
      result.learningPath = {
        id: `path-${Date.now()}`,
        name: recommendationData.learningPath.name,
        description: recommendationData.learningPath.description,
        targetRole: validated.targetPosition,
        targetSkills: validated.targetSkills ? Object.keys(validated.targetSkills) : [],
        nodes: [],
        totalDuration: 0,
        estimatedCompletionTime: result.estimatedCompletionTime,
        companyId: validated.companyId,
        createdBy: validated.requestedBy,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      message: '个性化推荐生成成功',
      data: result,
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

// 生成学习路径
async function generateLearningPath(body: any) {
  try {
    const validated = generatePathSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的课程设计专家，擅长制定结构化的学习路径。

请基于目标角色和技能要求，设计一个完整的学习路径。

学习路径设计原则：
1. 循序渐进：从基础到高级，确保知识体系的完整性
2. 理论结合实践：平衡理论学习和实践应用
3. 难度递进：课程难度逐步提升
4. 技能覆盖：确保覆盖所有目标技能
5. 时间合理：根据时间偏好安排合理的学习进度

输出格式要求JSON结构：
{
  "name": "学习路径名称",
  "description": "描述",
  "nodes": [
    {
      "courseId": "课程ID",
      "courseTitle": "课程标题",
      "order": 排序,
      "estimatedDuration": 预计时长,
      "required": true/false,
      "notes": "备注"
    }
  ],
  "totalDuration": 总时长,
  "estimatedCompletionTime": "预计完成时间",
  "phases": [
    {
      "name": "阶段名称",
      "nodes": [node索引],
      "duration": "持续时间"
    }
  ]
}`;

    let userPrompt = `请为以下目标角色设计学习路径：

**目标角色：**${validated.targetRole}
**目标技能：**
${validated.targetSkills.map(s => `- ${s.name}（目标水平：${s.requiredLevel}/100）`).join('\n')}

**当前技能水平：**
${Object.entries(validated.currentSkills).map(([skill, level]) => `- ${skill}：${level}/100`).join('\n')}

**学习偏好：**
- 学习方式：${validated.learningStyle || '混合式'}
- 时间偏好：${validated.durationPreference || '3个月'}

**可用培训课程：**
${trainingCourses.map(c =>
  `- ${c.id}：${c.title}\n  类型：${c.type}，时长：${c.duration}小时，难度：${c.difficulty}\n  技能：${c.skills.join('、')}`
).join('\n\n')}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      temperature: 0.7,
    });

    const content = response.content.trim();
    let pathData: any = {};

    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        pathData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        pathData = createDefaultPath(validated);
      }
    } else {
      pathData = createDefaultPath(validated);
    }

    // 构建完整的学习路径
    const learningPath: LearningPath = {
      id: `path-${Date.now()}`,
      name: pathData.name || `${validated.targetRole}能力提升路径`,
      description: pathData.description || `针对${validated.targetRole}角色的技能提升学习路径`,
      targetRole: validated.targetRole,
      targetSkills: validated.targetSkills.map(s => s.name),
      skillLevel: 'advanced',
      nodes: (pathData.nodes || []).map((node: any) => ({
        id: `node-${node.order}`,
        courseId: node.courseId,
        courseTitle: node.courseTitle,
        type: trainingCourses.find(c => c.id === node.courseId)?.type || TrainingType.ONLINE,
        order: node.order,
        estimatedDuration: node.estimatedDuration || 4,
        recommended: true,
        required: node.required || false,
        notes: node.notes,
      })),
      totalDuration: pathData.totalDuration || 40,
      estimatedCompletionTime: pathData.estimatedCompletionTime || '3-6个月',
      companyId: validated.companyId,
      createdBy: validated.requestedBy,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: '学习路径生成成功',
      data: learningPath,
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

// 计算技能差距
function calculateSkillGaps(
  currentSkills: Record<string, number>,
  targetSkills: Record<string, number>
): Array<{
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}> {
  const skillGaps: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // 合并所有技能
  const allSkills = new Set([
    ...Object.keys(currentSkills),
    ...Object.keys(targetSkills),
  ]);

  allSkills.forEach(skill => {
    const currentLevel = currentSkills[skill] || 0;
    const targetLevel = targetSkills[skill] || 0;
    const gap = targetLevel - currentLevel;

    if (gap > 0) {
      skillGaps.push({
        skill,
        currentLevel,
        targetLevel,
        gap,
        priority: gap >= 30 ? 'high' : gap >= 15 ? 'medium' : 'low',
      });
    }
  });

  // 按差距降序排序
  return skillGaps.sort((a, b) => b.gap - a.gap);
}

// 创建默认推荐
function createDefaultRecommendation(
  validated: z.infer<typeof recommendationSchema>,
  skillGaps: ReturnType<typeof calculateSkillGaps>
) {
  const recommendedCourses = trainingCourses
    .slice(0, 5)
    .map(course => ({
      course,
      relevanceScore: 75 + Math.random() * 20,
      reason: '与技能发展目标相关',
      expectedImpact: '提升相关技能水平',
    }));

  return {
    recommendedCourses,
    learningPath: {
      name: '个性化学习路径',
      timeline: [
        {
          phase: '第一阶段',
          courses: ['基础课程'],
          duration: '1个月',
        },
        {
          phase: '第二阶段',
          courses: ['进阶课程'],
          duration: '2个月',
        },
      ],
    },
    mentorship: {
      recommended: validated.includeMentorship,
      reason: '有助于技能提升',
    },
    expectedOutcomes: [
      '提升关键技能',
      '增强工作能力',
      '为职业发展做好准备',
    ],
    estimatedCompletionTime: '3-6个月',
  };
}

// 生成默认时间线
function generateDefaultTimeline(availableTime: number) {
  return [
    {
      phase: '第一阶段：基础学习',
      courses: ['基础课程'],
      duration: '4周',
    },
    {
      phase: '第二阶段：技能提升',
      courses: ['进阶课程'],
      duration: '6周',
    },
    {
      phase: '第三阶段：实践应用',
      courses: ['实践项目'],
      duration: '4周',
    },
  ];
}

// 创建默认路径
function createDefaultPath(validated: z.infer<typeof generatePathSchema>) {
  return {
    name: `${validated.targetRole}能力提升路径`,
    description: `针对${validated.targetRole}角色的技能提升`,
    nodes: trainingCourses.slice(0, 5).map((course, i) => ({
      courseId: course.id,
      courseTitle: course.title,
      order: i + 1,
      estimatedDuration: course.duration,
      required: i < 3,
    })),
    totalDuration: trainingCourses.slice(0, 5).reduce((sum, c) => sum + c.duration, 0),
    estimatedCompletionTime: '3-6个月',
    phases: [],
  };
}

/**
 * GET /api/training/ai-recommendation - 获取培训推荐记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const companyId = searchParams.get('companyId');

    // 这里应该从数据库查询，暂时返回空列表
    return NextResponse.json({
      success: true,
      data: [],
      message: '推荐记录查询功能需要实现数据库集成',
    });
  } catch (error) {
    console.error('获取培训推荐记录错误:', error);
    return NextResponse.json(
      { error: '获取培训推荐记录失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
