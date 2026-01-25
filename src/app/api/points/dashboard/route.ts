import { NextRequest, NextResponse } from 'next/server';
import {
  getEmployeePoints,
  getLeaderboard,
  getPointTransactions,
  getExchangeItems,
  getExchangeRecords,
  getPointStatistics,
} from '@/storage/database/pointsManager';

/**
 * GET /api/points/dashboard
 * 获取积分仪表盘数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const employeeId = searchParams.get('employeeId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: '缺少公司ID' }, { status: 400 });
    }

    // 并行获取数据
    const [employeePointsData, leaderboardData, recentTransactions, exchangeItemsData, statisticsData] =
      await Promise.all([
        // 获取员工积分（如果指定了employeeId则获取该员工，否则获取全部）
        employeeId
          ? getEmployeePoints(companyId, employeeId).then(data => data[0] || null)
          : getEmployeePoints(companyId).then(data => ({
              totalEmployees: data.length,
              totalPoints: data.reduce((sum: number, p) => sum + p.totalPoints, 0),
              averagePoints: data.length > 0 ? Math.round(data.reduce((sum: number, p) => sum + p.totalPoints, 0) / data.length) : 0,
            })),

        // 获取排行榜
        getLeaderboard(companyId, 'all', undefined, 10),

        // 获取最近交易记录
        employeeId ? getPointTransactions(companyId, employeeId, 10) : getPointTransactions(companyId, undefined, 10),

        // 获取可用兑换商品
        getExchangeItems(companyId).then(data => data.filter((item: any) => item.stock > 0 || item.unlimitedStock)),

        // 获取本月统计
        getPointStatistics(companyId, 'monthly', new Date().toISOString().slice(0, 7)),
      ]);

    // 计算月度统计
    const monthlyStats = statisticsData.reduce(
      (acc: { totalEarned: number; totalRedeemed: number; transactionCount: number }, stat) => ({
        totalEarned: acc.totalEarned + stat.earnedPoints,
        totalRedeemed: acc.totalRedeemed + stat.redeemedPoints,
        transactionCount: acc.transactionCount + stat.transactionCount,
      }),
      { totalEarned: 0, totalRedeemed: 0, transactionCount: 0 }
    );

    const responseData = employeeId
      ? // 员工视图
        {
          employeePoints: employeePointsData,
          leaderboard: leaderboardData,
          recentTransactions,
          availableExchangeItems: exchangeItemsData.slice(0, 10),
          monthlyStats,
        }
      : // 管理员视图
        {
          summary: employeePointsData,
          leaderboard: leaderboardData,
          recentTransactions,
          availableExchangeItems: exchangeItemsData,
          monthlyStats,
        };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('获取积分仪表盘数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取积分仪表盘数据失败' },
      { status: 500 }
    );
  }
}
