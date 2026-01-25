/**
 * 简历重复检测系统（增强版）
 * 基于11维度相似度算法检测重复简历
 */

export interface CandidateData {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  education?: any[];
  workExperience?: any[];
  skills?: string[];
  certificates?: string[];
  projects?: any[];
  selfIntroduction?: string;
  achievements?: string[];
}

export interface SimilarityScore {
  score: number; // 0-100
  level: 'duplicate' | 'high' | 'medium' | 'low';
  dimensions: {
    name: number;
    phone: number;
    email: number;
    education: number;
    workExperience: number;
    skills: number;
    certificates: number;
    achievements: number;
    projects: number;
    textSimilarity: number;
    overall: number;
  };
  matchedFields: string[];
  reasons: string[];
}

/**
 * 计算两个候选人的相似度分数（增强版 - 11维度）
 */
export function calculateSimilarity(candidate1: CandidateData, candidate2: CandidateData): SimilarityScore {
  const dimensions = {
    name: calculateNameSimilarity(candidate1.name, candidate2.name),
    phone: calculatePhoneSimilarity(candidate1.phone, candidate2.phone),
    email: calculateEmailSimilarity(candidate1.email, candidate2.email),
    education: calculateEducationSimilarity(candidate1.education, candidate2.education),
    workExperience: calculateWorkExperienceSimilarity(candidate1.workExperience, candidate2.workExperience),
    skills: calculateSkillsSimilarity(candidate1.skills, candidate2.skills),
    certificates: calculateCertificatesSimilarity(candidate1.certificates, candidate2.certificates),
    achievements: calculateAchievementsSimilarity(candidate1.achievements, candidate2.achievements),
    projects: calculateProjectsSimilarity(candidate1.projects, candidate2.projects),
    textSimilarity: calculateTextSimilarity(candidate1, candidate2),
    overall: 0,
  };

  // 权重配置
  const weights = {
    phone: 0.25, // 手机号最重要
    email: 0.20, // 邮箱次之
    name: 0.15, // 姓名权重
    workExperience: 0.12, // 工作经历
    education: 0.10, // 教育经历
    skills: 0.08, // 技能
    textSimilarity: 0.05, // 文本相似度
    certificates: 0.03, // 证书
    achievements: 0.01, // 成就
    projects: 0.01, // 项目
  };

  // 计算加权总分
  dimensions.overall =
    dimensions.phone * weights.phone +
    dimensions.email * weights.email +
    dimensions.name * weights.name +
    dimensions.workExperience * weights.workExperience +
    dimensions.education * weights.education +
    dimensions.skills * weights.skills +
    dimensions.textSimilarity * weights.textSimilarity +
    dimensions.certificates * weights.certificates +
    dimensions.achievements * weights.achievements +
    dimensions.projects * weights.projects;

  // 确定相似度等级
  let level: 'duplicate' | 'high' | 'medium' | 'low';
  if (dimensions.overall >= 90) {
    level = 'duplicate';
  } else if (dimensions.overall >= 70) {
    level = 'high';
  } else if (dimensions.overall >= 50) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // 识别匹配的字段
  const matchedFields: string[] = [];
  const reasons: string[] = [];

  if (dimensions.phone === 100) {
    matchedFields.push('手机号');
    reasons.push('手机号完全匹配');
  }

  if (dimensions.email === 100) {
    matchedFields.push('邮箱');
    reasons.push('邮箱完全匹配');
  }

  if (dimensions.name === 100) {
    matchedFields.push('姓名');
    reasons.push('姓名完全匹配');
  } else if (dimensions.name >= 70) {
    matchedFields.push('姓名');
    reasons.push('姓名高度相似');
  }

  if (dimensions.workExperience >= 60) {
    matchedFields.push('工作经历');
    reasons.push('工作经历高度相似');
  }

  if (dimensions.education >= 60) {
    matchedFields.push('教育经历');
    reasons.push('教育经历高度相似');
  }

  if (dimensions.skills >= 50) {
    matchedFields.push('技能');
    reasons.push('技能高度相似');
  }

  if (dimensions.textSimilarity >= 50) {
    matchedFields.push('简历内容');
    reasons.push('简历文本内容相似');
  }

  return {
    score: Math.round(dimensions.overall),
    level,
    dimensions,
    matchedFields,
    reasons,
  };
}

