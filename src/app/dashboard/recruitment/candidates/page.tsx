'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  FileText,
  Send,
  Star,
  Sparkles,
  MessageSquare,
  UserPlus,
  Download,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  experience: string;
  education: string;
  description: string;
  requirements: string[];
  status: 'draft' | 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  postedBy: string;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  position: string;
  department: string;
  experience: number;
  education: string;
  skills: string[];
  status: 'new' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected';
  stage: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';
  source: 'website' | 'referral' | 'linkedin' | 'other';
  expectedSalary: string;
  currentSalary?: string;
  location: string;
  availability: string;
  resumeUrl?: string;
  notes: string;
  appliedAt: string;
  updatedAt: string;
  interviews: {
    id: string;
    type: string;
    date: string;
    interviewer: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
}

export default function RecruitmentManagement() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Job['status']>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');

  const [viewJobDialogOpen, setViewJobDialogOpen] = useState(false);
  const [viewCandidateDialogOpen, setViewCandidateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setJobs([
        {
          id: '1',
          title: '高级前端工程师',
          department: '技术部',
          location: '北京',
          salaryRange: '25-40K',
          employmentType: 'full-time',
          experience: '3-5年',
          education: '本科及以上',
          description: '负责公司核心产品的前端开发和优化工作',
          requirements: ['熟悉React/Vue', '熟练TypeScript', '有大型项目经验'],
          status: 'active',
          applications: 45,
          views: 892,
          postedBy: '张三',
          postedAt: '2024-03-15',
          createdAt: '2024-03-15',
          updatedAt: '2024-04-10',
        },
        {
          id: '2',
          title: '产品经理',
          department: '产品部',
          location: '上海',
          salaryRange: '30-50K',
          employmentType: 'full-time',
          experience: '5-8年',
          education: '本科及以上',
          description: '负责产品规划和用户体验设计',
          requirements: ['有B端产品经验', '擅长需求分析', '良好的沟通能力'],
          status: 'active',
          applications: 28,
          views: 654,
          postedBy: '李四',
          postedAt: '2024-03-20',
          createdAt: '2024-03-20',
          updatedAt: '2024-04-08',
        },
        {
          id: '3',
          title: 'UI/UX设计师',
          department: '设计部',
          location: '深圳',
          salaryRange: '20-35K',
          employmentType: 'full-time',
          experience: '3-5年',
          education: '本科及以上',
          description: '负责产品界面设计和用户体验优化',
          requirements: ['精通Figma', '有移动端设计经验', '注重细节'],
          status: 'active',
          applications: 35,
          views: 543,
          postedBy: '王五',
          postedAt: '2024-04-01',
          createdAt: '2024-04-01',
          updatedAt: '2024-04-10',
        },
        {
          id: '4',
          title: '后端工程师',
          department: '技术部',
          location: '北京',
          salaryRange: '25-40K',
          employmentType: 'full-time',
          experience: '3-5年',
          education: '本科及以上',
          description: '负责后端服务开发和性能优化',
          requirements: ['熟悉Go/Java', '有微服务经验', '熟悉数据库优化'],
          status: 'paused',
          applications: 22,
          views: 321,
          postedBy: '张三',
          postedAt: '2024-02-28',
          createdAt: '2024-02-28',
          updatedAt: '2024-04-05',
        },
      ]);

      setCandidates([
        {
          id: '1',
          name: '刘明',
          email: 'liuming@example.com',
          phone: '13800138001',
          position: '高级前端工程师',
          department: '技术部',
          experience: 5,
          education: '本科',
          skills: ['React', 'TypeScript', 'Node.js', 'Webpack'],
          status: 'interview',
          stage: 'interview',
          source: 'website',
          expectedSalary: '30-35K',
          currentSalary: '25K',
          location: '北京',
          availability: '1个月内',
          notes: '技术能力强，有大厂背景',
          appliedAt: '2024-03-20',
          updatedAt: '2024-04-10',
          interviews: [
            { id: '1', type: '技术面试', date: '2024-04-15', interviewer: '张三', status: 'scheduled' },
          ],
        },
        {
          id: '2',
          name: '陈芳',
          email: 'chenfang@example.com',
          phone: '13900139002',
          position: '产品经理',
          department: '产品部',
          experience: 6,
          education: '硕士',
          skills: ['产品规划', '需求分析', '原型设计', '数据分析'],
          status: 'offer',
          stage: 'offer',
          source: 'linkedin',
          expectedSalary: '35-45K',
          currentSalary: '30K',
          location: '上海',
          availability: '2周内',
          notes: '沟通能力出色，有团队管理经验',
          appliedAt: '2024-03-18',
          updatedAt: '2024-04-12',
          interviews: [
            { id: '1', type: '初试', date: '2024-03-25', interviewer: '李四', status: 'completed' },
            { id: '2', type: '复试', date: '2024-03-28', interviewer: '王五', status: 'completed' },
          ],
        },
        {
          id: '3',
          name: '赵伟',
          email: 'zhaowei@example.com',
          phone: '13700137003',
          position: 'UI/UX设计师',
          department: '设计部',
          experience: 4,
          education: '本科',
          skills: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop'],
          status: 'reviewing',
          stage: 'screening',
          source: 'website',
          expectedSalary: '25-30K',
          location: '深圳',
          availability: '随时',
          notes: '作品集优秀，风格符合公司要求',
          appliedAt: '2024-04-05',
          updatedAt: '2024-04-08',
          interviews: [],
        },
        {
          id: '4',
          name: '孙丽',
          email: 'sunli@example.com',
          phone: '13600136004',
          position: '后端工程师',
          department: '技术部',
          experience: 4,
          education: '本科',
          skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
          status: 'new',
          stage: 'applied',
          source: 'referral',
          expectedSalary: '25-30K',
          location: '北京',
          availability: '1个月内',
          notes: '员工推荐，技术基础扎实',
          appliedAt: '2024-04-10',
          updatedAt: '2024-04-10',
          interviews: [],
        },
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const departments = useMemo(() => {
    return Array.from(new Set(jobs.map((j) => j.department)));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [jobs, searchTerm, statusFilter, departmentFilter]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [candidates, searchTerm]);

  const stats = useMemo(() => {
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === 'active').length,
      totalCandidates: candidates.length,
      hiredCandidates: candidates.filter((c) => c.status === 'hired').length,
      offerCandidates: candidates.filter((c) => c.status === 'offer').length,
      interviewCandidates: candidates.filter((c) => c.status === 'interview').length,
      totalApplications: jobs.reduce((sum, job) => sum + job.applications, 0),
      avgInterviewRate: candidates.length > 0
        ? ((candidates.filter((c) => c.status === 'interview').length / candidates.length) * 100).toFixed(1)
        : '0',
    };
  }, [jobs, candidates]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      interview: 'bg-orange-100 text-orange-800',
      offer: 'bg-teal-100 text-teal-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      active: '招聘中',
      paused: '已暂停',
      closed: '已关闭',
      new: '新简历',
      reviewing: '筛选中',
      interview: '面试中',
      offer: '已发Offer',
      hired: '已录用',
      rejected: '已拒绝',
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const getEmploymentTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      'full-time': '全职',
      'part-time': '兼职',
      'contract': '合同工',
      'intern': '实习生',
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">招聘管理</h1>
          <p className="text-muted-foreground mt-1">发布职位、管理候选人、跟踪招聘进度</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            招聘分析
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            发布职位
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在招职位</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              总计 {stats.totalJobs} 个职位
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">候选人总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已录用 {stats.hiredCandidates} 人
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待面试</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.interviewCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已发Offer {stats.offerCandidates} 人
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总申请数</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              面试率 {stats.avgInterviewRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'jobs' | 'candidates')}>
        <TabsList>
          <TabsTrigger value="jobs">
            <Briefcase className="h-4 w-4 mr-2" />
            职位管理 ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-2" />
            候选人 ({candidates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>职位列表 ({filteredJobs.length})</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索职位、部门、地点..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="部门" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部部门</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">招聘中</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                      <SelectItem value="closed">已关闭</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  没有找到匹配的职位
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            {getStatusBadge(job.status)}
                            {getEmploymentTypeBadge(job.employmentType)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryRange}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              {job.education}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.experience}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>部门: {job.department}</span>
                            <span>申请数: <span className="font-semibold text-foreground">{job.applications}</span></span>
                            <span>浏览量: {job.views}</span>
                            <span>发布于: {job.postedAt}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedJob(job); setViewJobDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              编辑职位
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              分享职位
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              查看候选人 ({job.applications})
                            </DropdownMenuItem>
                            {job.status === 'active' && (
                              <DropdownMenuItem>
                                <Clock className="h-4 w-4 mr-2" />
                                暂停招聘
                              </DropdownMenuItem>
                            )}
                            {job.status === 'paused' && (
                              <DropdownMenuItem>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                恢复招聘
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>候选人列表 ({filteredCandidates.length})</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索姓名、职位、邮箱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="阶段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部阶段</SelectItem>
                      <SelectItem value="applied">已投递</SelectItem>
                      <SelectItem value="screening">筛选中</SelectItem>
                      <SelectItem value="interview">面试中</SelectItem>
                      <SelectItem value="offer">已发Offer</SelectItem>
                      <SelectItem value="hired">已录用</SelectItem>
                      <SelectItem value="rejected">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部来源</SelectItem>
                      <SelectItem value="website">官网</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="referral">内推</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  没有找到匹配的候选人
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{candidate.name}</h3>
                              {getStatusBadge(candidate.status)}
                            </div>
                            <p className="text-sm font-medium mb-1">{candidate.position} · {candidate.department}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                              <span>{candidate.email}</span>
                              <span>{candidate.phone}</span>
                              <span>{candidate.location}</span>
                              <span>{candidate.education}</span>
                              <span>{candidate.experience}年经验</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {candidate.skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.skills.length - 4}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>期望薪资: <span className="font-semibold text-foreground">{candidate.expectedSalary}</span></span>
                              <span>来源: {candidate.source}</span>
                              <span>申请时间: {candidate.appliedAt}</span>
                              {candidate.interviews.length > 0 && (
                                <span>面试安排: {candidate.interviews.length} 次</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedCandidate(candidate); setViewCandidateDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              发送消息
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              安排面试
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              查看简历
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              发送Offer
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              拒绝候选人
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewJobDialogOpen} onOpenChange={setViewJobDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>职位详情</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedJob.title}</h3>
                    <div className="flex flex-wrap gap-3">
                      {getStatusBadge(selectedJob.status)}
                      {getEmploymentTypeBadge(selectedJob.employmentType)}
                    </div>
                  </div>
                  <Button>
                    <Star className="h-4 w-4 mr-2" />
                    收藏职位
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>部门</Label>
                    <p className="text-sm">{selectedJob.department}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>工作地点</Label>
                    <p className="text-sm">{selectedJob.location}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>薪资范围</Label>
                    <p className="text-sm font-semibold text-green-600">{selectedJob.salaryRange}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>工作经验</Label>
                    <p className="text-sm">{selectedJob.experience}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>学历要求</Label>
                    <p className="text-sm">{selectedJob.education}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>职位类型</Label>
                    <p className="text-sm">{getEmploymentTypeBadge(selectedJob.employmentType)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>职位描述</Label>
                  <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                </div>

                <div className="space-y-2">
                  <Label>任职要求</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedJob.applications}</p>
                    <p className="text-xs text-muted-foreground">申请人数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedJob.views}</p>
                    <p className="text-xs text-muted-foreground">浏览量</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {((selectedJob.applications / selectedJob.views) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">申请率</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>发布人: {selectedJob.postedBy}</p>
                  <p>发布时间: {selectedJob.postedAt}</p>
                  <p>更新时间: {selectedJob.updatedAt}</p>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewJobDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Edit3 className="h-4 w-4 mr-2" />
              编辑职位
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewCandidateDialogOpen} onOpenChange={setViewCandidateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>候选人详情</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-2xl">{selectedCandidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{selectedCandidate.name}</h3>
                      <p className="text-muted-foreground">{selectedCandidate.position} · {selectedCandidate.department}</p>
                      {getStatusBadge(selectedCandidate.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      发送消息
                    </Button>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      安排面试
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">基本信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">邮箱</p>
                        <p>{selectedCandidate.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">手机</p>
                        <p>{selectedCandidate.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">所在地</p>
                        <p>{selectedCandidate.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">到岗时间</p>
                        <p>{selectedCandidate.availability}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">工作经验</p>
                        <p>{selectedCandidate.experience} 年</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">学历</p>
                        <p>{selectedCandidate.education}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">薪资信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">期望薪资</p>
                        <p className="font-semibold text-green-600">{selectedCandidate.expectedSalary}</p>
                      </div>
                      {selectedCandidate.currentSalary && (
                        <div>
                          <p className="text-muted-foreground">当前薪资</p>
                          <p>{selectedCandidate.currentSalary}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">来源</p>
                        <p>{selectedCandidate.source}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">申请时间</p>
                        <p>{selectedCandidate.appliedAt}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">更新时间</p>
                        <p>{selectedCandidate.updatedAt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">技能标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedCandidate.interviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">面试记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCandidate.interviews.map((interview) => (
                          <div key={interview.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{interview.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  面试官: {interviewer}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{interview.date}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    interview.status === 'completed'
                                      ? 'border-green-500 text-green-500'
                                      : interview.status === 'scheduled'
                                      ? 'border-blue-500 text-blue-500'
                                      : 'border-red-500 text-red-500'
                                  }
                                >
                                  {interview.status === 'completed'
                                    ? '已完成'
                                    : interview.status === 'scheduled'
                                    ? '已安排'
                                    : '已取消'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">备注</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedCandidate.notes}</p>
                  </CardContent>
                </Card>

                {selectedCandidate.resumeUrl && (
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      查看简历
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      下载简历
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCandidateDialogOpen(false)}>
              关闭
            </Button>
            <Button variant="outline" className="text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              拒绝候选人
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              发送Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
