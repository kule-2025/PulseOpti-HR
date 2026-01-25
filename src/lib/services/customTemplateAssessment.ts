/**
 * 基于自定义评估模板的简历质量评估服务
 * 支持企业自定义评估指标和权重
 */

import {
  getAssessmentTemplateById,
  getDefaultAssessmentTemplate,
} from '@/storage/database/assessmentManager';
import type { ParsedResumeData, QualityAssessmentResult } from './resumeQualityAssessment';

/**
 * 使用自定义模板评估简历质量
 */
export async function assessResumeWithTemplate(
  parsedData: ParsedResumeData,
  templateId?: string,
  companyId?: string
): Promise<QualityAssessmentResult> {
  // 获取评估模板
  let template;

  if (templateId) {
    template = await getAssessmentTemplateById(templateId);
  } else if (companyId) {
    template = await getDefaultAssessmentTemplate(companyId, 'resume');
  }

  // 如果没有找到自定义模板，使用默认评估逻辑
  if (!template || !template.dimensions || template.dimensions.length === 0) {
    const { assessResumeQuality } = await import('./resumeQualityAssessment');
    return assessResumeQuality(parsedData);
  }

  // 使用自定义模板进行评估
  return assessResumeWithCustomTemplate(parsedData, template);
}

/**
 * 使用自定义模板评估简历质量（核心逻辑）
 */
function assessResumeWithCustomTemplate(
  parsedData: ParsedResumeData,
  template: any
): QualityAssessmentResult {
  const issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    field: string;
    message: string;
  }> = [];
  const recommendations: string[] = [];
  const dimensionScores: Record<string, number> = {};
  const missingFields: string[] = [];

  // 标准化维度权重
  const totalWeight = template.dimensions.reduce((sum: number, dim: any) => sum + dim.weight, 0);
  const normalizedWeight = totalWeight > 0 ? template.totalWeight / totalWeight : 1;

  // 对每个维度进行评估
  template.dimensions.forEach((dimension: any) => {
    const score = evaluateDimension(parsedData, dimension, issues, recommendations, missingFields);
    dimensionScores[dimension.code] = score;
  });

  // 计算总体评分
  let overallScore = 0;
  template.dimensions.forEach((dimension: any) => {
    const normalizedWeight = (dimension.weight / totalWeight) * 100;
    overallScore += (dimensionScores[dimension.code] * normalizedWeight) / 100;
  });

  overallScore = Math.round(overallScore);

  // 确定置信度等级
  let confidenceLevel: 'high' | 'medium' | 'low';
  if (overallScore >= 80) {
    confidenceLevel = 'high';
  } else if (overallScore >= 60) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  // 检查是否及格
  const passed = overallScore >= template.passThreshold;

  return {
    metrics: {
      overallScore,
      completenessScore: dimensionScores['completeness'] || 0,
      accuracyScore: dimensionScores['accuracy'] || 0,
      consistencyScore: dimensionScores['consistency'] || 0,
    },
    missingFields,
    confidenceLevel,
    recommendations,
    issues,
  };
}

/**
 * 评估单个维度
 */
function evaluateDimension(
  parsedData: ParsedResumeData,
  dimension: any,
  issues: any[],
  recommendations: string[],
  missingFields: string[]
): number {
  const { code, evaluationCriteria, maxScore } = dimension;

  switch (code) {
    case 'completeness':
      return evaluateCompleteness(parsedData, evaluationCriteria, issues, recommendations, missingFields);

    case 'accuracy':
      return evaluateAccuracy(parsedData, evaluationCriteria, issues, recommendations);

    case 'consistency':
      return evaluateConsistency(parsedData, evaluationCriteria, issues);

    case 'skills':
      return evaluateSkills(parsedData, evaluationCriteria, issues, recommendations);

    case 'experience':
      return evaluateExperience(parsedData, evaluationCriteria, issues, recommendations);

    case 'education':
      return evaluateEducation(parsedData, evaluationCriteria, issues, recommendations);

    case 'achievements':
      return evaluateAchievements(parsedData, evaluationCriteria, issues, recommendations);

    default:
      // 自定义维度评估
      return evaluateCustomDimension(parsedData, dimension, issues, recommendations);
  }
}

/**
 * 评估完整性
 */
