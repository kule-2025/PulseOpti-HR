import { NextRequest, NextResponse } from 'next/server';
import {
  getLeaderboard,
  refreshLeaderboard,
  getLeaderboardByEmployee,
} from '@/storage/database/pointsManager';

/**
 * GET /api/points/leaderboard
 * 获取积分排行榜
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || 'all'; // all, daily, weekly, monthly, yearly
    const periodValue = searchParams.get('periodValue');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    const leaderboard = await getLeaderboard(
      companyId,
      period,
      periodValue || undefined,
      limit
    );

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json({ success: false, error: '获取排行榜失败' }, { status: 500 });
  }
}

/**
 * POST /api/points/leaderboard/refresh
 * 刷新排行榜
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, period, periodValue } = body;

    if (!companyId || !period) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const leaderboard = await refreshLeaderboard(
      companyId,
      period,
      periodValue || undefined
    );

    return NextResponse.json({
      success: true,
      data: leaderboard,
      message: '排行榜刷新成功',
    });
  } catch (error) {
    console.error('刷新排行榜失败:', error);
    return NextResponse.json({ success: false, error: '刷新排行榜失败' }, { status: 500 });
  }
}

/**
 * GET /api/points/leaderboard/employee
 * 获取员工在排行榜中的位置
 */
export async function getEmployeeRank(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period') || 'all';
    const periodValue = searchParams.get('periodValue');

    if (!companyId || !employeeId) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const rankInfo = await getLeaderboardByEmployee(
      companyId,
      employeeId,
      period,
      periodValue || undefined
    );

    if (!rankInfo) {
      return NextResponse.json({ success: false, error: '未找到排名信息' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: rankInfo,
    });
  } catch (error) {
    console.error('获取员工排名失败:', error);
    return NextResponse.json({ success: false, error: '获取员工排名失败' }, { status: 500 });
  }
}
