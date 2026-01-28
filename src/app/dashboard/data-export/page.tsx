'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import {
  Download,
  FileText,
  Table,
  FileSpreadsheet,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  Zap,
  BarChart3,
  FileJson,
  FileCode,
  Database,
  HardDrive,
  Share2,
  Mail,
} from 'lucide-react';

// 导出统计数据
const exportStats = {
  totalExports: 1256,
  thisMonth: 234,
  popularFormats: ['Excel', 'CSV', 'PDF'],
  avgFileSize: '2.5MB',
};

// 导出模板
const exportTemplates = [
  {
    id: 1,
    name: '员工名单',
    description: '包含所有员工基本信息',
    icon: Users,
    fields: ['姓名', '工号', '部门', '职位', '入职日期', '状态'],
    lastUsed: '2024-03-15',
    usageCount: 156,
  },
  {
    id: 2,
    name: '薪资明细',
    description: '月度薪资发放明细',
    icon: DollarSign,
    fields: ['姓名', '部门', '基本工资', '绩效工资', '社保', '公积金', '实发工资'],
    lastUsed: '2024-03-10',
    usageCount: 89,
  },
  {
    id: 3,
    name: '考勤汇总',
    description: '月度考勤数据汇总',
    icon: Clock,
    fields: ['姓名', '出勤天数', '迟到次数', '早退次数', '请假天数', '加班时长'],
    lastUsed: '2024-03-08',
    usageCount: 67,
  },
  {
    id: 4,
    name: '绩效数据',
    description: '员工绩效评估数据',
    icon: Target,
    fields: ['姓名', '部门', '考核周期', 'KPI得分', 'OKR完成率', '综合评分', '等级'],
    lastUsed: '2024-03-05',
    usageCount: 45,
  },
  {
    id: 5,
    name: '培训记录',
    description: '员工培训完成情况',
    icon: Award,
    fields: ['姓名', '课程名称', '培训时间', '完成状态', '培训时长', '考核成绩'],
    lastUsed: '2024-03-01',
    usageCount: 34,
  },
  {
    id: 6,
    name: '组织架构',
    description: '组织架构和人员分布',
    icon: Database,
    fields: ['部门', '人数', '负责人', '层级', '预算'],
    lastUsed: '2024-02-28',
    usageCount: 23,
  },
];

// 导出历史
const exportHistory = [
  {
    id: 1,
    name: '2024年3月员工名单',
    type: '员工名单',
    format: 'Excel',
    status: 'completed',
    fileSize: '1.2MB',
    recordCount: 485,
    createdBy: 'HR-张',
    createdAt: '2024-03-15 10:30',
    downloadUrl: '#',
  },
  {
    id: 2,
    name: '2024年2月薪资明细',
    type: '薪资明细',
    format: 'Excel',
    status: 'completed',
    fileSize: '3.5MB',
    recordCount: 485,
    createdBy: 'HR-李',
    createdAt: '2024-03-10 14:20',
    downloadUrl: '#',
  },
  {
    id: 3,
    name: '2024年1-3月考勤汇总',
    type: '考勤汇总',
    format: 'CSV',
    status: 'completed',
    fileSize: '2.8MB',
    recordCount: 485,
    createdBy: 'HR-王',
    createdAt: '2024-03-08 09:15',
    downloadUrl: '#',
  },
  {
    id: 4,
    name: '2023年度绩效数据',
    type: '绩效数据',
    format: 'PDF',
    status: 'completed',
    fileSize: '5.6MB',
    recordCount: 485,
    createdBy: 'HR-张',
    createdAt: '2024-03-05 16:45',
    downloadUrl: '#',
  },
];

// 支持的格式
const supportedFormats = [
  { name: 'Excel', icon: FileSpreadsheet, extension: '.xlsx', description: 'Excel电子表格格式' },
  { name: 'CSV', icon: FileCode, extension: '.csv', description: '逗号分隔值格式' },
  { name: 'PDF', icon: FileText, extension: '.pdf', description: 'PDF文档格式' },
  { name: 'JSON', icon: FileJson, extension: '.json', description: 'JSON数据格式' },
];

