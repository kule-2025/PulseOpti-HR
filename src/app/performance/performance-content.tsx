'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Performance {
  id: string;
  employeeId: string;
  employeeName: string;
  cycle: string;
  cycleName: string;
  year: number;
  month?: number;
  quarter?: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  kpiScore: number;
  competenceScore: number;
  attitudeScore: number;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    actual: number;
    weight: number;
    score: number;
  }>;
  comments: string;
  reviewerId?: string;
  reviewerName?: string;
  status: 'draft' | 'pending_review' | 'reviewed' | 'confirmed';
}

interface PerformanceFormData {
  employeeId: string;
  cycle: string;
  cycleName: string;
  year: number;
  month?: number;
  quarter?: number;
  kpiScore: number;
  competenceScore: number;
  attitudeScore: number;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    actual: number;
    weight: number;
  }>;
  comments: string;
  reviewerId?: string;
}

export default function PerformancePageContent() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [formData, setFormData] = useState<PerformanceFormData>({
    employeeId: '',
    cycle: '',
    cycleName: '',
    year: new Date().getFullYear(),
    kpiScore: 0,
    competenceScore: 0,
    attitudeScore: 0,
    goals: [],
    comments: '',
  });

  const [filters, setFilters] = useState({
    employeeId: '',
    cycle: '',
    year: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchPerformances();
  }, [filters, pagination.page]);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        employeeId: filters.employeeId,
        cycle: filters.cycle,
        year: filters.year,
        status: filters.status,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/performances?${params}`);
      const data = await response.json();

      if (data.success) {
        setPerformances(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error('获取绩效列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(performances.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  };

  const handleAddPerformance = () => {
    setEditingPerformance(null);
    setFormData({
      employeeId: '',
      cycle: '',
      cycleName: '',
      year: new Date().getFullYear(),
      kpiScore: 0,
      competenceScore: 0,
      attitudeScore: 0,
      goals: [],
      comments: '',
    });
    setDialogOpen(true);
  };

  const handleEditPerformance = (performance: Performance) => {
    setEditingPerformance(performance);
    setFormData({
      employeeId: performance.employeeId,
      cycle: performance.cycle,
      cycleName: performance.cycleName,
      year: performance.year,
      month: performance.month,
      quarter: performance.quarter,
      kpiScore: performance.kpiScore,
      competenceScore: performance.competenceScore,
      attitudeScore: performance.attitudeScore,
      goals: performance.goals.map((g) => ({
        id: g.id,
        name: g.name,
        target: g.target,
        actual: g.actual,
        weight: g.weight,
      })),
      comments: performance.comments,
      reviewerId: performance.reviewerId,
    });
    setDialogOpen(true);
  };

  const handleSavePerformance = async () => {
    try {
      const url = editingPerformance
        ? `/api/performances/${editingPerformance.id}`
        : '/api/performances';
      const method = editingPerformance ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setDialogOpen(false);
        fetchPerformances();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('保存绩效失败:', error);
      alert('操作失败');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的绩效');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条绩效记录吗？`)) {
      return;
    }

    try {
      const response = await fetch('/api/performances', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceIds: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedIds([]);
        fetchPerformances();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除绩效失败:', error);
      alert('删除失败');
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('确定要删除该绩效记录吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/performances/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchPerformances();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除绩效失败:', error);
      alert('删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: Clock },
      pending_review: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      reviewed: { label: '已审核', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      confirmed: { label: '已确认', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: Clock,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getGradeBadge = (grade: string) => {
    const config: Record<string, { label: string; color: string }> = {
      A: { label: 'A（优秀）', color: 'bg-green-500 text-white' },
      B: { label: 'B（良好）', color: 'bg-blue-500 text-white' },
      C: { label: 'C（合格）', color: 'bg-yellow-500 text-white' },
      D: { label: 'D（不合格）', color: 'bg-red-500 text-white' },
    };
    const { label, color } = config[grade] || { label: grade, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={color}>{label}</Badge>;
  };

  const handleAddGoal = () => {
    setFormData({
      ...formData,
      goals: [
        ...formData.goals,
        {
          id: crypto.randomUUID(),
          name: '',
          target: 0,
          actual: 0,
          weight: 0,
        },
      ],
    });
  };

  const handleUpdateGoal = (index: number, field: string, value: any) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setFormData({ ...formData, goals: updatedGoals });
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = formData.goals.filter((item: any) => (_, i) => i !== index);
    setFormData({ ...formData, goals: updatedGoals });
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            绩效管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            目标设定、绩效评估、结果分析
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button
            onClick={handleAddPerformance}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增绩效
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总记录数</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">优秀（A）</p>
                <p className="text-2xl font-bold text-green-600">
                  {performances.filter((item: any) => (p) => p.grade === 'A').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均分</p>
                <p className="text-2xl font-bold text-purple-600">
                  {performances.length > 0
                    ? Math.round(performances.reduce((sum, p) => sum + p.score, 0) / performances.length)
                    : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待审核</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {performances.filter((item: any) => (p) => p.status === 'pending_review').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>员工ID</Label>
              <Input
                placeholder="输入员工ID"
                value={filters.employeeId}
                onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>考核周期</Label>
              <Select
                value={filters.cycle}
                onValueChange={(value) => setFilters({ ...filters, cycle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部周期</SelectItem>
                  <SelectItem value="2024-Q1">2024年第一季度</SelectItem>
                  <SelectItem value="2024-Q2">2024年第二季度</SelectItem>
                  <SelectItem value="2024-Q3">2024年第三季度</SelectItem>
                  <SelectItem value="2024-Q4">2024年第四季度</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>年份</Label>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters({ ...filters, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部年份</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending_review">待审核</SelectItem>
                  <SelectItem value="reviewed">已审核</SelectItem>
                  <SelectItem value="confirmed">已确认</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ employeeId: '', cycle: '', year: '', status: '' })}>
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                已选择 <span className="font-bold">{selectedIds.length}</span> 项
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 绩效列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === performances.length && performances.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>考核周期</TableHead>
                <TableHead>员工</TableHead>
                <TableHead>总分</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>能力</TableHead>
                <TableHead>态度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>审核人</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : performances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                performances.map((performance) => (
                  <TableRow key={performance.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(performance.id)}
                        onChange={(e) => handleSelectOne(performance.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{performance.cycleName}</TableCell>
                    <TableCell>{performance.employeeName}</TableCell>
                    <TableCell className="font-bold">{performance.score}</TableCell>
                    <TableCell>{getGradeBadge(performance.grade)}</TableCell>
                    <TableCell>{performance.kpiScore}</TableCell>
                    <TableCell>{performance.competenceScore}</TableCell>
                    <TableCell>{performance.attitudeScore}</TableCell>
                    <TableCell>{getStatusBadge(performance.status)}</TableCell>
                    <TableCell>{performance.reviewerName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPerformance(performance)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOne(performance.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {pagination.total} 条记录，每页 {pagination.limit} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPerformance ? '编辑绩效' : '新增绩效'}</DialogTitle>
            <DialogDescription>
              {editingPerformance ? '修改绩效信息' : '为员工创建新的绩效记录'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">员工ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="输入员工ID"
                />
              </div>
              <div>
                <Label htmlFor="cycle">考核周期 *</Label>
                <Input
                  id="cycle"
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                  placeholder="例如：2024-Q1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cycleName">周期名称 *</Label>
                <Input
                  id="cycleName"
                  value={formData.cycleName}
                  onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                  placeholder="例如：2024年第一季度"
                />
              </div>
              <div>
                <Label htmlFor="year">年份 *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="kpiScore">KPI分数 *</Label>
                <Input
                  id="kpiScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.kpiScore}
                  onChange={(e) => setFormData({ ...formData, kpiScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="competenceScore">能力分数 *</Label>
                <Input
                  id="competenceScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.competenceScore}
                  onChange={(e) => setFormData({ ...formData, competenceScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="attitudeScore">态度分数 *</Label>
                <Input
                  id="attitudeScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attitudeScore}
                  onChange={(e) => setFormData({ ...formData, attitudeScore: Number(e.target.value) })}
                />
              </div>
            </div>
            
            {/* 目标管理 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>目标设定</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddGoal}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加目标
                </Button>
              </div>
              {formData.goals.length > 0 && (
                <div className="space-y-2 border rounded-lg p-4">
                  {formData.goals.map((goal, index) => (
                    <div key={goal.id} className="grid grid-cols-5 gap-2 items-start">
                      <Input
                        placeholder="目标名称"
                        value={goal.name}
                        onChange={(e) => handleUpdateGoal(index, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="目标值"
                        value={goal.target}
                        onChange={(e) => handleUpdateGoal(index, 'target', Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="实际值"
                        value={goal.actual}
                        onChange={(e) => handleUpdateGoal(index, 'actual', Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="权重"
                        value={goal.weight}
                        onChange={(e) => handleUpdateGoal(index, 'weight', Number(e.target.value))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="comments">评语</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="填写绩效评语..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSavePerformance}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
