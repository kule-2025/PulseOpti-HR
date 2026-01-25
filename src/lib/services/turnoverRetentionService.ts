/**
 * 离职挽留服务系统
 * 提供个性化挽留建议和挽留效果跟踪
 */

export interface RetentionRecommendation {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'career' | 'compensation' | 'environment' | 'management' | 'workload';
  action: string;
  expectedEffect: string;
  timeline: string;
  cost: string;
  successRate: number;
}

export interface RetentionPlan {
  employeeId: string;
  employeeName: string;
  riskScore: number;
  recommendations: RetentionRecommendation[];
  suggestedActions: string[];
  budgetRequired: number;
  implementationTimeline: string;
  expectedRetentionRate: number;
}

/**
 * 生成个性化挽留建议
 */
export function generateRetentionRecommendations(
  employee: any,
  riskAnalysis: any,
  historicalData: any
): RetentionPlan {
  const recommendations: RetentionRecommendation[] = [];
  const suggestedActions: string[] = [];
  let budgetRequired = 0;
  let expectedRetentionRate = 0;

  // 1. 职业发展维度
  if (riskAnalysis.dimensions.development.score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'career',
      action: '提供职业发展规划',
      expectedEffect: '提升员工对职业前景的信心，降低离职意向',
      timeline: '1个月内',
      cost: '低',
      successRate: 75,
    });

    recommendations.push({
      priority: 'high',
      category: 'career',
      action: '安排导师或导师制',
      expectedEffect: '提供职业指导和支持，增强归属感',
      timeline: '2周内',
      cost: '低',
      successRate: 80,
    });

    recommendations.push({
      priority: 'medium',
      category: 'career',
      action: '提供晋升机会或轮岗',
      expectedEffect: '满足职业发展需求，增加组织粘性',
      timeline: '3个月内',
      cost: '中',
      successRate: 85,
    });

    suggestedActions.push(
      '安排与员工的一对一职业发展谈话',
      '制定明确的职业发展路径',
      '提供内部培训和学习机会'
    );
  }

  // 2. 薪酬维度
  if (riskAnalysis.dimensions.compensation.score < 65) {
    recommendations.push({
      priority: 'urgent',
      category: 'compensation',
      action: '薪酬调整',
      expectedEffect: '提升薪酬竞争力，直接降低离职动机',
      timeline: '2周内',
      cost: '高',
      successRate: 90,
    });

    recommendations.push({
      priority: 'high',
      category: 'compensation',
      action: '增加绩效奖金或股权激励',
      expectedEffect: '增加长期激励，提高员工投入度',
      timeline: '1个月内',
      cost: '高',
      successRate: 85,
    });

    recommendations.push({
      priority: 'medium',
      category: 'compensation',
      action: '提供额外福利（如弹性工作制、远程办公）',
      expectedEffect: '提升工作生活平衡满意度',
      timeline: '立即实施',
      cost: '低',
      successRate: 70,
    });

    suggestedActions.push(
      '进行市场薪酬调研，确定薪酬调整幅度',
      '设计绩效奖金方案',
      '优化福利体系'
    );

    budgetRequired += 50000; // 薪酬调整预算
  }

  // 3. 环境维度
  if (riskAnalysis.dimensions.environment.score < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'environment',
      action: '改善工作环境',
      expectedEffect: '提升工作舒适度和满意度',
      timeline: '1个月内',
      cost: '中',
      successRate: 65,
    });

    recommendations.push({
      priority: 'medium',
      category: 'environment',
      action: '加强团队建设活动',
      expectedEffect: '增强团队凝聚力和归属感',
      timeline: '持续进行',
      cost: '低',
      successRate: 70,
    });

    suggestedActions.push(
      '组织团队建设活动',
      '改善办公环境',
      '促进团队沟通协作'
    );

    budgetRequired += 10000; // 环境改善预算
  }

  // 4. 管理维度
  if (riskAnalysis.keyRiskFactors.some((factor: any) => factor.factor.includes('管理') || factor.factor.includes('领导'))) {
    recommendations.push({
      priority: 'urgent',
      category: 'management',
      action: '加强领导力培训',
      expectedEffect: '提升管理能力，改善上下级关系',
      timeline: '1个月内',
      cost: '中',
      successRate: 75,
    });

    recommendations.push({
      priority: 'high',
      category: 'management',
      action: '调整汇报关系',
      expectedEffect: '改善管理关系，减少冲突',
      timeline: '2周内',
      cost: '低',
      successRate: 80,
    });

    suggestedActions.push(
      '开展领导力培训',
      '评估并调整管理方式',
      '建立更透明的沟通机制'
    );

    budgetRequired += 5000; // 培训预算
  }

  // 5. 工作负荷维度
  if (riskAnalysis.keyRiskFactors.some((factor: any) => factor.factor.includes('工作负荷') || factor.factor.includes('压力'))) {
    recommendations.push({
      priority: 'urgent',
      category: 'workload',
      action: '合理分配工作量',
      expectedEffect: '降低工作压力，提升工作满意度',
      timeline: '1周内',
      cost: '低',
      successRate: 85,
    });

    recommendations.push({
      priority: 'high',
      category: 'workload',
      action: '增加人力或自动化工具',
      expectedEffect: '减轻工作负担，提高效率',
      timeline: '1个月内',
      cost: '高',
      successRate: 80,
    });

    recommendations.push({
      priority: 'medium',
      category: 'workload',
      action: '提供心理健康支持',
      expectedEffect: '缓解压力，提升心理韧性',
      timeline: '立即实施',
      cost: '低',
      successRate: 70,
    });

    suggestedActions.push(
      '重新评估和分配工作任务',
      '引入自动化工具',
      '提供心理咨询资源'
    );

    budgetRequired += 20000; // 工具和人力预算
  }

  // 计算预期保留率
  const highPriorityCount = recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
  if (highPriorityCount >= 3) {
    expectedRetentionRate = 60;
  } else if (highPriorityCount >= 2) {
    expectedRetentionRate = 75;
  } else if (highPriorityCount >= 1) {
    expectedRetentionRate = 85;
  } else {
    expectedRetentionRate = 90;
  }

  // 如果风险分数很高，预期保留率会降低
  if (riskAnalysis.riskScore >= 80) {
    expectedRetentionRate -= 15;
  } else if (riskAnalysis.riskScore >= 60) {
    expectedRetentionRate -= 10;
  }

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    riskScore: riskAnalysis.riskScore,
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    suggestedActions,
    budgetRequired,
    implementationTimeline: getImplementationTimeline(recommendations),
    expectedRetentionRate,
  };
}

