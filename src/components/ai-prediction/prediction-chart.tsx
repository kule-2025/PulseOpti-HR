"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Info,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface DataPoint {
  period: string;
  value: number;
  predicted?: boolean;
}

interface Factor {
  name: string;
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  importance: number;
  correlation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

interface Intervention {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionSteps: string[];
  expectedImpact: {
    metric: string;
    change: string;
    timeframe: string;
    confidence: number;
  };
  resources: {
    type: string;
    estimatedCost?: number;
    estimatedEffort?: string;
  };
  risks?: string[];
}

interface PredictionData {
  id: string;
  metricCode: string;
  metricName: string;
  predictionPeriod: string;
  currentValue: number;
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  changeRate: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  factors: Factor[];
  interventions: Intervention[];
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mae?: number;
    rmse?: number;
  };
  recommendations: string[];
  warnings: string[];
  createdAt: Date;
}

interface PredictionChartProps {
  data: PredictionData;
  historicalData: DataPoint[];
  onRefresh?: () => void;
  onExport?: () => void;
  showDetails?: boolean;
}

export default function PredictionChart({
  data,
  historicalData,
  onRefresh,
  onExport,
  showDetails = true,
}: PredictionChartProps) {
  // 准备图表数据
  const chartData = [
    ...historicalData.map(d => ({ ...d, type: 'actual' })),
    {
      period: data.predictionPeriod,
      value: data.predictedValue,
      type: 'predicted',
      predicted: true,
    },
  ];

  // 准备置信区间数据
  const confidenceData = [
    ...historicalData.map(d => ({ period: d.period, upper: d.value, lower: d.value })),
    {
      period: data.predictionPeriod,
      upper: data.confidenceInterval.upper,
      lower: data.confidenceInterval.lower,
    },
  ];

  // 按影响类型分类因素
  const positiveFactors = data.factors.filter(f => f.impact === 'positive');
  const negativeFactors = data.factors.filter(f => f.impact === 'negative');
  const neutralFactors = data.factors.filter(f => f.impact === 'neutral');

  // 按优先级分类干预建议
  const criticalInterventions = data.interventions.filter(i => i.priority === 'critical');
  const highInterventions = data.interventions.filter(i => i.priority === 'high');
  const otherInterventions = data.interventions.filter(i => !['critical', 'high'].includes(i.priority));

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI预测分析
              </CardTitle>
              <CardDescription className="mt-1">
                {data.metricName} - {data.predictionPeriod}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="icon" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="icon" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 预测指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>当前值</CardDescription>
            <CardTitle className="text-2xl">{data.currentValue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>预测值</CardDescription>
            <CardTitle className={cn(
              "text-2xl flex items-center gap-2",
              data.trend === 'increasing' && 'text-green-600',
              data.trend === 'decreasing' && 'text-red-600'
            )}>
              {data.predictedValue.toLocaleString()}
              {data.trend === 'increasing' && <TrendingUp className="h-5 w-5" />}
              {data.trend === 'decreasing' && <TrendingDown className="h-5 w-5" />}
              {data.trend === 'stable' && <Minus className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>变化率</CardDescription>
            <CardTitle className={cn(
              "text-2xl",
              data.changeRate.startsWith('+') && 'text-green-600',
              data.changeRate.startsWith('-') && 'text-red-600'
            )}>
              {data.changeRate}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>置信度</CardDescription>
            <CardTitle className="text-2xl">{data.confidence}%</CardTitle>
            <Progress value={data.confidence} className="mt-2" />
          </CardHeader>
        </Card>
      </div>

      {/* 预测图表 */}
      <Card>
        <CardHeader>
          <CardTitle>趋势预测</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{payload[0].payload.period}</p>
                          <p>值: {payload[0].value}</p>
                          {payload[0].payload.predicted && (
                            <Badge variant="secondary">预测</Badge>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorPrediction)"
                  name="预测值"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="实际值"
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 置信区间 */}
      <Card>
        <CardHeader>
          <CardTitle>置信区间</CardTitle>
          <CardDescription>预测值的不确定性范围</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="上限"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                  name="下限"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>下限: {data.confidenceInterval.lower.toLocaleString()}</span>
            <span>上限: {data.confidenceInterval.upper.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* 详细分析 */}
      {showDetails && (
        <Tabs defaultValue="factors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="factors">影响因素</TabsTrigger>
            <TabsTrigger value="interventions">干预建议</TabsTrigger>
            <TabsTrigger value="performance">模型性能</TabsTrigger>
            <TabsTrigger value="recommendations">建议与警告</TabsTrigger>
          </TabsList>

          <TabsContent value="factors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    正向因素 ({positiveFactors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {positiveFactors.map((factor, idx) => (
                    <FactorCard key={idx} factor={factor} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    负向因素 ({negativeFactors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {negativeFactors.map((factor, idx) => (
                    <FactorCard key={idx} factor={factor} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-600" />
                    中性因素 ({neutralFactors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {neutralFactors.map((factor, idx) => (
                    <FactorCard key={idx} factor={factor} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4">
            {criticalInterventions.length > 0 && (
              <Card className="border-red-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    紧急干预措施 ({criticalInterventions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {criticalInterventions.map((intervention, idx) => (
                    <InterventionCard key={idx} intervention={intervention} />
                  ))}
                </CardContent>
              </Card>
            )}

            {highInterventions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    高优先级措施 ({highInterventions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {highInterventions.map((intervention, idx) => (
                    <InterventionCard key={idx} intervention={intervention} />
                  ))}
                </CardContent>
              </Card>
            )}

            {otherInterventions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    其他措施 ({otherInterventions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {otherInterventions.map((intervention, idx) => (
                    <InterventionCard key={idx} intervention={intervention} />
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>模型性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">准确率</p>
                    <p className="text-3xl font-bold text-blue-600">{data.modelPerformance.accuracy}%</p>
                    <Progress value={data.modelPerformance.accuracy} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">精确率</p>
                    <p className="text-3xl font-bold text-green-600">{data.modelPerformance.precision}%</p>
                    <Progress value={data.modelPerformance.precision} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">召回率</p>
                    <p className="text-3xl font-bold text-purple-600">{data.modelPerformance.recall}%</p>
                    <Progress value={data.modelPerformance.recall} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">F1分数</p>
                    <p className="text-3xl font-bold text-orange-600">{data.modelPerformance.f1Score}%</p>
                    <Progress value={data.modelPerformance.f1Score} className="mt-2" />
                  </div>
                </div>
                {data.modelPerformance.mae && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">平均绝对误差 (MAE)</p>
                      <p className="text-2xl font-bold">{data.modelPerformance.mae.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">均方根误差 (RMSE)</p>
                      <p className="text-2xl font-bold">{data.modelPerformance.rmse?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {data.warnings.length > 0 && (
              <Card className="border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    风险警告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// 因素卡片组件
function FactorCard({ factor }: { factor: Factor }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{factor.name}</span>
        <Badge variant="outline" className="text-xs">{factor.category}</Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">重要性</span>
          <span>{factor.importance}%</span>
        </div>
        <Progress value={factor.importance} className="h-1" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>相关系数: {factor.correlation.toFixed(2)}</span>
        <span>置信度: {factor.confidence}%</span>
      </div>
    </div>
  );
}

// 干预建议卡片组件
function InterventionCard({ intervention }: { intervention: Intervention }) {
  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{intervention.title}</h4>
          <p className="text-sm text-muted-foreground">{intervention.description}</p>
        </div>
        <div className="flex gap-1">
          <Badge variant={intervention.priority === 'critical' ? 'destructive' : intervention.priority === 'high' ? 'default' : 'secondary'}>
            {intervention.priority}
          </Badge>
          <Badge variant="outline">{intervention.type}</Badge>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">行动步骤:</p>
        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          {intervention.actionSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
      <div className="text-sm">
        <p className="font-medium">预期影响:</p>
        <p className="text-muted-foreground">
          {intervention.expectedImpact.metric}: {intervention.expectedImpact.change}
          ({intervention.expectedImpact.timeframe}, 置信度: {intervention.expectedImpact.confidence}%)
        </p>
      </div>
      {intervention.resources.estimatedCost && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">资源需求:</span>
          <span className="font-medium">{intervention.resources.type} - ¥{intervention.resources.estimatedCost.toLocaleString()}</span>
        </div>
      )}
      {intervention.risks && intervention.risks.length > 0 && (
        <div className="text-sm">
          <p className="font-medium">潜在风险:</p>
          <ul className="text-muted-foreground list-disc list-inside">
            {intervention.risks.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
