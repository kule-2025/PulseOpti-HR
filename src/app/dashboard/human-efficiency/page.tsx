'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Target, AlertTriangle, Brain, ArrowRight } from 'lucide-react';

export default function HumanEfficiencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">人效提升中心</h1>
                <p className="text-sm text-slate-500">从人才记录系统升级为人效运营系统</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  返回仪表盘
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Core Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">业务-人力联动</CardTitle>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-50 text-sm mb-4">
                直观查看团队人力成本、项目投入产出比、人才技能与项目需求匹配度
              </p>
              <Link href="/dashboard/human-efficiency/business-linkage">
                <Button variant="secondary" size="sm" className="w-full">
                  查看联动仪表盘
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">预测式人才管理</CardTitle>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-50 text-sm mb-4">
                预测未来季度人才缺口与冗余风险，给出调岗、培训或招聘建议
              </p>
              <Link href="/dashboard/human-efficiency/talent-prediction">
                <Button variant="secondary" size="sm" className="w-full">
                  查看预测分析
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">AI智能洞察</CardTitle>
                <Brain className="w-8 h-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-50 text-sm mb-4">
                基于AI的深度分析，识别人效瓶颈，提供优化建议
              </p>
              <Link href="/dashboard/human-efficiency/ai-insights">
                <Button variant="secondary" size="sm" className="w-full">
                  查看AI洞察
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
            <CardTitle>人效提升功能模块</CardTitle>
            <CardDescription>
              全面的人力资源效能提升工具集，助力业务增长
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="dashboard">联动仪表盘</TabsTrigger>
                <TabsTrigger value="prediction">人才预测</TabsTrigger>
                <TabsTrigger value="roi">ROI分析</TabsTrigger>
                <TabsTrigger value="skills">技能匹配</TabsTrigger>
                <TabsTrigger value="risk">风险预警</TabsTrigger>
                <TabsTrigger value="optimize">优化建议</TabsTrigger>
                <TabsTrigger value="reports">报表导出</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4 mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    业务-人力联动仪表盘
                  </h3>
                  <div className="space-y-3 text-sm text-blue-800">
                    <p><strong>核心指标：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>团队人力成本分析（按部门/项目）</li>
                      <li>项目投入产出比（ROI）追踪</li>
                      <li>人才技能与项目需求匹配度热力图</li>
                      <li>人效趋势对比分析</li>
                      <li>业务目标与人力配置对比</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/business-linkage">
                      <Button size="sm">
                        进入仪表盘 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prediction" className="space-y-4 mt-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    预测式人才管理
                  </h3>
                  <div className="space-y-3 text-sm text-purple-800">
                    <p><strong>预测维度：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>未来季度人才缺口预测</li>
                      <li>冗余风险识别与预警</li>
                      <li>技能需求趋势分析</li>
                      <li>内部调岗建议（基于技能匹配）</li>
                      <li>培训需求识别</li>
                      <li>外部招聘计划建议</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/talent-prediction">
                      <Button size="sm">
                        开始预测分析 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="roi" className="space-y-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    人力ROI分析
                  </h3>
                  <div className="space-y-3 text-sm text-green-800">
                    <p><strong>分析内容：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>人力成本与业务收入对比</li>
                      <li>人均产出趋势分析</li>
                      <li>部门间人效对比</li>
                      <li>人才投资回报率</li>
                      <li>培训ROI追踪</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/roi-analysis">
                      <Button size="sm">
                        查看ROI分析 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4 mt-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    技能匹配分析
                  </h3>
                  <div className="space-y-3 text-sm text-orange-800">
                    <p><strong>分析维度：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>员工技能矩阵可视化</li>
                      <li>项目技能需求分析</li>
                      <li>技能缺口识别</li>
                      <li>内部人才推荐</li>
                      <li>技能成长路径规划</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/skills-matching">
                      <Button size="sm">
                        查看技能分析 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    风险预警系统
                  </h3>
                  <div className="space-y-3 text-sm text-red-800">
                    <p><strong>预警内容：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>人才流失风险预警</li>
                      <li>技能短缺风险识别</li>
                      <li>人力成本异常波动</li>
                      <li>关键岗位继任风险</li>
                      <li>合规风险提示</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/risk-alerts">
                      <Button size="sm">
                        查看风险预警 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="optimize" className="space-y-4 mt-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI优化建议
                  </h3>
                  <div className="space-y-3 text-sm text-indigo-800">
                    <p><strong>智能建议：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>组织架构优化建议</li>
                      <li>人才配置优化方案</li>
                      <li>薪酬结构调整建议</li>
                      <li>培训资源优化分配</li>
                      <li>招聘渠道优化</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/ai-insights">
                      <Button size="sm">
                        查看优化建议 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4 mt-6">
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-cyan-900 mb-3">
                    报表导出
                  </h3>
                  <div className="space-y-3 text-sm text-cyan-800">
                    <p><strong>支持导出：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>人效分析月报</li>
                      <li>人才预测季报</li>
                      <li>ROI分析报告</li>
                      <li>技能盘点报告</li>
                      <li>风险预警汇总</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/human-efficiency/reports">
                      <Button size="sm">
                        导出报表 <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
