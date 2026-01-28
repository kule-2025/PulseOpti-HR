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
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  Sparkles,
} from 'lucide-react';

interface Resume {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  education: string;
  skills: string[];
  status: 'new' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  jobTitle: string;
  department: string;
  source: 'job-board' | 'referral' | 'headhunter' | 'social';
  appliedDate: string;
  lastUpdate: string;
  aiScore?: number;
  matchRate?: number;
  notes: number;
}

// 模拟简历数据
const RESUMES_DATA: Resume[] = [
  {
    id: '1',
    name: '李四',
    email: 'lisi@example.com',
    phone: '138****5678',
    location: '北京',
    position: '高级前端工程师',
    experience: '4年',
    education: '本科 - 计算机科学与技术',
    skills: ['React', 'TypeScript', 'Node.js', 'Vue', '前端架构'],
    status: 'interview',
    jobId: 'job-1',
    jobTitle: '高级前端工程师',
    department: '技术部',
    source: 'job-board',
    appliedDate: '2025-01-10',
    lastUpdate: '2025-01-15',
    aiScore: 92,
    matchRate: 95,
    notes: 3,
  },
  {
    id: '2',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '139****8765',
    location: '上海',
    position: '销售经理',
    experience: '8年',
    education: 'MBA - 市场营销',
    skills: ['销售管理', 'B2B销售', '团队管理', '大客户开发', 'CRM'],
    status: 'offer',
    jobId: 'job-2',
    jobTitle: '销售经理',
    department: '销售部',
    source: 'referral',
    appliedDate: '2025-01-05',
    lastUpdate: '2025-01-16',
    aiScore: 88,
    matchRate: 90,
    notes: 5,
  },
  {
    id: '3',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '137****4321',
    location: '北京',
    position: '产品经理',
    experience: '3年',
    education: '硕士 - 产品设计',
    skills: ['产品设计', '用户研究', '数据分析', '项目管理', 'Axure'],
    status: 'reviewing',
    jobId: 'job-3',
    jobTitle: '产品经理',
    department: '产品部',
    source: 'job-board',
    appliedDate: '2025-01-12',
    lastUpdate: '2025-01-14',
    aiScore: 85,
    matchRate: 88,
    notes: 2,
  },
  {
    id: '4',
    name: '孙七',
    email: 'sunqi@example.com',
    phone: '136****9876',
    location: '广州',
    position: '市场专员',
    experience: '2年',
    education: '本科 - 市场营销',
    skills: ['数字营销', '社交媒体', '内容创作', 'SEO/SEM', '数据分析'],
    status: 'new',
    jobId: 'job-4',
    jobTitle: '市场专员',
    department: '市场部',
    source: 'social',
    appliedDate: '2025-01-15',
    lastUpdate: '2025-01-15',
    aiScore: 80,
    matchRate: 85,
    notes: 0,
  },
  {
    id: '5',
    name: '周八',
    email: 'zhouba@example.com',
    phone: '135****6543',
    location: '北京',
    position: '高级前端工程师',
    experience: '5年',
    education: '本科 - 软件工程',
    skills: ['React', 'Vue', 'TypeScript', 'Node.js', '微前端', '性能优化'],
    status: 'hired',
    jobId: 'job-1',
    jobTitle: '高级前端工程师',
    department: '技术部',
    source: 'headhunter',
    appliedDate: '2025-01-02',
    lastUpdate: '2025-01-17',
    aiScore: 95,
    matchRate: 98,
    notes: 8,
  },
  {
    id: '6',
    name: '吴九',
    email: 'wujiu@example.com',
    phone: '134****3210',
    location: '深圳',
    position: '产品经理',
    experience: '2年',
    education: '本科 - 工商管理',
    skills: ['产品设计', '需求分析', '竞品分析'],
    status: 'rejected',
    jobId: 'job-3',
    jobTitle: '产品经理',
    department: '产品部',
    source: 'job-board',
    appliedDate: '2025-01-08',
    lastUpdate: '2025-01-13',
    aiScore: 72,
    matchRate: 75,
    notes: 4,
  },
];

