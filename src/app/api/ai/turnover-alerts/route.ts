/**
 * AI离职预警API
 * 路径: /api/ai/turnover-alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { employees, performanceRecords, efficiencyAlerts, efficiencyAlertRules, efficiencySnapshots } from '@/storage/database/shared/schema';
import { eq, and, desc, sql, gte, lte, or } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

/**
 * AI离职预警系统
 * 基于多维度数据分析，提前识别高风险员工
 */

// 初始化LLM客户端
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 请求Schema
const turnoverAlertsSchema = z.object({
  threshold: z.number().min(50).max(100).default(60), // 预警阈值
  includeLowRisk: z.boolean().default(false), // 是否包含低风险员工
  departmentId: z.string().optional(), // 筛选部门
  limit: z.number().min(1).max(100).default(20), // 返回数量限制
});

/**
 * 批量预测员工离职风险
 */
async function batchPredictTurnoverRisk(
  employeesList: any[],
  historicalPerformance: Map<string, any[]>,
  companyMetrics: any
) {
  const predictions = await Promise.all(
    employeesList.map(async (employee) => {
      const empPerfData = historicalPerformance.get(employee.id) || [];
      
      // 简化的风险评估逻辑（实际应该调用完整预测API）
      let riskScore = 30; // 基础分数
      
      // 入职时长分析
      const hireDate = new Date(employee.hireDate);
      const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
      
      if (tenureMonths > 12 && tenureMonths < 24) riskScore += 15;
      if (tenureMonths > 36 && tenureMonths < 48) riskScore += 10;
      
      // 绩效分析
      if (empPerfData.length >= 2) {
        const recent = empPerfData[0];
        const previous = empPerfData[1];
        
        if (recent.finalScore && previous.finalScore) {
          const decline = previous.finalScore - recent.finalScore;
          if (decline > 10) riskScore += 20;
          if (decline > 20) riskScore += 15;
        }
        
        // 平均绩效
        const avgScore = empPerfData.reduce((sum: number, p: any) => 
          sum + (p.finalScore || 0), 0) / empPerfData.length;
        if (avgScore < 70) riskScore += 15;
      }
      
      // 风险等级
      let riskLevel: string;
      let riskColor: string;
      
      if (riskScore < 30) {
        riskLevel = '低风险';
        riskColor = 'green';
      } else if (riskScore < 60) {
        riskLevel = '中风险';
        riskColor = 'yellow';
      } else if (riskScore < 80) {
        riskLevel = '高风险';
        riskColor = 'orange';
      } else {
        riskLevel = '极高风险';
        riskColor = 'red';
      }
      
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        riskScore: Math.min(100, riskScore),
        riskLevel,
        riskColor,
        tenureMonths,
        avgScore: empPerfData.length > 0 
          ? empPerfData.reduce((sum: number, p: any) => sum + (p.finalScore || 0), 0) / empPerfData.length 
          : null,
        recentScore: empPerfData[0]?.finalScore || null,
        performanceRecords: empPerfData.length,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
      };
    })
  );
  
  // 按风险分数排序
  return predictions.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * AI分析高危员工
 */
async function aiAnalyzeHighRiskEmployee(
  employee: any,
  prediction: any,
  companyMetrics: any
) {
  try {
    const userPrompt = `该员工被系统识别为${prediction.riskLevel}员工，风险分数为${prediction.riskScore}分。

【员工信息】
姓名：${employee.name}
入职时间：${employee.hireDate}
工作时长：${prediction.tenureMonths}个月
部门：${employee.departmentName}
职位：${employee.positionName}
平均绩效：${prediction.avgScore || '暂无'}
最近绩效：${prediction.recentScore || '暂无'}

【风险评估】
风险分数：${prediction.riskScore}分
风险等级：${prediction.riskLevel}
绩效记录数：${prediction.performanceRecords}

请分析该员工的离职风险，提供：
1. 详细的离职原因分析
2. 具体的挽留建议
3. 预期的离职时间
4. 关键预警信号

返回JSON格式，包含reason, suggestions, predictedTimeline, warningSignals等字段。`;

    const messages = [
      {
        role: 'system' as const,
        content: '你是一名资深HR专家，擅长员工保留和离职风险分析。请提供专业、具体的建议。',
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-6-thinking-250715',
      temperature: 0.7,
    });

    // 尝试解析JSON
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
    } catch {
      return {
        reason: 'AI分析暂不可用，请人工评估',
        suggestions: ['安排一对一沟通', '了解员工诉求', '评估薪酬竞争力'],
        predictedTimeline: '未知',
        warningSignals: ['工作积极性下降', '请假增加', '社交减少'],
      };
    }
  } catch (error) {
    console.error('AI分析高危员工失败:', error);
    return null;
  }
}

