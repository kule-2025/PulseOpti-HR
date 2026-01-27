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
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
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
  AlertTriangle,
  Clock,
  DollarSign,
  Activity,
  Users,
  FileText,
  Zap,
  Calendar as CalendarIcon,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  departmentName?: string;
  positionName?: string;
  level?: string;
}

interface TurnoverPredictionResponse {
  success: boolean;
  data: {
    employeeId: string;
    employeeName: string;
    analysisDate: string;
    basicInfo: {
      hireDate: string;
      tenureDays: number;
      tenureMonths: number;
      position: string;
      department: string;
      level: string;
    };
    historicalData: {
      performanceRecords: number;
      avgScore: number | null;
      recentScore: number | null;
    };
    finalPrediction: {
      riskScore: number;
      riskLevel: string;
      turnoverProbability: number;
      dimensions: {
        performance: { score: number; status: string; details: string };
        satisfaction: { score: number; status: string; details: string };
        development: { score: number; status: string; details: string };
        environment: { score: number; status: string; details: string };
        compensation: { score: number; status: string; details: string };
      };
      keyRiskFactors: any[];
      protectiveFactors: any[];
      predictedTimeline: string;
      triggerEvents: string[];
      recommendations: any[];
      actionPlan: any[];
      earlyWarningSignals: string[];
      retentionCost: string;
      confidence: number;
      details?: any;
    };
    models?: Record<string, any>;
    modelVersion: string;
    disclaimer: string;
  };
}