const STATUS_CONFIG = {
  new: {
    label: '新简历',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    icon: Clock,
  },
  reviewing: {
    label: '简历筛选',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: Eye,
  },
  interview: {
    label: '面试中',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    icon: User,
  },
  offer: {
    label: '已发Offer',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  hired: {
    label: '已入职',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  rejected: {
    label: '已淘汰',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    icon: XCircle,
  },
};

const SOURCE_CONFIG = {
  'job-board': { label: '招聘网站' },
  referral: { label: '内部推荐' },
  headhunter: { label: '猎头' },
  social: { label: '社交媒体' },
};

export default function ResumesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // 过滤简历
  const filteredResumes = useMemo(() => {
    let resumes = RESUMES_DATA;

    // 按状态过滤
    if (statusFilter !== 'all') {
      resumes = resumes.filter(r => r.status === statusFilter);
    }

    // 按部门过滤
    if (departmentFilter !== 'all') {
      resumes = resumes.filter(r => r.department === departmentFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      resumes = resumes.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.position.toLowerCase().includes(query) ||
        r.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    return resumes;
  }, [searchQuery, statusFilter, departmentFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: RESUMES_DATA.length,
      new: RESUMES_DATA.filter(r => r.status === 'new').length,
      interviewing: RESUMES_DATA.filter(r => r.status === 'interview').length,
      hired: RESUMES_DATA.filter(r => r.status === 'hired').length,
      avgMatchRate: RESUMES_DATA.filter(r => r.matchRate !== undefined)
        .reduce((sum, r) => sum + (r.matchRate || 0), 0) / RESUMES_DATA.filter(r => r.matchRate !== undefined).length || 0,
    };
  }, []);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(RESUMES_DATA.map(resume => resume.department)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            简历管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI智能筛选和管理候选人简历
          </p>
        </div>
        <Button variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          AI批量分析
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>简历总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              待处理
            </CardDescription>
            <CardTitle className="text-3xl">{stats.new + stats.interviewing}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均匹配度</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              {stats.avgMatchRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              已入职
            </CardDescription>
            <CardTitle className="text-3xl">{stats.hired}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 简历列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>简历列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索姓名、邮箱、技能..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

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

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-36">
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
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredResumes.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无简历
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有简历
                </p>
              </div>
            ) : (
              filteredResumes.map((resume) => {
                const statusConfig = STATUS_CONFIG[resume.status];
                const sourceConfig = SOURCE_CONFIG[resume.source];

                return (
                  <Card key={resume.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 候选人信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {resume.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {resume.name}
                              </h3>
                              <Badge variant="outline" className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                              {resume.aiScore && resume.aiScore >= 90 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI高分
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span>{resume.position}</span>
                              <span>·</span>
                              <span>{resume.experience}</span>
                              <span>·</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{resume.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* 职位信息 */}
                        <div className="w-48 shrink-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            应聘职位
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {resume.jobTitle}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {resume.department}
                          </div>
                        </div>

                        {/* AI评分和匹配度 */}
                        <div className="w-40 shrink-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            AI评分
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            {resume.aiScore || '-'}
                          </div>
                          {resume.matchRate && (
                            <>
                              <div className="space-y-1 mt-1">
                                <div className="flex justify-between text-xs">
                                  <span>匹配度</span>
                                  <span>{resume.matchRate}%</span>
                                </div>
                                <Progress value={resume.matchRate} className="h-1.5" />
                              </div>
                            </>
                          )}
                        </div>

                        {/* 技能标签 */}
                        <div className="flex-1 min-w-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            核心技能
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {resume.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 时间和来源 */}
                        <div className="w-36 shrink-0 px-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="truncate">{resume.appliedDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">{sourceConfig.label}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看详情
                          </Button>
                          {resume.status === 'new' && (
                            <Button size="sm">
                              开始筛选
                            </Button>
                          )}
                          {resume.status === 'interview' && (
                            <Button size="sm">
                              安排面试
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
        </CardContent>
      </Card>
    </div>
  );
}
