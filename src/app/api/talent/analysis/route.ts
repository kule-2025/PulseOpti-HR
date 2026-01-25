import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { z } from 'zod';

// 人才分析请求Schema
const talentAnalysisSchema = z.object({
  companyId: z.string(),
  employees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    department: z.string(),
    position: z.string(),
    performance: z.number().min(0).max(100),
    potential: z.number().min(0).max(100),
    skills: z.record(z.string(), z.number()).optional(),
    experience: z.number().optional(), // 工作年限
    education: z.string().optional(),
    tenure: z.number().optional(), // 在职年限
    salary: z.number().optional(),
    achievements: z.array(z.string()).optional(),
    risks: z.array(z.string()).optional(),
  })),
  analysisType: z.enum(['grid', 'mapping', 'identification', 'all']),
  includeRecommendations: z.boolean().default(true),
  requestedBy: z.string(),
});

// 人才地图节点类型
interface TalentMapNode {
  id: string;
  name: string;
  department: string;
  position: string;
  performance: number;
  potential: number;
  level: string;
  category: string;
  successors?: string[]; // 继任者ID列表
  mentors?: string[]; // 导师ID列表
  mentees?: string[]; // 被指导者ID列表
  connections?: string[]; // 关键连接ID列表
}

// 人才地图类型
interface TalentMap {
  keyPositions: Array<{
    position: string;
    department: string;
    current: TalentMapNode | null;
    successors: TalentMapNode[];
    readiness: 'ready' | '1-2years' | '2-3years' | 'none';
    risk: 'high' | 'medium' | 'low';
    gap: string;
  }>;
  highPotentialEmployees: TalentMapNode[];
  keyTalentPools: Array<{
    category: string;
    employees: TalentMapNode[];
    size: number;
    growth: number;
  }>;
  successionRisks: Array<{
    position: string;
    department: string;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    factors: string[];
  }>;
}

// 关键人才识别结果类型
interface KeyTalentIdentification {
  criticalRoles: Array<{
    position: string;
    department: string;
    businessImpact: 'critical' | 'high' | 'medium' | 'low';
    replacementDifficulty: 'very_hard' | 'hard' | 'medium' | 'easy';
    marketAvailability: 'scarce' | 'limited' | 'moderate' | 'abundant';
    riskScore: number; // 0-100
    employees: TalentMapNode[];
  }>;
  topTalent: Array<{
    employee: TalentMapNode;
    score: number; // 综合得分 0-100
    strengths: string[];
    developmentAreas: string[];
    recommendation: string;
  }>;
  retentionRisks: Array<{
    employee: TalentMapNode;
    riskLevel: 'high' | 'medium' | 'low';
    factors: string[];
    actions: string[];
  }>;
}

