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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Target,
  User,
  Building,
  Eye,
  Edit,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
type IssueCategory = 'talent' | 'culture' | 'process' | 'system' | 'other';
type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';

interface Issue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  description: string;
  impact: string;
  rootCause?: string;
  affectedAreas: string[];
  detectedDate: string;
  reportedBy: string;
  assignedTo?: string;
  dueDate?: string;
  solution?: string;
  resolvedDate?: string;
  createdAt: string;
}

export default function OrganizationIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newIssue, setNewIssue] = useState({
    title: '',
    category: 'talent' as IssueCategory,
    severity: 'medium' as IssueSeverity,
    description: '',
    impact: '',
    affectedAreas: '',
    assignedTo: '',
    dueDate: '',
  });

  useEffect(() => {
    // 模拟获取组织问题数据
    setTimeout(() => {
      setIssues([
        {
          id: '1',
          title: '核心人才流失严重',
          category: 'talent',
          severity: 'critical',
          status: 'investigating',
          description: '技术部门核心人才流失率超过20%，影响项目交付',
          impact: '项目延期风险增加，知识流失严重',
          rootCause: '薪酬竞争力不足，晋升通道不明确',
          affectedAreas: ['技术部', '产品部'],
          detectedDate: '2024-01-15',
          reportedBy: 'HR Director',
          assignedTo: 'HR BP',
          dueDate: '2024-02-15',
          createdAt: '2024-01-15T10:00:00',
        },
        {
          id: '2',
          title: '跨部门协作效率低',
          category: 'process',
          severity: 'high',
          status: 'open',
          description: '技术、产品、运营部门之间的沟通不畅，导致项目推进缓慢',
          impact: '项目周期延长，资源浪费',
          affectedAreas: ['技术部', '产品部', '运营部'],
          detectedDate: '2024-01-20',
          reportedBy: '产品总监',
          assignedTo: 'COO',
          createdAt: '2024-01-20T14:30:00',
        },
        {
          id: '3',
          title: '员工满意度下降',
          category: 'culture',
          severity: 'medium',
          status: 'resolved',
          description: '最新员工满意度调查显示，整体满意度下降5%',
          impact: '员工敬业度可能下降，影响绩效',
          rootCause: '福利政策调整，加班较多',
          affectedAreas: ['全公司'],
          detectedDate: '2024-01-10',
          reportedBy: 'HR BP',
          assignedTo: 'HR Director',
          dueDate: '2024-01-31',
          solution: '优化福利政策，推行弹性工作制',
          resolvedDate: '2024-01-25',
          createdAt: '2024-01-10T09:00:00',
        },
        {
          id: '4',
          title: '新员工培训体系不完善',
          category: 'system',
          severity: 'high',
          status: 'open',
          description: '新员工入职后缺乏系统性培训，导致上岗时间长',
          impact: '新员工流失率高，团队效率低',
          affectedAreas: ['人力资源部', '各部门'],
          detectedDate: '2024-01-22',
          reportedBy: '部门负责人',
          assignedTo: 'HR Administrator',
          createdAt: '2024-01-22T16:00:00',
        },
        {
          id: '5',
          title: '绩效考核机制不公',
          category: 'process',
          severity: 'medium',
          status: 'investigating',
          description: '部分员工反馈绩效考核标准不明确，存在主观性',
          impact: '员工士气低落，可能引发更多申诉',
          affectedAreas: ['销售部', '技术部'],
          detectedDate: '2024-01-25',
          reportedBy: 'HR BP',
          assignedTo: 'HR Director',
          createdAt: '2024-01-25T11:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateIssue = () => {
    const issue: Issue = {
      id: Date.now().toString(),
      title: newIssue.title,
      category: newIssue.category,
      severity: newIssue.severity,
      status: 'open',
      description: newIssue.description,
      impact: newIssue.impact,
      affectedAreas: newIssue.affectedAreas.split(',').map((s) => s.trim()),
      detectedDate: new Date().toISOString().split('T')[0],
      reportedBy: '当前用户',
      assignedTo: newIssue.assignedTo,
      dueDate: newIssue.dueDate,
      createdAt: new Date().toISOString(),
    };
    setIssues([issue, ...issues]);
    setShowCreateIssue(false);
    toast.success('问题已创建');
    setNewIssue({
      title: '',
      category: 'talent',
      severity: 'medium',
      description: '',
      impact: '',
      affectedAreas: '',
      assignedTo: '',
      dueDate: '',
    });
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.affectedAreas.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const categoryConfig: Record<IssueCategory, { label: string; color: string; icon: any }> = {
    talent: { label: '人才问题', color: 'bg-blue-500', icon: User },
    culture: { label: '文化问题', color: 'bg-purple-500', icon: Target },
    process: { label: '流程问题', color: 'bg-yellow-500', icon: TrendingUp },
    system: { label: '系统问题', color: 'bg-orange-500', icon: AlertTriangle },
    other: { label: '其他问题', color: 'bg-gray-500', icon: AlertTriangle },
  };

  const severityConfig: Record<IssueSeverity, { label: string; color: string; level: number }> = {
    critical: { label: '严重', color: 'bg-red-500', level: 4 },
    high: { label: '高', color: 'bg-orange-500', level: 3 },
    medium: { label: '中', color: 'bg-yellow-500', level: 2 },
    low: { label: '低', color: 'bg-blue-500', level: 1 },
  };

  const statusConfig: Record<IssueStatus, { label: string; color: string; icon: any }> = {
    open: { label: '待处理', color: 'bg-gray-500', icon: Clock },
    investigating: { label: '调查中', color: 'bg-blue-500', icon: TrendingUp },
    resolved: { label: '已解决', color: 'bg-green-500', icon: CheckCircle },
    closed: { label: '已关闭', color: 'bg-gray-400', icon: CheckCircle },
  };

  const statistics = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    investigating: issues.filter((i) => i.status === 'investigating').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    critical: issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              问题诊断
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              识别和分析组织问题
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateIssue(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建问题
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总问题数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">待处理</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.open}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">调查中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.investigating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已解决</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">严重未解决</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
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
                  placeholder="搜索问题标题或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(categoryConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="严重程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部程度</SelectItem>
                  {Object.entries(severityConfig).map(([value, config]) => (
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

        {/* 问题列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无问题记录</p>
              <Button className="mt-4" onClick={() => setShowCreateIssue(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建问题
              </Button>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const categoryIcon = categoryConfig[issue.category].icon;
              const CategoryIcon = categoryIcon;
              const statusIcon = statusConfig[issue.status].icon;
              const StatusIcon = statusIcon;

              return (
                <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${categoryConfig[issue.category].color} text-white border-0 flex items-center gap-1`}>
                            <CategoryIcon className="h-3 w-3" />
                            {categoryConfig[issue.category].label}
                          </Badge>
                          <Badge className={`${severityConfig[issue.severity].color} text-white border-0`}>
                            {severityConfig[issue.severity].label}
                          </Badge>
                          <Badge className={statusConfig[issue.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[issue.status].label}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {issue.description}
                      </p>

                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">影响</p>
                        <p className="text-sm">{issue.impact}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">发现日期</span>
                          <p className="font-medium">{issue.detectedDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">报告人</span>
                          <p className="font-medium">{issue.reportedBy}</p>
                        </div>
                        {issue.assignedTo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">负责人</span>
                            <p className="font-medium">{issue.assignedTo}</p>
                          </div>
                        )}
                        {issue.dueDate && issue.status !== 'resolved' && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">截止日期</span>
                            <p className="font-medium">{issue.dueDate}</p>
                          </div>
                        )}
                      </div>

                      {issue.affectedAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {issue.affectedAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {issue.rootCause && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">根本原因</p>
                          <p className="text-sm">{issue.rootCause}</p>
                        </div>
                      )}

                      {issue.solution && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">解决方案</p>
                          <p className="text-sm">{issue.solution}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {issue.status === 'open' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            开始调查
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 创建问题弹窗 */}
      <Dialog open={showCreateIssue} onOpenChange={setShowCreateIssue}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建问题</DialogTitle>
            <DialogDescription>
              记录新发现的组织问题
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>问题标题 *</Label>
              <Input
                placeholder="输入问题标题"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>问题分类 *</Label>
                <Select
                  value={newIssue.category}
                  onValueChange={(v) => setNewIssue({ ...newIssue, category: v as IssueCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>严重程度 *</Label>
                <Select
                  value={newIssue.severity}
                  onValueChange={(v) => setNewIssue({ ...newIssue, severity: v as IssueSeverity })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(severityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>问题描述 *</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="详细描述问题..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>影响描述 *</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="描述问题带来的影响..."
                value={newIssue.impact}
                onChange={(e) => setNewIssue({ ...newIssue, impact: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>影响区域</Label>
              <Input
                placeholder="用逗号分隔，如：技术部,产品部"
                value={newIssue.affectedAreas}
                onChange={(e) => setNewIssue({ ...newIssue, affectedAreas: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>负责人</Label>
                <Input
                  placeholder="输入负责人姓名"
                  value={newIssue.assignedTo}
                  onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>截止日期</Label>
                <Input
                  type="date"
                  value={newIssue.dueDate}
                  onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateIssue(false)}>
              取消
            </Button>
            <Button onClick={handleCreateIssue}>
              <Plus className="h-4 w-4 mr-2" />
              创建问题
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