/**
 * 姓名相似度计算
 */
function calculateNameSimilarity(name1?: string, name2?: string): number {
  if (!name1 || !name2) return 0;

  if (name1 === name2) return 100;

  // 简单的相似度检查
  if (name1.includes(name2) || name2.includes(name1)) {
    return 70;
  }

  // 计算编辑距离
  const editDistance = levenshteinDistance(name1, name2);
  const maxLength = Math.max(name1.length, name2.length);
  const similarity = (1 - editDistance / maxLength) * 100;

  return Math.round(similarity);
}

/**
 * 手机号相似度计算
 */
function calculatePhoneSimilarity(phone1?: string, phone2?: string): number {
  if (!phone1 || !phone2) return 0;
  return phone1 === phone2 ? 100 : 0;
}

/**
 * 邮箱相似度计算
 */
function calculateEmailSimilarity(email1?: string, email2?: string): number {
  if (!email1 || !email2) return 0;
  return email1.toLowerCase() === email2.toLowerCase() ? 100 : 0;
}

/**
 * 教育经历相似度计算
 */
function calculateEducationSimilarity(edu1?: any[], edu2?: any[]): number {
  if (!edu1 || !edu2 || edu1.length === 0 || edu2.length === 0) return 0;

  let matchCount = 0;
  const maxCount = Math.max(edu1.length, edu2.length);

  edu1.forEach(e1 => {
    const match = edu2.find(e2 =>
      e1.school === e2.school &&
      e1.major === e2.major &&
      e1.degree === e2.degree
    );
    if (match) matchCount++;
  });

  return Math.round((matchCount / maxCount) * 100);
}

/**
 * 工作经历相似度计算
 */
function calculateWorkExperienceSimilarity(work1?: any[], work2?: any[]): number {
  if (!work1 || !work2 || work1.length === 0 || work2.length === 0) return 0;

  let totalSimilarity = 0;
  const maxCount = Math.max(work1.length, work2.length);

  work1.forEach(w1 => {
    let bestMatch = 0;
    work2.forEach(w2 => {
      if (w1.company === w2.company && w1.position === w2.position) {
        bestMatch = 100;
      } else if (w1.company === w2.company || w1.position === w2.position) {
        bestMatch = 60;
      }
    });
    totalSimilarity += bestMatch;
  });

  return Math.round(totalSimilarity / maxCount);
}

/**
 * 技能相似度计算
 */