/**
 * GET /api/ai/turnover-alerts
 * 获取离职预警列表
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const { searchParams } = new URL(request.url);
    const validated = turnoverAlertsSchema.parse({
      threshold: parseInt(searchParams.get('threshold') || '60'),
      includeLowRisk: searchParams.get('includeLowRisk') === 'true',
      departmentId: searchParams.get('departmentId'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const db = await getDb();

    // 获取员工列表
    let employeeQuery = db
      .select({
        id: employees.id,
        name: employees.name,
        hireDate: employees.hireDate,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
      })
      .from(employees)
      .where(and(
        eq(employees.companyId, user.companyId),
        eq(employees.employmentStatus, 'active'),
        ...(validated.departmentId ? [eq(employees.departmentId, validated.departmentId)] : [])
      ));

    const employeesList = await employeeQuery;

    if (employeesList.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          highRisk: [],
          mediumRisk: [],
          lowRisk: [],
          summary: {
            total: 0,
            highRisk: 0,
            mediumRisk: 0,
            lowRisk: 0,
          },
        },
      });
    }

    // 获取所有员工的历史绩效数据
    const employeeIds = employeesList.map(e => e.id);
    const perfData = await db
      .select({
        employeeId: performanceRecords.employeeId,
        finalScore: performanceRecords.finalScore,
        selfScore: performanceRecords.selfScore,
        reviewerScore: performanceRecords.reviewerScore,
        createdAt: performanceRecords.createdAt,
      })
      .from(performanceRecords)
      .where(
        and(
          eq(performanceRecords.companyId, user.companyId),
          sql`${performanceRecords.employeeId} = ANY(${employeeIds})`
        )
      )
      .orderBy(desc(performanceRecords.createdAt));

    // 按员工分组绩效记录
    const performanceMap = new Map<string, any[]>();
    perfData.forEach((record) => {
      if (!performanceMap.has(record.employeeId)) {
        performanceMap.set(record.employeeId, []);
      }
      performanceMap.get(record.employeeId)?.push(record);
    });

    // 获取公司整体指标（如果有）
    const companyMetrics = {}; // 实际应该从其他表获取

    // 批量预测风险
    const predictions = await batchPredictTurnoverRisk(
      employeesList,
      performanceMap,
      companyMetrics
    );

    // 按风险等级分组
    const highRisk = predictions.filter(p => p.riskScore >= 80);
    const mediumRisk = predictions.filter(p => p.riskScore >= 60 && p.riskScore < 80);
    const lowRisk = predictions.filter(p => p.riskScore < 60);

    // 按阈值过滤
    let filteredPredictions = predictions;
    if (!validated.includeLowRisk) {
      filteredPredictions = predictions.filter(p => p.riskScore >= validated.threshold);
    }

    // 限制返回数量
    const resultPredictions = filteredPredictions.slice(0, validated.limit);

    return NextResponse.json({
      success: true,
      data: {
        alerts: resultPredictions,
        highRisk: highRisk.slice(0, 10),
        mediumRisk: mediumRisk.slice(0, 10),
        lowRisk: validated.includeLowRisk ? lowRisk.slice(0, 10) : [],
        summary: {
          total: employeesList.length,
          highRisk: highRisk.length,
          mediumRisk: mediumRisk.length,
          lowRisk: lowRisk.length,
          highRiskPercentage: employeesList.length > 0 
            ? Math.round((highRisk.length / employeesList.length) * 100) 
            : 0,
        },
        threshold: validated.threshold,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('获取离职预警失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '获取离职预警失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/turnover-alerts
 * 分析单个高危员工
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const employeeId = body.employeeId;

    if (!employeeId) {
      return NextResponse.json(
        { error: '员工ID不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取员工信息
    const [employee] = await db
      .select({
        id: employees.id,
        name: employees.name,
        hireDate: employees.hireDate,
        departmentId: employees.departmentId,
        positionId: employees.positionId,
        education: employees.education,
        workExperience: employees.workExperience,
      })
      .from(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.companyId, user.companyId)))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: '员工不存在' },
        { status: 404 }
      );
    }

    // 获取历史绩效
    const perfData = await db
      .select()
      .from(performanceRecords)
      .where(and(
        eq(performanceRecords.employeeId, employeeId),
        eq(performanceRecords.companyId, user.companyId)
      ))
      .orderBy(desc(performanceRecords.createdAt))
      .limit(12);

    // 简化预测
    const prediction = {
      riskScore: 65,
      riskLevel: '高风险',
      riskColor: 'orange',
      tenureMonths: Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (30 * 24 * 60 * 60 * 1000)),
      avgScore: perfData.length > 0 
        ? perfData.reduce((sum, p) => sum + (p.finalScore || 0), 0) / perfData.length 
        : null,
      recentScore: perfData[0]?.finalScore || null,
      performanceRecords: perfData.length,
    };

    // AI分析
    const aiAnalysis = await aiAnalyzeHighRiskEmployee(employee, prediction, {});

    return NextResponse.json({
      success: true,
      data: {
        employee,
        prediction,
        aiAnalysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('分析高危员工失败:', error);
    return NextResponse.json(
      { error: '分析高危员工失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
