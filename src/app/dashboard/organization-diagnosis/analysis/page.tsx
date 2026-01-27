'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Share2,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom' | 'audit';
type ReportStatus = 'draft' | 'reviewing' | 'published' | 'archived';

interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  period: string;
  author: string;
  reviewer?: string;
  publishDate?: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  dataSections: {
    title: string;
    chartType: 'bar' | 'pie' | 'line' | 'table';
    description: string;
  }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationAnalysisPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟获取分析报告数据
    setTimeout(() => {
      setReports([
        {
          id: '1',
          title: '2024年第一季度组织健康度报告',
          type: 'quarterly',
          status: 'published',
          period: '2024-Q1',
          author: 'HR Director',
          reviewer: 'CEO',
          publishDate: '2024-01-31',
          summary: '本季度组织整体健康状况良好，核心人才流失率有所上升，需要重点关注。',
          keyFindings: [
            '员工满意度76分，较上季度提升2分',
            '核心人才留存率85%，较目标低5个百分点',
            '跨部门协作效率提升15%',
            '新员工培训体系进一步完善',
          ],
          recommendations: [
            '加快核心人才激励机制优化',
            '推进跨部门协作流程标准化',
            '完善新员工培训课程体系',
          ],
          dataSections: [
            {
              title: '员工满意度趋势',
              chartType: 'line',
              description: '展示最近4个季度的满意度变化趋势',
            },
            {
              title: '各部门人才流失率',
              chartType: 'bar',
              description: '各部门本季度的员工流失率对比',
            },
            {
              title: '人才结构分析',
              chartType: 'pie',
              description: '员工年龄、职级、部门分布情况',
            },
          ],
          tags: ['组织健康', '人才保留', '满意度'],
          createdAt: '2024-01-15T10:00:00',
          updatedAt: '2024-01-30T16:00:00',
        },
        {
          id: '2',
          title: '年度组织效能评估报告',
          type: 'annual',
          status: 'published',
          period: '2023',
          author: 'HR Director',
          reviewer: 'CEO',
          publishDate: '2023-12-31',
          summary: '2023年组织效能整体稳步提升，人均产出增长20%，但创新能力有待加强。',
          keyFindings: [
            '人均产出85万元，同比增长20%',
            '员工敬业度78分，处于行业平均水平',
            '创新项目数量增长30%',
            '培训投入产出比达到1:3.5',
          ],
          recommendations: [
            '加大创新激励力度',
            '优化培训体系，提升培训针对性',
            '完善绩效考核机制',
          ],
          dataSections: [
            {
              title: '年度绩效对比',
              chartType: 'bar',
              description: '2023年与2022年关键指标对比',
            },
            {
              title: '各部门效能分析',
              chartType: 'table',
              description: '各部门的人效、成本等指标',
            },
          ],
          tags: ['组织效能', '人效分析', '年度总结'],
          createdAt: '2023-12-01T09:00:00',
          updatedAt: '2023-12-30T14:30:00',
        },
        {
          id: '3',
          title: '技术团队人才流失专项分析',
          type: 'custom',
          status: 'draft',
          period: '2024-01',
          author: 'HR BP',
          summary: '技术部门最近半年人才流失率异常，需要进行专项分析并提出解决方案。',
          keyFindings: [
            '技术部流失率18%，高于公司平均水平',
            '主要流失原因为薪酬和职业发展',
            '高级技术人才流失比例较高',
          ],
          recommendations: [],
          dataSections: [
            {
              title: '流失人员分析',
              chartType: 'pie',
              description: '流失人员的职级、司龄、原因分布',
            },
            {
              title: '薪酬竞争力分析',
              chartType: 'bar',
              description: '与行业平均薪酬水平对比',
            },
          ],
          tags: ['人才流失', '技术部', '专项分析'],
          createdAt: '2024-01-25T11:00:00',
          updatedAt: '2024-01-25T11:00:00',
        },
        {
          id: '4',
          title: '组织架构审计报告',
          type: 'audit',
          status: 'reviewing',
          period: '2024',
          author: 'COE',
          reviewer: 'CEO',
          summary: '对公司组织架构进行全面审计，评估其合理性和有效性。',
          keyFindings: [
            '管理层级为4级，符合扁平化趋势',
            '部门设置合理，但存在职责重叠',
            '跨部门协作流程需优化',
          ],
          recommendations: [
            '明确部门职责边界',
            '优化协作流程',
          ],
          dataSections: [
            {
              title: '组织架构图',
              chartType: 'table',
              description: '完整的组织架构和汇报关系',
            },
            {
              title: '管理层级分析',
              chartType: 'bar',
              description: '各层级人员分布情况',
            },
          ],
          tags: ['组织架构', '审计', '流程优化'],
          createdAt: '2024-01-10T08:00:00',
          updatedAt: '2024-01-20T15:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeConfig: Record<ReportType, { label: string; color: string; icon: any }> = {
    monthly: { label: '月报', color: 'bg-blue-500', icon: Calendar },
    quarterly: { label: '季报', color: 'bg-green-500', icon: BarChart3 },
    annual: { label: '年报', color: 'bg-purple-500', icon: PieChart },
    custom: { label: '专项', color: 'bg-orange-500', icon: FileText },
    audit: { label: '审计', color: 'bg-red-500', icon: CheckCircle },
  };

  const statusConfig: Record<ReportStatus, { label: string; color: string; icon: any }> = {
    draft: { label: '草稿', color: 'bg-gray-500', icon: FileText },
    reviewing: { label: '审阅中', color: 'bg-yellow-500', icon: Clock },
    published: { label: '已发布', color: 'bg-green-500', icon: CheckCircle },
    archived: { label: '已归档', color: 'bg-gray-400', icon: FileText },
  };

  const statistics = {
    total: reports.length,
    published: reports.filter((r) => r.status === 'published').length,
    draft: reports.filter((r) => r.status === 'draft').length,
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              分析报告
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              组织诊断分析报告
            </p>
          </div>
          <Button onClick={() => toast.info('创建报告功能开发中')}>
            <Plus className="h-4 w-4 mr-2" />
            创建报告
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总报告数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已发布</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">草稿</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.draft}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">审阅中</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.reviewing}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索报告标题、摘要或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(typeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 报告列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无分析报告</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const typeIcon = typeConfig[report.type].icon;
              const TypeIcon = typeIcon;
              const statusIcon = statusConfig[report.status].icon;
              const StatusIcon = statusIcon;

              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className={`${typeConfig[report.type].color} text-white border-0 flex items-center gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[report.type].label}
                          </Badge>
                          <Badge className={statusConfig[report.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[report.status].label}
                          </Badge>
                          <span className="text-sm">{report.period}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {report.summary}
                      </p>

                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">关键发现</p>
                        <ul className="space-y-1">
                          {report.keyFindings.slice(0, 2).map((finding, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{finding}</span>
                            </li>
                          ))}
                          {report.keyFindings.length > 2 && (
                            <li className="text-xs text-gray-500">
                              还有 {report.keyFindings.length - 2} 个发现...
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {report.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">作者</span>
                          <p className="font-medium">{report.author}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">更新时间</span>
                          <p className="font-medium">
                            {new Date(report.updatedAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        {report.publishDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">发布日期</span>
                            <p className="font-medium">{report.publishDate}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">数据图表</span>
                          <p className="font-medium">{report.dataSections.length} 个</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('分享功能开发中')}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('导出中...')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
