'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import { QuickActions, createProPageHeader } from '@/components/layout/quick-actions';
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Layout,
  Table,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Target,
  Award,
  Zap,
  Copy,
  Play,
  Settings,
  Save,
  RefreshCw,
  Lock,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'mixed';
  category: 'performance' | 'compensation' | 'recruitment' | 'training' | 'custom';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  isPublic: boolean;
  views: number;
  fields: ReportField[];
}

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  source: string;
  required: boolean;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataSource: string;
  xAxis: string;
  yAxis: string;
}

export default function CustomReportsPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [reports, setReports] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: '部门绩效分析报表',
      description: '按部门统计绩效目标达成情况',
      type: 'mixed',
      category: 'performance',
      createdBy: '张HR',
      createdAt: '2024-01-15',
      lastModified: '2024-12-10',
      isPublic: true,
      views: 156,
      fields: [
        { id: 'f1', name: '部门名称', type: 'text', source: 'employees.department', required: true },
        { id: 'f2', name: '目标完成率', type: 'number', source: 'performance.completion_rate', required: true },
        { id: 'f3', name: '员工人数', type: 'number', source: 'employees.count', required: false },
        { id: 'f4', name: '平均评分', type: 'number', source: 'performance.avg_score', required: false },
      ],
    },
    {
      id: '2',
      name: '薪酬成本统计报表',
      description: '各部门薪酬成本明细统计',
      type: 'chart',
      category: 'compensation',
      createdBy: '李财务',
      createdAt: '2024-02-20',
      lastModified: '2024-12-05',
      isPublic: true,
      views: 234,
      fields: [
        { id: 'f5', name: '部门', type: 'text', source: 'employees.department', required: true },
        { id: 'f6', name: '基本工资总额', type: 'number', source: 'payroll.base_salary_total', required: true },
        { id: 'f7', name: '奖金总额', type: 'number', source: 'payroll.bonus_total', required: false },
        { id: 'f8', name: '社保公积金', type: 'number', source: 'payroll.insurance_total', required: false },
      ],
    },
    {
      id: '3',
      name: '招聘漏斗分析',
      description: '招聘流程各阶段数据统计',
      type: 'mixed',
      category: 'recruitment',
      createdBy: '王HRBP',
      createdAt: '2024-03-10',
      lastModified: '2024-12-08',
      isPublic: false,
      views: 89,
      fields: [
        { id: 'f9', name: '职位名称', type: 'text', source: 'recruitment.position', required: true },
        { id: 'f10', name: '简历投递数', type: 'number', source: 'recruitment.applications', required: true },
        { id: 'f11', name: '初筛通过数', type: 'number', source: 'recruitment.screened', required: false },
        { id: 'f12', name: '面试通过数', type: 'number', source: 'recruitment.interviewed', required: false },
        { id: 'f13', name: '入职人数', type: 'number', source: 'recruitment.hired', required: false },
      ],
    },
    {
      id: '4',
      name: '培训效果评估',
      description: '培训课程效果统计分析',
      type: 'table',
      category: 'training',
      createdBy: '赵培训',
      createdAt: '2024-04-05',
      lastModified: '2024-12-01',
      isPublic: true,
      views: 127,
      fields: [
        { id: 'f14', name: '课程名称', type: 'text', source: 'training.course_name', required: true },
        { id: 'f15', name: '参训人数', type: 'number', source: 'training.attendees', required: true },
        { id: 'f16', name: '完成率', type: 'number', source: 'training.completion_rate', required: false },
        { id: 'f17', name: '平均满意度', type: 'number', source: 'training.satisfaction', required: false },
      ],
    },
  ]);

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    title: '',
    dataSource: '',
    xAxis: '',
    yAxis: '',
  });

  const [reportFormData, setReportFormData] = useState({
    name: '',
    description: '',
    type: 'table',
    category: 'custom',
    isPublic: false,
  });

  const stats = {
    totalReports: reports.length,
    publicReports: reports.filter(r => r.isPublic).length,
    privateReports: reports.filter(r => !r.isPublic).length,
    totalViews: reports.reduce((sum, r) => sum + r.views, 0),
    chartReports: reports.filter(r => r.type === 'chart').length,
    tableReports: reports.filter(r => r.type === 'table').length,
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      table: { label: '表格', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      chart: { label: '图表', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      mixed: { label: '混合', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    };
    const variant = variants[type];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      performance: { label: '绩效', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      compensation: { label: '薪酬', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      recruitment: { label: '招聘', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      training: { label: '培训', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      custom: { label: '自定义', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    };
    const variant = variants[category];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleCreateReport = () => {
    if (!reportFormData.name) {
      toast.error('请填写报表名称');
      return;
    }

    const newReport: ReportTemplate = {
      id: Date.now().toString(),
      name: reportFormData.name,
      description: reportFormData.description,
      type: reportFormData.type as any,
      category: reportFormData.category as any,
      createdBy: '当前用户',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      isPublic: reportFormData.isPublic,
      views: 0,
      fields: [],
    };

    setReports([...reports, newReport]);
    setShowCreateDialog(false);
    setReportFormData({
      name: '',
      description: '',
      type: 'table',
      category: 'custom',
      isPublic: false,
    });
    toast.success('报表创建成功');
  };

  const handlePreviewReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setShowPreviewDialog(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    toast.success('报表已删除');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <PageHeader {...createProPageHeader({
          icon: BarChart3,
          title: '自定义报表',
          description: '拖拽式报表设计器，创建专属数据报表',
          extraActions: (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报表
            </Button>
          )
        })} />

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">报表总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReports}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <FileText className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">公开报表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.publicReports}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">私有报表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.privateReports}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Lock className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">总浏览量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Eye className="h-3 w-3 mr-1" />
                次
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">图表报表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.chartReports}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <PieChart className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">表格报表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.tableReports}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Table className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              报表模板
            </TabsTrigger>
            <TabsTrigger value="designer" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              报表设计器
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              我的报表
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              实时预览
            </TabsTrigger>
          </TabsList>

          {/* 报表模板 */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>报表模板库</CardTitle>
                    <CardDescription>快速创建各种类型的报表</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="搜索报表..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      创建报表
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {report.type === 'table' && <Table className="h-5 w-5 text-blue-600" />}
                            {report.type === 'chart' && <PieChart className="h-5 w-5 text-green-600" />}
                            {report.type === 'mixed' && <Layout className="h-5 w-5 text-purple-600" />}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {report.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                {getTypeBadge(report.type)}
                                {getCategoryBadge(report.category)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{report.views} 次浏览</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500">
                                {report.createdBy.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{report.createdBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreviewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            预览
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 报表设计器 */}
          <TabsContent value="designer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>报表设计器</CardTitle>
                <CardDescription>拖拽式创建自定义报表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">数据源</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">员工信息</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm">绩效数据</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">薪酬数据</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">招聘数据</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2">组件</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Table className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">数据表格</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">柱状图</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">折线图</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">饼图</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Layout className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          拖拽组件到这里
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          从左侧选择数据源和组件，拖拽到此处设计报表
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 我的报表 */}
          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>我的报表</CardTitle>
                <CardDescription>查看和管理我创建的所有报表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Save className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    暂无保存的报表
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    创建的报表将显示在这里
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 实时预览 */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>实时预览</CardTitle>
                <CardDescription>预览报表效果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Play className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    选择报表进行预览
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    从报表模板中选择一个报表进行实时预览
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建报表对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新报表</DialogTitle>
              <DialogDescription>
                创建自定义报表模板
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">报表名称 *</Label>
                <Input
                  id="name"
                  value={reportFormData.name}
                  onChange={(e) => setReportFormData({ ...reportFormData, name: e.target.value })}
                  placeholder="例如：部门绩效分析"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">报表描述</Label>
                <Input
                  id="description"
                  value={reportFormData.description}
                  onChange={(e) => setReportFormData({ ...reportFormData, description: e.target.value })}
                  placeholder="描述报表的用途和内容"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">报表类型</Label>
                <select
                  id="type"
                  value={reportFormData.type}
                  onChange={(e) => setReportFormData({ ...reportFormData, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="table">表格报表</option>
                  <option value="chart">图表报表</option>
                  <option value="mixed">混合报表</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">报表分类</Label>
                <select
                  id="category"
                  value={reportFormData.category}
                  onChange={(e) => setReportFormData({ ...reportFormData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="performance">绩效</option>
                  <option value="compensation">薪酬</option>
                  <option value="recruitment">招聘</option>
                  <option value="training">培训</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
              <Button onClick={handleCreateReport}>创建报表</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 预览对话框 */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>报表预览</DialogTitle>
              <DialogDescription>
                {selectedReport?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {selectedReport.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(selectedReport.type)}
                    {getCategoryBadge(selectedReport.category)}
                    <span className="text-xs text-gray-500">创建于 {selectedReport.createdAt}</span>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      报表预览区域
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* 快捷操作 */}
      <QuickActions
        showBackToHome
        showActions
        isProPage
        customActions={[
          {
            icon: FileText,
            label: '导出报表',
            onClick: () => toast.success('导出功能开发中')
          },
          {
            icon: RefreshCw,
            label: '刷新报表',
            onClick: () => toast.success('报表已刷新')
          }
        ]}
      />
    </div>
  );
}