function evaluateCompleteness(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[],
  missingFields: string[]
): number {
  const requiredFields = criteria?.requiredFields || [
    { field: 'name', label: '姓名' },
    { field: 'phone', label: '手机号' },
    { field: 'email', label: '邮箱' },
  ];

  const importantFields = criteria?.importantFields || [
    { field: 'education', label: '教育经历' },
    { field: 'workExperience', label: '工作经历' },
    { field: 'skills', label: '技能' },
  ];

  let score = criteria?.maxScore || 100;
  const deductionPerField = score / (requiredFields.length + importantFields.length * 0.5);

  // 检查必需字段
  requiredFields.forEach(({ field, label }: any) => {
    if (!parsedData[field as keyof ParsedResumeData]) {
      score -= deductionPerField;
      missingFields.push(label);
      issues.push({
        severity: 'critical',
        field: label,
        message: '缺少必需字段，严重影响简历完整性',
      });
    }
  });

  // 检查重要字段
  importantFields.forEach(({ field, label }: any) => {
    const value = parsedData[field as keyof ParsedResumeData];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      score -= deductionPerField * 0.5;
      missingFields.push(label);
      issues.push({
        severity: 'warning',
        field: label,
        message: '缺少重要字段，影响简历评估',
      });
    }
  });

  return Math.max(0, Math.round(score));
}

/**
 * 评估准确性
 */
