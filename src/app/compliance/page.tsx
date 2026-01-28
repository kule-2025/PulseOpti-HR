'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Scale,
  Gavel,
  FileSignature,
  Calendar,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Crown,
  FileCheck,
  Gavel,
  FileSignature,
} from 'lucide-react';

// 劳动合同数据
const contractsData = [
  {
    id: 1,
    employee: '张三',
    department: '研发部',
    position: '高级工程师',
    contractType: '固定期限',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    status: '生效中',
    signedDate: '2024-01-01',
    renewalCount: 0,
    probationPeriod: '3个月',
    salary: '35,000元/月',
    riskLevel: 'low',
  },
  {
    id: 2,
    employee: '李四',
    department: '市场部',
    position: '市场经理',
    contractType: '固定期限',
    startDate: '2023-06-01',
    endDate: '2025-05-31',
    status: '即将到期',
    signedDate: '2023-06-01',
    renewalCount: 1,
    probationPeriod: '3个月',
    salary: '28,000元/月',
    riskLevel: 'high',
  },
  {
    id: 3,
    employee: '王五',
    department: '产品部',
    position: '产品经理',
    contractType: '无固定期限',
    startDate: '2022-01-01',
    endDate: null,
    status: '生效中',
    signedDate: '2022-01-01',
    renewalCount: 2,
    probationPeriod: '3个月',
    salary: '32,000元/月',
    riskLevel: 'low',
  },
];

// 风险统计数据
const riskStats = {
  total: 485,
  active: 412,
  expiring: 23,
  expired: 15,
  probation: 35,
  highRisk: 28,
};

// 试用期数据
const probationData = [
  {
    id: 1,
    employee: '赵六',
    department: '销售部',
    position: '销售代表',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    daysRemaining: 45,
    progress: 50,
    evaluationScore: 85,
    status: '评估中',
  },
  {
    id: 2,
    employee: '钱七',
    department: '运营部',
    position: '运营专员',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    daysRemaining: 65,
    progress: 33,
    evaluationScore: null,
    status: '进行中',
  },
];

