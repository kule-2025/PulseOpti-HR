/**
 * 人才地图和继任计划服务
 * 提供人才盘点、继任计划、九宫格分析等核心功能
 */

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  performance: number; // 绩效得分 0-100
  potential: number; // 潜力得分 0-100
  riskLevel: 'high' | 'medium' | 'low'; // 离职风险
  tenure: number; // 入职年限
  age: number;
  skills: string[];
  lastReviewDate: string;
  managerId: string | null;
  successorCandidates: string[]; // 继任者候选人
}

export interface TalentGrid {
  quadrant: 'star' | 'highPotential' | 'steady' | 'lowPerformance';
  employees: Employee[];
}

export interface SuccessionPlan {
  keyPosition: string;
  currentPosition: string;
  incumbent: string;
  readiness: 'ready' | 'withinYear' | 'withinTwoYears' | 'notIdentified';
  successors: Array<{
    employeeId: string;
    name: string;
    currentPosition: string;
    readiness: string;
    developmentNeeds: string[];
  }>;
  riskAssessment: {
    level: 'high' | 'medium' | 'low';
    reason: string;
  };
}

export interface IDP {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  targetPosition: string;
  gapAnalysis: {
    skills: string[];
    experiences: string[];
    certifications: string[];
  };
  developmentPlan: Array<{
    activity: string;
    timeline: string;
    resources: string;
    responsibleParty: string;
    status: 'pending' | 'inProgress' | 'completed';
  }>;
  timeline: string;
  mentorId: string;
  reviewDate: string;
}

/**
 * 人才地图服务
 */
export class TalentMapService {
  private static instance: TalentMapService;
  
  private constructor() {}
  
  static getInstance(): TalentMapService {
    if (!TalentMapService.instance) {
      TalentMapService.instance = new TalentMapService();
    }
    return TalentMapService.instance;
  }
  
  /**
   * 分析人才九宫格
   * 横轴：绩效（低->高）
   * 纵轴：潜力（低->高）
   */
  analyzeTalentGrid(employees: Employee[]): TalentGrid[] {
    const star: Employee[] = [];
    const highPotential: Employee[] = [];
    const steady: Employee[] = [];
    const lowPerformance: Employee[] = [];
    
    employees.forEach(emp => {
      if (emp.performance >= 80 && emp.potential >= 80) {
        star.push(emp);
      } else if (emp.potential >= 80 && emp.performance >= 60) {
        highPotential.push(emp);
      } else if (emp.performance >= 80 && emp.potential >= 60) {
        steady.push(emp);
      } else {
        lowPerformance.push(emp);
      }
    });
    
    return [
      { quadrant: 'star', employees: star },
      { quadrant: 'highPotential', employees: highPotential },
      { quadrant: 'steady', employees: steady },
      { quadrant: 'lowPerformance', employees: lowPerformance },
    ];
  }
  
  /**
   * 生成继任计划
   */
  generateSuccessionPlan(employees: Employee[]): SuccessionPlan[] {
    // 识别关键岗位
    const keyPositions = [
      'CEO',
      'CTO',
      'CFO',
      'CPO',
      'CHRO',
      '部门经理',
      '技术总监',
      '产品总监',
      '销售总监',
      '运营总监',
    ];
    
    const plans: SuccessionPlan[] = [];
    
    keyPositions.forEach(position => {
      // 找到现任者
      const incumbent = employees.find(emp => emp.position === position);
      
      if (!incumbent) return;
      
      // 评估风险
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      let riskReason = '员工稳定，有明确的继任者';
      
      if (incumbent.riskLevel === 'high') {
        riskLevel = 'high';
        riskReason = '离职风险高';
      } else if (incumbent.age > 55) {
        riskLevel = 'medium';
        riskReason = '即将退休';
      } else if (!incumbent.successorCandidates || incumbent.successorCandidates.length === 0) {
        riskLevel = 'medium';
        riskReason = '缺乏明确的继任者';
      }
      
      // 识别继任者候选人
      const successors = incumbent.successorCandidates.map(candidateId => {
        const candidate = employees.find(emp => emp.id === candidateId);
        if (!candidate) return null;
        
        const readiness = this.calculateReadiness(candidate, incumbent);
        const gapAnalysis = this.analyzeGap(candidate, incumbent);
        
        return {
          employeeId: candidate.id,
          name: candidate.name,
          currentPosition: candidate.position,
          readiness,
          developmentNeeds: gapAnalysis,
        };
      }).filter(s => s !== null);
      
      plans.push({
        keyPosition: position,
        currentPosition: position,
        incumbent: incumbent.name,
        readiness: successors.length > 0 ? 'ready' : 'notIdentified',
        successors: successors as any,
        riskAssessment: {
          level: riskLevel,
          reason: riskReason,
        },
      });
    });
    
    return plans;
  }
  
