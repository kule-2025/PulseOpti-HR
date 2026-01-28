'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileText,
  Database,
  Users,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Check,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Crown,
  Zap,
  Clock,
} from 'lucide-react';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'employee' | 'performance' | 'attendance' | 'recruitment' | 'training' | 'payroll';
  dataType: string;
  availableFields: string[];
  defaultFields: string[];
  formats: ('excel' | 'csv' | 'json' | 'pdf')[];
  filters?: {
    name: string;
    type: 'date' | 'select' | 'multi-select';
    options?: string[];
  }[];
}

// 模拟导出模板数据
const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: '1',
    name: '员工信息导出',
    description: '导出员工基本信息、联系方式、部门职位等',
    category: 'employee',
    dataType: 'employee',
    availableFields: [
      '员工ID', '姓名', '性别', '年龄', '手机号', '邮箱',
      '部门', '职位', '职级', '入职日期', '合同类型',
      '工作状态', '直属主管', '工作地点'
    ],
    defaultFields: [
      '员工ID', '姓名', '部门', '职位', '入职日期', '工作状态'
    ],
    formats: ['excel', 'csv', 'json'],
    filters: [
      { name: '部门', type: 'select', options: ['全部', '技术部', '销售部', '市场部', '人力资源部'] },
      { name: '工作状态', type: 'select', options: ['全部', '在职', '离职', '试用期'] },
      { name: '入职日期范围', type: 'date' },
    ],
  },
  {
    id: '2',
    name: '绩效数据导出',
    description: '导出员工绩效评估结果、目标完成情况等',
    category: 'performance',
    dataType: 'performance',
    availableFields: [
      '员工ID', '姓名', '部门', '职位', '评估周期',
      '目标完成度', '绩效等级', '绩效得分', '评估人',
      '自评得分', '上级评分', '绩效改进计划', '发展趋势'
    ],
    defaultFields: [
      '员工ID', '姓名', '部门', '职位', '评估周期', '绩效等级', '绩效得分'
    ],
    formats: ['excel', 'csv', 'pdf'],
    filters: [
      { name: '评估周期', type: 'select', options: ['全部', '2024Q4', '2025Q1'] },
      { name: '部门', type: 'multi-select', options: ['技术部', '销售部', '市场部', '人力资源部'] },
      { name: '绩效等级', type: 'multi-select', options: ['S', 'A', 'B', 'C', 'D'] },
    ],
  },
  {
    id: '3',
    name: '考勤数据导出',
    description: '导出员工考勤记录、工时统计等数据',
    category: 'attendance',
    dataType: 'attendance',
    availableFields: [
      '员工ID', '姓名', '部门', '日期', '上班时间', '下班时间',
      '工作时长', '考勤状态', '迟到时长', '早退时长', '缺勤原因',
      '打卡地点', '打卡方式'
    ],
    defaultFields: [
      '员工ID', '姓名', '部门', '日期', '上班时间', '下班时间', '工作时长', '考勤状态'
    ],
    formats: ['excel', 'csv', 'json'],
    filters: [
      { name: '日期范围', type: 'date' },
      { name: '部门', type: 'select', options: ['全部', '技术部', '销售部', '市场部', '人力资源部'] },
      { name: '考勤状态', type: 'multi-select', options: ['正常', '迟到', '早退', '缺勤', '请假'] },
    ],
  },
  {
    id: '4',
    name: '招聘数据导出',
    description: '导出职位信息、候选人简历、面试记录等',
    category: 'recruitment',
    dataType: 'recruitment',
    availableFields: [
      '职位ID', '职位名称', '部门', '招聘人数', '发布日期',
      '候选人ID', '姓名', '手机号', '邮箱', '申请日期',
      '面试状态', '面试轮次', '面试评价', 'Offer状态'
    ],
    defaultFields: [
      '职位ID', '职位名称', '部门', '候选人ID', '姓名', '面试状态', 'Offer状态'
    ],
    formats: ['excel', 'csv', 'json'],
    filters: [
      { name: '职位状态', type: 'select', options: ['全部', '招聘中', '已关闭'] },
      { name: '面试状态', type: 'multi-select', options: ['新简历', '简历筛选', '面试中', '已发Offer', '已入职', '已淘汰'] },
    ],
  },
  {
    id: '5',
    name: '薪酬数据导出',
    description: '导出员工工资明细、奖金、社保公积金等',
    category: 'payroll',
    dataType: 'payroll',
    availableFields: [
      '员工ID', '姓名', '部门', '职位', '发薪月份',
      '基本工资', '绩效工资', '奖金', '加班费',
      '社保个人', '公积金个人', '个人所得税',
      '实发工资', '发放日期'
    ],
    defaultFields: [
      '员工ID', '姓名', '部门', '职位', '发薪月份', '基本工资', '实发工资'
    ],
    formats: ['excel', 'csv', 'pdf'],
    filters: [
      { name: '发薪月份', type: 'select', options: ['全部', '2024-12', '2025-01'] },
      { name: '部门', type: 'select', options: ['全部', '技术部', '销售部', '市场部', '人力资源部'] },
    ],
  },
  {
    id: '6',
    name: '培训数据导出',
    description: '导出培训计划、学习记录、成绩证书等',
    category: 'training',
    dataType: 'training',
    availableFields: [
      '培训计划ID', '培训名称', '类别', '开始日期', '结束日期',
      '员工ID', '姓名', '部门', '报名日期', '学习进度',
      '完成日期', '培训成绩', '获得证书'
    ],
    defaultFields: [
      '培训计划ID', '培训名称', '类别', '员工ID', '姓名', '部门', '学习进度', '培训成绩'
    ],
    formats: ['excel', 'csv', 'json'],
    filters: [
      { name: '培训类别', type: 'select', options: ['全部', '入职培训', '技能培训', '管理培训', '合规培训'] },
      { name: '学习状态', type: 'multi-select', options: ['未开始', '进行中', '已完成'] },
    ],
  },
];

