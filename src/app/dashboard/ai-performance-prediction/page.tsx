'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Calendar,
  User,
  Building2,
  AlertCircle,
  RefreshCw,
  Download,
  Info,
  CheckCircle2,
  Target,
  Lightbulb,
  ShieldAlert,
  Rocket,
  LineChart,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  departmentName?: string;
  positionName?: string;
  level?: string;
}

interface HistoricalData {
  scores: number[];
  cycles: number;
  avgScore: number | null;
}

interface ModelResult {
  predictedScore: number;
  trend: string;
  confidence: number;
  details?: any;
  dimensions?: {
    workQuality: number;
    efficiency: number;
    collaboration: number;
    innovation: number;
  };
  strengths?: string[];
  risks?: string[];
  recommendations?: string[];
  keyFactors?: any[];
}

interface PredictionResponse {
  success: boolean;
  data: {
    employeeId: string;
    employeeName: string;
    predictionPeriod: string;
    predictionDate: string;
    historicalData: HistoricalData;
    finalPrediction: ModelResult;
    models?: Record<string, ModelResult>;
    modelVersion: string;
  };
}

export default function AIPerformancePredictionPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [predictionPeriod, setPredictionPeriod] = useState<'next_month' | 'next_quarter' | 'next_year'>('next_quarter');
  const [selectedModels, setSelectedModels] = useState<string[]>(['statistical', 'rule_based', 'ai_model', 'ensemble']);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('未授权，请重新登录');
        return;
      }

      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('加载员工列表失败');

      const data = await response.json();
      setEmployees(data.data || []);
      setCompanyId(data.companyId || '');
    } catch (error) {
      console.error('加载员工列表失败:', error);
      toast.error('加载员工列表失败');
    }
  };

  const runPrediction = async () => {
    if (!selectedEmployee) {
      toast.error('请选择员工');
      return;
    }

    setLoading(true);
    setPredictionResult(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未授权');
      }

      const response = await fetch('/api/ai/performance-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          predictionPeriod,
          models: selectedModels,
          includeDetails: true,
          historicalCycles: 6,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '预测失败');
      }

      const data: PredictionResponse = await response.json();
      setPredictionResult(data);
      
      // 设置员工信息
      const emp = employees.find(e => e.id === selectedEmployee);
      setEmployeeInfo(emp || null);

      toast.success('绩效预测完成');
    } catch (error) {
      console.error('预测失败:', error);
      toast.error(error instanceof Error ? error.message : '预测失败');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === '上升') {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (trend === '下降') {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    } else {
      return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend === '上升') return 'text-green-600 bg-green-50 border-green-200';
    if (trend === '下降') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 border-green-300';
    if (score >= 70) return 'bg-blue-100 border-blue-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const exportReport = () => {
    if (!predictionResult) return;

    const report = {
      title: 'AI绩效预测报告',
      generatedAt: new Date().toISOString(),
      employee: {
        id: predictionResult.data.employeeId,
        name: predictionResult.data.employeeName,
      },
      predictionPeriod: predictionResult.data.predictionPeriod,
      predictionDate: predictionResult.data.predictionDate,
      historicalData: predictionResult.data.historicalData,
      prediction: predictionResult.data.finalPrediction,
      models: predictionResult.data.models,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-prediction-${predictionResult.data.employeeName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('报告已导出');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI绩效预测</h1>
          </div>
          <p className="text-sm text-gray-500">
            基于多模型融合的智能绩效预测，为您提供准确的绩效趋势分析
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadEmployees}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prediction">绩效预测</TabsTrigger>
          <TabsTrigger value="analysis">深度分析</TabsTrigger>
          <TabsTrigger value="comparison">模型对比</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          {/* 预测配置卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>预测配置</CardTitle>
              <CardDescription>配置预测参数和模型选择</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>选择员工</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择员工" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.positionName || '未分配职位'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>预测周期</Label>
                  <Select value={predictionPeriod} onValueChange={(v: any) => setPredictionPeriod(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next_month">下一个月</SelectItem>
                      <SelectItem value="next_quarter">下一个季度</SelectItem>
                      <SelectItem value="next_year">下一年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>预测模型</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'statistical', label: '统计趋势' },
                      { value: 'rule_based', label: '特征规则' },
                      { value: 'ai_model', label: 'AI大模型' },
                      { value: 'ensemble', label: '综合融合' },
                    ].map((model) => (
                      <Badge
                        key={model.value}
                        variant={selectedModels.includes(model.value) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedModels.includes(model.value)) {
                            setSelectedModels(selectedModels.filter(m => m !== model.value));
                          } else {
                            setSelectedModels([...selectedModels, model.value]);
                          }
                        }}
                      >
                        {model.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={runPrediction}
                disabled={loading || !selectedEmployee || selectedModels.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    预测中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始预测
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 预测结果展示 */}
          {predictionResult && (
            <>
              {/* 主要预测结果 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>预测结果</CardTitle>
                      <CardDescription>
                        {predictionResult.data.employeeName} - {predictionResult.data.predictionPeriod}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportReport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      导出报告
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 预测分数 */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-purple-200 bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-6 h-6 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">预测分数</span>
                      </div>
                      <div className={`text-6xl font-bold ${getScoreColor(predictionResult.data.finalPrediction.predictedScore)}`}>
                        {predictionResult.data.finalPrediction.predictedScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">满分100分</div>
                    </div>

                    {/* 趋势判断 */}
                    <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 ${getScoreBgColor(predictionResult.data.finalPrediction.predictedScore)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getTrendIcon(predictionResult.data.finalPrediction.trend)}
                        <span className="text-sm font-medium text-gray-600">绩效趋势</span>
                      </div>
                      <div className={`text-4xl font-bold ${getTrendColor(predictionResult.data.finalPrediction.trend)}`}>
                        {predictionResult.data.finalPrediction.trend}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">相比历史数据</div>
                    </div>

                    {/* 置信度 */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">预测置信度</span>
                      </div>
                      <div className="text-6xl font-bold text-blue-600">
                        {Math.round(predictionResult.data.finalPrediction.confidence * 100)}%
                      </div>
                      <Progress
                        value={predictionResult.data.finalPrediction.confidence * 100}
                        className="w-full mt-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 历史数据概览 */}
              <Card>
                <CardHeader>
                  <CardTitle>历史数据概览</CardTitle>
                  <CardDescription>过去{predictionResult.data.historicalData.cycles}个周期的绩效数据</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">平均绩效分数</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {predictionResult.data.historicalData.avgScore || '无数据'}
                        </span>
                      </div>
                      {predictionResult.data.historicalData.avgScore && (
                        <Progress
                          value={predictionResult.data.historicalData.avgScore}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">数据周期数</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {predictionResult.data.historicalData.cycles}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        使用最近{predictionResult.data.historicalData.cycles}个周期的绩效数据进行分析
                      </div>
                    </div>
                  </div>

                  {predictionResult.data.historicalData.scores.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <LineChart className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">绩效趋势图</span>
                      </div>
                      <div className="flex items-end gap-2 h-32 border-b border-l border-gray-200 p-4">
                        {predictionResult.data.historicalData.scores.map((score, index) => (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div
                              className={`w-full rounded-t-sm ${getScoreBgColor(score)} transition-all duration-300`}
                              style={{
                                height: `${score}%`,
                                minHeight: '4px',
                              }}
                            />
                            <span className="text-xs text-gray-500">
                              T{predictionResult.data.historicalData.scores.length - index}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-4">
                        {predictionResult.data.historicalData.scores.slice(-2).map((score, index) => (
                          <div key={index} className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</div>
                            <div className="text-xs text-gray-500">
                              {index === 0 ? '最新' : '上一周期'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {predictionResult && predictionResult.data.finalPrediction && (
            <>
              {/* 多维度分析 */}
              <Card>
                <CardHeader>
                  <CardTitle>多维度绩效分析</CardTitle>
                  <CardDescription>AI模型从多个维度分析员工的绩效表现</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'workQuality', label: '工作质量', icon: CheckCircle2 },
                      { key: 'efficiency', label: '工作效率', icon: Rocket },
                      { key: 'collaboration', label: '团队协作', icon: User },
                      { key: 'innovation', label: '创新能力', icon: Lightbulb },
                    ].map((dimension) => (
                      <div key={dimension.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <dimension.icon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-600">{dimension.label}</span>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(predictionResult.data.finalPrediction!.dimensions![dimension.key as keyof typeof predictionResult.data.finalPrediction.dimensions] as number)}`}>
                            {predictionResult.data.finalPrediction!.dimensions![dimension.key as keyof typeof predictionResult.data.finalPrediction.dimensions] as number}
                          </span>
                        </div>
                        <Progress
                          value={predictionResult.data.finalPrediction!.dimensions![dimension.key as keyof typeof predictionResult.data.finalPrediction.dimensions] as number}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 优势与风险 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      关键优势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictionResult.data.finalPrediction.strengths &&
                    predictionResult.data.finalPrediction.strengths.length > 0 ? (
                      <ul className="space-y-3">
                        {predictionResult.data.finalPrediction.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        暂无优势分析数据
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      潜在风险
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictionResult.data.finalPrediction.risks &&
                    predictionResult.data.finalPrediction.risks.length > 0 ? (
                      <ul className="space-y-3">
                        {predictionResult.data.finalPrediction.risks.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        暂无明显风险因素
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 改进建议 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    提升建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictionResult.data.finalPrediction.recommendations &&
                  predictionResult.data.finalPrediction.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {predictionResult.data.finalPrediction.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{recommendation}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无改进建议
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 关键影响因素 */}
              {predictionResult.data.finalPrediction.keyFactors &&
               predictionResult.data.finalPrediction.keyFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>关键影响因素</CardTitle>
                    <CardDescription>影响绩效预测的主要因素及其权重</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictionResult.data.finalPrediction.keyFactors.map((factor: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                            <Badge variant={
                              factor.impact === 'positive' ? 'default' :
                              factor.impact === 'negative' ? 'destructive' : 'secondary'
                            }>
                              {factor.impact === 'positive' ? '正向' :
                               factor.impact === 'negative' ? '负向' : '中性'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{factor.value}</div>
                          <Progress value={(factor.weight || 0) * 100} />
                          <div className="text-xs text-gray-500">权重: {Math.round((factor.weight || 0) * 100)}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!predictionResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                请先进行绩效预测，然后在此查看深度分析结果
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {predictionResult && predictionResult.data.models && (
            <Card>
              <CardHeader>
                <CardTitle>多模型结果对比</CardTitle>
                <CardDescription>不同预测模型的结果对比分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(predictionResult.data.models).map(([modelName, result]: [string, any]) => (
                    <div key={modelName} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {modelName === 'statistical' && '统计趋势模型'}
                            {modelName === 'rule_based' && '特征规则模型'}
                            {modelName === 'ai_model' && 'AI大模型'}
                            {modelName === 'ensemble' && '综合融合模型'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {result.details?.method || modelName}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{result.predictedScore}</div>
                            <div className="text-sm text-gray-500">预测分数</div>
                          </div>
                          {result.details?.weights && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                统计: {Math.round(result.details.weights.statistical * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                规则: {Math.round(result.details.weights.rule_based * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                AI: {Math.round(result.details.weights.ai * 100)}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getTrendColor(result.trend)}>
                          {getTrendIcon(result.trend)}
                          <span className="ml-1">{result.trend}</span>
                        </Badge>
                        <Badge variant="secondary">
                          置信度: {Math.round(result.confidence * 100)}%
                        </Badge>
                      </div>

                      <Progress value={result.predictedScore} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!predictionResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                请先进行绩效预测，然后在此查看模型对比结果
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
