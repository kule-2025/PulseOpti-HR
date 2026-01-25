'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Sparkles,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
  User,
  Calendar,
  Clock,
  BarChart3,
  Star,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface InterviewReport {
  title: string;
  generatedAt: string;
  metadata: {
    candidateId: string;
    candidateName: string;
    interviewId: string;
    interviewerId: string;
    interviewDate: string;
    duration: string;
    position: string;
  };
  executiveSummary: {
    overallScore: number;
    overallRating: string;
    coreStrengths: string[];
    keyWeaknesses: string[];
    finalRecommendation: string;
    recommendationLevel: string;
  };
  competencyAssessment: {
    overallScore: number;
    dimensionScores: Record<string, number>;
    radarData: Array<{ dimension: string; score: number }>;
    technicalCompetencies: any;
    softSkills: Record<string, number>;
    potential: Record<string, number>;
  };
  qaAnalysis: {
    totalQuestions: number;
    keyQuestions: any[];
    overallPerformance: string;
  };
  jobFitAnalysis: {
    skillsFit: {
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
    };
    experienceFit: {
      score: number;
      relevantYears: number;
      requiredYears: number;
      assessment: string;
    };
    culturalFit: {
      score: number;
      alignment: string[];
    };
  };
  overallEvaluation: {
    strengths: string[];
    risks: string[];
    suggestions: string[];
  };
  recommendations: {
    hiringDecision: string;
    recommendationLevel: string;
    offerSuggestion: any;
    nextSteps: string[];
    riskMitigation: string[];
  };
}

