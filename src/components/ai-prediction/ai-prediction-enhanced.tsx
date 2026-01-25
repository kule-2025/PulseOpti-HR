'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Users,
  DollarSign,
  Clock,
  Download,
  RefreshCw,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export interface PredictionResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  factors?: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  suggestions?: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actions?: string[];
  }>;
}

export interface PredictionConfig {
  models: string[];
  timeframe: '1month' | '3months' | '6months' | '1year';
  metrics: string[];
  alertThresholds: Record<string, number>;
}

interface AIPredictionEnhancedProps {
  config: PredictionConfig;
  onConfigChange: (config: PredictionConfig) => void;
  onExport?: () => void;
}

export function AIPredictionEnhanced({
  config,
  onConfigChange,
  onExport,
}: AIPredictionEnhancedProps) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, [config]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      setPredictions(data.predictions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch predictions'));
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const selectedPrediction = selectedMetric
    ? predictions.find(p => p.metric === selectedMetric)
    : null;

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI预测分析
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPredictions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                预测模型
              </label>
              <select
                value={config.models[0]}
                onChange={(e) => onConfigChange({
                  ...config,
                  models: [e.target.value]
                })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
              >
                <option value="lstm">LSTM时序模型</option>
                <option value="random_forest">随机森林</option>
                <option value="xgboost">XGBoost</option>
                <option value="ensemble">集成模型</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                预测时间范围
              </label>
              <select
                value={config.timeframe}
                onChange={(e) => onConfigChange({
                  ...config,
                  timeframe: e.target.value as any
                })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
              >
                <option value="1month">1个月</option>
                <option value="3months">3个月</option>
                <option value="6months">6个月</option>
                <option value="1year">1年</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                预测指标
              </label>
              <select
                value={config.metrics[0] || ''}
                onChange={(e) => onConfigChange({
                  ...config,
                  metrics: [e.target.value]
                })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
              >
                <option value="turnover">离职率预测</option>
                <option value="performance">绩效预测</option>
                <option value="revenue">营收预测</option>
                <option value="headcount">人力需求预测</option>
                <option value="training">培训效果预测</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">
                AI模型正在分析历史数据，生成预测...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : predictions.length > 0 ? (
        <>
          {/* 预测概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction) => (
              <Card
                key={prediction.metric}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedMetric === prediction.metric ? 'ring-2 ring-purple-500' : ''
                } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700`}
                onClick={() => setSelectedMetric(prediction.metric)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(prediction.riskLevel)}
                      <CardTitle className="text-base font-medium">
                        {prediction.metric}
                      </CardTitle>
                    </div>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          当前值
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {prediction.currentValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          预测值
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {prediction.predictedValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          置信度
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {prediction.confidence}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          置信度
                        </span>
                        <span className="text-xs font-medium">
                          {prediction.confidence}%
                        </span>
                      </div>
                      <Progress value={prediction.confidence} className="h-1" />
                    </div>

                    {getTrendIcon(prediction.trend) && (
                      <div className="flex items-center gap-1">
                        {getTrendIcon(prediction.trend)}
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {prediction.trend === 'up' ? '上升' : '下降'}趋势
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 详细分析 */}
          {selectedPrediction && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 影响因素分析 */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    影响因素分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPrediction.factors?.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {factor.name}
                          </span>
                          <Badge variant="outline">
                            影响度: {Math.abs(factor.impact * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {factor.description}
                        </p>
                        <Progress
                          value={Math.abs(factor.impact * 100)}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 智能建议 */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    智能干预建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPrediction.suggestions?.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {suggestion.title}
                          </h4>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {suggestion.description}
                        </p>
                        {suggestion.actions && suggestion.actions.length > 0 && (
                          <div className="space-y-2">
                            {suggestion.actions.map((action, actionIndex) => (
                              <div
                                key={actionIndex}
                                className="flex items-center gap-2 text-sm"
                              >
                                <ArrowRight className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">
                                  {action}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 预警信息 */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    实时预警
                  </h4>
                  <div className="space-y-2">
                    {predictions
                      .filter(p => p.riskLevel === 'high')
                      .map((prediction) => (
                        <Alert key={prediction.metric} className="bg-white dark:bg-slate-900">
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{prediction.metric}</span>
                                <span className="mx-2">-</span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  预测将{prediction.trend === 'up' ? '上升' : '下降'}至 {prediction.predictedValue}
                                </span>
                              </div>
                              <Button variant="outline" size="sm">
                                查看详情
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    {predictions.filter(p => p.riskLevel === 'high').length === 0 && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        当前没有高风险预警
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                暂无预测数据，请点击刷新按钮生成预测
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