/**
 * POST /api/talent/analysis - 人才分析（九宫格、人才地图、关键人才识别）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = talentAnalysisSchema.parse(body);

    const config = new Config();
    const client = new LLMClient(config);

    let result: any = {};

    if (validated.analysisType === 'grid' || validated.analysisType === 'all') {
      result.gridAnalysis = await performGridAnalysis(validated.employees, client);
    }

    if (validated.analysisType === 'mapping' || validated.analysisType === 'all') {
      result.talentMap = await generateTalentMap(validated.employees, client);
    }

    if (validated.analysisType === 'identification' || validated.analysisType === 'all') {
      result.keyTalent = await identifyKeyTalent(validated.employees, client);
    }

    return NextResponse.json({
      success: true,
      message: '人才分析完成',
      data: result,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('人才分析错误:', error);
    return NextResponse.json(
      { error: '人才分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 九宫格分析
async function performGridAnalysis(
  employees: z.infer<typeof talentAnalysisSchema>['employees'],
  client: LLMClient
) {
  // 将员工分配到九宫格
  const gridDistribution = {
    superstars: employees.filter(e => e.performance >= 80 && e.potential >= 80),
    risingStars: employees.filter(e => e.performance >= 60 && e.potential >= 80),
    reliablePerformers: employees.filter(e => e.performance >= 80 && e.potential >= 40 && e.potential < 80),
    futureLeaders: employees.filter(e => e.performance >= 60 && e.performance < 80 && e.potential >= 80),
    steadyContributors: employees.filter(e => e.performance >= 60 && e.performance < 80 && e.potential >= 40 && e.potential < 80),
    solidCitizens: employees.filter(e => e.performance >= 80 && e.potential < 40),
    growthPotential: employees.filter(e => e.performance < 60 && e.potential >= 80),
    atRisk: employees.filter(e => e.performance < 60 && e.potential >= 40 && e.potential < 80),
    lowPerformers: employees.filter(e => e.performance < 60 && e.potential < 40),
  };

  // 统计数据
  const statistics = {
    total: employees.length,
    byCategory: Object.fromEntries(
      Object.entries(gridDistribution).map(([key, value]) => [key, value.length])
    ),
    averagePerformance: employees.reduce((sum, e) => sum + e.performance, 0) / employees.length,
    averagePotential: employees.reduce((sum, e) => sum + e.potential, 0) / employees.length,
  };

  return {
    distribution: gridDistribution,
    statistics,
    recommendations: generateGridRecommendations(gridDistribution, statistics),
  };
}

// 生成九宫格建议
function generateGridRecommendations(
  distribution: Record<string, any[]>,
  statistics: any
): string[] {
  const recommendations: string[] = [];

  if (distribution.superstars.length > 0) {
    recommendations.push(
      `发现 ${distribution.superstars.length} 名超级明星员工，建议制定个性化保留计划`
    );
  }

  if (distribution.risingStars.length > 0) {
    recommendations.push(
      `有 ${distribution.risingStars.length} 名潜力新星，建议加速培养，快速晋升通道`
    );
  }

  if (distribution.growthPotential.length > 0) {
    recommendations.push(
      `${distribution.growthPotential.length} 名员工具有高潜力但绩效不佳，建议查明原因并制定改进计划`
    );
  }

  if (distribution.lowPerformers.length > 0) {
    recommendations.push(
      `${distribution.lowPerformers.length} 名员工绩效和潜力均较低，建议制定PIP或考虑淘汰`
    );
  }

  if (statistics.averagePerformance < 75) {
    recommendations.push('整体绩效水平偏低，建议加强绩效管理和培训投入');
  }

  if (statistics.averagePotential < 65) {
    recommendations.push('整体潜力水平偏低，建议优化招聘策略和人才发展计划');
  }

  return recommendations;
}

// 人才地图生成
async function generateTalentMap(
  employees: z.infer<typeof talentAnalysisSchema>['employees'],
  client: LLMClient
): Promise<TalentMap> {
  // 识别关键职位
  const positionsByRole = employees.reduce((acc, emp) => {
    const key = `${emp.position}-${emp.department}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(emp);
    return acc;
  }, {} as Record<string, any[]>);

  // 构建关键职位映射
  const keyPositions = Object.entries(positionsByRole).map(([key, emps]) => {
    const [position, department] = key.split('-');

    // 按绩效和潜力排序
    const sortedEmployees = emps.sort((a, b) => {
      const scoreA = a.performance * 0.6 + a.potential * 0.4;
      const scoreB = b.performance * 0.6 + b.potential * 0.4;
      return scoreB - scoreA;
    });

    const current = sortedEmployees[0] || null;
    const successors = sortedEmployees.slice(1, 4); // 前3位继任者

    // 评估继任准备度
    let readiness: 'ready' | '1-2years' | '2-3years' | 'none' = 'none';
    let risk: 'high' | 'medium' | 'low' = 'high';

    if (successors.length > 0) {
      const avgScore = successors.reduce((sum, emp) => sum + emp.performance * 0.6 + emp.potential * 0.4, 0) / successors.length;

      if (avgScore >= 85) {
        readiness = 'ready';
        risk = 'low';
      } else if (avgScore >= 75) {
        readiness = '1-2years';
        risk = 'medium';
      } else if (avgScore >= 65) {
        readiness = '2-3years';
        risk = 'high';
      }
    }

    return {
      position,
      department,
      current: current ? {
        id: current.id,
        name: current.name,
        department: current.department,
        position: current.position,
        performance: current.performance,
        potential: current.potential,
        level: 'current',
        category: getTalentCategory(current.performance, current.potential),
      } : null,
      successors: successors.map(emp => ({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        performance: emp.performance,
        potential: emp.potential,
        level: 'successor',
        category: getTalentCategory(emp.performance, emp.potential),
      })),
      readiness,
      risk,
      gap: calculateSuccessionGap(current, successors),
    };
  });

  // 高潜力员工池
  const highPotentialEmployees = employees
    .filter(e => e.potential >= 80)
    .map(e => ({
      id: e.id,
      name: e.name,
      department: e.department,
      position: e.position,
      performance: e.performance,
      potential: e.potential,
      level: 'high_potential',
      category: getTalentCategory(e.performance, e.potential),
    }))
    .sort((a, b) => b.potential - a.potential);

  // 人才池分类
  const keyTalentPools = [
    {
      category: '超级明星',
      employees: highPotentialEmployees.filter(e => e.performance >= 80),
      size: employees.filter(e => e.performance >= 80 && e.potential >= 80).length,
      growth: 15,
    },
    {
      category: '潜力新星',
      employees: employees.filter(e => e.performance >= 60 && e.potential >= 80).map(e => ({
        id: e.id,
        name: e.name,
        department: e.department,
        position: e.position,
        performance: e.performance,
        potential: e.potential,
        level: 'rising_star',
        category: getTalentCategory(e.performance, e.potential),
      })),
      size: employees.filter(e => e.performance >= 60 && e.potential >= 80).length,
      growth: 20,
    },
    {
      category: '可靠骨干',
      employees: employees.filter(e => e.performance >= 80).map(e => ({
        id: e.id,
        name: e.name,
        department: e.department,
        position: e.position,
        performance: e.performance,
        potential: e.potential,
        level: 'reliable',
        category: getTalentCategory(e.performance, e.potential),
      })),
      size: employees.filter(e => e.performance >= 80).length,
      growth: 5,
    },
  ];

  // 继任风险分析
  const successionRisks = keyPositions
    .filter((pos): pos is typeof pos & { risk: 'high' | 'medium' } => pos.risk !== 'low')
    .map(pos => ({
      position: pos.position,
      department: pos.department,
      riskLevel: pos.risk,
      factors: pos.gap ? [pos.gap] : ['继任者准备度不足'],
    }));

  return {
    keyPositions,
    highPotentialEmployees,
    keyTalentPools,
    successionRisks,
  };
}

// 计算继任差距
function calculateSuccessionGap(current: any, successors: any[]): string {
  if (!current) {
    return '该职位目前空缺';
  }

  if (successors.length === 0) {
    return '无继任者，需紧急培养';
  }

  const currentScore = current.performance * 0.6 + current.potential * 0.4;
  const bestSuccessorScore = successors[0].performance * 0.6 + successors[0].potential * 0.4;
  const gap = currentScore - bestSuccessorScore;

  if (gap > 15) {
    return '最佳继任者与现任差距较大，需加强培养';
  } else if (gap > 5) {
    return '继任者准备度一般，可考虑过渡培养';
  } else {
    return '继任者准备度良好';
  }
}

// 获取人才类别
function getTalentCategory(performance: number, potential: number): string {
  if (performance >= 80 && potential >= 80) return 'superstar';
  if (performance >= 60 && potential >= 80) return 'rising_star';
  if (performance >= 80 && potential >= 40) return 'reliable';
  if (performance >= 60 && potential >= 60) return 'contributor';
  if (potential >= 80) return 'growth';
  return 'standard';
}

// 关键人才识别
async function identifyKeyTalent(
  employees: z.infer<typeof talentAnalysisSchema>['employees'],
  client: LLMClient
): Promise<KeyTalentIdentification> {
  // 识别关键职位
  const criticalRoles = Object.values(
    employees.reduce((acc, emp) => {
      const key = emp.position;
      if (!acc[key]) {
        acc[key] = { position: emp.position, department: emp.department, employees: [] as any[] };
      }
      acc[key].employees.push(emp);
      return acc;
    }, {} as Record<string, { position: string; department: string; employees: any[] }>)
  )
    .map((role: { position: string; department: string; employees: any[] }) => {
      // 计算风险分数（基于员工数量、平均绩效、平均潜力）
      const avgPerf = role.employees.reduce((sum: number, e: any) => sum + e.performance, 0) / role.employees.length;
      const avgPot = role.employees.reduce((sum: number, e: any) => sum + e.potential, 0) / role.employees.length;

      const businessImpact = avgPerf >= 80 ? ('critical' as const) : avgPerf >= 70 ? ('high' as const) : ('medium' as const);
      const replacementDifficulty = role.employees.length <= 2 ? ('very_hard' as const) : role.employees.length <= 5 ? ('hard' as const) : ('easy' as const);
      const marketAvailability = avgPot >= 80 ? ('scarce' as const) : avgPot >= 70 ? ('limited' as const) : ('abundant' as const);

      const riskScore =
        (businessImpact === 'critical' ? 40 : businessImpact === 'high' ? 30 : 20) +
        (replacementDifficulty === 'very_hard' ? 40 : replacementDifficulty === 'hard' ? 25 : 10) +
        (marketAvailability === 'scarce' ? 25 : marketAvailability === 'limited' ? 15 : 5);

      return {
        position: role.position,
        department: role.department,
        businessImpact,
        replacementDifficulty,
        marketAvailability,
        riskScore,
        employees: role.employees.map((e: any) => ({
          id: e.id,
          name: e.name,
          department: e.department,
          position: e.position,
          performance: e.performance,
          potential: e.potential,
          level: 'employee',
          category: getTalentCategory(e.performance, e.potential),
        })),
      };
    })
    .sort((a: any, b: any) => b.riskScore - a.riskScore)
    .slice(0, 10); // 前10个关键职位

  // 识别顶尖人才
  const topTalent = employees
    .map(emp => {
      const score = emp.performance * 0.6 + emp.potential * 0.4;

      let strengths: string[] = [];
      let developmentAreas: string[] = [];

      if (emp.performance >= 85) strengths.push('绩效优秀');
      if (emp.potential >= 85) strengths.push('潜力突出');
      if (emp.skills) {
        const topSkills = Object.entries(emp.skills)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([skill]) => skill);
        if (topSkills.length > 0) strengths.push(...topSkills.map(s => `擅长${s}`));
      }

      if (emp.performance < 70) developmentAreas.push('提升绩效水平');
      if (emp.potential < 70) developmentAreas.push('挖掘发展潜力');
      if (emp.skills) {
        const lowSkills = Object.entries(emp.skills)
          .filter(([, level]) => (level as number) < 60)
          .map(([skill]) => skill);
        if (lowSkills.length > 0) developmentAreas.push(...lowSkills.map(s => `提升${s}`));
      }

      let recommendation = '保持当前表现';
      if (score >= 85) recommendation = '纳入关键人才库，制定保留计划';
      else if (score >= 75) recommendation = '持续关注，适时发展';
      else if (score >= 65) recommendation = '加强培养，提升能力';
      else recommendation = '制定改进计划或考虑调整';

      return {
        employee: {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          position: emp.position,
          performance: emp.performance,
          potential: emp.potential,
          level: 'top_talent',
          category: getTalentCategory(emp.performance, emp.potential),
        },
        score: Math.round(score),
        strengths,
        developmentAreas,
        recommendation,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // 前20名顶尖人才

  // 识别留任风险
  const retentionRisks = employees
    .map(emp => {
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      const factors: string[] = [];

      // 基于绩效和潜力评估风险
      if (emp.performance < 60 && emp.potential >= 70) {
        riskLevel = 'high';
        factors.push('高潜力低绩效，可能寻求机会');
      }

      // 基于在职年限评估风险
      if (emp.tenure && emp.tenure < 1) {
        riskLevel = riskLevel === 'high' ? riskLevel : 'medium';
        factors.push('入职时间短，稳定性待观察');
      } else if (emp.tenure && emp.tenure > 5) {
        // 长期员工可能职业倦怠
        factors.push('长期员工，需关注职业发展');
      }

      // 基于风险指标评估
      if (emp.risks && emp.risks.length > 0) {
        riskLevel = 'high';
        factors.push(...emp.risks);
      }

      const actions: string[] = [];
      if (riskLevel === 'high') {
        actions.push('立即进行离职面谈');
        actions.push('制定个性化保留计划');
        actions.push('提供职业发展机会');
        actions.push('优化薪酬福利');
      } else if (riskLevel === 'medium') {
        actions.push('定期沟通，了解需求');
        actions.push('提供培训和发展机会');
      }

      return {
        employee: {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          position: emp.position,
          performance: emp.performance,
          potential: emp.potential,
          level: 'at_risk',
          category: getTalentCategory(emp.performance, emp.potential),
        },
        riskLevel,
        factors,
        actions,
      };
    })
    .filter(emp => emp.riskLevel !== 'low')
    .sort((a, b) => (b.riskLevel === 'high' ? 1 : 0) - (a.riskLevel === 'high' ? 1 : 0))
    .slice(0, 15); // 前15名高风险员工

  return {
    criticalRoles,
    topTalent,
    retentionRisks,
  };
}