// 内部组件，使用useSearchParams
function InterviewReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('interviewId');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCompanyId(userData.companyId || '');
    }
    loadReport();
  }, [interviewId, companyId]);

  const loadReport = async () => {
    if (!interviewId) {
      toast.error('缺少面试ID');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ai/interview/generate-report?interviewId=${interviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取报告失败');
      }

      if (!data.hasReport) {
        // 生成新报告
        await generateReport();
      } else {
        setReport(data.data);
      }
    } catch (error: any) {
      console.error('加载报告失败:', error);
      toast.error(error.message || '加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch('/api/ai/interview/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          interviewId,
          reportType: 'detailed',
          includeRecommendations: true,
          includeComparison: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成报告失败');
      }

      setReport(data.data);
      toast.success('报告生成成功');
    } catch (error: any) {
      console.error('生成报告失败:', error);
      toast.error(error.message || '生成报告失败');
    }
  };

  const getRecommendationBadge = (level: string) => {
    switch (level) {
      case 'strong_recommend':
        return <Badge className="bg-green-600">强烈推荐</Badge>;
      case 'recommend':
        return <Badge className="bg-blue-600">推荐</Badge>;
      case 'cautious_recommend':
        return <Badge className="bg-yellow-600">谨慎推荐</Badge>;
      case 'not_recommend':
        return <Badge variant="destructive">不推荐</Badge>;
      default:
        return <Badge variant="outline">待评估</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const downloadReport = () => {
    if (!report) return;

    const reportContent = `
${report.title}

生成时间：${new Date(report.generatedAt).toLocaleString('zh-CN')}

================== 基本信息 ==================
候选人：${report.metadata.candidateName}
职位：${report.metadata.position}
面试日期：${new Date(report.metadata.interviewDate).toLocaleDateString('zh-CN')}
面试时长：${report.metadata.duration}

================== 执行摘要 ==================
总体评分：${report.executiveSummary.overallScore}/100
总体评价：${report.executiveSummary.overallRating}
最终推荐：${report.executiveSummary.finalRecommendation}

核心优势：
${report.executiveSummary.coreStrengths.map((s) => `  • ${s}`).join('\n')}

待改进项：
${report.executiveSummary.keyWeaknesses.map((w) => `  • ${w}`).join('\n')}

================== 能力评估 ==================
${Object.entries(report.competencyAssessment.dimensionScores)
  .map(([dim, score]) => `${dim}：${score}`)
  .join('\n')}

================== 职位匹配度 ==================
技能匹配度：${report.jobFitAnalysis.skillsFit.score}%
经验匹配度：${report.jobFitAnalysis.experienceFit.score}%
文化匹配度：${report.jobFitAnalysis.culturalFit.score}%

================== 综合评价 ==================
优势：
${report.overallEvaluation.strengths.map((s) => `  • ${s}`).join('\n')}

风险：
${report.overallEvaluation.risks.map((r) => `  • ${r}`).join('\n')}

建议：
${report.overallEvaluation.suggestions.map((s) => `  • ${s}`).join('\n')}

================== 推荐意见 ==================
录用决策：${report.recommendations.hiringDecision}
后续步骤：
${report.recommendations.nextSteps.map((step) => `  • ${step}`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `面试报告-${report.metadata.candidateName}-${new Date().toLocaleDateString('zh-CN')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('报告下载成功');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">加载面试报告...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            未找到面试报告，请先生成报告
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-8 h-8 text-purple-600" />
                面试评估报告
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
          <Button onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            下载报告
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">候选人</p>
                    <p className="font-semibold">{report.metadata.candidateName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">职位</p>
                    <p className="font-semibold">{report.metadata.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">面试日期</p>
                    <p className="font-semibold">
                      {new Date(report.metadata.interviewDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">面试时长</p>
                    <p className="font-semibold">{report.metadata.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 执行摘要 */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  执行摘要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 总体评分 */}
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                    <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                      {report.executiveSummary.overallScore}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">总体评分</p>
                    <div className="mt-3">{getRecommendationBadge(report.executiveSummary.recommendationLevel)}</div>
                  </div>

                  {/* 核心优势 */}
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      核心优势
                    </p>
                    <div className="space-y-2">
                      {report.executiveSummary.coreStrengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 待改进项 */}
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      待改进项
                    </p>
                    <div className="space-y-2">
                      {report.executiveSummary.keyWeaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 最终推荐 */}
                <Alert className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="text-base font-semibold">
                    最终推荐：{report.executiveSummary.finalRecommendation}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 能力评估 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  能力评估
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(report.competencyAssessment.dimensionScores).map(([dimension, score]) => (
                    <div key={dimension}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{dimension}</span>
                        <span className={`font-bold ${getScoreColor(score as number)}`}>
                          {score}/100
                        </span>
                      </div>
                      <Progress value={score as number} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* 潜力分析 */}
                <div className="mt-6 pt-6 border-t">
                  <p className="font-semibold mb-3">潜力分析</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {report.competencyAssessment.potential?.growthPotential || 0}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">成长潜力</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {report.competencyAssessment.potential?.leadershipPotential || 0}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">领导潜力</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {report.competencyAssessment.potential?.innovation || 0}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">创新能力</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 职位匹配度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  职位匹配度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 技能匹配度 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">技能匹配度</span>
                      <span className="font-bold text-blue-600">
                        {report.jobFitAnalysis.skillsFit.score}%
                      </span>
                    </div>
                    <Progress value={report.jobFitAnalysis.skillsFit.score} className="h-2 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {report.jobFitAnalysis.skillsFit.matchedSkills.map((skill, index) => (
                        <Badge key={index} variant="default" className="bg-green-600">
                          {skill}
                        </Badge>
                      ))}
                      {report.jobFitAnalysis.skillsFit.missingSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 经验匹配度 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">经验匹配度</span>
                      <span className="font-bold text-purple-600">
                        {report.jobFitAnalysis.experienceFit.score}%
                      </span>
                    </div>
                    <Progress value={report.jobFitAnalysis.experienceFit.score} className="h-2 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {report.jobFitAnalysis.experienceFit.assessment}
                    </p>
                  </div>

                  {/* 文化匹配度 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">文化匹配度</span>
                      <span className="font-bold text-green-600">
                        {report.jobFitAnalysis.culturalFit.score}%
                      </span>
                    </div>
                    <Progress value={report.jobFitAnalysis.culturalFit.score} className="h-2 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {report.jobFitAnalysis.culturalFit.alignment.map((item, index) => (
                        <Badge key={index} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 综合评价 */}
            <Card>
              <CardHeader>
                <CardTitle>综合评价</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 优势 */}
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      优势
                    </p>
                    <div className="space-y-2">
                      {report.overallEvaluation.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 风险 */}
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      风险提示
                    </p>
                    <div className="space-y-2">
                      {report.overallEvaluation.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 建议 */}
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                      改进建议
                    </p>
                    <div className="space-y-2">
                      {report.overallEvaluation.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧推荐意见 */}
          <div className="space-y-6">
            {/* 推荐意见卡片 */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  推荐意见
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="font-semibold">
                    {report.recommendations.hiringDecision}
                  </AlertDescription>
                </Alert>

                {report.recommendations.offerSuggestion && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">薪资建议</p>
                    <p className="font-semibold text-lg">{report.recommendations.offerSuggestion.baseSalary}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold mb-2">后续步骤</p>
                  <div className="space-y-2">
                    {report.recommendations.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {report.recommendations.riskMitigation && report.recommendations.riskMitigation.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">风险缓解措施</p>
                    <div className="space-y-2">
                      {report.recommendations.riskMitigation.map((measure, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{measure}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 默认导出，使用Suspense包裹
export default function InterviewReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <InterviewReportContent />
    </Suspense>
  );
}
