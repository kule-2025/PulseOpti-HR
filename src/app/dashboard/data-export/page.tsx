'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Filter,
  Database,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  UserPlus,
  Users,
  GraduationCap,
  DollarSign,
  BarChart3,
  Zap,
  Crown,
  ArrowRight,
  Upload,
  FileCode,
  FileImage,
} from 'lucide-react';
import { toast } from 'sonner';

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';
type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ExportTask {
  id: string;
  name: string;
  type: string;
  format: ExportFormat;
  status: ExportStatus;
  recordCount: number;
  fileSize: string;
  createdAt: string;
  completedAt?: string;
}

export default function DataExportPage() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [exportType, setExportType] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [dateRange, setDateRange] = useState('30d');

  const [exportTasks, setExportTasks] = useState<ExportTask[]>([
    {
      id: '1',
      name: '员工名单导出',
      type: 'employees',
      format: 'excel',
      status: 'completed',
      recordCount: 156,
      fileSize: '2.3 MB',
      createdAt: '2024-12-15 10:30:00',
      completedAt: '2024-12-15 10:30:45',
    },
    {
      id: '2',
      name: '考勤数据导出',
      type: 'attendance',
      format: 'csv',
      status: 'completed',
      recordCount: 2890,
      fileSize: '5.8 MB',
      createdAt: '2024-12-14 15:20:00',
      completedAt: '2024-12-14 15:21:30',
    },
    {
      id: '3',
      name: '绩效报告导出',
      type: 'performance',
      format: 'pdf',
      status: 'processing',
      recordCount: 45,
      fileSize: '-',
      createdAt: '2024-12-15 11:00:00',
    },
  ]);

  const dataTypes = [
    {
      id: 'employees',
      name: '员工数据',
      icon: Users,
      desc: '员工基本信息、组织架构、岗位信息',
      fields: ['姓名', '工号', '部门', '职位', '入职日期', '联系方式', '状态'],
      count: 156,
    },
    {
      id: 'attendance',
      name: '考勤数据',
      icon: Clock,
      desc: '打卡记录、请假、加班、出差数据',
      fields: ['员工', '日期', '上班时间', '下班时间', '工时', '状态'],
      count: 2890,
    },
    {
      id: 'performance',
      name: '绩效数据',
      icon: BarChart3,
      desc: '绩效评分、KPI完成情况、考核结果',
      fields: ['员工', '考核周期', '得分', '评级', '评价内容'],
      count: 45,
    },
    {
      id: 'training',
      name: '培训数据',
      icon: GraduationCap,
      desc: '培训课程、学习记录、完成情况',
      fields: ['员工', '课程名称', '学习进度', '完成时间', '成绩'],
      count: 78,
    },
    {
      id: 'salary',
      name: '薪酬数据',
      icon: DollarSign,
      desc: '工资明细、奖金、补贴、扣款',
      fields: ['员工', '月份', '基本工资', '绩效奖金', '实发工资'],
      count: 156,
    },
    {
      id: 'recruitment',
      name: '招聘数据',
      icon: UserPlus,
      desc: '候选人信息、面试记录、录用情况',
      fields: ['候选人', '应聘职位', '简历', '面试结果', '状态'],
      count: 234,
    },
  ];

  const exportFormats = [
    { id: 'excel', name: 'Excel (.xlsx)', icon: FileSpreadsheet, desc: '适合数据分析和二次编辑' },
    { id: 'csv', name: 'CSV (.csv)', icon: FileCode, desc: '通用格式，兼容性强' },
    { id: 'pdf', name: 'PDF (.pdf)', icon: FileText, desc: '适合打印和归档' },
    { id: 'json', name: 'JSON (.json)', icon: FileJson, desc: '适合系统集成和开发' },
  ];

  const handleExport = async () => {
    if (!exportType) {
      toast.error('请选择要导出的数据类型');
      return;
    }

    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExporting(false);

    const newTask: ExportTask = {
      id: Date.now().toString(),
      name: `${dataTypes.find(d => d.id === exportType)?.name}导出`,
      type: exportType,
      format: exportFormat,
      status: 'completed',
      recordCount: Math.floor(Math.random() * 500) + 50,
      fileSize: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
      createdAt: new Date().toLocaleString('zh-CN'),
      completedAt: new Date().toLocaleString('zh-CN'),
    };

    setExportTasks([newTask, ...exportTasks]);
    setShowExportDialog(false);
    toast.success('数据导出成功');
  };

  const handleDownload = (task: ExportTask) => {
    toast.success(`开始下载 ${task.name}`);
  };

  const getStatusBadge = (status: ExportStatus) => {
    const variants: Record<ExportStatus, any> = {
      pending: { label: '等待中', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      processing: { label: '处理中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      failed: { label: '失败', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getFormatIcon = (format: ExportFormat) => {
    const icons: Record<ExportFormat, any> = {
      excel: FileSpreadsheet,
      csv: FileCode,
      pdf: FileText,
      json: FileJson,
    };
    return icons[format];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Download className="h-7 w-7 text-white" />
              </div>
              数据导出
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              灵活导出各类HR数据，支持多种格式和自定义筛选
            </p>
          </div>
          <Button
            onClick={() => setShowExportDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            新建导出
          </Button>
        </div>

        {/* 数据类型统计 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dataTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-2">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {type.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {type.count}
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                        条
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 导出任务列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>导出历史</CardTitle>
                <CardDescription>
                  查看和管理历史导出任务
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportTasks.map((task, index) => {
                const FormatIcon = getFormatIcon(task.format);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        task.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <FormatIcon className={`h-5 w-5 ${
                          task.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          task.status === 'processing' ? 'text-blue-600 dark:text-blue-400' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.recordCount} 条记录 · {task.fileSize} · {task.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(task.status)}
                      {task.status === 'completed' && (
                        <Button size="sm" onClick={() => handleDownload(task)}>
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </Button>
                      )}
                      {task.status === 'processing' && (
                        <Button size="sm" disabled>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          处理中
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 导出模板配置 */}
        <Card>
          <CardHeader>
            <CardTitle>导出模板</CardTitle>
            <CardDescription>
              管理和自定义导出模板，保存常用配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: '员工花名册模板', type: 'employees', fields: 8, uses: 45 },
                { name: '月度考勤报表', type: 'attendance', fields: 12, uses: 32 },
                { name: '绩效评估报告', type: 'performance', fields: 10, uses: 18 },
              ].map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileSpreadsheet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge variant="outline">{template.uses} 次使用</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.fields} 个字段
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 导出对话框 */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新建导出任务</DialogTitle>
              <DialogDescription>
                选择数据类型、导出格式和配置筛选条件
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="data" className="mt-4">
              <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="data">选择数据</TabsTrigger>
                <TabsTrigger value="format">导出格式</TabsTrigger>
                <TabsTrigger value="filter">筛选条件</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {dataTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          exportType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setExportType(type.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            exportType === type.id
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              exportType === type.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {type.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {type.desc}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {type.count} 条数据
                            </p>
                          </div>
                          {exportType === type.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="format" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div
                        key={format.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          exportFormat === format.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setExportFormat(format.id as ExportFormat)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            exportFormat === format.id
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              exportFormat === format.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {format.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {format.desc}
                            </p>
                          </div>
                          {exportFormat === format.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="filter" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>时间范围</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">最近 7 天</SelectItem>
                        <SelectItem value="30d">最近 30 天</SelectItem>
                        <SelectItem value="90d">最近 90 天</SelectItem>
                        <SelectItem value="1y">最近 1 年</SelectItem>
                        <SelectItem value="all">全部时间</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>部门筛选</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="tech">技术部</SelectItem>
                        <SelectItem value="product">产品部</SelectItem>
                        <SelectItem value="sales">销售部</SelectItem>
                        <SelectItem value="hr">人力资源部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>状态筛选</Label>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id="status-active" />
                        <label htmlFor="status-active" className="text-sm">在职</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="status-leave" />
                        <label htmlFor="status-leave" className="text-sm">离职</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="status-trial" />
                        <label htmlFor="status-trial" className="text-sm">试用期</label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                取消
              </Button>
              <Button
                onClick={handleExport}
                disabled={!exportType || exporting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {exporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    开始导出
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PRO提示 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  企业级数据导出功能
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  升级企业版可解锁更多高级功能，包括大数据量导出、定时导出任务、自定义导出模板、数据加密导出等
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                立即升级
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
