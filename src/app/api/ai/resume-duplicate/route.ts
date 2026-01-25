import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { candidates } from '@/storage/database/shared/schema';
import { eq, or, and, like, ilike } from 'drizzle-orm';

/**
 * AI简历重复检测API
 * 支持11维度重复检测算法
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'none';
  duplicateCandidate?: any;
  matchedDimensions: string[];
  details: {
    nameMatch: { score: number; match: boolean };
    phoneMatch: { score: number; match: boolean };
    emailMatch: { score: number; match: boolean };
    workHistoryMatch: { score: number; match: boolean };
    educationMatch: { score: number; match: boolean };
    skillsMatch: { score: number; match: boolean };
    achievementsMatch: { score: number; match: boolean };
    timelineMatch: { score: number; match: boolean };
    workYearsMatch: { score: number; match: boolean };
    selfIntroductionMatch: { score: number; match: boolean };
    aiAnalysisMatch: { score: number; match: boolean };
  };
}

/**
 * POST /api/ai/resume-duplicate - 检测简历重复
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateData, companyId } = body;

    if (!candidateData || !companyId) {
      return NextResponse.json(
        { error: '缺少候选人数据或企业ID' },
        { status: 400 }
      );
    }

    // 11维度重复检测
    const duplicateResult = await performDuplicateCheck(candidateData, companyId);

    return NextResponse.json({
      success: true,
      data: duplicateResult,
    });

  } catch (error) {
    console.error('重复检测失败:', error);
    return NextResponse.json(
      {
        error: '重复检测失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 执行11维度重复检测
 */
async function performDuplicateCheck(
  candidateData: any,
  companyId: string
): Promise<DuplicateCheckResult> {
  const db = await getDb();

  // 维度1: 精确匹配（姓名+手机号）
  const exactMatch = await db
    .select()
    .from(candidates)
    .where(
      and(
        eq(candidates.companyId, companyId),
        eq(candidates.name, candidateData.name),
        eq(candidates.phone, candidateData.phone)
      )
    )
    .limit(1);

  if (exactMatch.length > 0) {
    return {
      isDuplicate: true,
      confidence: 1.0,
      matchType: 'exact',
      duplicateCandidate: exactMatch[0],
      matchedDimensions: ['nameMatch', 'phoneMatch'],
      details: {
        nameMatch: { score: 1.0, match: true },
        phoneMatch: { score: 1.0, match: true },
        emailMatch: { score: candidateData.email === exactMatch[0].email ? 1.0 : 0, match: candidateData.email === exactMatch[0].email },
        workHistoryMatch: { score: 0, match: false },
        educationMatch: { score: 0, match: false },
        skillsMatch: { score: 0, match: false },
        achievementsMatch: { score: 0, match: false },
        timelineMatch: { score: 0, match: false },
        workYearsMatch: { score: 0, match: false },
        selfIntroductionMatch: { score: 0, match: false },
        aiAnalysisMatch: { score: 0, match: false },
      },
    };
  }

  // 维度2: 邮箱匹配
  const emailMatch = await db
    .select()
    .from(candidates)
    .where(
      and(
        eq(candidates.companyId, companyId),
        eq(candidates.email, candidateData.email)
      )
    )
    .limit(1);

  if (emailMatch.length > 0) {
    return {
      isDuplicate: true,
      confidence: 0.95,
      matchType: 'exact',
      duplicateCandidate: emailMatch[0],
      matchedDimensions: ['emailMatch'],
      details: {
        nameMatch: { score: candidateData.name === emailMatch[0].name ? 1.0 : 0.5, match: candidateData.name === emailMatch[0].name },
        phoneMatch: { score: candidateData.phone === emailMatch[0].phone ? 1.0 : 0, match: candidateData.phone === emailMatch[0].phone },
        emailMatch: { score: 1.0, match: true },
        workHistoryMatch: { score: 0, match: false },
        educationMatch: { score: 0, match: false },
        skillsMatch: { score: 0, match: false },
        achievementsMatch: { score: 0, match: false },
        timelineMatch: { score: 0, match: false },
        workYearsMatch: { score: 0, match: false },
        selfIntroductionMatch: { score: 0, match: false },
        aiAnalysisMatch: { score: 0, match: false },
      },
    };
  }

  // 获取同姓名的所有候选人用于模糊匹配
  const sameNameCandidates = await db
    .select()
    .from(candidates)
    .where(
      and(
        eq(candidates.companyId, companyId),
        ilike(candidates.name, `%${candidateData.name}%`)
      )
    );

  if (sameNameCandidates.length === 0) {
    return {
      isDuplicate: false,
      confidence: 0,
      matchType: 'none',
      matchedDimensions: [],
      details: {
        nameMatch: { score: 0, match: false },
        phoneMatch: { score: 0, match: false },
        emailMatch: { score: 0, match: false },
        workHistoryMatch: { score: 0, match: false },
        educationMatch: { score: 0, match: false },
        skillsMatch: { score: 0, match: false },
        achievementsMatch: { score: 0, match: false },
        timelineMatch: { score: 0, match: false },
        workYearsMatch: { score: 0, match: false },
        selfIntroductionMatch: { score: 0, match: false },
        aiAnalysisMatch: { score: 0, match: false },
      },
    };
  }

  // 模糊匹配评分
  let bestMatch: any = null;
  let bestScore = 0;
  let bestMatchDetails: any = {};
  let matchedDimensionsList: string[] = [];

  for (const existingCandidate of sameNameCandidates) {
    const scores = calculateFuzzyMatchScores(candidateData, existingCandidate);
    
    // 计算加权总分（权重可以调整）
    const weightedScore = 
      scores.nameMatch.score * 0.15 +
      scores.phoneMatch.score * 0.2 +
      scores.emailMatch.score * 0.2 +
      scores.workHistoryMatch.score * 0.15 +
      scores.educationMatch.score * 0.1 +
      scores.skillsMatch.score * 0.1 +
      scores.achievementsMatch.score * 0.05 +
      scores.timelineMatch.score * 0.03 +
      scores.workYearsMatch.score * 0.02 +
      scores.selfIntroductionMatch.score * 0.0 +
      scores.aiAnalysisMatch.score * 0.0;

    const dimensions = Object.entries(scores)
      .filter(([_, score]: [string, any]) => score.match)
      .map(([key, _]) => key);

    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestMatch = existingCandidate;
      bestMatchDetails = scores;
      matchedDimensionsList = dimensions;
    }
  }

  // 判断是否为重复（阈值0.7）
  const isDuplicate = bestScore >= 0.7;

  return {
    isDuplicate,
    confidence: bestScore,
    matchType: isDuplicate ? 'fuzzy' : 'none',
    duplicateCandidate: bestMatch,
    matchedDimensions: matchedDimensionsList,
    details: bestMatchDetails,
  };
}

