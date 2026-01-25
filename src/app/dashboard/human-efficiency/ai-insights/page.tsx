'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Lightbulb, BarChart3, Target } from 'lucide-react';

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  // 模拟AI洞察数据 - 实际应从API获取
  const mockInsights = {
    overallScore: 75,
    status: '良好',
    keyInsights: [
      {
        dimension: '成本效率',
        score: 68,
        trend: '下降',
        description: '人力成本增长速度（8.5%）超过业务收入增长速度（12.3%）',
        impact: 'high',
      },
      {
        dimension: '技能匹配',
        score: 82,
        trend: '稳定',
        description: '核心技能储备充足，但新兴技能存在缺口',
        impact: 'medium',
      },
      {
        dimension: 'ROI分析',
        score: 78,
        trend: '上升',
        description: '平均人力投资回报率为3.2x，较上季度提升15.8%',
        impact: 'medium',
      },
    ],
    bottlenecks: [
      {
        area: '研发部门',
        issue: 'AI开发人才短缺',
        severity: 'high',
        evidence: '当前AI开发工程师仅8人，需求15人，缺口7人',
        businessImpact: '导致AI项目进度延迟约20%',
      },
      {
        area: '培训体系',
        issue: '技能转换培训不足',
        severity: 'medium',
        evidence: '传统开发人员向AI开发转换的培训覆盖率仅30%',
        businessImpact: '内部人才利用率低，外部招聘成本高',
      },
      {
        area: '薪酬体系',
        issue: 'AI人才薪酬竞争力不足',
        severity: 'medium',
        evidence: 'AI开发工程师平均薪酬低于市场平均水平15%',
        businessImpact: '吸引和保留AI人才困难',
      },
    ],
    recommendations: [
      {
        priority: 'high',
        action: '启动AI开发专项招聘计划',
        expectedROI: '3.5x',
        timeline: '3个月',
        cost: 800000,
        description: '招聘7名AI开发工程师，填补人才缺口',
        steps: ['制定招聘需求', '启动招聘流程', '筛选候选人', '入职培训'],
      },
      {
        priority: 'high',
        action: '实施内部技能转换培训',
        expectedROI: '4.2x',
        timeline: '2个月',
        cost: 450000,
        description: '对15名传统开发工程师进行AI技能培训',
        steps: ['识别候选人', '制定培训计划', '实施培训', '考核认证'],
      },
      {
        priority: 'medium',
        action: '优化薪酬结构',
        expectedROI: '2.8x',
        timeline: '1个月',
        cost: 300000,
        description: '调整AI人才薪酬，提升市场竞争力',
        steps: ['市场薪酬调研', '制定薪酬方案', '内部沟通', '实施调整'],
      },
    ],
    metrics: {
      laborCostPerEmployee: 125000,
      laborCostGrowthRate: 8.5,
      revenueGrowthRate: 12.3,
      averageROI: 3.2,
      skillMatchRate: 78,
      turnoverRate: 12.5,
      productivityIndex: 85,
    },
    trends: {
      cost: { Q1: 2800000, Q2: 3200000, Q3: 3500000, Q4: 3000000 },
      roi: { Q1: 2.8, Q2: 3.2, Q3: 3.5, Q4: 3.2 },
      productivity: { Q1: 82, Q2: 85, Q3: 88, Q4: 86 },
    },
    riskFactors: [
      {
        risk: '关键人才流失',
        probability: 'medium',
        impact: 'high',
        mitigation: '实施关键人才保留计划，提供晋升机会和薪酬激励',
      },
      {
        risk: '技能缺口扩大',
        probability: 'high',
        impact: 'medium',
        mitigation: '建立技能储备池，提前识别并培训潜在人才',
      },
    ],
    summary: '整体人效水平良好，但存在AI开发人才短缺和培训体系不足的瓶颈。建议优先实施内部技能转换培训和专项招聘，预计可提升整体人效15-20%。',
  };

  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      // 调用API获取AI洞察
      const response = await fetch('/api/human-efficiency/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'overall',
          period: 'quarter',
          includeRecommendations: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.data);
      } else {
        // 如果API调用失败，使用模拟数据
        setInsights(mockInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      // 使用模拟数据
      setInsights(mockInsights);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentInsights = insights || mockInsights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-indigo-50">
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
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI智能洞察</h1>
                <p className="text-sm text-slate-500">基于AI的深度人效分析</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleGenerateInsights}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '分析中...' : '重新分析'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <Alert className="mb-6 border-emerald-200 bg-emerald-50">
          <Brain className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-900">AI分析总结</AlertTitle>
          <AlertDescription className="text-emerald-800">
            {currentInsights.summary}
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">综合评分</CardTitle>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentInsights.overallScore}分
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Badge variant="default" className="bg-emerald-600">
                  {currentInsights.status}
                </Badge>
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
                {currentInsights.metrics.averageROI}x
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+15.8%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">技能匹配率</CardTitle>
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentInsights.metrics.skillMatchRate}%
              </div>
              <div className="flex items-center mt-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">整体良好</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">人效指数</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentInsights.metrics.productivityIndex}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-slate-500">持续提升</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>核心洞察</CardTitle>
            <CardDescription>AI识别的关键人效指标分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentInsights.keyInsights.map((insight: any, index: number) => (
                <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-slate-900">{insight.dimension}</h3>
                      <Badge variant={insight.trend === '下降' ? 'destructive' : insight.trend === '上升' ? 'default' : 'secondary'}>
                        {insight.trend === '上升' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {insight.trend === '下降' && <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                        {insight.trend}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-slate-900">{insight.score}分</div>
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                        {insight.impact === 'high' ? '高影响' : '中等影响'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>瓶颈识别</span>
            </CardTitle>
            <CardDescription>当前阻碍人效提升的关键因素</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentInsights.bottlenecks.map((bottleneck: any, index: number) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{bottleneck.area}</h3>
                      <p className="text-sm text-slate-600">{bottleneck.issue}</p>
                    </div>
                    <Badge variant="destructive">
                      {bottleneck.severity === 'high' ? '严重' : '中等'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-20 text-slate-500 font-medium">证据：</div>
                      <div className="text-slate-700">{bottleneck.evidence}</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-20 text-slate-500 font-medium">影响：</div>
                      <div className="text-red-700">{bottleneck.businessImpact}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>AI优化建议</span>
            </CardTitle>
            <CardDescription>基于数据驱动的具体可执行方案</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentInsights.recommendations.map((rec: any, index: number) => (
                <div key={index} className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority === 'high' ? '高优先级' : '中优先级'}
                        </Badge>
                        <h3 className="text-lg font-semibold text-slate-900">{rec.action}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{rec.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">{rec.expectedROI}</div>
                      <div className="text-sm text-slate-500">预期ROI</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">时间周期</div>
                      <div className="text-lg font-semibold text-slate-900">{rec.timeline}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">预计成本</div>
                      <div className="text-lg font-semibold text-slate-900">{formatCurrency(rec.cost)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">实施步骤</div>
                      <div className="text-lg font-semibold text-slate-900">{rec.steps.length}步</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">优先级</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {rec.priority === 'high' ? '紧急' : '一般'}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-slate-700 mb-2">实施步骤：</div>
                    <div className="space-y-1">
                      {rec.steps.map((step: string, stepIndex: number) => (
                        <div key={stepIndex} className="text-sm text-slate-600">
                          {stepIndex + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">开始实施</Button>
                    <Button variant="outline" size="sm">查看详情</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>风险预警</span>
            </CardTitle>
            <CardDescription>需要关注的风险因素及应对策略</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentInsights.riskFactors.map((risk: any, index: number) => (
                <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{risk.risk}</h3>
                    <div className="flex space-x-2">
                      <Badge variant="outline">
                        概率: {risk.probability}
                      </Badge>
                      <Badge variant={risk.impact === 'high' ? 'destructive' : 'secondary'}>
                        影响: {risk.impact === 'high' ? '高' : '中'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">应对策略：</span>
                    {risk.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
