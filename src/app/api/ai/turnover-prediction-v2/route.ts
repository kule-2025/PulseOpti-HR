import { NextRequest, NextResponse } from 'next/server';
import { enhancedTurnoverPredictionService } from '@/lib/ai/enhanced-turnover-prediction';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * AI离职预测增强API
 * POST /api/ai/turnover-prediction-enhanced
 */

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as any;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'predict':
        return await predictSingle(body, user);
      case 'batch':
        return await batchPredict(user);
      case 'warnings':
        return await getEarlyWarnings(user);
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('离职预测操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

async function predictSingle(body: any, user: any) {
  const { employeeId } = body;

  if (!employeeId) {
    return NextResponse.json(
      { error: '缺少员工ID' },
      { status: 400 }
    );
  }

  const features = await enhancedTurnoverPredictionService.extractFeatures(
    employeeId,
    user.companyId
  );
  const risk = await enhancedTurnoverPredictionService.predictTurnoverRisk(features);

  return NextResponse.json({
    success: true,
    data: { features, risk },
  });
}

async function batchPredict(user: any) {
  const risks = await enhancedTurnoverPredictionService.batchPredict(user.companyId);

  return NextResponse.json({
    success: true,
    data: risks,
    count: risks.length,
  });
}

async function getEarlyWarnings(user: any) {
  const warnings = await enhancedTurnoverPredictionService.detectEarlyWarnings(user.companyId);

  return NextResponse.json({
    success: true,
    data: warnings,
    count: warnings.length,
  });
}