function calculateSkillsSimilarity(skills1?: string[], skills2?: string[]): number {
  if (!skills1 || !skills2 || skills1.length === 0 || skills2.length === 0) return 0;

  const set1 = new Set(skills1.map(s => s.toLowerCase()));
  const set2 = new Set(skills2.map(s => s.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const similarity = (intersection.size / union.size) * 100;
  return Math.round(similarity);
}

/**
 * 证书相似度计算
 */
function calculateCertificatesSimilarity(cert1?: string[], cert2?: string[]): number {
  if (!cert1 || !cert2 || cert1.length === 0 || cert2.length === 0) return 0;

  const set1 = new Set(cert1.map(c => c.toLowerCase()));
  const set2 = new Set(cert2.map(c => c.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const similarity = (intersection.size / union.size) * 100;
  return Math.round(similarity);
}

/**
 * 成就相似度计算
 */
function calculateAchievementsSimilarity(ach1?: string[], ach2?: string[]): number {
  if (!ach1 || !ach2 || ach1.length === 0 || ach2.length === 0) return 0;

  const text1 = ach1.join(' ');
  const text2 = ach2.join(' ');

  return calculateTextSimilarityRaw(text1, text2);
}

/**
 * 项目相似度计算
 */
function calculateProjectsSimilarity(proj1?: any[], proj2?: any[]): number {
  if (!proj1 || !proj2 || proj1.length === 0 || proj2.length === 0) return 0;

  let totalSimilarity = 0;
  const maxCount = Math.max(proj1.length, proj2.length);

  proj1.forEach(p1 => {
    let bestMatch = 0;
    proj2.forEach(p2 => {
      if (p1.name === p2.name) {
        bestMatch = 100;
      } else if (p1.description && p2.description) {
        bestMatch = calculateTextSimilarityRaw(p1.description, p2.description);
      }
    });
    totalSimilarity += bestMatch;
  });

  return Math.round(totalSimilarity / maxCount);
}

/**
 * 文本相似度计算（基于简历整体内容）
 */
function calculateTextSimilarity(candidate1: CandidateData, candidate2: CandidateData): number {
  const text1 = buildTextSummary(candidate1);
  const text2 = buildTextSummary(candidate2);

  return calculateTextSimilarityRaw(text1, text2);
}

/**
 * 构建文本摘要
 */
function buildTextSummary(candidate: CandidateData): string {
  const parts: string[] = [];

  if (candidate.selfIntroduction) {
    parts.push(candidate.selfIntroduction);
  }

  if (candidate.achievements && candidate.achievements.length > 0) {
    parts.push(candidate.achievements.join(' '));
  }

  if (candidate.workExperience && candidate.workExperience.length > 0) {
    candidate.workExperience.forEach(work => {
      if (work.description) parts.push(work.description);
      if (work.achievements && work.achievements.length > 0) {
        parts.push(work.achievements.join(' '));
      }
    });
  }

  return parts.join(' ');
}

/**
 * 文本相似度计算（原始）
 */
function calculateTextSimilarityRaw(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  // 简单的词汇重叠计算
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;

  const similarity = (intersection.size / union.size) * 100;
  return Math.round(similarity);
}

/**
 * 计算编辑距离（Levenshtein Distance）
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    for (let j = 0; j <= n; j++) {
      dp[i][j] = 0;
    }
  }

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 批量检测重复简历
 */
export function batchDetectDuplicates(
  candidates: CandidateData[],
  threshold: number = 70
): Map<string, Array<{ candidate: CandidateData; similarity: SimilarityScore }>> {
  const duplicates = new Map<string, Array<{ candidate: CandidateData; similarity: SimilarityScore }>>();

  for (let i = 0; i < candidates.length; i++) {
    const current = candidates[i];
    const key = current.name || `候选人${i + 1}`;

    for (let j = i + 1; j < candidates.length; j++) {
      const other = candidates[j];
      const similarity = calculateSimilarity(current, other);

      if (similarity.score >= threshold) {
        if (!duplicates.has(key)) {
          duplicates.set(key, []);
        }
        duplicates.get(key)!.push({
          candidate: other,
          similarity,
        });
      }
    }
  }

  return duplicates;
}

/**
 * 智能合并候选人的重复信息
 */
export function mergeDuplicateCandidates(primary: CandidateData, duplicate: CandidateData): CandidateData {
  const merged: CandidateData = { ...primary };

  // 优先使用有值的字段
  const fields: (keyof CandidateData)[] = [
    'phone',
    'email',
    'name',
    'education',
    'workExperience',
    'skills',
    'certificates',
    'projects',
    'achievements',
    'selfIntroduction',
  ];

  fields.forEach(field => {
    const primaryValue = primary[field];
    const duplicateValue = duplicate[field];

    if (!primaryValue && duplicateValue) {
      (merged as any)[field] = duplicateValue;
    } else if (
      primaryValue &&
      duplicateValue &&
      Array.isArray(primaryValue) &&
      Array.isArray(duplicateValue)
    ) {
      // 合并数组并去重
      const mergedArray = [...new Set([...primaryValue, ...duplicateValue])];
      (merged as any)[field] = mergedArray;
    }
  });

  return merged;
}
