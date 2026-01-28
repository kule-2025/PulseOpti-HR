'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Copy,
  Zap,
  LineChart,
  PieChart,
  TrendingUp,
} from 'lucide-react';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: string;
  createdAt: string;
  lastModified: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  metrics: string[];
  chartType: 'bar' | 'line' | 'pie' | 'table';
  dataSources: string[];
  scheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipientCount: number;
}

// 模拟报表数据
const REPORTS_DATA: CustomReport[] = [
  {
    id: '1',
    name: '员工流失分析报告',
    description: '分析员工离职趋势、原因和流失率',
    category: '人事分析',
    creator: '张经理',
    createdAt: '2024-10-01',
    lastModified: '2025-01-15',
    isPublic: true,
    status: 'published',
    metrics: ['离职率', '离职原因分布', '部门流失率', '工龄分布'],
    chartType: 'bar',
    dataSources: ['员工信息', '离职记录', '考勤记录'],
    scheduled: true,
    scheduleFrequency: 'monthly',
    recipientCount: 12,
  },
  {
    id: '2',
    name: '绩效奖金分布报告',
    description: '展示各部门绩效奖金分布和排名',
    category: '薪酬分析',
    creator: 'HRBP',
    createdAt: '2024-11-15',
    lastModified: '2025-01-16',
    isPublic: true,
    status: 'published',
    metrics: ['奖金总额', '人均奖金', '部门排名', '绩效分数'],
    chartType: 'pie',
    dataSources: ['绩效数据', '薪酬数据'],
    scheduled: true,
    scheduleFrequency: 'monthly',
    recipientCount: 8,
  },
  {
    id: '3',
    name: '考勤异常分析',
    description: '分析员工考勤异常情况（迟到、早退、缺勤）',
    category: '考勤分析',
    creator: 'HR专员',
    createdAt: '2024-12-01',
    lastModified: '2025-01-10',
    isPublic: false,
    status: 'published',
    metrics: ['迟到次数', '早退次数', '缺勤天数', '出勤率'],
    chartType: 'bar',
    dataSources: ['考勤记录'],
    scheduled: false,
    recipientCount: 5,
  },
  {
    id: '4',
    name: '招聘漏斗分析',
    description: '分析招聘各环节转化率和耗时',
    category: '招聘分析',
    creator: '招聘经理',
    createdAt: '2025-01-05',
    lastModified: '2025-01-16',
    isPublic: true,
    status: 'draft',
    metrics: ['投递数', '筛选数', '面试数', '录用数', '入职数'],
    chartType: 'line',
    dataSources: ['招聘数据', '简历数据'],
    scheduled: false,
    recipientCount: 3,
  },
  {
    id: '5',
    name: '培训效果评估',
    description: '评估培训投入产出比和效果',
    category: '培训分析',
    creator: '培训经理',
    createdAt: '2024-09-15',
    lastModified: '2024-12-20',
    isPublic: true,
    status: 'published',
    metrics: ['培训人次', '培训成本', '满意度', '绩效提升'],
    chartType: 'table',
    dataSources: ['培训记录', '绩效数据', '薪酬数据'],
    scheduled: true,
    scheduleFrequency: 'quarterly',
    recipientCount: 6,
  },
];

const CHART_TYPE_CONFIG = {
  bar: { label: '柱状图', icon: BarChart3 },
  line: { label: '折线图', icon: LineChart },
  pie: { label: '饼图', icon: PieChart },
  table: { label: '表格', icon: BarChart3 },
};

const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  published: { label: '已发布', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' },
  archived: { label: '已归档', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400' },
};

const CATEGORIES = ['全部', '人事分析', '薪酬分析', '考勤分析', '招聘分析', '培训分析'];

export default function CustomReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤报表
  const filteredReports = useMemo(() => {
    let reports = REPORTS_DATA;

    // 按分类过滤
    if (categoryFilter !== '全部') {
      reports = reports.filter(r => r.category === categoryFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      reports = reports.filter(r => r.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      reports = reports.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.creator.toLowerCase().includes(query)
      );
    }

    return reports;
  }, [searchQuery, categoryFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: REPORTS_DATA.length,
      published: REPORTS_DATA.filter(r => r.status === 'published').length,
      draft: REPORTS_DATA.filter(r => r.status === 'draft').length,
      scheduled: REPORTS_DATA.filter(r => r.scheduled).length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              自定义报表
            </h1>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Zap className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            创建和管理自定义数据报表
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          创建报表
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>报表总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已发布</CardDescription>
            <CardTitle className="text-3xl">{stats.published}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>草稿</CardDescription>
            <CardTitle className="text-3xl">{stats.draft}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              定时报表
            </CardDescription>
            <CardTitle className="text-3xl">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 报表列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>报表列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索报表..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无报表
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有报表
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status];
                const chartTypeConfig = CHART_TYPE_CONFIG[report.chartType];
                const ChartIcon = chartTypeConfig.icon;

                return (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline">{report.category}</Badge>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 图表类型 */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ChartIcon className="h-4 w-4" />
                        <span>{chartTypeConfig.label}</span>
                      </div>

                      {/* 数据指标 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          数据指标
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {report.metrics.slice(0, 3).map((metric, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                          {report.metrics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.metrics.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 数据源 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          数据源
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {report.dataSources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* 调度信息 */}
                      {report.scheduled && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <TrendingUp className="h-4 w-4" />
                            <span>
                              定时任务：{report.scheduleFrequency === 'daily' && '每天'}
                              {report.scheduleFrequency === 'weekly' && '每周'}
                              {report.scheduleFrequency === 'monthly' && '每月'}
                              发送给 {report.recipientCount} 人
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 创建信息 */}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        创建者：{report.creator} · 修改于：{report.lastModified}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                        {report.status === 'published' && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
