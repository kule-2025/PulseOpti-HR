'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  charts: Array<{
    type: 'line' | 'bar' | 'pie';
    title: string;
    data: any[];
  }>;
}

interface Props {
  companyId: string;
  initialType?: 'employee' | 'recruitment' | 'performance' | 'salary' | 'turnover' | 'efficiency' | 'custom';
}

export function AdvancedDataAnalysis({ companyId, initialType = 'employee' }: Props) {
  const [analysisType, setAnalysisType] = useState<Props['initialType']>(initialType);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  const analysisTypes = [
    { value: 'employee', label: '员工分析', icon: '👥' },
    { value: 'recruitment', label: '招聘分析', icon: '🎯' },
    { value: 'performance', label: '绩效分析', icon: '📊' },
    { value: 'salary', label: '薪酬分析', icon: '💰' },
    { value: 'turnover', label: '离职分析', icon: '🔀' },
    { value: 'efficiency', label: '人效分析', icon: '⚡' },
    { value: 'custom', label: '自定义分析', icon: '🔍' },
  ];

  const timeRanges = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' },
    { value: 'all', label: '全部' },
  ];

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/data-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: analysisType,
          companyId,
          timeRange,
          customQuery: analysisType === 'custom' ? customQuery : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [analysisType, timeRange]);

  const renderChart = (chart: any) => {
    if (chart.data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          暂无数据
        </div>
      );
    }

    switch (chart.type) {
      case 'line':
        return renderLineChart(chart);
      case 'bar':
        return renderBarChart(chart);
      case 'pie':
        return renderPieChart(chart);
      default:
        return null;
    }
  };

  const renderLineChart = (chart: any) => {
    const maxValue = Math.max(...chart.data.map((d: any) => d.value || d.count || d.days || d.rate || d.avg));
    const minValue = Math.min(...chart.data.map((d: any) => d.value || d.count || d.days || d.rate || d.avg));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end gap-2 h-48 pt-4">
        {chart.data.map((item: any, index: number) => {
          const value = item.value || item.count || item.days || item.rate || item.avg;
          const height = ((value - minValue) / range) * 100;
          const percentage = Math.max(height, 5); // 最小5%高度

          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500 relative"
                   style={{ height: `${percentage}%` }}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {value.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                {item.month || item.quarter || item.year || item.stage}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBarChart = (chart: any) => {
    const maxValue = Math.max(...chart.data.map((d: any) => d.count || d.value));
    const total = chart.data.reduce((sum: number, d: any) => sum + (d.count || d.value), 0);

    return (
      <div className="space-y-3 pt-4">
        {chart.data.map((item: any, index: number) => {
          const value = item.count || item.value;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-sm">{item.name || item.range || item.dept || item.score}</span>
                <span className="text-sm text-muted-foreground">
                  {value.toLocaleString()} ({total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = (chart: any) => {
    const total = chart.data.reduce((sum: number, d: any) => sum + (d.value || d.count), 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {chart.data.map((item: any, index: number) => {
                const value = item.value || item.count;
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const dashArray = percentage * 2.83; // 2 * PI * 45 / 100
                const offset = chart.data.slice(0, index).reduce((sum: number, d: any) => {
                  const v = d.value || d.count;
                  return sum + ((v / total) * 2.83);
                }, 0);

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="10"
                    strokeDasharray={`${dashArray} ${283 - dashArray}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          {chart.data.map((item: any, index: number) => {
            const value = item.value || item.count;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            const color = colors[index % colors.length];

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm flex-1 truncate">{item.name}</span>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const exportReport = () => {
    if (!result) return;

    const report = {
      title: `${analysisTypes.find(t => t.value === analysisType)?.label}报告`,
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: result.summary,
      insights: result.insights,
      recommendations: result.recommendations,
      charts: result.charts,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysisType}-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 分析配置 */}
      <Card>
        <CardHeader>
          <CardTitle>分析配置</CardTitle>
          <CardDescription>选择分析类型和时间范围</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">分析类型</label>
              <Select value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">时间范围</label>
              <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={runAnalysis} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
              {result && (
                <Button variant="outline" onClick={exportReport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {analysisType === 'custom' && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">自定义查询</label>
              <Textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="请输入您的分析需求..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分析结果 */}
      {result && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">
              <Sparkles className="h-4 w-4 mr-2" />
              摘要
            </TabsTrigger>
            <TabsTrigger value="insights">
              <BarChart3 className="h-4 w-4 mr-2" />
              洞察
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              建议
            </TabsTrigger>
            <TabsTrigger value="charts">
              <PieChart className="h-4 w-4 mr-2" />
              图表
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>分析摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>关键洞察</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>改进建议</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid gap-4 md:grid-cols-2">
              {result.charts.map((chart, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground">AI正在分析数据，请稍候...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
