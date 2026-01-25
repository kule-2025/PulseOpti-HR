'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  departmentId: string;
  departmentName?: string;
  companyId: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  status: 'open' | 'closed' | 'paused';
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
}

interface Department {
  id: string;
  name: string;
}

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'paused'>('all');

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    status: 'open' as Job['status'],
  });

  // 获取部门列表
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
    }
  };

  // 获取职位列表
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('获取职位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建职位
  const createJob = async () => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          departmentId: formData.departmentId,
          companyId: 'demo-company',
          location: formData.location,
          salaryMin: Number(formData.salaryMin),
          salaryMax: Number(formData.salaryMax),
          description: formData.description,
          requirements: formData.requirements,
          status: formData.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchJobs();
      }
    } catch (error) {
      console.error('创建职位失败:', error);
    }
  };

  // 更新职位
  const updateJob = async () => {
    if (!editingJob) return;

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          departmentId: formData.departmentId,
          location: formData.location,
          salaryMin: Number(formData.salaryMin),
          salaryMax: Number(formData.salaryMax),
          description: formData.description,
          requirements: formData.requirements,
          status: formData.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchJobs();
      }
    } catch (error) {
      console.error('更新职位失败:', error);
    }
  };

  // 删除职位
  const deleteJob = async (id: string) => {
    if (!confirm('确定要删除这个职位吗？')) return;

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
      }
    } catch (error) {
      console.error('删除职位失败:', error);
    }
  };

  // AI生成职位描述
  const generateDescription = async () => {
    if (!formData.title) {
      alert('请先填写职位名称');
      return;
    }

    try {
      const response = await fetch('/api/ai/job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          departmentId: formData.departmentId,
        }),
      });

      const data = await response.json();
      if (data.success && data.data.description) {
        setFormData(prev => ({
          ...prev,
          description: data.data.description,
          requirements: data.data.requirements || '',
        }));
      }
    } catch (error) {
      console.error('AI生成职位描述失败:', error);
    }
  };

  // 打开编辑对话框
  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      departmentId: job.departmentId,
      location: job.location,
      salaryMin: job.salaryMin.toString(),
      salaryMax: job.salaryMax.toString(),
      description: job.description,
      requirements: job.requirements,
      status: job.status,
    });
    setDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      departmentId: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      description: '',
      requirements: '',
      status: 'open',
    });
    setEditingJob(null);
  };

  // 过滤职位
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchDepartments();
    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">岗位发布</h1>
          <p className="text-muted-foreground mt-1">
            发布和管理招聘职位
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              发布职位
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? '编辑职位' : '发布职位'}</DialogTitle>
              <DialogDescription>
                {editingJob ? '编辑职位信息' : '填写职位详情发布新职位'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">职位名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：高级前端工程师"
                />
              </div>

              <div>
                <Label htmlFor="department">所属部门 *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">工作地点 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：广州市天河区"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">最低薪资 *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="例如：15000"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">最高薪资 *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="例如：25000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">职位状态 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Job['status']) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">招聘中</SelectItem>
                    <SelectItem value="paused">暂停</SelectItem>
                    <SelectItem value="closed">已关闭</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">职位描述 *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateDescription}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI生成
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="详细描述职位职责、工作内容等"
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="requirements">任职要求 *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="描述学历、经验、技能等要求"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingJob ? updateJob : createJob}>
                {editingJob ? '更新' : '发布'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总职位数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">招聘中</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已暂停</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'paused').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已关闭</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>职位列表</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="搜索职位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="open">招聘中</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                  <SelectItem value="closed">已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>职位名称</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>工作地点</TableHead>
                <TableHead>薪资范围</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    暂无职位
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.departmentName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === 'open'
                            ? 'default'
                            : job.status === 'paused'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {job.status === 'open' ? '招聘中' : job.status === 'paused' ? '已暂停' : '已关闭'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
    </div>
  );
}