/**
 * 获取实施时间线
 */
function getImplementationTimeline(recommendations: RetentionRecommendation[]): string {
  if (recommendations.some(r => r.priority === 'urgent')) {
    return '紧急：建议2周内完成关键措施，1个月内完成所有高优先级措施';
  } else if (recommendations.some(r => r.priority === 'high')) {
    return '重要：建议1个月内完成所有高优先级措施，3个月内完成中等优先级措施';
  } else {
    return '常规：建议3个月内完成所有措施';
  }
}

/**
 * 挽留措施效果跟踪
 */
export interface RetentionEffectiveness {
  employeeId: string;
  measuresTaken: string[];
  startDate: Date;
  checkDate: Date;
  riskScoreBefore: number;
  riskScoreAfter: number;
  improvement: number;
  status: 'improved' | 'stable' | 'declined';
  nextActions: string[];
}

export function trackRetentionEffectiveness(
  employeeId: string,
  measuresTaken: string[],
  riskScoreBefore: number,
  riskScoreAfter: number
): RetentionEffectiveness {
  const improvement = riskScoreBefore - riskScoreAfter;
  let status: 'improved' | 'stable' | 'declined';
  let nextActions: string[] = [];

  if (improvement > 15) {
    status = 'improved';
    nextActions.push('持续关注，保持当前措施');
    nextActions.push('定期评估风险变化');
  } else if (improvement > 0) {
    status = 'improved';
    nextActions.push('继续实施挽留措施');
    nextActions.push('考虑加强措施力度');
  } else if (improvement === 0) {
    status = 'stable';
    nextActions.push('重新评估挽留策略');
    nextActions.push('考虑采用新的措施');
  } else {
    status = 'declined';
    nextActions.push('立即采取更强有力的措施');
    nextActions.push('启动备选人才招聘计划');
  }

  return {
    employeeId,
    measuresTaken,
    startDate: new Date(), // 实际应该传入实施日期
    checkDate: new Date(),
    riskScoreBefore,
    riskScoreAfter,
    improvement,
    status,
    nextActions,
  };
}

/**
 * 批量生成挽留建议
 */
