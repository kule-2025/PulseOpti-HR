'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PageHeader, createProPageHeader } from '@/components/layout/page-header';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  Target,
  Briefcase,
  ArrowUp,
  ArrowDown,
  FileText,
  Download,
  Zap,
  Percent,
  Building2,
  Scale,
} from 'lucide-react';

// 模拟行业薪酬数据
const industrySalaryData = [
  { position: '高级软件工程师', industry: '互联网', p25: 25000, p50: 32000, p75: 40000, p90: 48000 },
  { position: '高级软件工程师', industry: '金融', p25: 28000, p50: 35000, p75: 43000, p90: 52000 },
  { position: '高级软件工程师', industry: '制造业', p25: 22000, p50: 28000, p75: 35000, p90: 42000 },
  { position: '销售经理', industry: '互联网', p25: 18000, p50: 25000, p75: 35000, p90: 45000 },
  { position: '销售经理', industry: '金融', p25: 20000, p50: 28000, p75: 38000, p90: 48000 },
  { position: '销售经理', industry: '制造业', p25: 16000, p50: 22000, p75: 30000, p90: 40000 },
  { position: '产品经理', industry: '互联网', p25: 20000, p50: 28000, p75: 38000, p90: 48000 },
  { position: '产品经理', industry: '金融', p25: 22000, p50: 30000, p75: 40000, p90: 50000 },
  { position: '产品经理', industry: '制造业', p25: 18000, p50: 25000, p75: 35000, p90: 45000 },
];

// 模拟公司现有薪酬数据
const companySalaryData = [
  { department: '研发部', position: '高级软件工程师', count: 25, avgSalary: 28000, medianSalary: 27000 },
  { department: '研发部', position: '软件工程师', count: 40, avgSalary: 20000, medianSalary: 19500 },
  { department: '销售部', position: '销售经理', count: 15, avgSalary: 22000, medianSalary: 21000 },
  { department: '销售部', position: '销售代表', count: 30, avgSalary: 12000, medianSalary: 11500 },
  { department: '产品部', position: '产品经理', count: 10, avgSalary: 26000, medianSalary: 25000 },
];

interface SalaryAdjustmentParams {
  currentSalary: number;
  performance: number;
  marketComparison: number;
  yearsInRole: number;
  budgetLimit: number;
}

interface AdjustmentResult {
  newSalary: number;
  increaseAmount: number;
  increasePercent: number;
  totalCost: number;
  budgetUsed: number;
  employeesAffected: number;
  recommendations: string[];
}