function evaluateAccuracy(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[]
): number {
  let score = criteria?.maxScore || 100;
  const maxScore = criteria?.maxScore || 100;

  // 验证手机号格式
  if (parsedData.phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(parsedData.phone)) {
      score -= 15;
      issues.push({
        severity: 'critical',
        field: '手机号',
        message: '手机号格式不正确',
      });
    }
  }

  // 验证邮箱格式
  if (parsedData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parsedData.email)) {
      score -= 15;
      issues.push({
        severity: 'critical',
        field: '邮箱',
        message: '邮箱格式不正确',
      });
    }
  }

  // 验证日期格式
  const dateFields = criteria?.dateFields || ['birthDate', 'availableDate'];
  dateFields.forEach((field: string) => {
    const value = parsedData[field as keyof ParsedResumeData];
    if (value && !isValidDate(value as string)) {
      score -= 5;
      issues.push({
        severity: 'warning',
        field: field,
        message: '日期格式不正确，应为YYYY-MM-DD',
      });
    }
  });

  // 验证工作年限计算
  if (parsedData.workExperience && parsedData.workExperience.length > 0) {
    const calculatedYears = calculateWorkYears(parsedData.workExperience);
    if (parsedData.totalWorkYears && Math.abs(calculatedYears - parsedData.totalWorkYears) > 1) {
      score -= 10;
      issues.push({
        severity: 'warning',
        field: '工作年限',
        message: '工作年限与工作经历计算结果不符',
      });
    }
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估一致性
 */
function evaluateConsistency(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[]
): number {
  let score = criteria?.maxScore || 100;
  const maxScore = criteria?.maxScore || 100;

  // 检查教育经历日期的合理性
  if (parsedData.education && parsedData.education.length > 0) {
    parsedData.education.forEach((edu: any, index: number) => {
      if (edu.startDate && edu.endDate && new Date(edu.startDate) >= new Date(edu.endDate)) {
        score -= 10;
        issues.push({
          severity: 'critical',
          field: `教育经历[${index + 1}]`,
          message: '结束日期应晚于开始日期',
        });
      }
    });
  }

  // 检查工作经历日期的合理性
  if (parsedData.workExperience && parsedData.workExperience.length > 0) {
    parsedData.workExperience.forEach((work: any, index: number) => {
      if (work.startDate && work.endDate && new Date(work.startDate) >= new Date(work.endDate)) {
        score -= 10;
        issues.push({
          severity: 'critical',
          field: `工作经历[${index + 1}]`,
          message: '结束日期应晚于开始日期',
        });
      }
    });

    // 检查工作经历是否有重叠
    for (let i = 0; i < parsedData.workExperience.length - 1; i++) {
      const work1 = parsedData.workExperience[i];
      const work2 = parsedData.workExperience[i + 1];
      if (work1.endDate && work2.startDate && new Date(work1.endDate) > new Date(work2.startDate)) {
        score -= 5;
        issues.push({
          severity: 'warning',
          field: '工作经历',
          message: '检测到工作经历可能有重叠，请核实',
        });
      }
    }
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估技能
 */
function evaluateSkills(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[]
): number {
  let score = criteria?.maxScore || 100;
  const minSkills = criteria?.minSkills || 5;

  if (!parsedData.skills || parsedData.skills.length === 0) {
    score = 0;
    issues.push({
      severity: 'critical',
      field: '技能',
      message: '简历中未列出任何技能',
    });
    recommendations.push('建议补充技能标签，如编程语言、工具、框架等');
  } else if (parsedData.skills.length < minSkills) {
    score = (parsedData.skills.length / minSkills) * 100;
    issues.push({
      severity: 'warning',
      field: '技能',
      message: `技能数量不足（当前${parsedData.skills.length}个，建议至少${minSkills}个）`,
    });
    recommendations.push(`建议补充更多技能标签，提高简历竞争力（目前${parsedData.skills.length}个）`);
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估工作经历
 */
function evaluateExperience(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[]
): number {
  let score = criteria?.maxScore || 100;

  if (!parsedData.workExperience || parsedData.workExperience.length === 0) {
    score = 50; // 有工作经历但不详细
    issues.push({
      severity: 'warning',
      field: '工作经历',
      message: '简历中未详细描述工作经历',
    });
    recommendations.push('建议补充详细的工作经历，包括职责和成果');
  } else {
    // 检查每段工作经历是否有描述
    const hasDescriptions = parsedData.workExperience.every(
      (work: any) => work.description && work.description.length > 20
    );

    if (!hasDescriptions) {
      score -= 30;
      issues.push({
        severity: 'warning',
        field: '工作经历',
        message: '部分工作经历描述过于简单',
      });
      recommendations.push('建议详细描述每段工作经历的主要职责和成果');
    }
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估教育背景
 */
function evaluateEducation(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[]
): number {
  let score = criteria?.maxScore || 100;

  if (!parsedData.education || parsedData.education.length === 0) {
    score = 0;
    issues.push({
      severity: 'warning',
      field: '教育经历',
      message: '简历中未列出教育经历',
    });
    recommendations.push('建议补充教育经历，包括学校、专业、学历等信息');
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估成就
 */
function evaluateAchievements(
  parsedData: ParsedResumeData,
  criteria: any,
  issues: any[],
  recommendations: string[]
): number {
  let score = criteria?.maxScore || 100;

  if (!parsedData.achievements || parsedData.achievements.length === 0) {
    score = 0;
    issues.push({
      severity: 'info',
      field: '成就',
      message: '简历中未列出成就和业绩',
    });
    recommendations.push('建议补充量化业绩和成果，如"提升效率30%"、"节省成本50万"');
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估自定义维度
 */
function evaluateCustomDimension(
  parsedData: ParsedResumeData,
  dimension: any,
  issues: any[],
  recommendations: string[]
): number {
  const { code, evaluationCriteria, maxScore = 100 } = dimension;

  // 根据评估标准进行评估
  if (!evaluationCriteria) {
    return maxScore;
  }

  const { fields, rules } = evaluationCriteria;
  let score = maxScore;

  // 检查必需字段
  if (fields && fields.required) {
    fields.required.forEach((fieldConfig: any) => {
      const value = parsedData[fieldConfig.field as keyof ParsedResumeData];
      if (!value) {
        score -= fieldConfig.weight || 10;
        issues.push({
          severity: fieldConfig.severity || 'warning',
          field: fieldConfig.label || fieldConfig.field,
          message: fieldConfig.message || `缺少${fieldConfig.label || fieldConfig.field}`,
        });
      }
    });
  }

  // 应用自定义规则
  if (rules && rules.length > 0) {
    rules.forEach((rule: any) => {
      if (rule.condition && !evaluateCondition(parsedData, rule.condition)) {
        score -= rule.penalty || 0;
        issues.push({
          severity: rule.severity || 'warning',
          field: rule.field || '自定义',
          message: rule.message || '未满足自定义条件',
        });
      }
    });
  }

  return Math.max(0, Math.round(score));
}

/**
 * 评估条件
 */
function evaluateCondition(parsedData: ParsedResumeData, condition: any): boolean {
  // 实现条件评估逻辑
  // 支持简单的字段比较、数值范围等
  return true;
}

/**
 * 验证日期格式
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}

/**
 * 计算工作年限
 */
function calculateWorkYears(workExperience: any[]): number {
  if (!workExperience || workExperience.length === 0) {
    return 0;
  }

  let totalYears = 0;
  workExperience.forEach((work) => {
    if (work.startDate && work.endDate) {
      const startDate = new Date(work.startDate);
      const endDate = work.endDate === '至今' ? new Date() : new Date(work.endDate);
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += Math.max(0, years);
    }
  });

  return Math.round(totalYears * 10) / 10;
}