const CATEGORY_CONFIG = {
  employee: {
    label: '员工数据',
    icon: Users,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  performance: {
    label: '绩效数据',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  attendance: {
    label: '考勤数据',
    icon: Clock,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  recruitment: {
    label: '招聘数据',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
  training: {
    label: '培训数据',
    icon: Database,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
  },
  payroll: {
    label: '薪酬数据',
    icon: FileSpreadsheet,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
};

const FORMAT_CONFIG = {
  excel: {
    label: 'Excel',
    icon: FileSpreadsheet,
    extension: '.xlsx',
  },
  csv: {
    label: 'CSV',
    icon: FileCode,
    extension: '.csv',
  },
  json: {
    label: 'JSON',
    icon: FileJson,
    extension: '.json',
  },
  pdf: {
    label: 'PDF',
    icon: FileText,
    extension: '.pdf',
  },
};

export default function DataExportPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'json' | 'pdf'>('excel');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 选择模板
  const handleSelectTemplate = (templateId: string) => {
    const template = EXPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFields([...template.defaultFields]);
    }
  };

  // 切换字段选择
  const handleToggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // 全选/取消全选
  const handleSelectAllFields = (template: ExportTemplate, checked: boolean) => {
    setSelectedFields(checked ? [...template.availableFields] : []);
  };

  // 过滤模板
  const filteredTemplates = useMemo(() => {
    let templates = EXPORT_TEMPLATES;

    // 按分类过滤
    if (categoryFilter !== 'all') {
      templates = templates.filter(t => t.category === categoryFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    return templates;
  }, [searchQuery, categoryFilter]);

  const currentTemplate = EXPORT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              数据导出
            </h1>
            <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              PRO功能
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            灵活导出各类HR数据,支持多种格式和自定义字段
          </p>
        </div>
      </div>

      {/* PRO功能提示 */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                数据导出是PRO专属功能
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                升级到PRO版,解锁完整的数据导出能力,支持自定义字段、多格式导出、定时导出等功能
              </p>
            </div>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
              立即升级
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 模板选择 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>选择导出模板</CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索模板..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-600 dark:text-gray-400">
                    未找到匹配的模板
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const categoryConfig = CATEGORY_CONFIG[template.category];
                    const CategoryIcon = categoryConfig.icon;

                    return (
                      <div
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${categoryConfig.color} shrink-0`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 导出配置 */}
        <div className="lg:col-span-2 space-y-4">
          {!currentTemplate ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  选择一个导出模板
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  从左侧选择一个模板开始配置导出参数
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 字段选择 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>选择导出字段</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        已选 {selectedFields.length} / {currentTemplate.availableFields.length}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectAllFields(
                          currentTemplate,
                          selectedFields.length !== currentTemplate.availableFields.length
                        )}
                      >
                        {selectedFields.length === currentTemplate.availableFields.length
                          ? '取消全选'
                          : '全选'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {currentTemplate.availableFields.map((field) => (
                      <div
                        key={field}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={`field-${field}`}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => handleToggleField(field)}
                        />
                        <label
                          htmlFor={`field-${field}`}
                          className="flex-1 text-sm cursor-pointer select-none"
                        >
                          {field}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 导出格式 */}
              <Card>
                <CardHeader>
                  <CardTitle>选择导出格式</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentTemplate.formats.map((format) => {
                      const formatConfig = FORMAT_CONFIG[format];
                      const FormatIcon = formatConfig.icon;

                      return (
                        <div
                          key={format}
                          onClick={() => setSelectedFormat(format)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                            selectedFormat === format
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <FormatIcon className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {formatConfig.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatConfig.extension}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 导出按钮 */}
              <Card>
                <CardContent className="p-6">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={selectedFields.length === 0}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    导出数据 ({currentTemplate.name}.{FORMAT_CONFIG[selectedFormat].extension.replace('.', '')})
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    数据导出可能需要几分钟时间,请耐心等待
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