export function batchGenerateRetentionPlans(
  employeesAtRisk: Array<{ employee: any; riskAnalysis: any }>,
  historicalData: any
): Map<string, RetentionPlan> {
  const plans = new Map<string, RetentionPlan>();

  employeesAtRisk.forEach(({ employee, riskAnalysis }) => {
    const plan = generateRetentionRecommendations(employee, riskAnalysis, historicalData);
    plans.set(employee.id, plan);
  });

  return plans;
}

/**
 * 挽留成功率预测
 */
export function predictRetentionSuccessRate(
  riskScore: number,
  recommendations: RetentionRecommendation[],
  historicalData?: any
): {
  predictedSuccess: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  factors: string[];
} {
  let successRate = 50; // 基础成功率
  const factors: string[] = [];
  let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';

  // 根据风险分数调整
  if (riskScore < 40) {
    successRate += 30;
    factors.push('风险分数较低，挽留成功率高');
  } else if (riskScore < 60) {
    successRate += 15;
    factors.push('风险分数中等，挽留成功率较高');
  } else if (riskScore < 80) {
    successRate -= 10;
    factors.push('风险分数较高，挽留成功率降低');
  } else {
    successRate -= 30;
    confidenceLevel = 'low';
    factors.push('风险分数很高，挽留成功率低，需更强措施');
  }

  // 根据推荐措施数量调整
  if (recommendations.length >= 5) {
    successRate += 20;
    factors.push('挽留措施全面，成功率高');
  } else if (recommendations.length >= 3) {
    successRate += 10;
    factors.push('挽留措施较全面，成功率较高');
  } else {
    successRate -= 10;
    confidenceLevel = 'low';
    factors.push('挽留措施不足，建议增加措施');
  }

  // 根据高优先级措施调整
  const highPriorityCount = recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
  if (highPriorityCount >= 2) {
    successRate += 15;
    factors.push('包含多个高优先级措施，预期效果佳');
  }

  // 根据预算调整
  const totalBudget = recommendations.reduce((sum, r) => {
    if (r.cost === '高') return sum + 50000;
    if (r.cost === '中') return sum + 20000;
    if (r.cost === '低') return sum + 5000;
    return sum;
  }, 0);

  if (totalBudget > 50000) {
    successRate += 10;
    factors.push('预算充足，能实施强有力措施');
  } else if (totalBudget < 10000) {
    successRate -= 10;
    factors.push('预算有限，可能影响挽留效果');
  }

  // 限制成功率范围
  successRate = Math.max(10, Math.min(95, successRate));

  return {
    predictedSuccess: successRate,
    confidenceLevel,
    factors,
  };
}

/**
 * 生成挽留报告
 */
export function generateRetentionReport(
  retentionPlan: RetentionPlan,
  effectiveness?: RetentionEffectiveness
): string {
  let report = `# 员工挽留报告\n\n`;
  report += `**员工**: ${retentionPlan.employeeName}\n`;
  report += `**风险分数**: ${retentionPlan.riskScore}\n`;
  report += `**预期保留率**: ${retentionPlan.expectedRetentionRate}%\n`;
  report += `**实施时间线**: ${retentionPlan.implementationTimeline}\n\n`;

  report += `## 挽留建议 (${retentionPlan.recommendations.length}项)\n\n`;
  retentionPlan.recommendations.forEach((rec, index) => {
    report += `${index + 1}. **${rec.action}** (${rec.priority})\n`;
    report += `   - 类别: ${rec.category}\n`;
    report += `   - 预期效果: ${rec.expectedEffect}\n`;
    report += `   - 时间: ${rec.timeline}\n`;
    report += `   - 成本: ${rec.cost}\n`;
    report += `   - 成功率: ${rec.successRate}%\n\n`;
  });

  report += `## 建议行动\n\n`;
  retentionPlan.suggestedActions.forEach(action => {
    report += `- ${action}\n`;
  });
  report += `\n`;

  report += `## 预算需求\n`;
  report += `总计: ¥${retentionPlan.budgetRequired.toLocaleString()}\n\n`;

  if (effectiveness) {
    report += `## 挽留效果跟踪\n\n`;
    report += `**风险分数变化**: ${effectiveness.riskScoreBefore} → ${effectiveness.riskScoreAfter}\n`;
    report += `**改善程度**: ${effectiveness.improvement > 0 ? '+' : ''}${effectiveness.improvement}\n`;
    report += `**状态**: ${effectiveness.status}\n\n`;

    report += `## 下一步行动\n\n`;
    effectiveness.nextActions.forEach(action => {
      report += `- ${action}\n`;
    });
  }

  return report;
}