export default function SalaryDesignPage() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('互联网');

  // 调薪模拟参数
  const [adjustmentParams, setAdjustmentParams] = useState<SalaryAdjustmentParams>({
    currentSalary: 25000,
    performance: 85,
    marketComparison: -10,
    yearsInRole: 2,
    budgetLimit: 500000,
  });

  // 计算薪酬对标结果
  const comparisonResult = useMemo(() => {
    if (!selectedPosition) return null;

    const industryData = industrySalaryData.filter(
      (item) => item.position === selectedPosition && item.industry === selectedIndustry
    );

    if (industryData.length === 0) return null;

    const companyData = companySalaryData.find((item) => item.position === selectedPosition);
    if (!companyData) return null;

    const industry = industryData[0];
    const positionInMarket = companyData.medianSalary / industry.p50;

    return {
      industry,
      company: companyData,
      positionInMarket,
      marketPosition: positionInMarket < 0.9 ? '低于市场' : positionInMarket > 1.1 ? '高于市场' : '与市场持平',
    };
  }, [selectedPosition, selectedIndustry]);

  // 计算调薪模拟结果
  const adjustmentResult = useMemo<AdjustmentResult>(() => {
    const { currentSalary, performance, marketComparison, yearsInRole, budgetLimit } = adjustmentParams;

    // 基础调薪系数
    let baseIncreasePercent = 3; // 通胀调整

    // 绩效系数
    const performanceFactor = (performance - 70) * 0.1; // 70分以上每分0.1%
    baseIncreasePercent += performanceFactor;

    // 市场对标系数
    const marketFactor = Math.abs(marketComparison) * 0.05; // 市场差距每1%增加0.05%
    if (marketComparison < 0) {
      baseIncreasePercent += marketFactor; // 低于市场需要更多调整
    } else {
      baseIncreasePercent += marketFactor * 0.5; // 高于市场可以适当减少调整
    }

    // 年限系数
    const yearsFactor = Math.min(yearsInRole * 0.5, 3); // 最多增加3%
    baseIncreasePercent += yearsFactor;

    // 限制调薪幅度
    baseIncreasePercent = Math.max(0, Math.min(baseIncreasePercent, 15));

    const increaseAmount = (currentSalary * baseIncreasePercent) / 100;
    const newSalary = currentSalary + increaseAmount;

    // 假设涉及50人调薪
    const employeesAffected = 50;
    const totalCost = increaseAmount * 12 * employeesAffected;
    const budgetUsed = (totalCost / budgetLimit) * 100;

    // 生成建议
    const recommendations = [];
    if (performance < 75) {
      recommendations.push('绩效评分较低，建议先进行绩效改进计划');
    }
    if (marketComparison < -15) {
      recommendations.push('薪酬低于市场较多，建议优先调整关键岗位');
    }
    if (yearsInRole > 3) {
      recommendations.push('员工在当前岗位时间较长，建议考虑晋升或岗位调整');
    }
    if (budgetUsed > 100) {
      recommendations.push('预算超支，建议控制调薪范围或分阶段实施');
    }
    if (budgetUsed > 80) {
      recommendations.push('预算使用率较高，建议优化调薪策略');
    }

    return {
      newSalary,
      increaseAmount,
      increasePercent: baseIncreasePercent,
      totalCost,
      budgetUsed,
      employeesAffected,
      recommendations,
    };
  }, [adjustmentParams]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader {...createProPageHeader({
        icon: DollarSign,
        title: '薪酬体系设计',
        description: '岗位薪酬对标、调薪模拟计算器，优化薪酬结构',
        extraActions: (
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Zap className="h-4 w-4 mr-2" />
              AI优化建议
            </Button>
          </div>
        )
      })} />

      {/* Tab导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">岗位薪酬对标</TabsTrigger>
          <TabsTrigger value="calc">调薪模拟计算器</TabsTrigger>
          <TabsTrigger value="structure">薪酬结构设计</TabsTrigger>
        </TabsList>

        {/* 岗位薪酬对标 */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>选择对标岗位</CardTitle>
              <CardDescription>选择要对比的岗位和行业</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>岗位名称</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择岗位" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(industrySalaryData.map((item) => item.position))).map(
                        (position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>行业对标</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择行业" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="互联网">互联网</SelectItem>
                      <SelectItem value="金融">金融</SelectItem>
                      <SelectItem value="制造业">制造业</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {comparisonResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>行业中位值</CardDescription>
                    <CardTitle className="text-3xl">
                      ¥{comparisonResult.industry.p50.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>公司中位值</CardDescription>
                    <CardTitle className="text-3xl">
                      ¥{comparisonResult.company.medianSalary.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>市场位置</CardDescription>
                    <CardTitle className="text-3xl">{(comparisonResult.positionInMarket * 100).toFixed(0)}%</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>薪酬对比分析</CardTitle>
                  <CardDescription>与行业P25/P50/P75/P90对比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'P25', value: comparisonResult.industry.p25, percent: 25 },
                      { label: 'P50', value: comparisonResult.industry.p50, percent: 50 },
                      { label: 'P75', value: comparisonResult.industry.p75, percent: 75 },
                      { label: 'P90', value: comparisonResult.industry.p90, percent: 90 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.label}</Badge>
                            <span className="text-sm">¥{item.value.toLocaleString()}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.percent}分位
                          </span>
                        </div>
                        <Progress value={(comparisonResult.company.medianSalary / item.value) * 100} className="h-3" />
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">市场定位结论</span>
                        </div>
                        <Badge
                          variant={
                            comparisonResult.marketPosition === '低于市场'
                              ? 'destructive'
                              : comparisonResult.marketPosition === '高于市场'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {comparisonResult.marketPosition}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 调薪模拟计算器 */}
        <TabsContent value="calc" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>调薪参数设置</CardTitle>
                <CardDescription>设置调薪模拟的各项参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>当前月薪</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">¥</span>
                    <Input
                      type="number"
                      value={adjustmentParams.currentSalary}
                      onChange={(e) =>
                        setAdjustmentParams({
                          ...adjustmentParams,
                          currentSalary: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>绩效评分 (70-100)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[adjustmentParams.performance]}
                      onValueChange={(value) =>
                        setAdjustmentParams({ ...adjustmentParams, performance: value[0] })
                      }
                      min={70}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{adjustmentParams.performance}分</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>市场对比 (-20% 到 +20%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[adjustmentParams.marketComparison]}
                      onValueChange={(value) =>
                        setAdjustmentParams({ ...adjustmentParams, marketComparison: value[0] })
                      }
                      min={-20}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span
                      className={`w-12 text-right font-medium ${
                        adjustmentParams.marketComparison < 0
                          ? 'text-red-600'
                          : adjustmentParams.marketComparison > 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {adjustmentParams.marketComparison > 0 ? '+' : ''}
                      {adjustmentParams.marketComparison}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>岗位任职年限 (年)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[adjustmentParams.yearsInRole]}
                      onValueChange={(value) =>
                        setAdjustmentParams({ ...adjustmentParams, yearsInRole: value[0] })
                      }
                      min={0}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{adjustmentParams.yearsInRole}年</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>预算上限 (元)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">¥</span>
                    <Input
                      type="number"
                      value={adjustmentParams.budgetLimit}
                      onChange={(e) =>
                        setAdjustmentParams({
                          ...adjustmentParams,
                          budgetLimit: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>调薪模拟结果</CardTitle>
                <CardDescription>根据参数计算的调薪结果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">当前月薪</div>
                    <div className="text-2xl font-bold">
                      ¥{adjustmentParams.currentSalary.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">调整后月薪</div>
                    <div className="text-2xl font-bold">
                      ¥{adjustmentResult.newSalary.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">调薪金额</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      ¥{adjustmentResult.increaseAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">调薪比例</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {adjustmentResult.increasePercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">涉及人数</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {adjustmentResult.employeesAffected}人
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">年度总成本</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      ¥{adjustmentResult.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">预算使用率</span>
                    <span
                      className={`text-sm font-bold ${
                        adjustmentResult.budgetUsed > 100
                          ? 'text-red-600'
                          : adjustmentResult.budgetUsed > 80
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {adjustmentResult.budgetUsed.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(adjustmentResult.budgetUsed, 100)} className="h-3" />
                </div>

                {adjustmentResult.recommendations.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">优化建议</span>
                    </div>
                    <ul className="space-y-2">
                      {adjustmentResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 薪酬结构设计 */}
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>薪酬结构设计</CardTitle>
              <CardDescription>设计企业薪酬结构和激励方案</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">薪酬结构设计器</p>
                <p className="text-sm">功能开发中，敬请期待</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
