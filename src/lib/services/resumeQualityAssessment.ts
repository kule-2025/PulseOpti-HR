/**
 * 简历解析质量评估系统
 * 评估AI解析的准确度和完整性
 */

export interface QualityMetrics {
  overallScore: number; // 总体评分 0-100
  completenessScore: number; // 完整性评分
  accuracyScore: number; // 准确性评分
  consistencyScore: number; // 一致性评分
}

export interface ParsedResumeData {
  name?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  education?: any[];
  workExperience?: any[];
  totalWorkYears?: number;
  projects?: any[];
  skills?: string[];
  certificates?: string[];
  achievements?: string[];
  expectedSalary?: string;
  availableDate?: string;
  selfIntroduction?: string;
  tags?: string[];
  confidence?: number;
}

export interface QualityAssessmentResult {
  metrics: QualityMetrics;
  missingFields: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    field: string;
    message: string;
  }>;
}

/**
 * 评估简历解析质量
 */
export function assessResumeQuality(parsedData: ParsedResumeData): QualityAssessmentResult {
  const issues: Array<{ severity: 'critical' | 'warning' | 'info'; field: string; message: string }> = [];
  const missingFields: string[] = [];
  const recommendations: string[] = [];

  // 1. 完整性评估
  const requiredFields = [
    { field: 'name', label: '姓名' },
    { field: 'phone', label: '手机号' },
    { field: 'email', label: '邮箱' },
  ];

  const importantFields = [
    { field: 'education', label: '教育经历' },
    { field: 'workExperience', label: '工作经历' },
    { field: 'skills', label: '技能' },
  ];

  let completenessScore = 100;
  requiredFields.forEach(({ field, label }) => {
    if (!parsedData[field as keyof ParsedResumeData]) {
      completenessScore -= 30;
      missingFields.push(label);
      issues.push({
        severity: 'critical',
        field: label,
        message: '缺少必需字段，严重影响简历完整性',
      });
    }
  });

  importantFields.forEach(({ field, label }) => {
    const value = parsedData[field as keyof ParsedResumeData];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      completenessScore -= 10;
      missingFields.push(label);
      issues.push({
        severity: 'warning',
        field: label,
        message: '缺少重要字段，影响简历评估',
      });
    }
  });

  // 2. 准确性评估
  let accuracyScore = 100;

  // 验证手机号格式
  if (parsedData.phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(parsedData.phone)) {
      accuracyScore -= 15;
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
      accuracyScore -= 15;
      issues.push({
        severity: 'critical',
        field: '邮箱',
        message: '邮箱格式不正确',
      });
    }
  }

  // 验证日期格式
  const dateFields = ['birthDate', 'availableDate'];
  dateFields.forEach(field => {
    const value = parsedData[field as keyof ParsedResumeData];
    if (value && !isValidDate(value as string)) {
      accuracyScore -= 5;
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
      accuracyScore -= 10;
      issues.push({
        severity: 'warning',
        field: '工作年限',
        message: '工作年限与工作经历计算结果不符',
      });
    }
  }

  // 3. 一致性评估
  let consistencyScore = 100;

  // 检查教育经历日期的合理性
  if (parsedData.education && parsedData.education.length > 0) {
    parsedData.education.forEach((edu, index) => {
      if (edu.startDate && edu.endDate && new Date(edu.startDate) >= new Date(edu.endDate)) {
        consistencyScore -= 10;
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
    parsedData.workExperience.forEach((work, index) => {
      if (work.startDate && work.endDate && new Date(work.startDate) >= new Date(work.endDate)) {
        consistencyScore -= 10;
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
        consistencyScore -= 5;
        issues.push({
          severity: 'warning',
          field: '工作经历',
          message: '检测到工作经历可能有重叠，请核实',
        });
      }
    }
  }

  // 4. AI置信度评估
  let aiConfidence = parsedData.confidence || 0;
  if (aiConfidence > 0) {
    // 将AI的置信度融入总体评分
    accuracyScore = accuracyScore * 0.7 + aiConfidence * 100 * 0.3;
  }

  // 5. 生成建议
  if (parsedData.skills && parsedData.skills.length < 5) {
    recommendations.push('建议补充更多技能标签，提高简历竞争力');
  }

  if (!parsedData.achievements || parsedData.achievements.length === 0) {
    recommendations.push('建议补充量化业绩和成果，如"提升效率30%"');
  }

  if (!parsedData.certificates || parsedData.certificates.length === 0) {
    recommendations.push('建议补充相关证书和资质');
  }

  if (!parsedData.expectedSalary) {
    recommendations.push('建议补充期望薪资，便于HR筛选');
  }

  // 6. 计算总体评分
  const overallScore = Math.round(
    completenessScore * 0.4 + accuracyScore * 0.4 + consistencyScore * 0.2
  );

  // 7. 确定置信度等级
  let confidenceLevel: 'high' | 'medium' | 'low';
  if (overallScore >= 80) {
    confidenceLevel = 'high';
  } else if (overallScore >= 60) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  return {
    metrics: {
      overallScore,
      completenessScore: Math.round(completenessScore),
      accuracyScore: Math.round(accuracyScore),
      consistencyScore: Math.round(consistencyScore),
    },
    missingFields,
    confidenceLevel,
    recommendations,
    issues,
  };
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
  workExperience.forEach(work => {
    if (work.startDate && work.endDate) {
      const startDate = new Date(work.startDate);
      const endDate = work.endDate === '至今' ? new Date() : new Date(work.endDate);
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += Math.max(0, years);
    }
  });

  return Math.round(totalYears * 10) / 10;
}

/**
 * 批量评估简历质量
 */
export function batchAssessResumeQuality(resumes: ParsedResumeData[]): Map<string, QualityAssessmentResult> {
  const results = new Map<string, QualityAssessmentResult>();

  resumes.forEach((resume, index) => {
    const key = resume.name || `简历${index + 1}`;
    results.set(key, assessResumeQuality(resume));
  });

  return results;
}
