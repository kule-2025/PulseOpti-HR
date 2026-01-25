'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Trophy,
  Target,
  RefreshCw
} from 'lucide-react';

interface ReportData {
  month: string;
  earned: number;
  redeemed: number;
  activeUsers: number;
  totalUsers: number;
}

interface DepartmentData {
  department: string;
  totalPoints: number;
  avgPoints: number;
  activeUsers: number;
  totalUsers: number;
}

interface SourceData {
  source: string;
  points: number;
  count: number;
  percentage: number;
}

export default function PointsReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'department' | 'source' | 'employee'>('overview');
  const [timeRange, setTimeRange] = useState('6');

  const [monthlyData] = useState<ReportData[]>([
    { month: '2023-07', earned: 22000, redeemed: 6500, activeUsers: 138, totalUsers: 150 },
    { month: '2023-08', earned: 25000, redeemed: 8000, activeUsers: 140, totalUsers: 152 },
    { month: '2023-09', earned: 28000, redeemed: 9000, activeUsers: 142, totalUsers: 155 },
    { month: '2023-10', earned: 26000, redeemed: 7500, activeUsers: 145, totalUsers: 158 },
    { month: '2023-11', earned: 30000, redeemed: 10000, activeUsers: 148, totalUsers: 160 },
    { month: '2023-12', earned: 32000, redeemed: 11000, activeUsers: 150, totalUsers: 162 }
  ]);

  const [departmentData] = useState<DepartmentData[]>([
    { department: '销售部', totalPoints: 58000, avgPoints: 3866, activeUsers: 15, totalUsers: 15 },
    { department: '技术部', totalPoints: 52000, avgPoints: 3466, activeUsers: 15, totalUsers: 16 },
    { department: '市场部', totalPoints: 38000, avgPoints: 2533, activeUsers: 15, totalUsers: 17 },
    { department: '财务部', totalPoints: 24000, avgPoints: 1600, activeUsers: 15, totalUsers: 15 },
    { department: '人力资源部', totalPoints: 18000, avgPoints: 1200, activeUsers: 15, totalUsers: 15 },
    { department: '行政部', totalPoints: 16000, avgPoints: 1066, activeUsers: 14, totalUsers: 15 }
  ]);

  const [sourceData] = useState<SourceData[]>([
    { source: '全勤奖励', points: 45000, count: 156, percentage: 25 },
    { source: '绩效奖励', points: 68000, count: 45, percentage: 38 },
    { source: '培训完成', points: 32000, count: 234, percentage: 18 },
    { source: '创新提案', points: 15000, count: 12, percentage: 8 },
    { source: '专项奖励', points: 10000, count: 8, percentage: 6 },
    { source: '其他', points: 9000, count: 56, percentage: 5 }
  ]);

  const totalEarned = monthlyData.reduce((sum, d) => sum + d.earned, 0);
  const totalRedeemed = monthlyData.reduce((sum, d) => sum + d.redeemed, 0);
  const avgActiveUsers = Math.round(monthlyData.reduce((sum, d) => sum + d.activeUsers, 0) / monthlyData.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">积分报表</h1>
              <p className="text-sm text-gray-600 mt-1">积分发放、兑换与参与度分析</p>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">最近3个月</SelectItem>
                  <SelectItem value="6">最近6个月</SelectItem>
                  <SelectItem value="12">最近1年</SelectItem>
                  <SelectItem value="24">最近2年</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出报表
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 概览统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">累计发放</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalEarned.toLocaleString()}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                较上期 +15.2%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">累计兑换</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalRedeemed.toLocaleString()}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                较上期 +12.8%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">净增长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{(totalEarned - totalRedeemed).toLocaleString()}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                较上期 +16.5%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">活跃用户</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{avgActiveUsers}</div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                参与率 {((avgActiveUsers / 162) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="department">
              <Target className="h-4 w-4 mr-2" />
              部门分析
            </TabsTrigger>
            <TabsTrigger value="source">
              <Trophy className="h-4 w-4 mr-2" />
              来源分析
            </TabsTrigger>
            <TabsTrigger value="employee">
              <Users className="h-4 w-4 mr-2" />
              员工分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 月度趋势 */}
              <Card>
                <CardHeader>
                  <CardTitle>月度趋势</CardTitle>
                  <CardDescription>积分发放与兑换月度变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{item.month}</div>
                          <div className="text-sm text-gray-600">
                            发放: {item.earned.toLocaleString()} | 兑换: {item.redeemed.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +{(item.earned - item.redeemed).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.activeUsers}/{item.totalUsers} 活跃
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 参与度趋势 */}
              <Card>
                <CardHeader>
                  <CardTitle>参与度趋势</CardTitle>
                  <CardDescription>员工活跃度变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((item, index) => {
                      const percentage = (item.activeUsers / item.totalUsers) * 100;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.month}</span>
                            <span className="text-sm text-gray-600">
                              {item.activeUsers} / {item.totalUsers} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="department">
            <Card>
              <CardHeader>
                <CardTitle>部门积分统计</CardTitle>
                <CardDescription>各部门积分发放与参与度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold">{item.department}</div>
                          <div className="text-sm text-gray-600">
                            {item.activeUsers}/{item.totalUsers} 人活跃 · 平均 {item.avgPoints} 分
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{item.totalPoints.toLocaleString()}</div>
                          <Badge variant="outline">
                            排名 #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-green-100 rounded-lg p-3 text-center">
                          <div className="text-sm text-green-700">累计发放</div>
                          <div className="font-bold text-green-800">{item.totalPoints.toLocaleString()}</div>
                        </div>
                        <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center">
                          <div className="text-sm text-blue-700">人均积分</div>
                          <div className="font-bold text-blue-800">{item.avgPoints.toLocaleString()}</div>
                        </div>
                        <div className="flex-1 bg-purple-100 rounded-lg p-3 text-center">
                          <div className="text-sm text-purple-700">参与率</div>
                          <div className="font-bold text-purple-800">
                            {((item.activeUsers / item.totalUsers) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 来源分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>来源分布</CardTitle>
                  <CardDescription>积分来源占比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.source}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{item.points.toLocaleString()}分</span>
                            <span className="text-sm font-medium">{item.percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.count} 次发放
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 来源详情 */}
              <Card>
                <CardHeader>
                  <CardTitle>来源详情</CardTitle>
                  <CardDescription>各积分来源详细信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sourceData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-green-500' :
                            index === 3 ? 'bg-purple-500' :
                            index === 4 ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.source}</div>
                            <div className="text-sm text-gray-600">{item.count} 次发放</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{item.points.toLocaleString()}</div>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employee">
            <Card>
              <CardHeader>
                <CardTitle>员工积分分析</CardTitle>
                <CardDescription>员工积分分布与排名</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">高分段 (≥5000分)</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700">12人</div>
                    <div className="text-sm text-green-600">占比 7.4%</div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">中分段 (2000-5000分)</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-700">45人</div>
                    <div className="text-sm text-blue-600">占比 27.8%</div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-800">低分段 (&lt;2000分)</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-700">105人</div>
                    <div className="text-sm text-gray-600">占比 64.8%</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">积分排行榜 TOP 10</h3>
                    <Button variant="outline" size="sm">
                      查看完整榜单
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: '张三', department: '销售部', points: 5800, avatar: 'ZS' },
                      { name: '李四', department: '技术部', points: 5200, avatar: 'LS' },
                      { name: '王五', department: '市场部', points: 4800, avatar: 'WW' },
                      { name: '赵六', department: '销售部', points: 4500, avatar: 'ZL' },
                      { name: '陈七', department: '技术部', points: 4200, avatar: 'CQ' },
                      { name: '周八', department: '财务部', points: 4000, avatar: 'ZB' },
                      { name: '吴九', department: '市场部', points: 3800, avatar: 'WJ' },
                      { name: '郑十', department: '销售部', points: 3600, avatar: 'ZS' },
                      { name: '孙十一', department: '技术部', points: 3500, avatar: 'SY' },
                      { name: '钱十二', department: '人力资源部', points: 3200, avatar: 'QE' },
                    ].map((employee, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {employee.avatar}
                          </div>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-600">{employee.department}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{employee.points.toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs">
                            {index === 0 ? '积分王' : index < 3 ? '前三名' : '优秀'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
