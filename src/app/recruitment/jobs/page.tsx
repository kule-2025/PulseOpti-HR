'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  experience: string;
  salary: {
    min: number;
    max: number;
  };
  status: 'active' | 'closed' | 'draft';
  vacancy: number;
  applicants: number;
  interviews: number;
  offers: number;
  hired: number;
  postedDate: string;
  deadline: string;
  skills: string[];
}

// 模拟职位数据
const JOBS_DATA: Job[] = [
  {
    id: '1',
    title: '高级前端工程师',
    department: '技术部',
    location: '北京',
    employmentType: 'full-time',
    experience: '3-5年',
    salary: { min: 25000, max: 35000 },
    status: 'active',
    vacancy: 2,
    applicants: 45,
    interviews: 8,
    offers: 2,
    hired: 1,
    postedDate: '2025-01-10',
    deadline: '2025-03-31',
    skills: ['React', 'TypeScript', 'Node.js', '前端架构'],
  },
  {
    id: '2',
    title: '销售经理',
    department: '销售部',
    location: '上海',
    employmentType: 'full-time',
    experience: '5-10年',
    salary: { min: 30000, max: 50000 },
    status: 'active',
    vacancy: 3,
    applicants: 32,
    interviews: 5,
    offers: 1,
    hired: 0,
    postedDate: '2025-01-08',
    deadline: '2025-02-28',
    skills: ['销售管理', 'B2B销售', '团队管理', '市场开拓'],
  },
  {
    id: '3',
    title: '产品经理',
    department: '产品部',
    location: '北京',
    employmentType: 'full-time',
    experience: '3-5年',
    salary: { min: 28000, max: 40000 },
    status: 'active',
    vacancy: 2,
    applicants: 38,
    interviews: 6,
    offers: 1,
    hired: 0,
    postedDate: '2025-01-05',
    deadline: '2025-03-15',
    skills: ['产品设计', '用户研究', '数据分析', '项目管理'],
  },
  {
    id: '4',
    title: '市场专员',
    department: '市场部',
    location: '广州',
    employmentType: 'full-time',
    experience: '1-3年',
    salary: { min: 12000, max: 18000 },
    status: 'active',
    vacancy: 5,
    applicants: 28,
    interviews: 3,
    offers: 0,
    hired: 0,
    postedDate: '2025-01-12',
    deadline: '2025-02-20',
    skills: ['数字营销', '社交媒体', '内容创作', 'SEO/SEM'],
  },
  {
    id: '5',
    title: 'UI设计师',
    department: '设计部',
    location: '北京',
    employmentType: 'full-time',
    experience: '2-4年',
    salary: { min: 18000, max: 25000 },
    status: 'closed',
    vacancy: 2,
    applicants: 52,
    interviews: 10,
    offers: 3,
    hired: 2,
    postedDate: '2024-12-01',
    deadline: '2025-01-15',
    skills: ['UI设计', 'Figma', '交互设计', '视觉设计'],
  },
  {
    id: '6',
    title: '实习生 - 前端开发',
    department: '技术部',
    location: '北京',
    employmentType: 'intern',
    experience: '应届生',
    salary: { min: 4000, max: 6000 },
    status: 'draft',
    vacancy: 10,
    applicants: 0,
    interviews: 0,
    offers: 0,
    hired: 0,
    postedDate: '-',
    deadline: '2025-03-31',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Vue'],
  },
];

const EMPLOYMENT_TYPE_CONFIG = {
  'full-time': {
    label: '全职',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  'part-time': {
    label: '兼职',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  contract: {
    label: '合同工',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
  intern: {
    label: '实习',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
};

const STATUS_CONFIG = {
  active: {
    label: '招聘中',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  closed: {
    label: '已关闭',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: XCircle,
  },
  draft: {
    label: '草稿',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: Clock,
  },
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤职位
  const filteredJobs = useMemo(() => {
    let jobs = JOBS_DATA;

    // 按部门过滤
    if (departmentFilter !== 'all') {
      jobs = jobs.filter(job => job.department === departmentFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      jobs = jobs.filter(job => job.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    return jobs;
  }, [searchQuery, departmentFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: JOBS_DATA.length,
      active: JOBS_DATA.filter(j => j.status === 'active').length,
      totalApplicants: JOBS_DATA.reduce((sum, j) => sum + j.applicants, 0),
      totalHired: JOBS_DATA.reduce((sum, j) => sum + j.hired, 0),
      avgSalary: JOBS_DATA.reduce((sum, j) => sum + j.salary.max, 0) / JOBS_DATA.length,
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(JOBS_DATA.map(job => job.department)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            岗位发布
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理招聘职位和招聘进度
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          发布新职位
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>职位总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-green-600" />
              招聘中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总投递数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalApplicants}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已入职</CardDescription>
            <CardTitle className="text-3xl">{stats.totalHired}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 职位列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>职位列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索职位、技能..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无职位
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有职位
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const typeConfig = EMPLOYMENT_TYPE_CONFIG[job.employmentType];
                const statusConfig = STATUS_CONFIG[job.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-sm">
                            <span>{job.department}</span>
                            <span>·</span>
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{job.location}</span>
                          </CardDescription>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant="outline">{job.experience}</Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          ¥{job.salary.min / 1000}-{job.salary.max / 1000}K
                        </Badge>
                      </div>

                      {/* 技能标签 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* 招聘进度 */}
                      <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {job.vacancy}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">招聘人数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{job.applicants}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">投递</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{job.interviews}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">面试</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{job.hired}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">已入职</div>
                        </div>
                      </div>

                      {/* 时间信息 */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>发布: {job.postedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>截止: {job.deadline}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          查看详情
                        </Button>
                        {job.status === 'active' && (
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                        )}
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
