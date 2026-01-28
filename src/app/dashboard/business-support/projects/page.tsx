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
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  User,
  Building,
  Eye,
  Edit,
  Download,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
type ProjectPriority = 'critical' | 'high' | 'medium' | 'low';

interface ProjectMember {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  category: 'recruitment' | 'training' | 'compensation' | 'culture' | 'organization' | 'talent' | 'process' | 'other';
  businessUnit: string;
  sponsor: string;
  projectManager: string;
  members: ProjectMember[];
  startDate: string;
  endDate?: string;
  plannedEndDate: string;
  budget: number;
  actualCost?: number;
  progress: number;
  milestones: {
    id: string;
    name: string;
    targetDate: string;
    status: 'pending' | 'completed' | 'delayed';
  }[];
  objectives: string[];
  risks: string[];
  createdAt: string;
  updatedAt: string;
}

export default function BusinessSupportProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    category: 'other' as Project['category'],
    businessUnit: '',
    sponsor: '',
    projectManager: '',
    startDate: '',
    plannedEndDate: '',
    budget: '',
  });

  useEffect(() => {
    // 模拟获取业务支持项目数据
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: '技术团队人才梯队建设项目',
          code: 'HR-2024-001',
          description: '建立技术团队完整的人才梯队，包括高潜人才识别、培养和继任计划',
          status: 'in-progress',
          priority: 'high',
          category: 'talent',
          businessUnit: '技术部',
          sponsor: 'CTO',
          projectManager: '张三 (HR BP)',
          members: [
            { id: '1', employeeId: 'E001', employeeName: '李四', role: '执行', department: '技术部' },
            { id: '2', employeeId: 'E002', employeeName: '王五', role: '执行', department: '技术部' },
            { id: '3', employeeId: 'E003', employeeName: '赵六', role: '支持', department: 'HR部' },
          ],
          startDate: '2024-01-01',
          plannedEndDate: '2024-06-30',
          budget: 300000,
          actualCost: 80000,
          progress: 35,
          milestones: [
            { id: '1', name: '人才盘点完成', targetDate: '2024-01-31', status: 'completed' },
            { id: '2', name: '高潜人才识别', targetDate: '2024-02-29', status: 'completed' },
            { id: '3', name: '培养计划制定', targetDate: '2024-03-31', status: 'completed' },
            { id: '4', name: '培训实施', targetDate: '2024-05-31', status: 'pending' },
            { id: '5', name: '项目验收', targetDate: '2024-06-30', status: 'pending' },
          ],
          objectives: [
            '识别并培养20名高潜人才',
            '建立技术团队继任计划',
            '降低核心人才流失率至10%以下',
          ],
          risks: [
            '预算可能超支',
            '业务部门配合度',
            '培养效果难以量化',
          ],
          createdAt: '2024-01-01T09:00:00',
          updatedAt: '2024-02-28T16:00:00',
        },
        {
          id: '2',
          name: '跨部门协作流程优化项目',
          code: 'HR-2024-002',
          description: '优化技术、产品、运营部门之间的协作流程，提高项目交付效率',
          status: 'in-progress',
          priority: 'critical',
          category: 'process',
          businessUnit: '全公司',
          sponsor: 'COO',
          projectManager: '李四 (HR BP)',
          members: [
            { id: '1', employeeId: 'E010', employeeName: '孙七', role: '执行', department: '技术部' },
            { id: '2', employeeId: 'E011', employeeName: '周八', role: '执行', department: '产品部' },
          ],
          startDate: '2024-01-15',
          plannedEndDate: '2024-04-30',
          budget: 200000,
          actualCost: 60000,
          progress: 50,
          milestones: [
            { id: '1', name: '流程调研完成', targetDate: '2024-01-31', status: 'completed' },
            { id: '2', name: '问题分析报告', targetDate: '2024-02-15', status: 'completed' },
            { id: '3', name: '流程设计', targetDate: '2024-03-15', status: 'pending' },
            { id: '4', name: '试点实施', targetDate: '2024-04-15', status: 'pending' },
          ],
          objectives: [
            '项目交付周期缩短20%',
            '跨部门沟通效率提升30%',
            '建立标准化协作流程',
          ],
          risks: [
            '部门间利益冲突',
            '流程变更阻力大',
          ],
          createdAt: '2024-01-10T10:00:00',
          updatedAt: '2024-02-25T14:30:00',
        },
        {
          id: '3',
          name: '销售团队激励体系优化',
          code: 'HR-2024-003',
          description: '优化销售团队的薪酬和激励机制，提高销售业绩和团队稳定性',
          status: 'planning',
          priority: 'high',
          category: 'compensation',
          businessUnit: '销售部',
          sponsor: '销售总监',
          projectManager: '王五 (HR BP)',
          members: [],
          startDate: '2024-03-01',
          plannedEndDate: '2024-05-31',
          budget: 150000,
          progress: 0,
          milestones: [],
          objectives: [
            '设计新的激励方案',
            '提升销售团队满意度',
          ],
          risks: [],
          createdAt: '2024-02-01T11:00:00',
          updatedAt: '2024-02-01T11:00:00',
        },
        {
          id: '4',
          name: '企业文化落地项目',
          code: 'HR-2024-004',
          description: '推动公司核心价值观在各部门的落地，提升企业文化认同度',
          status: 'completed',
          priority: 'medium',
          category: 'culture',
          businessUnit: '全公司',
          sponsor: 'CEO',
          projectManager: 'HR Director',
          members: [
            { id: '1', employeeId: 'E020', employeeName: '吴九', role: '执行', department: 'HR部' },
          ],
          startDate: '2023-10-01',
          endDate: '2024-01-31',
          plannedEndDate: '2024-01-31',
          budget: 100000,
          actualCost: 95000,
          progress: 100,
          milestones: [
            { id: '1', name: '文化调研', targetDate: '2023-10-31', status: 'completed' },
            { id: '2', name: '文化理念宣导', targetDate: '2023-12-31', status: 'completed' },
            { id: '3', name: '文化活动实施', targetDate: '2024-01-31', status: 'completed' },
          ],
          objectives: [
            '员工文化认同度达到85%',
            '完成10场文化活动',
          ],
          risks: [],
          createdAt: '2023-09-15T09:00:00',
          updatedAt: '2024-02-01T10:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      code: newProject.code || 'HR-' + new Date().getFullYear() + '-' + String(projects.length + 1).padStart(3, '0'),
      description: newProject.description,
      status: 'planning',
      priority: 'medium',
      category: newProject.category,
      businessUnit: newProject.businessUnit,
      sponsor: newProject.sponsor,
      projectManager: newProject.projectManager,
      members: [],
      startDate: newProject.startDate,
      plannedEndDate: newProject.plannedEndDate,
      budget: parseFloat(newProject.budget) || 0,
      progress: 0,
      milestones: [],
      objectives: [],
      risks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([project, ...projects]);
    setShowCreateProject(false);
    toast.success('项目已创建');
    setNewProject({
      name: '',
      code: '',
      description: '',
      category: 'other',
      businessUnit: '',
      sponsor: '',
      projectManager: '',
      startDate: '',
      plannedEndDate: '',
      budget: '',
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.businessUnit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: any }> = {
    planning: { label: '规划中', color: 'bg-gray-500', icon: FolderKanban },
    'in-progress': { label: '进行中', color: 'bg-blue-500', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
    'on-hold': { label: '暂停', color: 'bg-yellow-500', icon: Clock },
    cancelled: { label: '已取消', color: 'bg-red-500', icon: Clock },
  };

  const priorityConfig: Record<ProjectPriority, { label: string; color: string; level: number }> = {
    critical: { label: '关键', color: 'bg-red-500', level: 4 },
    high: { label: '高', color: 'bg-orange-500', level: 3 },
    medium: { label: '中', color: 'bg-yellow-500', level: 2 },
    low: { label: '低', color: 'bg-blue-500', level: 1 },
  };

  const categoryConfig: Record<Project['category'], { label: string; color: string }> = {
    recruitment: { label: '招聘', color: 'bg-blue-500' },
    training: { label: '培训', color: 'bg-green-500' },
    compensation: { label: '薪酬', color: 'bg-purple-500' },
    culture: { label: '文化', color: 'bg-pink-500' },
    organization: { label: '组织', color: 'bg-orange-500' },
    process: { label: '流程', color: 'bg-cyan-500' },
    talent: { label: '人才', color: 'bg-indigo-500' },
    other: { label: '其他', color: 'bg-gray-500' },
  };

  const statistics = {
    total: projects.length,
    planning: projects.filter((p) => p.status === 'planning').length,
    inProgress: projects.filter((p) => p.status === 'in-progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-blue-600" />
              业务支持项目
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理HR支持业务部门的项目
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总项目数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">规划中</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.planning}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总预算</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(statistics.totalBudget / 10000).toFixed(0)}万
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
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
                  placeholder="搜索项目名称、编号或业务单元..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无项目</p>
              <Button className="mt-4" onClick={() => setShowCreateProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const StatusIcon = statusConfig[project.status].icon;
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{project.code}</Badge>
                          <Badge className={`${statusConfig[project.status].color} text-white border-0 flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[project.status].label}
                          </Badge>
                          <Badge className={`${priorityConfig[project.priority].color} text-white border-0`}>
                            {priorityConfig[project.priority].label}
                          </Badge>
                          <Badge className={`${categoryConfig[project.category].color} text-white border-0`}>
                            {categoryConfig[project.category].label}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {project.description}
                      </p>

                      {/* 进度 */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">项目进度</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              project.progress >= 80 ? 'bg-green-500' :
                              project.progress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 时间和预算 */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">开始时间</p>
                            <p className="font-medium">{project.startDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">预计完成</p>
                            <p className="font-medium">{project.plannedEndDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">业务单元</p>
                            <p className="font-medium">{project.businessUnit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">预算</p>
                            <p className="font-medium">
                              {(project.budget / 10000).toFixed(1)}万元
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 团队成员 */}
                      {project.members.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {project.members.length} 位成员
                          </span>
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 3).map((member) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white dark:border-gray-800"
                                title={member.employeeName}
                              >
                                <span className="text-xs font-medium text-blue-600">
                                  {member.employeeName.charAt(0)}
                                </span>
                              </div>
                            ))}
                            {project.members.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white dark:border-gray-800">
                                <span className="text-xs text-gray-600">
                                  +{project.members.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 项目经理和发起人 */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">项目经理</span>
                          <p className="font-medium">{project.projectManager}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">发起人</span>
                          <p className="font-medium">{project.sponsor}</p>
                        </div>
                      </div>

                      {/* 里程碑 */}
                      {project.milestones.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">里程碑进度</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {project.milestones.slice(0, 4).map((milestone) => (
                              <div
                                key={milestone.id}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  milestone.status === 'completed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : milestone.status === 'delayed'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                              >
                                {milestone.name}
                              </div>
                            ))}
                            {project.milestones.length > 4 && (
                              <span className="flex-shrink-0 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
                                +{project.milestones.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {project.status === 'planning' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
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

      {/* 创建项目弹窗 */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建业务支持项目</DialogTitle>
            <DialogDescription>
              创建新的HR支持业务部门的项目
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>项目名称 *</Label>
                <Input
                  placeholder="输入项目名称"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>项目编号</Label>
                <Input
                  placeholder="自动生成或手动输入"
                  value={newProject.code}
                  onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>项目分类 *</Label>
                <Select
                  value={newProject.category}
                  onValueChange={(v) => setNewProject({ ...newProject, category: v as Project['category'] })}
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
                <Label>业务单元 *</Label>
                <Input
                  placeholder="输入业务单元"
                  value={newProject.businessUnit}
                  onChange={(e) => setNewProject({ ...newProject, businessUnit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>项目经理 *</Label>
                <Input
                  placeholder="输入项目经理"
                  value={newProject.projectManager}
                  onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>发起人</Label>
                <Input
                  placeholder="输入发起人"
                  value={newProject.sponsor}
                  onChange={(e) => setNewProject({ ...newProject, sponsor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>项目描述</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="详细描述项目目标..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>开始日期 *</Label>
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>预计完成日期 *</Label>
                <Input
                  type="date"
                  value={newProject.plannedEndDate}
                  onChange={(e) => setNewProject({ ...newProject, plannedEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>项目预算（元）</Label>
              <Input
                type="number"
                placeholder="输入项目预算"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProject(false)}>
              取消
            </Button>
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
