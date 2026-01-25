'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, Brain, RefreshCw, Download, Calendar } from 'lucide-react';

export default function TalentPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState('Q2');

  // 模拟预测数据 - 实际应从AI API获取
  const predictions = {
    quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
    talentGap: {
      Q1: { total: -5, details: [{ skill: 'AI开发', gap: 3 }, { skill: '产品经理', gap: 2 }] },
      Q2: { total: 8, details: [{ skill: 'AI开发', gap: 5 }, { skill: '数据分析', gap: 3 }] },
      Q3: { total: 12, details: [{ skill: 'AI开发', gap: 8 }, { skill: '云计算', gap: 4 }] },
      Q4: { total: 15, details: [{ skill: 'AI开发', gap: 10 }, { skill: '数据分析', gap: 5 }] },
    },
    redundancyRisk: {
      high: [
        { name: '张三', department: '研发部', role: '前端开发', probability: 85 },
        { name: '李四', department: '研发部', role: '测试工程师', probability: 72 },
      ],
      medium: [
        { name: '王五', department: '运营部', role: '内容运营', probability: 58 },
        { name: '赵六', department: '市场部', role: '市场专员', probability: 45 },
      ],
    },
    internalTransfer: [
      {
        employee: '孙七',
        currentRole: '传统开发工程师',
        suggestedRole: 'AI开发工程师',
        currentDepartment: '研发部',
        targetDepartment: '研发部',
        matchScore: 85,
        trainingNeeds: ['Python', '机器学习基础', 'TensorFlow'],
      },
      {
        employee: '周八',
        currentRole: '数据录入员',
        suggestedRole: '数据分析师',
        currentDepartment: '运营部',
        targetDepartment: '研发部',
        matchScore: 78,
        trainingNeeds: ['SQL', '数据分析方法', 'Power BI'],
      },
    ],
    trainingRecommendations: [
      {
        skill: 'AI开发',
        targetEmployees: 15,
        duration: '3个月',
        estimatedCost: 450000,
        roi: 4.2,
        urgency: 'high',
      },
      {
        skill: '数据分析',
        targetEmployees: 10,
        duration: '2个月',
        estimatedCost: 200000,
        roi: 3.8,
        urgency: 'medium',
      },
    ],
    recruitmentPlan: [
      {
        role: 'AI开发工程师',
        count: 8,
        urgency: 'high',
        budget: 800000,
        timeline: '3个月',
        skills: ['Python', '机器学习', '深度学习'],
      },
      {
        role: '云计算工程师',
        count: 4,
        urgency: 'medium',
        budget: 400000,
        timeline: '2个月',
        skills: ['AWS/Azure', 'Docker', 'Kubernetes'],
      },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefreshPrediction = async () => {
    setLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">预测式人才管理</h1>
                <p className="text-sm text-slate-500">AI驱动的人才缺口预测与优化建议</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {predictions.quarters.map(q => (
                  <option key={q} value={q}>{q} 2025</option>
                ))}
              </select>
              <Button
                onClick={handleRefreshPrediction}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新预测
              </Button>
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
              <CardTitle className="text-sm font-medium text-slate-600">预测人才缺口</CardTitle>
              <Users className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total > 0 ? '+' : ''}
                {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total}人
              </div>
              <div className="flex items-center mt-2 text-sm">
                {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total > 0 ? "text-red-500" : "text-green-500"}>
                  {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total > 0 ? '需招聘' : '人力充足'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">高风险流失人数</CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.redundancyRisk.high.length}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-500">需重点关注</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">内部调岗建议</CardTitle>
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.internalTransfer.length}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">可优化配置</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">培训需求数</CardTitle>
              <Brain className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.trainingRecommendations.length}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-500">技能提升计划</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Talent Gap Alert */}
        {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">人才缺口预警</AlertTitle>
            <AlertDescription className="text-red-800">
              {selectedQuarter}季度预计人才缺口为{' '}
              <strong>{predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].total}人</strong>，
              建议尽快启动招聘和内部调岗计划。
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Analysis */}
        <Tabs defaultValue="gap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gap">人才缺口预测</TabsTrigger>
            <TabsTrigger value="risk">流失风险预警</TabsTrigger>
            <TabsTrigger value="transfer">内部调岗建议</TabsTrigger>
            <TabsTrigger value="training">培训需求分析</TabsTrigger>
            <TabsTrigger value="recruitment">招聘计划建议</TabsTrigger>
          </TabsList>

          <TabsContent value="gap" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{selectedQuarter}季度人才缺口详情</CardTitle>
                <CardDescription>基于业务规划与历史数据的AI预测结果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.talentGap[selectedQuarter as keyof typeof predictions.talentGap].details.map((gap, index) => (
                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="destructive">
                            {gap.gap > 0 ? `缺口 ${gap.gap}人` : '充足'}
                          </Badge>
                          <span className="font-semibold text-slate-900">{gap.skill}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {gap.gap > 0 ? (
                            <TrendingUp className="w-5 h-5 text-red-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      {gap.gap > 0 && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">建议措施：</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-slate-700">• 优先考虑内部调岗</div>
                            <div className="text-slate-700">• 启动专项招聘计划</div>
                            <div className="text-slate-700">• 安排技能培训提升</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">AI预测依据</h4>
                      <p className="text-sm text-blue-800">
                        基于以下数据维度进行综合预测：业务增长规划、历史人才流动数据、项目需求趋势、
                        行业人才供需状况、员工技能矩阵分析等。预测准确率约为85%，建议结合实际情况调整。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>高风险流失员工</span>
                  </CardTitle>
                  <CardDescription>流失概率大于70%的员工</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.redundancyRisk.high.map((employee, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900">{employee.name}</div>
                            <div className="text-sm text-slate-600">{employee.role} · {employee.department}</div>
                          </div>
                          <Badge variant="destructive">
                            {employee.probability}% 风险
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          查看风险因素与建议
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>中等风险流失员工</span>
                  </CardTitle>
                  <CardDescription>流失概率40%-70%的员工</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.redundancyRisk.medium.map((employee, index) => (
                      <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900">{employee.name}</div>
                            <div className="text-sm text-slate-600">{employee.role} · {employee.department}</div>
                          </div>
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            {employee.probability}% 风险
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>内部调岗建议</CardTitle>
                <CardDescription>基于技能匹配度推荐的内部人才流动方案</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.internalTransfer.map((transfer, index) => (
                    <div key={index} className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-bold text-slate-900">{transfer.employee}</span>
                            <Badge variant="default" className="bg-blue-600">
                              匹配度 {transfer.matchScore}%
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-slate-600">{transfer.currentRole}</span>
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-900 font-medium">{transfer.suggestedRole}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500">{transfer.currentDepartment}</div>
                          <div className="text-sm text-slate-900 font-medium">{transfer.targetDepartment}</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-medium text-slate-700 mb-2">培训需求：</div>
                        <div className="flex flex-wrap gap-2">
                          {transfer.trainingNeeds.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="bg-white">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm">发起调岗</Button>
                        <Button variant="outline" size="sm">查看详情</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4">
              {predictions.trainingRecommendations.map((training, index) => (
                <Card key={index} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{training.skill}培训计划</h3>
                          <Badge variant={
                            training.urgency === 'high' ? 'destructive' :
                            training.urgency === 'medium' ? 'default' : 'secondary'
                          }>
                            {training.urgency === 'high' ? '紧急' : training.urgency === 'medium' ? '中等' : '一般'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          针对{training.targetEmployees}名员工的技能提升计划
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{training.roi}x</div>
                        <div className="text-sm text-slate-500">预计ROI</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">培训周期</div>
                        <div className="text-lg font-semibold text-slate-900">{training.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">预计成本</div>
                        <div className="text-lg font-semibold text-slate-900">{formatCurrency(training.estimatedCost)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">人均成本</div>
                        <div className="text-lg font-semibold text-slate-900">
                          {formatCurrency(training.estimatedCost / training.targetEmployees)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">覆盖人数</div>
                        <div className="text-lg font-semibold text-slate-900">{training.targetEmployees}人</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm">创建培训计划</Button>
                      <Button variant="outline" size="sm">查看课程</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>招聘计划建议</CardTitle>
                <CardDescription>基于人才缺口预测的外部招聘方案</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.recruitmentPlan.map((plan, index) => (
                    <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{plan.role}</h3>
                            <Badge variant={
                              plan.urgency === 'high' ? 'destructive' :
                              plan.urgency === 'medium' ? 'default' : 'secondary'
                            }>
                              {plan.urgency === 'high' ? '紧急' : plan.urgency === 'medium' ? '中等' : '一般'}
                            </Badge>
                            <Badge variant="outline">
                              {plan.count}人
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">招聘周期：{plan.timeline}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{formatCurrency(plan.budget)}</div>
                          <div className="text-sm text-slate-500">招聘预算</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium text-slate-700 mb-2">所需技能：</div>
                        <div className="flex flex-wrap gap-2">
                          {plan.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="bg-white">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm">创建招聘需求</Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          导出JD模板
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
