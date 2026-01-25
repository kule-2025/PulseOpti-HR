'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Target, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

export default function BusinessLinkagePage() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // 模拟数据 - 实际应从API获取
  const metrics = {
    laborCost: {
      total: 12500000,
      quarterly: 3200000,
      trend: 8.5,
      byDepartment: [
        { name: '研发部', cost: 4500000, trend: 10.2 },
        { name: '销售部', cost: 3200000, trend: 5.8 },
        { name: '市场部', cost: 1800000, trend: 12.3 },
        { name: '运营部', cost: 3000000, trend: 6.1 },
      ]
    },
    roi: {
      overall: 3.2,
      trend: 15.8,
      byDepartment: [
        { name: '研发部', roi: 2.8, trend: 12.5 },
        { name: '销售部', roi: 4.5, trend: 18.3 },
        { name: '市场部', roi: 3.1, trend: 14.2 },
        { name: '运营部', roi: 2.9, trend: 13.7 },
      ]
    },
    skills: {
      matchRate: 78,
      gaps: [
        { skill: 'AI开发', demand: 15, available: 8, gap: 7 },
        { skill: '数据分析', demand: 12, available: 10, gap: 2 },
        { skill: '项目管理', demand: 8, available: 9, gap: -1 },
        { skill: '云计算', demand: 10, available: 6, gap: 4 },
      ],
      surplus: [
        { skill: '传统开发', count: 12 },
        { skill: '基础运维', count: 8 },
      ]
    },
    projects: [
      {
        id: 1,
        name: 'AI智能客服系统',
        department: '研发部',
        teamSize: 12,
        budget: 2500000,
        spent: 1200000,
        progress: 48,
        roi: 3.5,
        status: '进行中',
        skillMatch: 85,
      },
      {
        id: 2,
        name: '数字营销平台',
        department: '市场部',
        teamSize: 8,
        budget: 800000,
        spent: 750000,
        progress: 90,
        roi: 4.2,
        status: '即将完成',
        skillMatch: 72,
      },
      {
        id: 3,
        name: '客户关系管理系统',
        department: '销售部',
        teamSize: 10,
        budget: 1500000,
        spent: 1100000,
        progress: 73,
        roi: 3.8,
        status: '进行中',
        skillMatch: 80,
      },
      {
        id: 4,
        name: '供应链优化系统',
        department: '运营部',
        teamSize: 15,
        budget: 2000000,
        spent: 1800000,
        progress: 85,
        roi: 2.9,
        status: '进行中',
        skillMatch: 65,
      },
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/human-efficiency">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">业务-人力联动仪表盘</h1>
                <p className="text-sm text-slate-500">实时监控人力成本、项目ROI与技能匹配度</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="month">本月</option>
                <option value="quarter">本季度</option>
                <option value="year">本年度</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="all">全部部门</option>
                <option value="研发部">研发部</option>
                <option value="销售部">销售部</option>
                <option value="市场部">市场部</option>
                <option value="运营部">运营部</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">总人力成本</CardTitle>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(metrics.laborCost.total)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                {metrics.laborCost.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={metrics.laborCost.trend > 0 ? "text-red-500" : "text-green-500"}>
                  {Math.abs(metrics.laborCost.trend)}%
                </span>
                <span className="text-slate-500 ml-2">较上期</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均ROI</CardTitle>
              <Target className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.roi.overall}x
              </div>
              <div className="flex items-center mt-2 text-sm">
                {metrics.roi.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={metrics.roi.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(metrics.roi.trend)}%
                </span>
                <span className="text-slate-500 ml-2">较上期</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">技能匹配率</CardTitle>
              <Users className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.skills.matchRate}%
              </div>
              <div className="flex items-center mt-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">整体良好</span>
                <span className="text-slate-500 ml-2">项目匹配度</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">活跃项目数</CardTitle>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.projects.length}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-slate-500">
                  总预算 {formatCurrency(metrics.projects.reduce((sum, p) => sum + p.budget, 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="cost" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cost">人力成本分析</TabsTrigger>
            <TabsTrigger value="roi">项目ROI分析</TabsTrigger>
            <TabsTrigger value="skills">技能匹配分析</TabsTrigger>
            <TabsTrigger value="projects">项目详情</TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>部门人力成本分析</CardTitle>
                <CardDescription>按部门统计的人力成本分布与趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.laborCost.byDepartment.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 text-sm font-medium text-slate-700">{dept.name}</div>
                          <div className="text-sm text-slate-500">{formatCurrency(dept.cost)}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {dept.trend > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            dept.trend > 0 ? "text-red-500" : "text-green-500"
                          }`}>
                            {Math.abs(dept.trend)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${(dept.cost / Math.max(...metrics.laborCost.byDepartment.map(d => d.cost))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>部门ROI分析</CardTitle>
                <CardDescription>各部门人力投入产出比对比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.roi.byDepartment.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 text-sm font-medium text-slate-700">{dept.name}</div>
                          <div className="text-sm text-slate-500">{dept.roi}x ROI</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {dept.trend > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            dept.trend > 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {Math.abs(dept.trend)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dept.roi >= 3 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            dept.roi >= 2 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{
                            width: `${(dept.roi / Math.max(...metrics.roi.byDepartment.map(d => d.roi))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>技能缺口分析</CardTitle>
                  <CardDescription>当前项目需求与现有技能的差距</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.skills.gaps.map((skill, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{skill.skill}</span>
                          <Badge variant="destructive" className="flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            缺口 {skill.gap}人
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 space-x-4">
                          <span>需求: {skill.demand}人</span>
                          <span>可用: {skill.available}人</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>技能冗余分析</CardTitle>
                  <CardDescription>可以内部调配或优化的技能资源</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.skills.surplus.map((skill, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{skill.skill}</span>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            富余 {skill.count}人
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">建议：考虑内部调岗或技能转换培训</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {metrics.projects.map((project) => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                          <Badge variant={project.status === '进行中' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{project.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{project.roi}x</div>
                        <div className="text-sm text-slate-500">ROI</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">团队规模</div>
                        <div className="text-lg font-semibold text-slate-900">{project.teamSize}人</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">预算</div>
                        <div className="text-lg font-semibold text-slate-900">{formatCurrency(project.budget)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">已投入</div>
                        <div className="text-lg font-semibold text-slate-900">{formatCurrency(project.spent)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">进度</div>
                        <div className="text-lg font-semibold text-slate-900">{project.progress}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">技能匹配</div>
                        <div className="text-lg font-semibold text-slate-900">{project.skillMatch}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">项目进度</span>
                        <span className="font-medium text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
