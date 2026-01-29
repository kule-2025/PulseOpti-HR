'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Award, Users, BarChart3, Plus, Filter } from 'lucide-react';

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                绩效管理
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                科学评估，激发潜能，提升人效
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              新建绩效周期
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                本周期评估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">86%</div>
                  <div className="text-xs text-gray-500 mt-1">完成率</div>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                优秀员工
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs text-gray-500 mt-1">占比 12%</div>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                待评估人数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">35</div>
                  <div className="text-xs text-gray-500 mt-1">还需完成</div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                人效提升
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">+15%</div>
                  <div className="text-xs text-gray-500 mt-1">同比提升</div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="okr">OKR目标</TabsTrigger>
            <TabsTrigger value="kpi">KPI设定</TabsTrigger>
            <TabsTrigger value="assessment">360评估</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>绩效周期概览</CardTitle>
                    <CardDescription>当前绩效周期：2024年Q3</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    筛选
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 进度条 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">整体进度</span>
                      <span className="font-medium">86%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: '86%' }}
                      />
                    </div>
                  </div>

                  {/* 绩效分布 */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">24</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">S级优秀</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">86</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">A级良好</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">10</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">B级待改进</div>
                    </div>
                  </div>

                  {/* 快捷操作 */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      查看报表
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Target className="mr-2 h-4 w-4" />
                      人才盘点
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Award className="mr-2 h-4 w-4" />
                      智能评估
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OKR目标标签页 */}
          <TabsContent value="okr" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>OKR目标管理</CardTitle>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    新建OKR
                  </Button>
                </div>
                <CardDescription>目标对齐与跟踪</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      objective: '提升团队整体效能',
                      keyResults: ['团队产出提升20%', '客户满意度提升15%', '员工流失率降低5%'],
                      progress: 75,
                    },
                    {
                      objective: '完善培训体系',
                      keyResults: ['完成10场培训', '培训满意度90%+', '技能覆盖率85%'],
                      progress: 60,
                    },
                  ].map((okr, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{okr.objective}</h3>
                        <Badge variant={okr.progress >= 70 ? 'default' : 'secondary'}>
                          {okr.progress}%
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-3">
                        {okr.keyResults.map((kr, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {kr}
                          </div>
                        ))}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${okr.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPI设定标签页 */}
          <TabsContent value="kpi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI指标设定</CardTitle>
                <CardDescription>指标定义与分解</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>KPI设定功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 360评估标签页 */}
          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>360度评估</CardTitle>
                <CardDescription>多维度评估员工表现</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>360评估功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
