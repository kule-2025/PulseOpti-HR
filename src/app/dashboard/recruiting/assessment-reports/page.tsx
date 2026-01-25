'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Target,
  Lightbulb,
  Sparkles,
  Filter,
  FileJson,
  FileSpreadsheet,
  FileText as FilePdf,
} from 'lucide-react';
import { toast } from 'sonner';

interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number;
  maxScore: number;
  weight: number;
  criteria?: Record<string, any>;
}

interface AssessmentIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  field: string;
  message: string;
  suggestion?: string;
}

interface AssessmentReport {
  id: string;
  templateId: string;
  templateName: string;
  targetId: string;
  targetType: string;
  targetName?: string;
  companyId: string;
  overallScore: number;
  maxScore: number;
  passingThreshold: number;
  isPassed: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
  dimensionScores: DimensionScore[];
  issues: AssessmentIssue[];
  suggestions: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function AssessmentReportsPage() {
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AssessmentReport | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // 获取报告列表
  const fetchReports = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user?.companyId) return;

      const params = new URLSearchParams({
        companyId: user.companyId,
        ...(selectedTargetType !== 'all' && { targetType: selectedTargetType }),
      });

      const response = await fetch(`/api/assessment/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data || []);
      } else {
        toast.error(data.message || '获取报告列表失败');
      }
    } catch (error) {
      console.error('获取报告列表失败:', error);
      toast.error('获取报告列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看报告详情
  const viewReportDetail = async (reportId: string) => {
    try {
      const response = await fetch(`/api/assessment/reports/${reportId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedReport(data.data);
        setShowDetailDialog(true);
      } else {
        toast.error(data.message || '获取报告详情失败');
      }
    } catch (error) {
      console.error('获取报告详情失败:', error);
      toast.error('获取报告详情失败');
    }
  };

  // 导出报告
  const handleExportReport = async (reportId: string, format: 'json' | 'excel' | 'pdf') => {
    try {
      const response = await fetch(`/api/assessment/reports/${reportId}?export=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-report-${reportId}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('导出成功');
    } catch (error) {
      console.error('导出报告失败:', error);
      toast.error('导出报告失败');
    }
  };

  // 批量导出
  const handleBatchExport = async (format: 'json' | 'excel') => {
    try {
      const response = await fetch(`/api/assessment/reports?export=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-reports-all.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('批量导出成功');
    } catch (error) {
      console.error('批量导出失败:', error);
      toast.error('批量导出失败');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedTargetType]);

  // 过滤报告
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.targetName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'passed' && report.isPassed) ||
      (selectedStatus === 'failed' && !report.isPassed);

    return matchesSearch && matchesStatus;
  });

  // 获取严重程度图标
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取置信度颜色
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">评估报告</h1>
          <p className="text-muted-foreground mt-1">查看和管理简历、面试、绩效等评估报告</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleBatchExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            批量导出 Excel
          </Button>
          <Button variant="outline" onClick={() => handleBatchExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            批量导出 JSON
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板名称或目标..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTargetType} onValueChange={setSelectedTargetType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="评估对象" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有对象</SelectItem>
                <SelectItem value="resume">简历</SelectItem>
                <SelectItem value="candidate">候选人</SelectItem>
                <SelectItem value="interview">面试</SelectItem>
                <SelectItem value="performance">绩效</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="评估结果" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有结果</SelectItem>
                <SelectItem value="passed">通过</SelectItem>
                <SelectItem value="failed">未通过</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 报告列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">暂无评估报告</p>
              <p className="text-muted-foreground mt-1">开始评估后将自动生成报告</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模板名称</TableHead>
                  <TableHead>评估对象</TableHead>
                  <TableHead>总分</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>置信度</TableHead>
                  <TableHead>评估时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.templateName}</TableCell>
                    <TableCell>{report.targetName || report.targetType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{report.overallScore}</span>
                        <span className="text-muted-foreground">/ {report.maxScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.isPassed ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          通过
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          未通过
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={getConfidenceColor(report.confidenceLevel)}>
                        {report.confidenceLevel === 'high' && '高'}
                        {report.confidenceLevel === 'medium' && '中'}
                        {report.confidenceLevel === 'low' && '低'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewReportDetail(report.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportReport(report.id, 'json')}
                        >
                          <FileJson className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 报告详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              评估报告详情
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.templateName} - {selectedReport?.targetName}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedReport && (
              <div className="space-y-6 py-4">
                {/* 总体评分 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">总体评分</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{selectedReport.overallScore}</span>
                        <span className="text-muted-foreground">/ {selectedReport.maxScore}</span>
                      </div>
                      <Badge
                        variant={selectedReport.isPassed ? 'default' : 'destructive'}
                        className={selectedReport.isPassed ? 'bg-green-600' : ''}
                      >
                        {selectedReport.isPassed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            通过
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            未通过
                          </>
                        )}
                      </Badge>
                    </div>
                    <Progress
                      value={(selectedReport.overallScore / selectedReport.maxScore) * 100}
                      className="h-3"
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      及格线: {selectedReport.passingThreshold} 分 | 置信度:{' '}
                      <span className={getConfidenceColor(selectedReport.confidenceLevel)}>
                        {selectedReport.confidenceLevel === 'high' && '高'}
                        {selectedReport.confidenceLevel === 'medium' && '中'}
                        {selectedReport.confidenceLevel === 'low' && '低'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 维度得分 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">维度得分</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReport.dimensionScores.map((dim, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{dim.dimensionName}</span>
                              <span className="text-muted-foreground ml-2 text-sm">
                                (权重: {dim.weight}%)
                              </span>
                            </div>
                            <span className="font-semibold">
                              {dim.score} / {dim.maxScore}
                            </span>
                          </div>
                          <Progress
                            value={(dim.score / dim.maxScore) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 问题列表 */}
                {selectedReport.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">问题列表</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedReport.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                          >
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{issue.field}</span>
                                <Badge variant="outline">{issue.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-sm mt-1 text-blue-600 flex items-start gap-1">
                                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 改进建议 */}
                {selectedReport.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">改进建议</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedReport.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 元数据 */}
                {Object.keys(selectedReport.metadata).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">附加信息</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedReport.metadata).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-sm text-muted-foreground">{key}</Label>
                            <p className="text-sm font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            {selectedReport && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport(selectedReport.id, 'json')}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport(selectedReport.id, 'excel')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