/**
 * 计算模糊匹配分数（11维度）
 */
function calculateFuzzyMatchScores(
  candidateData: any,
  existingCandidate: any
) {
  const details: any = {};

  // 维度1: 姓名相似度
  details.nameMatch = {
    score: calculateNameSimilarity(candidateData.name, existingCandidate.name),
    match: calculateNameSimilarity(candidateData.name, existingCandidate.name) >= 0.8
  };

  // 维度2: 手机号匹配
  details.phoneMatch = {
    score: candidateData.phone === existingCandidate.phone ? 1.0 : 0,
    match: candidateData.phone === existingCandidate.phone
  };

  // 维度3: 邮箱匹配
  details.emailMatch = {
    score: candidateData.email === existingCandidate.email ? 1.0 : 0,
    match: candidateData.email === existingCandidate.email
  };

  // 维度4: 工作经历匹配
  details.workHistoryMatch = calculateWorkHistoryMatch(
    candidateData.workExperience || [],
    existingCandidate.workExperience || []
  );

  // 维度5: 教育经历匹配
  details.educationMatch = calculateEducationMatch(
    candidateData.education || [],
    existingCandidate.education || []
  );

  // 维度6: 技能匹配
  details.skillsMatch = calculateSkillsMatch(
    candidateData.skills || [],
    existingCandidate.skills || []
  );

  // 维度7: 业绩成果匹配
  details.achievementsMatch = calculateAchievementsMatch(
    candidateData.achievements || [],
    existingCandidate.achievements || []
  );

  // 维度8: 时间线匹配
  details.timelineMatch = calculateTimelineMatch(
    candidateData.workExperience || [],
    existingCandidate.workExperience || []
  );

  // 维度9: 工作年限匹配
  details.workYearsMatch = {
    score: calculateWorkYearsSimilarity(
      candidateData.totalWorkYears || 0,
      existingCandidate.extendedInfo?.totalWorkYears || 0
    ),
    match: Math.abs(
      (candidateData.totalWorkYears || 0) - 
      (existingCandidate.extendedInfo?.totalWorkYears || 0)
    ) <= 1.0
  };

  // 维度10: 自我介绍相似度
  details.selfIntroductionMatch = {
    score: calculateTextSimilarity(
      candidateData.selfIntroduction || '',
      existingCandidate.selfIntroduction || ''
    ),
    match: calculateTextSimilarity(
      candidateData.selfIntroduction || '',
      existingCandidate.selfIntroduction || ''
    ) >= 0.8
  };

  // 维度11: AI分析匹配（使用LLM深度分析）
  details.aiAnalysisMatch = {
    score: 0, // 暂时不实现，可以在需要时集成
    match: false
  };

  return details;
}