export default function AITurnoverPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['rule_based', 'ai_deep', 'ensemble']);
  const [predictionResult, setPredictionResult] = useState<TurnoverPredictionResponse | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

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

      const response = await fetch('/api/ai/turnover-prediction-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          models: selectedModels,
          includeDetails: true,
          historicalMonths: 12,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '预测失败');
      }

      const data: TurnoverPredictionResponse = await response.json();
      setPredictionResult(data);
      toast.success('离职风险预测完成');
    } catch (error) {
      console.error('预测失败:', error);
      toast.error(error instanceof Error ? error.message : '预测失败');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600';
    if (riskScore < 60) return 'text-yellow-600';
    if (riskScore < 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskBgColor = (riskScore: number) => {
    if (riskScore < 30) return 'bg-green-100 border-green-300';
    if (riskScore < 60) return 'bg-yellow-100 border-yellow-300';
    if (riskScore < 80) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const config = {
      '低风险': { color: 'bg-green-100 text-green-800 border-green-300', icon: ShieldCheck },
      '中风险': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
      '高风险': { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle },
      '极高风险': { color: 'bg-red-100 text-red-800 border-red-300', icon: ShieldAlert },
    };
    return config[riskLevel as keyof typeof config] || config['低风险'];
  };

  const getDimensionIcon = (dimension: string) => {
    const icons: Record<string, any> = {
      performance: BarChart3,
      satisfaction: Users,
      development: TrendingUp,
      environment: Building2,
      compensation: DollarSign,
    };
    return icons[dimension] || Target;
  };

  const getDimensionScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportReport = () => {
    if (!predictionResult) return;

    const report = {
      title: 'AI离职风险预测报告',
      generatedAt: new Date().toISOString(),
      employee: {
        id: predictionResult.data.employeeId,
        name: predictionResult.data.employeeName,
      },
      basicInfo: predictionResult.data.basicInfo,
      historicalData: predictionResult.data.historicalData,
      prediction: predictionResult.data.finalPrediction,
      models: predictionResult.data.models,
      disclaimer: predictionResult.data.disclaimer,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnover-prediction-${predictionResult.data.employeeName}-${new Date().toISOString().split('T')[0]}.json`;
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
            <ShieldAlert className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI离职风险预测</h1>
          </div>
          <p className="text-sm text-gray-500">
            基于多维度深度分析的智能离职风险评估，帮助您及时发现人才流失风险
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

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessment">风险评估</TabsTrigger>
          <TabsTrigger value="analysis">深度分析</TabsTrigger>
          <TabsTrigger value="action">行动计划</TabsTrigger>
          <TabsTrigger value="comparison">模型对比</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          {/* 预测配置卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>预测配置</CardTitle>
              <CardDescription>选择员工进行离职风险评估</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>选择员工</Label>
                  <Select value={selectedEmployee} onValueChange={(v) => setSelectedEmployee(v as any)}>
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
                  <Label>分析模型</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'rule_based', label: '规则模型' },
                      { value: 'ai_deep', label: 'AI深度分析' },
                      { value: 'ensemble', label: '综合评估' },
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
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 预测结果展示 */}
          {predictionResult && (
            <>
              {/* 主要风险评估结果 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>风险评估结果</CardTitle>
                      <CardDescription>
                        {predictionResult.data.employeeName} 的离职风险分析
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
                    {/* 风险分数 */}
                    <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 ${getRiskBgColor(predictionResult.data.finalPrediction.riskScore)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className={`w-6 h-6 ${getRiskColor(predictionResult.data.finalPrediction.riskScore)}`} />
                        <span className="text-sm font-medium text-gray-600">风险分数</span>
                      </div>
                      <div className={`text-6xl font-bold ${getRiskColor(predictionResult.data.finalPrediction.riskScore)}`}>
                        {predictionResult.data.finalPrediction.riskScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">满分100分</div>
                    </div>

                    {/* 风险等级 */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-6 h-6 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">风险等级</span>
                      </div>
                      <Badge className={`text-lg px-4 py-2 ${getRiskLevelBadge(predictionResult.data.finalPrediction.riskLevel).color}`}>
                        {(() => {
                          const RiskIcon = getRiskLevelBadge(predictionResult.data.finalPrediction.riskLevel).icon;
                          return RiskIcon ? <RiskIcon className="w-5 h-5 mr-2" /> : null;
                        })()}
                        {predictionResult.data.finalPrediction.riskLevel}
                      </Badge>
                      <Progress
                        value={predictionResult.data.finalPrediction.riskScore}
                        className="w-full mt-4"
                      />
                    </div>

                    {/* 离职概率 */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">离职概率</span>
                      </div>
                      <div className="text-6xl font-bold text-blue-600">
                        {Math.round(predictionResult.data.finalPrediction.turnoverProbability * 100)}%
                      </div>
                      <div className="text-sm text-gray-500 mt-2">基于历史数据分析</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 员工基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>员工基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">姓名</div>
                      <div className="font-semibold">{predictionResult.data.employeeName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">部门</div>
                      <div className="font-semibold">{predictionResult.data.basicInfo.department || '未分配'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">职位</div>
                      <div className="font-semibold">{predictionResult.data.basicInfo.position || '未分配'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">职级</div>
                      <div className="font-semibold">{predictionResult.data.basicInfo.level || '未知'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">入职日期</div>
                      <div className="font-semibold">{new Date(predictionResult.data.basicInfo.hireDate).toLocaleDateString('zh-CN')}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">工作时长</div>
                      <div className="font-semibold">{predictionResult.data.basicInfo.tenureMonths} 个月</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">绩效记录</div>
                      <div className="font-semibold">{predictionResult.data.historicalData.performanceRecords} 条</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">平均绩效</div>
                      <div className="font-semibold">{predictionResult.data.historicalData.avgScore || '无数据'}分</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 关键预警信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 预测时间线 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-purple-600" />
                      预测时间线
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {predictionResult.data.finalPrediction.predictedTimeline}
                      </div>
                      <div className="text-sm text-gray-500">
                        基于当前风险因素的综合预测
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 预留成本 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      人才重置成本
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {predictionResult.data.finalPrediction.retentionCost}
                      </div>
                      <div className="text-sm text-gray-500">
                        建议及时采取措施，避免人才流失
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 免责声明 */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {predictionResult.data.disclaimer}
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {predictionResult && (
            <>
              {/* 多维度分析 */}
              <Card>
                <CardHeader>
                  <CardTitle>多维度风险分析</CardTitle>
                  <CardDescription>从五个维度深度分析离职风险因素</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(predictionResult.data.finalPrediction.dimensions).map(([key, dimension]: [string, any]) => {
                      const Icon = getDimensionIcon(key);
                      const labelMap: Record<string, string> = {
                        performance: '绩效维度',
                        satisfaction: '情感维度',
                        development: '发展维度',
                        environment: '环境维度',
                        compensation: '薪酬维度',
                      };
                      
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{labelMap[key]}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={dimension.score >= 70 ? 'default' : dimension.score >= 50 ? 'secondary' : 'destructive'}>
                                {dimension.status}
                              </Badge>
                              <span className={`text-2xl font-bold ${getDimensionScoreColor(dimension.score)}`}>
                                {dimension.score}
                              </span>
                            </div>
                          </div>
                          <Progress value={dimension.score} />
                          <p className="text-sm text-gray-600 pl-7">{dimension.details}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 关键风险因素 */}
              {predictionResult.data.finalPrediction.keyRiskFactors &&
               predictionResult.data.finalPrediction.keyRiskFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      关键风险因素
                    </CardTitle>
                    <CardDescription>需要重点关注和干预的风险因素</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictionResult.data.finalPrediction.keyRiskFactors.map((factor: any, index: number) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{factor.factor}</span>
                              <Badge variant="outline">
                                {factor.severity === 'high' ? '高' : factor.severity === 'medium' ? '中' : '低'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-700">{factor.evidence}</div>
                            <Progress value={(factor.weight || 0) * 100} className="mt-2" />
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 保护因素 */}
              {predictionResult.data.finalPrediction.protectiveFactors &&
               predictionResult.data.finalPrediction.protectiveFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ShieldCheck className="w-5 h-5" />
                      保护因素
                    </CardTitle>
                    <CardDescription>帮助员工留存的有利因素</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictionResult.data.finalPrediction.protectiveFactors.map((factor: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{factor.factor}</div>
                            <div className="text-sm text-gray-600">{factor.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 触发事件 */}
              {predictionResult.data.finalPrediction.triggerEvents &&
               predictionResult.data.finalPrediction.triggerEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      潜在触发事件
                    </CardTitle>
                    <CardDescription>可能加速离职决策的关键事件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {predictionResult.data.finalPrediction.triggerEvents.map((event: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 早期预警信号 */}
              {predictionResult.data.finalPrediction.earlyWarningSignals &&
               predictionResult.data.finalPrediction.earlyWarningSignals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      早期预警信号
                    </CardTitle>
                    <CardDescription>需要密切关注的异常行为信号</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {predictionResult.data.finalPrediction.earlyWarningSignals.map((signal: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          {signal}
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
                请先进行离职风险预测，然后在此查看深度分析结果
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="action" className="space-y-6">
          {predictionResult && (
            <>
              {/* 改进建议 */}
              {predictionResult.data.finalPrediction.recommendations &&
               predictionResult.data.finalPrediction.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      改进建议
                    </CardTitle>
                    <CardDescription>针对性的风险缓解和员工保留建议</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictionResult.data.finalPrediction.recommendations.map((rec: any, index: number) => (
                        <Alert key={index}>
                          <AlertCircle className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={
                                rec.priority === '紧急' ? 'destructive' :
                                rec.priority === '重要' ? 'default' : 'secondary'
                              }>
                                {rec.priority}
                              </Badge>
                              <span className="font-semibold">{rec.action}</span>
                            </div>
                            <div className="text-sm text-gray-600">{rec.details}</div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 行动计划 */}
              {predictionResult.data.finalPrediction.actionPlan &&
               predictionResult.data.finalPrediction.actionPlan.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      行动计划
                    </CardTitle>
                    <CardDescription>具体可执行的风险干预行动步骤</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictionResult.data.finalPrediction.actionPlan.map((action: any, index: number) => (
                        <div key={index} className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {action.step}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="font-semibold text-gray-900">{action.action}</div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>负责人: {action.owner}</span>
                              <span>截止: {action.deadline}</span>
                            </div>
                          </div>
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
                请先进行离职风险预测，然后在此查看行动计划
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
                            {modelName === 'rule_based' && '规则模型'}
                            {modelName === 'ai_deep' && 'AI深度分析'}
                            {modelName === 'ensemble' && '综合评估模型'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {result.details?.method || modelName}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{result.riskScore}</div>
                            <div className="text-sm text-gray-500">风险分数</div>
                          </div>
                          <Badge className={getRiskLevelBadge(result.riskLevel).color}>
                            {result.riskLevel}
                          </Badge>
                        </div>
                      </div>

                      <Progress value={result.riskScore} />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>置信度: {Math.round(result.confidence * 100)}%</span>
                        <span>离职概率: {Math.round(result.turnoverProbability * 100)}%</span>
                      </div>

                      {result.details?.weights && (
                        <div className="pt-2 border-t">
                          <div className="text-sm text-gray-600 mb-2">模型权重分布</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>规则模型: {Math.round(result.details.weights.rule_based * 100)}%</div>
                            <div>AI模型: {Math.round(result.details.weights.ai_deep * 100)}%</div>
                          </div>
                        </div>
                      )}
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
                请先进行离职风险预测，然后在此查看模型对比结果
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