// 导出字段配置
const fieldCategories = [
  {
    category: '基本信息',
    fields: [
      { id: 1, name: '姓名', checked: true },
      { id: 2, name: '工号', checked: true },
      { id: 3, name: '部门', checked: true },
      { id: 4, name: '职位', checked: true },
      { id: 5, name: '入职日期', checked: true },
      { id: 6, name: '联系方式', checked: false },
    ],
  },
  {
    category: '工作信息',
    fields: [
      { id: 7, name: '工作地点', checked: true },
      { id: 8, name: '汇报对象', checked: false },
      { id: 9, name: '职级', checked: true },
      { id: 10, name: '员工状态', checked: true },
    ],
  },
  {
    category: '薪酬信息',
    fields: [
      { id: 11, name: '基本工资', checked: false },
      { id: 12, name: '绩效工资', checked: false },
      { id: 13, name: '社保缴纳', checked: false },
      { id: 14, name: '公积金缴纳', checked: false },
    ],
  },
];

export default function DataExportPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('Excel');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={Download}
        title="数据导出"
        description="多格式数据导出，满足各种分析需求"
        proBadge={true}
        breadcrumbs={[
          { name: '高级功能', href: '/premium' },
          { name: '数据导出', href: '/dashboard/data-export' },
        ]}
        actions={
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            创建自定义导出
          </Button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              总导出次数
            </CardDescription>
            <CardTitle className="text-3xl">{exportStats.totalExports}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              累计导出数据
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              本月导出
            </CardDescription>
            <CardTitle className="text-3xl">{exportStats.thisMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>较上月 +15%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              热门格式
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600">{exportStats.popularFormats.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {exportStats.popularFormats.join(', ')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              平均文件大小
            </CardDescription>
            <CardTitle className="text-3xl">{exportStats.avgFileSize}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              每次导出平均
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">导出模板</TabsTrigger>
          <TabsTrigger value="custom">自定义导出</TabsTrigger>
          <TabsTrigger value="history">导出历史</TabsTrigger>
        </TabsList>

        {/* 导出模板 */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>导出模板</CardTitle>
                  <CardDescription>
                    选择预设模板快速导出数据
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索模板..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowExportDialog(true);
                      }}
                    >
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-3">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            包含 {template.fields.length} 个字段
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            最近使用: {template.lastUsed}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <TrendingUp className="h-3 w-3" />
                            使用 {template.usageCount} 次
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 group-hover:bg-purple-600 group-hover:text-white transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            立即导出
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自定义导出 */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>自定义导出</CardTitle>
              <CardDescription>
                自定义选择数据字段和格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 选择数据源 */}
              <div>
                <Label className="text-base font-semibold">选择数据源</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {['员工信息', '薪资数据', '考勤数据', '绩效数据', '培训记录', '招聘数据', '组织架构', '其他数据'].map((source, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300"
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-medium text-sm">{source}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 选择字段 */}
              <div>
                <Label className="text-base font-semibold">选择字段</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  {fieldCategories.map((category, categoryIndex) => (
                    <Card key={categoryIndex}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.fields.map((field) => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Checkbox id={`field-${field.id}`} checked={field.checked} />
                              <Label htmlFor={`field-${field.id}`} className="text-sm">
                                {field.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 选择格式 */}
              <div>
                <Label className="text-base font-semibold">选择导出格式</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {supportedFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <Card
                        key={format.name}
                        className={`cursor-pointer border-2 transition-all ${
                          selectedFormat === format.name
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950'
                            : 'border-transparent hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedFormat(format.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="h-8 w-8 text-purple-600" />
                            <div className="font-medium text-sm">{format.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {format.extension}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 导出选项 */}
              <div>
                <Label className="text-base font-semibold">导出选项</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label>导出名称</Label>
                    <Input placeholder="例如：员工名单_202403" />
                  </div>
                  <div>
                    <Label>文件格式</Label>
                    <Select defaultValue="xlsx">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Checkbox id="email" />
                  <Label htmlFor="email" className="text-sm">导出完成后发送邮件通知</Label>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Download className="h-4 w-4 mr-2" />
                开始导出
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 导出历史 */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>导出历史</CardTitle>
                  <CardDescription>
                    查看和下载历史导出文件
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    筛选
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    批量下载
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {history.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {history.type} · {history.format} · {history.recordCount} 条记录
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {history.createdBy} · {history.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {history.fileSize}
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          已完成
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 导出对话框 */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出数据</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>选择格式</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>文件名称</Label>
              <Input defaultValue={`${selectedTemplate?.name}_${new Date().toISOString().split('T')[0]}`} />
            </div>
            {selectedTemplate && (
              <div>
                <Label>包含字段</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.fields.map((field: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setShowExportDialog(false)}
            >
              <Download className="h-4 w-4 mr-2" />
              开始导出
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
