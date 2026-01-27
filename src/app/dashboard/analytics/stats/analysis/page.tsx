'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, Users, Briefcase, Award, Calendar } from 'lucide-react';

export default function StatsAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchStatsData();
  }, [period, year]);

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/stats?period=${period}&year=${year}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setData(mockData);
      }
    } catch (error) {
      console.error('Error fetching stats data:', error);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const mockData = {
    overview: {
      totalEmployees: 65,
      newHires: 8,
      departures: 3,
      vacancies: 5,
      avgTenure: 2.8,
      turnoverRate: 4.6,
      promotionRate: 12.3,
      trainingRate: 78.5,
    },
    recruitment: {
      positions: { open: 5, filled: 12, total: 17 },
      timeToHire: { min: 7, max: 45, avg: 21 },
      source: {
        referral: 5,
        jobBoard: 4,
        campus: 2,
        socialMedia: 1,
      },
      quality: {
        offerAcceptRate: 85,
        candidateSatisfaction: 4.2,
        hiringManagerSatisfaction: 4.5,
      },
    },
    performance: {
      distribution: [
        { level: '优秀', count: 12, percentage: 18.5 },
        { level: '良好', count: 28, percentage: 43.1 },
        { level: '合格', count: 20, percentage: 30.8 },
        { level: '待改进', count: 5, percentage: 7.7 },
      ],
      trends: {
        overall: { current: 85.2, last: 82.5, growth: 3.3 },
        productivity: { current: 78.5, last: 75.2, growth: 4.4 },
        quality: { current: 88.7, last: 86.3, growth: 2.8 },
        teamwork: { current: 82.1, last: 80.5, growth: 2.0 },
      },
    },
    training: {
      summary: {
        totalHours: 1250,
        avgHoursPerEmployee: 19.2,
        trainingCost: 187500,
        completionRate: 85.5,
        satisfaction: 4.3,
      },
      categories: [
        { name: '专业技能', hours: 680, count: 35, completionRate: 92.5 },
        { name: '管理能力', hours: 320, count: 18, completionRate: 78.5 },
        { name: '软技能', hours: 180, count: 42, completionRate: 88.2 },
        { name: '合规培训', hours: 70, count: 65, completionRate: 95.0 },
      ],
    },
    attendance: {
      summary: {
        avgAttendanceRate: 96.5,
        avgWorkHours: 42.5,
        lateCount: 45,
        leaveDays: 125,
        overtimeHours: 320,
      },
      trends: {
        attendance: { Q1: 95.8, Q2: 96.2, Q3: 96.8, Q4: 96.5 },
        overtime: { Q1: 85, Q2: 92, Q3: 78, Q4: 65 },
        leave: { Q1: 28, Q2: 35, Q3: 32, Q4: 30 },
      },
    },
    compensation: {
      summary: {
        totalCost: 12500000,
        avgSalary: 185000,
        bonusTotal: 1875000,
        benefitsCost: 3125000,
      },
      distribution: [
        { range: '0-10万', count: 8 },
        { range: '10-20万', count: 22 },
        { range: '20-30万', count: 20 },
        { range: '30-50万', count: 10 },
        { range: '50万+', count: 5 },
      ],
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载统计数据...</p>
        </div>
      </div>
    );
  }

  const currentData = data || mockData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">统计分析</h1>
                <p className="text-sm text-slate-500">全面的人力资源数据分析</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">本周</SelectItem>
                  <SelectItem value="month">本月</SelectItem>
                  <SelectItem value="quarter">本季度</SelectItem>
                  <SelectItem value="year">本年度</SelectItem>
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={(v) => setYear(v as any)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024年</SelectItem>
                  <SelectItem value="2023">2023年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">总员工数</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentData.overview.totalEmployees}
              </div>
              <div className="flex items-center mt-2 text-sm space-x-2">
                <span className="text-green-500">+{currentData.overview.newHires}</span>
                <span className="text-slate-500">新增</span>
                <span className="text-red-500">-{currentData.overview.departures}</span>
                <span className="text-slate-500">离职</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">招聘进度</CardTitle>
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentData.recruitment.positions.filled}/{currentData.recruitment.positions.total}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Badge variant="secondary">
                  {currentData.recruitment.positions.open}个空缺
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">绩效评分</CardTitle>
              <Award className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentData.performance.trends.overall.current}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+{currentData.performance.trends.overall.growth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">培训覆盖率</CardTitle>
              <Calendar className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentData.overview.trainingRate}%
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-slate-500">平均{currentData.training.summary.avgHoursPerEmployee}小时/人</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="recruitment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="recruitment">招聘</TabsTrigger>
            <TabsTrigger value="performance">绩效</TabsTrigger>
            <TabsTrigger value="training">培训</TabsTrigger>
            <TabsTrigger value="attendance">考勤</TabsTrigger>
            <TabsTrigger value="compensation">薪酬</TabsTrigger>
          </TabsList>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>招聘效率</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">平均招聘周期</span>
                    <span className="text-lg font-semibold">{currentData.recruitment.timeToHire.avg}天</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">最快入职</span>
                    <span className="text-lg font-semibold">{currentData.recruitment.timeToHire.min}天</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">最慢入职</span>
                    <span className="text-lg font-semibold">{currentData.recruitment.timeToHire.max}天</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>招聘渠道</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(currentData.recruitment.source).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{key}</span>
                      <Badge variant="outline">{value}人</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>招聘质量</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Offer接受率</span>
                      <span className="font-semibold">{currentData.recruitment.quality.offerAcceptRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${currentData.recruitment.quality.offerAcceptRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">候选人满意度</span>
                      <span className="font-semibold">{currentData.recruitment.quality.candidateSatisfaction}/5</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${currentData.recruitment.quality.candidateSatisfaction * 20}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>招聘成本</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">单次招聘成本</span>
                    <span className="text-lg font-semibold">¥8,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">年度招聘预算</span>
                    <span className="text-lg font-semibold">¥150,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">已使用</span>
                    <span className="text-lg font-semibold">¥102,000</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>绩效分布</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentData.performance.distribution.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">{item.level}</span>
                        <span className="font-semibold">{item.count}人 ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            item.level === '优秀' ? 'bg-emerald-500' :
                            item.level === '良好' ? 'bg-blue-500' :
                            item.level === '合格' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>绩效趋势</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(currentData.performance.trends).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 capitalize">{key}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{value.current}</span>
                        <Badge variant={value.growth >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {value.growth >= 0 ? '+' : ''}{value.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>培训概况</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">总培训时长</span>
                    <span className="text-lg font-semibold">{currentData.training.summary.totalHours}小时</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">人均培训时长</span>
                    <span className="text-lg font-semibold">{currentData.training.summary.avgHoursPerEmployee}小时</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">培训成本</span>
                    <span className="text-lg font-semibold">¥{currentData.training.summary.trainingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">完成率</span>
                    <span className="text-lg font-semibold">{currentData.training.summary.completionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>培训分类</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentData.training.categories.map((cat: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-900">{cat.name}</span>
                        <Badge variant="outline">{cat.hours}小时</Badge>
                      </div>
                      <div className="text-sm text-slate-500">
                        {cat.count}人参与 · 完成率 {cat.completionRate}%
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>考勤概况</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">出勤率</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentData.attendance.summary.avgAttendanceRate}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">平均工时</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentData.attendance.summary.avgWorkHours}h
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">迟到次数</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentData.attendance.summary.lateCount}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">请假天数</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentData.attendance.summary.leaveDays}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-1">加班时长</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {currentData.attendance.summary.overtimeHours}h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>薪酬概况</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">年度薪酬总额</span>
                    <span className="text-lg font-semibold">
                      ¥{currentData.compensation.summary.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">平均薪酬</span>
                    <span className="text-lg font-semibold">
                      ¥{currentData.compensation.summary.avgSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">奖金总额</span>
                    <span className="text-lg font-semibold">
                      ¥{currentData.compensation.summary.bonusTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">福利成本</span>
                    <span className="text-lg font-semibold">
                      ¥{currentData.compensation.summary.benefitsCost.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>薪酬分布</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentData.compensation.distribution.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">{item.range}</span>
                        <span className="font-semibold">{item.count}人</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                          style={{ width: `${(item.count / currentData.overview.totalEmployees) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