// 风险控制数据
const riskControlData = [
  {
    id: 1,
    type: '合同到期',
    level: 'high',
    count: 23,
    description: '30天内到期的合同',
    trend: 'up',
    impact: '可能导致用工纠纷',
  },
  {
    id: 2,
    type: '社保漏缴',
    level: 'high',
    count: 8,
    description: '社保未及时缴纳',
    trend: 'stable',
    impact: '可能面临行政处罚',
  },
  {
    id: 3,
    type: '超时工作',
    level: 'medium',
    count: 45,
    description: '员工月加班超时',
    trend: 'down',
    impact: '可能产生加班费',
  },
  {
    id: 4,
    type: '未签合同',
    level: 'critical',
    count: 3,
    description: '入职未及时签合同',
    trend: 'up',
    impact: '可能面临双倍工资赔偿',
  },
];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('contracts');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={Shield}
        title="合规管理"
        description="劳动合同管理、用工风险控制、法律知识库"
        proBadge={true}
        breadcrumbs={[
          { name: 'COE中心', href: '/coe' },
          { name: '合规管理', href: '/compliance' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              新建合同
            </Button>
          </div>
        }
      />

      {/* 风险概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              总合同数
            </CardDescription>
            <CardTitle className="text-3xl">{riskStats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>生效中 {riskStats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              即将到期
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">{riskStats.expiring}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-orange-600">
              需及时续签，避免风险
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              试用期员工
            </CardDescription>
            <CardTitle className="text-3xl">{riskStats.probation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              需关注转正评估
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              高风险
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{riskStats.highRisk}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-600">
              需立即处理
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 风险预警 */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                风险预警
              </CardTitle>
              <CardDescription className="mt-1">
                发现 {riskControlData.filter(r => r.level === 'critical').length} 个严重风险，{riskControlData.filter(r => r.level === 'high').length} 个高风险项
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskControlData.slice(0, 2).map((risk) => (
              <div
                key={risk.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  risk.level === 'critical'
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700'
                    : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    risk.level === 'critical' ? 'bg-red-600' : 'bg-orange-600'
                  }`}>
                    {risk.level === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {risk.type}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {risk.description} · 影响: {risk.impact}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {risk.count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {risk.level === 'critical' ? '严重' : '高风险'}
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    立即处理
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contracts">劳动合同</TabsTrigger>
          <TabsTrigger value="probation">试用期管理</TabsTrigger>
          <TabsTrigger value="risk">风险控制</TabsTrigger>
          <TabsTrigger value="legal">法律知识</TabsTrigger>
        </TabsList>

        {/* 劳动合同 */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>劳动合同管理</CardTitle>
                  <CardDescription>
                    管理所有员工的劳动合同，到期自动提醒
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索员工..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractsData.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {contract.employee.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {contract.employee}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.department} · {contract.position}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {contract.contractType} · {contract.startDate} 至 {contract.endDate || '无固定期限'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={contract.status === '生效中' ? 'default' : 'destructive'}
                          className={contract.status === '生效中' ? 'bg-green-600' : ''}
                        >
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 试用期管理 */}
        <TabsContent value="probation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>试用期管理</CardTitle>
              <CardDescription>
                跟踪员工试用期进度，及时进行转正评估
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {probationData.map((probation) => (
                  <div
                    key={probation.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {probation.employee.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {probation.employee}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {probation.department} · {probation.position}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          剩余 {probation.daysRemaining} 天
                        </div>
                        <Badge
                          variant={probation.status === '评估中' ? 'default' : 'secondary'}
                        >
                          {probation.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">试用期进度</span>
                        <span className="font-medium">{probation.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                          style={{ width: `${probation.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        延长试用期
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                        开始评估
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风险控制 */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>风险控制</CardTitle>
              <CardDescription>
                识别和控制用工风险，确保合规经营
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskControlData.map((risk) => (
                  <div
                    key={risk.id}
                    className={`p-4 border rounded-lg ${
                      risk.level === 'critical'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700'
                        : risk.level === 'high'
                        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
                        : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          risk.level === 'critical'
                            ? 'bg-red-600'
                            : risk.level === 'high'
                            ? 'bg-orange-600'
                            : 'bg-yellow-600'
                        }`}>
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {risk.type}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {risk.description}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            影响: {risk.impact}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {risk.count}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {risk.level === 'critical'
                              ? '严重'
                              : risk.level === 'high'
                              ? '高风险'
                              : '中风险'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {risk.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : risk.trend === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          className={
                            risk.level === 'critical'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-orange-600 hover:bg-orange-700'
                          }
                        >
                          立即处理
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 法律知识库 - 深度开发 PRO 功能 */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI 法律知识库
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">PRO</Badge>
              </CardTitle>
              <CardDescription>
                智能检索劳动法规，提供专业法律支持
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* AI 智能检索 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">AI 智能检索</span>
                  <Badge variant="outline" className="border-purple-600 text-purple-600">AI</Badge>
                </div>
                <div className="relative">
                  <Input
                    placeholder="请输入法律问题，例如：'试用期最长时间'、'加班工资如何计算'..."
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 劳动合同模板库 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    劳动合同模板库
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">PRO</Badge>
                  </h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    添加模板
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: '标准劳动合同',
                      desc: '适用于全日制员工',
                      category: '通用',
                      usage: 156,
                      features: ['固定期限', '无固定期限', '试用期条款'],
                    },
                    {
                      name: '实习协议',
                      desc: '适用于在校学生',
                      category: '实习',
                      usage: 89,
                      features: ['实习期限', '实习报酬', '意外保险'],
                    },
                    {
                      name: '劳务派遣协议',
                      desc: '适用于劳务派遣用工',
                      category: '特殊',
                      usage: 45,
                      features: ['派遣单位', '用工单位', '责任划分'],
                    },
                    {
                      name: '兼职合同',
                      desc: '适用于非全日制用工',
                      category: '特殊',
                      usage: 67,
                      features: ['工作时间', '报酬结算', '社会保险'],
                    },
                    {
                      name: '保密协议',
                      desc: '保护商业秘密',
                      category: '专项',
                      usage: 134,
                      features: ['保密范围', '保密期限', '违约责任'],
                    },
                    {
                      name: '竞业限制协议',
                      desc: '限制竞业行为',
                      category: '专项',
                      usage: 78,
                      features: ['竞业范围', '限制期限', '补偿标准'],
                    },
                  ].map((template, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-400"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            使用 {template.usage} 次
                          </span>
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {template.features.map((feature, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full">
                          <FileCheck className="h-4 w-4 mr-2" />
                          使用模板
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 合规性报告自动生成 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-600" />
                    合规性报告
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">PRO</Badge>
                  </h3>
                  <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI 自动生成
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: '月度合规报告',
                      desc: '每月自动生成用工合规性报告',
                      type: '月度',
                      lastGenerated: '2024-01-15',
                      items: ['合同到期提醒', '社保缴纳检查', '加班时间合规性'],
                    },
                    {
                      name: '季度风险评估报告',
                      desc: '每季度深度分析用工风险',
                      type: '季度',
                      lastGenerated: '2024-01-10',
                      items: ['高风险识别', '改进建议', '预防措施'],
                    },
                    {
                      name: '年度审计报告',
                      desc: '年度用工合规性审计',
                      type: '年度',
                      lastGenerated: '2024-01-05',
                      items: ['全面合规检查', '问题清单', '整改方案'],
                    },
                    {
                      name: '专项合规报告',
                      desc: '针对特定问题的深度分析',
                      type: '专项',
                      lastGenerated: '2024-01-08',
                      items: ['加班费合规性', '社保缴费准确性', '个税代扣代缴'],
                    },
                  ].map((report, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {report.lastGenerated} 生成
                          </span>
                        </div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {report.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {item}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