  /**
   * 计算继任者准备度
   */
  private calculateReadiness(candidate: Employee, incumbent: Employee): string {
    const skillMatch = this.calculateSkillMatch(candidate, incumbent);
    const experienceGap = this.calculateExperienceGap(candidate, incumbent);
    
    if (skillMatch >= 90 && experienceGap <= 1) {
      return 'ready';
    } else if (skillMatch >= 80 && experienceGap <= 2) {
      return 'withinYear';
    } else if (skillMatch >= 70 && experienceGap <= 3) {
      return 'withinTwoYears';
    } else {
      return 'notIdentified';
    }
  }
  
  /**
   * 计算技能匹配度
   */
  private calculateSkillMatch(candidate: Employee, incumbent: Employee): number {
    if (!incumbent.skills || !candidate.skills) return 0;
    
    const matchedSkills = incumbent.skills.filter(skill => 
      candidate.skills.includes(skill)
    );
    
    return Math.round((matchedSkills.length / incumbent.skills.length) * 100);
  }
  
  /**
   * 计算经验差距
   */
  private calculateExperienceGap(candidate: Employee, incumbent: Employee): number {
    return Math.max(0, incumbent.tenure - candidate.tenure);
  }
  
  /**
   * 分析能力差距
   */
  private analyzeGap(candidate: Employee, incumbent: Employee): string[] {
    const gaps: string[] = [];
    
    // 技能差距
    const missingSkills = (incumbent.skills || []).filter(skill => 
      !(candidate.skills || []).includes(skill)
    );
    if (missingSkills.length > 0) {
      gaps.push(`需要掌握技能: ${missingSkills.join(', ')}`);
    }
    
    // 经验差距
    const experienceGap = incumbent.tenure - candidate.tenure;
    if (experienceGap > 2) {
      gaps.push(`需要积累 ${experienceGap} 年相关工作经验`);
    }
    
    // 绩效差距
    if (candidate.performance < 80) {
      gaps.push('需要提升绩效表现');
    }
    
    // 潜力差距
    if (candidate.potential < 80) {
      gaps.push('需要展现更高的领导潜力');
    }
    
    return gaps;
  }
  
  /**
   * 生成个人发展计划（IDP）
   */
  generateIDP(employee: Employee, targetPosition: string, allEmployees: Employee[]): IDP {
    const targetEmployee = allEmployees.find(emp => emp.position === targetPosition);
    
    const gapAnalysis = this.analyzeGap(employee, targetEmployee || employee);
    
    const developmentPlan = [
      {
        activity: '技能培训',
        timeline: '3个月',
        resources: '内部培训、外部课程',
        responsibleParty: 'HR + 直属经理',
        status: 'pending' as const,
      },
      {
        activity: '跨部门项目经验',
        timeline: '6个月',
        resources: '项目分配',
        responsibleParty: '部门经理',
        status: 'pending' as const,
      },
      {
        activity: '管理能力提升',
        timeline: '12个月',
        resources: '管理培训、导师指导',
        responsibleParty: 'HR',
        status: 'pending' as const,
      },
    ];
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      currentPosition: employee.position,
      targetPosition,
      gapAnalysis: {
        skills: gapAnalysis.filter(g => g.includes('技能')),
        experiences: gapAnalysis.filter(g => g.includes('经验')),
        certifications: [],
      },
      developmentPlan,
      timeline: '12个月',
      mentorId: employee.managerId || '',
      reviewDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }
  
  /**
   * 生成人才盘点报告
   */
  generateTalentReviewReport(employees: Employee[]) {
    const grid = this.analyzeTalentGrid(employees);
    const successionPlans = this.generateSuccessionPlan(employees);
    
    const stats = {
      totalEmployees: employees.length,
      starEmployees: grid.find(g => g.quadrant === 'star')?.employees.length || 0,
      highPotential: grid.find(g => g.quadrant === 'highPotential')?.employees.length || 0,
      steadyEmployees: grid.find(g => g.quadrant === 'steady')?.employees.length || 0,
      lowPerformance: grid.find(g => g.quadrant === 'lowPerformance')?.employees.length || 0,
      highRiskEmployees: employees.filter(e => e.riskLevel === 'high').length,
      readySuccessors: successionPlans.filter(p => p.readiness === 'ready').length,
    };
    
    return {
      stats,
      grid,
      successionPlans,
      recommendations: [
        '重点关注明星员工的保留和发展',
        '为高潜力员工提供发展机会',
        '对低绩效员工制定改进计划',
        '完善关键岗位继任计划',
        '降低高离职风险员工的流失',
      ],
    };
  }
}

export const talentMapService = TalentMapService.getInstance();