/**
 * 计算姓名相似度
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;
  if (name1 === name2) return 1.0;

  // 简单的字符串相似度算法
  const len1 = name1.length;
  const len2 = name2.length;
  const maxLen = Math.max(len1, len2);
  
  let matches = 0;
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (name1[i] === name2[i]) matches++;
  }

  return matches / maxLen;
}

/**
 * 计算工作经历匹配
 */
function calculateWorkHistoryMatch(work1: any[], work2: any[]): { score: number; match: boolean } {
  if (work1.length === 0 || work2.length === 0) {
    return { score: 0, match: false };
  }

  let matchCount = 0;
  for (const w1 of work1) {
    for (const w2 of work2) {
      if (w1.company === w2.company && w1.position === w2.position) {
        matchCount++;
        break;
      }
    }
  }

  const score = matchCount / Math.max(work1.length, work2.length);
  return {
    score,
    match: score >= 0.6
  };
}

/**
 * 计算教育经历匹配
 */
function calculateEducationMatch(edu1: any[], edu2: any[]): { score: number; match: boolean } {
  if (edu1.length === 0 || edu2.length === 0) {
    return { score: 0, match: false };
  }

  let matchCount = 0;
  for (const e1 of edu1) {
    for (const e2 of edu2) {
      if (e1.school === e2.school && e1.major === e2.major) {
        matchCount++;
        break;
      }
    }
  }

  const score = matchCount / Math.max(edu1.length, edu2.length);
  return {
    score,
    match: score >= 0.7
  };
}

/**
 * 计算技能匹配
 */
function calculateSkillsMatch(skills1: string[], skills2: string[]): { score: number; match: boolean } {
  if (skills1.length === 0 || skills2.length === 0) {
    return { score: 0, match: false };
  }

  const set1 = new Set(skills1.map(s => s.toLowerCase()));
  const set2 = new Set(skills2.map(s => s.toLowerCase()));
  
  const intersection = [...set1].filter(x => set2.has(x));
  const union = [...set1, ...set2].filter((x, i, a) => a.indexOf(x) === i);

  const score = intersection.length / union.length;
  return {
    score,
    match: score >= 0.5
  };
}

/**
 * 计算业绩成果匹配
 */
function calculateAchievementsMatch(ach1: string[], ach2: string[]): { score: number; match: boolean } {
  if (ach1.length === 0 || ach2.length === 0) {
    return { score: 0, match: false };
  }

  const set1 = new Set(ach1.map(a => a.toLowerCase()));
  const set2 = new Set(ach2.map(a => a.toLowerCase()));
  
  const intersection = [...set1].filter(x => set2.has(x));
  const union = [...ach1, ...ach2].filter((x, i, a) => a.indexOf(x) === i);

  const score = intersection.length / union.length;
  return {
    score,
    match: score >= 0.5
  };
}

/**
 * 计算时间线匹配
 */
function calculateTimelineMatch(work1: any[], work2: any[]): { score: number; match: boolean } {
  if (work1.length === 0 || work2.length === 0) {
    return { score: 0, match: false };
  }

  // 提取所有时间段
  const periods1 = work1.map(w => `${w.startDate}-${w.endDate}`).sort();
  const periods2 = work2.map(w => `${w.startDate}-${w.endDate}`).sort();

  const matches = periods1.filter(p => periods2.includes(p)).length;
  const score = matches / Math.max(periods1.length, periods2.length);

  return {
    score,
    match: score >= 0.7
  };
}

/**
 * 计算工作年限相似度
 */
function calculateWorkYearsSimilarity(years1: number, years2: number): number {
  if (years1 === years2) return 1.0;
  const diff = Math.abs(years1 - years2);
  return Math.max(0, 1 - diff / 5); // 5年差异内线性递减
}

/**
 * 计算文本相似度
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 1.0;

  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = [...set1].filter(x => set2.has(x));
  const union = [...set1, ...set2].filter((x, i, a) => a.indexOf(x) === i);

  return intersection.length / union.length;
}
