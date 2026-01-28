'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Gift,
  TrendingUp,
  Calendar,
  Users,
  Award,
  ShoppingBag,
  Target,
  Trophy,
  Search,
  Filter,
  Eye,
  Crown,
  Zap,
  Star,
  ArrowUp,
} from 'lucide-react';

interface PointsRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  totalPoints: number;
  rank: number;
  monthPoints: number;
  lastEarnedDate: string;
  lastEarnedReason: string;
  activities: {
    id: string;
    type: string;
    points: number;
    date: string;
    description: string;
  }[];
  rewards: {
    id: string;
    name: string;
    points: number;
    redeemedDate: string;
  }[];
}

// 模拟积分数据
const POINTS_DATA: PointsRecord[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    totalPoints: 5850,
    rank: 1,
    monthPoints: 450,
    lastEarnedDate: '2025-01-15',
    lastEarnedReason: '项目上线奖励',
    activities: [
      { id: 'act-1', type: '奖励', points: 300, date: '2025-01-15', description: '项目上线奖励' },
      { id: 'act-2', type: '奖励', points: 150, date: '2025-01-10', description: '代码质量优秀' },
      { id: 'act-3', type: '兑换', points: -500, date: '2025-01-08', description: '兑换咖啡券' },
    ],
    rewards: [
      { id: 'reward-1', name: '星巴克咖啡券', points: 500, redeemedDate: '2025-01-08' },
    ],
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    totalPoints: 5200,
    rank: 2,
    monthPoints: 600,
    lastEarnedDate: '2025-01-16',
    lastEarnedReason: '超额完成销售目标',
    activities: [
      { id: 'act-1', type: '奖励', points: 500, date: '2025-01-16', description: '超额完成销售目标' },
      { id: 'act-2', type: '奖励', points: 100, date: '2025-01-12', description: '客户好评' },
    ],
    rewards: [],
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '技术部',
    totalPoints: 4800,
    rank: 3,
    monthPoints: 350,
    lastEarnedDate: '2025-01-14',
    lastEarnedReason: '完成技术培训',
    activities: [
      { id: 'act-1', type: '奖励', points: 350, date: '2025-01-14', description: '完成技术培训' },
      { id: 'act-2', type: '兑换', points: -800, date: '2025-01-05', description: '兑换电影票' },
    ],
    rewards: [
      { id: 'reward-1', name: '电影票', points: 800, redeemedDate: '2025-01-05' },
    ],
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '市场部',
    totalPoints: 4100,
    rank: 4,
    monthPoints: 280,
    lastEarnedDate: '2025-01-13',
    lastEarnedReason: '创意提案采纳',
    activities: [
      { id: 'act-1', type: '奖励', points: 280, date: '2025-01-13', description: '创意提案采纳' },
    ],
    rewards: [],
  },
  {
    id: '5',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '人力资源部',
    totalPoints: 3800,
    rank: 5,
    monthPoints: 220,
    lastEarnedDate: '2025-01-12',
    lastEarnedReason: '员工关怀活动参与',
    activities: [
      { id: 'act-1', type: '奖励', points: 220, date: '2025-01-12', description: '员工关怀活动参与' },
    ],
    rewards: [],
  },
];

const REWARD_ITEMS = [
  { id: 'r1', name: '星巴克咖啡券', points: 500, image: '☕', category: '餐饮' },
  { id: 'r2', name: '电影票', points: 800, image: '🎬', category: '娱乐' },
  { id: 'r3', name: '购物卡', points: 1000, image: '🛍️', category: '购物' },
  { id: 'r4', name: '健身卡', points: 2000, image: '💪', category: '健康' },
  { id: 'r5', name: '旅游券', points: 3000, image: '✈️', category: '旅游' },
  { id: 'r6', name: '培训课程', points: 1500, image: '📚', category: '学习' },
];

const ACTIVITY_TYPE_CONFIG = {
  '奖励': { label: '奖励', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  '兑换': { label: '兑换', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' },
  '扣除': { label: '扣除', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export default function PointsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'rewards'>('overview');

  // 过滤积分记录
  const filteredRecords = useMemo(() => {
    let records = POINTS_DATA;

    // 按部门过滤
    if (departmentFilter !== 'all') {
      records = records.filter(r => r.department === departmentFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      records = records.filter(r =>
        r.employeeName.toLowerCase().includes(query) ||
        r.employeeId.toLowerCase().includes(query)
      );
    }

    return records;
  }, [searchQuery, departmentFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      totalPoints: POINTS_DATA.reduce((sum, r) => sum + r.totalPoints, 0),
      monthPoints: POINTS_DATA.reduce((sum, r) => sum + r.monthPoints, 0),
      totalRedeemed: POINTS_DATA.reduce((sum, r) => sum + r.rewards.reduce((s, rw) => s + rw.points, 0), 0),
      avgPoints: POINTS_DATA.reduce((sum, r) => sum + r.totalPoints, 0) / POINTS_DATA.length,
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(POINTS_DATA.map(record => record.department)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              积分仪表盘
            </h1>
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <Gift className="h-3 w-3 mr-1" />
              NEW
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            员工积分管理与激励系统
          </p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Gift className="h-4 w-4 mr-2" />
          奖励积分
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总积分池</CardDescription>
            <CardTitle className="text-3xl">{stats.totalPoints.toLocaleString()}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              累计发放
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              本月发放
            </CardDescription>
            <CardTitle className="text-3xl">{stats.monthPoints}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              积分
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
              已兑换
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalRedeemed.toLocaleString()}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              积分
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均积分</CardDescription>
            <CardTitle className="text-3xl">{Math.round(stats.avgPoints)}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              平均值
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 积分排行榜 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>积分排行榜</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部部门</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无积分记录
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有积分记录
                </p>
              </div>
            ) : (
              filteredRecords.map((record, index) => {
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${record.rank}`;

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* 排名 */}
                        <div className="w-16 text-center shrink-0">
                          <div className="text-3xl font-bold">
                            {rankIcon}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {typeof rankIcon === 'string' && rankIcon.startsWith('#') ? '' : '排名'}
                          </div>
                        </div>

                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {record.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {record.employeeName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {record.department}
                            </p>
                          </div>
                        </div>

                        {/* 积分信息 */}
                        <div className="grid grid-cols-3 gap-6 px-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                              {record.totalPoints}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">总积分</div>
                          </div>

                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              +{record.monthPoints}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">本月获得</div>
                          </div>

                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              record.monthPoints >= 500 ? 'text-green-600' :
                              record.monthPoints >= 300 ? 'text-yellow-600' :
                              'text-gray-400'
                            }`}>
                              {record.monthPoints >= 500 && <Trophy className="h-6 w-6 mx-auto" />}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">本月表现</div>
                          </div>
                        </div>

                        {/* 最近获得 */}
                        <div className="w-48 shrink-0 px-4">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            最近获得
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {record.lastEarnedReason}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {record.lastEarnedDate}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 兑换商城 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>积分兑换商城</CardTitle>
            <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
              <ShoppingBag className="h-4 w-4 mr-2" />
              查看全部
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {REWARD_ITEMS.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-5xl mb-3">{item.image}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      {item.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {item.points}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        积分
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                      立即兑换
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
